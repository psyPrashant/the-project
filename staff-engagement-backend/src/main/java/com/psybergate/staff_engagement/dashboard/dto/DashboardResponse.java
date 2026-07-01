package com.psybergate.staff_engagement.dashboard.dto;

import java.util.List;

public record DashboardResponse(
        WorkforcePulseResponse workforcePulse,
        List<ActionNeededItemResponse> actionNeeded,
        List<ActivityItemResponse> recentActivity,
        SkillCoverageResponse skillCoverage,
        MeSummaryResponse me
) {
}
