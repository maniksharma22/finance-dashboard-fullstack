package com.manik.financedashboard.service;

import com.manik.financedashboard.model.FinancialRecord;
import com.manik.financedashboard.model.Role;
import com.manik.financedashboard.model.User;
import com.manik.financedashboard.repository.FinancialRecordRepository;
import com.manik.financedashboard.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FinancialRecordService {

    private final FinancialRecordRepository repository;
    private final UserRepository userRepository;

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public FinancialRecord addRecord(FinancialRecord record) {
        if (record.getDate() == null) {
            record.setDate(LocalDateTime.now());
        }
        record.setCreatedBy(getCurrentUser());
        return repository.save(record);
    }

    public FinancialRecord updateRecord(Long id, FinancialRecord details) {
        FinancialRecord record = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Record not found"));
        record.setAmount(details.getAmount());
        record.setType(details.getType());
        record.setCategory(details.getCategory());
        record.setDescription(details.getDescription());
        record.setDate(details.getDate() != null ? details.getDate() : record.getDate());
        return repository.save(record);
    }

    public void deleteRecord(Long id) {
        if (!repository.existsById(id)) {
            throw new RuntimeException("Record not found");
        }
        repository.deleteById(id);
    }

    public List<FinancialRecord> getAll() {
        User currentUser = getCurrentUser();
        if (currentUser.getRole() == Role.ROLE_ADMIN || currentUser.getRole() == Role.ROLE_ANALYST) {
            return repository.findAll();
        }
        return repository.findByCreatedBy(currentUser);
    }

    public Map<String, Object> getSummary() {
        List<FinancialRecord> records = getAll();

        BigDecimal income = records.stream()
                .filter(r -> "INCOME".equalsIgnoreCase(r.getType()))
                .map(FinancialRecord::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal expense = records.stream()
                .filter(r -> "EXPENSE".equalsIgnoreCase(r.getType()))
                .map(FinancialRecord::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Map<String, BigDecimal> categoryTotals = records.stream()
                .collect(Collectors.groupingBy(
                        FinancialRecord::getCategory,
                        Collectors.mapping(FinancialRecord::getAmount,
                                Collectors.reducing(BigDecimal.ZERO, BigDecimal::add))
                ));

        return Map.of(
                "totalIncome", income,
                "totalExpense", expense,
                "netBalance", income.subtract(expense),
                "categoryBreakdown", categoryTotals,
                "recordCount", records.size()
        );
    }
    public List<FinancialRecord> getFilteredRecords(String type, String category, LocalDateTime start, LocalDateTime end) {
        List<FinancialRecord> all = getAll();

        return all.stream()
                .filter(r -> type == null || r.getType().equalsIgnoreCase(type))
                .filter(r -> category == null || r.getCategory().equalsIgnoreCase(category))
                .filter(r -> (start == null || r.getDate().isAfter(start)) && (end == null || r.getDate().isBefore(end)))
                .collect(Collectors.toList());
    }
}