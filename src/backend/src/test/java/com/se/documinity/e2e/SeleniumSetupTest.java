package com.se.documinity.e2e;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.assertTrue;

public class SeleniumSetupTest extends BaseE2ETest {

    @Test
    void testGoogleNavigation() {
        driver.get("https://www.google.com");
        String title = driver.getTitle();
        System.out.println("Page Title: " + title);
        assertTrue(title.contains("Google"), "Title should contain 'Google'");
    }
}
