package com.carsonchristensen.hive; // MATCHES MAIN APP PACKAGE

import com.carsonchristensen.hive.config.RabbitMQConfig;
import com.carsonchristensen.hive.event.EmployeeEvent;
import org.junit.jupiter.api.Test;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.testcontainers.containers.RabbitMQContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.time.Instant;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.TimeUnit;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@Testcontainers
@Import(RabbitMQIntegrationTest.TestListenerConfig.class)
public class RabbitMQIntegrationTest {

    @Container
    @ServiceConnection
    static RabbitMQContainer rabbitContainer = new RabbitMQContainer("rabbitmq:3.13-management");

    @Autowired
    private RabbitTemplate rabbitTemplate;

    @Autowired
    private TestListener testListener;

    @Test
    void testSendAndReceiveEmployeeEvent() throws Exception {
        EmployeeEvent event = new EmployeeEvent("TERMINATED", 101L, Instant.now());
        
        // Sending to "hr.employee.terminated" which matches "hr.employee.#"
        rabbitTemplate.convertAndSend(RabbitMQConfig.EXCHANGE_NAME, "hr.employee.terminated", event);

        // Wait for the listener to catch it
        EmployeeEvent receivedEvent = testListener.receivedEvent.get(5, TimeUnit.SECONDS);
        
        assertThat(receivedEvent).isNotNull();
        assertThat(receivedEvent.type()).isEqualTo("TERMINATED");
        assertThat(receivedEvent.employeeId()).isEqualTo(101L);
    }

    @TestConfiguration
    static class TestListenerConfig {
        @Bean
        public TestListener testListener() {
            return new TestListener();
        }
    }

    static class TestListener {
        public CompletableFuture<EmployeeEvent> receivedEvent = new CompletableFuture<>();

        @RabbitListener(queues = RabbitMQConfig.QUEUE_NAME)
        public void listen(EmployeeEvent event) {
            receivedEvent.complete(event);
        }
    }
}