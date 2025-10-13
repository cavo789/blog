FROM node:21-alpine

RUN npx create-docusaurus@latest /app classic --javascript && \
    chown -R node:node /app

USER node

WORKDIR /app

RUN cd /app && yarn install

COPY . .

CMD ["yarn", "start", "--host", "0.0.0.0"]
