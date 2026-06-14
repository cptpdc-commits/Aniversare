# ============================================================================
#  setup-firewall.ps1
#  Permite portul 3000 (serverul Next.js dev) prin Windows Firewall, ca telefonul
#  sa poata accesa aplicatia din reteaua locala (carcasa Capacitor / browser mobil).
#
#  Utilizare: click-dreapta pe fisier -> "Run with PowerShell".
#  Scriptul se auto-eleveaza la Administrator daca e nevoie.
# ============================================================================

$ErrorActionPreference = 'Stop'
$Port = 3000
$RuleName = "Next dev $Port"

# --- Auto-elevare la Administrator -----------------------------------------
$isAdmin = ([Security.Principal.WindowsPrincipal] `
    [Security.Principal.WindowsIdentity]::GetCurrent() `
).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "Necesita drepturi de Administrator. Se redeschide elevat..." -ForegroundColor Yellow
    Start-Process powershell.exe -Verb RunAs `
        -ArgumentList "-NoProfile -ExecutionPolicy Bypass -File `"$PSCommandPath`""
    exit
}

Write-Host "=== Configurare firewall pentru portul $Port ===" -ForegroundColor Cyan

# --- Creeaza (sau recreeaza) regula ----------------------------------------
$existing = Get-NetFirewallRule -DisplayName $RuleName -ErrorAction SilentlyContinue
if ($existing) {
    Write-Host "Regula '$RuleName' exista deja. O recreez..." -ForegroundColor DarkGray
    $existing | Remove-NetFirewallRule
}

New-NetFirewallRule -DisplayName $RuleName -Direction Inbound -Protocol TCP `
    -LocalPort $Port -Action Allow -Profile Private, Public | Out-Null
Write-Host "[OK] Regula inbound creata: TCP $Port permis (profile Private + Public)." -ForegroundColor Green

# --- Afiseaza URL-ul de folosit --------------------------------------------
$ip = (Get-NetIPAddress -AddressFamily IPv4 |
    Where-Object { $_.IPAddress -notlike '169.*' -and $_.IPAddress -ne '127.0.0.1' } |
    Select-Object -First 1).IPAddress

Write-Host ""
Write-Host "IP-ul acestui PC in retea: $ip" -ForegroundColor Cyan
Write-Host "URL pentru telefon/Capacitor: http://${ip}:3000" -ForegroundColor Cyan
Write-Host ""
Write-Host "Daca IP-ul difera de cel din capacitor.config.ts, actualizeaza-l acolo" -ForegroundColor Yellow
Write-Host "si in next.config.ts (allowedDevOrigins), apoi ruleaza: npm.cmd run cap:sync" -ForegroundColor Yellow
Write-Host ""

# --- Test rapid local pe IP-ul de retea ------------------------------------
Write-Host "Test rapid (serverul trebuie sa ruleze cu 'npm.cmd run dev:lan')..." -ForegroundColor DarkGray
try {
    $r = Invoke-WebRequest -Uri "http://${ip}:3000" -TimeoutSec 6 -UseBasicParsing
    Write-Host "[OK] Serverul raspunde pe IP-ul de retea: HTTP $($r.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "[!] Inca nu raspunde pe IP-ul de retea." -ForegroundColor Yellow
    Write-Host "    Verifica: serverul ruleaza ('npm.cmd run dev:lan') si Wi-Fi e retea 'Private'." -ForegroundColor Yellow
}

Write-Host ""
Read-Host "Apasa Enter pentru a inchide"
