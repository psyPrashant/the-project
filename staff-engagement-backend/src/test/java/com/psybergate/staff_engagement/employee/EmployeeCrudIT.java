package com.psybergate.staff_engagement.employee;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.psybergate.staff_engagement.IntegrationTestBase;
import com.psybergate.staff_engagement.auth.dto.AuthResponse;
import com.psybergate.staff_engagement.auth.dto.LoginRequest;
import com.psybergate.staff_engagement.employee.dto.CreateEmployeeRequest;
import com.psybergate.staff_engagement.employee.dto.EmployeeProfileResponse;
import com.psybergate.staff_engagement.employee.dto.UpdateEmployeeRequest;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

class EmployeeCrudIT extends IntegrationTestBase {

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;

    private String token;

    @BeforeEach
    void authenticate() throws Exception {
        String body = objectMapper.writeValueAsString(new LoginRequest("admin@psybergate.com", "password123"));
        MvcResult result = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk())
                .andReturn();
        token = objectMapper.readValue(result.getResponse().getContentAsString(), AuthResponse.class).token();
    }

    private String uniqueEmail() {
        return "test-" + UUID.randomUUID() + "@example.com";
    }

    private EmployeeProfileResponse createEmployee(String firstName, String lastName, String email) throws Exception {
        String body = objectMapper.writeValueAsString(
                new CreateEmployeeRequest(firstName, lastName, email, null, null, null));
        MvcResult result = mockMvc.perform(post("/api/employees")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isCreated())
                .andReturn();
        return objectMapper.readValue(result.getResponse().getContentAsString(), EmployeeProfileResponse.class);
    }

    // POST /api/employees

    @Test
    void create_validRequest_returns201WithProfile() throws Exception {
        String body = objectMapper.writeValueAsString(
                new CreateEmployeeRequest("Test", "User", uniqueEmail(), "Dev", "Engineering", "555-0100"));

        MvcResult result = mockMvc.perform(post("/api/employees")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isCreated())
                .andReturn();

        EmployeeProfileResponse profile = objectMapper.readValue(
                result.getResponse().getContentAsString(), EmployeeProfileResponse.class);
        assertThat(profile.id()).isNotNull();
        assertThat(profile.firstName()).isEqualTo("Test");
        assertThat(profile.jobTitle()).isEqualTo("Dev");
        assertThat(profile.archived()).isFalse();
    }

    @Test
    void create_missingFirstName_returns400() throws Exception {
        String body = objectMapper.writeValueAsString(
                new CreateEmployeeRequest("", "User", uniqueEmail(), null, null, null));

        mockMvc.perform(post("/api/employees")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isBadRequest());
    }

    @Test
    void create_duplicateEmail_returns409() throws Exception {
        String email = uniqueEmail();
        createEmployee("A", "B", email);

        String body = objectMapper.writeValueAsString(
                new CreateEmployeeRequest("A", "B", email, null, null, null));

        mockMvc.perform(post("/api/employees")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isConflict());
    }

    @Test
    void create_unauthenticated_returns401() throws Exception {
        String body = objectMapper.writeValueAsString(
                new CreateEmployeeRequest("A", "B", uniqueEmail(), null, null, null));

        mockMvc.perform(post("/api/employees")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isUnauthorized());
    }

    // GET /api/employees/{id}

    @Test
    void getProfile_existingEmployee_returns200() throws Exception {
        String email = uniqueEmail();
        EmployeeProfileResponse created = createEmployee("Get", "Me", email);

        MvcResult result = mockMvc.perform(get("/api/employees/" + created.id())
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andReturn();

        EmployeeProfileResponse profile = objectMapper.readValue(
                result.getResponse().getContentAsString(), EmployeeProfileResponse.class);
        assertThat(profile.email()).isEqualTo(email);
    }

    @Test
    void getProfile_unknownId_returns404() throws Exception {
        mockMvc.perform(get("/api/employees/999999999")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isNotFound());
    }

    // GET /api/employees (list & search)

    @Test
    void list_includesCreatedEmployee() throws Exception {
        String email = uniqueEmail();
        createEmployee("Listed", "User", email);

        MvcResult result = mockMvc.perform(get("/api/employees")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andReturn();

        List<EmployeeProfileResponse> list = objectMapper.readValue(
                result.getResponse().getContentAsString(),
                new TypeReference<List<EmployeeProfileResponse>>() {});
        assertThat(list).extracting(EmployeeProfileResponse::email).contains(email);
    }

    @Test
    void search_byName_returnsMatchingEmployee() throws Exception {
        String uniqueFirst = "Zyx" + UUID.randomUUID().toString().replace("-", "").substring(0, 6);
        String email = uniqueEmail();
        createEmployee(uniqueFirst, "SearchTest", email);

        MvcResult result = mockMvc.perform(get("/api/employees")
                        .param("search", uniqueFirst)
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andReturn();

        List<EmployeeProfileResponse> list = objectMapper.readValue(
                result.getResponse().getContentAsString(),
                new TypeReference<List<EmployeeProfileResponse>>() {});
        assertThat(list).extracting(EmployeeProfileResponse::email).contains(email);
    }

    @Test
    void search_noMatches_returnsEmptyArray() throws Exception {
        MvcResult result = mockMvc.perform(get("/api/employees")
                        .param("search", "ZzZzZzZzZzZzNomatch99x")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andReturn();

        List<EmployeeProfileResponse> list = objectMapper.readValue(
                result.getResponse().getContentAsString(),
                new TypeReference<List<EmployeeProfileResponse>>() {});
        assertThat(list).isEmpty();
    }

    // PUT /api/employees/{id}

    @Test
    void update_validRequest_returns200WithUpdatedProfile() throws Exception {
        EmployeeProfileResponse created = createEmployee("Old", "Name", uniqueEmail());

        String body = objectMapper.writeValueAsString(
                new UpdateEmployeeRequest("New", "Name", uniqueEmail(), "Manager", null, null));

        MvcResult result = mockMvc.perform(put("/api/employees/" + created.id())
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk())
                .andReturn();

        EmployeeProfileResponse profile = objectMapper.readValue(
                result.getResponse().getContentAsString(), EmployeeProfileResponse.class);
        assertThat(profile.firstName()).isEqualTo("New");
        assertThat(profile.jobTitle()).isEqualTo("Manager");
    }

    @Test
    void update_blankLastName_returns400() throws Exception {
        EmployeeProfileResponse created = createEmployee("Valid", "Name", uniqueEmail());

        String body = objectMapper.writeValueAsString(
                new UpdateEmployeeRequest("Valid", "", uniqueEmail(), null, null, null));

        mockMvc.perform(put("/api/employees/" + created.id())
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isBadRequest());
    }

    @Test
    void update_unknownEmployee_returns404() throws Exception {
        String body = objectMapper.writeValueAsString(
                new UpdateEmployeeRequest("A", "B", uniqueEmail(), null, null, null));

        mockMvc.perform(put("/api/employees/999999999")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isNotFound());
    }

    // PATCH /api/employees/{id}/archive

    @Test
    void archive_returns204AndEmployeeAbsentFromList() throws Exception {
        String email = uniqueEmail();
        EmployeeProfileResponse created = createEmployee("Archive", "Me", email);

        mockMvc.perform(patch("/api/employees/" + created.id() + "/archive")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isNoContent());

        MvcResult result = mockMvc.perform(get("/api/employees")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andReturn();

        List<EmployeeProfileResponse> list = objectMapper.readValue(
                result.getResponse().getContentAsString(),
                new TypeReference<List<EmployeeProfileResponse>>() {});
        assertThat(list).extracting(EmployeeProfileResponse::email).doesNotContain(email);
    }

    @Test
    void archive_profileStillAccessibleByIdWithArchivedTrue() throws Exception {
        EmployeeProfileResponse created = createEmployee("Archived", "Profile", uniqueEmail());

        mockMvc.perform(patch("/api/employees/" + created.id() + "/archive")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isNoContent());

        MvcResult result = mockMvc.perform(get("/api/employees/" + created.id())
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andReturn();

        EmployeeProfileResponse profile = objectMapper.readValue(
                result.getResponse().getContentAsString(), EmployeeProfileResponse.class);
        assertThat(profile.archived()).isTrue();
    }

    // PATCH /api/employees/{id}/unarchive

    @Test
    void unarchive_archiveThenUnarchive_returns200WithArchivedFalse() throws Exception {
        String email = uniqueEmail();
        EmployeeProfileResponse created = createEmployee("Unarchive", "Me", email);

        mockMvc.perform(patch("/api/employees/" + created.id() + "/archive")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isNoContent());

        MvcResult result = mockMvc.perform(patch("/api/employees/" + created.id() + "/unarchive")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andReturn();

        EmployeeProfileResponse profile = objectMapper.readValue(
                result.getResponse().getContentAsString(), EmployeeProfileResponse.class);
        assertThat(profile.archived()).isFalse();
        assertThat(profile.email()).isEqualTo(email);
    }

    @Test
    void unarchive_unknownId_returns404() throws Exception {
        mockMvc.perform(patch("/api/employees/999999999/unarchive")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isNotFound());
    }

    @Test
    void unarchive_unauthenticated_returns401() throws Exception {
        mockMvc.perform(patch("/api/employees/1/unarchive"))
                .andExpect(status().isUnauthorized());
    }

    // GET /api/employees?includeArchived=true

    @Test
    void list_includeArchived_containsArchivedEmployee() throws Exception {
        String email = uniqueEmail();
        EmployeeProfileResponse created = createEmployee("InclArchived", "Test", email);

        mockMvc.perform(patch("/api/employees/" + created.id() + "/archive")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isNoContent());

        MvcResult result = mockMvc.perform(get("/api/employees")
                        .param("includeArchived", "true")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andReturn();

        List<EmployeeProfileResponse> list = objectMapper.readValue(
                result.getResponse().getContentAsString(),
                new TypeReference<List<EmployeeProfileResponse>>() {});
        assertThat(list).extracting(EmployeeProfileResponse::email).contains(email);
    }

    @Test
    void list_defaultExcludesArchivedEmployee() throws Exception {
        String email = uniqueEmail();
        EmployeeProfileResponse created = createEmployee("ExclArchived", "Test", email);

        mockMvc.perform(patch("/api/employees/" + created.id() + "/archive")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isNoContent());

        MvcResult result = mockMvc.perform(get("/api/employees")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andReturn();

        List<EmployeeProfileResponse> list = objectMapper.readValue(
                result.getResponse().getContentAsString(),
                new TypeReference<List<EmployeeProfileResponse>>() {});
        assertThat(list).extracting(EmployeeProfileResponse::email).doesNotContain(email);
    }

    @Test
    void search_includeArchived_findsArchivedEmployeeByName() throws Exception {
        String uniqueFirst = "Zarchived" + UUID.randomUUID().toString().replace("-", "").substring(0, 6);
        String email = uniqueEmail();
        EmployeeProfileResponse created = createEmployee(uniqueFirst, "ArchivedSearch", email);

        mockMvc.perform(patch("/api/employees/" + created.id() + "/archive")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isNoContent());

        MvcResult result = mockMvc.perform(get("/api/employees")
                        .param("search", uniqueFirst)
                        .param("includeArchived", "true")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andReturn();

        List<EmployeeProfileResponse> list = objectMapper.readValue(
                result.getResponse().getContentAsString(),
                new TypeReference<List<EmployeeProfileResponse>>() {});
        assertThat(list).extracting(EmployeeProfileResponse::email).contains(email);
    }
}
