package com.carsonchristensen.hive.service;

import com.carsonchristensen.hive.model.AppAccess;
import com.carsonchristensen.hive.model.Employee;
import com.carsonchristensen.hive.repository.AppAccessRepository;
import com.carsonchristensen.hive.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class AppAccessService {

    private final AppAccessRepository appAccessRepository;
    private final EmployeeRepository employeeRepository;

    @Transactional
    public AppAccess assignApp(Long employeeId, String appName, String role) {
        // 1. Find the employee
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found with id: " + employeeId));

        // 2. Create new AppAccess with status "ACTIVE"
        AppAccess appAccess = AppAccess.builder()
                .appName(appName)
                .status("ACTIVE")
                .role(role)
                .employee(employee)
                .build();

        // 3. Save and return
        return appAccessRepository.save(appAccess);
    }

    @Transactional
    public void revokeAllForEmployee(Long employeeId) {
        // 1. Find all app accesses for the employee
        List<AppAccess> appAccesses = appAccessRepository.findByEmployeeId(employeeId);

        // 2. Revoke all app accesses (set status to "REVOKED")
        appAccesses.forEach(appAccess -> appAccess.setStatus("REVOKED"));

        // 3. Save all changes
        appAccessRepository.saveAll(appAccesses);

        // 4. Log the operation
        log.info("Revoked {} app accesses for employee {}", appAccesses.size(), employeeId);
    }
}

