package com.psybergate.staff_engagement.interaction;

import com.psybergate.staff_engagement.auth.CurrentEmployee;
import com.psybergate.staff_engagement.employee.Employee;
import com.psybergate.staff_engagement.interaction.dto.InteractionRequestDto;
import com.psybergate.staff_engagement.interaction.dto.InteractionResponseDto;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/interactions")
@RequiredArgsConstructor
public class InteractionController {

    private final InteractionService interactionService;

    @PostMapping
    public ResponseEntity<InteractionResponseDto> create(
            @Valid @RequestBody InteractionRequestDto dto,
            @CurrentEmployee Employee currentEmployee) {
        return ResponseEntity.status(HttpStatus.CREATED).body(interactionService.create(dto, currentEmployee));
    }

    @GetMapping
    public ResponseEntity<List<InteractionResponseDto>> findBySubject(
            @RequestParam Long subjectId) {
        return ResponseEntity.ok(interactionService.findBySubject(subjectId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<InteractionResponseDto> findById(@PathVariable Long id) {
        return ResponseEntity.ok(interactionService.findById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<InteractionResponseDto> update(
            @PathVariable Long id,
            @Valid @RequestBody InteractionRequestDto dto,
            @CurrentEmployee Employee currentEmployee) {
        return ResponseEntity.ok(interactionService.update(id, dto, currentEmployee));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable Long id,
            @CurrentEmployee Employee currentEmployee) {
        interactionService.delete(id, currentEmployee);
        return ResponseEntity.noContent().build();
    }
}
