// MongoDB Initialisierungs-Script
db = db.getSiblingDB('web3db');

// Erstelle Collection für Benutzer
db.createCollection('users');

// Erstelle Index für E-Mail (unique)
db.users.createIndex({ email: 1 }, { unique: true });

print('MongoDB wurde erfolgreich initialisiert!');
