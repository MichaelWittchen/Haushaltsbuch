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

## Technologie-Stack

### Frontend
- React 18
- TypeScript
- Vite
- React Router v7
- Axios
- Tailwind CSS

### Backend
- Node.js
- Express
- TypeScript
- MongoDB mit Mongoose
- JWT (jsonwebtoken)
- bcryptjs für Passwort-Hashing

## Projektstruktur

```
Web3/
├── backend/           # Backend-Server
│   ├── src/
│   │   ├── config/   # Datenbank-Konfiguration
│   │   ├── models/   # Mongoose-Modelle
│   │   ├── routes/   # API-Routen
│   │   ├── middleware/ # Auth-Middleware
│   │   └── server.ts # Haupt-Server-Datei
│   ├── .env          # Umgebungsvariablen
│   ├── package.json
│   └── tsconfig.json
├── frontend/          # React-Frontend
│   ├── src/
│   │   ├── components/ # React-Komponenten
│   │   ├── context/   # React Context (Auth)
│   │   ├── pages/     # Seiten-Komponenten
│   │   ├── services/  # API-Services
│   │   ├── types/     # TypeScript-Typen
│   │   └── App.tsx
│   ├── package.json
│   ├── tsconfig.json
│   └── tailwind.config.js
├── db/                # MongoDB-Initialisierung
│   └── init-mongo.js
├── docker-compose.yml # Docker-Konfiguration
└── README.md
```

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

## Lokale Entwicklung (Empfohlen für Entwickler)

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

**Wichtig:** Ändern Sie `JWT_SECRET` für die Produktion!


## Einzelne Services starten

Sie können auch nur bestimmte Services starten:

```bash
# Nur MongoDB starten (z.B. für lokale Entwicklung)
docker-compose up -d mongodb

# Backend und MongoDB
docker-compose up -d mongodb backend

# Alle Services
docker-compose up -d
```

## Build für Produktion

Mit Docker (automatisch):
```bash
docker-compose build
docker-compose up -d
```

Oder manuell ohne Docker:
```bash
# Backend
cd backend
npm run build
npm start

# Frontend
cd frontend
npm run build
npm run preview
```

## Sicherheitshinweise

1. **JWT Secret:** Ändern Sie `JWT_SECRET` in der `.env` für Produktion
2. **MongoDB-Credentials:** Verwenden Sie sichere Passwörter in Produktion
3. **CORS:** Konfigurieren Sie CORS-Einstellungen für Ihre Produktions-Domain
4. **Umgebungsvariablen:** Committen Sie niemals `.env`-Dateien in Git

## Features und Funktionalität

### Authentifizierung
- Benutzerregistrierung mit Validierung
- Sicheres Login mit JWT-Tokens
- Passwort-Hashing mit bcryptjs
- Token-basierte Authentifizierung
- Protected Routes im Frontend

### Benutzerverwaltung
- Profil anzeigen
- Profil bearbeiten (Name, E-Mail)

### UI/UX
- Responsive Design mit Tailwind CSS
- Loading-States
- Fehlerbehandlung und Benutzer-Feedback
- Moderne und benutzerfreundliche Oberfläche

### Port bereits belegt
Wenn Port 5000 oder 5173 bereits belegt ist, ändern Sie die Ports in:
- Backend: `.env` - `PORT`
- Frontend: `vite.config.ts` - `server.port`

