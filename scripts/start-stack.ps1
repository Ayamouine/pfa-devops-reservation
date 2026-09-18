# ============================================================================
#  start-stack.ps1 - PFA : lancement complet de la plateforme (one-shot)
#  Usage   : clique droit > "Run with PowerShell" (ou : powershell -File .\start-stack.ps1)
#  Effet   : check Docker -> down -v -> up -d --build -> attend les health-checks
#            -> affiche les URLs (front, Prometheus, Grafana)
#  Note    : si un cluster Kubernetes local (Docker Desktop) tourne, il peut
#            tenir les ports 8082/8084/3002/9090/3000 -> le script le signale
#            et donne la commande de desactivation avant de continuer.
# ============================================================================
[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'
$root = $PSScriptRoot
Set-Location $root

function Say($m){ Write-Host $m -ForegroundColor Cyan }

Write-Host "=============================================================" -ForegroundColor White
Write-Host "  PFA - Demarrage de la plateforme de reservation" -ForegroundColor White
Write-Host ("  repertoire: {0}" -f $root) -ForegroundColor DarkGray
Write-Host "=============================================================" -ForegroundColor White

# ---------------------------------------------------------------------------
# 1. Docker Desktop actif (sinon attente jusqu'a 10 min)
# ---------------------------------------------------------------------------
Say ""
Say "== 1. Verification Docker Desktop =="
$deadline = (Get-Date).AddMinutes(10)
$dockerOk = $false
do {
    & docker info *> $null 2>&1
    if ($?) { $dockerOk = $true; break }
    Write-Host ("  [{0}] Docker Desktop pas encore pret, on attend..." -f (Get-Date -Format HH:mm:ss)) -ForegroundColor DarkGray
    Start-Sleep 10
} while ((Get-Date) -lt $deadline)

if (-not $dockerOk) {
    Write-Host "ERREUR: Docker Desktop ne repond pas apres 10 minutes." -ForegroundColor Red
    Write-Host "  -> demarre Docker Desktop a la main (icone bureau), attends 'Engine running'," -ForegroundColor Yellow
    Write-Host "     puis relance ce script." -ForegroundColor Yellow
    exit 1
}
$dv = & docker version --format "{{.Server.Version}}"
Write-Host ("  OK - Docker {0} actif" -f $dv) -ForegroundColor Green

# ---------------------------------------------------------------------------
# 2. Cluster Kubernetes local qui tiendrait les ports ? (777 alerte, non bloquant)
# ---------------------------------------------------------------------------
Write-Host ""
Write-Host "== 2. Controle cluster Kubernetes local (Docker Desktop) ==" -ForegroundColor Cyan
$k8sActive = $false
try { $ks = & docker desktop kubernetes status 2>&1 | Out-String; if ($ks -match 'State:\s*Running') { $k8sActive = $true } } catch {}
if ($k8sActive) {
    Write-Host "  ATTENTION: le cluster Kubernetes local est ACTIF." -ForegroundColor Yellow
    Write-Host "  -> Il peut occuper les ports 8082/8084/3000/3002/9090 utilises par Compose." -ForegroundColor Yellow
    Write-Host "  Pour le desactiver (recommandé avant la demo) :" -ForegroundColor Yellow
    Write-Host "      1. Docker Desktop -> Settings -> Kubernetes" -ForegroundColor White
    Write-Host "      2. decocher 'Enable Kubernetes' -> Apply & restart" -ForegroundColor White
    Write-Host "      3. relancer ce script" -ForegroundColor White
    Write-Host "  (ou, en ligne de commande :)" -ForegroundColor DarkGray
    Write-Host "      docker desktop restart  # apres avoir mis kubernetesEnabled: false" -ForegroundColor DarkGray
    Write-Host "  On continue quand meme (down -v libere les ports si possible)." -ForegroundColor DarkGray
} else {
    Write-Host "  OK - aucun cluster Kubernetes local actif, ports libres." -ForegroundColor Green
}

# ---------------------------------------------------------------------------
# 3. down (volumes + orphelins) -> etat 100% propre
# ---------------------------------------------------------------------------
Say ""
Say "== 3. Arret + nettoyage complet (down -v) =="
& docker compose down -v --remove-orphans 2>&1 | ForEach-Object { $_ }
Write-Host "  -> volumes supprimes, etat propre." -ForegroundColor Green

# ---------------------------------------------------------------------------
# 4. Build + demarrage complet
# ---------------------------------------------------------------------------
Say ""
Say "== 4. Build + demarrage (up -d --build) =="
& docker compose up -d --build 2>&1 | ForEach-Object { $_ }
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERREUR pendant le build/demarrage. Verifie les messages ci-dessus." -ForegroundColor Red
    exit 1
}

# ---------------------------------------------------------------------------
# 5. Attente des health-checks (auto: compte les 'healthcheck:' du compose)
# ---------------------------------------------------------------------------
Say ""
Say "== 5. Attente des health-checks =="
$expected = (Select-String -Path "$root\docker-compose.yml" -Pattern '^\s+healthcheck:' -AllMatches | Measure-Object).Count
if ($expected -lt 1) {
    # fallback: nombre total de services declares
    & docker compose config --services > $null 2>&1
    if ($?) { $expected = (@(& docker compose config --services)).Count }
}
Write-Host ("  health-checks attendus: {0}" -f $expected) -ForegroundColor DarkGray

$deadline = (Get-Date).AddMinutes(10)
$healthyCount = 0
do {
    Start-Sleep 10
    $statuses = @(& docker compose ps --format "{{.Status}}" 2>&1)
    $healthyCount = ($statuses | Where-Object { $_ -match '\(healthy\)' }).Count
    $runningCount = ($statuses | Where-Object { $_ -match 'Up' -and $_ -notmatch 'restarting|unhealthy' }).Count
    Write-Host ("  [{0}] healthy={1}/{2}  running={3}" -f (Get-Date -Format HH:mm:ss), $healthyCount, $expected, $statuses.Count) -ForegroundColor DarkGray
    if ($healthyCount -ge $expected) { break }
} while ((Get-Date) -lt $deadline)

if ($healthyCount -lt $expected) {
    Write-Host ""
    Write-Host "TIMEOUT: tous les conteneurs ne sont pas 'healthy'." -ForegroundColor Red
    Write-Host "Diagnostic rapide:" -ForegroundColor Yellow
    Write-Host "  docker compose ps                        # voir l'etat" -ForegroundColor White
    Write-Host "  docker compose logs --tail=50 <service>  # voir les logs" -ForegroundColor White
    Write-Host "Si un port est 'already allocated' -> un cluster Kubernetes local le tient," -ForegroundColor Yellow
    Write-Host "desactive-le (section 2) puis relance le script." -ForegroundColor Yellow
    exit 1
}

# ---------------------------------------------------------------------------
# 6. URLs + credentials
# ---------------------------------------------------------------------------
Say ""
Say "== 6. Plateau pret - URLs =="
Write-Host ""
Write-Host "  Frontend React      : http://localhost:3002" -ForegroundColor Green
Write-Host "  Auth API    (8081)  : http://localhost:18081" -ForegroundColor White
Write-Host "  Booking API (8082)  : http://localhost:8082" -ForegroundColor White
Write-Host "  Notification(8083)  : http://localhost:18083" -ForegroundColor White
Write-Host "  Payment API (8084)  : http://localhost:8084" -ForegroundColor White
Write-Host "  phpMyAdmin          : http://localhost:8085   (root / root, ou compte de demo)" -ForegroundColor White
Write-Host "  Prometheus          : http://localhost:9090" -ForegroundColor Magenta
Write-Host "  Grafana             : http://localhost:3000   (admin / admin)" -ForegroundColor Magenta
Write-Host "  Dashboard Grafana   : onglet 'Reservation - Supervision' (datasource provisionnee)" -ForegroundColor DarkGray
Write-Host ""
Write-Host "  Comptes demo : etudiant / prof / chef de filiere / doyen (voir README.md)" -ForegroundColor DarkGray
Write-Host ""
Write-Host "  Tout est healthy. Bonne demo !" -ForegroundColor Cyan
