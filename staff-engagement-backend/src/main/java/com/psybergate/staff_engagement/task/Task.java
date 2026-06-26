package com.psybergate.staff_engagement.task;

import com.psybergate.staff_engagement.employee.Employee;
import com.psybergate.staff_engagement.interaction.Interaction;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "tasks")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Task {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    /** The employee this task is about — "my tasks" means relatesTo = me (D2). */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "relates_to_id", nullable = false)
    private Employee relatesTo;

    /** Who created this task (D2 — provenance). */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_id", nullable = false)
    private Employee createdBy;

    /** Optional link to the interaction that spawned this task (D2). */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "from_interaction_id")
    private Interaction fromInteraction;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TaskStatus status;

    @Column(name = "due_date")
    private LocalDate dueDate;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    void onPrePersist() {
        createdAt = LocalDateTime.now();
    }
}
