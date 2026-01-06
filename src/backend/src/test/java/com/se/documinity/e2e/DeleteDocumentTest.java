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

import static org.junit.jupiter.api.Assertions.*;

public class DeleteDocumentTest extends BaseE2ETest {

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
                ps.executeUpdate();
            }
        } catch (Exception e) {
            System.err.println("Setup User Failed: " + e.getMessage());
        }
    }

    @Test
    void testCancelDeletion() {
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));

        // 1. Login
        login(wait);

        // 2. Navigate to "My Workspace"
        wait.until(ExpectedConditions.urlContains("/home"));
        driver.get("http://localhost:3000/home/myworkspace");

        // Wait for list to load
        wait.until(ExpectedConditions.or(
                ExpectedConditions.visibilityOfElementLocated(By.cssSelector("[data-testid^='document-card-']")),
                ExpectedConditions.textToBePresentInElementLocated(By.tagName("body"), "Cannot find any documents")));

        // 3. Ensure there is a document to delete
        ensureDocumentExists(wait);

        // 4. Find the first document card
        WebElement documentCard = wait.until(
                ExpectedConditions.visibilityOfElementLocated(By.cssSelector("[data-testid^='document-card-']")));
        String docIdAttr = documentCard.getAttribute("data-testid"); // e.g., document-card-123

        // Find the "3 dots" menu button inside this card's container
        // Note: The structure in Myworkspace.jsx puts the menu button inside the footer
        // which is a sibling of the Link that contains the data-testid logic
        // Wait, looking at Myworkspace.jsx:
        // <div className="... relative">
        // <Link ...> <div data-testid="document-card-..."> ... </div> </Link>
        // <div className="p-3 ..."> ... <button data-testid="document-menu-btn" ...>
        // </button> ... </div>
        // </div>
        // So the "document-card-ID" is INSIDE the Link, which is a sibling of the
        // footer div.
        // We need to find the specific menu button associated with THIS card.
        // Identify parent container first.

        WebElement cardContainer = documentCard.findElement(
                By.xpath("./ancestor::div[contains(@className, 'hover:ring-2') or contains(@class, 'hover:ring-2')]"));

        WebElement menuButton = cardContainer.findElement(By.cssSelector("[data-testid='document-menu-btn']"));

        // 5. Open Context Menu (Simulated Right Click logic via 3 dots)
        menuButton.click();

        // 6. Click Delete in the menu
        WebElement deleteOption = wait.until(
                ExpectedConditions.visibilityOfElementLocated(By.cssSelector("[data-testid='delete-document-btn']")));
        deleteOption.click();

        // 7. Click Cancel in Confirmation Dialog
        WebElement cancelButton = wait.until(
                ExpectedConditions.visibilityOfElementLocated(By.cssSelector("[data-testid='confirm-dialog-cancel']")));
        cancelButton.click();

        // 8. Verify Document Remains
        // Wait for dialog to disappear
        wait.until(ExpectedConditions.invisibilityOf(cancelButton));

        // Verify the card with same ID still exists
        List<WebElement> remainingCards = driver.findElements(By.cssSelector("[data-testid='" + docIdAttr + "']"));
        assertFalse(remainingCards.isEmpty(), "Document should remain after cancelling deletion");
    }

    private void login(WebDriverWait wait) {
        driver.get("http://localhost:3000/login");
        WebElement usernameField = wait.until(ExpectedConditions.visibilityOfElementLocated(By.name("username")));
        usernameField.sendKeys("todanh");
        driver.findElement(By.name("password")).sendKeys("123123");
        driver.findElement(By.xpath("//button[contains(., 'Log In')]")).click();
    }

    private void ensureDocumentExists(WebDriverWait wait) {
        List<WebElement> cards = driver.findElements(By.cssSelector("[data-testid^='document-card-']"));
        if (cards.isEmpty()) {
            // Click Add note (Sidebar)
            WebElement addNoteBtn = driver.findElement(By.xpath("//button[contains(., 'Add note')]"));
            addNoteBtn.click();

            // Wait for Modal
            WebElement titleInput = wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("title")));
            titleInput.sendKeys("Auto Test Doc " + System.currentTimeMillis());

            // Create
            WebElement createBtn = driver.findElement(By.xpath("//button[contains(., 'Create Note')]"));
            createBtn.click();

            // Wait for new card
            wait.until(
                    ExpectedConditions.visibilityOfElementLocated(By.cssSelector("[data-testid^='document-card-']")));
        }
    }
}
