# Stage 1: build by maven
FROM maven:3.9.9-eclipse-temurin-21 AS builder

WORKDIR /backend

COPY pom.xml .
RUN mvn dependency:go-offline -B

COPY src ./src
RUN mvn -B -DskipTests package

# Stage 2: run
FROM eclipse-temurin:21-jdk-jammy

WORKDIR /app
COPY --from=builder /backend/target/*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java","-jar","app.jar"]









# Stage 1: build by maven
#FROM maven:3.8.5-openjdk-8-slim AS builder
#
#WORKDIR /backend
#
#COPY pom.xml .
#RUN mvn dependency:go-offline -B
#
#COPY src ./src
#
#RUN mvn package -DskipTests
#
## Stage 2: run
#FROM openjdk:8-jdk-alpine
#
#ARG JAR_FILE=target/*.jar
#
#COPY ${JAR_FILE} app.jar
#
#ENTRYPOINT ["java","-jar","/app.jar"]