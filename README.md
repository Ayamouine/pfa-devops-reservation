# Plateforme DevOps pour une application de réservation

Ce projet a pour objectif de concevoir une application web de réservation (salles, événements, rendez-vous) basée sur une architecture microservices, avec une approche DevOps complète : conteneurisation, CI/CD, orchestration et supervision.

## Objectif du projet

- Développer une application moderne et modulaire.
- Implémenter plusieurs microservices indépendants.
- Automatiser le cycle de vie avec Docker, GitHub Actions et Kubernetes.
- Mettre en place une base solide pour la documentation, le déploiement et la traçabilité.

## Architecture proposée

- Frontend : React
- Auth Service : Spring Boot + JWT
- Booking Service : Spring Boot + MySQL
- Notification Service : Spring Boot
- Payment Service : Spring Boot (mock)
- Base de données : MySQL par service
- Déploiement : Docker + Docker Compose + Kubernetes
- CI/CD : GitHub Actions

## Structure du dépôt

```text
.
├── docs/
├── services/
│   ├── auth-service/
│   ├── booking-service/
│   ├── notification-service/
│   └── payment-service/
├── frontend/
├── docker-compose.yml
└── .github/workflows/
```

## Étapes de réalisation

1. Analyse et conception
2. Développement des microservices backend
3. Développement du frontend
4. Mise en place des bases de données
5. Conteneurisation avec Docker
6. Pipeline CI/CD avec GitHub Actions
7. Déploiement sur Kubernetes
8. Tests et documentation finale

## Prochaine étape recommandée

Commencer par la mise en place du service d’authentification puis du service de réservation, puis relier le frontend.
