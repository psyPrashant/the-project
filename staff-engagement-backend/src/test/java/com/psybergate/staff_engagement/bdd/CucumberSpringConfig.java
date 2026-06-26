package com.psybergate.staff_engagement.bdd;

import com.psybergate.staff_engagement.IntegrationTestBase;
import io.cucumber.spring.CucumberContextConfiguration;
import org.springframework.boot.test.context.SpringBootTest;

@CucumberContextConfiguration
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
public class CucumberSpringConfig extends IntegrationTestBase {
}
