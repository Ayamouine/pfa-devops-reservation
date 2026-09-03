# Manifests Kubernetes (non utilisés actuellement)

Ce dossier contient des manifests Kubernetes pour les 4 microservices, le frontend
et MySQL, préparés pour un déploiement futur sur un cluster K8s.

⚠️ Ils ne sont PAS utilisés par le projet actuellement. Le projet tourne avec
Docker Compose (`docker-compose.yml` à la racine). Pour lancer le projet :

    docker compose up -d --build

Pour déployer sur Kubernetes plus tard :

    kubectl apply -f k8s/