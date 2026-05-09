package com.andrei.springboot.model;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import java.io.Serializable;
import java.util.UUID;

@Embeddable
public class EventMemberId implements Serializable {

    @Column(name = "event_id")
    private UUID eventId;

    @Column(name = "profile_id")
    private UUID profileId;

    public EventMemberId() {}

    public EventMemberId(UUID eventId, UUID profileId) {
        this.eventId = eventId;
        this.profileId = profileId;
    }

    public UUID getEventId() { return eventId; }
    public UUID getProfileId() { return profileId; }
}