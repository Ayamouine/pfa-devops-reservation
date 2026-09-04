# Diagrammes UML — Plateforme de Réservation

Ce document contient les 4 diagrammes UML demandés par le cahier des charges (section 4.2) :
cas d'utilisation, classes, séquence, déploiement.

Les diagrammes sont écrits en syntaxe [Mermaid](https://mermaid.js.org/). GitHub les affiche
automatiquement dans ce fichier `.md`. Pour les insérer comme images dans un rapport Word/PDF,
copie chaque bloc sur [mermaid.live](https://mermaid.live), exporte en PNG/SVG, puis colle
l'image dans le document.

---

## 1. Diagramme de cas d'utilisation

Deux acteurs : **Utilisateur** (rôle `USER`) et **Administrateur** (rôle `ADMIN`, qui hérite
de toutes les actions de l'utilisateur). L'inscription en tant qu'administrateur nécessite un
code secret connu uniquement de l'équipe projet.

```mermaid
flowchart LR
    U((Utilisateur))
    A((Administrateur))

    subgraph Plateforme de Réservation
        UC1([S'inscrire])
        UC2([Se connecter])
        UC3([Consulter les ressources disponibles])
        UC4([Créer une réservation])
        UC5([Modifier une réservation])
        UC6([Annuler une réservation])
        UC7([Payer une réservation - mock])
        UC8([Consulter mes réservations])
        UC9([Recevoir des notifications])
        UC10([Consulter son profil])
        UC11([Consulter toutes les réservations])
        UC12([Confirmer / gérer les réservations de tous les utilisateurs])
    end

    U --> UC1
    U --> UC2
    U --> UC3
    U --> UC4
    U --> UC5
    U --> UC6
    U --> UC7
    U --> UC8
    U --> UC9
    U --> UC10

    A --> UC2
    A --> UC11
    A --> UC12

    UC1 -.->|"inclut : saisie du code admin si role=ADMIN"| UC1
    UC4 -.->|inclut| UC9
    UC7 -.->|inclut| UC9
```

---

## 2. Diagramme de classes

Représente les 4 entités JPA persistées, une par microservice (chacune dans sa propre base
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
        +getUsername() String
        +getRole() String
    }

    class BookingEntity {
        -Long id
        -String resource
        -LocalDate reservationDate
        -String status
        -String username
        +getStatus() String
        +getResource() String
    }

    class Payment {
        -Long id
        -String reservationId
        -double amount
        -String status
        -String username
        +getStatus() String
        +getAmount() double
    }

    class Notification {
        -Long id
        -String username
        -String message
        -String status
        +getMessage() String
    }

    AppUser "1" ..> "0..*" BookingEntity : username (logique, inter-service)
    BookingEntity "1" ..> "0..1" Payment : reservationId (logique, inter-service)
    AppUser "1" ..> "0..*" Notification : username (logique, inter-service)

    note for BookingEntity "Contrainte unique (resource, reservation_date)\npour empêcher les doubles réservations"
```

---

## 3. Diagramme de séquence

Scénario complet : un utilisateur se connecte, crée une réservation, la paie, et elle est
confirmée avec envoi d'une notification. Reflète le flux réel implémenté dans
`MyBookingsPage.js` / `BookingController.java` / `PaymentController.java`.

```mermaid
sequenceDiagram
    actor U as Utilisateur
    participant F as Frontend (React)
    participant Auth as Auth Service
    participant B as Booking Service
    participant P as Payment Service
    participant N as Notification Service
    participant DB as MySQL

    U->>F: Saisit identifiants (login)
    F->>Auth: POST /auth/login
    Auth->>DB: Vérifie username/password (BCrypt)
    DB-->>Auth: Utilisateur trouvé
    Auth-->>F: 200 OK + JWT (contient username, role)
    F-->>U: Redirection vers le tableau de bord

    U->>F: Remplit le formulaire de réservation
    F->>B: POST /bookings (Authorization: Bearer JWT)
    B->>B: Valide le JWT (JwtAuthFilter)
    B->>DB: Vérifie unicité (resource, date)
    alt Créneau déjà réservé
        DB-->>B: Conflit (409)
        B-->>F: 409 Conflict
        F-->>U: "Cette ressource est déjà réservée"
    else Créneau libre
        B->>DB: INSERT booking (status=pending)
        DB-->>B: Réservation créée
        B-->>F: 200 OK + réservation
        F-->>U: Réservation affichée (En attente)
    end

    U->>F: Clique "Payer"
    F->>P: POST /payments (Authorization: Bearer JWT)
    P->>DB: INSERT payment (status=completed)
    DB-->>P: Paiement enregistré
    P-->>F: 200 OK

    F->>B: POST /bookings/{id}/confirm
    B->>DB: UPDATE booking SET status=confirmed
    B->>N: POST /notifications (via NotificationClient)
    N->>DB: INSERT notification
    B-->>F: 200 OK + réservation confirmée
    F-->>U: Réservation affichée (Confirmée)
```

---

## 4. Diagramme de déploiement

Deux modes de déploiement coexistent dans le projet : **Docker Compose** (développement local)
et **Kubernetes** (orchestration testée en local via Docker Desktop / kind). Le diagramme
ci-dessous représente le déploiement Kubernetes, qui correspond à l'exigence du cahier des
charges ("Orchestrer les conteneurs avec Kubernetes").

```mermaid
flowchart TB
    subgraph Client
        Browser[Navigateur de l'utilisateur]
    end

    subgraph "Cluster Kubernetes (nœud unique - kind)"
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
            PVC[[PersistentVolumeClaim\n2 Gi]]
            DB --- PVC
        end

        SecretK8s{{Secret Kubernetes\npfa-secrets\nJWT_SECRET, DB credentials}}
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

    SecretK8s -.->|injecté en variables d'env| AS
    SecretK8s -.->|injecté en variables d'env| BS
    SecretK8s -.->|injecté en variables d'env| NS
    SecretK8s -.->|injecté en variables d'env| PS
```

---

## Notes pour le rapport

- Chaque microservice possède son propre init-container `wait-for-mysql` qui attend que le
  port 3306 réponde avant de démarrer, évitant les erreurs de connexion au boot.
- La communication `booking-service → notification-service` illustre le couplage faible entre
  microservices : un appel HTTP interne via le nom de service Kubernetes
  (`http://notification-service:8083`), pas de dépendance directe au code.
- Le contrôle de concurrence pour éviter les doubles réservations est assuré par une
  contrainte SQL unique `(resource, reservation_date)`, pas par un verrou applicatif — plus
  robuste sous charge concurrente.
