FROM node:lts-bookworm-slim
// highlight-next-line
RUN npm install -g @usebruno/cli@2.8.0
ENTRYPOINT ["bru"]
CMD ["run"]
