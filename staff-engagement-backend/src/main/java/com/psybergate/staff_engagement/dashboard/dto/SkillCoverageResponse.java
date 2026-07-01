package com.psybergate.staff_engagement.dashboard.dto;

import java.util.List;

public record SkillCoverageResponse(
        List<SkillCoverageItemResponse> topSkills,
        List<SkillCoverageItemResponse> orphanedSkills
) {
}
