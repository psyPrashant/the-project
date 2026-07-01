package com.psybergate.staff_engagement.task;

import com.psybergate.staff_engagement.employee.Employee;
import com.psybergate.staff_engagement.task.dto.CreateStandaloneTaskRequest;
import com.psybergate.staff_engagement.task.dto.CreateTaskFromInteractionRequest;
import com.psybergate.staff_engagement.task.dto.TaskResponse;
import com.psybergate.staff_engagement.task.dto.UpdateTaskRequest;
import com.psybergate.staff_engagement.task.dto.UpdateTaskStatusRequest;
import java.util.List;

/** Module boundary for the task domain. */
public interface TaskService {

    TaskResponse createFromInteraction(CreateTaskFromInteractionRequest request, Employee currentEmployee);

    TaskResponse createStandalone(CreateStandaloneTaskRequest request, Employee currentEmployee);

    List<TaskResponse> getMyTasks(Employee currentEmployee);

    List<TaskResponse> getByRelatesTo(Long employeeId);

    List<TaskResponse> getAllTasks();

    TaskResponse updateStatus(Long id, UpdateTaskStatusRequest request, Employee currentEmployee);

    TaskResponse update(Long id, UpdateTaskRequest request, Employee currentEmployee);

    void delete(Long id, Employee currentEmployee);
}
