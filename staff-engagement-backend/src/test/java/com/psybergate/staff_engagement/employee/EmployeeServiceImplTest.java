package com.psybergate.staff_engagement.employee;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.psybergate.staff_engagement.common.exception.DuplicateResourceException;
import com.psybergate.staff_engagement.employee.dto.CreateEmployeeRequest;
import com.psybergate.staff_engagement.employee.dto.EmployeeProfileResponse;
import com.psybergate.staff_engagement.employee.dto.UpdateEmployeeRequest;
import jakarta.persistence.EntityNotFoundException;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.DataIntegrityViolationException;

@ExtendWith(MockitoExtension.class)
class EmployeeServiceImplTest {

	@Mock
	private EmployeeRepository employeeRepository;

	@InjectMocks
	private EmployeeServiceImpl employeeService;

	// createEmployee

	@Test
	void createEmployee_happyPath_returnsMappedProfile() {
		CreateEmployeeRequest request = new CreateEmployeeRequest(
				"Alice", "Smith", "alice@example.com", "Engineer", "Tech", "555-0001");
		Employee saved = Employee.builder()
				.id(1L).firstName("Alice").lastName("Smith").email("alice@example.com")
				.jobTitle("Engineer").department("Tech").phone("555-0001").build();
		when(employeeRepository.save(any())).thenReturn(saved);

		EmployeeProfileResponse result = employeeService.createEmployee(request);

		assertThat(result.id()).isEqualTo(1L);
		assertThat(result.email()).isEqualTo("alice@example.com");
		assertThat(result.jobTitle()).isEqualTo("Engineer");
		assertThat(result.archived()).isFalse();
	}

	@Test
	void createEmployee_duplicateEmail_throwsDuplicateResourceException() {
		when(employeeRepository.save(any())).thenThrow(new DataIntegrityViolationException("duplicate"));

		assertThatThrownBy(() -> employeeService.createEmployee(
				new CreateEmployeeRequest("Bob", "Jones", "bob@example.com", null, null, null)))
				.isInstanceOf(DuplicateResourceException.class)
				.hasMessageContaining("bob@example.com");
	}

	// getProfile

	@Test
	void getProfile_existingId_returnsMappedProfile() {
		Employee employee = Employee.builder()
				.id(2L).firstName("Carol").lastName("White").email("carol@example.com").build();
		when(employeeRepository.findById(2L)).thenReturn(Optional.of(employee));

		EmployeeProfileResponse result = employeeService.getProfile(2L);

		assertThat(result.id()).isEqualTo(2L);
		assertThat(result.email()).isEqualTo("carol@example.com");
	}

	@Test
	void getProfile_unknownId_throwsEntityNotFoundException() {
		when(employeeRepository.findById(99L)).thenReturn(Optional.empty());

		assertThatThrownBy(() -> employeeService.getProfile(99L))
				.isInstanceOf(EntityNotFoundException.class);
	}

	// getEmployees

	@Test
	void getEmployees_noQuery_returnsMappedActiveEmployees() {
		when(employeeRepository.findByArchivedFalse()).thenReturn(List.of(
				Employee.builder().id(1L).firstName("Dave").lastName("Brown").email("dave@example.com").build(),
				Employee.builder().id(2L).firstName("Eve").lastName("Green").email("eve@example.com").build()
		));

		assertThat(employeeService.getEmployees(null, false)).hasSize(2);
	}

	@Test
	void getEmployees_withQuery_returnsMatchingActiveEmployees() {
		when(employeeRepository.searchActiveByName("Jane")).thenReturn(List.of(
				Employee.builder().id(1L).firstName("Jane").lastName("Doe").email("jane@example.com").build()
		));

		List<EmployeeProfileResponse> result = employeeService.getEmployees("Jane", false);

		assertThat(result).hasSize(1);
		assertThat(result.get(0).firstName()).isEqualTo("Jane");
	}

	@Test
	void getEmployees_withQueryNoMatches_returnsEmptyList() {
		when(employeeRepository.searchActiveByName("NoMatch")).thenReturn(List.of());

		assertThat(employeeService.getEmployees("NoMatch", false)).isEmpty();
	}

	@Test
	void getEmployees_includeArchived_noQuery_returnsAllEmployees() {
		Employee active = Employee.builder().id(1L).firstName("Active").lastName("A").email("a@example.com").archived(false).build();
		Employee archived = Employee.builder().id(2L).firstName("Archived").lastName("B").email("b@example.com").archived(true).build();
		when(employeeRepository.findAllByOrderByLastNameAscFirstNameAsc()).thenReturn(List.of(active, archived));

		List<EmployeeProfileResponse> result = employeeService.getEmployees(null, true);

		assertThat(result).hasSize(2);
		assertThat(result).extracting(EmployeeProfileResponse::archived).containsExactlyInAnyOrder(false, true);
	}

	@Test
	void getEmployees_includeArchived_withQuery_searchesAllEmployees() {
		Employee archived = Employee.builder().id(2L).firstName("Jane").lastName("Archived").email("jane@example.com").archived(true).build();
		when(employeeRepository.searchAllByName("Jane")).thenReturn(List.of(archived));

		List<EmployeeProfileResponse> result = employeeService.getEmployees("Jane", true);

		assertThat(result).hasSize(1);
		assertThat(result.get(0).archived()).isTrue();
	}

	// updateEmployee

	@Test
	void updateEmployee_happyPath_persistsAndReturnsUpdated() {
		Employee existing = Employee.builder()
				.id(1L).firstName("Old").lastName("Name").email("old@example.com").build();
		when(employeeRepository.findById(1L)).thenReturn(Optional.of(existing));
		when(employeeRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

		EmployeeProfileResponse result = employeeService.updateEmployee(1L,
				new UpdateEmployeeRequest("New", "Name", "new@example.com", "Manager", null, null));

		assertThat(result.firstName()).isEqualTo("New");
		assertThat(result.email()).isEqualTo("new@example.com");
		assertThat(result.jobTitle()).isEqualTo("Manager");
		verify(employeeRepository).save(existing);
	}

	@Test
	void updateEmployee_unknownId_throwsEntityNotFoundException() {
		when(employeeRepository.findById(99L)).thenReturn(Optional.empty());

		assertThatThrownBy(() -> employeeService.updateEmployee(99L,
				new UpdateEmployeeRequest("A", "B", "a@b.com", null, null, null)))
				.isInstanceOf(EntityNotFoundException.class);
	}

	// archive

	@Test
	void archive_setsArchivedFlag() {
		Employee employee = Employee.builder()
				.id(1L).firstName("Fred").lastName("Black").email("fred@example.com").build();
		when(employeeRepository.findById(1L)).thenReturn(Optional.of(employee));

		employeeService.archive(1L);

		assertThat(employee.isArchived()).isTrue();
	}

	@Test
	void archive_unknownId_throwsEntityNotFoundException() {
		when(employeeRepository.findById(99L)).thenReturn(Optional.empty());

		assertThatThrownBy(() -> employeeService.archive(99L))
				.isInstanceOf(EntityNotFoundException.class);
	}

	// unarchive

	@Test
	void unarchive_setsArchivedFalseAndReturnsProfile() {
		Employee employee = Employee.builder()
				.id(1L).firstName("Grace").lastName("Lee").email("grace@example.com").archived(true).build();
		when(employeeRepository.findById(1L)).thenReturn(Optional.of(employee));
		when(employeeRepository.save(employee)).thenReturn(employee);

		EmployeeProfileResponse result = employeeService.unarchive(1L);

		assertThat(employee.isArchived()).isFalse();
		assertThat(result.archived()).isFalse();
		assertThat(result.id()).isEqualTo(1L);
		verify(employeeRepository).save(employee);
	}

	@Test
	void unarchive_unknownId_throwsEntityNotFoundException() {
		when(employeeRepository.findById(99L)).thenReturn(Optional.empty());

		assertThatThrownBy(() -> employeeService.unarchive(99L))
				.isInstanceOf(EntityNotFoundException.class);
	}
}
