FROM alpine:latest

RUN apk add --no-cache nodejs npm

RUN apk add build-base

RUN apk add valgrind

WORKDIR /check-security-app

COPY . /check-security-app

RUN npm install

EXPOSE 3000

ENTRYPOINT ["node"]

CMD ["server.js"]

