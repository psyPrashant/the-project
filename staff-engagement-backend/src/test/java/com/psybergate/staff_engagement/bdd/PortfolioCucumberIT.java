package com.psybergate.staff_engagement.bdd;

import com.psybergate.staff_engagement.IntegrationTestBase;
import io.cucumber.junit.platform.engine.Constants;
import org.junit.platform.suite.api.ConfigurationParameter;
import org.junit.platform.suite.api.IncludeEngines;
import org.junit.platform.suite.api.SelectClasspathResource;
import org.junit.platform.suite.api.Suite;

@Suite
@IncludeEngines("cucumber")
@SelectClasspathResource("features/portfolio.feature")
@ConfigurationParameter(key = Constants.GLUE_PROPERTY_NAME, value = "com.psybergate.staff_engagement.bdd.steps")
@ConfigurationParameter(key = Constants.FILTER_TAGS_PROPERTY_NAME, value = "@portfolio")
public class PortfolioCucumberIT extends IntegrationTestBase {
}
