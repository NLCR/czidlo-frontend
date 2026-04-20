# node lts/iron (20.19.6)
FROM node:20.19.6-alpine AS builder

WORKDIR /app

# kvůli collect-build-info.js
RUN apk add --no-cache git

# nejdřív jen manifesty (cache)
COPY package.json package-lock.json ./
# nainstaluj závislosti (nahrazuje npm install)
RUN npm ci

# potom zdrojáky
COPY . /app

# zkopíruj .git kvůli collect-build-info.js
COPY .git /app/.git

RUN npm run build


FROM nginx:alpine
EXPOSE 80

COPY --from=builder /app/dist/czidlo-frontend/browser/ /usr/share/nginx/html
COPY docker/etc/nginx/conf.d/default.conf /etc/nginx/conf.d/

# ⬇️ nový entrypoint skript
COPY docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# FIXME probably these 2 lines are not needed while building
# on github CI/CD
RUN find /usr/share/nginx/html -type d -exec chmod 0755 {} \; && \
    find /usr/share/nginx/html -type f -exec chmod 0644 {} \;

ENTRYPOINT ["/entrypoint.sh"]