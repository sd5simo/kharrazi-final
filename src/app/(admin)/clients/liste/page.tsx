"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/store/useStore";
import { Search, Plus, ShieldBan, Phone, Mail, MapPin } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const fmt = (n: number) => n.toLocaleString("fr-MA");

function Chevron() {
  return <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>;
}

export default function ClientsListePage() {
  const router = useRouter();
  const { clients, getRentalsByClient, getClientTotalSpent } = useStore();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"ALL" | "ACTIVE" | "BLACKLIST">("ALL");
  const [sort, setSort] = useState<"recent" | "spent" | "rentals" | "name">("recent");

  const enriched = clients.map((c) => ({
    ...c,
    totalSpent: getClientTotalSpent(c.id),
    rentalCount: getRentalsByClient(c.id).length,
    isActive: getRentalsByClient(c.id).some((r) => r.status === "ACTIVE"),
  }));

  const filtered = enriched
    .filter((c) => {
      const q = search.toLowerCase();
      const match = `${c.firstName} ${c.lastName} ${c.cin} ${c.phone} ${c.email ?? ""} ${c.city ?? ""}`.toLowerCase().includes(q);
      const flt = filter === "ALL" || (filter === "ACTIVE" && !c.isBlacklist) || (filter === "BLACKLIST" && c.isBlacklist);
      return match && flt;
    })
    .sort((a, b) => {
      if (sort === "spent") return b.totalSpent - a.totalSpent;
      if (sort === "rentals") return b.rentalCount - a.rentalCount;
      if (sort === "name") return a.lastName.localeCompare(b.lastName);
      return b.createdAt.localeCompare(a.createdAt);
    });

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Clients</h1>
          <p className="text-slate-500 text-sm mt-0.5">{clients.length} clients · {fmt(enriched.reduce((s, c) => s + c.totalSpent, 0))} MAD total encaissé</p>
        </div>
        <Link href="/clients/nouveau">
          <button className="flex items-center gap-2 px-4 py-2 bg-brand-green-600 hover:bg-brand-green-500 text-white text-sm font-semibold rounded-lg transition-colors">
            <Plus size={15} /> Nouveau client
          </button>
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {([["ALL", "Total", clients.length, "text-white"], ["ACTIVE", "Actifs", enriched.filter(c => !c.isBlacklist).length, "text-brand-green-400"], ["BLACKLIST", "Liste noire", enriched.filter(c => c.isBlacklist).length, "text-red-400"]] as const).map(([f, l, v, col]) => (
          <button key={f} onClick={() => setFilter(f)}
            className={cn("rounded-xl border bg-[#161b22] p-4 text-left transition-all", filter === f ? "border-brand-green-500/40 bg-brand-green-500/5" : "border-[#21262d] hover:border-[#30363d]")}>
            <p className="text-xs text-slate-500">{l}</p>
            <p className={cn("text-2xl font-bold mt-1", col)}>{v}</p>
          </button>
        ))}
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Nom, CIN, téléphone, ville..."
            className="w-full pl-9 pr-4 py-2.5 bg-[#161b22] border border-[#30363d] rounded-lg text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-brand-green-500/50 transition-all" />
        </div>
        <select value={sort} onChange={(e) => setSort(e.target.value as any)}
          className="px-3 py-2.5 bg-[#161b22] border border-[#30363d] rounded-lg text-sm text-slate-300 focus:outline-none">
          <option value="recent">Récents</option>
          <option value="spent">+ Dépensé</option>
          <option value="rentals">+ Locations</option>
          <option value="name">A → Z</option>
        </select>
      </div>

      <div className="space-y-2">
        {filtered.map((c) => (
          <button key={c.id} onClick={() => router.push(`/clients/${c.id}`)}
            className="w-full text-left rounded-xl border border-[#21262d] bg-[#161b22] p-4 hover:border-brand-green-500/30 hover:bg-[#1c2130] transition-all group">
            <div className="flex items-center gap-4">
              <div className={cn("w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold text-white",
                c.isBlacklist ? "bg-red-700/60 border border-red-500/40" : c.isActive ? "bg-blue-700/60 border border-blue-500/30" : "bg-gradient-to-br from-brand-green-700 to-brand-green-900")}>
                {c.firstName[0]}{c.lastName[0]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-bold text-slate-100">{c.firstName} {c.lastName}</p>
                  <span className="text-[11px] font-mono text-slate-500 bg-[#0d1117] px-1.5 py-0.5 rounded">{c.cin}</span>
                  {c.isBlacklist && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/15 text-red-400 border border-red-500/20 flex items-center gap-1"><ShieldBan size={9} />Blacklisté</span>}
                  {c.isActive && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/20">En location</span>}
                </div>
                <div className="flex items-center gap-4 text-xs text-slate-500">
                  <span className="flex items-center gap-1"><Phone size={11} />{c.phone}</span>
                  {c.email && <span className="flex items-center gap-1 truncate max-w-48"><Mail size={11} />{c.email}</span>}
                  {c.city && <span className="flex items-center gap-1"><MapPin size={11} />{c.city}</span>}
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-bold text-brand-green-400">{fmt(c.totalSpent)} MAD</p>
                <p className="text-xs text-slate-500">{c.rentalCount} location{c.rentalCount !== 1 ? "s" : ""}</p>
              </div>
              <span className="text-slate-600 group-hover:text-brand-green-400 transition-colors"><Chevron /></span>
            </div>
          </button>
        ))}
        {filtered.length === 0 && <div className="text-center py-16 text-slate-600"><Search size={28} className="mx-auto mb-2 opacity-30" /><p>Aucun résultat</p></div>}
      </div>
    </div>
  );
}
