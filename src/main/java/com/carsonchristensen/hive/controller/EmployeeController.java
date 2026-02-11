package com.carsonchristensen.hive.controller;

import com.carsonchristensen.hive.model.Employee;
import com.carsonchristensen.hive.service.EmployeeService;
import jakarta.validation.Valid;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/employees")
public class EmployeeController {

    private final EmployeeService employeeService;

    public EmployeeController(EmployeeService employeeService) {
        this.employeeService = employeeService;
    }

    // GET /api/employees - See everyone
    @GetMapping
    public List<Employee> getAllEmployees() {
        return employeeService.getAllEmployees();
    }

    // GET /api/employees/{id} - Get single employee
    @GetMapping("/{id}")
    public ResponseEntity<Employee> getEmployee(@PathVariable Long id) {
        return employeeService.getEmployeeById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // POST /api/employees - Hire someone (Body: JSON)
    @PostMapping
    public ResponseEntity<Employee> createEmployee(@Valid @RequestBody Employee employee) {
        Employee created = employeeService.createEmployee(employee);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    // POST /api/employees/{id}/terminate - The Big Red Button
    @PostMapping("/{id}/terminate")
    public ResponseEntity<Employee> terminateEmployee(@PathVariable Long id) {
        Employee employee = employeeService.terminateEmployee(id);
        return ResponseEntity.ok(employee);
    }

    // Handle validation errors
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidationExceptions(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(error -> {
            errors.put(error.getField(), error.getDefaultMessage());
        });
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errors);
    }

    // Handle duplicate email constraint violations
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Map<String, String>> handleDataIntegrityViolation(DataIntegrityViolationException ex) {
        Map<String, String> error = new HashMap<>();
        String message = ex.getMessage();
        
        if (message != null && message.contains("email") && message.contains("unique")) {
            error.put("email", "Email already exists");
            return ResponseEntity.status(HttpStatus.CONFLICT).body(error);
        }
        
        error.put("error", "Data integrity violation");
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }
}

