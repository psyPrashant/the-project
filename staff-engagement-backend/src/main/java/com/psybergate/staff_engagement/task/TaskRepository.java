package com.psybergate.staff_engagement.task;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TaskRepository extends JpaRepository<Task, Long> {

    @Override
    @EntityGraph(attributePaths = {"relatesTo", "createdBy", "assignee"})
    Optional<Task> findById(Long id);

    @EntityGraph(attributePaths = {"relatesTo", "createdBy", "assignee"})
    List<Task> findByRelatesToIdOrAssigneeId(Long relatesToId, Long assigneeId);

    @EntityGraph(attributePaths = {"relatesTo", "createdBy", "assignee"})
    List<Task> findByRelatesToId(Long relatesToId);
}
