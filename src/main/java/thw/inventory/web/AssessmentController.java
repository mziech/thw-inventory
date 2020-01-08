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
package thw.inventory.web;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.web.bind.annotation.*;
import thw.inventory.domain.model.Assessment;
import thw.inventory.domain.model.Asset;
import thw.inventory.domain.model.Note;
import thw.inventory.service.AssessmentService;
import thw.inventory.service.AssetCsvService;
import thw.inventory.service.AssetSearchService;
import thw.inventory.service.NoteService;

import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.security.Principal;

@RestController
public class AssessmentController {

    private final AssessmentService assessmentService;

    private final NoteService noteService;

    private final AssetSearchService assetSearchService;

    private final AssetCsvService assetCsvService;

    public AssessmentController(AssessmentService assessmentService, NoteService noteService, AssetSearchService assetSearchService, AssetCsvService assetCsvService) {
        this.assessmentService = assessmentService;
        this.noteService = noteService;
        this.assetSearchService = assetSearchService;
        this.assetCsvService = assetCsvService;
    }

    @GetMapping("/api/assessments")
    public Page<Assessment> getById(@RequestParam(required = false, defaultValue = "false") boolean onlyOpen) {
        return assessmentService.findAll(onlyOpen);
    }

    @GetMapping("/api/assessments/{assessmentId}")
    public Assessment getById(@PathVariable long assessmentId) {
        return assessmentService.getById(assessmentId).orElse(null);
    }

    @GetMapping("/api/assessments/{assessmentId}/csv")
    public void exportCsv(@PathVariable long assessmentId, HttpServletResponse response) throws IOException {
        response.setContentType("text/csv");
        response.addHeader(HttpHeaders.CONTENT_DISPOSITION, "attachment;filename=assessment.csv");
        try (var os = response.getOutputStream()) {
            assetCsvService.generateCsv(assessmentId, os);
        }
    }

    @PostMapping("/api/assessments/{assessmentId}/close")
    public Assessment close(@PathVariable long assessmentId) {
        return assessmentService.close(assessmentId);
    }

    @PostMapping("/api/assessments/{assessmentId}/reopen")
    public Assessment reopen(@PathVariable long assessmentId) {
        return assessmentService.reopen(assessmentId);
    }

    @DeleteMapping("/api/assessments/{assessmentId}")
    public void delete(@PathVariable long assessmentId) {
        assessmentService.delete(assessmentId);
    }

    @PostMapping("/api/assessments")
    public Assessment create(@RequestBody Assessment assessment) {
        return assessmentService.create(assessment);
    }

    @PostMapping("/api/assessments/{assessmentId}/assets/{assetId}/seen")
    public void seen(@PathVariable long assessmentId, @PathVariable long assetId) {
        assessmentService.seen(assessmentId, assetId);
    }

    @GetMapping("/api/current-user/assessments/{assessmentId}/seen")
    public Page<Asset> getSeen(@PathVariable long assessmentId, Principal principal) {
        return assetSearchService.getSeenAssets(assessmentId, principal.getName());
    }

    @GetMapping("/api/assessments/{assessmentId}/unseen")
    public Page<Asset> getUnseen(@PathVariable long assessmentId, Pageable pageable) {
        return assetSearchService.getUnseenAssets(assessmentId, pageable);
    }

    @PostMapping("/api/assessments/{assessmentId}/assets/{assetId}/unseen")
    public void unseen(@PathVariable long assessmentId, @PathVariable long assetId) {
        assessmentService.unseen(assessmentId, assetId);
    }

    @GetMapping("/api/assessments/{assessmentId}/assets/{assetId}/notes")
    public Page<Note> getNotesById(@PathVariable long assessmentId, @PathVariable long assetId) {
        return noteService.getNotesForAssessment(assessmentId, assetId);
    }

    @PostMapping("/api/assessments/{assessmentId}/assets/{assetId}/notes")
    public Note createNote(@PathVariable long assessmentId, @PathVariable long assetId, @RequestBody Note note) {
        return noteService.createNote(assessmentId, assetId, note);
    }

}
