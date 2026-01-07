package com.se.documinity.service;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;

@Service
public class FileStorageService {

    @Value("${app.upload-dir}")
    private String uploadDir;

    @Value("${app.avatar-base-url:https://docommunity-api.onrender.com/api/avatars}")
    private String avatarBaseUrl;

    public String saveAvatar(MultipartFile file, Long userId) {
        if (file.isEmpty()) {
            throw new RuntimeException("File is empty");
        }

        // Lấy extension
        String originalFilename = StringUtils.cleanPath(file.getOriginalFilename());
        String ext = "";
        int dotIndex = originalFilename.lastIndexOf('.');
        if (dotIndex >= 0) {
            ext = originalFilename.substring(dotIndex); // .png / .jpg
        }

        // Tạo tên file unique
        String filename = "avatar_" + userId + "_" + System.currentTimeMillis() + ext;

        try {
            Path uploadPath = Paths.get(uploadDir, "avatars");
            Files.createDirectories(uploadPath); // nếu chưa có thư mục thì tạo

            Path targetPath = uploadPath.resolve(filename).normalize();
            Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new RuntimeException("Failed to store avatar file", e);
        }

        // Trả về URL public
        return avatarBaseUrl + "/" + filename;
    }
}