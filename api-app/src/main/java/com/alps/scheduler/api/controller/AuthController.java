package com.alps.scheduler.api.controller;

import com.alps.scheduler.api.model.User;
import com.alps.scheduler.api.security.JwtUtil;
import com.alps.scheduler.api.service.UserService;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Slf4j
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final JwtUtil jwtUtil;
    private final UserService userService;

    @Value("${google.oauth.client-id}")
    private String googleClientId;

    @PostMapping("/google")
    public ResponseEntity<?> authenticateWithGoogle(@RequestBody Map<String, String> request) {
        String googleToken = request.get("token");

        if (googleToken == null || googleToken.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Google token is required"));
        }

        try {
            // Verify Google ID token
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(
                    new NetHttpTransport(), GsonFactory.getDefaultInstance())
                    .setAudience(Collections.singletonList(googleClientId))
                    .build();

            GoogleIdToken idToken = verifier.verify(googleToken);

            if (idToken == null) {
                log.warn("Invalid Google token received");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Invalid Google token"));
            }

            GoogleIdToken.Payload payload = idToken.getPayload();
            String email = payload.getEmail();
            String name = (String) payload.get("name");
            String picture = (String) payload.get("picture");

            log.info("Google auth successful for email: {}", email);

            // Check if user exists in Users sheet and is enabled
            Optional<User> userOpt = userService.getUserByEmail(email);

            if (userOpt.isEmpty()) {
                log.warn("User not found in Users sheet: {}", email);
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "User not authorized. Please contact administrator."));
            }

            User user = userOpt.get();

            if (!"Enabled".equalsIgnoreCase(user.getStatus())) {
                log.warn("User account is disabled: {}", email);
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "User account is disabled. Please contact administrator."));
            }

            // Generate JWT token with user role
            String jwt = jwtUtil.generateToken(email, user.getRole(), user.getStatus());

            Map<String, Object> response = new HashMap<>();
            response.put("token", jwt);
            response.put("email", email);
            response.put("name", name);
            response.put("picture", picture);
            response.put("role", user.getRole());
            response.put("status", user.getStatus());

            log.info("JWT issued for user: {} with role: {}", email, user.getRole());
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Authentication error: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Authentication failed: " + e.getMessage()));
        }
    }

    @GetMapping("/validate")
    public ResponseEntity<?> validateToken(@RequestHeader("Authorization") String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("valid", false, "error", "Missing or invalid Authorization header"));
        }

        String token = authHeader.substring(7);

        try {
            if (jwtUtil.validateToken(token)) {
                String email = jwtUtil.extractEmail(token);
                String role = jwtUtil.extractRole(token);
                String status = jwtUtil.extractStatus(token);

                Map<String, Object> response = new HashMap<>();
                response.put("valid", true);
                response.put("email", email);
                response.put("role", role);
                response.put("status", status);

                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("valid", false, "error", "Token expired"));
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("valid", false, "error", "Invalid token"));
        }
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refreshToken(@RequestHeader("Authorization") String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Missing or invalid Authorization header"));
        }

        String token = authHeader.substring(7);

        try {
            String email = jwtUtil.extractEmail(token);
            String role = jwtUtil.extractRole(token);
            String status = jwtUtil.extractStatus(token);

            // Verify user is still active
            Optional<User> userOpt = userService.getUserByEmail(email);
            if (userOpt.isEmpty() || !"Enabled".equalsIgnoreCase(userOpt.get().getStatus())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "User account is no longer active"));
            }

            // Issue new token with updated role (in case it changed)
            User user = userOpt.get();
            String newToken = jwtUtil.generateToken(email, user.getRole(), user.getStatus());

            Map<String, Object> response = new HashMap<>();
            response.put("token", newToken);
            response.put("email", email);
            response.put("role", user.getRole());
            response.put("status", user.getStatus());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Token refresh failed"));
        }
    }
}
