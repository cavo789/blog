FROM cypress/included:14.2.0

WORKDIR /app

COPY --chown=node:node package*.json ./

RUN npm install

COPY --chown=node:node cypress/ ./cypress/
COPY --chown=node:node cypress.config.js ./

RUN npx cypress verify

USER node

CMD ["npx", "cypress", "run", "--browser", "chrome"]
