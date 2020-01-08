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
package thw.inventory.domain;

import org.springframework.stereotype.Component;

import javax.persistence.EntityManager;

@Component
public class BatchProcessor {

    private final EntityManager entityManager;

    public BatchProcessor(EntityManager entityManager) {
        this.entityManager = entityManager;
    }

    public Process start(int batchSize) {
        return new Process(batchSize);
    }

    public class Process {
        private final int batchSize;

        private int current = 0;

        private Process(int batchSize) {
            this.batchSize = batchSize;
        }

        public void add() {
            if (++current > batchSize) {
                entityManager.flush();
                entityManager.clear();
                current = 0;
            }
        }
    }

}
