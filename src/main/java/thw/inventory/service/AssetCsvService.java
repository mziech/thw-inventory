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

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.dataformat.csv.CsvMapper;
import com.fasterxml.jackson.dataformat.csv.CsvSchema;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import thw.inventory.domain.BatchProcessor;
import thw.inventory.domain.model.*;
import thw.inventory.domain.repository.AssessmentItemRepository;
import thw.inventory.domain.repository.AssessmentRepository;
import thw.inventory.domain.repository.AssetRepository;
import thw.inventory.domain.repository.NoteRepository;

import javax.servlet.ServletOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.nio.charset.Charset;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.time.format.FormatStyle;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
public class AssetCsvService {

    private static final DateTimeFormatter NOTE_DATE_FORMAT = DateTimeFormatter.ofLocalizedDateTime(FormatStyle.MEDIUM)
            .localizedBy(Locale.GERMAN);

    private static final ZoneId TZ = ZoneId.of("Europe/Berlin");

    private final AssessmentRepository assessmentRepository;

    private final AssessmentItemRepository assessmentItemRepository;

    private final AssetRepository assetRepository;

    private final NoteRepository noteRepository;

    private final ObjectMapper objectMapper;

    private final CsvMapper csvMapper;

    private final BatchProcessor batchProcessor;

    private final Charset csvCharset = Charset.forName("windows-1252");

    public AssetCsvService(AssessmentRepository assessmentRepository, AssessmentItemRepository assessmentItemRepository, AssetRepository assetRepository, NoteRepository noteRepository, ObjectMapper objectMapper, CsvMapper csvMapper, BatchProcessor batchProcessor) {
        this.assessmentRepository = assessmentRepository;
        this.assessmentItemRepository = assessmentItemRepository;
        this.assetRepository = assetRepository;
        this.noteRepository = noteRepository;
        this.objectMapper = objectMapper;
        this.csvMapper = csvMapper;
        this.batchProcessor = batchProcessor;
    }

    @Transactional(readOnly = true)
    public void generateCsv(long assessmentId, ServletOutputStream os) throws IOException {
        assessmentRepository.findById(assessmentId)
                .orElseThrow(() -> new IllegalArgumentException("Assessment does not exist: " + assessmentId));

        var schema = CsvSchema.builder()
                .addColumns(Arrays.stream(CsvColumn.values()).map(CsvColumn::getColumn).collect(Collectors.toList()), CsvSchema.ColumnType.STRING)
                .addArrayColumn("Vorgangskommentare", "\n\n")
                .addArrayColumn("Kommentare", "\n\n")
                .addColumn("Erfasst")
                .setUseHeader(true)
                .build();
        var writer = csvMapper.writer().with(schema).writeValues(new OutputStreamWriter(os, csvCharset));
        assessmentItemRepository.streamByAssessmentIdOrderByIdAsc(assessmentId).forEach(assessmentItem -> {
            var map = new HashMap<>();
            Arrays.stream(CsvColumn.values()).forEach(csvColumn -> {
                map.put(csvColumn.getColumn(), csvColumn.getGetter().apply(assessmentItem.getAsset()));
            });
            var notes = noteRepository.findAllByAssessmentIdInAndAssetId(assessmentId, assessmentItem.getAsset().getId(), PageRequest.of(0, 50));
            map.put("Vorgangskommentare", notes.stream()
                    .filter(note -> note.getAssessmentItem() != null && note.getType() == NoteType.COMMENT)
                    .map(this::noteToColumn)
                    .collect(Collectors.toList())
            );
            map.put("Kommentare", notes.stream()
                    .filter(note -> note.getAssessmentItem() == null && note.getType() == NoteType.COMMENT)
                    .map(this::noteToColumn)
                    .collect(Collectors.toList())
            );
            map.put("Erfasst", Optional.ofNullable(assessmentItem.getSeen()).map(b -> b ? "ja" : "nein").orElse(""));
            try {
                writer.write(map);
            } catch (IOException e) {
                try {
                    os.write("\nDATEN UNVOLLSTAENDIG\n".getBytes());
                } catch (IOException ignored) {}
                throw new IllegalStateException("Failed to write CSV for assessment item " + assessmentItem.getId(), e);
            }
        });
    }

    private String noteToColumn(Note note) {
        return Optional.ofNullable(note.getCreatedDate())
                .map(instant -> instant.atZone(TZ))
                .map(NOTE_DATE_FORMAT::format)
                .orElse("(null)") + " von " + note.getCreatedBy() + ": " +
                note.getText();
    }

    @Transactional
    public void importAssets(Long assessmentId, InputStream input) throws IOException {
        var assessment = Optional.ofNullable(assessmentId).flatMap(assessmentRepository::findById);

        var schema = CsvSchema.emptySchema().withHeader().withColumnSeparator(';').withQuoteChar('"');
        var reader = csvMapper.reader().with(schema).withValueToUpdate(new HashMap<>()).<Map<String, String>>readValues(new InputStreamReader(input, csvCharset));
        var batch = batchProcessor.start(20);
        reader.forEachRemaining(row -> {
            processLine(assessment.orElse(null), CsvColumn.sanitizeRow(row));
            batch.add();
        });
    }

    private void processLine(Assessment assessment, Map<String, String> row) {
        var inventoryId = row.get(CsvColumn.INVENTORY_NUMBER.getColumn());

        if (inventoryId == null) {
            log.warn("Skipping asset without inventory id: {}", row);
            return;
        }

        log.info("Processing CSV line with asset {}", inventoryId);
        var asset = assetRepository.findByInventoryId(inventoryId).orElseGet(Asset::new);
        row.forEach((k, v) ->
                CsvColumn.findByColumn(k).map(CsvColumn::getSetter).ifPresent(setter -> setter.accept(asset, v)));
        try {
            asset.setSource(objectMapper.writeValueAsString(new HashMap<>(row)));
        } catch (JsonProcessingException e) {
            throw new IllegalStateException("Could not encode row as JSON: " + row, e);
        }
        assetRepository.save(asset);

        if (assessment != null && assessmentItemRepository.findByAssetIdAndAssessmentId(asset.getId(), assessment.getId()).isEmpty()) {
            var assessmentItem = new AssessmentItem();
            assessmentItem.setAsset(asset);
            assessmentItem.setAssessment(assessment);
            assessmentItem.setSeen(false);
            assessmentItemRepository.save(assessmentItem);

            var note = new Note();
            note.setType(NoteType.IMPORTED);
            note.setAssessmentItem(assessmentItem);
            note.setAsset(asset);
            noteRepository.save(note);
        } else if (assessment == null) {
            var note = new Note();
            note.setType(NoteType.IMPORTED);
            note.setAsset(asset);
            noteRepository.save(note);
        }
    }

}
