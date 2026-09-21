# Script de démonstration (5 minutes)

**Plateforme DevOps — Réservation FST Settat**
**Workflow : Prof → Chef de filière → Doyen → Paiement → Notification (en 5 min)**

---

## 1. Comptes de démonstration (6 comptes — se connnecter en onglets privés)

| # | Rôle | Login | Mot de passe | Email (compte seedé) |
|---|------|-------|--------------|----------------------|
| 1 | PROF | `prof` | `prof123` | `youssef.tazi@gmail.com` |
| 2 | CHEF_FILIERE | `chef` | `chef123` | `nadia.alaoui@gmail.com` |
| 3 | DOYEN | `doyen` | `doyen123` | `karim.benali@gmail.com` |
| 4 | ADMIN | `admin` | `admin123` | `salma.elidrissi@gmail.com` |
| 5 | ETUDIANT | `etudiant` | `etudiant123` | `imane.rachidi.fst@uhp.ac.ma` |
| 6 | CLUB (ex. CLIC) | `club.clic` | `club123` | `club.clic@gmail.com` |

> ⚠️ **Avant la démo** : ouvrir **3 onglets privés** (Prof, Chef, Doyen) — le JWT est
> par onglet (Context React), pour éviter de se déconnecter mutuellement.

---

## 2. Workflow à présenter (le flux à montrer)

```
Etape 1              Etape 2              Etape 3            Etape 4/5
PROF                CHEF_FILIERE        DOYEN              PAIEMENT + NOTIFICATION
demande salle  ──▶  valide (filière GI) ──▶ cachet doyen ──▶ paiement auto déclenché
(créneau libre)                       (PENDING→APPROVED)  (APPROVED→CONFIRMED)  + notification reçue par le PROF
```

Deux flux complémentaires (si le temps le permet) :
- **Flux CLUB → DOYEN** : le club `club.clic` crée un événement → le DOYEN l'approuve (cachet) ;
- **Flux ETUDIANT** : consultation de l'emploi du temps (lecture seule).

---

## 3. Déroulé minute par minute

### 0:00 → 0:30 — Accueil (onglet public)
- Présenter la page publique FST Settat (salles, emploi du temps, bouton Connexion).

### 0:30 → 1:15 — PROF : créer une réservation (onglet 1)
1. Login `prof` / `prof123` ;
2. Choisir une **salle** (ex. `A02`) + un **créneau libre** ;
3. Motif « TD programmation » → soumettre → statut **PENDING**.

### 1:15 → 1:45 — CHEF_FILIERE : valider (onglet 2)
1. Login `chef` / `chef123` ;
2. Voir la demande (notification + file de la filière GI) → **Valider** → statut **APPROVED**.

### 1:45 → 2:15 — DOYEN : cachet (onglet 3)
1. Login `doyen` / `doyen123` ;
2. **Cachet du doyen** → statut **CONFIRMED**.

### 2:15 → 2:45 — PAIEMENT AUTO + NOTIFICATION
- Le paiement se déclenche **automatiquement** au cachet du doyen ;
- Le PROF reçoit une **notification** (statut CONFIRMED + paiement) — onglet 1.

### 2:45 → 3:15 — ADMIN : tableau de bord (onglet 4)
- Login `admin` / `admin123` → dashboard (salles, utilisateurs, réservations, statuts).

### 3:15 → 4:00 — (Option) Flux CLUB → DOYEN
- Login `club.clic` / `club123` → créer un événement → DOYEN valide (cachet).

### 4:00 → 4:45 — Supervision
- **Grafana** : dashboard des 4 services (memory, CPU, requêtes/s, statut) ;
- **Prometheus** : cibles actives (`/targets`).

### 4:45 → 5:00 — Récapitulatif + conclusion
- 4 microservices + frontend, workflow 3 niveaux, 54 tests verts, CI/CD, supervision.

---

## 4. URLs d'accès (Docker Compose local)

| Composant | URL | Login / mdp |
|-----------|-----|-------------|
| Frontend | <http://localhost:3002> | — |
| Grafana | <http://localhost:3000> | `admin` / `admin` (par défaut provisionné) |
| Prometheus | <http://localhost:9090> | — |
| Prometheus Targets | <http://localhost:9090/targets> | — |
| phpMyAdmin | <http://localhost:8085> | `root` / (mdp MySQL — voir `.env`) |
| Actuator (ex. booking) | <http://localhost:8082/actuator/health> | — |

> ⚠️ Temps de démarrage : attendre que les 4 services soient **UP** (frontend 3002
> réponde) avant de commencer la démo.

---

## 5. Points à mettre en avant pendant la démo

- **Anti double-réservation** : contrainte `UNIQUE(salle, date, créneau)` + test de
  concurrence (2 réservations simultanées → 1 seule retenue) ;
- **Workflow 3 niveaux** traçable (statuts successifs) ;
- **Paiement automatique** au cachet du doyen (aucune action manuelle) ;
- **Notification ciblée** par rôle / filière / utilisateur (JWT) ;
- **CI/CD + K8s + Supervision** : la pipeline déploie en kind et valide les health-checks.

*Fin du script de démonstration.*