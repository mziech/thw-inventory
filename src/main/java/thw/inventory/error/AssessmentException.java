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
package thw.inventory.error;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

public abstract class AssessmentException extends RuntimeException {

    public final Long assessmentId;

    public final Long assetId;


    protected AssessmentException(String message, Long assessmentId, Long assetId) {
        super(String.format("%s: Assessment %d, Asset %d", message, assessmentId, assetId));
        this.assessmentId = assessmentId;
        this.assetId = assetId;
    }

    @ResponseStatus(HttpStatus.NOT_FOUND)
    public static class NotFound extends AssessmentException {
        public NotFound(Long assessmentId, Long assetId) {
            super("Assessment item not found", assessmentId, assetId);
        }
    }

    @ResponseStatus(HttpStatus.CONFLICT)
    public static class AlreadySeen extends AssessmentException {
        public AlreadySeen(Long assessmentId, Long assetId) {
            super("Assessment item was already seen", assessmentId, assetId);
        }
    }

    @ResponseStatus(HttpStatus.GONE)
    public static class SeenClosed extends AssessmentException {
        public SeenClosed(long assessmentId, long assetId) {
            super("Assessment is closed", assessmentId, assetId);
        }
    }
}
