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

import static org.junit.jupiter.api.Assertions.assertTrue;

public class AddCommentTest extends BaseE2ETest {

    @BeforeEach
    void setupUser() {
        // Ensure user 'todanh' is verified.
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
    void testAddComment() {
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));

        // 1. Navigate to Login Page
        driver.get("http://localhost:3000/login");

        // 2. Perform Login with "todanh" / "123123"
        WebElement usernameField = wait.until(ExpectedConditions.visibilityOfElementLocated(By.name("username")));
        usernameField.sendKeys("todanh");

        WebElement passwordField = driver.findElement(By.name("password"));
        passwordField.sendKeys("123123");

        WebElement loginButton = driver.findElement(By.xpath("//button[contains(., 'Log In')]"));
        loginButton.click();

        // 3. Navigate to Workspace/Community
        wait.until(ExpectedConditions.urlContains("/home"));
        driver.get("http://localhost:3000/home/community");

        // 4. Click Comment Icon on the first document card
        // Wait for at least one document card with a comment button
        WebElement commentButton = wait
                .until(ExpectedConditions.visibilityOfElementLocated(By.cssSelector("[data-testid='comment-button']")));
        commentButton.click();

        // 5. Wait for Comment Input to be visible (navigated to document detail)
        WebElement commentInput = wait
                .until(ExpectedConditions.visibilityOfElementLocated(By.cssSelector("[data-testid='comment-input']")));

        // 6. Type "Review this"
        String commentText = "Review this - " + System.currentTimeMillis(); // Adding timestamp to make it unique
        commentInput.sendKeys(commentText);

        // 7. Click Post
        WebElement postButton = driver.findElement(By.cssSelector("[data-testid='comment-submit-btn']"));
        postButton.click();

        // 8. Expected Result: Comment is saved and displayed in panel.
        // Wait for the comment to appear in the list
        wait.until(ExpectedConditions.textToBePresentInElementLocated(By.cssSelector("[data-testid='comment-item']"),
                commentText));

        // Verify visually/logically
        boolean commentFound = driver.getPageSource().contains(commentText);
        assertTrue(commentFound, "The new comment should be displayed.");
    }

    @Test
    void testEmptyCommentValidation() {
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));

        // 1. Navigate to Login Page
        driver.get("http://localhost:3000/login");

        // 2. Perform Login with "todanh" / "123123"
        WebElement usernameField = wait.until(ExpectedConditions.visibilityOfElementLocated(By.name("username")));
        usernameField.sendKeys("todanh");

        WebElement passwordField = driver.findElement(By.name("password"));
        passwordField.sendKeys("123123");

        WebElement loginButton = driver.findElement(By.xpath("//button[contains(., 'Log In')]"));
        loginButton.click();

        // 3. Navigate to Workspace/Community
        wait.until(ExpectedConditions.urlContains("/home"));
        driver.get("http://localhost:3000/home/community");

        // 4. Click Comment Icon on the first document card
        WebElement commentButton = wait
                .until(ExpectedConditions.visibilityOfElementLocated(By.cssSelector("[data-testid='comment-button']")));
        commentButton.click();

        // 5. Wait for Comment Input to be visible
        WebElement commentInput = wait
                .until(ExpectedConditions.visibilityOfElementLocated(By.cssSelector("[data-testid='comment-input']")));

        // Ensure input is empty (it should be new)
        commentInput.clear();

        // 6. Click Post without typing
        WebElement postButton = driver.findElement(By.cssSelector("[data-testid='comment-submit-btn']"));
        postButton.click();

        // 7. Expected Result: System displays "Comment cannot be empty"
        WebElement errorMessage = wait
                .until(ExpectedConditions.visibilityOfElementLocated(By.cssSelector("[data-testid='comment-error']")));
        String errorText = errorMessage.getText();

        assertTrue(errorText.contains("Comment cannot be empty"), "Error message should be 'Comment cannot be empty'");
    }
}
