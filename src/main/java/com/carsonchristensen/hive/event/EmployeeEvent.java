package com.carsonchristensen.hive.event; // UPDATED PACKAGE

import java.time.Instant;

public record EmployeeEvent(String type, Long employeeId, Instant timestamp) {
}