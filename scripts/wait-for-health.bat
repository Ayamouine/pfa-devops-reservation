
@echo off
setlocal enabledelayedexpansion
set BASE=http://localhost
set PORTS=8081 8082 8083 8084 3002
echo Waiting for services to respond on their /health endpoints...
for %%P in (%PORTS%) do (
  echo Checking %%P...
  set OK=0
  set PATH_=/
  if "%%P"=="8081" set PATH_=/auth/health
  if "%%P"=="8082" set PATH_=/bookings/health
  if "%%P"=="8083" set PATH_=/notifications/health
  if "%%P"=="8084" set PATH_=/payments/health
  if "%%P"=="3002" set PATH_=/
  for /L %%i in (1,1,30) do (
    curl -s -o nul -w "%%{http_code}" %BASE%:%%P%PATH_% > temp_status.txt 2>nul || (echo . & timeout /t 1 >nul)
    set /p STATUS=<temp_status.txt
    if "!STATUS!"=="200" (
      echo Service on %%P is up
      set OK=1
      goto :next%%P
    )
    timeout /t 1 >nul
  )
  :next%%P
  if "!OK!"=="0" (
    echo Service on %%P did not become healthy in time
    exit /b 1
  )
)
echo All services healthy. Running Cypress...
cd frontend
npx cypress run
