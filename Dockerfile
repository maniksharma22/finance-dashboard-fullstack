FROM eclipse-temurin:17-jdk-alpine
WORKDIR /app

# Copy everything
COPY . .

# Find where mvnw is, go there, and build
RUN MNVW_PATH=$(find . -name "mvnw") && \
    cd $(dirname "$MNVW_PATH") && \
    chmod +x mvnw && \
    ./mvnw clean package -DskipTests

# Start the application
ENTRYPOINT ["sh", "-c", "java -jar $(find . -name \"*.jar\" | grep \"SNAPSHOT.jar\")"]