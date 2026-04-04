FROM eclipse-temurin:17-jdk-alpine
WORKDIR /app

# This copies EVERYTHING from your repo into the container
COPY . .

# We move into the backend folder to build
RUN cd finance-backend && chmod +x mvnw && ./mvnw clean package -DskipTests

# We run the jar from its new location
ENTRYPOINT ["java","-jar","finance-backend/target/finance-dashboard-0.0.1-SNAPSHOT.jar"]