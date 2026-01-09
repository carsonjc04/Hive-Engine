package com.carsonchristensen.hive.service;

import com.carsonchristensen.hive.model.Device;
import com.carsonchristensen.hive.model.DeviceType;
import com.carsonchristensen.hive.model.Employee;
import com.carsonchristensen.hive.repository.DeviceRepository;
import com.carsonchristensen.hive.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class DeviceService {

    private final DeviceRepository deviceRepository;
    private final EmployeeRepository employeeRepository;

    @Transactional
    public Device assignDevice(Long employeeId, String deviceType, String serialNumber) {
        // 1. Find the employee
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found with id: " + employeeId));

        // 2. Check if serial number already exists
        deviceRepository.findBySerialNumber(serialNumber)
                .ifPresent(device -> {
                    throw new RuntimeException("Device with serial number " + serialNumber + " already exists");
                });

        // 3. Convert String to DeviceType enum
        DeviceType type;
        try {
            type = DeviceType.valueOf(deviceType.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid device type: " + deviceType + ". Must be one of: LAPTOP, MOBILE, TABLET");
        }

        // 4. Create new Device
        Device device = Device.builder()
                .serialNumber(serialNumber)
                .type(type)
                .isLocked(false)
                .employee(employee)
                .build();

        // 5. Save and return
        return deviceRepository.save(device);
    }

    @Transactional
    public void lockDevicesForEmployee(Long employeeId) {
        // 1. Find all devices for the employee
        List<Device> devices = deviceRepository.findByEmployeeId(employeeId);

        // 2. Lock all devices
        devices.forEach(device -> device.setIsLocked(true));

        // 3. Save all changes
        deviceRepository.saveAll(devices);

        // 4. Log the operation
        log.info("Locked {} devices for employee {}", devices.size(), employeeId);
    }
}

