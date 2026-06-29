package com.psybergate.staff_engagement.interaction;

import com.psybergate.staff_engagement.employee.Employee;
import com.psybergate.staff_engagement.interaction.dto.InteractionFilter;
import com.psybergate.staff_engagement.interaction.dto.InteractionRequestDto;
import com.psybergate.staff_engagement.interaction.dto.InteractionResponseDto;
import java.util.List;

/** Module boundary for the interaction domain. */
public interface InteractionService {

    InteractionResponseDto create(InteractionRequestDto dto, Employee currentEmployee);

    InteractionResponseDto update(Long id, InteractionRequestDto dto, Employee currentEmployee);

    void delete(Long id, Employee currentEmployee);

    InteractionResponseDto findById(Long id);

    List<InteractionResponseDto> findBySubject(Long subjectId);

    List<InteractionResponseDto> findBySubject(Long subjectId, InteractionFilter filter);
}
