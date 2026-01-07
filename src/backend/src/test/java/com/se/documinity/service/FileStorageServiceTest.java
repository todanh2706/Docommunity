package com.se.documinity.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.api.io.TempDir;
import org.mockito.InjectMocks;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.util.ReflectionTestUtils;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

import static org.junit.jupiter.api.Assertions.assertTrue;

@ExtendWith(MockitoExtension.class)
public class FileStorageServiceTest {

    @InjectMocks
    private FileStorageService fileStorageService;

    @TempDir
    Path tempDir;

    @BeforeEach
    public void setUp() {
        ReflectionTestUtils.setField(fileStorageService, "uploadDir", tempDir.toString());
        ReflectionTestUtils.setField(fileStorageService, "avatarBaseUrl", "https://docommunity-api.onrender.com/api/avatars");
    }

    @Test
    public void testSaveAvatar() throws IOException {
        MockMultipartFile file = new MockMultipartFile("file", "test.png", "image/png", "test content".getBytes());
        Long userId = 123L;

        String fileUrl = fileStorageService.saveAvatar(file, userId);

        assertTrue(fileUrl.startsWith("https://docommunity-api.onrender.com/api/avatars/avatar_123_"));
        assertTrue(fileUrl.endsWith(".png"));

        // Verify file exists
        Path avatarsDir = tempDir.resolve("avatars");
        assertTrue(Files.exists(avatarsDir));
        // We can't easily check the exact filename because of timestamp, but we can
        // check if directory is not empty
        assertTrue(Files.list(avatarsDir).count() > 0);
    }
}
