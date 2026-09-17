# Diagrammes UML — Plateforme de Réservation (FST Settat)

Ce document contient les 4 diagrammes UML demandés par le cahier des charges (section 4.2) :
cas d'utilisation, classes, séquence, déploiement.

Les diagrammes sont écrits en syntaxe [Mermaid](https://mermaid.js.org/). GitHub les affiche
automatiquement dans ce fichier `.md`. Pour les insérer comme images dans un rapport Word/PDF,
copie chaque bloc sur [mermaid.live](https://mermaid.live), exporte en PNG/SVG, puis colle
l'image dans le document.

---

## 1. Diagramme de cas d'utilisation

Cinq acteurs, alignés sur les rôles de l'`auth-service` : **Étudiant** (`ETUDIANT`),
**Professeur** (`PROF`), **Chef de filière** (`CHEF_FILIERE`), **Doyen** (`DOYEN`) et
**Administrateur** (`ADMIN`). L'inscription en tant que personnel (prof / chef / doyen / admin)
nécessite un code d'inscription secret.

```mermaid
flowchart LR
    E((Etudiant))
    P((Professeur))
    C((Chef de filiere))
    D((Doyen))
    A((Administrateur))

    subgraph Plateforme de Reservation
        UC1([S'inscrire / Se connecter])
        UC2([Consulter les salles et l'emploi du temps])
        UC3([Demander une reservation])
        UC4([Joindre un document PDF])
        UC5([Modifier / Annuler sa demande])
        UC6([Suivre le statut de ses demandes])
        UC7([Recevoir des notifications])
        UC8([Gerer son profil])
        UC9([Valider / refuser une demande de sa filiere])
        UC10([Apposer le cachet final])
        UC11([Gerer les salles])
        UC12([Gerer les utilisateurs et leurs roles])
    end

    E --> UC1
    E --> UC2
    E --> UC6
    E --> UC7
    E --> UC8

    P --> UC1
    P --> UC2
    P --> UC3
    P --> UC4
    P --> UC5
    P --> UC6
    P --> UC7
    P --> UC8

    C --> UC3
    C --> UC9

    D --> UC10

    A --> UC11
    A --> UC12

    UC3 -.->|"notifie le chef de filiere"| UC9
    UC9 -.->|"notifie le doyen"| UC10
    UC10 -.->|"declenche le paiement + notifie le demandeur"| UC7
```

---

## 2. Diagramme de classes

Représente les entités JPA persistées, une par microservice (chacune dans sa propre base
MySQL : `auth_db`, `booking_db`, `payment_db`, `notification_db`). Il n'y a pas de clé
étrangère technique entre elles (architecture microservices oblige — chaque service est
indépendant), mais un lien logique existe via le champ `username`, indiqué en pointillés.

```mermaid
classDiagram
    class AppUser {
        -Long id
        -String username
        -String password
        -String role
        -String firstName
        -String lastName
        -String filiere
        -String avatarColor
        +getUsername() String
        +getRole() String
        +getFiliere() String
    }

    class ResourceEntity {
        -Long id
        -String name
        -String category
        -Integer capacity
        -String building
        -String floor
        -String equipment
        -String photo
        -Double price
        -Boolean active
    }

    class BookingEntity {
        -Long id
        -String resource
        -LocalDate reservationDate
        -String creneau
        -String status
        -String username
        -String motif
        -String filiere
        -String documentName
        -String chefComment
        -String doyenComment
        -LocalDateTime createdAt
        -List~WorkflowStep~ history
        +getStatus() String
        +addHistory(status, actor, comment)
    }

    class WorkflowStep {
        -String status
        -String actor
        -String comment
        -LocalDateTime timestamp
    }

    class Payment {
        -Long id
        -String reservationId
        -double amount
        -String status
        -String username
        +getStatus() String
    }

    class Notification {
        -Long id
        -String username
        -String message
        -String type
        -String target
        -Boolean read
        -String link
    }

    BookingEntity "1" *-- "0..*" WorkflowStep : historique embarque
    BookingEntity "0..*" --> "1" ResourceEntity : resource (nom, logique)
    AppUser "1" ..> "0..*" BookingEntity : username (logique, inter-service)
    BookingEntity "1" ..> "0..1" Payment : reservationId (logique, inter-service)
    AppUser "1" ..> "0..*" Notification : username (logique, inter-service)

    note for BookingEntity "Contrainte unique (resource, reservation_date, creneau)\npour empêcher les doubles réservations\nWorkflow : PENDING -> APPROVED -> CONFIRMED"
```

---

## 3. Diagramme de séquence

Scénario complet du workflow à 3 niveaux : un **professeur** crée une demande, le **chef de
filière** la valide, le **doyen** appose le cachet final (qui déclenche le paiement simulé),
puis le demandeur est notifié à chaque étape. Reflète le flux réel implémenté dans
`MyBookingsPage.js` / `ApprovalsPage.js` / `BookingService.java`.

```mermaid
sequenceDiagram
    actor P as Professeur
    actor C as Chef de filiere
    actor D as Doyen
    participant F as Frontend (React)
    participant A as Auth Service
    participant B as Booking Service
    participant Pay as Payment Service
    participant N as Notification Service
    participant DB as MySQL

    P->>F: Login
    F->>A: POST /auth/login
    A-->>F: 200 OK + JWT (username, role, filiere)
    P->>F: Formulaire de reservation (+ PDF)
    F->>B: POST /bookings (Bearer JWT)
    B->>DB: Verifie unicite (resource, date, creneau)
    alt Creneau occupe
        B-->>F: 409 Conflict
    else Creneau libre
        B->>DB: INSERT booking (status = PENDING)
        B->>N: notification au chef de la filiere
        B-->>F: 200 OK
    end

    C->>B: POST /bookings/{id}/approve
    B->>DB: UPDATE status = APPROVED
    B->>N: notification au doyen
    B-->>C: 200 OK

    D->>B: POST /bookings/{id}/confirm
    B->>DB: UPDATE status = CONFIRMED
    B->>Pay: POST /payments (paiement simule)
    Pay->>DB: INSERT payment (status = paid)
    Pay-->>B: 200 OK
    B->>N: notification au demandeur (reservation confirmee)
    B-->>D: 200 OK

    P->>N: GET /notifications/my
    N-->>P: notifications (dont CONFIRMED)
```

---

## 4. Diagramme de déploiement

Deux modes de déploiement coexistent dans le projet : **Docker Compose** (développement local)
et **Kubernetes** (orchestration testée en local via Docker Desktop / kind). Le diagramme
ci-dessous représente le déploiement Kubernetes, qui correspond à l'exigence du cahier des
charges (« Orchestrer les conteneurs avec Kubernetes »).

```mermaid
flowchart TB
    subgraph Client
        Browser[Navigateur de l'utilisateur]
    end

    subgraph "Cluster Kubernetes (noeud unique - kind)"
        subgraph "Pod frontend"
            FE[Conteneur React\nport 3000]
        end
        subgraph "Pod auth-service"
            AS[Conteneur Spring Boot\nport 8081]
        end
        subgraph "Pod booking-service"
            BS[Conteneur Spring Boot\nport 8082]
        end
        subgraph "Pod notification-service"
            NS[Conteneur Spring Boot\nport 8083]
        end
        subgraph "Pod payment-service"
            PS[Conteneur Spring Boot\nport 8084]
        end
        subgraph "Pod mysql"
            DB[(MySQL 8.0\nauth_db / booking_db\npayment_db / notification_db)]
        end

        SecretK8s{{Secret Kubernetes\npfa-secrets\nJWT_SECRET, DB credentials, codes}}
    end

    Browser -->|"LoadBalancer :3001"| FE
    FE -->|"LoadBalancer :8081"| AS
    FE -->|"LoadBalancer :8082"| BS
    FE -->|"LoadBalancer :8083"| NS
    FE -->|"LoadBalancer :8084"| PS

    AS -->|"ClusterIP :3306"| DB
    BS -->|"ClusterIP :3306"| DB
    NS -->|"ClusterIP :3306"| DB
    PS -->|"ClusterIP :3306"| DB

    BS -.->|appel interne HTTP| NS
    BS -.->|appel interne HTTP| PS

    SecretK8s -.->|injecté en variables d'env| AS
    SecretK8s -.->|injecté en variables d'env| BS
    SecretK8s -.->|injecté en variables d'env| NS
    SecretK8s -.->|injecté en variables d'env| PS
```

---

## Notes pour le rapport

- Chaque microservice possède son propre init-container `wait-for-mysql` qui attend que le
  port 3306 réponde avant de démarrer, évitant les erreurs de connexion au boot.
- La communication `booking-service → notification-service` et `booking-service → payment-service`
  illustre le couplage faible entre microservices : des appels HTTP internes via les noms de
  service Kubernetes (`http://notification-service:8083`, `http://payment-service:8084`),
  sans dépendance directe au code.
- Le contrôle de concurrence pour éviter les doubles réservations est assuré par une
  contrainte SQL unique `(resource, reservation_date, creneau)`, pas par un verrou applicatif —
  plus robuste sous charge concurrente.
- Dans la démo kind/CI, MySQL utilise le stockage éphémère du pod : les données sont
  réinitialisées à chaque redéploiement (et les seeds réappliqués). Un `PersistentVolumeClaim`
  est prévu pour un déploiement de production.
