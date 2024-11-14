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

import jakarta.persistence.EntityManager;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.stereotype.Repository;
import thw.inventory.domain.model.Asset;
import thw.inventory.web.SearchCriteria;

import java.util.List;
import java.util.Locale;
import java.util.regex.Pattern;

@Repository
public class AssetSearchRepository {

    private final Pattern INVENTORY_ID_PATTERN = Pattern.compile("^(\\d+)(-[sS]?)(\\d+)$");

    private final EntityManager entityManager;

    public AssetSearchRepository(EntityManager entityManager) {
        this.entityManager = entityManager;
    }

    public Page<Asset> search(SearchCriteria searchCriteria) {
        var pageable = searchCriteria.getPageable();

        var builder = entityManager.getCriteriaBuilder();
        var criteria = builder.createQuery(Asset.class);
        var asset = criteria.from(Asset.class);
        criteria.where(assetMatch(builder, asset, searchCriteria));
        criteria.select(asset);

        var query = entityManager.createQuery(criteria);

        List<Asset> resultList = query
                .setMaxResults(pageable.getPageSize())
                .setFirstResult((int) pageable.getOffset())
                .getResultList();
        return new PageImpl<>(
                resultList,
                pageable,
                resultList.size() >= pageable.getPageSize() ? getTotalCount(searchCriteria) : resultList.size()
        );
    }

    private Long getTotalCount(SearchCriteria searchCriteria) {
        var builder = entityManager.getCriteriaBuilder();
        var criteria = builder.createQuery(Long.class);
        var asset = criteria.from(Asset.class);
        criteria.where(assetMatch(builder, asset, searchCriteria));
        criteria.select(builder.count(asset));

        var query = entityManager.createQuery(criteria);

        return query.getSingleResult();
    }

    private Predicate assetMatch(CriteriaBuilder builder, Root<Asset> root, SearchCriteria searchCriteria) {
        var lowerValue = searchCriteria.getValue().toLowerCase(Locale.GERMAN);
        switch (searchCriteria.getType()) {
            case ANY_ID:
                return builder.or(
                        builder.equal(builder.lower(root.get("inventoryId")), lowerValue),
                        builder.equal(builder.lower(root.get("inventoryId")), sanitizeInventoryId(lowerValue)),
                        builder.equal(builder.lower(root.get("deviceId")), lowerValue)
                );
            case DESCRIPTION:
                return builder.like(builder.lower(root.get("description")), "%" + lowerValue + "%");
            case DEVICE_ID:
                return builder.equal(builder.lower(root.get("deviceId")), lowerValue);
            case INVENTORY_ID:
                return builder.or(
                        builder.equal(builder.lower(root.get("inventoryId")), lowerValue),
                        builder.equal(builder.lower(root.get("inventoryId")), sanitizeInventoryId(lowerValue))
                );
            case MANUFACTURER:
                return builder.like(builder.lower(root.get("manufacturer")), "%" + lowerValue + "%");
            case UNIT:
                return builder.like(builder.lower(root.get("unit")), "%" + lowerValue + "%");
            case PART_ID:
                return builder.equal(builder.lower(root.get("partId")), lowerValue);
        }
        throw new IllegalArgumentException("Unsupported search type: " + searchCriteria.getType());
    }

    private String sanitizeInventoryId(String input) {
        var matcher = INVENTORY_ID_PATTERN.matcher(input);
        if (!matcher.matches()) {
            return input;
        }

        return padLeftWith0(matcher.group(1), 4)
                + matcher.group(2)
                + padLeftWith0(matcher.group(3), 6);
    }

    private String padLeftWith0(String input, int length) {
        StringBuilder output = new StringBuilder(input);
        while (output.length() < length) {
            output.insert(0, "0");
        }
        return output.toString();
    }

}
