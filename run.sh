#!/bin/bash

# Set JAVA_HOME to Java 21
export JAVA_HOME=$(/usr/libexec/java_home -v 21)

# Verify Java version
echo "Using Java: $JAVA_HOME"
java -version

# Run Maven with Spring Boot
./mvnw spring-boot:run


