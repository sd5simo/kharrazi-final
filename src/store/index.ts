import { create } from "zustand";
import { persist } from "zustand/middleware";

// ── Types ─────────────────────────────────────────────────────────────────────
export interface Client {
  id: string;
  cin: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string;
  address: string | null;
  city: string | null;
  licenseNum: string | null;
  licenseExp: string | null;
  isBlacklist: boolean;
  blacklistReason: string | null;
  blacklistedAt: string | null;
  createdAt: string;
  notes: string | null;
}

export interface Vehicle {
  id: string;
  plate: string;
  brand: string;
  model: string;
  year: number;
  category: string;
  color: string;
  fuelType: string;
  transmission: string;
  seats: number;
  dailyRate: number;
  status: "AVAILABLE" | "RENTED" | "MAINTENANCE" | "OUT_OF_SERVICE";
  mileage: number;
  lastOilChangeMileage: number;
  nextOilChangeMileage: number;
  technicalInspectionDate: string | null;
  insuranceExpiry: string | null;
  vignetteExpiry: string | null;
  notes: string | null;
  damages: Damage[];
}

export interface Damage {
  id: string;
  zone: string;
  description: string;
  severity: "MINOR" | "MODERATE" | "SEVERE";
  repaired: boolean;
  repairedAt: string | null;
  reportedAt: string;
  cost: number | null;
  rentalId: string | null;
}

export interface Rental {
  id: string;
  contractNum: string;
  clientId: string;
  vehicleId: string;
  startDate: string;
  endDate: string;
  returnDate: string | null;
  dailyRate: number;
  totalDays: number;
  totalAmount: number;
  paidAmount: number;
  deposit: number;
  depositReturned: boolean;
  fuelLevelStart: string;
  fuelLevelEnd: string | null;
  mileageStart: number;
  mileageEnd: number | null;
  status: "ACTIVE" | "COMPLETED" | "CANCELLED";
  extras: { label: string; amount: number }[];
  notes: string | null;
  createdAt: string;
}

export interface Reservation {
  id: string;
  refCode: string;
  clientId: string;
  vehicleId: string;
  startDate: string;
  endDate: string;
  totalAmount: number;
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "CONVERTED";
  notes: string | null;
  createdAt: string;
}

export interface Expense {
  id: string;
  vehicleId: string | null;
  category: string;
  description: string;
  amount: number;
  date: string;
  vendor: string | null;
}

export interface Infraction {
  id: string;
  clientId: string;
  rentalId: string | null;
  type: string;
  description: string;
  amount: number | null;
  date: string;
  resolved: boolean;
}

// ── Real Fleet Data — Kharrazi car you ───────────────────────────────────────
const INITIAL_VEHICLES: Vehicle[] = [
  { id: "v1",  plate: "26384-A-25", brand: "Peugeot",  model: "208",     year: 2025, category: "ECONOMY", color: "Blanc",     fuelType: "Essence",  transmission: "Manuelle",    seats: 5, dailyRate: 300, status: "AVAILABLE",    mileage: 4200,  lastOilChangeMileage: 0,     nextOilChangeMileage: 10000, technicalInspectionDate: "2026-06-01", insuranceExpiry: "2026-01-15", vignetteExpiry: "2026-01-15", notes: null, damages: [] },
  { id: "v2",  plate: "26383-A-25", brand: "Peugeot",  model: "208",     year: 2025, category: "ECONOMY", color: "Gris",      fuelType: "Essence",  transmission: "Manuelle",    seats: 5, dailyRate: 300, status: "AVAILABLE",    mileage: 5100,  lastOilChangeMileage: 0,     nextOilChangeMileage: 10000, technicalInspectionDate: "2026-06-01", insuranceExpiry: "2026-01-15", vignetteExpiry: "2026-01-15", notes: null, damages: [] },
  { id: "v3",  plate: "26461-A-25", brand: "Peugeot",  model: "208",     year: 2025, category: "ECONOMY", color: "Rouge",     fuelType: "Essence",  transmission: "Manuelle",    seats: 5, dailyRate: 300, status: "RENTED",       mileage: 3800,  lastOilChangeMileage: 0,     nextOilChangeMileage: 10000, technicalInspectionDate: "2026-06-01", insuranceExpiry: "2026-01-15", vignetteExpiry: "2026-01-15", notes: null, damages: [] },
  { id: "v4",  plate: "26663-A-25", brand: "Citroën",  model: "C4X",     year: 2025, category: "COMFORT", color: "Noir",      fuelType: "Diesel",   transmission: "Automatique", seats: 5, dailyRate: 450, status: "AVAILABLE",    mileage: 2900,  lastOilChangeMileage: 0,     nextOilChangeMileage: 15000, technicalInspectionDate: "2026-06-01", insuranceExpiry: "2026-01-15", vignetteExpiry: "2026-01-15", notes: null, damages: [] },
  { id: "v5",  plate: "25139-A-25", brand: "Dacia",    model: "Logan",   year: 2025, category: "ECONOMY", color: "Blanc",     fuelType: "Diesel",   transmission: "Manuelle",    seats: 5, dailyRate: 250, status: "AVAILABLE",    mileage: 8500,  lastOilChangeMileage: 0,     nextOilChangeMileage: 10000, technicalInspectionDate: "2026-06-01", insuranceExpiry: "2026-01-15", vignetteExpiry: "2026-01-15", notes: null, damages: [] },
  { id: "v6",  plate: "25136-A-25", brand: "Dacia",    model: "Sandero", year: 2025, category: "ECONOMY", color: "Blanc",     fuelType: "Essence",  transmission: "Manuelle",    seats: 5, dailyRate: 260, status: "AVAILABLE",    mileage: 6200,  lastOilChangeMileage: 0,     nextOilChangeMileage: 10000, technicalInspectionDate: "2026-06-01", insuranceExpiry: "2026-01-15", vignetteExpiry: "2026-01-15", notes: null, damages: [] },
  { id: "v7",  plate: "25138-A-25", brand: "Dacia",    model: "Sandero", year: 2025, category: "ECONOMY", color: "Gris",      fuelType: "Essence",  transmission: "Manuelle",    seats: 5, dailyRate: 260, status: "RENTED",       mileage: 7100,  lastOilChangeMileage: 0,     nextOilChangeMileage: 10000, technicalInspectionDate: "2026-06-01", insuranceExpiry: "2026-01-15", vignetteExpiry: "2026-01-15", notes: null, damages: [] },
  { id: "v8",  plate: "25140-A-25", brand: "Dacia",    model: "Sandero", year: 2025, category: "ECONOMY", color: "Bleu",      fuelType: "Essence",  transmission: "Manuelle",    seats: 5, dailyRate: 260, status: "MAINTENANCE",  mileage: 9800,  lastOilChangeMileage: 0,     nextOilChangeMileage: 10000, technicalInspectionDate: "2026-06-01", insuranceExpiry: "2026-01-15", vignetteExpiry: "2026-01-15", notes: "Vidange en cours.", damages: [{ id: "dmg1", zone: "FRONT", description: "Légère rayure pare-chocs avant", severity: "MINOR", repaired: false, repairedAt: null, reportedAt: "2025-03-10", cost: null, rentalId: null }] },
  { id: "v9",  plate: "816049WW",   brand: "Renault",  model: "Clio 5",  year: 2024, category: "ECONOMY", color: "Blanc",     fuelType: "Essence",  transmission: "Manuelle",    seats: 5, dailyRate: 280, status: "AVAILABLE",    mileage: 15200, lastOilChangeMileage: 10000, nextOilChangeMileage: 20000, technicalInspectionDate: "2025-10-15", insuranceExpiry: "2025-09-01", vignetteExpiry: "2025-08-01", notes: null, damages: [] },
  { id: "v10", plate: "816050WW",   brand: "Renault",  model: "Clio 5",  year: 2024, category: "ECONOMY", color: "Noir",      fuelType: "Essence",  transmission: "Manuelle",    seats: 5, dailyRate: 280, status: "AVAILABLE",    mileage: 18400, lastOilChangeMileage: 10000, nextOilChangeMileage: 20000, technicalInspectionDate: "2025-10-15", insuranceExpiry: "2025-09-01", vignetteExpiry: "2025-08-01", notes: null, damages: [] },
  { id: "v11", plate: "816058WW",   brand: "Renault",  model: "Clio 5",  year: 2024, category: "ECONOMY", color: "Gris",      fuelType: "Essence",  transmission: "Automatique", seats: 5, dailyRate: 300, status: "RENTED",       mileage: 21000, lastOilChangeMileage: 20000, nextOilChangeMileage: 30000, technicalInspectionDate: "2025-10-15", insuranceExpiry: "2025-09-01", vignetteExpiry: "2025-08-01", notes: null, damages: [] },
];

const INITIAL_CLIENTS: Client[] = [
  { id: "c1", cin: "AB123456", firstName: "Youssef",     lastName: "Benali",   email: "y.benali@email.ma",   phone: "0661234567", address: "12 Rue Hassan II",         city: "Casablanca", licenseNum: "MA-12345", licenseExp: "2027-08-15", isBlacklist: false, blacklistReason: null, blacklistedAt: null, createdAt: "2025-01-10", notes: "Client régulier — préfère Peugeot 208." },
  { id: "c2", cin: "CD789012", firstName: "Fatima Zahra",lastName: "Idrissi",  email: "fz.idrissi@email.ma", phone: "0662345678", address: "45 Avenue Mohammed V",    city: "Rabat",      licenseNum: "MA-67890", licenseExp: "2026-12-01", isBlacklist: false, blacklistReason: null, blacklistedAt: null, createdAt: "2025-01-20", notes: null },
  { id: "c3", cin: "EF345678", firstName: "Omar",        lastName: "Tazi",     email: null,                  phone: "0663456789", address: "7 Bd Zerktouni",          city: "Casablanca", licenseNum: "MA-11111", licenseExp: "2025-03-10", isBlacklist: true,  blacklistReason: "Retour véhicule 25140-A-25 avec dommage non déclaré. Doit 1 800 MAD.", blacklistedAt: "2025-02-15", createdAt: "2025-01-05", notes: "Ne pas accepter." },
  { id: "c4", cin: "GH901234", firstName: "Aicha",       lastName: "Slaoui",   email: null,                  phone: "0664567890", address: "22 Rue Ibn Battouta",     city: "Fès",        licenseNum: "MA-22222", licenseExp: "2027-01-20", isBlacklist: false, blacklistReason: null, blacklistedAt: null, createdAt: "2025-02-01", notes: null },
  { id: "c5", cin: "IJ567890", firstName: "Karim",       lastName: "Hajji",    email: "k.hajji@email.ma",    phone: "0665678901", address: "99 Rue de la Liberté",    city: "Agadir",     licenseNum: "MA-33333", licenseExp: "2026-05-30", isBlacklist: false, blacklistReason: null, blacklistedAt: null, createdAt: "2025-02-10", notes: "Vient souvent avec sa famille." },
  { id: "c6", cin: "KL234567", firstName: "Nadia",       lastName: "Berrada",  email: "n.berrada@email.ma",  phone: "0666789012", address: "3 Rue Al Ousoul",         city: "Casablanca", licenseNum: "MA-44444", licenseExp: "2027-11-15", isBlacklist: false, blacklistReason: null, blacklistedAt: null, createdAt: "2025-03-05", notes: null },
  { id: "c7", cin: "MN890123", firstName: "Hassan",      lastName: "Zouiten",  email: null,                  phone: "0667890123", address: "15 Av des FAR",           city: "Oujda",      licenseNum: "MA-55555", licenseExp: "2026-07-01", isBlacklist: false, blacklistReason: null, blacklistedAt: null, createdAt: "2025-03-12", notes: null },
  { id: "c8", cin: "OP456789", firstName: "Layla",       lastName: "Mansouri", email: "l.mansouri@email.ma", phone: "0668901234", address: "8 Rue Mohammed Zerktouni",city: "Tanger",     licenseNum: "MA-66666", licenseExp: "2027-04-20", isBlacklist: false, blacklistReason: null, blacklistedAt: null, createdAt: "2025-03-18", notes: "Loue régulièrement pour voyages Tanger-Casablanca." },
];

const INITIAL_RENTALS: Rental[] = [
  { id: "r1", contractNum: "CTR-2025-001", clientId: "c1", vehicleId: "v3",  startDate: "2025-03-20", endDate: "2025-03-27", returnDate: null,        dailyRate: 300, totalDays: 7,  totalAmount: 2100, paidAmount: 2100, deposit: 2000, depositReturned: false, fuelLevelStart: "Plein", fuelLevelEnd: null,   mileageStart: 3500,  mileageEnd: null,  status: "ACTIVE",    extras: [],                            notes: "Client habituel.", createdAt: "2025-03-20" },
  { id: "r2", contractNum: "CTR-2025-002", clientId: "c5", vehicleId: "v7",  startDate: "2025-03-22", endDate: "2025-03-25", returnDate: null,        dailyRate: 260, totalDays: 3,  totalAmount: 780,  paidAmount: 780,  deposit: 1500, depositReturned: false, fuelLevelStart: "Plein", fuelLevelEnd: null,   mileageStart: 6800,  mileageEnd: null,  status: "ACTIVE",    extras: [],                            notes: null,              createdAt: "2025-03-22" },
  { id: "r3", contractNum: "CTR-2025-003", clientId: "c8", vehicleId: "v11", startDate: "2025-03-18", endDate: "2025-03-25", returnDate: null,        dailyRate: 300, totalDays: 7,  totalAmount: 2100, paidAmount: 1050, deposit: 2000, depositReturned: false, fuelLevelStart: "Plein", fuelLevelEnd: null,   mileageStart: 20500, mileageEnd: null,  status: "ACTIVE",    extras: [{ label: "GPS", amount: 200 }], notes: "Paiement en 2 fois.", createdAt: "2025-03-18" },
  { id: "r4", contractNum: "CTR-2025-004", clientId: "c2", vehicleId: "v1",  startDate: "2025-03-10", endDate: "2025-03-15", returnDate: "2025-03-15", dailyRate: 300, totalDays: 5,  totalAmount: 1500, paidAmount: 1500, deposit: 2000, depositReturned: true,  fuelLevelStart: "Plein", fuelLevelEnd: "3/4",  mileageStart: 3000,  mileageEnd: 3400,  status: "COMPLETED", extras: [],                            notes: null,              createdAt: "2025-03-10" },
  { id: "r5", contractNum: "CTR-2025-005", clientId: "c4", vehicleId: "v9",  startDate: "2025-03-08", endDate: "2025-03-12", returnDate: "2025-03-12", dailyRate: 280, totalDays: 4,  totalAmount: 1120, paidAmount: 1120, deposit: 1500, depositReturned: true,  fuelLevelStart: "Plein", fuelLevelEnd: "Plein",mileageStart: 14000, mileageEnd: 14320, status: "COMPLETED", extras: [],                            notes: null,              createdAt: "2025-03-08" },
  { id: "r6", contractNum: "CTR-2025-006", clientId: "c6", vehicleId: "v5",  startDate: "2025-03-01", endDate: "2025-03-06", returnDate: "2025-03-06", dailyRate: 250, totalDays: 5,  totalAmount: 1250, paidAmount: 1250, deposit: 1500, depositReturned: true,  fuelLevelStart: "Plein", fuelLevelEnd: "1/2",  mileageStart: 7800,  mileageEnd: 8200,  status: "COMPLETED", extras: [],                            notes: null,              createdAt: "2025-03-01" },
  { id: "r7", contractNum: "CTR-2025-007", clientId: "c7", vehicleId: "v10", startDate: "2025-02-20", endDate: "2025-02-25", returnDate: "2025-02-25", dailyRate: 280, totalDays: 5,  totalAmount: 1400, paidAmount: 1400, deposit: 1500, depositReturned: true,  fuelLevelStart: "Plein", fuelLevelEnd: "3/4",  mileageStart: 17000, mileageEnd: 17450, status: "COMPLETED", extras: [],                            notes: null,              createdAt: "2025-02-20" },
  { id: "r8", contractNum: "CTR-2025-008", clientId: "c1", vehicleId: "v6",  startDate: "2025-02-15", endDate: "2025-02-20", returnDate: "2025-02-20", dailyRate: 260, totalDays: 5,  totalAmount: 1300, paidAmount: 1300, deposit: 1500, depositReturned: true,  fuelLevelStart: "Plein", fuelLevelEnd: "Plein",mileageStart: 5500,  mileageEnd: 5900,  status: "COMPLETED", extras: [],                            notes: null,              createdAt: "2025-02-15" },
  { id: "r9", contractNum: "CTR-2025-009", clientId: "c5", vehicleId: "v4",  startDate: "2025-02-10", endDate: "2025-02-17", returnDate: "2025-02-17", dailyRate: 450, totalDays: 7,  totalAmount: 3150, paidAmount: 3150, deposit: 2500, depositReturned: true,  fuelLevelStart: "Plein", fuelLevelEnd: "Plein",mileageStart: 2100,  mileageEnd: 2700,  status: "COMPLETED", extras: [{ label: "Siège bébé", amount: 150 }], notes: null, createdAt: "2025-02-10" },
  { id: "r10",contractNum: "CTR-2025-010", clientId: "c3", vehicleId: "v8",  startDate: "2025-02-01", endDate: "2025-02-05", returnDate: "2025-02-05", dailyRate: 260, totalDays: 4,  totalAmount: 1040, paidAmount: 1040, deposit: 1500, depositReturned: false, fuelLevelStart: "Plein", fuelLevelEnd: "1/4",  mileageStart: 9000,  mileageEnd: 9280,  status: "COMPLETED", extras: [],                            notes: "Dommage constaté au retour.", createdAt: "2025-02-01" },
];

const INITIAL_RESERVATIONS: Reservation[] = [
  { id: "res1", refCode: "RES-2025-001", clientId: "c2", vehicleId: "v2", startDate: "2025-04-01", endDate: "2025-04-06", totalAmount: 1500, status: "CONFIRMED", notes: "Voyage Rabat-Marrakech.", createdAt: "2025-03-20" },
  { id: "res2", refCode: "RES-2025-002", clientId: "c4", vehicleId: "v9", startDate: "2025-04-10", endDate: "2025-04-15", totalAmount: 1400, status: "PENDING",   notes: null,                  createdAt: "2025-03-22" },
  { id: "res3", refCode: "RES-2025-003", clientId: "c7", vehicleId: "v4", startDate: "2025-04-20", endDate: "2025-04-27", totalAmount: 3150, status: "CONFIRMED", notes: "Demande automatique.", createdAt: "2025-03-23" },
];

const INITIAL_EXPENSES: Expense[] = [
  { id: "e1", vehicleId: "v8",  category: "MAINTENANCE", description: "Vidange + filtres — Dacia Sandero 25140-A-25", amount: 380,  date: "2025-03-15", vendor: "Garage Kharrazi Casablanca" },
  { id: "e2", vehicleId: null,  category: "INSURANCE",   description: "Assurance flotte — mars 2025",                amount: 5200, date: "2025-03-01", vendor: "Wafa Assurance" },
  { id: "e3", vehicleId: "v9",  category: "MAINTENANCE", description: "Vidange + remplacement filtres — Clio 5 816049WW", amount: 420, date: "2025-02-20", vendor: "Garage Renault Casablanca" },
  { id: "e4", vehicleId: null,  category: "INSURANCE",   description: "Assurance flotte — février 2025",             amount: 5200, date: "2025-02-01", vendor: "Wafa Assurance" },
  { id: "e5", vehicleId: "v10", category: "CLEANING",    description: "Nettoyage complet Clio 5 816050WW",           amount: 180,  date: "2025-03-18", vendor: null },
  { id: "e6", vehicleId: null,  category: "OTHER",       description: "Fournitures bureau + papeterie contrats",     amount: 290,  date: "2025-03-05", vendor: null },
  { id: "e7", vehicleId: "v8",  category: "REPAIR",      description: "Réparation rayure pare-chocs — Sandero 25140", amount: 650, date: "2025-03-20", vendor: "Carrosserie Moderne" },
];

const INITIAL_INFRACTIONS: Infraction[] = [
  { id: "i1", clientId: "c3", rentalId: "r10", type: "DAMAGE",      description: "Retour Dacia Sandero 25140-A-25 avec dommage non déclaré. Pare-chocs avant rayé. Devis réparation: 650 MAD.", amount: 650,  date: "2025-02-05", resolved: false },
  { id: "i2", clientId: "c1", rentalId: "r8",  type: "FUEL",        description: "Retour Sandero avec niveau carburant 1/4 (départ: plein). Différence facturée.",                              amount: 180,  date: "2025-02-20", resolved: true  },
  { id: "i3", clientId: "c8", rentalId: "r3",  type: "LATE_RETURN", description: "Retour Clio 5 prévu le 25/03 — en retard.",                                                                   amount: null, date: "2025-03-26", resolved: false },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
function uid() { return Math.random().toString(36).slice(2, 10); }

// ── Store ─────────────────────────────────────────────────────────────────────
interface AppState {
  clients: Client[];
  vehicles: Vehicle[];
  rentals: Rental[];
  reservations: Reservation[];
  expenses: Expense[];
  infractions: Infraction[];

  addClient: (c: Omit<Client, "id" | "createdAt">) => void;
  updateClient: (id: string, data: Partial<Client>) => void;
  toggleBlacklist: (id: string, reason?: string) => void;

  addVehicle: (v: Omit<Vehicle, "id" | "damages">) => void;
  updateVehicle: (id: string, data: Partial<Vehicle>) => void;
  addDamage: (vehicleId: string, d: Omit<Damage, "id" | "reportedAt">) => void;
  repairDamage: (vehicleId: string, damageId: string, cost: number) => void;

  addRental: (r: Omit<Rental, "id" | "contractNum" | "createdAt">) => string;
  updateRental: (id: string, data: Partial<Rental>) => void;
  closeRental: (id: string, mileageEnd: number, fuelEnd: string, returnDate: string) => void;

  addReservation: (r: Omit<Reservation, "id" | "refCode" | "createdAt">) => void;
  updateReservation: (id: string, data: Partial<Reservation>) => void;
  cancelReservation: (id: string) => void;
  confirmReservation: (id: string) => void;

  addExpense: (e: Omit<Expense, "id">) => void;
  updateExpense: (id: string, data: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;

  addInfraction: (i: Omit<Infraction, "id">) => void;
  resolveInfraction: (id: string) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      clients: INITIAL_CLIENTS,
      vehicles: INITIAL_VEHICLES,
      rentals: INITIAL_RENTALS,
      reservations: INITIAL_RESERVATIONS,
      expenses: INITIAL_EXPENSES,
      infractions: INITIAL_INFRACTIONS,

      addClient: (c) => set((s) => ({ clients: [...s.clients, { ...c, id: "c" + uid(), createdAt: new Date().toISOString().slice(0, 10) }] })),
      updateClient: (id, data) => set((s) => ({ clients: s.clients.map((c) => c.id === id ? { ...c, ...data } : c) })),
      toggleBlacklist: (id, reason) => set((s) => ({
        clients: s.clients.map((c) => c.id === id ? { ...c, isBlacklist: !c.isBlacklist, blacklistReason: !c.isBlacklist ? (reason ?? null) : null, blacklistedAt: !c.isBlacklist ? new Date().toISOString().slice(0, 10) : null } : c),
      })),

      addVehicle: (v) => set((s) => ({ vehicles: [...s.vehicles, { ...v, id: "v" + uid(), damages: [] }] })),
      updateVehicle: (id, data) => set((s) => ({ vehicles: s.vehicles.map((v) => v.id === id ? { ...v, ...data } : v) })),
      addDamage: (vehicleId, d) => set((s) => ({ vehicles: s.vehicles.map((v) => v.id === vehicleId ? { ...v, damages: [...v.damages, { ...d, id: "d" + uid(), reportedAt: new Date().toISOString().slice(0, 10) }] } : v) })),
      repairDamage: (vehicleId, damageId, cost) => set((s) => ({ vehicles: s.vehicles.map((v) => v.id === vehicleId ? { ...v, damages: v.damages.map((d) => d.id === damageId ? { ...d, repaired: true, repairedAt: new Date().toISOString().slice(0, 10), cost } : d) } : v) })),

      addRental: (r) => {
        const id = "r" + uid();
        const count = get().rentals.length + 1;
        const contractNum = `CTR-${new Date().getFullYear()}-${String(count).padStart(3, "0")}`;
        set((s) => ({ rentals: [...s.rentals, { ...r, id, contractNum, createdAt: new Date().toISOString().slice(0, 10) }], vehicles: s.vehicles.map((v) => v.id === r.vehicleId ? { ...v, status: "RENTED" } : v) }));
        return contractNum;
      },
      updateRental: (id, data) => set((s) => ({ rentals: s.rentals.map((r) => r.id === id ? { ...r, ...data } : r) })),
      closeRental: (id, mileageEnd, fuelEnd, returnDate) => set((s) => {
        const rental = s.rentals.find((r) => r.id === id);
        return { rentals: s.rentals.map((r) => r.id === id ? { ...r, status: "COMPLETED", mileageEnd, fuelLevelEnd: fuelEnd, returnDate } : r), vehicles: s.vehicles.map((v) => v.id === rental?.vehicleId ? { ...v, status: "AVAILABLE", mileage: mileageEnd } : v) };
      }),

      addReservation: (r) => { const count = get().reservations.length + 1; const refCode = `RES-${new Date().getFullYear()}-${String(count).padStart(3, "0")}`; set((s) => ({ reservations: [...s.reservations, { ...r, id: "res" + uid(), refCode, createdAt: new Date().toISOString().slice(0, 10) }] })); },
      updateReservation: (id, data) => set((s) => ({ reservations: s.reservations.map((r) => r.id === id ? { ...r, ...data } : r) })),
      cancelReservation: (id) => set((s) => ({ reservations: s.reservations.map((r) => r.id === id ? { ...r, status: "CANCELLED" } : r) })),
      confirmReservation: (id) => set((s) => ({ reservations: s.reservations.map((r) => r.id === id ? { ...r, status: "CONFIRMED" } : r) })),

      addExpense: (e) => set((s) => ({ expenses: [...s.expenses, { ...e, id: "e" + uid() }] })),
      updateExpense: (id, data) => set((s) => ({ expenses: s.expenses.map((e) => e.id === id ? { ...e, ...data } : e) })),
      deleteExpense: (id) => set((s) => ({ expenses: s.expenses.filter((e) => e.id !== id) })),

      addInfraction: (i) => set((s) => ({ infractions: [...s.infractions, { ...i, id: "i" + uid() }] })),
      resolveInfraction: (id) => set((s) => ({ infractions: s.infractions.map((i) => i.id === id ? { ...i, resolved: true } : i) })),
    }),
    { name: "kharrazi-admin-store" }
  )
);

// ── Computed selectors ────────────────────────────────────────────────────────
export function useClientStats(clientId: string) {
  const { rentals, infractions } = useStore();
  const clientRentals = rentals.filter((r) => r.clientId === clientId);
  const clientInfractions = infractions.filter((i) => i.clientId === clientId);
  const totalSpent = clientRentals.reduce((s, r) => s + r.paidAmount, 0);
  const totalDays = clientRentals.reduce((s, r) => s + r.totalDays, 0);
  const avgPerRental = clientRentals.length > 0 ? totalSpent / clientRentals.length : 0;
  const activeRental = clientRentals.find((r) => r.status === "ACTIVE");
  return { clientRentals, clientInfractions, totalSpent, totalDays, avgPerRental, activeRental };
}

export function useVehicleAlerts(vehicle: Vehicle | undefined) {
  if (!vehicle) return [];
  const alerts: { severity: "CRITICAL" | "WARNING"; type: string; msg: string }[] = [];
  const now = Date.now(); const day = 86400000;
  const oilLeft = vehicle.nextOilChangeMileage - vehicle.mileage;
  if (oilLeft <= 0) alerts.push({ severity: "CRITICAL", type: "Vidange", msg: `Dépassée de ${Math.abs(oilLeft).toLocaleString("fr-FR")} km` });
  else if (oilLeft <= 2000) alerts.push({ severity: "WARNING", type: "Vidange", msg: `Dans ${oilLeft.toLocaleString("fr-FR")} km` });
  if (vehicle.technicalInspectionDate) {
    const d = Math.ceil((new Date(vehicle.technicalInspectionDate).getTime() - now) / day);
    if (d < 0) alerts.push({ severity: "CRITICAL", type: "Visite technique", msg: `Expirée (${Math.abs(d)}j)` });
    else if (d <= 30) alerts.push({ severity: "WARNING", type: "Visite technique", msg: `Dans ${d}j` });
  }
  if (vehicle.insuranceExpiry) {
    const d = Math.ceil((new Date(vehicle.insuranceExpiry).getTime() - now) / day);
    if (d < 0) alerts.push({ severity: "CRITICAL", type: "Assurance", msg: `Expirée (${Math.abs(d)}j)` });
    else if (d <= 30) alerts.push({ severity: "WARNING", type: "Assurance", msg: `Dans ${d}j` });
  }
  if (vehicle.vignetteExpiry) {
    const d = Math.ceil((new Date(vehicle.vignetteExpiry).getTime() - now) / day);
    if (d < 0) alerts.push({ severity: "CRITICAL", type: "Vignette", msg: `Expirée (${Math.abs(d)}j)` });
    else if (d <= 30) alerts.push({ severity: "WARNING", type: "Vignette", msg: `Dans ${d}j` });
  }
  return alerts;
}
