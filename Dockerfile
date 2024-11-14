FROM node:lts as NODE
WORKDIR /work
RUN mkdir -p /work
ADD package.json package-lock.json /work/
RUN npm install
RUN npm audit || true
ADD . /work
RUN npm run build

FROM eclipse-temurin:21 as JAVA
WORKDIR /work
RUN mkdir -p /work
ADD pom.xml mvnw /work/
ADD .mvn /work/.mvn
RUN ./mvnw clean package || true
ADD . /work
COPY --from=NODE /work/src/main/resources/static/dist /work/src/main/resources/static/dist
RUN ./mvnw package
ARG BUILD_TAG
LABEL BUILD_TAG=$BUILD_TAG

FROM eclipse-temurin:21-alpine
WORKDIR /app
COPY --from=JAVA /work/target/thw-inventory*.jar /app/thw-inventory.jar
CMD [ "java", "-jar", "/app/thw-inventory.jar" ]
