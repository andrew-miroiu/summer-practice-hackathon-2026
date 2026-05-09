package com.andrei.springboot.model;

import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "event_members")
public class EventMember {

    @EmbeddedId
    private EventMemberId id;

    @Column(name = "is_captain")
    private Boolean isCaptain = false;

    public EventMember() {}

    public EventMember(UUID eventId, UUID profileId, Boolean isCaptain) {
        this.id = new EventMemberId(eventId, profileId);
        this.isCaptain = isCaptain;
    }

    public UUID getEventId() { return id.getEventId(); }
    public UUID getProfileId() { return id.getProfileId(); }
    public Boolean getIsCaptain() { return isCaptain; }
    public void setIsCaptain(Boolean isCaptain) { this.isCaptain = isCaptain; }
}