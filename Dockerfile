# Use an official JDK runtime as a parent image
FROM eclipse-temurin:17-jdk-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy the maven executable and pom file
COPY .mvn/ .mvn
COPY mvnw pom.xml ./
RUN chmod +x mvnw

# Copy the project source
COPY src ./src

# Build the application
RUN ./mvnw clean package -DskipTests

# Run the jar file
ENTRYPOINT ["java","-jar","target/finance-dashboard-0.0.1-SNAPSHOT.jar"]