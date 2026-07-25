FROM maven:3.9.9-eclipse-temurin-17
WORKDIR /app
COPY . .
RUN mvn -q -DskipTests package
EXPOSE 8080
CMD ["java", "-jar", "target/booking-service-0.0.1-SNAPSHOT.jar"]
