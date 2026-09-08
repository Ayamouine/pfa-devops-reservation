#!/usr/bin/env bash
set -euo pipefail

echo "Building services..."
mvn -q -DskipTests package -f services/auth-service/pom.xml
mvn -q -DskipTests package -f services/booking-service/pom.xml
mvn -q -DskipTests package -f services/notification-service/pom.xml
mvn -q -DskipTests package -f services/payment-service/pom.xml

echo "Building frontend..."
( cd frontend && npm ci && npm run build )

echo "Collecting artifacts..."
rm -rf release || true
mkdir -p release

# copy jars if present
shopt -s nullglob || true
for j in services/*/target/*.jar; do
  cp "$j" release/ || true
done

# copy frontend build if exists
if [ -d frontend/build ]; then
  cp -r frontend/build release/frontend
fi

cp README.md release/ || true

echo "Creating release.zip"
zip -r release.zip release

echo "Release created: release.zip"
