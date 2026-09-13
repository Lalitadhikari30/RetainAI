package com.retainai.backend.service;

import com.retainai.backend.dto.LoginRequest;
import com.retainai.backend.dto.LoginResponse;
import com.retainai.backend.entity.User;
import com.retainai.backend.repository.UserRepository;
import com.retainai.backend.security.JwtTokenProvider;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtTokenProvider tokenProvider) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
    }

    public LoginResponse authenticate(LoginRequest request) {
        if (request == null || request.email() == null || request.password() == null) {
            throw new BadCredentialsException("Email and password are required");
        }

        String email = request.email().trim().toLowerCase();

        // 1. Strict database query against the 'users' table
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));

        // 2. Cryptographic verification using BCrypt
        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            log.warn("Failed authentication attempt for email: {}", email);
            throw new BadCredentialsException("Invalid email or password");
        }

        // 3. Issue signed JWT token containing user ID, role, and name claims
        String token = tokenProvider.generateToken(user.getId(), user.getRole(), user.getName());
        log.info("User {} ({}) successfully authenticated", user.getName(), user.getRole());

        return new LoginResponse(token, user.getRole(), user.getName());
    }
}
