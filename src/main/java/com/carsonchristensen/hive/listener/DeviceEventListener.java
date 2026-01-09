package com.carsonchristensen.hive.listener;

import com.carsonchristensen.hive.config.RabbitMQConfig;
import com.carsonchristensen.hive.event.EmployeeEvent;
import com.carsonchristensen.hive.service.DeviceService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class DeviceEventListener {

    private final DeviceService deviceService;

    @RabbitListener(queues = RabbitMQConfig.QUEUE_NAME)
    public void handleEmployeeEvent(EmployeeEvent event) {
        log.info("Received employee event: type={}, employeeId={}, timestamp={}", 
                event.type(), event.employeeId(), event.timestamp());

        if (event.type().equalsIgnoreCase("TERMINATED")) {
            log.info("Processing TERMINATED event for employee {}", event.employeeId());
            try {
                deviceService.lockDevicesForEmployee(event.employeeId());
                log.info("Successfully locked devices for terminated employee {}", event.employeeId());
            } catch (Exception e) {
                log.error("Error locking devices for employee {}: {}", event.employeeId(), e.getMessage(), e);
            }
        } else {
            log.debug("Ignoring event type: {} for employee {}", event.type(), event.employeeId());
        }
    }
}

