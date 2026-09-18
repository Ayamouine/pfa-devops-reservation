# Plateforme de Réservation — PFA (FST Settat)

[![CI/CD](https://github.com/Ayamouine/pfa-devops-reservation/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/Ayamouine/pfa-devops-reservation/actions/workflows/ci-cd.yml)

Application de réservation de salles de la FST Settat, réalisée en architecture microservices.
Elle est prête pour une démonstration locale via Docker Compose et pour un déploiement Kubernetes.

## Contenu principal

- `frontend/` — application React (page d'accueil publique + espace par rôle)
- `services/` — microservices Spring Boot
	- `auth-service/` — authentification (JWT, refresh, forgot/reset, verify, rôles, codes d'inscription)
	- `booking-service/` — salles, réservations, workflow de validation, documents PDF, appel paiement
	- `notification-service/` — notifications ciblées par utilisateur / rôle / filière
	- `payment-service/` — paiement simulé (déclenché par le cachet du doyen)
- `k8s/` — manifests Kubernetes (déployés et validés automatiquement par la CI sur un cluster `kind`, voir `docs/k8s.md`)
- `docker-compose.yml` — environnement local
- `.github/workflows/ci-cd.yml` — pipeline CI/CD : tests → build → push GHCR → déploiement Kubernetes (kind)
- `docs/` — documentation et outils (UML, Postman)

## Rôles & codes d'inscription

| Rôle | Libellé | Code d'inscription | Peut réserver |
|------|---------|--------------------|---------------|
| `ETUDIANT` | Étudiant | — (aucun) | Non (consultation de l'emploi du temps) |
| `PROF` | Professeur | `pfa-prof-2026` | Oui |
| `CHEF_FILIERE` | Chef de filière | `pfa-chef-2026` | Oui + valide les demandes de sa filière |
| `DOYEN` | Doyen | `pfa-doyen-2026` | Oui + signe/cachet final (déclenche le paiement) |
| `CLUB` | Club étudiant | `pfa-club-2026` | Oui (événements validés directement par le doyen) |
| `ADMIN` | Administrateur | `pfa-admin-2026` | Gestion des salles et des utilisateurs |

Le rôle `USER` reste accepté par l'API (compatibilité ascendante).

## Comptes de démonstration (seed)

Créés automatiquement au premier démarrage si la base est vide (`auth-service`) :

La connexion se fait désormais avec l'**email institutionnel** (`prenom.nom.fst@uhp.ac.ma`) et le mot de passe.

| Email | Mot de passe | Rôle |
|-------|--------------|------|
| `salma.elidrissi.fst@uhp.ac.ma` | `admin123` | ADMIN |
| `karim.benali.fst@uhp.ac.ma` | `doyen123` | DOYEN |
| `nadia.alaoui.fst@uhp.ac.ma` | `chef123` | CHEF_FILIERE (GI) |
| `youssef.tazi.fst@uhp.ac.ma` | `prof123` | PROF (GI) |
| `imane.rachidi.fst@uhp.ac.ma` | `etudiant123` | ETUDIANT (GI) |

Clubs étudiants (mot de passe commun `club123`) : `club.clic.fst@uhp.ac.ma`, `club.ctde.fst@uhp.ac.ma`,
`club.bac.fst@uhp.ac.ma`, `club.btec.fst@uhp.ac.ma`, `club.fire.fst@uhp.ac.ma`, `club.code.fst@uhp.ac.ma`.
L'inscription d'un compte `CLUB` exige le code `pfa-club-2026` et le nom du club.

`booking-service` seed également les salles réelles de la FST (amphis, blocs A-D, cycle ingénieur, Amphi Central) et quelques demandes de démonstration.

## Démarrage local (Docker Compose)

Pré-requis : Docker et Docker Compose. Ouvrir un terminal à la racine du projet :

```bash
docker compose up --build
```

Accès :

- Frontend : http://localhost:3002
- Auth : http://localhost:18081
- Booking : http://localhost:8082
- Notification : http://localhost:18083
- Payment : http://localhost:8084
- phpMyAdmin : http://localhost:8085

## Workflow de réservation (3 niveaux)

1. Un **professeur** (ou chef/doyen) crée une demande → statut `PENDING` (notification au chef de sa filière).
2. Le **chef de filière** valide ou refuse → statut `APPROVED` / `REJECTED` (notification au doyen).
3. Le **doyen** appose le cachet final → statut `CONFIRMED` + **paiement simulé automatique**.
4. À tout moment, le demandeur peut **modifier** (retour en `PENDING`) ou **annuler** sa demande.

**Cas particulier — événement de club** : une demande créée par un compte `CLUB` (`bookingType=EVENEMENT`)
passe directement en `APPROVED` et est notifiée au doyen. À la signature du doyen, un **PDF d'autorisation
signé** est généré et téléchargeable par le club (`GET /bookings/{id}/signed-document`).

Statuts : `PENDING`, `APPROVED`, `REJECTED`, `CONFIRMED`, `CANCELLED`.

## Commandes rapides

```bash
# Lancer un service Spring Boot localement (exemple)
cd services/auth-service && mvn -B spring-boot:run

# Tests d'un service
cd services/booking-service && mvn -B verify

# Frontend
cd frontend && npm ci && npm start
```

## Endpoints clés

**Auth** (`auth-service`)

- `POST /auth/register` — body: `{ username, email, password, role?, adminCode?, firstName?, lastName?, filiere? }` (email institutionnel `@uhp.ac.ma` requis)
- `POST /auth/login` — body: `{ email, password }` → `token` + `refreshToken` (le `username` reste accepté pour compatibilité)
- `POST /auth/refresh` — body: `{ refreshToken }`
- `POST /auth/forgot` — body: `{ email }` / `POST /auth/reset` / `GET /auth/verify?token=`
- `PUT /auth/profile?username=` — mise à jour du profil (mot de passe actuel requis)
- `GET /auth/users`, `POST /auth/users` (création de compte), `PUT /auth/users/{id}/role`, `PUT /auth/users/{id}/filiere`, `DELETE /auth/users/{id}` (admin)

**Booking** (`booking-service`)

- `GET /resources`, `POST/PUT/DELETE /resources` (admin)
- `GET /bookings/availability?resource=&date=&creneau=` et `GET /bookings/availability/day?date=`
- `GET /bookings/calendar?from=&to=&resource=&filiere=` (vues jour / semaine / mois)
- `POST /bookings`, `GET /bookings/mine?username=`, `PUT /bookings/{id}`, `DELETE /bookings/{id}`
- `GET /bookings/approvals`, `POST /bookings/{id}/approve|reject|confirm`
- `POST /bookings/{id}/document` (PDF), `GET /bookings/{id}/document`
- `GET /bookings/{id}/signed-document` (PDF d'autorisation signé pour un événement de club)

**Notification** (`notification-service`)

- `GET /notifications/my`, `GET /notifications/unread-count`
- `PATCH /notifications/{id}/read`, `POST /notifications/read-all`

**Payment** (`payment-service`)

- `POST /payments` — paiement mock (aussi appelé automatiquement à la confirmation)

## Frontend

Le frontend utilise `frontend/src/api.js` pour les appels. URLs configurables via :

```bash
REACT_APP_AUTH_URL=http://localhost:18081
REACT_APP_BOOKING_URL=http://localhost:8082
REACT_APP_NOTIFICATION_URL=http://localhost:18083
REACT_APP_PAYMENT_URL=http://localhost:8084
```

## Tests

- Unitaires + intégration (Maven) : `mvn -B verify` dans chaque service ; un test de concurrence
  (`ConcurrentBookingIntegrationTest`) valide l'absence de double réservation.
- E2E (Cypress) : `docker compose -f docker-compose.yml -f docker-compose.cypress.yml up --build --abort-on-container-exit --exit-code-from cypress`

## Postman

Importer `docs/postman_collection.json` (variables `token`, `bookingId`, etc. gérées par les scripts) pour dérouler le scénario complet : inscription par rôle, login, réservation, validation, cachet, notifications.

## Scénario de soutenance (5 minutes)

1. Architecture & diagrammes UML (`docs/UML.md`) — 1 min
2. Démo : accueil public → inscription/login → demande de réservation (prof) → validation (chef) → cachet + paiement (doyen) → notifications — 2 min 30
3. CI/CD et déploiement K8s — 1 min
4. Conclusion et améliorations possibles — 30 s

## Prochaines étapes recommandées

- Monitoring (Prometheus + Grafana)
- Envoi d'e-mails réel pour vérification et rappels
- Génération de factures PDF signées
- Tests de charge sur la contrainte anti double-réservation
