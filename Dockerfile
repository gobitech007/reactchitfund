#stage 1
FROM node:18-alpine

#stage 2
RUN mkdir -p /app
WORKDIR /app

#stage 3
COPY package.json .
RUN npm ci
COPY . .
EXPOSE 4000
CMD ["npm", "start"]
