FROM node:20-alpine
WORKDIR /app
COPY package.json ./
ENV CYPRESS_INSTALL_BINARY=0
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
