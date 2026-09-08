@echo off
setlocal
echo Building service jars locally...
pushd %~dp0\.. >nul

cd services\auth-service
mvn -DskipTests package
if errorlevel 1 (
  echo Auth-service build failed. Exiting.
  exit /b 1
)

cd ..\booking-service
mvn -DskipTests package
if errorlevel 1 (
  echo Booking-service build failed. Exiting.
  exit /b 1
)

cd ..\notification-service
mvn -DskipTests package
if errorlevel 1 (
  echo Notification-service build failed. Exiting.
  exit /b 1
)

cd ..\payment-service
mvn -DskipTests package
if errorlevel 1 (
  echo Payment-service build failed. Exiting.
  exit /b 1
)

cd ..\..
echo Building frontend...
cd frontend
npm ci
npm run build
if errorlevel 1 (
  echo Frontend build failed. Exiting.
  exit /b 1
)

cd ..
echo Starting Docker Compose with prebuilt jars (uses Dockerfile.runtime)
set DOCKER_BUILDKIT=1
docker compose -f docker-compose.prebuilt.yml up --build -d

popd >nul
endlocal
