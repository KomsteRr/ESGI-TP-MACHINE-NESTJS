# API de Partage de Recettes

Ce projet est une application backend développée avec NestJS, destinée à la gestion de recettes, d'utilisateurs et de notations. Il inclut l'authentification, les notifications par email et interagit avec une base de données SQLite via Prisma.

## Technologies

- NestJS
- Prisma
- SQLite
- Docker
- Mailhog

## Prérequis

- Node.js (v20 ou supérieur)
- Docker & Docker Compose
- NPM

## Installation

1. Cloner le dépôt
2. Installer les dépendances :

```bash
npm install
```

3. Configurer les variables d'environnement. Un fichier `.env` est requis à la racine. Vous pouvez utiliser les valeurs par défaut ou les configurer selon vos besoins :
   - PORT
   - DATABASE_URL
   - JWT_SECRET
   - MAIL_HOST, MAIL_PORT, MAIL_USER, MAIL_PASS, MAIL_FROM

## Lancement de l'application

### Avec Docker (Recommandé)

Pour lancer l'application et tous les services requis (Mailhog) :

```bash
docker-compose up -d
```

L'API sera disponible sur `http://localhost:3500`.

### Développement Local
il n'y auras pas de mailhog de cette façons

1. Générer le client Prisma :
```bash
npx prisma generate
```

2. Lancer le serveur :
```bash
npm run start:dev
```

## Documentation

La documentation de l'API est générée via Swagger et est disponible à l'adresse suivante :

http://localhost:3500/swagger

## Services

- **API** : http://localhost:3500
- **Mailhog (Test d'emails)** : http://localhost:8025 (Interface Web)
