# Estágio 1: Build do projeto com Maven e OpenJDK 21 LTS
FROM maven:3.9.6-eclipse-temurin-21 AS builder
WORKDIR /app

# Copiar arquivo de configuração e fontes
COPY pom.xml .
COPY src ./src

# Compilar o JAR de produção de forma limpa
RUN mvn clean package -DskipTests

# Estágio 2: Imagem final de execução em produção
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

COPY --from=builder /app/target/gamemaster-1.0.0-SNAPSHOT.jar app.jar

EXPOSE 8085

ENV PORT=8085

ENTRYPOINT ["java", "-jar", "app.jar"]
