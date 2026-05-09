package com.andrei.springboot.controller;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.andrei.springboot.dto.CreateConversationRequestDTO;
import com.andrei.springboot.dto.ConversationResponseDTO;
import com.andrei.springboot.security.CustomUserDetails;
import com.andrei.springboot.service.ConversationService;

@RestController
@RequestMapping("/api/conversations")
public class ConversationController {

    private final ConversationService conversationService;

    public ConversationController(ConversationService conversationService) {
        this.conversationService = conversationService;
    }

    @PostMapping()
    public ConversationResponseDTO createConversation(@RequestBody CreateConversationRequestDTO request,
        @AuthenticationPrincipal CustomUserDetails user) {
        return conversationService.createConversation(user.getId(), request.getParticipantId());
    }

}