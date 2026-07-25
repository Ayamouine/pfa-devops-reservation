# Architecture du système

## Vue d’ensemble

La plateforme est conçue selon une architecture microservices afin de séparer les responsabilités et de faciliter la maintenance, la scalabilité et le déploiement.

## Composants principaux

### 1. Frontend
- Interface web développée avec React.
- Permet l’inscription, la connexion, la consultation des disponibilités et la gestion des réservations.

### 2. Auth Service
- Gère l’authentification et les rôles.
- Utilise JWT pour sécuriser les appels API.

### 3. Booking Service
- Gère les salles, événements et créneaux.
- Vérifie la disponibilité avant chaque réservation pour éviter les doubles réservations.

### 4. Notification Service
- Envoie des rappels et conserve l’historique des notifications.

### 5. Payment Service
- Simule le paiement lors de la confirmation d’une réservation.

## Bases de données

Chaque microservice possède sa propre base de données MySQL pour garantir l’indépendance et la modularité.

## Déploiement

- Docker pour la conteneurisation
- Docker Compose pour l’environnement local
- Kubernetes pour l’orchestration en production
- GitHub Actions pour l’intégration continue et le déploiement automatique

## Diagrammes à prévoir

- Diagramme de cas d’utilisation
- Diagramme de classes
- Diagramme de séquence
- Diagramme de déploiement
