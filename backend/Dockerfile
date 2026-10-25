# ---------- Etapa 1: build ----------
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /build

# Copiem intai pom.xml ca stratul de dependinte sa fie cache-uit separat
# de codul sursa: o modificare de cod nu reia descarcarea intregului repo.
COPY pom.xml .
RUN mvn -B dependency:go-offline

COPY src ./src
RUN mvn -B clean package -DskipTests

# ---------- Etapa 2: runtime ----------
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Rulam ca utilizator neprivilegiat
RUN addgroup -S academia && adduser -S academia -G academia

COPY --from=build /build/target/*.jar app.jar

# Volum pentru story-urile incarcate (pe Render/Railway monteaza un disc aici)
RUN mkdir -p /app/uploads/stories && chown -R academia:academia /app
VOLUME ["/app/uploads"]

USER academia
EXPOSE 8080

ENV JAVA_OPTS="-XX:MaxRAMPercentage=75.0 -XX:+UseSerialGC"

HEALTHCHECK --interval=30s --timeout=3s --start-period=40s \
  CMD wget -qO- http://localhost:8080/actuator/health || exit 1

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
