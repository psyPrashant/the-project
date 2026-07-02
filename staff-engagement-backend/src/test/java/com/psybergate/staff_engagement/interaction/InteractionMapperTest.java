package com.psybergate.staff_engagement.interaction;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

import com.psybergate.staff_engagement.employee.Employee;
import com.psybergate.staff_engagement.employee.EmployeeService;
import com.psybergate.staff_engagement.employee.dto.EmployeeResponse;
import com.psybergate.staff_engagement.interaction.dto.InteractionRequestDto;
import com.psybergate.staff_engagement.interaction.dto.InteractionResponseDto;
import java.time.LocalDate;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

/**
 * Unit tests for {@link InteractionMapper}. The mapper is otherwise only exercised through
 * integration tests; pinning every mapped field here keeps the entity/DTO translation honest under
 * mutation testing (a swapped or dropped field is caught).
 */
@ExtendWith(MockitoExtension.class)
class InteractionMapperTest {

    @Mock private EmployeeService employeeService;

    @InjectMocks
    private InteractionMapper mapper;

    private final Employee author = Employee.builder()
            .id(1L).email("author@x.com").firstName("Au").lastName("Thor").build();
    private final Employee subject = Employee.builder()
            .id(2L).email("subject@x.com").firstName("Sub").lastName("Ject").build();

    @Test
    void toEntity_copiesEveryFieldAndLeavesIdUnset() {
        InteractionRequestDto dto = new InteractionRequestDto(
                2L, "Discussed roadmap", InteractionType.MEETING, LocalDate.of(2026, 6, 30));

        Interaction entity = mapper.toEntity(dto, author, subject);

        assertThat(entity.getId()).isNull();
        assertThat(entity.getAuthor()).isSameAs(author);
        assertThat(entity.getSubject()).isSameAs(subject);
        assertThat(entity.getNote()).isEqualTo("Discussed roadmap");
        assertThat(entity.getType()).isEqualTo(InteractionType.MEETING);
        assertThat(entity.getDate()).isEqualTo(LocalDate.of(2026, 6, 30));
    }

    @Test
    void toResponse_mapsIdNoteTypeDateAndResolvesBothParties() {
        EmployeeResponse authorResponse = new EmployeeResponse(1L, "author@x.com", "Au", "Thor");
        EmployeeResponse subjectResponse = new EmployeeResponse(2L, "subject@x.com", "Sub", "Ject");
        when(employeeService.toResponse(author)).thenReturn(authorResponse);
        when(employeeService.toResponse(subject)).thenReturn(subjectResponse);

        Interaction entity = Interaction.builder()
                .id(55L).author(author).subject(subject)
                .note("Weekly sync").type(InteractionType.CALL).date(LocalDate.of(2026, 5, 1))
                .build();

        InteractionResponseDto response = mapper.toResponse(entity);

        assertThat(response.id()).isEqualTo(55L);
        assertThat(response.author()).isSameAs(authorResponse);
        assertThat(response.subject()).isSameAs(subjectResponse);
        assertThat(response.note()).isEqualTo("Weekly sync");
        assertThat(response.type()).isEqualTo(InteractionType.CALL);
        assertThat(response.date()).isEqualTo(LocalDate.of(2026, 5, 1));
    }
}
