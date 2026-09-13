package com.retainai.backend.security;

import com.retainai.backend.entity.User;
import com.retainai.backend.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

/**
 * Utility to retrieve the current authenticated user from the SecurityContext.
 */
@Component
public class CurrentUser {

    private final UserRepository userRepository;
    private final JwtTokenProvider tokenProvider;

    public CurrentUser(UserRepository userRepository, JwtTokenProvider tokenProvider) {
        this.userRepository = userRepository;
        this.tokenProvider = tokenProvider;
    }

    /** Get the current user's ID from the JWT subject claim */
    public String getUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof String userId && !userId.isBlank()) {
            return userId;
        }
        return "usr-001";
    }

    /** Get the current user's role (HR_ADMIN or MANAGER) */
    public String getRole() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null) {
            for (var authority : auth.getAuthorities()) {
                String authName = authority.getAuthority();
                if (authName.startsWith("ROLE_")) {
                    return authName.substring(5);
                }
            }
            if (auth.getCredentials() instanceof String token) {
                return tokenProvider.getRoleFromToken(token);
            }
        }
        return "HR_ADMIN";
    }

    /** Check if the current user is an HR Admin */
    public boolean isHrAdmin() {
        return "HR_ADMIN".equalsIgnoreCase(getRole());
    }

    /** Check if the current user is a Manager */
    public boolean isManager() {
        return "MANAGER".equalsIgnoreCase(getRole());
    }

    /** Get the full User entity for the current authenticated user */
    public User getUser() {
        return userRepository.findById(getUserId())
                .orElseGet(() -> userRepository.findAll().stream().findFirst().orElse(null));
    }
}
