FROM node:22-alpine AS dependencies

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

FROM dependencies AS development

COPY . .

ENV VITE_API_URL=/api/v1 \
    VITE_PROXY_TARGET=http://backend:5000

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]

FROM dependencies AS build

COPY . .

ARG VITE_API_URL=/api/v1
ARG VITE_PAYPAL_CLIENT_ID=
ENV VITE_API_URL=${VITE_API_URL} \
    VITE_PAYPAL_CLIENT_ID=${VITE_PAYPAL_CLIENT_ID}

RUN npm run build

FROM nginx:1.27-alpine AS runtime

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
