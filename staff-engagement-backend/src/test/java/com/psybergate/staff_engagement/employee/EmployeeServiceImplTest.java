package com.psybergate.staff_engagement.employee;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

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
	void createEmployee_duplicateEmail_propagatesDataIntegrityViolation() {
		when(employeeRepository.save(any())).thenThrow(new DataIntegrityViolationException("duplicate"));

		assertThatThrownBy(() -> employeeService.createEmployee(
				new CreateEmployeeRequest("Bob", "Jones", "bob@example.com", null, null, null)))
				.isInstanceOf(DataIntegrityViolationException.class);
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

	// listAll

	@Test
	void listAll_returnsMappedActiveEmployees() {
		when(employeeRepository.findByArchivedFalse()).thenReturn(List.of(
				Employee.builder().id(1L).firstName("Dave").lastName("Brown").email("dave@example.com").build(),
				Employee.builder().id(2L).firstName("Eve").lastName("Green").email("eve@example.com").build()
		));

		assertThat(employeeService.listAll()).hasSize(2);
	}

	// search

	@Test
	void search_returnsMatchingActiveEmployees() {
		when(employeeRepository.searchActiveByName("Jane")).thenReturn(List.of(
				Employee.builder().id(1L).firstName("Jane").lastName("Doe").email("jane@example.com").build()
		));

		List<EmployeeProfileResponse> result = employeeService.search("Jane");

		assertThat(result).hasSize(1);
		assertThat(result.get(0).firstName()).isEqualTo("Jane");
	}

	@Test
	void search_noMatches_returnsEmptyList() {
		when(employeeRepository.searchActiveByName("NoMatch")).thenReturn(List.of());

		assertThat(employeeService.search("NoMatch")).isEmpty();
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
	void archive_setsArchivedFlagAndSaves() {
		Employee employee = Employee.builder()
				.id(1L).firstName("Fred").lastName("Black").email("fred@example.com").build();
		when(employeeRepository.findById(1L)).thenReturn(Optional.of(employee));

		employeeService.archive(1L);

		assertThat(employee.isArchived()).isTrue();
		verify(employeeRepository).save(employee);
	}

	@Test
	void archive_unknownId_throwsEntityNotFoundException() {
		when(employeeRepository.findById(99L)).thenReturn(Optional.empty());

		assertThatThrownBy(() -> employeeService.archive(99L))
				.isInstanceOf(EntityNotFoundException.class);
	}
}
