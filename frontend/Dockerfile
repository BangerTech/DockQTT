FROM node:18-alpine

WORKDIR /app

# Installiere dependencies zuerst für besseres Caching
COPY package*.json ./
RUN npm install

# Kopiere den Rest der Anwendung
COPY . .

EXPOSE 3000
CMD ["npm", "run", "dev"] 