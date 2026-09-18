# Architecture du système

## Vue d’ensemble

La plateforme est conçue selon une architecture microservices afin de séparer les responsabilités et de faciliter la maintenance, la scalabilité et le déploiement.

## Composants principaux

### 1. Frontend
- Interface web développée avec React.
- Page d'accueil publique présentant la FST Settat, puis espace authentifié adapté au rôle
  (étudiant, professeur, chef de filière, doyen, administrateur).
- Permet l'inscription, la connexion, la consultation des salles et de l'emploi du temps,
  la gestion des réservations, des validations et des notifications.

### 2. Auth Service
- Gère l'authentification, les rôles et les codes d'inscription du personnel.
- Rôles : `ETUDIANT`, `PROF`, `CHEF_FILIERE`, `DOYEN`, `ADMIN` (+ `USER` historique).
- Utilise JWT pour sécuriser les appels API.

### 3. Booking Service
- Gère les salles, leurs caractéristiques (bâtiment, étage, capacité, équipement) et les créneaux.
- Vérifie la disponibilité avant chaque réservation (contrainte SQL unique) pour éviter les doubles réservations.
- Implémente le workflow de validation à 3 niveaux : `PENDING` → `APPROVED` (chef de filière) → `CONFIRMED` (cachet du doyen, déclenche le paiement).
- Gère les documents PDF joints et l'historique des étapes (`WorkflowStep`).

### 4. Notification Service
- Notifie de façon ciblée un utilisateur, un rôle ou une filière.
- Gère l'état lu/non-lu et l'historique des notifications.

### 5. Payment Service
- Simule le paiement, déclenché automatiquement à la confirmation (cachet du doyen).

### 6. Monitoring (Prometheus + Grafana)
- Les 4 microservices exposent leurs métriques application (JVM, CPU, threads, requêtes HTTP)
  via Spring Boot Actuator (`/actuator/prometheus`).
- Prometheus collecte ces métriques (fichier `monitoring/prometheus/prometheus.yml`).
- Grafana affiche un dashboard provisionné automatiquement (« PFA Réservation — Supervision »,
  `monitoring/grafana/`).

## Rôles et workflow

| Rôle | Actions principales |
|------|---------------------|
| `ETUDIANT` | Consulte les salles et l'emploi du temps (ne réserve pas) |
| `PROF` | Demande, modifie et annule des réservations ; joint un PDF |
| `CHEF_FILIERE` | Valide ou refuse les demandes de sa filière |
| `DOYEN` | Appose le cachet final (confirmation + paiement) |
| `ADMIN` | Gère les salles et les utilisateurs |


## Bases de données

Chaque microservice possède sa propre base de données MySQL pour garantir l’indépendance et la modularité.

## Déploiement

- Docker pour la conteneurisation
- Docker Compose pour l’environnement local (y compris Prometheus + Grafana)
- Kubernetes pour l’orchestration en production
- GitHub Actions pour l’intégration continue et le déploiement automatique

## Diagrammes UML

Réalisés dans `docs/uml/` et présentés en Mermaid dans `docs/UML.md` :

- Diagramme de cas d’utilisation
- Diagramme de classes
- Diagramme de séquence
- Diagramme de déploiement
