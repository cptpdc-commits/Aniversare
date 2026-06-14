import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Permite accesul în dev de pe telefon (carcasa Capacitor încarcă http://IP:3000).
  // Fără asta, Next 15.5 blochează/avertizează la cererile cross-origin pentru /_next/*.
  allowedDevOrigins: ["192.168.100.76"],
};

export default nextConfig;
