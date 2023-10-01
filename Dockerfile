FROM node:16-alpine AS builder

RUN apk add curl bash g++ make py3-pip

WORKDIR /app

COPY package.json yarn.lock ./

RUN  npm rebuild bcrypt --build-from-source

RUN yarn install --frozen-lockfile

COPY . .

RUN yarn build

#####

FROM node:16-alpine AS runner

WORKDIR /app

COPY --from=builder /app/package.json /app/yarn.lock ./
COPY --from=builder /app/dist ./dist

RUN yarn install --production

ENTRYPOINT ["node", "dist/src/main.js"]
