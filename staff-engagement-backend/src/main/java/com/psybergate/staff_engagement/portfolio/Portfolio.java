package com.psybergate.staff_engagement.portfolio;

import com.psybergate.staff_engagement.employee.Employee;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "portfolio_entries")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Portfolio {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @Column(name = "project_name", nullable = false)
    private String projectName;

    @Column
    private String role;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "start_date")
    private LocalDate startDate;

    /** Null means the employee is still on this project. */
    @Column(name = "end_date")
    private LocalDate endDate;
}
