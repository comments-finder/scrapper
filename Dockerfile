FROM --platform=linux/amd64 node:18-alpine AS builder

WORKDIR /usr/src/app

COPY . .

RUN npm ci
RUN npm run build
RUN rm -rf ./node_modules && npm cache clean --force

RUN npm ci --omit=dev
RUN rm -rf ./package-lock.json && npm cache clean --force

FROM node:18-alpine AS prod

WORKDIR /usr/src/app

COPY --from=builder /usr/src/app ./

RUN apk add --no-cache \
      chromium \
      nss \
      freetype \
      harfbuzz \
      ca-certificates \
      ttf-freefont \
      nodejs \
      yarn

ENV PUPPETEER_SKIP_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser \
    NODE_ENV=production

RUN chmod +x ./start.sh
CMD ["./start.sh"]