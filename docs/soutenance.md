# Soutenance — Plateforme de Réservation (FST Settat)

> Objectif : **présentation 5 minutes** + démo, puis questions.
> Format : **5 slides** (1 slide ≈ 1 minute), script timé ci-dessous.

---

## Plan de la présentation (5 slides / 5 min)

| # | Slide | Durée | Contenu |
|---|-------|-------|---------|
| 1 | Problématique & Objectifs | 45 s | Cahier des charges, besoins, acteurs |
| 2 | Architecture microservices | 1 min | 4 services + frontend, workflow 3 niveaux, sécurité JWT |
| 3 | Conteneurisation & CI/CD | 1 min | Docker Compose, kind, pipeline GitHub Actions (12 jobs + E2E) |
| 4 | Supervision & Déploiement | 1 min | Prometheus + Grafana, Kubernetes, anti double-réservation |
| 5 | Résultats & Démo | 1 min 15 | Tests (54 unitaires + 6 E2E), démo en direct |

---

## Script timé (orateur)

### Slide 1 — Problématique & Objectifs (0:00 → 0:45)
> « Les salles et amphis de la FST Settat sont réservées sur papier, ce qui cause des
> conflits de créneaux, des pertes de temps et aucun suivi. Notre projet décentralise
> ces réservations : les professeurs demandent des salles pour leurs cours ou événements
> clubs, avec un workflow de validation garantissant une traçabilité complète. »

### Slide 2 — Architecture microservices (0:45 → 1:45)
> « Nous avons construit 4 microservices Spring Boot — authentification, réservation,
> notification, paiement — chacun avec sa propre base MySQL. Le cœur métier : un workflow
> de validation à 3 niveaux. Un professeur dépose sa demande ; le chef de filière
> l'approuve ; le doyen appose son cachet, ce qui déclenche automatiquement le paiement
> et les notifications. Le tout est sécurisé par JWT et BCrypt. »

### Slide 3 — Conteneurisation & CI/CD (1:45 → 2:45)
> « Chaque service est conteneurisé (Docker), orchestré par Docker Compose en local, et
> déployé sur Kubernetes en production. Le pipeline GitHub Actions fait tout : build,
> tests unitaires, images, déploiement sur un cluster kind de validation, et les tests
> E2E Cypress — 12 jobs à chaque push. »

### Slide 4 — Supervision & Déploiement (2:45 → 3:45)
> « Côté robustesse : une contrainte SQL unique combinée à un test de concurrence empêche
> toute double réservation sur un même créneau. Pour la supervision, chaque service
> expose ses métriques via Actuator, collectées par Prometheus et affichées dans une
> dashboard Grafana : charge, mémoire, requêtes par seconde. »

### Slide 5 — Résultats & Démo (3:45 → 5:00)
> « Résultats chiffrés : 4 microservices, 54 tests unitaires verts, 6 tests E2E, une CI
> déployant automatiquement sur Kubernetes avec Prometheus et Grafana. Passons à la
> démo : je vais réserver une salle en tant que professeur, la faire valider par le chef
> de filière, puis par le doyen, et vous montrer le paiement et la notification qui en
> découlent. »

---

## Script de la démo (en direct, ~2 min)

1. **Accueil** : présenter la page publique (FST Settat, bouton S'inscrire / Se connecter).
2. **Login PROF** : `prof.demo@fst-settat.ma` / `password123`.
3. **Créer une réservation** : choisir une salle (ex. **A02**), un créneau libre, joindre un PDF,
   motif « TD programmation ».
4. **Login CHEF_FILIERE** : `chef.ir@fst-settat.ma` / `password123` → **Valider** la demande.
5. **Login DOYEN** : `doyen@fst-settat.ma` / `password123` → **Cachet** → le paiement se déclenche.
6. **Notifier** : montrer la notification reçue par le professeur (statut CONFIRMED).
7. **Dashboard ADMIN** : montrer le tableau de bord (salles, utilisateurs, réservations).

> Astuce : garder plusieurs onglets/Comptes privés pour les 3 rôles pendant la démo.

---

## Questions susceptibles d'être posées
- Comment évitez-vous la double réservation ? → contrainte `UNIQUE(salle, date, créneau)`
  + test de concurrence (`ConcurrentBookingIntegrationTest`).
- Pourquoi des microservices plutôt qu'une application monolithique ? → scalabilité,
  indépendance des équipes/Bases, redéploiement séparé.
- Comment la sécurité fonctionne-t-elle entre services ? → JWT signé, BCrypt, token
  de service pour appels inter-services.
- Comment déployez-vous ? → Docker Compose (local) + Kubernetes (production, kind en CI).
- Comment supervisez-vous ? → Actuator → Prometheus → Grafana.

---

## Vérifications avant la soutenance
- [ ] `docker compose up -d --build` OK (les 4 services + frontend + Prometheus + Grafana).
- [ ] `mvn -B verify` → BUILD SUCCESS sur les 4 services.
- [ ] La CI GitHub Actions est verte (dernier push).
- [ ] Les comptes démo fonctionnent (3 rôles) et le workflow 3 niveaux est OK en E2E.
- [ ] Ports : frontend **3002**, Prometheus **9090**, Grafana **3000**.

---

## Document à remettre
- [ ] `docs/rapport.md` — rapport final complet (fourni).
- [ ] Diagrammes UML (`docs/UML.md` + `docs/uml/*.puml`).
- [ ] README, architecture, planning, k8s — tous à jour.
- [ ] Collection Postman (`docs/postman_collection.json`).
