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
package thw.inventory.domain.model;

import jakarta.persistence.*;
import lombok.Data;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;

@Entity
@EntityListeners(AuditingEntityListener.class)
@Data
public class Note {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Version
    private Integer version;

    @ManyToOne
    @JoinColumn(foreignKey = @ForeignKey(name = "FK_note_assessment_item"))
    private AssessmentItem assessmentItem;

    @ManyToOne(optional = false)
    @JoinColumn(foreignKey = @ForeignKey(name = "FK_note_asset"))
    private Asset asset;

    @Column(length = 32)
    @Enumerated(EnumType.STRING)
    private NoteType type;

    @Column(columnDefinition = "text")
    private String text;

    @Column
    @CreatedDate
    private Instant createdDate;

    @Column
    @CreatedBy
    private String createdBy;

    @Column
    @LastModifiedDate
    private Instant lastModifiedDate;

    @Column
    @LastModifiedBy
    private String lastModifiedBy;

}
