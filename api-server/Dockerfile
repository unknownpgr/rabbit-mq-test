FROM node:16

WORKDIR /app
COPY src/package.json ./
COPY src/yarn.lock ./
RUN yarn install
COPY src ./

ENTRYPOINT [ "node", "index.js" ]