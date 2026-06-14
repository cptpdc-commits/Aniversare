import type { CapacitorConfig } from '@capacitor/cli';

/**
 * Organizator Sărbători în Familie — configurare Capacitor (Android).
 *
 * Aplicația web depinde de server (Next.js Server Actions + SQLite), deci NU
 * poate rula offline. Carcasa nativă încarcă în WebView instanța Next.js care
 * rulează pe server.
 *
 * `server.url` mai jos = PC-ul de dezvoltare în rețeaua locală.
 *   - Telefonul și PC-ul trebuie să fie pe aceeași rețea Wi-Fi.
 *   - Pe PC pornește serverul accesibil în LAN: `npm.cmd run dev:lan`
 *     (rulează `next dev -H 0.0.0.0 -p 3000`).
 *   - `cleartext: true` permite HTTP simplu (fără HTTPS) în dev.
 *
 * Pentru PRODUCȚIE: înlocuiește `server.url` cu URL-ul HTTPS deployat
 * (sau elimină blocul `server` dacă folosești un export static — nu e cazul aici).
 */
const config: CapacitorConfig = {
  appId: 'md.familie.organizator',
  appName: 'Organizator Sărbători',
  // webDir = folder fallback afișat dacă serverul nu e accesibil. Nu folosim
  // export static (aplicația are nevoie de Server Actions), deci e doar un placeholder.
  webDir: 'mobile-www',
  server: {
    url: 'http://192.168.100.76:3000',
    cleartext: true,
    androidScheme: 'http',
  },
};

export default config;
