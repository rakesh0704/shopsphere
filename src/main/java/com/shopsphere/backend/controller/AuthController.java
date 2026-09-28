package com.shopsphere.backend.controller;
import com.shopsphere.backend.dto.LoginRequest;
import com.shopsphere.backend.dto.RegisterRequest;
import com.shopsphere.backend.entity.User;
import com.shopsphere.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping("/register")
    public ResponseEntity<String> register(
            @RequestBody RegisterRequest request) {

        if (userRepository.findByEmail(
                request.getEmail()).isPresent()) {

            return ResponseEntity
                    .badRequest()
                    .body("Email already exists");
        }

        User user = new User();

        user.setUsername(request.getUsername());

        user.setEmail(request.getEmail());

        user.setPassword(
                passwordEncoder.encode(
                        request.getPassword()));

        user.setRole("USER");

        userRepository.save(user);

        return ResponseEntity.ok(
                "User registered successfully");
    }
    @PostMapping("/login")
public ResponseEntity<String> login(
        @RequestBody LoginRequest request) {

    User user = userRepository
            .findByEmail(request.getEmail())
            .orElse(null);

    if (user == null) {

        return ResponseEntity.badRequest()
                .body("User not found");
    }

    if (!passwordEncoder.matches(
            request.getPassword(),
            user.getPassword())) {

        return ResponseEntity.badRequest()
                .body("Invalid password");
    }

    return ResponseEntity.ok(
            "Login Successful");
}
}