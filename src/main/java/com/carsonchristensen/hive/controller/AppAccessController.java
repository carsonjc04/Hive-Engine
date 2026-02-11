package com.carsonchristensen.hive.controller;

import com.carsonchristensen.hive.model.AppAccess;
import com.carsonchristensen.hive.service.AppAccessService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/app-access")
public class AppAccessController {

    private final AppAccessService appAccessService;

    public AppAccessController(AppAccessService appAccessService) {
        this.appAccessService = appAccessService;
    }

    // GET /api/app-access - All app accesses
    @GetMapping
    public List<AppAccess> getAllAppAccesses() {
        return appAccessService.getAllAppAccesses();
    }

    // GET /api/app-access/employee/{employeeId} - Apps for an employee
    @GetMapping("/employee/{employeeId}")
    public List<AppAccess> getAppsByEmployee(@PathVariable Long employeeId) {
        return appAccessService.getAppsByEmployee(employeeId);
    }

    @PostMapping
    public ResponseEntity<AppAccess> assignApp(@Valid @RequestBody AppAccessRequest request) {
        AppAccess appAccess = appAccessService.assignApp(
                request.employeeId(),
                request.appName(),
                request.role()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(appAccess);
    }

    // AppAccessRequest record
    public record AppAccessRequest(
            @NotNull(message = "Employee ID is required")
            Long employeeId,
            
            @NotBlank(message = "App name is required")
            String appName,
            
            @NotBlank(message = "Role is required")
            String role
    ) {}

    // Handle validation errors
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidationExceptions(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(error -> {
            errors.put(error.getField(), error.getDefaultMessage());
        });
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errors);
    }

    // Handle data integrity violations
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Map<String, String>> handleDataIntegrityViolation(DataIntegrityViolationException ex) {
        Map<String, String> error = new HashMap<>();
        String message = ex.getMessage();
        // Include more details about the violation
        if (message != null) {
            error.put("error", "Data integrity violation: " + message);
        } else {
            error.put("error", "Data integrity violation");
        }
        // Log the full exception for debugging
        System.err.println("DataIntegrityViolationException: " + ex.getMessage());
        ex.printStackTrace();
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    // Handle runtime exceptions (employee not found, etc.)
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, String>> handleRuntimeException(RuntimeException ex) {
        Map<String, String> error = new HashMap<>();
        String message = ex.getMessage();
        
        if (message != null && message.contains("Employee not found")) {
            error.put("error", message);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
        
        error.put("error", message != null ? message : "An error occurred");
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }
}

