# Déploiement Kubernetes

Ce dossier contient les manifests Kubernetes des 4 microservices, du frontend et de
MySQL. Ils sont utilisés :

- automatiquement par le pipeline CI/CD (job `deploy-kind`) pour valider le
  déploiement réel de chaque `main` poussé sur un cluster `kind` ;
- manuellement sur un cluster local (kind / minikube / Docker Desktop) comme décrit
  ci-dessous.

## Déploiement manuel (cluster local)

Pré-requis : `kubectl` pointant sur un cluster avec un StorageClass par défaut
(kind : `local-path-provisioner`, Docker Desktop : `hostpath`).

```bash
# 1. Secrets (ou contenus dans k8s/secrets.yaml pour la démo)
kubectl create secret generic pfa-secrets \
  --from-literal=MYSQL_ROOT_PASSWORD=change_me \
  --from-literal=SPRING_DATASOURCE_USERNAME=root \
  --from-literal=SPRING_DATASOURCE_PASSWORD=change_me \
  --from-literal=JWT_SECRET=change_me

# 2. Appliquer les manifests
kubectl apply -f k8s/

# 3. Pointer les images vers votre registre (si le registre GHCR est privé :
#    ajouter un imagePullSecret ou charger les images dans kind)
kubectl set image deployment/auth-service \
  auth-service=ghcr.io/<owner>/<repo>/auth-service:latest

# 4. Vérifier
kubectl get pods -n default
kubectl rollout status deployment/auth-service
```

Accès local : le LoadBalancer ne livre pas de IP sur kind, utiliser
`kubectl port-forward svc/frontend 3001:3001` (et les services 8081-8084).

## Intégration CI/CD

Le job `deploy-kind` du pipeline :

1. pousse les images vers GHCR (`ghcr.io/<repo>/<service>:sha-<sha>` + `latest`) ;
2. crée un cluster `kind` ;
3. installe `local-path-provisioner` (StorageClass) pour le PVC MySQL ;
4. charge les images dans le cluster et applique `k8s/` ;
5. attend le `rollout status` de chaque deployment ;
6. vérifie les endpoints `/health` des 4 microservices.

Le déploiement continu vers un cluster distant se ferait ensuite en remplaçant
l'étape "kind" par une action `kubeconfig` (clé API du cluster) et `kubectl apply -f k8s/`.

## Notes

- Les services écoutent chacun sur leur port (8081-8084) via `server.port`
  (`application.properties`). Les probes `/health` correspondent aux endpoints
  réels des contrôleurs (pas d'Actuator).
- `wait-for-mysql` (init container busybox) attend que `mysql:3306` réponde avant
  de démarrer chaque service.
- Le secret `k8s/secrets.yaml` contient des identifiants de démonstration
  (`root`/`root`). À ne pas utiliser en production.