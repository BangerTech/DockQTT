FROM node:18-alpine

WORKDIR /app

# Kopiere package.json und package-lock.json (wenn vorhanden)
COPY package*.json ./

# Installiere Abhängigkeiten
RUN npm install

# Kopiere den Rest des Codes
COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"] 