package com.carsonchristensen.hive.service;

import com.carsonchristensen.hive.event.EmployeeEvent;
import com.carsonchristensen.hive.event.EventPublisher;
import com.carsonchristensen.hive.model.Employee;
import com.carsonchristensen.hive.model.EmployeeStatus;
import com.carsonchristensen.hive.repository.EmployeeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service
public class EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final EventPublisher eventPublisher;

    public EmployeeService(EmployeeRepository employeeRepository, EventPublisher eventPublisher) {
        this.employeeRepository = employeeRepository;
        this.eventPublisher = eventPublisher;
    }

    public List<Employee> getAllEmployees() {
        return employeeRepository.findAll();
    }

    public Employee createEmployee(Employee employee) {
        // Default to ACTIVE when creating
        employee.setStatus(EmployeeStatus.ACTIVE);
        return employeeRepository.save(employee);
    }

    @Transactional
    public Employee terminateEmployee(Long employeeId) {
        // 1. Find the employee
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found with id: " + employeeId));

        // 2. Update status in DB
        employee.setStatus(EmployeeStatus.TERMINATED);
        Employee savedEmployee = employeeRepository.save(employee);

        // 3. Publish the Event (The "Trigger")
        EmployeeEvent event = new EmployeeEvent(
                "TERMINATED",
                savedEmployee.getId(),
                Instant.now()
        );
        eventPublisher.publishEmployeeEvent(event);

        return savedEmployee;
    }
}