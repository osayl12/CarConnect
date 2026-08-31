# ---- base: shared deps layer ----
FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./

# ---- development: Vite dev server, source bind-mounted by compose ----
FROM base AS development
RUN npm install
COPY . .
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host"]

# ---- build: compile static assets for production ----
FROM base AS build
RUN npm ci
COPY . .
RUN npm run build

# ---- production: static files served by Caddy, which also reverse-proxies
# /api and /uploads to the backend AND automatically obtains/renews a
# Let's Encrypt HTTPS certificate for the domain in the Caddyfile — no
# certbot, no cron job, no manual cert wiring.
FROM caddy:2-alpine AS production
COPY --from=build /app/dist /srv
COPY Caddyfile /etc/caddy/Caddyfile
EXPOSE 80 443
