FROM eclipse-temurin:17-jdk-alpine
WORKDIR /app

# Point these to the finance-backend folder
COPY finance-backend/.mvn/ .mvn
COPY finance-backend/mvnw finance-backend/pom.xml ./
RUN chmod +x mvnw

# Point this to the finance-backend/src folder
COPY finance-backend/src ./src

RUN ./mvnw clean package -DskipTests
ENTRYPOINT ["java","-jar","target/finance-dashboard-0.0.1-SNAPSHOT.jar"]