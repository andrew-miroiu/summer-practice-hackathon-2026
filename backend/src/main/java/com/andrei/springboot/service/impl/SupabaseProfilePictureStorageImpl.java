package com.andrei.springboot.service.impl;

import com.andrei.springboot.service.StorageService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import jakarta.annotation.PostConstruct;
import java.io.IOException;

import com.andrei.springboot.security.CustomUserDetails;
import org.springframework.security.core.context.SecurityContextHolder;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

import javax.imageio.ImageIO;
import java.awt.Graphics2D;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import org.imgscalr.Scalr;

@Service("profilePictureStorageService")
public class SupabaseProfilePictureStorageImpl implements StorageService {

    @Value("${supabase.url}")
    private String supabaseUrl;

    @Value("${supabase.apiKey}")
    private String supabaseKey;

    @Value("${supabase.bucketName}")
    private String bucketName;

    private String profilePicturesBucket;

    @PostConstruct
    public void init() {
        this.profilePicturesBucket = bucketName + "/profile_pictures";
    }

    @Override
    public String uploadFile(MultipartFile file) throws Exception {
    
        //get user id from security context without import
        CustomUserDetails userDetails = (CustomUserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        String userId = userDetails.getId().toString();

        if(file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File is empty");
        }

        BufferedImage originalImage = ImageIO.read(file.getInputStream());

        if (originalImage == null) {
            throw new IllegalArgumentException("Could not read image — unsupported format");
        }

        int maxSize = 512;

        BufferedImage resizedImage;

        if (originalImage.getWidth() > maxSize || originalImage.getHeight() > maxSize) {
            resizedImage = Scalr.resize(
                    originalImage,
                    Scalr.Method.QUALITY,
                    Scalr.Mode.AUTOMATIC,
                    maxSize,
                    maxSize
            );
        } else {
            resizedImage = originalImage;
        }

        // JPEG does not support alpha channel — convert to RGB if needed
        if (resizedImage.getType() != BufferedImage.TYPE_INT_RGB) {
            BufferedImage rgbImage = new BufferedImage(
                    resizedImage.getWidth(), resizedImage.getHeight(), BufferedImage.TYPE_INT_RGB);
            Graphics2D g = rgbImage.createGraphics();
            g.drawImage(resizedImage, 0, 0, java.awt.Color.WHITE, null);
            g.dispose();
            resizedImage = rgbImage;
        }

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        boolean written = ImageIO.write(resizedImage, "jpeg", baos);
        if (!written) {
            throw new RuntimeException("Failed to encode image as JPEG");
        }
        byte[] imageBytes = baos.toByteArray();

        String fileNmae = userId + "_" + System.currentTimeMillis() + ".jpg";

        HttpClient client = HttpClient.newHttpClient();

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(supabaseUrl + "/storage/v1/object/" + profilePicturesBucket + "/" + fileNmae))
                .header("Authorization", "Bearer " + supabaseKey)
                .header("apikey", supabaseKey)
                .header("Content-Type", "image/jpeg")
                .PUT(HttpRequest.BodyPublishers.ofByteArray(imageBytes))
                .header("x-upsert", "true")
                .build();

        HttpResponse<String> uploadResponse = client.send(request, HttpResponse.BodyHandlers.ofString());

        if (uploadResponse.statusCode() != 200 && uploadResponse.statusCode() != 201) {
            throw new RuntimeException("Upload failed: " + uploadResponse.body());
        }

        return supabaseUrl + "/storage/v1/object/public/" + profilePicturesBucket + "/" + fileNmae;
    }

    @Override
    public void deleteFile(String path) {

        HttpClient client = HttpClient.newHttpClient();

        try {
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(supabaseUrl + "/storage/v1/object/" + profilePicturesBucket + "/" + path))
                    .header("Authorization", "Bearer " + supabaseKey)
                    .header("apikey", supabaseKey)
                    .DELETE()
                    .build();

            HttpResponse<String> response =
                    client.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() != 200 && response.statusCode() != 204) {
                throw new RuntimeException("Delete failed: " + response.body());
            }
        } catch (IOException | InterruptedException e) {
            throw new RuntimeException("Failed to delete file", e);
        }
    }

}