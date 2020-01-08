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
import org.springframework.web.bind.annotation.*;
import thw.inventory.domain.model.Asset;
import thw.inventory.domain.model.Note;
import thw.inventory.service.AssetSearchService;
import thw.inventory.service.NoteService;

import java.util.Optional;

@RestController
public class AssetController {

    private final AssetSearchService assetSearchService;

    private final NoteService noteService;

    public AssetController(AssetSearchService assetSearchService, NoteService noteService) {
        this.assetSearchService = assetSearchService;
        this.noteService = noteService;
    }

    @PostMapping("/api/assets/search")
    public Page<Asset> search(@RequestBody SearchCriteria searchRequest) {
        return assetSearchService.search(searchRequest);
    }

    @GetMapping("/api/assets/{assetId}")
    public Optional<Asset> getById(@PathVariable long assetId) {
        return assetSearchService.getById(assetId, null);
    }

    @GetMapping("/api/assessments/{assessmentId}/assets/{assetId}")
    public Optional<Asset> getById(@PathVariable long assessmentId, @PathVariable long assetId) {
        return assetSearchService.getById(assetId, assessmentId);
    }

    @GetMapping("/api/assets/{assetId}/notes")
    public Page<Note> getNotesById(@PathVariable long assetId) {
        return noteService.getNotesForAssetId(assetId);
    }

    @PostMapping("/api/assets/{assetId}/notes")
    public Note createNote(@PathVariable long assetId, @RequestBody Note note) {
        return noteService.createNote(null, assetId, note);
    }

}
