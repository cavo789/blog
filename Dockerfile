FROM node:21-alpine

WORKDIR /app

COPY package*.json .

RUN yarn install

COPY . .

# This command will run Docusaurus and will watch for changes
CMD ["yarn", "start", "--host", "0.0.0.0"]
