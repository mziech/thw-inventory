/*
 * thw-inventory - An inventory query and assessment tool
 * Copyright © 2019 Marco Ziech (marco@ziech.net)
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */
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
