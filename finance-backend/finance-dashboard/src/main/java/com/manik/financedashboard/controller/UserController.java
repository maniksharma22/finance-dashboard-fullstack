package com.manik.financedashboard.controller;

import com.manik.financedashboard.model.Role;
import com.manik.financedashboard.model.User;
import com.manik.financedashboard.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class UserController {

    private final UserService userService;

    @PostMapping
    public User createUser(@RequestBody User user) {
        return userService.createUser(user);
    }

    @GetMapping
    public List<User> getAllUsers() {
        return userService.getAllUsers();
    }

    @PutMapping("/{id}")
    public User updateUser(@PathVariable Long id, @RequestBody User user) {
        return userService.updateUser(id, user);
    }

    @PatchMapping("/{id}/status")
    public User updateStatus(@PathVariable Long id, @RequestBody Map<String, Boolean> payload) {
        boolean active = payload.get("enabled");
        return userService.updateUserStatus(id, active);
    }

    @PatchMapping("/{id}/role")
    public User updateRole(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        Role role = Role.valueOf(payload.get("role"));
        return userService.updateUserRole(id, role);
    }

    @DeleteMapping("/{id}")
    public void deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
    }
}