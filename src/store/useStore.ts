/**
 * @/store/useStore.ts
 *
 * This is the unified store hook that all pages import.
 * It re-exports useStore from the base store AND adds all computed
 * selector methods that pages depend on (getRentalsByClient, etc.).
 *
 * WHY THIS FILE EXISTS:
 * Several pages were written importing from "@/store/useStore" while
 * the base store lives at "@/store/index.ts". Rather than rewriting
 * every page import, this shim provides a superset of the base store
 * and adds all computed getters in one place.
 */

"use client";

import { useStore as useBaseStore } from "@/store";
import type {
  Client,
  Vehicle,
  Rental,
  Damage,
  Infraction,
  Expense,
  Reservation,
} from "@/store";

// Re-export all types for convenience
export type {
  Client,
  Vehicle,
  Rental,
  Damage,
  Infraction,
  Expense,
  Reservation,
};

// Re-export the raw store for components that only need base actions
export { useClientStats, useVehicleAlerts } from "@/store";

/**
 * Enhanced useStore hook with computed selectors.
 * Drop-in replacement for useStore that adds getter methods.
 */
export function useStore() {
  const base = useBaseStore();

  // ── Client selectors ──────────────────────────────────────────────
  const getRentalsByClient = (clientId: string): Rental[] =>
    base.rentals.filter((r) => r.clientId === clientId);

  const getClientTotalSpent = (clientId: string): number =>
    base.rentals
      .filter((r) => r.clientId === clientId)
      .reduce((sum, r) => sum + r.paidAmount, 0);

  const getClientById = (clientId: string): Client | undefined =>
    base.clients.find((c) => c.id === clientId);

  /**
   * Returns damage logs attributed to a specific client.
   * Damages are stored on vehicles but linked via rentalId.
   * We cross-reference via the rental's clientId.
   */
  const getDamagesByClient = (clientId: string): DamageWithMeta[] => {
    const clientRentalIds = new Set(
      base.rentals
        .filter((r) => r.clientId === clientId)
        .map((r) => r.id)
    );
    const result: DamageWithMeta[] = [];
    base.vehicles.forEach((vehicle) => {
      vehicle.damages.forEach((d) => {
        if (d.rentalId && clientRentalIds.has(d.rentalId)) {
          result.push({
            ...d,
            vehicleId: vehicle.id,
            vehiclePlate: vehicle.plate,
            vehicleBrand: vehicle.brand,
            vehicleModel: vehicle.model,
          });
        }
      });
    });
    return result;
  };

  const getInfractionsByClient = (clientId: string): Infraction[] =>
    base.infractions.filter((i) => i.clientId === clientId);

  // ── Vehicle selectors ─────────────────────────────────────────────
  const getVehicleById = (vehicleId: string): Vehicle | undefined =>
    base.vehicles.find((v) => v.id === vehicleId);

  const getRentalsByVehicle = (vehicleId: string): Rental[] =>
    base.rentals
      .filter((r) => r.vehicleId === vehicleId)
      .sort(
        (a, b) =>
          new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
      );

  const getVehicleTotalRevenue = (vehicleId: string): number =>
    base.rentals
      .filter((r) => r.vehicleId === vehicleId)
      .reduce((sum, r) => sum + r.paidAmount, 0);

  /**
   * Returns all damage entries for a vehicle with enriched metadata.
   */
  const getDamagesByVehicle = (vehicleId: string): DamageWithMeta[] => {
    const vehicle = base.vehicles.find((v) => v.id === vehicleId);
    if (!vehicle) return [];
    return vehicle.damages.map((d) => ({
      ...d,
      vehicleId: vehicle.id,
      vehiclePlate: vehicle.plate,
      vehicleBrand: vehicle.brand,
      vehicleModel: vehicle.model,
    }));
  };

  // ── Global stats ──────────────────────────────────────────────────
  const getTotalRevenue = (): number =>
    base.rentals.reduce((sum, r) => sum + r.paidAmount, 0);

  const getTotalExpenses = (): number =>
    base.expenses.reduce((sum, e) => sum + e.amount, 0);

  const getActiveRentals = (): Rental[] =>
    base.rentals.filter((r) => r.status === "ACTIVE");

  const getPendingBalance = (): number =>
    base.rentals.reduce(
      (sum, r) => sum + Math.max(0, r.totalAmount - r.paidAmount),
      0
    );

  return {
    // ── Base state ────────────────────────────────────────────────
    ...base,

    // ── Client computed ───────────────────────────────────────────
    getRentalsByClient,
    getClientTotalSpent,
    getClientById,
    getDamagesByClient,
    getInfractionsByClient,

    // ── Vehicle computed ──────────────────────────────────────────
    getVehicleById,
    getRentalsByVehicle,
    getVehicleTotalRevenue,
    getDamagesByVehicle,

    // ── Global computed ───────────────────────────────────────────
    getTotalRevenue,
    getTotalExpenses,
    getActiveRentals,
    getPendingBalance,
  };
}

// ── Enriched Damage type (includes vehicle metadata) ─────────────────────────
export interface DamageWithMeta {
  id: string;
  zone: string;
  description: string;
  severity: "MINOR" | "MODERATE" | "SEVERE";
  repaired: boolean;
  repairedAt: string | null;
  reportedAt: string;
  cost: number | null;
  rentalId: string | null;
  // Enriched fields
  vehicleId: string;
  vehiclePlate: string;
  vehicleBrand: string;
  vehicleModel: string;
}
