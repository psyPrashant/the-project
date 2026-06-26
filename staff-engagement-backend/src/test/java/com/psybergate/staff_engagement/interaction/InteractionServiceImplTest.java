package com.psybergate.staff_engagement.interaction;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.psybergate.staff_engagement.common.exception.ForbiddenOperationException;
import com.psybergate.staff_engagement.employee.Employee;
import com.psybergate.staff_engagement.employee.EmployeeService;
import com.psybergate.staff_engagement.employee.dto.EmployeeResponse;
import com.psybergate.staff_engagement.interaction.dto.InteractionRequestDto;
import com.psybergate.staff_engagement.interaction.dto.InteractionResponseDto;
import jakarta.persistence.EntityNotFoundException;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class InteractionServiceImplTest {

    @Mock
    private InteractionRepository interactionRepository;

    @Mock
    private EmployeeService employeeService;

    @Mock
    private InteractionMapper interactionMapper;

    @InjectMocks
    private InteractionServiceImpl interactionService;

    private final Employee author = Employee.builder()
            .id(1L).email("author@example.com").firstName("Author").lastName("User").build();

    private final Employee subject = Employee.builder()
            .id(2L).email("subject@example.com").firstName("Subject").lastName("User").build();

    private final LocalDate today = LocalDate.of(2026, 6, 25);

    @Test
    void create_happyPath_returnsMappedResponse() {
        InteractionRequestDto dto = new InteractionRequestDto(2L, "Had a great meeting", InteractionType.MEETING, today);
        Interaction toSave = Interaction.builder()
                .author(author).subject(subject).note("Had a great meeting").type(InteractionType.MEETING).date(today).build();
        Interaction saved = Interaction.builder()
                .id(10L).author(author).subject(subject).note("Had a great meeting").type(InteractionType.MEETING).date(today).build();
        InteractionResponseDto response = new InteractionResponseDto(
                10L, new EmployeeResponse(1L, "author@example.com", "Author", "User"),
                new EmployeeResponse(2L, "subject@example.com", "Subject", "User"),
                "Had a great meeting", InteractionType.MEETING, today);

        when(employeeService.findById(2L)).thenReturn(subject);
        when(interactionMapper.toEntity(dto, author, subject)).thenReturn(toSave);
        when(interactionRepository.save(toSave)).thenReturn(saved);
        when(interactionMapper.toResponse(saved)).thenReturn(response);

        InteractionResponseDto result = interactionService.create(dto, author);

        assertThat(result.id()).isEqualTo(10L);
        assertThat(result.note()).isEqualTo("Had a great meeting");
        assertThat(result.type()).isEqualTo(InteractionType.MEETING);
    }

    @Test
    void create_selfInteraction_usesSameEmployeeAsAuthorAndSubject() {
        InteractionRequestDto dto = new InteractionRequestDto(1L, "Self note", InteractionType.NOTE, today);
        Interaction toSave = Interaction.builder()
                .author(author).subject(author).note("Self note").type(InteractionType.NOTE).date(today).build();
        Interaction saved = Interaction.builder()
                .id(11L).author(author).subject(author).note("Self note").type(InteractionType.NOTE).date(today).build();
        InteractionResponseDto response = new InteractionResponseDto(
                11L, new EmployeeResponse(1L, "author@example.com", "Author", "User"),
                new EmployeeResponse(1L, "author@example.com", "Author", "User"),
                "Self note", InteractionType.NOTE, today);

        when(employeeService.findById(1L)).thenReturn(author);
        when(interactionMapper.toEntity(dto, author, author)).thenReturn(toSave);
        when(interactionRepository.save(toSave)).thenReturn(saved);
        when(interactionMapper.toResponse(saved)).thenReturn(response);

        InteractionResponseDto result = interactionService.create(dto, author);

        assertThat(result.author().id()).isEqualTo(result.subject().id());
        assertThat(result.subject().id()).isEqualTo(1L);
    }

    @Test
    void update_byAuthor_updatesAndReturnsResponse() {
        Interaction existing = Interaction.builder()
                .id(10L).author(author).subject(subject).note("Old note").type(InteractionType.CALL).date(today).build();
        InteractionRequestDto dto = new InteractionRequestDto(2L, "Updated note", InteractionType.EMAIL, today.plusDays(1));
        Employee newSubject = Employee.builder()
                .id(2L).email("subject@example.com").firstName("Subject").lastName("User").build();
        InteractionResponseDto response = new InteractionResponseDto(
                10L, new EmployeeResponse(1L, "author@example.com", "Author", "User"),
                new EmployeeResponse(2L, "subject@example.com", "Subject", "User"),
                "Updated note", InteractionType.EMAIL, today.plusDays(1));

        when(interactionRepository.findById(10L)).thenReturn(Optional.of(existing));
        when(employeeService.findById(2L)).thenReturn(newSubject);
        when(interactionMapper.toResponse(existing)).thenReturn(response);

        InteractionResponseDto result = interactionService.update(10L, dto, author);

        assertThat(result.note()).isEqualTo("Updated note");
        assertThat(result.type()).isEqualTo(InteractionType.EMAIL);
        assertThat(existing.getSubject()).isEqualTo(newSubject);
    }

    @Test
    void update_byNonAuthor_throwsForbiddenOperationException() {
        Employee other = Employee.builder()
                .id(3L).email("other@example.com").firstName("Other").lastName("User").build();
        Interaction existing = Interaction.builder()
                .id(10L).author(author).subject(subject).note("Note").type(InteractionType.NOTE).date(today).build();

        when(interactionRepository.findById(10L)).thenReturn(Optional.of(existing));

        assertThatThrownBy(() -> interactionService.update(10L,
                new InteractionRequestDto(2L, "Update", InteractionType.NOTE, today), other))
                .isInstanceOf(ForbiddenOperationException.class)
                .hasMessageContaining("Only the interaction author");
    }

    @Test
    void delete_byNonAuthor_throwsForbiddenOperationException() {
        Employee other = Employee.builder()
                .id(3L).email("other@example.com").firstName("Other").lastName("User").build();
        Interaction existing = Interaction.builder()
                .id(10L).author(author).subject(subject).note("Note").type(InteractionType.NOTE).date(today).build();

        when(interactionRepository.findById(10L)).thenReturn(Optional.of(existing));

        assertThatThrownBy(() -> interactionService.delete(10L, other))
                .isInstanceOf(ForbiddenOperationException.class);
    }

    @Test
    void delete_byAuthor_deletesInteraction() {
        Interaction existing = Interaction.builder()
                .id(10L).author(author).subject(subject).note("Note").type(InteractionType.NOTE).date(today).build();

        when(interactionRepository.findById(10L)).thenReturn(Optional.of(existing));

        interactionService.delete(10L, author);

        verify(interactionRepository).delete(existing);
    }

    @Test
    void findById_existingInteraction_returnsMappedResponse() {
        Interaction existing = Interaction.builder()
                .id(10L).author(author).subject(subject).note("Note").type(InteractionType.NOTE).date(today).build();
        InteractionResponseDto response = new InteractionResponseDto(
                10L, new EmployeeResponse(1L, "author@example.com", "Author", "User"),
                new EmployeeResponse(2L, "subject@example.com", "Subject", "User"),
                "Note", InteractionType.NOTE, today);

        when(interactionRepository.findById(10L)).thenReturn(Optional.of(existing));
        when(interactionMapper.toResponse(existing)).thenReturn(response);

        InteractionResponseDto result = interactionService.findById(10L);

        assertThat(result.id()).isEqualTo(10L);
    }

    @Test
    void findById_unknownInteraction_throwsEntityNotFoundException() {
        when(interactionRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> interactionService.findById(99L))
                .isInstanceOf(EntityNotFoundException.class);
    }

    @Test
    void findBySubject_returnsMappedListOrderedByDateDesc() {
        Interaction i1 = Interaction.builder()
                .id(1L).author(author).subject(subject).note("Older").type(InteractionType.NOTE).date(today.minusDays(2)).build();
        Interaction i2 = Interaction.builder()
                .id(2L).author(author).subject(subject).note("Newer").type(InteractionType.NOTE).date(today).build();
        InteractionResponseDto r1 = new InteractionResponseDto(
                1L, new EmployeeResponse(1L, "author@example.com", "Author", "User"),
                new EmployeeResponse(2L, "subject@example.com", "Subject", "User"),
                "Older", InteractionType.NOTE, today.minusDays(2));
        InteractionResponseDto r2 = new InteractionResponseDto(
                2L, new EmployeeResponse(1L, "author@example.com", "Author", "User"),
                new EmployeeResponse(2L, "subject@example.com", "Subject", "User"),
                "Newer", InteractionType.NOTE, today);

        when(interactionRepository.findBySubjectIdOrderByDateDesc(2L)).thenReturn(List.of(i2, i1));
        when(interactionMapper.toResponse(i1)).thenReturn(r1);
        when(interactionMapper.toResponse(i2)).thenReturn(r2);

        List<InteractionResponseDto> result = interactionService.findBySubject(2L);

        assertThat(result).hasSize(2);
        assertThat(result.get(0).id()).isEqualTo(2L);
        assertThat(result.get(1).id()).isEqualTo(1L);
    }
}
