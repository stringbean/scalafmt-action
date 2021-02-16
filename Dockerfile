FROM scalameta/scalafmt:v2.7.5

RUN apk add --no-cache git

COPY entrypoint.sh /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]