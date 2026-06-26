package com.psybergate.staff_engagement.interaction;

import com.psybergate.staff_engagement.common.exception.ForbiddenOperationException;
import com.psybergate.staff_engagement.employee.Employee;
import com.psybergate.staff_engagement.employee.EmployeeService;
import com.psybergate.staff_engagement.interaction.dto.InteractionRequestDto;
import com.psybergate.staff_engagement.interaction.dto.InteractionResponseDto;
import jakarta.persistence.EntityNotFoundException;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class InteractionServiceImpl implements InteractionService {

    private final InteractionRepository interactionRepository;
    private final EmployeeService employeeService;
    private final InteractionMapper interactionMapper;

    @Override
    public InteractionResponseDto create(InteractionRequestDto dto, Employee currentEmployee) {
        Employee subject = employeeService.findById(dto.subjectId());
        Interaction interaction = interactionMapper.toEntity(dto, currentEmployee, subject);
        Interaction saved = interactionRepository.save(interaction);
        return interactionMapper.toResponse(saved);
    }

    @Override
    public InteractionResponseDto update(Long id, InteractionRequestDto dto, Employee currentEmployee) {
        Interaction interaction = findInteraction(id);
        assertAuthor(interaction, currentEmployee);
        Employee subject = employeeService.findById(dto.subjectId());
        interaction.setSubject(subject);
        interaction.setNote(dto.note());
        interaction.setType(dto.type());
        interaction.setDate(dto.date());
        return interactionMapper.toResponse(interaction);
    }

    @Override
    public void delete(Long id, Employee currentEmployee) {
        Interaction interaction = findInteraction(id);
        assertAuthor(interaction, currentEmployee);
        interactionRepository.delete(interaction);
    }

    @Override
    @Transactional(readOnly = true)
    public InteractionResponseDto findById(Long id) {
        Interaction interaction = findInteraction(id);
        return interactionMapper.toResponse(interaction);
    }

    @Override
    @Transactional(readOnly = true)
    public List<InteractionResponseDto> findBySubject(Long subjectId) {
        return interactionRepository.findBySubjectIdOrderByDateDesc(subjectId).stream()
                .map(interactionMapper::toResponse)
                .toList();
    }

    private Interaction findInteraction(Long id) {
        return interactionRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Interaction not found: " + id));
    }

    private void assertAuthor(Interaction interaction, Employee currentEmployee) {
        if (!interaction.getAuthor().getId().equals(currentEmployee.getId())) {
            throw new ForbiddenOperationException("Only the interaction author may update or delete it");
        }
    }
}
