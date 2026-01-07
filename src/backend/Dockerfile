# # Stage 1: Build the application
# FROM maven:3.9.6-eclipse-temurin-21 AS build
# WORKDIR /app
# COPY pom.xml .
# COPY src ./src
# RUN mvn clean package -DskipTests

# # Stage 2: Run the application
# FROM eclipse-temurin:21-jre-alpine
# WORKDIR /app
# COPY --from=build /app/target/*.jar app.jar

# EXPOSE 8080
# ENTRYPOINT ["java", "-jar", "app.jar"]

# Stage 1: Build
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app

# 1. Chỉ copy file pom.xml trước
COPY pom.xml .
# 2. Tải toàn bộ thư viện về (Dependency Caching)
# Bước này sẽ được Docker cache lại, nếu bạn không sửa pom.xml thì nó sẽ không chạy lại -> Cực nhanh
RUN mvn dependency:go-offline

# 3. Giờ mới copy code nguồn
COPY src ./src

# 4. Build package (bỏ qua test cho nhanh)
RUN mvn clean package -DskipTests

# Stage 2: Run
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# LƯU Ý: Dòng dưới đây giả định bạn build ra 1 file jar duy nhất. 
# Nếu bị lỗi copy, hãy làm theo cách <finalName> mình chỉ ở trên nhé.
COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]