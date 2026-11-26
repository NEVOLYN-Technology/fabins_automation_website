# =============================================================================
# FABINS Backend API — Spring Boot Multi-Stage Production Dockerfile
#
# Multi-stage build using Eclipse Temurin JDK/JRE 21 on Alpine Linux.
# Produces a lightweight, secure container for the Spring Boot application.
# =============================================================================

# --- STAGE 1: Build Executable Fat Jar ----------------------------------------
FROM eclipse-temurin:21-jdk-alpine AS builder
WORKDIR /build

# Copy Maven Wrapper files & pom.xml first to leverage dependency caching
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./

# Grant execution permission to the Maven Wrapper script
RUN chmod +x mvnw

# Download dependencies (offline cache layer)
RUN ./mvnw dependency:go-offline -B

# Copy application source code
COPY src/ src/

# Build production JAR (target/fabins-api.jar) skipping tests (tests ran in CI)
RUN ./mvnw clean package -DskipTests

# --- STAGE 2: Lightweight Production Runtime Image ---------------------------
FROM eclipse-temurin:21-jre-alpine AS runner
WORKDIR /app

# Create a non-root dedicated application user for container security
RUN addgroup -S fabinsgroup && adduser -S fabinsuser -G fabinsgroup

# Copy built JAR artifact from stage 1
COPY --from=builder /build/target/fabins-api.jar /app/fabins-api.jar

# Set container owner
RUN chown -R fabinsuser:fabinsgroup /app

USER fabinsuser

# Expose Spring Boot default port
EXPOSE 8080

# Configure JVM flags & run application
# - Djava.security.egd=file:/dev/./urandom speeds up SecureRandom initialization in Linux
ENV JAVA_OPTS="-Xms256m -Xmx512m -Djava.security.egd=file:/dev/./urandom"
ENV SPRING_PROFILES_ACTIVE=prod

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar fabins-api.jar"]
