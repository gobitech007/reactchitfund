FROM node:18-alpine

WORKDIR /app

# Better cache + reproducible installs
COPY package*.json ./

RUN npm config set registry https://registry.npmjs.org/

RUN npm install pm2 -g

# Install app dependencies, but save them in a separate layer so that we can take advantage of Docker's caching mechanism.
RUN apk add --update git && rm -rf /var/cache/apk/*

RUN npm install --save-exact --prefer-offline --no-audit --progress=false --loglevel=error

# App source
COPY . .

# Bind CRA dev server to all interfaces and use port 3000
ENV HOST=0.0.0.0
ENV PORT=3000
EXPOSE 3000

# Helps file watching on Windows/WSL
ENV CHOKIDAR_USEPOLLING=true

CMD ["npm", "start"]
