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
package thw.inventory.service;

import org.springframework.beans.BeanUtils;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import thw.inventory.domain.model.Assessment;
import thw.inventory.domain.model.AssessmentStatistics;
import thw.inventory.domain.model.Note;
import thw.inventory.domain.model.NoteType;
import thw.inventory.domain.repository.AssessmentItemRepository;
import thw.inventory.domain.repository.AssessmentRepository;
import thw.inventory.domain.repository.AssessmentStatisticsRepository;
import thw.inventory.domain.repository.NoteRepository;
import thw.inventory.error.AssessmentException;

import java.time.Instant;
import java.util.Map;
import java.util.Optional;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class AssessmentService {

    private final AssessmentRepository assessmentRepository;

    private final AssessmentItemRepository assessmentItemRepository;

    private final AssessmentStatisticsRepository assessmentStatisticsRepository;

    private final NoteRepository noteRepository;

    public AssessmentService(
            AssessmentRepository assessmentRepository,
            AssessmentItemRepository assessmentItemRepository,
            AssessmentStatisticsRepository assessmentStatisticsRepository,
            NoteRepository noteRepository
    ) {
        this.assessmentRepository = assessmentRepository;
        this.assessmentItemRepository = assessmentItemRepository;
        this.assessmentStatisticsRepository = assessmentStatisticsRepository;
        this.noteRepository = noteRepository;
    }

    @Transactional
    public Assessment create(Assessment assessment) {
        var newEntity = new Assessment();
        BeanUtils.copyProperties(assessment, newEntity, "id", "version", "createdDate", "createdBy");
        return assessmentRepository.save(newEntity);
    }

    @Transactional(readOnly = true)
    public Optional<Assessment> getById(long assessmentId) {
        return assessmentRepository.findById(assessmentId);
    }

    @Transactional
    public void delete(long assessmentId) {
        noteRepository.deleteByAssessmentItemAssessmentId(assessmentId);
        assessmentItemRepository.deleteByAssessmentId(assessmentId);
        assessmentRepository.deleteById(assessmentId);
    }

    @Transactional
    public Assessment close(long assessmentId) {
        var assessment = assessmentRepository.findById(assessmentId)
                .orElseThrow(() -> new IllegalStateException("Assessment not found: " + assessmentId));

        if (!assessment.getOpen()) {
            return assessment;
        }

        assessment.setOpen(false);
        assessment.setClosedDate(Instant.now());

        return assessmentRepository.save(assessment);
    }

    @Transactional
    public Assessment reopen(long assessmentId) {
        var assessment = assessmentRepository.findById(assessmentId)
                .orElseThrow(() -> new IllegalStateException("Assessment not found: " + assessmentId));

        if (assessment.getOpen()) {
            return assessment;
        }

        assessment.setOpen(true);
        assessment.setClosedDate(null);

        return assessmentRepository.save(assessment);
    }

    @Transactional
    public Assessment rename(long assessmentId, String name) {
        var assessment = assessmentRepository.findById(assessmentId)
                .orElseThrow(() -> new IllegalStateException("Assessment not found: " + assessmentId));

        assessment.setName(name);

        return assessmentRepository.save(assessment);
    }

    @Transactional(readOnly = true)
    public Page<Assessment> findAll(boolean onlyOpen) {
        var pageable = PageRequest.of(0, Integer.MAX_VALUE, Sort.Direction.DESC, "createdDate");
        if (onlyOpen) {
            return assessmentRepository.findAllByOpenIsTrue(pageable);
        }

        return assessmentRepository.findAll(pageable);
    }

    @Transactional
    public void seen(long assessmentId, long assetId) {
        var assessmentItem = assessmentItemRepository.findByAssetIdAndAssessmentId(assetId, assessmentId).orElseThrow(
                () -> new AssessmentException.NotFound(assessmentId, assetId)
        );

        if (!assessmentItem.getAssessment().getOpen()) {
            throw new AssessmentException.SeenClosed(assessmentId, assetId);
        }

        if (assessmentItem.getSeen()) {
            throw new AssessmentException.AlreadySeen(assessmentId, assetId);
        }

        assessmentItem.setSeen(true);
        var note = new Note();
        note.setType(NoteType.SEEN);
        note.setAssessmentItem(assessmentItem);
        note.setAsset(assessmentItem.getAsset());
        noteRepository.save(note);
    }

    @Transactional
    public void unseen(long assessmentId, long assetId) {
        var assessmentItem = assessmentItemRepository.findByAssetIdAndAssessmentId(assetId, assessmentId).orElseThrow(
                () -> new AssessmentException.NotFound(assessmentId, assetId)
        );

        assessmentItem.setSeen(false);
        try (var notes = noteRepository.streamByAssessmentItemIdAndAssetIdAndType(assessmentItem.getId(), assetId, NoteType.SEEN)) {
            notes.forEach(note -> note.setType(NoteType.UNSEEN));
        }
    }

    @Transactional(readOnly = true)
    public Map<Long, AssessmentStatistics> getStatistics() {
        return assessmentStatisticsRepository.getStatistics(null)
                .stream()
                .collect(Collectors.toMap(AssessmentStatistics::getId, Function.identity()));
    }

}
