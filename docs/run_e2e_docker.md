## Run E2E tests with Docker Compose

This project includes a convenience compose file to run Cypress headless against the services.

Prerequisites:
- Docker and Docker Compose installed and available on your machine.

Command (from project root):

```bash
# build and start all services and run Cypress, the command will stop when Cypress finishes
docker compose -f docker-compose.yml -f docker-compose.cypress.yml up --build --abort-on-container-exit --exit-code-from cypress

# cleanup
docker compose -f docker-compose.yml -f docker-compose.cypress.yml down --volumes --remove-orphans
```

Notes:
- The Cypress service mounts the `frontend` folder and runs tests defined in `frontend/cypress/e2e/`.
- If you changed ports or service names, update `docker-compose.cypress.yml` environment variables accordingly.
