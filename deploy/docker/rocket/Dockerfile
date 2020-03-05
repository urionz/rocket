FROM rocketchat/base:latest

COPY build /app

RUN set -x \
    && cd /app/bundle/programs/server \
    && npm install \
    && npm cache clear --force

VOLUME /app/uploads

WORKDIR /app/bundle

# ENV DEPLOY_METHOD=docker \
#     NODE_ENV=production \
#     MONGO_URL=mongodb://mongo:27017/rocketchat \
#     MONGO_OPLOG_URL=mongodb://mongo:27017/local \
#     HOME=/tmp \
#     PORT=3000 \
#     ROOT_URL=http://localhost:3000 \
#     Accounts_AvatarStorePath=/app/uploads

# EXPOSE 3000

# CMD ["node", "main.js"]
