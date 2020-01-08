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

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import thw.inventory.domain.model.Asset;

import java.util.Optional;

public interface AssetRepository extends JpaRepository<Asset, Long> {
    Optional<Asset> findByInventoryId(String inventoryId);

    @Query("select a from Asset a" +
            " join Note n on n.asset = a and n.type = 'SEEN' and n.createdBy = ?2" +
            " join n.assessmentItem" +
            " where n.assessmentItem.assessment.id = ?1" +
            " order by n.id desc")
    Page<Asset> findSeen(long assessmentId, String username, Pageable pageable);

    @Query("select a from Asset a" +
            " join AssessmentItem ai on ai.asset = a and ai.assessment.id = ?1" +
            " where ai.seen = false" +
            " order by a.description asc, a.id asc")
    Page<Asset> findUnseen(long assessmentId, Pageable pageable);
}
