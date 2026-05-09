# Stage 1: build the JAR (uses Maven with Temurin JDK 23)
FROM maven:3.9.9-eclipse-temurin-23 AS build

WORKDIR /app

# Copiem pom + sursele (Render va rula build din root-ul repo-ului)
COPY pom.xml .
COPY src ./src

# Build JAR (fără teste pentru viteză)
RUN mvn -B clean package -DskipTests

# Stage 2: runtime image (Temurin JDK 23)
FROM eclipse-temurin:23-jdk

WORKDIR /app

# Copiem JAR-ul din etapa de build
COPY --from=build /app/target/springboot-0.0.1-SNAPSHOT.jar app.jar

# Expunem portul (convenție, Render/Heroku folosește $PORT)
EXPOSE 8080

# Pornim aplicatia pe portul primit din mediul de rulare (PORT), fallback 8080
ENTRYPOINT ["sh", "-c", "java -jar app.jar --server.port=${PORT:-8080}"]