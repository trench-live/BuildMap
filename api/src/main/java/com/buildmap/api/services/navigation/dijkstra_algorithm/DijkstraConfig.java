package com.buildmap.api.services.navigation.dijkstra_algorithm;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DijkstraConfig {

    @Bean
    public DijkstraAlgorithm dijkstraAlgorithm() {
        return new DijkstraAlgorithm();
    }
}