package com.carsonchristensen.hive.event;

import com.carsonchristensen.hive.config.RabbitMQConfig;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

@Service
public class EventPublisher {

    private final RabbitTemplate rabbitTemplate;

    public EventPublisher(RabbitTemplate rabbitTemplate) {
        this.rabbitTemplate = rabbitTemplate;
    }

    public void publishEmployeeEvent(EmployeeEvent event) {
        // We construct the routing key dynamically: "hr.employee.TERMINATED"
        // This allows different listeners to filter by specific actions if they want.
        String routingKey = "hr.employee." + event.type().toLowerCase();
        
        rabbitTemplate.convertAndSend(RabbitMQConfig.EXCHANGE_NAME, routingKey, event);
        
        System.out.println(" [x] Published Event: " + routingKey + " -> " + event);
    }
}