# build stage
FROM node:lts as build-stage

WORKDIR /app

COPY src ./src
COPY package.json .
COPY tsconfig.json .

RUN npm config set registry https://registry.npmmirror.com/
RUN npm install
RUN npm run build

# production stage
FROM node:lts-alpine as production-stage

WORKDIR /app

COPY --from=build-stage /app/dist ./dist
COPY --from=build-stage /app/package-lock.json .
COPY --from=build-stage /app/package.json .

RUN npm config set registry https://registry.npmmirror.com/
RUN npm install --production

COPY prisma ./prisma
RUN npx prisma generate

EXPOSE 3000

CMD ["node", "dist/index.js"]