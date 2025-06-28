# learn-english-backend/Dockerfile
FROM node:18
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build
CMD ["node", "dist/main"]
EXPOSE 3000
