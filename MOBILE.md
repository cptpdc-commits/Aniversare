# 📱 Versiune mobilă Android — Organizator Sărbători în Familie

Aplicația web a fost împachetată ca aplicație Android nativă folosind
**[Capacitor](https://capacitorjs.com/)**. Carcasa nativă afișează într-un
WebView instanța **Next.js care rulează pe server**.

---

## ⚠️ Compromisul important: aplicația are nevoie de server

Aplicația folosește **Server Actions + bază de date SQLite pe server**, deci
**nu poate rula offline / 100% pe telefon**. Aplicația Android este o „carcasă"
care încarcă adresa serverului configurată în
[`capacitor.config.ts`](capacitor.config.ts):

```
server.url = http://192.168.100.76:3000
```

- **Dev (acum):** PC-ul tău rulează serverul; telefonul îl accesează prin IP-ul
  local din rețeaua Wi-Fi. **Telefonul și PC-ul trebuie să fie pe același Wi-Fi.**
- **Producție:** înlocuiești `server.url` cu un URL **HTTPS deployat** (vezi
  secțiunea [Producție](#producție)).

Dacă serverul nu este pornit/accesibil, aplicația afișează ecranul de fallback
„Se conectează la server…".

---

## 🔧 Ce trebuie instalat (necesar o singură dată)

Pe acest PC **nu sunt instalate** uneltele de build Android. Pentru a compila
`.apk` instalează:

| Unealtă | Versiune | Note |
|---|---|---|
| **JDK** | **21** | Capacitor 8 necesită JDK 21. |
| **Android Studio** | ultima | Aduce **Android SDK** + un JDK 21 inclus (JBR). |
| **Android SDK Platform** | API **36** | `compileSdk = 36`. Se instalează din Android Studio → SDK Manager. |

### Pași de instalare

1. **Android Studio** — descarcă de la <https://developer.android.com/studio>
   și instalează. La primul start, lasă-l să descarce **Android SDK** și
   **Platform 36** (SDK Manager → SDK Platforms → „Android 16 / API 36";
   SDK Tools → „Android SDK Build-Tools" + „Android SDK Platform-Tools").

2. **JDK 21** — cel mai simplu este să folosești JDK-ul inclus în Android Studio
   (`...\Android\Android Studio\jbr`). Alternativ, instalează
   [Temurin JDK 21](https://adoptium.net/temurin/releases/?version=21).

3. **Variabile de mediu** (PowerShell, ca utilizator — repornește terminalul după):
   ```powershell
   # JDK-ul inclus în Android Studio (ajustează calea dacă diferă)
   setx JAVA_HOME "C:\Program Files\Android\Android Studio\jbr"
   # Android SDK (locația implicită)
   setx ANDROID_HOME "$env:LOCALAPPDATA\Android\Sdk"
   # platform-tools în PATH (pentru adb)
   setx PATH "$env:PATH;$env:LOCALAPPDATA\Android\Sdk\platform-tools"
   ```
   Verifică după repornirea terminalului:
   ```powershell
   java -version      # trebuie să arate 21.x
   adb version
   ```

> 💡 Cel mai simplu drum dacă nu vrei linia de comandă: deschide proiectul
> `android\` direct în **Android Studio** (`npm.cmd run cap:open`) și apasă
> **Build → Build Bundle(s)/APK(s) → Build APK(s)**. Studio aduce singur JDK-ul
> și Gradle.

---

## ▶️ Rulare în dezvoltare (testare pe telefon)

1. **Pornește serverul accesibil în rețea** (nu doar pe localhost):
   ```powershell
   npm.cmd run dev:lan
   ```
   (echivalent cu `next dev -H 0.0.0.0 -p 3000`)

2. **Permite portul 3000 în Windows Firewall** — cauza #1 pentru care telefonul
   vede ecranul „Se conectează la server…". Cel mai simplu: click-dreapta pe
   [`setup-firewall.ps1`](setup-firewall.ps1) → *Run with PowerShell* (se
   auto-elevează la Administrator, creează regula și testează conexiunea).

   Manual, într-un PowerShell ca Administrator:
   ```powershell
   New-NetFirewallRule -DisplayName "Next dev 3000" -Direction Inbound `
     -Protocol TCP -LocalPort 3000 -Action Allow -Profile Private
   ```
   Asigură-te că rețeaua Wi-Fi este marcată ca **Private** în Windows
   (Settings → Network → Wi-Fi → „Private network").

3. **Verifică IP-ul PC-ului.** Configul folosește `192.168.100.76`. Dacă IP-ul
   tău s-a schimbat, află-l cu `ipconfig` și actualizează-l în **trei** locuri
   (sau doar redă pașii de mai jos):
   - [`capacitor.config.ts`](capacitor.config.ts) → `server.url`
   - [`next.config.ts`](next.config.ts) → `allowedDevOrigins`
   - apoi `npm.cmd run cap:sync`

4. **Instalează `.apk`-ul pe telefon** (vezi build mai jos) și deschide-l.

---

## 🏗️ Build `.apk` de debug

După ce uneltele de mai sus sunt instalate:

```powershell
# 1. Sincronizează configul/web assets în proiectul Android
npm.cmd run cap:sync

# 2. Compilează APK-ul de debug
cd android
.\gradlew.bat assembleDebug
```

**Locația `.apk`-ului rezultat:**

```
android\app\build\outputs\apk\debug\app-debug.apk
```

Copiază fișierul pe telefon (cablu USB, Google Drive, etc.) și instalează-l
(activează „Instalare din surse necunoscute" pe Android).

Alternativ, cu telefonul conectat prin USB și *USB debugging* activat:
```powershell
adb install -r android\app\build\outputs\apk\debug\app-debug.apk
# sau direct build + install:
cd android; .\gradlew.bat installDebug
```

> Scurtături disponibile în `package.json`:
> `npm.cmd run cap:sync`, `npm.cmd run cap:open`, `npm.cmd run android:apk`.

---

## 🚀 Producție

`.apk`-ul de debug este pentru testare. Pentru distribuție reală:

1. **Deployează serverul Next.js** undeva accesibil prin **HTTPS** (Vercel,
   un VPS, etc.). Reține: SQLite local nu e ideal pentru producție — ai putea
   migra pe Postgres/MySQL, dar asta ține de aplicația web, nu de mobil.
2. În [`capacitor.config.ts`](capacitor.config.ts) pune `server.url` =
   URL-ul HTTPS deployat și **elimină** `cleartext: true` și `androidScheme: 'http'`.
3. `npm.cmd run cap:sync`.
4. Generează un **APK/AAB de release semnat** (keystore) — din Android Studio:
   *Build → Generate Signed Bundle / APK*.

---

## 🪶 Alternativă mai simplă: PWA (fără `.apk`)

Dacă nu vrei build Android deloc, aplicația poate fi făcută **PWA instalabilă**
(manifest + service worker + icoane). Utilizatorul deschide URL-ul serverului în
Chrome pe Android → meniu → *Add to Home screen*. Apare ca aplicație cu icon,
fără magazin și fără unelte Android. Aceleași constrângeri de server se aplică.
Nu este implementată acum — spune dacă vrei să o adaug.

---

## 📁 Ce s-a adăugat în proiect

| Fișier / folder | Rol |
|---|---|
| [`capacitor.config.ts`](capacitor.config.ts) | Config Capacitor (appId `md.familie.organizator`, `server.url`). |
| [`mobile-www/index.html`](mobile-www/index.html) | Ecran de fallback (`webDir`) când serverul e inaccesibil. |
| `android/` | Proiectul Android nativ generat de Capacitor. |
| `android/app/src/debug/AndroidManifest.xml` | Permite HTTP necriptat **doar** în debug. |
| [`next.config.ts`](next.config.ts) | `allowedDevOrigins` pentru accesul de pe telefon în dev. |
| `package.json` | Scripturi: `dev:lan`, `cap:sync`, `cap:open`, `android:apk`. |
