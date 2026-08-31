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

# ---- production: static files served by nginx, proxying /api and /uploads to the backend ----
FROM nginx:alpine AS production
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
