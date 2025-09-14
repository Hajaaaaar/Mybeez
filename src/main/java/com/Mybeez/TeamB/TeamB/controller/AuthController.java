package com.Mybeez.TeamB.TeamB.controller;

import com.Mybeez.TeamB.TeamB.model.PasswordResetToken;
import com.Mybeez.TeamB.TeamB.model.User;
import com.Mybeez.TeamB.TeamB.model.UserProfile;
import com.Mybeez.TeamB.TeamB.model.UserRole;
import com.Mybeez.TeamB.TeamB.payload.JwtAuthenticationResponse;
import com.Mybeez.TeamB.TeamB.payload.LoginRequest;
import com.Mybeez.TeamB.TeamB.payload.SignUpRequest;
import com.Mybeez.TeamB.TeamB.repository.PasswordResetTokenRepository;
import com.Mybeez.TeamB.TeamB.repository.UserRepository;
import com.Mybeez.TeamB.TeamB.security.JwtTokenProvider;
import jakarta.mail.internet.MimeMessage;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Date;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired private AuthenticationManager authenticationManager;
    @Autowired private UserRepository userRepository;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private JwtTokenProvider tokenProvider;
    @Autowired private JavaMailSender mailSender;
    @Autowired private PasswordResetTokenRepository tokenRepository;

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        // normalise email to avoid case/whitespace mismatches
        String email = loginRequest.getEmail().trim().toLowerCase();
        Optional<User> optionalUser = userRepository.findByEmail(email);

        if (optionalUser.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Invalid email or password."));
        }

        User user = optionalUser.get();

        if (user.isBanned()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Your account has been banned. Please contact support."));
        }

        if (user.isDeleted()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Your account has been deleted."));
        }

        if (!user.isActive()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Your account is inactive."));
        }

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = tokenProvider.generateToken(authentication);

        // principal is your User entity (implements UserDetails)
        User currentUser = (User) authentication.getPrincipal();

        // return a clean role for the frontend (ADMIN/HOST/USER)
        String role = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)                 // e.g. ROLE_ADMIN
                .map(a -> a.startsWith("ROLE_") ? a.substring(5) : a) // -> ADMIN
                .findFirst()
                .orElse("USER");

        return ResponseEntity.ok(new JwtAuthenticationResponse(
                jwt,
                currentUser.getId(),
                currentUser.getEmail(),
                currentUser.getFirstName(),
                role
        ));
    }

    @GetMapping("/me")
    public ResponseEntity<?> me(Authentication auth) {
        if (auth == null || !auth.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Not authenticated"));
        }
        User u = userRepository.findByEmail(auth.getName()).orElseThrow();
        return ResponseEntity.ok(Map.of(
                "id", u.getId(),
                "email", u.getEmail(),
                "firstName", u.getFirstName(),
                "role", u.getRole().name()
        ));
    }

    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(@Valid @RequestBody SignUpRequest signUpRequest) {
        String email = signUpRequest.getEmail().trim().toLowerCase();
        if (userRepository.existsByEmail(email)) {
            return new ResponseEntity<>(Map.of("message", "Error: Email is already in use!"), HttpStatus.BAD_REQUEST);
        }

        User user = new User();
        user.setFirstName(signUpRequest.getFirstName());
        user.setLastName(signUpRequest.getLastName());
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(signUpRequest.getPassword()));
        user.setRole(UserRole.USER);

        // status + timestamps
        user.setActive(true);
        user.setBanned(false);
        user.setDeleted(false);
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());
        user.setRegistrationDate(LocalDateTime.now());

        UserProfile userProfile = new UserProfile();
        user.setUserProfile(userProfile);
        userProfile.setUser(user);

        userRepository.save(user);

        return new ResponseEntity<>(Map.of("message", "User registered successfully!"), HttpStatus.CREATED);
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        if (email != null) email = email.trim().toLowerCase();
        Optional<User> userOptional = userRepository.findByEmail(email);

        if (userOptional.isPresent()) {
            User user = userOptional.get();
            String token = UUID.randomUUID().toString();

            PasswordResetToken passwordResetToken = tokenRepository.findByUserId(user.getId());
            if (passwordResetToken == null) {
                passwordResetToken = new PasswordResetToken();
                passwordResetToken.setUser(user);
            }

            passwordResetToken.setToken(token);
            passwordResetToken.setExpiryDate(new Date(System.currentTimeMillis() + 3600000)); // 1 hour
            tokenRepository.save(passwordResetToken);

            try {
                MimeMessage mimeMessage = mailSender.createMimeMessage();
                MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, "utf-8");

                String htmlContent = buildHtmlEmail(user.getFirstName(), token);

                helper.setText(htmlContent, true);
                helper.setTo(user.getEmail());
                helper.setSubject("Password Reset Request for Mybeez");

                mailSender.send(mimeMessage);
            } catch (Exception e) {
                System.err.println("Failed to send email: " + e.getMessage());
            }
        }

        return ResponseEntity.ok("If an account with this email exists, a password reset link has been sent.");
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestParam("token") String token, @RequestBody Map<String, String> request) {
        Optional<PasswordResetToken> tokenOptional = tokenRepository.findByToken(token);

        if (tokenOptional.isEmpty() || tokenOptional.get().getExpiryDate().before(new Date())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "Invalid or expired token."));
        }

        PasswordResetToken resetToken = tokenOptional.get();
        User user = resetToken.getUser();
        String newPassword = request.get("password");

        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        tokenRepository.delete(resetToken);

        return ResponseEntity.ok(Map.of("message", "Your password has been reset successfully."));
    }

    private String buildHtmlEmail(String firstName, String token) {
        String resetUrl = "http://localhost:3000/reset-password?token=" + token;

        return "<!DOCTYPE html>" +
                "<html>" +
                "<body style=\"font-family: sans-serif; background-color: #f4f4f7; margin: 0; padding: 0;\">" +
                "  <div style=\"max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden;\">" +
                "    <div style=\"background-color: #4F46E5; color: #ffffff; padding: 24px; text-align: center;\"><h1>MyBeez</h1></div>" +
                "    <div style=\"padding: 32px; line-height: 1.6;\">" +
                "      <h2>Password Reset Request</h2>" +
                "      <p>Hello " + firstName + ",</p>" +
                "      <p>We received a request to reset the password for your Mybeez account. If you did not make this request, you can safely ignore this email.</p>" +
                "      <p>To reset your password, please click the button below. This link will expire in one hour.</p>" +
                "      <a href=\"" + resetUrl + "\" style=\"display: inline-block; background-color: #4F46E5; color: #ffffff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold;\">Reset Your Password</a>" +
                "      <p style=\"margin-top: 24px; font-size: 12px; color: #999;\">If you're having trouble, copy and paste this link into your browser:<br><a href=\"" + resetUrl + "\" style=\"color: #777;\">" + resetUrl + "</a></p>" +
                "    </div>" +
                "    <div style=\"background-color: #f8f9fa; padding: 24px; text-align: center; font-size: 12px; color: #777;\"><p>&copy; 2025 Mybeez. All rights reserved.</p></div>" +
                "  </div>" +
                "</body>" +
                "</html>";
    }
}
