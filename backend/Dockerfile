FROM node:18-alpine

WORKDIR /app

# Kopiere package.json und installiere Abhängigkeiten
COPY package*.json ./
RUN npm install

# Kopiere den Rest
COPY tsconfig.json ./
COPY src ./src

# TypeScript kompilieren
RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "dev"] 