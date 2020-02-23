FROM mongo:latest

COPY replica.sh /root/replica.sh

RUN apt-get update
RUN apt-get -y install iputils-ping

ENTRYPOINT bash -c "bash /root/replica.sh"

