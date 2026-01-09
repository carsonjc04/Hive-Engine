package com.carsonchristensen.hive.controller;

import com.carsonchristensen.hive.model.Device;
import com.carsonchristensen.hive.service.DeviceService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/devices")
public class DeviceController {

    private final DeviceService deviceService;

    public DeviceController(DeviceService deviceService) {
        this.deviceService = deviceService;
    }

    @PostMapping
    public ResponseEntity<Device> assignDevice(@Valid @RequestBody DeviceRequest request) {
        Device device = deviceService.assignDevice(
                request.employeeId(),
                request.deviceType(),
                request.serialNumber()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(device);
    }

    // DeviceRequest record
    public record DeviceRequest(
            @NotNull(message = "Employee ID is required")
            Long employeeId,
            
            @NotBlank(message = "Device type is required")
            String deviceType,
            
            @NotBlank(message = "Serial number is required")
            String serialNumber
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

    // Handle duplicate serial number and other data integrity violations
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Map<String, String>> handleDataIntegrityViolation(DataIntegrityViolationException ex) {
        Map<String, String> error = new HashMap<>();
        String message = ex.getMessage();
        
        if (message != null && message.contains("serial") && message.contains("unique")) {
            error.put("serialNumber", "Serial number already exists");
            return ResponseEntity.status(HttpStatus.CONFLICT).body(error);
        }
        
        error.put("error", "Data integrity violation");
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    // Handle runtime exceptions (employee not found, invalid device type, etc.)
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, String>> handleRuntimeException(RuntimeException ex) {
        Map<String, String> error = new HashMap<>();
        String message = ex.getMessage();
        
        if (message != null && message.contains("Employee not found")) {
            error.put("error", message);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
        
        if (message != null && message.contains("Invalid device type")) {
            error.put("deviceType", message);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
        
        if (message != null && message.contains("already exists")) {
            error.put("serialNumber", message);
            return ResponseEntity.status(HttpStatus.CONFLICT).body(error);
        }
        
        error.put("error", message != null ? message : "An error occurred");
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }
}

