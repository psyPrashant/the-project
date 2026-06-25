package com.psybergate.staff_engagement.config;

import java.time.Clock;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Infrastructure beans shared across modules. Kept separate from {@code SecurityConfig} so that
 * the {@link Clock} bean (injected by {@code JwtService} and {@code GlobalExceptionHandler}) does
 * not create a constructor-injection cycle through the security filter chain.
 */
@Configuration
public class AppConfig {

	@Bean
	Clock clock() {
		return Clock.systemDefaultZone();
	}
}