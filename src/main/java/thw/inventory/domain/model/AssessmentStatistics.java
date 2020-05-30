package thw.inventory.domain.model;

import lombok.Getter;

@Getter
public class AssessmentStatistics {
    private final Long id;
    private final Long seen;
    private final Long count;

    public AssessmentStatistics(Long id, Long seen, Long count) {
        this.id = id;
        this.seen = seen;
        this.count = count;
    }
}
