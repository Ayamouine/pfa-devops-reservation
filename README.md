# Plateforme de Réservation — PFA

[![CI/CD](https://github.com/Ayamouine/pfa-devops-reservation/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/Ayamouine/pfa-devops-reservation/actions/workflows/ci-cd.yml)

Ce dépôt contient une application de réservation (salles / événements) réalisée en architecture microservices. Il est prêt pour une démonstration locale via Docker Compose et pour un déploiement Kubernetes.

## Contenu principal

- `frontend/` — application React
- `services/` — microservices Spring Boot
	- `auth-service/` — authentification (JWT, refresh, forgot/reset, verify)
	- `booking-service/` — ressources et réservations
	- `notification-service/` — notifications
	- `payment-service/` — paiement simulé
- `k8s/` — manifests Kubernetes (déployés et validés automatiquement par la CI sur un cluster `kind`, voir `docs/k8s.md`)
- `docker-compose.yml` — environnement local
- `.github/workflows/ci-cd.yml` — pipeline CI/CD : tests → build → push GHCR → déploiement Kubernetes (kind)
- `docs/` — documentation et outils (UML, Postman)

## Démarrage local (Docker Compose)

Pré-requis : Docker et Docker Compose.

Ouvrir un terminal à la racine du projet :

```bash
docker compose up --build
```

Accès :
- Frontend : http://localhost:3001
- Auth : http://localhost:8081
- Booking : http://localhost:8082
- Notification : http://localhost:8083
- Payment : http://localhost:8084

## Commandes rapides

Lancer un service Spring Boot localement (exemple) :

```bash
cd services/auth-service
mvn -B spring-boot:run
```

Lancer les tests :

```bash
cd services/booking-service
mvn -B test
```

## Endpoints clés

- `POST /auth/register` — body: `{ username, password, role?, adminCode? }`
- `POST /auth/login` — body: `{ username, password }` → retourne `token` et `refreshToken`
- `POST /auth/refresh` — body: `{ refreshToken }` → obtient nouveau JWT
- `POST /auth/forgot` — body: `{ username }` → retourne `resetToken` (demo)
- `POST /auth/reset` — body: `{ token, newPassword }`
- `GET /auth/verify?token=...`

- `GET /resources` — liste ressources actives
- `POST /resources` — créer ressource (admin)
- `GET /bookings/availability?resource=...&date=YYYY-MM-DD` — disponibilité
- `POST /bookings` — créer réservation (Authorization: Bearer JWT)
- `POST /bookings/{id}/confirm?username=&role=` — confirmer réservation
- `DELETE /bookings/{id}?username=&role=` — annuler réservation

- `POST /payments` — créer paiement mock

## Frontend

Le frontend utilise `frontend/src/api.js` pour les appels. Les URLs peuvent être configurées via :

```bash
REACT_APP_AUTH_URL=http://localhost:8081
REACT_APP_BOOKING_URL=http://localhost:8082
REACT_APP_NOTIFICATION_URL=http://localhost:8083
REACT_APP_PAYMENT_URL=http://localhost:8084
```

## Tests d'intégration

Un test de concurrence est inclus :
`services/booking-service/src/test/.../ConcurrentBookingIntegrationTest.java`.

## Postman

Importer `docs/postman_collection.json` pour exécuter les scénarios de démonstration (inscription, login, réservation, paiement, confirmation).

## Scénario de soutenance (5 minutes)

1. Architecture & diagrammes UML (`docs/UML.md`) — 1 min
2. Démo rapide :
	 - Inscription + login (30s)
	 - Créer réservation + payer (1 min)
	 - Confirmer réservation + notifications (30s)
3. CI/CD et déploiement K8s (1 min)
4. Conclusion et améliorations possibles (30s)

## Prochaines étapes recommandées

- Monitoring (Prometheus + Grafana)
- Envoi d'e-mails réel pour vérification et rappels
- Génération de factures (PDF)
- Tests E2E automatisés (Cypress/Postman Runner)

---


