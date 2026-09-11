FROM maven:3.9.9-eclipse-temurin-17
WORKDIR /app
COPY . .
# Use BuildKit cache for Maven repository to speed builds and avoid transient network issues
RUN --mount=type=cache,target=/root/.m2 mvn -q -DskipTests -DskipITs -Dmaven.test.skip=true package
EXPOSE 8080
CMD ["bash", "-c", "until (echo > /dev/tcp/mysql/3306) 2>/dev/null; do echo 'En attente de mysql...'; sleep 2; done; echo 'mysql joignable, demarrage'; java -jar target/booking-service-0.0.1-SNAPSHOT.jar"]