"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, Car, User, Calendar, Clock, CheckCircle, ChevronRight, Banknote } from "lucide-react";
import Link from "next/link";
import { useStore } from "@/store";
import { cn } from "@/lib/utils";

export default function LocationsListePage() {
  const router = useRouter();
  const { rentals, clients, vehicles } = useStore();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");

  const enriched = rentals.map((r) => ({
    ...r,
    client: clients.find((c) => c.id === r.clientId),
    vehicle: vehicles.find((v) => v.id === r.vehicleId),
  }));

  const filtered = enriched.filter((r) => {
    const str = `${r.contractNum} ${r.client?.firstName} ${r.client?.lastName} ${r.vehicle?.plate}`.toLowerCase();
    return str.includes(search.toLowerCase()) && (filter === "ALL" || r.status === filter);
  }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const totalRevenue = rentals.reduce((s, r) => s + r.paidAmount, 0);
  const pending = rentals.reduce((s, r) => s + (r.totalAmount - r.paidAmount), 0);

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Locations</h1>
          <p className="text-slate-500 text-sm mt-0.5">{rentals.length} contrats · {totalRevenue.toLocaleString("fr-FR")} MAD encaissé</p>
        </div>
        <Link href="/locations/nouveau">
          <button className="flex items-center gap-2 px-4 py-2 bg-brand-green-600 hover:bg-brand-green-500 text-white text-sm font-semibold rounded-lg transition-colors">
            <Plus size={15} /> Nouvelle location
          </button>
        </Link>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {[
          { f: "ALL", l: "Toutes", v: rentals.length, c: "text-white" },
          { f: "ACTIVE", l: "En cours", v: rentals.filter(r => r.status === "ACTIVE").length, c: "text-blue-400" },
          { f: "COMPLETED", l: "Terminées", v: rentals.filter(r => r.status === "COMPLETED").length, c: "text-brand-green-400" },
          { f: null, l: "Solde en attente", v: `${pending.toLocaleString("fr-FR")} MAD`, c: pending > 0 ? "text-brand-orange-400" : "text-brand-green-400" },
        ].map((s) => (
          <button key={s.l} onClick={() => s.f && setFilter(s.f)}
            className={cn("rounded-xl border bg-[#161b22] p-4 text-left transition-all", filter === s.f ? "border-brand-green-500/40" : "border-[#21262d] hover:border-[#30363d]")}>
            <p className="text-xs text-slate-500">{s.l}</p>
            <p className={cn("text-xl font-bold mt-1", s.c)}>{s.v}</p>
          </button>
        ))}
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Contrat, client, plaque..."
            className="w-full pl-9 pr-4 py-2.5 bg-[#161b22] border border-[#30363d] rounded-lg text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-brand-green-500/50 transition-all" />
        </div>
        {["ALL", "ACTIVE", "COMPLETED", "CANCELLED"].map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={cn("px-3 py-2 rounded-lg text-xs font-semibold border transition-colors", filter === f ? "bg-brand-green-500/10 text-brand-green-400 border-brand-green-500/20" : "bg-[#161b22] text-slate-500 border-[#21262d] hover:text-slate-300")}>
            {f === "ALL" ? "Tous" : f === "ACTIVE" ? "En cours" : f === "COMPLETED" ? "Terminés" : "Annulés"}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {filtered.map((r) => (
          <button key={r.id} onClick={() => router.push(`/locations/${r.id}`)}
            className="w-full text-left rounded-xl border border-[#21262d] bg-[#161b22] p-4 hover:border-brand-green-500/25 hover:bg-[#1c2130] transition-all group">
            <div className="flex items-center gap-4">
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
                r.status === "ACTIVE" ? "bg-blue-500/15 border border-blue-500/20" : "bg-brand-green-500/15 border border-brand-green-500/20")}>
                {r.status === "ACTIVE" ? <Clock size={18} className="text-blue-400" /> : <CheckCircle size={18} className="text-brand-green-400" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-sm font-bold text-slate-200 font-mono">{r.contractNum}</span>
                  <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full border", r.status === "ACTIVE" ? "text-blue-400 bg-blue-500/10 border-blue-500/20" : "text-brand-green-400 bg-brand-green-500/10 border-brand-green-500/20")}>
                    {r.status === "ACTIVE" ? "En cours" : "Terminé"}
                  </span>
                  {r.paidAmount < r.totalAmount && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-orange-500/15 text-brand-orange-400 border border-brand-orange-500/20">
                      {(r.totalAmount - r.paidAmount).toLocaleString("fr-FR")} MAD dû
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <span className="flex items-center gap-1"><User size={10} />{r.client?.firstName} {r.client?.lastName}</span>
                  <span className="flex items-center gap-1"><Car size={10} />{r.vehicle?.brand} {r.vehicle?.model} · {r.vehicle?.plate}</span>
                  <span className="flex items-center gap-1"><Calendar size={10} />{r.startDate} → {r.endDate}</span>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-base font-bold text-white">{r.totalAmount.toLocaleString("fr-FR")} MAD</p>
                <p className="text-xs text-slate-500">{r.totalDays}j × {r.dailyRate} MAD</p>
              </div>
              <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-600 group-hover:text-brand-green-400 flex-shrink-0"><polyline points="9 18 15 12 9 6" /></svg>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
