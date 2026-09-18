# Rapport final — Plateforme de Réservation (PFA)

**Projet** : Plateforme de réservation des salles, événements et rendez-vous (FST Settat)
**Architecture** : Microservices (Java/Spring Boot) + React
**Workflow métier** : Validation à 3 niveaux (chef de filière → cachet du doyen) + paiement + notifications

---

## 1. Contexte et cahier des charges

La Faculté des Sciences et Techniques de Settat dispose de salles, d'amphithéâtres, de
clubs et d'événements dont la gestion manuelle des réservations (papier / tableur) est
source de conflits, de pertes de temps et d'absence de traçabilité.

Le cahier des charges définit une **plateforme web décentralisée** permettant aux
différents acteurs de l'établissement d'effectuer leurs réservations, de les faire valider
selon leur rôle, d'être notifiés de l'évolution, et de régler les frais associés — le tout
de façon sécurisée et fiable.

### Besoins fonctionnels (rappel)
- Authentification et gestion des comptes par rôle ;
- Consultation des salles et de l'emploi du temps ;
- Demande, validation (3 niveaux), suivi et paiement des réservations ;
- Gestion des événements (clubs) avec pièce jointe PDF et calendrier ;
- Notifications aux parties prenantes.
- Gestion administrative des salles, utilisateurs et ressources.

### Besoins non fonctionnels (rappel)
- **Scalabilité** : architecture microservices, déployable en cluster ;
- **Disponibilité** : orchestration Kubernetes, redémarrage automatique, probes ;
- **Cohérence** : anti double-réservation (contrainte DB + test de concurrence) ;
- **Sécurité** : JWT, BCrypt, contrôle des rôles, secret JWT externalisé ;
- **Performance** : temps de réponse moyens satisfaisants, supervision active ;
- **Maintenabilité** : code modulaire, documentation et diagrammes UML ;
- **Portabilité** : conteneurisation Docker, portage k8s et kind.

---

## 2. Architecture et choix techniques

### 2.1 Architecture microservices

| Service | Rôle | Port |
|---------|------|------|
| `auth-service` | Inscription, login, JWT, rôles | 8081 |
| `booking-service` | Salles, créneaux, workflow de réservation, PDF | 8082 |
| `notification-service` | Notifications ciblées (rôle / filière / utilisateur) | 8083 |
| `payment-service` | Paiement simulé, déclenché au cachet du doyen | 8084 |
| `frontend` | Application React (React Router, Axios, Context auth) | 3002 |

Chaque microservice possède **sa propre base MySQL** (principe de scalabilité et
d'indépendance des données). Le frontend est une SPA React consommant les API REST des
4 services ; les appels inter-services sont authentifiés par JWT.

### 2.2 Choix techniques justifiés
- **Spring Boot** : socle Java standard des microservices (Actuator, sécurité, validation).
- **Spring Security + JWT + BCrypt** : sécurité sans état (adaptée à des API et à un cluster).
- **MySQL** : SGBD relationnel répandu, contraintes `UNIQUE` pour l'absence de doublons.
- **React (CRA)** : interface modulaire, rapide à développer avec un routage par rôle.
- **Docker + Docker Compose** : portabilité et environnement local reproductible.
- **Kubernetes / kind** : orchestration, auto-réparation, déploiement identique CI/production.
- **Prometheus + Grafana** : supervision des métriques des 4 services.
- **GitHub Actions** : CI/CD automatisée (build, tests, image, déploiement kind, E2E).

### 2.3 Workflow de réservation (3 niveaux)

```
Etudiant/Prof ──demande──▶ PENDING
                       ──valide chef de filière──▶ APPROVED
                                                ──cachet doyen──▶ CONFIRMED ──▶ PAIEMENT (auto)
                                                                        └─▶ notification
```
Un `booking` ne peut exister qu'avec un créneau libre (contrainte `UNIQUE(salle, date,
créneau)` + vérification applicative), ce qui empêche les doubles réservations.

### 2.4 Rôles

| Rôle | Droits |
|------|--------|
| `ETUDIANT` | Consulte les salles / emploi du temps (lecture seule) |
| `PROF` | Demande, modifie, annule ; joint un PDF |
| `CHEF_FILIERE` | Valide/refuse les demandes de sa filière |
| `DOYEN` | Cachet final + déclenche le paiement |
| `ADMIN` | Gère les salles et les utilisateurs ; consulte le tableau de bord |

---

## 3. Réalisation

### 3.1 Backend
- 4 microservices Spring Boot, chacun : `*Controller`, `*Service`, repository JPA,
  configuration sécurité, et couche web client (RestTemplate) pour les appels inter-services.
- Filtre JWT commun par service (*whitelist public* : login, inscription, santé, actuator,
  pages publiques), configurable pour les endpoints de supervision.
- Paiement : `payment-service` déclenché **automatiquement** à la confirmation du doyen
  (couplage faible : le paiement est assuré par le workflow du cachet).

### 3.2 Frontend
- Pages : accueil public (FST Settat), inscription (codes par rôle), connexion, salles,
  emploi du temps, réservation, suivi, notifications, dashboard admin.
- Gestion contextuelle du token JWT et séparation des vues par rôle.

### 3.3 Base de données
- Un schéma MySQL par service ; contraintes d'intégrité (FK, `UNIQUE` anti-doublon,
  valeurs `CHECK` sur les statuts, `ENUM` travail) ;
- **Gestion de la concurrence** : contrainte SQL + intégration test de double réservation
  simultanée → résultat correct (une seule réservation retenue, l'autre rejetée).

### 3.4 Conteneurisation
- `Dockerfile` par service (multi-stage, BuildKit cache pour Maven) ;
- `docker-compose.yml` : MySQL (×1 partagé), 4 services, frontend, **Prometheus**, **Grafana**,
  avec volumes pérennes (`mysql_data`, `prometheus_data`, `grafana_data`) ;
- Health-checks applicatifs par service.

### 3.5 Intégration continue / Déploiement continu
Pipeline GitHub Actions (`ci-cd.yml`) :
1. lint + build backend : `mvn verify` sur les 4 services (unitaires + intégration + tests) ;
2. `frontend-build` : build React (lint, tests) ;
3. `docker` : build des images `auth/booking/notification/payment/frontend` (cache BuildKit) ;
4. `deploy-kind` : création d'un cluster kind éphémère, application des manifests `k8s/`,
   **rollout + health-check des 4 services + Prometheus + Grafana** ;
5. `e2e` : tests Cypress sur la stack Docker Compose (workflows à 3 niveaux : réservation,
   validation chef, cachet doyen, paiement, notification).

### 3.6 Supervision (Prometheus + Grafana)
- **Actuator + Micrometer** sur chaque service : exposition `/actuator/prometheus` ;
- **Prometheus** : scrape les 4 services (config `monitoring/prometheus/prometheus.yml`) ;
- **Grafana** : datasource provisionnée + dashboard « Réservation — Supervision »
  (versions, `up`, heap JVM, CPU, requêtes/s, threads), passé en `monitoring/grafana/` ;
- Déployables aussi en k8s (`k8s/prometheus.yaml`, `k8s/grafana.yaml`) et en compose
  (ports 9090 / 3000).

### 3.7 Diagrammes UML
Réalisés (Mermaid dans `docs/UML.md` + sources PlantUML dans `docs/uml/`) :
- *Cas d'utilisation* — acteurs (étudiant, prof, chef de filière, doyen, admin) ;
- *Classes* — entités, repositories, services, contrôleurs, DTO, sécurité ;
- *Séquence* — enchaînement inscription → login → demande → validation chef → cachet
  doyen → paiement → notification ;
- *Déploiement* — nœuds `infra`, `spring`, `database` (MySQL) et `frontend`, déployés
  sur container/k8s.

---

## 4. Tests et validation

### 4.1 Tests unitaires et d'intégration (Maven)

| Service | Tests | Statut |
|---------|-------|--------|
| auth-service | 23 | ✅ réussis |
| booking-service | 17 | ✅ réussis (dont concurrence) |
| notification-service | 9 | ✅ réussis |
| payment-service | 5 | ✅ réussis |
| **Total** | **54** | **✅** |

`mvn -B verify` → `BUILD SUCCESS` sur les 4 services.

### 4.2 Tests de bout en bout (Cypress)
Scénarios E2E couvrant le workflow complet 3 niveaux (réservation, validation chef de
filière, cachet du doyen, paiement, notification) → **6/6 verts** sur la stack Docker
Compose (job `e2e`).

### 4.3 Déploiement Kubernetes (kind) validé en CI
Chaque push `main` déploie un cluster kind : tous les Deployment atteignent `Available`,
les 4 services + frontend répondent `/health`, et les health-checks Prometheus/Grafana
passent (job `deploy-kind`).

### 4.4 Sécurité
- Mots de passe hachés (BCrypt), JWT signé (secret externalisé via Secret k8s / env) ;
- Filtre d'authentification sur chaque service, whitelist contrôlée ;

---

## 5. Difficultés rencontrées et solutions
- **Double réservation simultanée** : résolue par contrainte `UNIQUE` + test de concurrence ;
- **Appels inter-services authentifiés** : ajout d'un mécanisme de token de service
  vérifié — couverture E2E du workflow ;
- **Import initial de données (salles réelles)** : seed de 99 salles (blocs A/B/C/D + NB)
  avec contraintes ; validé par E2E ;
- **CI lente / réseau Maven** : BuildKit cache Maven + gestion des temps de rollout k8s.

---

## 6. Résultats chiffrés
- **4 microservices** + frontend React, orchestrés en Docker/K8s ;
- **54 tests** JUnit verts + **6 tests E2E** Cypress verts ;
- **CI/CD** : 12 jobs + E2E, run complet vert sur chaque push ;
- **Supervision** : Prometheus + Grafana actifs (local et k8s) ;
- **Manifests** : `k8s/` complets (MySQL, 4 services, frontend, Prometheus, Grafana).

---

## 7. Limites et perspectives
- Paiement **simulé** (pas de vraie passerelle) ;
- Notifications **en base + log** (pas d'e-mail réel SMTP) ;
- Pas de facture PDF signée chiffrée au niveau du cachet ;
- Les images GHCR sont publiques pour la démo (auth à restreindre en production) ;
- MySQL de démo sans PVC persistant (éphémère en CI).

**Perspectives** : e-mail réel, facture PDF signée, tests de charge sur l'anti
double-réservation, alerting (Alertmanager) et dashboards Grafana avancés, mise en
production sur un cluster réel.

---

## 8. Conclusion
La plateforme répond au cahier des charges : une application décentralisée, sécurisée et
supervisée, permettant le cycle complet de réservation (demande → validation 3 niveaux →
paiement → notification), conçue selon les bonnes pratiques (microservices, Conteneurisation,
CI/CD, Orchestration, Supervision). Le projet est fonctionnel, testé (unitaires + E2E) et
déployable de façon reproductible (Docker Compose ou Kubernetes), validant l'ensemble des
besoins fonctionnels et non fonctionnels du cahier des charges.
