FROM node:10 as NODE
WORKDIR /work
RUN mkdir -p /work
ADD package.json package-lock.json /work/
RUN npm install
RUN npm audit || true
ADD . /work
RUN npm run build

FROM adoptopenjdk/openjdk11-openj9 as JAVA
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

FROM adoptopenjdk/openjdk11-openj9:jre
WORKDIR /app
RUN mkdir -p /app
ADD docker/run-java.sh /app
COPY --from=JAVA /work/target/thw-inventory*.jar /app/thw-inventory.jar
CMD [ "/app/run-java.sh", "-jar", "/app/thw-inventory.jar" ]
