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
import thw.inventory.domain.model.AssessmentItem;
import thw.inventory.domain.model.Note;
import thw.inventory.domain.repository.AssessmentItemRepository;
import thw.inventory.domain.repository.AssetRepository;
import thw.inventory.domain.repository.NoteRepository;

@Service
public class NoteService {

    private final NoteRepository noteRepository;

    private final AssetRepository assetRepository;

    private final AssessmentItemRepository assessmentItemRepository;

    public NoteService(NoteRepository noteRepository, AssetRepository assetRepository, AssessmentItemRepository assessmentItemRepository) {
        this.noteRepository = noteRepository;
        this.assetRepository = assetRepository;
        this.assessmentItemRepository = assessmentItemRepository;
    }

    @Transactional(readOnly = true)
    public Page<Note> getNotesForAssetId(long assetId) {
        return noteRepository.findAllByAssetId(assetId, PageRequest.of(0, Integer.MAX_VALUE, Sort.Direction.DESC, "id"))
                .map(this::toNoteDto);
    }

    @Transactional(readOnly = true)
    public Page<Note> getNotesForAssessment(long assessmentId, long assetId) {
        return noteRepository.findAllByAssessmentIdInAndAssetId(assessmentId, assetId,
                PageRequest.of(0, Integer.MAX_VALUE, Sort.Direction.DESC, "id"))
                .map(this::toNoteDto);
    }

    @Transactional
    public Note createNote(Long assessmentId, long assetId, Note dto) {
        var note = new Note();
        note.setType(dto.getType());
        note.setText(dto.getText());
        note.setAsset(assetRepository.getOne(assetId));
        if (assessmentId != null) {
            note.setAssessmentItem(assessmentItemRepository.findByAssetIdAndAssessmentId(assetId, assessmentId)
                    .orElseThrow(() -> new IllegalArgumentException("Asset " + assetId + " not found in assessment" + assessmentId)));
        }
        return toNoteDto(noteRepository.save(note));
    }

    private Note toNoteDto(Note note) {
        var dto = new Note();
        BeanUtils.copyProperties(note, dto, "asset", "assessmentItem");
        dto.setAssessmentItem(new AssessmentItem());
        if (note.getAssessmentItem() != null) {
            dto.getAssessmentItem().setAssessment(new Assessment());
            dto.getAssessmentItem().getAssessment().setId(note.getAssessmentItem().getAssessment().getId());
            dto.getAssessmentItem().getAssessment().setName(note.getAssessmentItem().getAssessment().getName());
        }
        return dto;
    }
}
