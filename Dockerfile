FROM scalameta/scalafmt:v2.7.5

COPY entrypoint.sh /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]