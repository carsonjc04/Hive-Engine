#!/bin/bash

# Hive Engine Setup Script
# Checks for Java 21 and sets up the environment

set -e

echo "🔍 Checking Java installation..."

# Check if Java 21 is available (macOS)
if command -v /usr/libexec/java_home &> /dev/null; then
    JAVA_21_HOME=$(/usr/libexec/java_home -v 21 2>/dev/null || echo "")
    if [ -n "$JAVA_21_HOME" ]; then
        export JAVA_HOME="$JAVA_21_HOME"
        echo "✅ Found Java 21 at: $JAVA_HOME"
    else
        echo "❌ Java 21 not found. Please install Java 21."
        echo "   On macOS: brew install openjdk@21"
        exit 1
    fi
else
    # For Linux/other systems, check if java is in PATH and is version 21
    if command -v java &> /dev/null; then
        JAVA_VERSION=$(java -version 2>&1 | head -n 1 | cut -d'"' -f2 | sed '/^1\./s///' | cut -d'.' -f1)
        if [ "$JAVA_VERSION" = "21" ]; then
            echo "✅ Found Java 21 in PATH"
        else
            echo "❌ Java 21 required, but found Java $JAVA_VERSION"
            echo "   Please install Java 21 and set JAVA_HOME"
            exit 1
        fi
    else
        echo "❌ Java not found. Please install Java 21."
        exit 1
    fi
fi

# Verify Java version
echo "📋 Java version:"
java -version

echo ""
echo "✅ Setup complete! You can now run:"
echo "   ./mvnw clean spring-boot:run"
echo ""
echo "Or use the helper script:"
echo "   ./run.sh"


