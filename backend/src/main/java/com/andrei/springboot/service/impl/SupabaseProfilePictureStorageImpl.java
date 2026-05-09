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

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        ImageIO.write(resizedImage, "webp", baos);
        byte[] webpBytes = baos.toByteArray();
        
        String fileNmae = userId + "_" + System.currentTimeMillis() + ".webp";

        HttpClient client = HttpClient.newHttpClient();

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(supabaseUrl + "/storage/v1/object/" + profilePicturesBucket + "/" + fileNmae))
                .header("Authorization", "Bearer " + supabaseKey)
                .header("apikey", supabaseKey)
                .header("Content-Type", "image/webp")
                .PUT(HttpRequest.BodyPublishers.ofByteArray(webpBytes))
                .build();
            
        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

        if(response.statusCode() != 200 && response.statusCode() != 201) {
            throw new RuntimeException("Upload failed: " + response.body());
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