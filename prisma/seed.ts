import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/lib/auth";

const prisma = new PrismaClient();

async function main() {
  // Curăță datele existente (idempotent)
  await prisma.event.deleteMany();
  await prisma.user.deleteMany();

  // Utilizator demo (login: demo@familie.md / parola: demo1234)
  const demoUser = await prisma.user.create({
    data: {
      email: "demo@familie.md",
      name: "Cont Demo",
      passwordHash: hashPassword("demo1234"),
    },
  });

  const event = await prisma.event.create({
    data: {
      name: "Aniversarea bunicii Maria — 70 de ani",
      type: "aniversare",
      date: new Date("2026-08-15T18:00:00"),
      description:
        "Petrecere în familie pentru cei 70 de ani ai bunicii. Restaurant, muzică live și surpriză video cu mesaje de la rude.",
      totalBudget: 18000,
      musicEnabled: true,
      videoEnabled: true,
      members: { create: { userId: demoUser.id, role: "owner" } },
    },
  });

  const [ana, mihai, elena] = await Promise.all([
    prisma.organizer.create({
      data: { name: "Ana", role: "Coordonator general", color: "#6366f1", eventId: event.id },
    }),
    prisma.organizer.create({
      data: { name: "Mihai", role: "Responsabil sală & furnizori", color: "#10b981", eventId: event.id },
    }),
    prisma.organizer.create({
      data: { name: "Elena", role: "Responsabil meniu & cadouri", color: "#f59e0b", eventId: event.id },
    }),
  ]);

  await prisma.venue.create({
    data: {
      name: "Restaurant Grădina cu Tei",
      address: "Str. Florilor 12, Chișinău",
      capacity: 60,
      cost: 6000,
      contact: "Dna. Popescu — 069 123 456",
      notes: "Avans achitat. Terasă disponibilă în caz de vreme bună.",
      eventId: event.id,
    },
  });

  await prisma.guest.createMany({
    data: [
      { name: "Familia Ionescu", contact: "069 111 222", status: "confirmat", companions: 1, children: 2, tableName: "Masa 1", eventId: event.id },
      { name: "Unchiul George", contact: "069 333 444", status: "confirmat", companions: 1, tableName: "Masa 2", eventId: event.id },
      { name: "Verișoara Dana", contact: "dana@email.md", status: "in_asteptare", companions: 2, eventId: event.id },
      { name: "Nașii Vasile și Maria", contact: "069 555 666", status: "confirmat", companions: 0, tableName: "Masa 1", eventId: event.id },
      { name: "Familia Rusu", contact: "069 777 888", status: "refuzat", companions: 0, eventId: event.id },
      { name: "Colega Cristina", contact: "cristina@email.md", status: "in_asteptare", companions: 1, eventId: event.id },
    ],
  });

  await prisma.gift.createMany({
    data: [
      { title: "Album foto personalizat", description: "Cu poze din toate generațiile familiei", price: 800, status: "cumparat", organizerId: ana.id, eventId: event.id },
      { title: "Set bijuterii", price: 2500, status: "rezervat", organizerId: elena.id, eventId: event.id },
      { title: "Voucher spa", price: 600, status: "idee", eventId: event.id },
      { title: "Tablou pictat manual", description: "Portret după fotografie", price: 1200, status: "idee", organizerId: ana.id, eventId: event.id },
    ],
  });

  await prisma.menuItem.createMany({
    data: [
      { name: "Platou aperitive reci", category: "aperitiv", quantity: "8 platouri", cost: 1200, eventId: event.id },
      { name: "Salată de vinete", category: "aperitiv", quantity: "4 boluri", cost: 400, eventId: event.id },
      { name: "Friptură de porc la cuptor", category: "fel_principal", quantity: "60 porții", cost: 2400, eventId: event.id },
      { name: "Pește la grătar", category: "fel_principal", quantity: "20 porții", cost: 1000, eventId: event.id },
      { name: "Tort aniversar 3 etaje", category: "desert", quantity: "1 tort (60 pers.)", cost: 900, eventId: event.id },
      { name: "Vin & apă & sucuri", category: "bautura", quantity: "asortat", cost: 1500, eventId: event.id },
    ],
  });

  await prisma.task.createMany({
    data: [
      { title: "Trimite invitațiile", stage: "planificare", status: "finalizat", organizerId: ana.id, eventId: event.id, dueDate: new Date("2026-07-01") },
      { title: "Rezervă sala", stage: "planificare", status: "finalizat", organizerId: mihai.id, eventId: event.id, dueDate: new Date("2026-06-20") },
      { title: "Confirmă meniul cu restaurantul", stage: "pregatire", status: "in_lucru", organizerId: elena.id, eventId: event.id, dueDate: new Date("2026-07-25") },
      { title: "Colectează mesaje video de la rude", stage: "pregatire", status: "in_lucru", organizerId: ana.id, eventId: event.id, dueDate: new Date("2026-08-01") },
      { title: "Cumpără cadoul principal", stage: "pregatire", status: "de_facut", organizerId: elena.id, eventId: event.id, dueDate: new Date("2026-08-05") },
      { title: "Decorează sala", stage: "ziua_evenimentului", status: "de_facut", organizerId: mihai.id, eventId: event.id, dueDate: new Date("2026-08-15") },
      { title: "Trimite mulțumiri invitaților", stage: "dupa_eveniment", status: "de_facut", organizerId: ana.id, eventId: event.id },
    ],
  });

  await prisma.budgetItem.createMany({
    data: [
      { label: "Închiriere restaurant", stage: "sala", planned: 6000, actual: 6000, eventId: event.id },
      { label: "Mâncare și băuturi", stage: "meniu", planned: 7000, actual: 5400, eventId: event.id },
      { label: "Formație muzică live", stage: "muzica", planned: 2500, actual: 2500, eventId: event.id },
      { label: "Montaj video surpriză", stage: "video", planned: 1000, actual: 0, eventId: event.id },
      { label: "Cadouri", stage: "cadouri", planned: 1500, actual: 800, eventId: event.id },
      { label: "Decor și flori", stage: "decor", planned: 1000, actual: 0, eventId: event.id },
    ],
  });

  await prisma.vendor.createMany({
    data: [
      { name: "Formația Armonia", service: "muzica", contact: "069 222 333", status: "confirmat", cost: 2500, notes: "2 ore program + DJ după", eventId: event.id },
      { name: "Studio Video Memories", service: "video", contact: "069 444 555", status: "in_negociere", cost: 1000, notes: "Montaj mesaje + filmare eveniment", eventId: event.id },
      { name: "Florăria Lalele", service: "decor", contact: "069 666 777", status: "de_contactat", cost: 1000, eventId: event.id },
      { name: "Restaurant Grădina cu Tei", service: "catering", contact: "Dna. Popescu", status: "platit", cost: 6000, eventId: event.id },
    ],
  });

  console.log(`✔ Date demo create pentru evenimentul: ${event.name}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
