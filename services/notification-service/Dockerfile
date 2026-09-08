FROM maven:3.9.9-eclipse-temurin-17
WORKDIR /app
COPY . .
# Use BuildKit cache for Maven repository to speed builds and avoid transient network issues
# Requires Docker BuildKit (default in modern Docker). This caches ~/.m2 between builds.
RUN --mount=type=cache,target=/root/.m2 mvn -q -DskipTests -DskipITs -Dmaven.test.skip=true package
EXPOSE 8080
CMD ["java", "-jar", "target/notification-service-0.0.1-SNAPSHOT.jar"]
