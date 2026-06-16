package com.buildmap.api.services.navigation;

import com.buildmap.api.dto.route.RouteDto;
import com.buildmap.api.dto.route.RouteRequestDto;
import com.buildmap.api.dto.route.RouteStepDto;
import com.buildmap.api.dto.route.RouteStepType;
import com.buildmap.api.dto.route.mappers.RouteMapper;
import com.buildmap.api.entities.mapping_area.fulcrum.FacingDirection;
import com.buildmap.api.entities.mapping_area.fulcrum.Fulcrum;
import com.buildmap.api.entities.mapping_area.fulcrum.FulcrumType;
import com.buildmap.api.services.FloorService;
import com.buildmap.api.services.FulcrumService;
import com.buildmap.api.services.navigation.dijkstra_algorithm.DijkstraAlgorithm;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
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
        Fulcrum startFulcrum = fulcrumService.getById(request.getStartFulcrumId());
        Fulcrum endFulcrum = fulcrumService.getById(request.getEndFulcrumId());

        Long startAreaId = startFulcrum.getFloor().getMappingArea().getId();
        Long endAreaId = endFulcrum.getFloor().getMappingArea().getId();
        if (!startAreaId.equals(endAreaId)) {
            throw new IllegalArgumentException("Start and end fulcrums must be in the same mapping area");
        }

        List<com.buildmap.api.entities.mapping_area.Floor> floors =
                floorService.getAllByMappingAreaId(startAreaId, false);

        List<Fulcrum> allFulcrums = floors.stream()
                .flatMap(floor -> floor.getFulcrums().stream())
                .filter(fulcrum -> !fulcrum.isDeleted())
                .collect(Collectors.toList());

        Graph graph = new Graph(allFulcrums);
        NavigationValidator.validateRequest(graph, request.getStartFulcrumId(), request.getEndFulcrumId());

        DijkstraAlgorithm.DijkstraResult result = dijkstraAlgorithm.findShortestPath(
                graph,
                request.getStartFulcrumId(),
                request.getEndFulcrumId()
        );

        List<Fulcrum> path = PathBuilder.buildPath(result.previous(), graph, request.getEndFulcrumId());
        if (!PathBuilder.isPathFound(path, request.getStartFulcrumId(), request.getEndFulcrumId())) {
            throw new IllegalArgumentException("No path found between the specified fulcrums");
        }

        RouteDto routeDto = routeMapper.toRouteDto(
                path,
                request.getStartFulcrumId(),
                request.getEndFulcrumId()
        );
        routeDto.setTotalCost(result.distances().get(request.getEndFulcrumId()));
        routeDto.setTotalDistanceMeters(calculateTotalDistanceMeters(graph, path));
        routeDto.setSteps(buildSteps(graph, path));

        return routeDto;
    }

    private List<RouteStepDto> buildSteps(Graph graph, List<Fulcrum> path) {
        List<RouteStepDto> steps = new ArrayList<>();
        if (path == null || path.size() < 2) {
            return steps;
        }

        // The destination is the goal, not a passing landmark, so it is excluded from
        // mid-route hints and announced once at the end as an arrival step instead.
        Fulcrum destination = path.get(path.size() - 1);
        Long destinationId = destination != null ? destination.getId() : null;

        Vector previousVector = null;
        boolean previousWasFloorChange = false;

        // The movement step currently accumulating distance, kept alongside the pieces
        // needed to regenerate its text as more straight segments are appended.
        Movement movement = null;

        for (int i = 0; i < path.size() - 1; i += 1) {
            Fulcrum from = path.get(i);
            Fulcrum to = path.get(i + 1);

            boolean floorChanged = from.getFloor() != null && to.getFloor() != null
                    && !from.getFloor().getId().equals(to.getFloor().getId());

            if (floorChanged) {
                steps.add(buildFloorChangeStep(from, to, graph, destinationId));
                previousVector = null;
                previousWasFloorChange = true;
                movement = null;
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

            RouteStepType turnType = detectTurnType(baseVector, segmentVector);
            Double distanceMeters = estimateDistanceMeters(graph, from, to);
            double segmentMeters = (distanceMeters != null && distanceMeters > 0)
                    ? roundMeters(distanceMeters) : 0;

            if (turnType != null) {
                String landmark = buildLandmarkHint(from, segmentVector, graph, true, destinationId);
                if (landmark != null) {
                    // A turn that reveals a landmark stays its own step so the hint is not
                    // pushed past the distance: "Поверните направо. Слева будет уборная".
                    Movement turn = new Movement(turnType, turnPhrase(turnType), landmark);
                    turn.step.setFromFulcrumId(from.getId());
                    turn.step.setFloorId(from.getFloor() != null ? from.getFloor().getId() : null);
                    applyMovement(turn, 0, to);
                    steps.add(turn.step);

                    // The segment distance starts a fresh movement, like a plain walk.
                    movement = null;
                    if (segmentMeters > 0) {
                        movement = new Movement(RouteStepType.GO_FORWARD, null, null);
                        movement.step.setFromFulcrumId(from.getId());
                        movement.step.setFloorId(from.getFloor() != null ? from.getFloor().getId() : null);
                        applyMovement(movement, segmentMeters, to);
                        steps.add(movement.step);
                    }
                } else {
                    // A turn without a landmark folds the segment in: "Поверните налево и пройдите N м".
                    movement = new Movement(turnType, turnPhrase(turnType), null);
                    movement.step.setFromFulcrumId(from.getId());
                    movement.step.setFloorId(from.getFloor() != null ? from.getFloor().getId() : null);
                    applyMovement(movement, segmentMeters, to);
                    steps.add(movement.step);
                }
            } else if (movement != null) {
                // Straight continuation: fold this segment into the running movement.
                applyMovement(movement, segmentMeters, to);
            } else if (segmentMeters > 0) {
                // A plain walk with no preceding turn stays "Пройдите N м".
                movement = new Movement(RouteStepType.GO_FORWARD, null, null);
                movement.step.setFromFulcrumId(from.getId());
                movement.step.setFloorId(from.getFloor() != null ? from.getFloor().getId() : null);
                applyMovement(movement, segmentMeters, to);
                steps.add(movement.step);
            }

            previousVector = segmentVector;
            previousWasFloorChange = false;
        }

        RouteStepDto arrival = buildArrivalStep(destination);
        if (arrival != null) {
            steps.add(arrival);
        }

        return steps;
    }

    private void applyMovement(Movement movement, double segmentMeters, Fulcrum to) {
        movement.distanceMeters = roundMeters(movement.distanceMeters + segmentMeters);
        movement.step.setDistanceMeters(movement.distanceMeters > 0 ? movement.distanceMeters : null);
        movement.step.setText(buildMovementText(movement.turnPhrase, movement.distanceMeters, movement.landmark));
        if (to != null) {
            movement.step.setToFulcrumId(to.getId());
            if (to.getFloor() != null) {
                movement.step.setFloorId(to.getFloor().getId());
            }
        }
    }

    private String buildMovementText(String turnPhrase, double distanceMeters, String landmark) {
        String base;
        if (turnPhrase != null) {
            base = distanceMeters > 0
                    ? turnPhrase + " и пройдите " + formatMeters(distanceMeters) + " м"
                    : turnPhrase;
        } else {
            base = "Пройдите " + formatMeters(distanceMeters) + " м";
        }
        if (landmark != null) {
            base = base + ". " + landmark;
        }
        return base;
    }

    private RouteStepDto buildFloorChangeStep(Fulcrum from, Fulcrum to, Graph graph, Long destinationId) {
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

        String landmark = buildLandmarkHint(to, facingToVector(to.getFacingDirection()), graph, true, destinationId);
        if (landmark != null) {
            step.setText(text + ". " + landmark);
        }

        return step;
    }

    private RouteStepType detectTurnType(Vector baseVector, Vector nextVector) {
        if (baseVector == null || baseVector.isZero() || nextVector == null || nextVector.isZero()) {
            return null;
        }

        double angle = angleBetween(baseVector, nextVector);
        if (angle <= 20.0) {
            return null;
        }
        if (angle >= 135.0) {
            return RouteStepType.U_TURN;
        }

        double cross = cross(baseVector, nextVector);
        if (cross > 0) {
            return RouteStepType.TURN_RIGHT;
        }
        if (cross < 0) {
            return RouteStepType.TURN_LEFT;
        }
        return null;
    }

    private String turnPhrase(RouteStepType type) {
        return switch (type) {
            case TURN_LEFT -> "Поверните налево";
            case TURN_RIGHT -> "Поверните направо";
            case U_TURN -> "Развернитесь";
            default -> null;
        };
    }

    private double calculateTotalDistanceMeters(Graph graph, List<Fulcrum> path) {
        if (graph == null || path == null || path.size() < 2) {
            return 0;
        }

        double total = 0;
        for (int i = 0; i < path.size() - 1; i += 1) {
            Double segment = estimateDistanceMeters(graph, path.get(i), path.get(i + 1));
            if (segment != null && segment > 0) {
                total += segment;
            }
        }

        return roundMeters(total);
    }

    private RouteStepDto buildArrivalStep(Fulcrum destination) {
        if (destination == null) {
            return null;
        }
        RouteStepDto step = new RouteStepDto();
        step.setType(RouteStepType.ARRIVE);
        step.setDistanceMeters(null);
        step.setFromFulcrumId(destination.getId());
        step.setToFulcrumId(destination.getId());
        step.setFloorId(destination.getFloor() != null ? destination.getFloor().getId() : null);

        String name = destination.getName();
        step.setText(name != null && !name.isBlank()
                ? "Вы на месте: " + name
                : "Вы на месте");
        return step;
    }

    private String buildLandmarkHint(Fulcrum pivot, Vector facing, Graph graph, boolean excludeVerticals,
                                     Long destinationId) {
        if (pivot == null || facing == null || facing.isZero() || graph == null) {
            return null;
        }
        if (pivot.getFloor() == null) {
            return null;
        }

        Fulcrum best = null;
        double bestDist = Double.MAX_VALUE;

        for (Fulcrum candidate : graph.getNodes().values()) {
            if (candidate == null || candidate.getId() == null) continue;
            if (candidate.getId().equals(pivot.getId())) continue;
            if (destinationId != null && candidate.getId().equals(destinationId)) continue;
            if (candidate.getFloor() == null || pivot.getFloor() == null) continue;
            if (!candidate.getFloor().getId().equals(pivot.getFloor().getId())) continue;
            if (candidate.getType() == null || candidate.getType() == FulcrumType.WAYPOINT) continue;
            if (excludeVerticals
                    && (candidate.getType() == FulcrumType.STAIRS || candidate.getType() == FulcrumType.ELEVATOR)) {
                continue;
            }
            String name = candidate.getName();
            if (name == null || name.isBlank()) continue;
            if (candidate.getX() == null || candidate.getY() == null || pivot.getX() == null || pivot.getY() == null) {
                continue;
            }

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

        if (best == null) {
            return null;
        }

        Vector toCandidate = new Vector(best.getX() - pivot.getX(), best.getY() - pivot.getY());
        double cross = cross(facing, toCandidate);

        // A landmark dead ahead has no clear side; skip the hint rather than say "Рядом".
        if (Math.abs(cross) < 1e-6) {
            return null;
        }
        String side = cross > 0 ? "Справа" : "Слева";

        return side + " будет " + best.getName();
    }

    private Double estimateDistanceMeters(Graph graph, Fulcrum from, Fulcrum to) {
        if (graph == null || from == null || to == null) {
            return null;
        }

        List<Graph.Edge> edges = graph.getEdges(from.getId());
        if (edges != null) {
            for (Graph.Edge edge : edges) {
                if (edge.targetId().equals(to.getId())) {
                    return edge.distanceMeters();
                }
            }
        }

        double dx = to.getX() - from.getX();
        double dy = to.getY() - from.getY();
        return Math.hypot(dx, dy);
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

    private double roundMeters(double value) {
        return Math.round(value * 10.0) / 10.0;
    }

    private String formatMeters(double value) {
        if (Math.abs(value - Math.rint(value)) < 1e-9) {
            return String.valueOf((long) Math.rint(value));
        }
        return String.format(Locale.US, "%.1f", value);
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

    private static class Movement {
        private final RouteStepDto step = new RouteStepDto();
        private final String turnPhrase;
        private final String landmark;
        private double distanceMeters;

        private Movement(RouteStepType type, String turnPhrase, String landmark) {
            this.step.setType(type);
            this.turnPhrase = turnPhrase;
            this.landmark = landmark;
        }
    }

    public void testGraphBuilding(Long areaId) {
        List<com.buildmap.api.entities.mapping_area.Floor> floors =
                floorService.getAllByMappingAreaId(areaId, false);

        List<Fulcrum> allFulcrums = floors.stream()
                .flatMap(floor -> floor.getFulcrums().stream())
                .filter(fulcrum -> !fulcrum.isDeleted())
                .collect(Collectors.toList());

        Graph graph = new Graph(allFulcrums);

        System.out.println("=== GRAPH DEBUG ===");
        System.out.println("Floors: " + floors.size());
        System.out.println("Fulcrums: " + allFulcrums.size());
        System.out.println("Nodes in graph: " + graph.getNodes().size());

        graph.getNodes().values().forEach(fulcrum -> {
            List<Graph.Edge> edges = graph.getEdges(fulcrum.getId());
            if (!edges.isEmpty()) {
                System.out.println(fulcrum.getName() + " (" + fulcrum.getFloor().getName() + ") -> "
                        + edges.size() + " connections");
            }
        });
    }
}
