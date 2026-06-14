# Organizator Sărbători în Familie

Aplicație web pentru organizarea sărbătorilor în familie: invitați și confirmări, cadouri, meniu, sală, checklist pe organizatori, buget pe etape și un panou de coordonare a furnizorilor externi. Module opționale activabile: **Muzică** și **Video**.

## Tehnologii

- **Next.js 15** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS v4**
- **Prisma** + **SQLite** (persistență locală)
- Server Actions (fără API extern)
- Componente UI tip shadcn (Radix UI + `lucide-react`)

## Cerințe

- Node.js 18+ (testat pe Node 24)
- npm

## Instalare și pornire

```bash
npm install
npx prisma migrate dev --name init   # creează baza de date
npm run db:seed                       # (opțional) date demo
npm run dev
```

Deschide [http://localhost:3000](http://localhost:3000).

Comanda combinată `npm run setup` rulează instalarea, migrarea și seed-ul dintr-un singur pas.

## Module

| Modul | Descriere |
|-------|-----------|
| **Ansamblu** | Vedere de ansamblu: progres confirmări, checklist, buget, countdown |
| **Invitați** | Listă + confirmări (în așteptare / confirmat / refuzat), însoțitori, masă |
| **Cadouri** | Idee → rezervat → cumpărat, preț, responsabil |
| **Meniu** | Preparate pe categorii, cantități, cost |
| **Sala** | Detalii locație: adresă, capacitate, cost, contact |
| **Checklist** | Sarcini pe etape și pe organizatori |
| **Buget** | Planificat vs. cheltuit, pe etape |
| **Furnizori** | Panou de coordonare a furnizorilor externi |
| **Muzică / Video** | Module opționale (activabile din Setări) |

## Structură

```
prisma/
  schema.prisma      # modelul de date
  seed.ts            # date demo
src/
  app/               # rute (Next.js App Router)
    page.tsx         # lista de evenimente
    eveniment/[id]/  # layout + dashboard + module
  components/
    ui/              # primitive (button, card, dialog, ...)
    event/           # componente specifice evenimentului
  lib/
    actions/         # Server Actions per domeniu
    constants.ts     # etichete RO + opțiuni
    prisma.ts, utils.ts
```

## Note

- Datele sunt stocate local în `prisma/dev.db` (un singur dispozitiv). Schema este pregătită pentru extindere ulterioară spre multi-organizator și sincronizare în timp real.
- `npm run db:reset` resetează complet baza de date.
