# Stage 1: react app
FROM node:25-alpine AS builder

WORKDIR /frontend

COPY package.json package-lock.json ./
COPY . .

RUN npm install
RUN npm run build

# Stage 2: nginx
FROM nginx:alpine

COPY --from=builder /frontend/dist /usr/share/nginx/html
COPY ./nginx/default.conf /etc/nginx/conf.d/default.conf

EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]