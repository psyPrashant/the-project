package com.psybergate.staff_engagement.interaction;

import com.psybergate.staff_engagement.interaction.dto.InteractionFilter;
import java.util.List;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface InteractionRepository extends JpaRepository<Interaction, Long>, JpaSpecificationExecutor<Interaction> {

    List<Interaction> findBySubjectIdOrderByDateDesc(Long subjectId);

    List<Interaction> findByAuthorIdOrderByDateDesc(Long authorId);

    default List<Interaction> findBySubjectIdWithFilter(Long subjectId, InteractionFilter filter) {
        Specification<Interaction> spec = hasSubjectId(subjectId);
        if (filter.type() != null) {
            spec = spec.and(hasType(filter.type()));
        }
        if (filter.authorId() != null) {
            spec = spec.and(hasAuthorId(filter.authorId()));
        }
        if (filter.date() != null) {
            spec = spec.and(hasDate(filter.date()));
        }
        return findAll(spec, org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Order.desc("date")));
    }

    private static Specification<Interaction> hasSubjectId(Long subjectId) {
        return (root, query, cb) -> cb.equal(root.get("subject").get("id"), subjectId);
    }

    private static Specification<Interaction> hasAuthorId(Long authorId) {
        return (root, query, cb) -> cb.equal(root.get("author").get("id"), authorId);
    }

    private static Specification<Interaction> hasType(InteractionType type) {
        return (root, query, cb) -> cb.equal(root.get("type"), type);
    }

    private static Specification<Interaction> hasDate(java.time.LocalDate date) {
        return (root, query, cb) -> cb.equal(root.get("date"), date);
    }
}
