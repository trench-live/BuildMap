package com.buildmap.api.services.navigation;

import com.buildmap.api.dto.route.RouteDto;
import com.buildmap.api.dto.route.RouteRequestDto;
import com.buildmap.api.dto.route.mappers.RouteMapper;
import com.buildmap.api.entities.mapping_area.fulcrum.Fulcrum;
import com.buildmap.api.services.FloorService;
import com.buildmap.api.services.FulcrumService;
import com.buildmap.api.services.navigation.dijkstra_algorithm.DijkstraAlgorithm;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NavigationService {

    private final FloorService floorService;
    private final FulcrumService fulcrumService;
    private final RouteMapper routeMapper;
    private final DijkstraAlgorithm dijkstraAlgorithm;

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