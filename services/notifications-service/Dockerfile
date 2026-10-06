FROM node:20-alpine
WORKDIR /app
COPY packages/common /app/packages/common
WORKDIR /app/packages/common
RUN npm install --omit=dev
COPY services/notifications-service/package.json /app/services/notifications-service/
WORKDIR /app/services/notifications-service
RUN npm install --omit=dev
COPY services/notifications-service /app/services/notifications-service
EXPOSE 3004
CMD ["npm", "start"]
