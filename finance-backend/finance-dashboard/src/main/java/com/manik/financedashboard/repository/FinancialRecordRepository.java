package com.manik.financedashboard.repository;

import com.manik.financedashboard.model.FinancialRecord;
import com.manik.financedashboard.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface FinancialRecordRepository extends JpaRepository<FinancialRecord, Long> {
    List<FinancialRecord> findByCreatedBy(User user);
    List<FinancialRecord> findByCreatedByAndTypeIgnoreCase(User user, String type);
    List<FinancialRecord> findByCreatedByAndCategoryIgnoreCase(User user, String category);
    List<FinancialRecord> findByCreatedByAndDateBetween(User user, LocalDateTime start, LocalDateTime end);
    List<FinancialRecord> findByCreatedByAndDescriptionContainingIgnoreCase(User user, String keyword);
}