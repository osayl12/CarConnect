# ---- base: shared deps layer ----
FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./

# ---- development: hot-reload via nodemon, source bind-mounted by compose ----
FROM base AS development
ENV NODE_ENV=development
RUN npm install
COPY . .
EXPOSE 5000
CMD ["npm", "run", "dev"]

# ---- production: minimal image, no devDependencies ----
FROM base AS production
ENV NODE_ENV=production
RUN npm ci --omit=dev
COPY . .
EXPOSE 5000
CMD ["node", "src/server.js"]
