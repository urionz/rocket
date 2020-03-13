FROM rocketchat/base:latest

COPY build /app


RUN set -x \
 && cd /app/bundle/programs/server \
 && npm install \
 && npm cache clear --force \
 && chown -R rocketchat:rocketchat /app

USER rocketchat

VOLUME /app/uploads

WORKDIR /app/bundle

EXPOSE 3000

CMD ["node", "main.js"]
