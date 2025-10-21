package com.buildmap.api.dto.path;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PathResponse {
    private String message;
    private Long fromFulcrumId;
    private Long toFulcrumId;
    private Integer pathLength;

    // Простая заглушка - статический метод для удобства
    public static PathResponse createStub(Long from, Long to) {
        return PathResponse.builder()
                .message("Path finding will be implemented soon")
                .fromFulcrumId(from)
                .toFulcrumId(to)
                .pathLength(0)
                .build();
    }
}