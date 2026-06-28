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

ARG VITE_API_URL
ARG VITE_PAYPAL_CLIENT_ID=
ENV VITE_API_URL=${VITE_API_URL} \
    VITE_PAYPAL_CLIENT_ID=${VITE_PAYPAL_CLIENT_ID}

RUN test -n "${VITE_API_URL}" \
    && case "${VITE_API_URL}" in https://*/api/v1|https://*/api/v1/) true ;; *) echo "VITE_API_URL must be an HTTPS /api/v1 URL for production builds." >&2; exit 1 ;; esac \
    && case "${VITE_API_URL}" in *localhost*|*127.0.0.1*|*0.0.0.0*) echo "VITE_API_URL must not point to a local host in production builds." >&2; exit 1 ;; *) true ;; esac \
    && npm run build

FROM nginx:1.27-alpine AS runtime

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
