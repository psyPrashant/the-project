package com.psybergate.staff_engagement.interaction;

import com.psybergate.staff_engagement.employee.Employee;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "interactions")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Interaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subject_employee_id", nullable = false)
    private Employee subject;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "logged_by_id", nullable = false)
    private Employee loggedBy;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private InteractionType type;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String notes;

    @Column(name = "interaction_date", nullable = false)
    private LocalDate interactionDate;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    void onPrePersist() {
        createdAt = LocalDateTime.now();
    }
}
