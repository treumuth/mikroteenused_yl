FROM node:20-alpine
WORKDIR /app
COPY packages/common /app/packages/common
WORKDIR /app/packages/common
RUN npm install --omit=dev
COPY services/orders-service/package.json /app/services/orders-service/
WORKDIR /app/services/orders-service
RUN npm install --omit=dev
COPY services/orders-service /app/services/orders-service
EXPOSE 3003
CMD ["npm", "start"]
