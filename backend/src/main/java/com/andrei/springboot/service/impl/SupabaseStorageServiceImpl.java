package com.andrei.springboot.service.impl;

import com.andrei.springboot.service.StorageService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

@Service("storageService")
public class SupabaseStorageServiceImpl implements StorageService {

    @Value("${supabase.url}")
    private String supabaseUrl;

    @Value("${supabase.apiKey}")
    private String supabaseKey;

    @Value("${supabase.bucketName}")
    private String bucketName;

    @Override
    public String uploadFile(MultipartFile file) throws Exception {

        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File is empty");
        }

        String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();

        HttpClient client = HttpClient.newHttpClient();

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(
                        supabaseUrl + "/storage/v1/object/" + bucketName + "/" + fileName))
                .header("Authorization", "Bearer " + supabaseKey)
                .header("apikey", supabaseKey)
                .header("Content-Type", file.getContentType())
                .PUT(HttpRequest.BodyPublishers.ofByteArray(file.getBytes()))
                .build();

        HttpResponse<String> response =
                client.send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() != 200 && response.statusCode() != 201) {
            throw new RuntimeException("Upload failed: " + response.body());
        }

        return supabaseUrl +
                "/storage/v1/object/public/" +
                bucketName +
                "/" +
                fileName;
    }

    @Override
    public void deleteFile(String path) {
        //Future impl for deteling a file from bucket
    }
}