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
import thw.inventory.domain.model.Note;
import thw.inventory.domain.model.NoteType;

import java.util.stream.Stream;

public interface NoteRepository extends JpaRepository<Note, Long> {

    Page<Note> findAllByAssetId(long assetId, Pageable pageable);

    Page<Note> findAllByAssessmentItemAssessmentIdAndTypeAndCreatedBy(long assessmentId, NoteType type, String username, Pageable pageable);

    @Query("select n from Note n left join n.assessmentItem ai where (ai is null or ai.assessment.id = ?1) and n.asset.id = ?2")
    Page<Note> findAllByAssessmentIdInAndAssetId(long assessmentId, long assetId, Pageable pageable);

    void deleteByAssessmentItemAssessmentId(long assessmentId);

    Stream<Note> streamByAssessmentItemIdAndAssetIdAndType(long assessmentItemId, long assetId, NoteType type);

}
