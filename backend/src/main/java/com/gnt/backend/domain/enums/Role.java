package com.gnt.backend.domain.enums;

/** USER is a member; MODERATOR is the team; ADMIN is the owner. */
public enum Role {
    USER,
    MODERATOR,
    ADMIN;

    public boolean isStaff() {
        return this != USER;
    }
}
