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

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import thw.inventory.domain.model.AssessmentItem;

import java.util.Optional;
import java.util.stream.Stream;

public interface AssessmentItemRepository extends JpaRepository<AssessmentItem, Long> {
    Optional<AssessmentItem> findByAssetIdAndAssessmentId(Long assetId, Long assessmentId);

    @EntityGraph(attributePaths = {"asset"}, type = EntityGraph.EntityGraphType.FETCH)
    Stream<AssessmentItem> streamByAssessmentIdOrderByIdAsc(long assessmentId);

    void deleteByAssessmentId(long assessmentId);

}
