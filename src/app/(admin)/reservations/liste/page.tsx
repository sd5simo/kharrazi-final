"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, ChevronRight, Calendar, Car, User, CheckCircle2, XCircle, Clock, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useStore } from "@/store";
import { cn } from "@/lib/utils";

const STATUS_CFG: Record<string, { l: string; c: string }> = {
  CONFIRMED: { l: "Confirmée", c: "text-brand-green-400 bg-brand-green-500/10 border-brand-green-500/20" },
  PENDING:   { l: "En attente", c: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20" },
  CANCELLED: { l: "Annulée", c: "text-red-400 bg-red-500/10 border-red-500/20" },
  CONVERTED: { l: "Convertie", c: "text-purple-400 bg-purple-500/10 border-purple-500/20" },
};

export default function ReservationsListePage() {
  const router = useRouter();
  const { reservations, clients, vehicles, confirmReservation, cancelReservation } = useStore();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");

  const enriched = reservations.map((r) => ({
    ...r,
    client: clients.find((c) => c.id === r.clientId),
    vehicle: vehicles.find((v) => v.id === r.vehicleId),
  }));

  const filtered = enriched.filter((r) => {
    const str = `${r.refCode} ${r.client?.firstName} ${r.client?.lastName} ${r.vehicle?.plate}`.toLowerCase();
    return str.includes(search.toLowerCase()) && (filter === "ALL" || r.status === filter);
  }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Réservations</h1>
          <p className="text-slate-500 text-sm mt-0.5">{reservations.length} réservations · {reservations.filter(r => r.status === "PENDING" || r.status === "CONFIRMED").length} actives</p>
        </div>
        <Link href="/reservations/nouveau">
          <button className="flex items-center gap-2 px-4 py-2 bg-brand-green-600 hover:bg-brand-green-500 text-white text-sm font-semibold rounded-lg transition-colors">
            <Plus size={15} /> Nouvelle réservation
          </button>
        </Link>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {[
          { f: "ALL", l: "Toutes", v: reservations.length, c: "text-white" },
          { f: "CONFIRMED", l: "Confirmées", v: reservations.filter(r => r.status === "CONFIRMED").length, c: "text-brand-green-400" },
          { f: "PENDING", l: "En attente", v: reservations.filter(r => r.status === "PENDING").length, c: "text-yellow-400" },
          { f: "CANCELLED", l: "Annulées", v: reservations.filter(r => r.status === "CANCELLED").length, c: "text-red-400" },
        ].map((s) => (
          <button key={s.f} onClick={() => setFilter(s.f)}
            className={cn("rounded-xl border bg-[#161b22] p-4 text-left transition-all", filter === s.f ? "border-brand-green-500/40" : "border-[#21262d] hover:border-[#30363d]")}>
            <p className="text-xs text-slate-500">{s.l}</p>
            <p className={cn("text-xl font-bold mt-1", s.c)}>{s.v}</p>
          </button>
        ))}
      </div>

      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Référence, client, plaque..."
          className="w-full pl-9 pr-4 py-2.5 bg-[#161b22] border border-[#30363d] rounded-lg text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-brand-green-500/50 transition-all" />
      </div>

      <div className="space-y-2">
        {filtered.map((r) => {
          const cfg = STATUS_CFG[r.status];
          const days = Math.ceil((new Date(r.endDate).getTime() - new Date(r.startDate).getTime()) / 86400000);
          return (
            <div key={r.id} className="rounded-xl border border-[#21262d] bg-[#161b22] p-4 hover:border-[#30363d] transition-all">
              <div className="flex items-center gap-4">
                <span className={cn("flex-shrink-0 inline-flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-lg border", cfg.c)}>{cfg.l}</span>
                <div className="flex-1 min-w-0 cursor-pointer" onClick={() => router.push(`/reservations/${r.id}`)}>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-bold text-brand-green-400 font-mono">{r.refCode}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1"><User size={10} />{r.client?.firstName} {r.client?.lastName}</span>
                    <span className="flex items-center gap-1"><Car size={10} />{r.vehicle?.brand} {r.vehicle?.model} · {r.vehicle?.plate}</span>
                    <span className="flex items-center gap-1"><Calendar size={10} />{r.startDate} → {r.endDate} ({days}j)</span>
                  </div>
                </div>
                <p className="text-sm font-bold text-white flex-shrink-0">{r.totalAmount.toLocaleString("fr-FR")} MAD</p>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {r.status === "PENDING" && (
                    <>
                      <button onClick={() => confirmReservation(r.id)} className="text-xs px-2 py-1 rounded-lg bg-brand-green-500/10 text-brand-green-400 border border-brand-green-500/20 hover:bg-brand-green-500/20 transition-colors">Confirmer</button>
                      <button onClick={() => cancelReservation(r.id)} className="text-xs px-2 py-1 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors">Annuler</button>
                    </>
                  )}
                  {r.status === "CONFIRMED" && (
                    <Link href="/locations/nouveau">
                      <button className="text-xs px-2 py-1 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 transition-colors flex items-center gap-1"><ArrowRight size={10} /> → Location</button>
                    </Link>
                  )}
                  <button onClick={() => router.push(`/reservations/${r.id}`)} className="text-slate-600 hover:text-brand-green-400 transition-colors">
                    <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
