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

import com.fasterxml.jackson.databind.node.ObjectNode;
import org.junit.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.security.test.context.support.WithMockUser;
import thw.inventory.ApplicationTest;
import thw.inventory.TestDb;

import static org.junit.Assert.assertEquals;

public class AssetControllerTest extends ApplicationTest {

    @Autowired
    private TestRestTemplate template;

    @Autowired
    private TestDb testDb;

    @Test
    public void search_asset_by_short_inventory_id() {
        testDb.clear();
        var expected = testDb.createAsset(asset -> asset.setInventoryId("0002-000123"));
        testDb.createAsset(asset -> {});

        var searchCriteria = new SearchCriteria();
        searchCriteria.setType(SearchCriteria.Type.INVENTORY_ID);
        searchCriteria.setValue("2-123");
        var response = template.postForEntity("/api/assets/search", searchCriteria, ObjectNode.class);
        assertEquals(HttpStatus.OK, response.getStatusCode());

        assertEquals(1, response.getBody().path("content").size());
        assertEquals(1, response.getBody().path("totalElements").intValue());
        assertEquals(expected.getId().longValue(), response.getBody().path("content").get(0).path("id").longValue());
    }

}
