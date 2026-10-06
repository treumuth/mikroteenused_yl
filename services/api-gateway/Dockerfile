FROM node:20-alpine
WORKDIR /app
COPY packages/common /app/packages/common
WORKDIR /app/packages/common
RUN npm install --omit=dev
COPY services/api-gateway/package.json /app/services/api-gateway/
WORKDIR /app/services/api-gateway
RUN npm install --omit=dev
COPY services/api-gateway /app/services/api-gateway
EXPOSE 8080
CMD ["npm", "start"]
