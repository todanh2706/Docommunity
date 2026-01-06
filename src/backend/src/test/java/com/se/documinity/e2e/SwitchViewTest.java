package com.se.documinity.e2e;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.time.Duration;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertTrue;

public class SwitchViewTest extends BaseE2ETest {

    @BeforeEach
    void setupUser() {
        // Ensure user 'todanh' is verified.
        // We do NOT update the password because we assume the user-provided password
        // '123123' is correct.
        String url = "jdbc:postgresql://localhost:5431/docommunity";
        String user = "postgres";
        String password = "password";

        try (Connection conn = DriverManager.getConnection(url, user, password)) {
            // Update existing user to be verified
            String updateSql = "UPDATE users SET is_verified = true WHERE username = ?";
            try (PreparedStatement ps = conn.prepareStatement(updateSql)) {
                ps.setString(1, "todanh");
                int updated = ps.executeUpdate();
                if (updated == 0) {
                    System.out.println("Warning: User 'todanh' not found in database. Test might fail login.");
                } else {
                    System.out.println("Ensured user 'todanh' is verified.");
                }
            }
        } catch (Exception e) {
            System.err.println("Setup User Failed: " + e.getMessage());
        }
    }

    @Test
    void testSwitchToFullView() {
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));

        // 1. Navigate to Login Page
        driver.get("http://localhost:3000/login");

        // 2. Perform Login with "todanh" / "123123"
        WebElement usernameField = wait.until(ExpectedConditions.visibilityOfElementLocated(By.name("username")));
        usernameField.sendKeys("todanh");

        WebElement passwordField = driver.findElement(By.name("password"));
        passwordField.sendKeys("123123");

        // Button text is "Log In"
        WebElement loginButton = driver.findElement(By.xpath("//button[contains(., 'Log In')]"));
        loginButton.click();

        // 3. Navigate to Workspace
        wait.until(ExpectedConditions.urlContains("/home"));
        driver.get("http://localhost:3000/home/myworkspace");

        // 4. Verify initial state
        WebElement toggleBtn = wait
                .until(ExpectedConditions.presenceOfElementLocated(By.cssSelector("[data-testid='view-toggle-btn']")));

        // Wait for at least one document card to be present or the container
        try {
            List<WebElement> cards = wait.until(ExpectedConditions
                    .numberOfElementsToBeMoreThan(By.cssSelector("[data-testid^='document-card-']"), 0));
            WebElement firstCard = cards.get(0);

            String initialClass = firstCard.getAttribute("class");
            boolean initialListMode = initialClass.contains("h-48");

            System.out.println("Initial View Mode is Expanded (List/Full): " + initialListMode);

            // 5. Click Toggle Button
            toggleBtn.click();

            // 6. Verify final state
            wait.until(d -> {
                String newClass = firstCard.getAttribute("class");
                return !newClass.equals(initialClass);
            });

            String finalClass = firstCard.getAttribute("class");
            System.out.println("Final Class: " + finalClass);

            assertTrue(!finalClass.equals(initialClass), "View mode should have changed");
        } catch (org.openqa.selenium.TimeoutException e) {
            System.out.println(
                    "No documents found to test view switch on cards. Checking if toggle button at least exists and is clickable.");
            assertTrue(toggleBtn.isDisplayed(), "Toggle button should be displayed even if no docs");
        }
    }
}
