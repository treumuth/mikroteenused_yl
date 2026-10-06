FROM node:20-alpine
WORKDIR /app
COPY packages/common /app/packages/common
WORKDIR /app/packages/common
RUN npm install --omit=dev
COPY services/catalog-service/package.json /app/services/catalog-service/
WORKDIR /app/services/catalog-service
RUN npm install --omit=dev
COPY services/catalog-service /app/services/catalog-service
EXPOSE 3002
CMD ["npm", "start"]
