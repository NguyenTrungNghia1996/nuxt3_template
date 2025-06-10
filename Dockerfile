FROM node:20-alpine AS nodebuilder

WORKDIR /app
COPY package.json .
COPY yarn.lock .
RUN yarn install
COPY . .
RUN yarn build

FROM node:20-alpine AS bin
COPY --from=nodebuilder /app/.output ./.output
CMD ["node", ".output/server/index.mjs"]


