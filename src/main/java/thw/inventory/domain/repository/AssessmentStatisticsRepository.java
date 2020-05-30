package thw.inventory.domain.repository;

import org.springframework.stereotype.Repository;
import thw.inventory.domain.model.AssessmentItem;
import thw.inventory.domain.model.AssessmentStatistics;

import javax.persistence.EntityManager;
import java.util.Collection;
import java.util.Collections;

@Repository
public class AssessmentStatisticsRepository {

    private final EntityManager entityManager;

    public AssessmentStatisticsRepository(EntityManager entityManager) {
        this.entityManager = entityManager;
    }

    public Collection<AssessmentStatistics> getStatistics(Collection<Long> ids) {
        if (ids != null && ids.isEmpty()) {
            return Collections.emptyList();
        }

        var builder = entityManager.getCriteriaBuilder();
        var query = builder.createQuery(AssessmentStatistics.class);
        var assessmentItemRoot = query.from(AssessmentItem.class);
        query.multiselect(
                assessmentItemRoot.get("assessment").get("id"),
                builder.sum(assessmentItemRoot.get("seen").as(Long.class)),
                builder.count(assessmentItemRoot)
        );
        if (ids != null) {
            query.where(assessmentItemRoot.get("assessment").get("id").in(ids));
        }
        query.groupBy(assessmentItemRoot.get("assessment").get("id"));
        return entityManager.createQuery(query).getResultList();
    }
}
