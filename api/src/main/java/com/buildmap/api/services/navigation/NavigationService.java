package com.buildmap.api.services.navigation;

import com.buildmap.api.dto.route.RouteDto;
import com.buildmap.api.dto.route.RouteRequestDto;
import com.buildmap.api.dto.route.RouteStepDto;
import com.buildmap.api.dto.route.RouteStepType;
import com.buildmap.api.dto.route.mappers.RouteMapper;
import com.buildmap.api.entities.mapping_area.fulcrum.Fulcrum;
import com.buildmap.api.entities.mapping_area.fulcrum.FacingDirection;
import com.buildmap.api.entities.mapping_area.fulcrum.FulcrumType;
import com.buildmap.api.services.FloorService;
import com.buildmap.api.services.FulcrumService;
import com.buildmap.api.services.navigation.dijkstra_algorithm.DijkstraAlgorithm;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NavigationService {

    private final FloorService floorService;
    private final FulcrumService fulcrumService;
    private final RouteMapper routeMapper;
    private final DijkstraAlgorithm dijkstraAlgorithm;
    private static final double LANDMARK_RADIUS = 0.1;

    @Transactional(readOnly = true)
    public RouteDto findShortestPath(RouteRequestDto request) {
        // 1. Получаем стартовую и конечную точки для определения зоны
        Fulcrum startFulcrum = fulcrumService.getById(request.getStartFulcrumId());
        Fulcrum endFulcrum = fulcrumService.getById(request.getEndFulcrumId());

        // Проверяем, что точки принадлежат одной зоне
        Long startAreaId = startFulcrum.getFloor().getMappingArea().getId();
        Long endAreaId = endFulcrum.getFloor().getMappingArea().getId();

        if (!startAreaId.equals(endAreaId)) {
            throw new IllegalArgumentException("Start and end fulcrums must be in the same mapping area");
        }

        Long areaId = startAreaId;

        System.out.println("=== ВЫЧИСЛЕНИЕ МАРШРУТА ===");
        System.out.println("Area: " + areaId + ", From: " + request.getStartFulcrumId() +
                " (" + startFulcrum.getName() + ") To: " + request.getEndFulcrumId() +
                " (" + endFulcrum.getName() + ")");

        // 2. Получаем все этажи зоны
        List<com.buildmap.api.entities.mapping_area.Floor> floors =
                floorService.getAllByMappingAreaId(areaId, false);

        // 3. Получаем ВСЕ точки ВСЕХ этажей
        List<Fulcrum> allFulcrums = floors.stream()
                .flatMap(floor -> floor.getFulcrums().stream())
                .filter(fulcrum -> !fulcrum.isDeleted())
                .collect(Collectors.toList());

        System.out.println("Найдено точек во всех этажах: " + allFulcrums.size());

        // 4. Строим граф
        Graph graph = new Graph(allFulcrums);
        System.out.println("Граф построен, узлов: " + graph.getNodes().size());

        // 5. Валидируем запрос
        NavigationValidator.validateRequest(graph, request.getStartFulcrumId(), request.getEndFulcrumId());

        // 6. Запускаем алгоритм
        long startTime = System.currentTimeMillis();
        DijkstraAlgorithm.DijkstraResult result = dijkstraAlgorithm.findShortestPath(
                graph, request.getStartFulcrumId(), request.getEndFulcrumId()
        );
        long endTime = System.currentTimeMillis();
        System.out.println("Алгоритм выполнен за " + (endTime - startTime) + "ms");

        // 7. Строим путь
        List<Fulcrum> path = PathBuilder.buildPath(result.previous(), graph, request.getEndFulcrumId());
        System.out.println("Построен путь из " + path.size() + " точек");

        // 8. Проверяем что путь найден
        if (!PathBuilder.isPathFound(path, request.getStartFulcrumId(), request.getEndFulcrumId())) {
            throw new IllegalArgumentException("No path found between the specified fulcrums");
        }

        // 9. Преобразуем в DTO
        RouteDto routeDto = routeMapper.toRouteDto(
                path,
                result.distances().get(request.getEndFulcrumId()),
                request.getStartFulcrumId(),
                request.getEndFulcrumId()
        );
        routeDto.setSteps(buildSteps(graph, path));

        // 10. Логируем результат
        System.out.println("Маршрут готов, расстояние: " + routeDto.getTotalDistance());
        System.out.println("Путь через этажи:");
        path.forEach(fulcrum ->
                System.out.println("  - " + fulcrum.getName() +
                        " (Этаж " + fulcrum.getFloor().getLevel() +
                        ": " + fulcrum.getFloor().getName() + ")")
        );

        return routeDto;
    }

    private List<RouteStepDto> buildSteps(Graph graph, List<Fulcrum> path) {
        List<RouteStepDto> steps = new ArrayList<>();
        if (path == null || path.size() < 2) {
            return steps;
        }

        Vector previousVector = null;
        boolean previousWasFloorChange = false;

        for (int i = 0; i < path.size() - 1; i += 1) {
            Fulcrum from = path.get(i);
            Fulcrum to = path.get(i + 1);

            boolean floorChanged = from.getFloor() != null && to.getFloor() != null
                    && !from.getFloor().getId().equals(to.getFloor().getId());

            if (floorChanged) {
                steps.add(buildFloorChangeStep(from, to, graph));
                previousVector = null;
                previousWasFloorChange = true;
                continue;
            }

            Vector segmentVector = vectorBetween(from, to);
            if (segmentVector.isZero()) {
                previousVector = null;
                previousWasFloorChange = false;
                continue;
            }

            Vector baseVector = previousVector;
            if (i == 0 || previousWasFloorChange || baseVector == null) {
                baseVector = facingToVector(from.getFacingDirection());
            }

            RouteStepDto turnStep = buildTurnStep(baseVector, segmentVector, from, to, graph);
            if (turnStep != null) {
                steps.add(turnStep);
            }

            Integer distance = estimateDistance(graph, from, to);
            if (distance != null && distance > 0) {
                appendForwardStep(steps, distance, from, to);
            }

            previousVector = segmentVector;
            previousWasFloorChange = false;
        }

        return steps;
    }

    private RouteStepDto buildFloorChangeStep(Fulcrum from, Fulcrum to, Graph graph) {
        Integer fromLevel = from.getFloor() != null ? from.getFloor().getLevel() : null;
        Integer toLevel = to.getFloor() != null ? to.getFloor().getLevel() : null;
        String targetLabel;
        if (toLevel != null) {
            targetLabel = "этаж " + toLevel;
        } else if (to.getFloor() != null && to.getFloor().getName() != null) {
            targetLabel = to.getFloor().getName();
        } else {
            targetLabel = "другой этаж";
        }

        boolean goUp = false;
        if (fromLevel != null && toLevel != null) {
            goUp = toLevel > fromLevel;
        }

        String text = (goUp ? "Поднимитесь на " : "Спуститесь на ") + targetLabel;
        RouteStepDto step = new RouteStepDto();
        step.setType(goUp ? RouteStepType.CHANGE_FLOOR_UP : RouteStepType.CHANGE_FLOOR_DOWN);
        step.setText(text);
        step.setFromFulcrumId(from.getId());
        step.setToFulcrumId(to.getId());
        step.setFloorId(to.getFloor() != null ? to.getFloor().getId() : null);
        String landmark = buildLandmarkHint(to, facingToVector(to.getFacingDirection()), graph, true);
        if (landmark != null) {
            step.setText(text + ". " + landmark);
        }
        return step;
    }

    private RouteStepDto buildTurnStep(Vector baseVector, Vector nextVector, Fulcrum from, Fulcrum to, Graph graph) {
        if (baseVector == null || baseVector.isZero() || nextVector == null || nextVector.isZero()) {
            return null;
        }

        double angle = angleBetween(baseVector, nextVector);
        if (angle <= 20.0) {
            return null;
        }

        if (angle >= 135.0) {
            RouteStepDto step = buildStep(RouteStepType.U_TURN, "Развернитесь", from, to);
            appendLandmark(step, from, nextVector, graph, true);
            return step;
        }

        double cross = cross(baseVector, nextVector);
        if (cross > 0) {
            RouteStepDto step = buildStep(RouteStepType.TURN_RIGHT, "Поверните направо", from, to);
            appendLandmark(step, from, nextVector, graph, true);
            return step;
        }
        if (cross < 0) {
            RouteStepDto step = buildStep(RouteStepType.TURN_LEFT, "Поверните налево", from, to);
            appendLandmark(step, from, nextVector, graph, true);
            return step;
        }
        return null;
    }

    private void appendForwardStep(List<RouteStepDto> steps, int distance, Fulcrum from, Fulcrum to) {
        if (steps == null || distance <= 0) {
            return;
        }
        int lastIndex = steps.size() - 1;
        if (lastIndex >= 0) {
            RouteStepDto last = steps.get(lastIndex);
            if (last.getType() == RouteStepType.GO_FORWARD) {
                int previous = parseForwardDistance(last.getText());
                int sum = previous + distance;
                last.setText("Пройдите " + sum);
                if (to != null) {
                    last.setToFulcrumId(to.getId());
                    last.setFloorId(to.getFloor() != null ? to.getFloor().getId() : last.getFloorId());
                }
                return;
            }
        }
        RouteStepDto step = new RouteStepDto();
        step.setType(RouteStepType.GO_FORWARD);
        step.setText("Пройдите " + distance);
        step.setFromFulcrumId(from != null ? from.getId() : null);
        step.setToFulcrumId(to != null ? to.getId() : null);
        step.setFloorId(from != null && from.getFloor() != null ? from.getFloor().getId() : null);
        steps.add(step);
    }

    private int parseForwardDistance(String text) {
        if (text == null) return 0;
        String normalized = text.replaceAll("[^0-9]", "");
        if (normalized.isEmpty()) return 0;
        try {
            return Integer.parseInt(normalized);
        } catch (NumberFormatException e) {
            return 0;
        }
    }

    private void appendLandmark(RouteStepDto step, Fulcrum pivot, Vector facing, Graph graph, boolean excludeVerticals) {
        if (step == null) return;
        String landmark = buildLandmarkHint(pivot, facing, graph, excludeVerticals);
        if (landmark != null) {
            step.setText(step.getText() + ". " + landmark);
        }
    }

    private String buildLandmarkHint(Fulcrum pivot, Vector facing, Graph graph, boolean excludeVerticals) {
        if (pivot == null || facing == null || facing.isZero() || graph == null) return null;
        if (pivot.getFloor() == null) return null;

        Fulcrum best = null;
        double bestDist = Double.MAX_VALUE;

        for (Fulcrum candidate : graph.getNodes().values()) {
            if (candidate == null || candidate.getId() == null) continue;
            if (candidate.getId().equals(pivot.getId())) continue;
            if (candidate.getFloor() == null || pivot.getFloor() == null) continue;
            if (!candidate.getFloor().getId().equals(pivot.getFloor().getId())) continue;
            if (candidate.getType() == null || candidate.getType() == FulcrumType.CORRIDOR) continue;
            if (excludeVerticals && (candidate.getType() == FulcrumType.STAIRS || candidate.getType() == FulcrumType.ELEVATOR)) {
                continue;
            }
            String name = candidate.getName();
            if (name == null || name.isBlank()) continue;
            if (candidate.getX() == null || candidate.getY() == null || pivot.getX() == null || pivot.getY() == null) continue;

            double dx = candidate.getX() - pivot.getX();
            double dy = candidate.getY() - pivot.getY();
            double dist = Math.hypot(dx, dy);
            if (dist > LANDMARK_RADIUS) continue;
            double dot = facing.x * dx + facing.y * dy;
            if (dot <= 0) continue;
            if (dist < bestDist) {
                bestDist = dist;
                best = candidate;
            }
        }

        if (best == null) return null;

        Vector toCandidate = new Vector(best.getX() - pivot.getX(), best.getY() - pivot.getY());
        double cross = cross(facing, toCandidate);
        String side;
        if (Math.abs(cross) < 1e-6) {
            side = "Рядом";
        } else if (cross > 0) {
            side = "Справа";
        } else {
            side = "Слева";
        }
        return side + " будет " + best.getName();
    }

    private RouteStepDto buildStep(RouteStepType type, String text, Fulcrum from, Fulcrum to) {
        RouteStepDto step = new RouteStepDto();
        step.setType(type);
        step.setText(text);
        step.setFromFulcrumId(from != null ? from.getId() : null);
        step.setToFulcrumId(to != null ? to.getId() : null);
        step.setFloorId(from != null && from.getFloor() != null ? from.getFloor().getId() : null);
        return step;
    }

    private Integer estimateDistance(Graph graph, Fulcrum from, Fulcrum to) {
        if (graph == null || from == null || to == null) {
            return null;
        }
        List<Graph.Edge> edges = graph.getEdges(from.getId());
        if (edges != null) {
            for (Graph.Edge edge : edges) {
                if (edge.targetId().equals(to.getId())) {
                    if (edge.weight() == null) {
                        return null;
                    }
                    return (int) Math.round(edge.weight());
                }
            }
        }
        double dx = to.getX() - from.getX();
        double dy = to.getY() - from.getY();
        double distance = Math.hypot(dx, dy);
        return (int) Math.round(distance);
    }

    private Vector vectorBetween(Fulcrum from, Fulcrum to) {
        if (from == null || to == null || from.getX() == null || from.getY() == null
                || to.getX() == null || to.getY() == null) {
            return new Vector(0, 0);
        }
        return new Vector(to.getX() - from.getX(), to.getY() - from.getY());
    }

    private Vector facingToVector(FacingDirection direction) {
        if (direction == null) {
            return null;
        }
        return switch (direction) {
            case UP -> new Vector(0, -1);
            case RIGHT -> new Vector(1, 0);
            case DOWN -> new Vector(0, 1);
            case LEFT -> new Vector(-1, 0);
        };
    }

    private double angleBetween(Vector a, Vector b) {
        double dot = dot(a, b);
        double len = a.length() * b.length();
        if (len == 0) return 0;
        double cos = Math.max(-1.0, Math.min(1.0, dot / len));
        return Math.toDegrees(Math.acos(cos));
    }

    private double dot(Vector a, Vector b) {
        return a.x * b.x + a.y * b.y;
    }

    private double cross(Vector a, Vector b) {
        return a.x * b.y - a.y * b.x;
    }

    private static class Vector {
        private final double x;
        private final double y;

        private Vector(double x, double y) {
            this.x = x;
            this.y = y;
        }

        private double length() {
            return Math.hypot(x, y);
        }

        private boolean isZero() {
            return Math.abs(x) < 1e-9 && Math.abs(y) < 1e-9;
        }
    }

    // Вспомогательный метод для отладки
    public void testGraphBuilding(Long areaId) {
        List<com.buildmap.api.entities.mapping_area.Floor> floors =
                floorService.getAllByMappingAreaId(areaId, false);

        List<Fulcrum> allFulcrums = floors.stream()
                .flatMap(floor -> floor.getFulcrums().stream())
                .filter(fulcrum -> !fulcrum.isDeleted())
                .collect(Collectors.toList());

        Graph graph = new Graph(allFulcrums);

        System.out.println("=== ТЕСТ ПОСТРОЕНИЯ ГРАФА ===");
        System.out.println("Этажей: " + floors.size());
        System.out.println("Точек: " + allFulcrums.size());
        System.out.println("Узлов в графе: " + graph.getNodes().size());

        // Выводим информацию о связях
        graph.getNodes().values().forEach(fulcrum -> {
            List<Graph.Edge> edges = graph.getEdges(fulcrum.getId());
            if (!edges.isEmpty()) {
                System.out.println(fulcrum.getName() + " (" + fulcrum.getFloor().getName() +
                        ") -> " + edges.size() + " связей");
            }
        });
    }
}
