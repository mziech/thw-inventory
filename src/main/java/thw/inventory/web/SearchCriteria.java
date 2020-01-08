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

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class SearchCriteria {
    private Type type;
    private String value;
    private Long assessmentId;

    public Pageable getPageable() {
        return PageRequest.of(0, 100);
    }

    public static enum Type {
        ANY_ID,
        INVENTORY_ID,
        DEVICE_ID,
        DESCRIPTION,
        MANUFACTURER,
        PART_ID,
        UNIT,
    }
}
