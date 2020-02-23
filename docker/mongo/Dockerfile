FROM mongo:latest

VOLUME /data/db /data/configdb

ENTRYPOINT [ "mongod", "--bind_ip_all", "--oplogSize", "128", "--replSet", "rs0", "--journal" ]

EXPOSE 27017

