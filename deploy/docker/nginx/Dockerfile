FROM nginx:alpine

COPY nginx.conf /etc/nginx/

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

ARG ROCKET_UPSTREAM_CONTAINER=rocket
ARG ROCKET_UPSTREAM_PORT=3000

RUN touch /var/log/messages

COPY logrotate/nginx /etc/logrotate.d/

RUN echo "upstream rocket-upstream { server ${ROCKET_UPSTREAM_CONTAINER}:${ROCKET_UPSTREAM_PORT}; }" > /etc/nginx/conf.d/upstream.conf \
    && rm /etc/nginx/conf.d/default.conf

ADD ./startup.sh /opt/startup.sh
RUN sed -i 's/\r//g' /opt/startup.sh
CMD ["/bin/bash", "/opt/startup.sh"]

EXPOSE 80 443
