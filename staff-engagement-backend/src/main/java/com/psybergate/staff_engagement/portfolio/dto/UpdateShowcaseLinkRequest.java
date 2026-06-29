package com.psybergate.staff_engagement.portfolio.dto;

import jakarta.validation.constraints.NotBlank;
import org.hibernate.validator.constraints.URL;

public record UpdateShowcaseLinkRequest(
        @NotBlank String label,
        @NotBlank @URL String url,
        Integer sortOrder
) {
}
