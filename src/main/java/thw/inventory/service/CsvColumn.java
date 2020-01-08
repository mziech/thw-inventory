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

import lombok.Getter;
import thw.inventory.domain.model.Asset;

import java.util.Map;
import java.util.Optional;
import java.util.function.BiConsumer;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Getter
public enum CsvColumn {
    INVENTORY_NUMBER("Inventarnr.", Asset::setInventoryId, Asset::getInventoryId),
    MANUFACTURER("Hersteller", Asset::setManufacturer, Asset::getManufacturer),
    DESCRIPTION("Ausstattung", Asset::setDescription, Asset::getDescription),
    UNIT("AN/Einheit", Asset::setUnit, Asset::getUnit),
    PART_ID("Sachnummer", Asset::setPartId, Asset::getPartId),
    DEVICE_ID("Gerätenr.", Asset::setDeviceId, Asset::getDeviceId),
    ;

    private static final Map<String, CsvColumn> COLUMNS = Stream.of(values())
            .collect(Collectors.toMap(CsvColumn::getColumn, Function.identity()));

    private final String column;
    private final BiConsumer<Asset, String> setter;
    private final Function<Asset, String> getter;

    CsvColumn(String column, BiConsumer<Asset, String> setter, Function<Asset, String> getter) {
        this.column = column;
        this.setter = setter;
        this.getter = getter;
    }

    public static Optional<CsvColumn> findByColumn(String column) {
        return Optional.ofNullable(COLUMNS.get(column));
    }

}
