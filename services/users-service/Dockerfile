FROM node:20-alpine
WORKDIR /app
COPY packages/common /app/packages/common
WORKDIR /app/packages/common
RUN npm install --omit=dev
COPY services/users-service/package.json /app/services/users-service/
WORKDIR /app/services/users-service
RUN npm install --omit=dev
COPY services/users-service /app/services/users-service
EXPOSE 3001
CMD ["npm", "start"]
