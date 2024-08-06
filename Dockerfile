FROM node
WORKDIR /app
COPY package*.json ./
RUN npm install
RUN npm rebuild bcrypt --build-from-source
RUN npm install -g nodemon
COPY . .
EXPOSE 8080
CMD ["npm", "start"]