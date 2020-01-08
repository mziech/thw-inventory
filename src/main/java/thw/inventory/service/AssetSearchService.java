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
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import thw.inventory.domain.model.AssessmentItem;
import thw.inventory.domain.model.Asset;
import thw.inventory.domain.repository.AssessmentItemRepository;
import thw.inventory.domain.repository.AssetRepository;
import thw.inventory.domain.repository.AssetSearchRepository;
import thw.inventory.web.SearchCriteria;

import java.util.Optional;

@Service
public class AssetSearchService {

    private final AssetRepository assetRepository;

    private final AssessmentItemRepository assessmentItemRepository;

    private final AssetSearchRepository assetSearchRepository;

    public AssetSearchService(AssetRepository assetRepository, AssessmentItemRepository assessmentItemRepository, AssetSearchRepository assetSearchRepository) {
        this.assetRepository = assetRepository;
        this.assessmentItemRepository = assessmentItemRepository;
        this.assetSearchRepository = assetSearchRepository;
    }

    @Transactional(readOnly = true)
    public Optional<Asset> getById(Long assetId, Long assessmentId) {
        if (assessmentId == null) {
            return assetRepository.findById(assetId);
        } else {
            return assessmentItemRepository.findByAssetIdAndAssessmentId(assetId, assessmentId)
                    .map(AssessmentItem::getAsset);
        }
    }

    @Transactional(readOnly = true)
    public Page<Asset> search(SearchCriteria searchRequest) {
        return assetSearchRepository.search(searchRequest)
                .map(this::toAssetDto);
    }

    @Transactional(readOnly = true)
    public Page<Asset> getSeenAssets(long assessmentId, String username) {
        return assetRepository.findSeen(assessmentId, username, PageRequest.of(0, 100)).map(this::toAssetDto);
    }

    @Transactional(readOnly = false)
    public Page<Asset> getUnseenAssets(long assessmentId, Pageable pageable) {
        return assetRepository.findUnseen(assessmentId, pageable).map(this::toAssetDto);
    }

    private Asset toAssetDto(Asset asset) {
        var dto = new Asset();
        BeanUtils.copyProperties(asset, dto, "notes");
        return dto;
    }
}
