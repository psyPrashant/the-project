package com.psybergate.staff_engagement.interaction;

import com.psybergate.staff_engagement.employee.Employee;
import com.psybergate.staff_engagement.employee.EmployeeService;
import com.psybergate.staff_engagement.employee.dto.EmployeeResponse;
import com.psybergate.staff_engagement.interaction.dto.InteractionRequestDto;
import com.psybergate.staff_engagement.interaction.dto.InteractionResponseDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

/** Maps between {@link Interaction} entities and API DTOs. */
@Component
@RequiredArgsConstructor
public class InteractionMapper {

    private final EmployeeService employeeService;

    public Interaction toEntity(InteractionRequestDto dto, Employee author, Employee subject) {
        return Interaction.builder()
                .author(author)
                .subject(subject)
                .note(dto.note())
                .type(dto.type())
                .date(dto.date())
                .build();
    }

    public InteractionResponseDto toResponse(Interaction interaction) {
        return new InteractionResponseDto(
                interaction.getId(),
                toEmployeeResponse(interaction.getAuthor()),
                toEmployeeResponse(interaction.getSubject()),
                interaction.getNote(),
                interaction.getType(),
                interaction.getDate());
    }

    private EmployeeResponse toEmployeeResponse(Employee employee) {
        return employeeService.toResponse(employee);
    }
}
