# syntax=docker/dockerfile:1.7
FROM scratch

ADD alpine-minirootfs-3.21.3-x86_64.tar /

RUN apk update && apk upgrade --no-cache

LABEL maintainer="Mateusz Kędra"

RUN apk add --no-cache nodejs npm git openssh-client
RUN mkdir -p -m 0700 ~/.ssh && ssh-keyscan github.com >> ~/.ssh/known_hosts
RUN --mount=type=ssh \
    mkdir -p /weather-app-ci-cd && \
    git clone git@github.com:wintryquip/weather-app-ci-cd.git /weather-app-ci-cd

WORKDIR /weather-app-ci-cd

COPY src/ .

RUN npm install
RUN npm install node-fetch@2

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s \
  CMD curl -f http://localhost:3000/ || exit 1

CMD ["node", "server.js"]
