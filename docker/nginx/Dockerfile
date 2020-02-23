FROM nginx:alpine

RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.aliyun.com/' /etc/apk/repositories

RUN apk update \
    && apk upgrade \
    && apk --update add logrotate \
    && apk add --no-cache openssl \
    && apk add --no-cache bash \
    && apk add --no-cache unzip \
    && apk add --no-cache curl


RUN set -x ; \
    addgroup -g 82 -S www-data ; \
    adduser -u 82 -D -S -G www-data www-data && exit 0 ; exit 1

ARG NODE_UPSTREAM_CONTAINER=node
ARG NODE_UPSTREAM_PORT=3000

RUN touch /var/log/messages

COPY logrotate/nginx /etc/logrotate.d/

RUN echo "upstream node-upstream { server ${NODE_UPSTREAM_CONTAINER}:${NODE_UPSTREAM_PORT}; }" > /etc/nginx/conf.d/upstream.conf \
    && rm /etc/nginx/conf.d/default.conf

EXPOSE 80 443
