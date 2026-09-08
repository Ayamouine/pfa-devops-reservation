@echo off
setlocal
echo Building services (maven)...
mvn -DskipTests package -f services\auth-service\pom.xml || goto :err
mvn -DskipTests package -f services\booking-service\pom.xml || goto :err
mvn -DskipTests package -f services\notification-service\pom.xml || goto :err
mvn -DskipTests package -f services\payment-service\pom.xml || goto :err

echo Building frontend...
cd frontend
npm ci --no-audit --no-fund
npm run build
cd ..

echo Collecting artifacts...
if exist release rd /s /q release
mkdir release
for /r %%f in (services\*\target\*.jar) do copy "%%f" release\ >nul 2>&1
if exist frontend\build (
  xcopy /E /I frontend\build release\frontend >nul
)
copy README.md release\ >nul 2>&1

powershell -Command "if (Test-Path release.zip) { Remove-Item release.zip -Force }"
echo Creating release.zip...
powershell -Command "Compress-Archive -Path release\* -DestinationPath release.zip -Force"
echo Created release.zip
goto :eof
:err
echo Build failed
exit /b 1
