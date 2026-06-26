package com.psybergate.staff_engagement.interaction;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface InteractionRepository extends JpaRepository<Interaction, Long> {

    List<Interaction> findBySubjectIdOrderByDateDesc(Long subjectId);

    List<Interaction> findByAuthorIdOrderByDateDesc(Long authorId);
}
