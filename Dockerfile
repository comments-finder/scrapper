FROM node:18-alpine AS scrapper

RUN apk add --no-cache \
      chromium \
      nss \
      freetype \
      harfbuzz \
      ca-certificates \
      ttf-freefont \
      nodejs \
      yarn

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser


WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci
COPY . .

EXPOSE 3000
CMD [ "npm", "start" ]
