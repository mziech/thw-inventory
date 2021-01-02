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
package thw.inventory;

import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import thw.inventory.domain.model.Asset;
import thw.inventory.domain.repository.AssessmentItemRepository;
import thw.inventory.domain.repository.AssessmentRepository;
import thw.inventory.domain.repository.AssetRepository;
import thw.inventory.domain.repository.NoteRepository;

import java.util.concurrent.atomic.AtomicInteger;
import java.util.function.Consumer;

@Component
public class TestDb {

    private static final AtomicInteger MAX_INVENTORY_ID = new AtomicInteger();

    private final AssetRepository assetRepository;
    private final AssessmentItemRepository assessmentItemRepository;
    private final AssessmentRepository assessmentRepository;
    private final NoteRepository noteRepository;

    public TestDb(AssetRepository assetRepository, AssessmentItemRepository assessmentItemRepository, AssessmentRepository assessmentRepository, NoteRepository noteRepository) {
        this.assetRepository = assetRepository;
        this.assessmentItemRepository = assessmentItemRepository;
        this.assessmentRepository = assessmentRepository;
        this.noteRepository = noteRepository;
    }

    @Transactional
    public void clear() {
        noteRepository.deleteAll();
        assessmentItemRepository.deleteAll();
        assetRepository.deleteAll();
        assessmentRepository.deleteAll();
    }

    @Transactional
    public Asset createAsset(Consumer<Asset> modifier) {
        var asset = new Asset();
        asset.setInventoryId(String.format("%04d-%06d", 1, MAX_INVENTORY_ID.incrementAndGet()));
        asset.setDescription("Zahnstangenwinde, 2t");
        modifier.accept(asset);
        return assetRepository.save(asset);
    }


}
