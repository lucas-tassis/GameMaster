# Estágio 1: Build do projeto com Maven e OpenJDK 21/25
FROM maven:3.9.6-eclipse-temurin-21 AS builder
WORKDIR /app

# Copiar pom.xml e código-fonte
COPY pom.xml .
COPY src ./src

# Alterar temporariamente o release para 21 no container se necessário
RUN sed -i 's/<java.version>25<\/java.version>/<java.version>21<\/java.version>/g' pom.xml && \
    sed -i 's/<maven.compiler.release>25<\/maven.compiler.release>/<maven.compiler.release>21<\/maven.compiler.release>/g' pom.xml

# Compilar o JAR de produção
RUN mvn clean package -DskipTests

# Estágio 2: Imagem final leve para execução pública
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

COPY --from=builder /app/target/gamemaster-1.0.0-SNAPSHOT.jar app.jar

EXPOSE 8085

ENV PORT=8085

ENTRYPOINT ["java", "-jar", "app.jar"]
