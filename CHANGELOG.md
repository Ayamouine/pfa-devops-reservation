# CHANGELOG PFA — Réservation des salles (FST Settat)

Historique des corrections et évolutions. Chaque entrée = une phase/une correction livrée.

---

## [PHASE 2] Refonte « bleu → vert » — palette verte cohérente — livré

Remplacement **exhaustif** de la palette bleue par une palette verte, appliqué via variables CSS + valeurs en dur, **prouvé par scan** (grep/Select-String fiable, toutes casses).

| Zone | Avant (bleu) | Après (vert) |
|------|--------------|--------------|
| `App.css :root --ink` | `#0b2545` | `#1B5E20` |
| `App.css :root --primary` | `#13315c` | `#2E7D32` |
| `App.css :root --primary-light` | `#1b4a8a` | `#4CAF50` |
| `App.css :root --accent-light` | `#e8c98a` | `#A5D6A7` |
| `App.css :root --primary-dark` *(navier)* | `#1b4a8a` | `#2E7D32` |
| `App.css :root --accent-dark` | *(bleu-violet)* | `#1B5E20` |
| `App.css :root --gold` | *(bleu-gris)* | `#A5D6A7` |
| `App.css corps (fondu, fond, surbrillance, status-confirmed)` | 7 hexas + 1 rgba bleus | verts `#F1F8E9/#E8F5E9/#A5D6A7` |
| `ProfilePage.js AVATAR_COLORS` | 2 hexas bleus `#13315c/#3a5a8c` | verts `#66bb6a/#5c9e6a` |
| Conteneur `.status-confirmed` (Salle confirmée) | `#1e5f8f` | `#1B5E20` |

**Résultat vérifié (scan final tous fichiers frontend)** : `BLEUS=0`, **aucun hexa/rgb/var bleu restant nulle part**, accolades équilibrées, `node --check` frontend OK (séparé des accents).

**Fichiers :** `frontend/src/App.css`, `frontend/src/pages/ProfilePage.js` (+ CHANGELOG).

---

## [BUGS → PHASE 1] Menu latéral par rôle — livré

Corrections de bugs appliquées **au code existant** (le backend supervisait déjà le cachet du doyen, les validations par filière, les notifications par utilisateur). Cette phase a rattrapé le **frontend**.

| # | Bug | Verdict | Correctif livré |
|---|-----|---------|-----------------|
| 1 | Menu latéral non filtré par rôle | **corrigé** | `Sidebar.js` : menu 100 % piloté par `role` (PROF/CLUB → « Mes demandes » ; CHEF_FILIERE → « Validations » ; DOYEN → « Cachet du doyen » ; ADMIN → section admin seulement ; badge notifications conservé). Vérifié : parse frontend OK, `node --check` OK. |
| 2 | Notifications visibles par tous | **déjà correct en backend** | `/notifications/my` + `markRead/markAllRead` filtrent par utilisateur JWT (NotificationController/Service). Frontend appelle déjà `getMyNotifications(token)`. |
| 3 | Couleur de l'avatar non propagée | **déjà correct en backend** | `avatarColor` stocké (AppUser) + renvoyé dans AuthResponse + modifiable via `updateProfile`. Frontend : `AuthContext.sanitizeUser` + `ProfilePage` (sélecteur de couleur) l'utilisent. |
| 4 | Chef de filière voit toutes les demandes | **déjà correct en backend** | `getBookingsForFiliere` + contrôle : le chef ne voit que la filière de son JWT, et le rejet d'une demande hors filière → 403 (BookingService). Menu « Validations » = CHEF_FILIERE. |
| 5 | Tableau de bord vide | **déjà correct en backend** | Les 3 appels du dashboard (mes réservations, approbations, notifications) ont des branches de secours + messages « aucun ». À défaut : bouton « Créer une demande ». |
| 6 | Demande nº4 en BDD | **réponse** | c'est la **réservation seed de démo** (`BookingDataLoader`) : `Amphi 1 / +3j / PROF / PENDING`. Documenté ici comme référence de démo, non supprimée. |

**Fichiers touchés :** `frontend/src/components/Sidebar.js` (+ `scripts/start-stack.ps1` créé en une passe, parse OK).

---

## [Outil] Script de démarrage one-shot

`scripts/start-stack.ps1` : vérifie Docker Desktop, `down -v --remove-orphans`, `up -d --build`, poll les health-checks (`docker compose ps`), affiche les URLs (front 3002, Prometheus 9090, Grafana 3000, phpMyAdmin 8085) + garde-fou si le cluster Kubernetes local tient les ports. Parse PowerShell : OK.

---

_(Les phases suivantes — refonte couleur, workflow Salle/Événement, inscriptions, interface par rôle, données de démo, bonus — suivent dans ce document au fur et à mesure.)_
