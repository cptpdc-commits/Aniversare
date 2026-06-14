// Funcții pure de criptare pentru autentificare (fără dependențe de Next).
// Pot fi importate și din scripturi (ex. prisma/seed.ts).
import { scryptSync, randomBytes, timingSafeEqual } from "node:crypto";

/** Generează hash-ul unei parole: `salt:hash` (scrypt). */
export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

/** Verifică o parolă față de hash-ul stocat, în timp constant. */
export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const expected = Buffer.from(hash, "hex");
  const actual = scryptSync(password, salt, 64);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

/** Token aleator pentru sesiune (hex). */
export function generateToken(bytes = 32): string {
  return randomBytes(bytes).toString("hex");
}

/** Cod scurt, ușor de partajat, pentru invitații de colaborare. */
export function generateInviteCode(): string {
  return randomBytes(9).toString("base64url"); // ~12 caractere
}
