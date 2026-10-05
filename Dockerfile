# 1. Build Stage
FROM ubuntu:22.04 AS builder

# Install dependencies (Java 17, Node.js)
RUN apt-get update && \
    apt-get install -y openjdk-17-jdk curl && \
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs && \
    apt-get clean

WORKDIR /app
COPY . .

# Run the build script to package React and Spring Boot together
RUN chmod +x build.sh && ./build.sh

# 2. Run Stage
FROM eclipse-temurin:17-jre-jammy

WORKDIR /app
# Copy the built jar from the builder stage
COPY --from=builder /app/backend/build/libs/*-SNAPSHOT.jar app.jar

# Expose the default Spring Boot port
EXPOSE 8080

# Run the application
ENTRYPOINT ["java", "-Dspring.profiles.active=prod", "-jar", "app.jar"]
