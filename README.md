# Web3 Full-Stack Application

Eine moderne Full-Stack Webanwendung mit React, TypeScript, Node.js, Express und MongoDB.

## Features

- **TypeScript** - Vollständig typsicher für Frontend und Backend
- **JWT Authentifizierung** - Sichere Benutzerauthentifizierung mit JSON Web Tokens
- **React + Vite** - Schnelles und modernes Frontend-Setup
- **Tailwind CSS** - Utility-First CSS Framework für modernes Design
- **MongoDB** - Flexible NoSQL-Datenbank
- **Docker** - Containerisierte MongoDB-Datenbank
- **Express.js** - Robustes Backend-Framework

## Installation

### Voraussetzungen

- Docker & Docker Compose
- (Optional) Node.js v20+ und npm (nur für lokale Entwicklung ohne Docker)

## Schnellstart mit Docker Compose

### Alle Komponenten mit einem Befehl starten:

```bash
docker-compose up -d
```

Das war's! Die Anwendung ist jetzt verfügbar:
- **Frontend**: http://localhost:4173
- **Backend API**: http://localhost:5000/api
- **MongoDB**: localhost:27017

### Logs anzeigen:

```bash
docker-compose logs -f
```

### Stoppen:

```bash
docker-compose down
```

### Alles neu bauen:

```bash
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

---

## Lokale Entwicklung 

Für Entwicklung mit Hot-Reload ist es einfacher, nur MongoDB in Docker laufen zu lassen:

### 1. MongoDB mit Docker starten

```bash
docker-compose up -d mongodb
```

### 2. Backend lokal starten

```bash
cd backend
npm install
npm run dev  # Hot-Reload mit ts-node-dev
```

Der Backend-Server läuft auf `http://localhost:5000`

### 3. Frontend lokal starten (neues Terminal)

```bash
cd frontend
npm install
npm run dev  # Hot-Reload mit Vite
```

Das Frontend läuft auf `http://localhost:5173`

**Vorteile:**
- Sofortiges Hot-Reload bei Code-Änderungen
- Schnellere Entwicklung
- Keine Docker-Builds nach jeder Änderung
- Direkter Zugriff auf TypeScript-Fehler

## Umgebungsvariablen

### Backend (.env)

```env
PORT=5000
MONGO_URI=mongodb://admin:admin123@localhost:27017/web3db?authSource=admin
JWT_SECRET=mysecretkey123456789
NODE_ENV=development
```

