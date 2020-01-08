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

import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;
import thw.inventory.service.AssetCsvService;

import java.io.IOException;
import java.io.InputStream;

@RestController
public class ImportController {

    private final AssetCsvService assetCsvService;

    public ImportController(AssetCsvService assetCsvService) {
        this.assetCsvService = assetCsvService;
    }

    @PostMapping("/api/assets/import")
    public void importAssets(InputStream body) throws IOException {
        assetCsvService.importAssets(null, body);
    }

    @PostMapping("/api/assessments/{assessmentId}/assets/import")
    public void importAssessment(@PathVariable long assessmentId, InputStream body) throws IOException {
        assetCsvService.importAssets(assessmentId, body);
    }

}
