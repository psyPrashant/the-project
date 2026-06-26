package com.psybergate.staff_engagement.seed;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/seed")
@RequiredArgsConstructor
public class DataSeedController {

    private final DataSeedService dataSeedService;

    @PostMapping
    public ResponseEntity<SeedResult> seed() {
        return ResponseEntity.ok(dataSeedService.seed());
    }
}
