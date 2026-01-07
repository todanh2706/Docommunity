package com.se.documinity.service;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Value("${app.frontend-url:http://localhost:3000}")
    private String frontendUrl;

    public void sendSimpleMessage(String to, String subject, String text) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(to);
        message.setSubject(subject);
        message.setText(text);
        mailSender.send(message);
    }

    @Async
    public void sendNewPostNotification(String followerEmail, String followerName, 
                                         String authorName, String documentTitle, Long documentId) {
        String subject = "📝 " + authorName + " published a new post!";
        String documentUrl = frontendUrl + "/home/community/doc/" + documentId;
        
        String text = String.format(
            "Hi %s,\n\n" +
            "%s, whom you follow, just published a new post:\n\n" +
            "📄 \"%s\"\n\n" +
            "Check it out here: %s\n\n" +
            "Best regards,\n" +
            "Docommunity Team",
            followerName != null ? followerName : "there",
            authorName,
            documentTitle,
            documentUrl
        );

        try {
            sendSimpleMessage(followerEmail, subject, text);
        } catch (Exception e) {
            // Log error but don't fail the main operation
            System.err.println("Failed to send notification email to " + followerEmail + ": " + e.getMessage());
        }
    }

    @Async
    public void sendNewPostNotificationToFollowers(List<String[]> followers, String authorName, 
                                                    String documentTitle, Long documentId) {
        for (String[] follower : followers) {
            String email = follower[0];
            String name = follower[1];
            if (email != null && !email.isBlank()) {
                sendNewPostNotification(email, name, authorName, documentTitle, documentId);
            }
        }
    }
}