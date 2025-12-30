FROM node:18 as production-dependencies
WORKDIR /app
COPY package.json package.json
COPY package-lock.json package-lock.json
RUN npm ci --production

FROM node:18 as build-dependencies
WORKDIR /app
COPY package.json package.json
COPY package-lock.json package-lock.json
RUN npm ci

FROM node:18 as builder
WORKDIR /app
COPY --from=build-dependencies /app/node_modules node_modules
COPY ../upd .
RUN npm run build

FROM node:18
WORKDIR /app
COPY --from=production-dependencies /app .
COPY --from=builder /app/dist /app/dist
CMD [ "node", "dist/src/main.js" ]
