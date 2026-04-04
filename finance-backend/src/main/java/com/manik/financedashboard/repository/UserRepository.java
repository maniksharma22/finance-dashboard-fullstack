package com.manik.financedashboard.repository;

import com.manik.financedashboard.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    // This allows searching by email
    Optional<User> findByEmail(String email);
}
