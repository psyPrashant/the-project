package com.psybergate.staff_engagement.dashboard;

import com.psybergate.staff_engagement.dashboard.dto.DashboardResponse;
import com.psybergate.staff_engagement.employee.Employee;

public interface DashboardService {

    DashboardResponse getDashboard(Employee currentEmployee);
}
