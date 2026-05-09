package com.andrei.springboot.dto;

import java.time.OffsetDateTime;
import java.util.UUID;  

public class CreateMessageRequestDTO {

    private String content;

    public CreateMessageRequestDTO() {}

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }
}