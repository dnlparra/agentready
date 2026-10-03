"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase";

type Query = {
  id: string; tool_name: string; query_params: Record<string, unknown> | null; results_count: number;
  response_time_ms: number | null; agent_identifier: string | null; success: boolean; created_at: string;
};
type Booking = {
  id: string; confirmation_code: string; action: string; date: string | null; time: string | null;
  party_size: number | null; total_mxn: number | null; created_at: string; businesses?: { name: string } | null;
};

const TOOL_COLORS: Record<string, string> = {
  search_businesses: "bg-sky-100 text-sky-800",
  get_business: "bg-violet-100 text-violet-800",
  get_menu: "bg-amber-100 text-amber-800",
  check_availability: "bg-teal-100 text-teal-800",
  contact_agent: "bg-rose-100 text-rose-800",
  list_categories: "bg-zinc-100 text-zinc-700",
};

function summarize(p: Record<string, unknown> | null) {
  if (!p) return "";
  if (typeof p.query === "string") return `"${p.query}"`;
  if (typeof p.message === "string") return `${p.action}: "${p.message}"`;
  return Object.entries(p).map(([k, v]) => `${k}=${typeof v === "object" ? JSON.stringify(v) : v}`).join(" · ");
}

export function LiveFeed() {
  const [queries, setQueries] = useState<Query[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [live, setLive] = useState(false);

  useEffect(() => {
    const db = supabaseBrowser();
    db.from("agent_queries").select("*").order("created_at", { ascending: false }).limit(30)
      .then(({ data }) => setQueries((data as Query[]) ?? []));
    db.from("reservations").select("*, businesses(name)").order("created_at", { ascending: false }).limit(10)
      .then(({ data }) => setBookings((data as Booking[]) ?? []));

    const channel = db
      .channel("agent-activity")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "agent_queries" }, (payload) =>
        setQueries((q) => [payload.new as Query, ...q].slice(0, 30)))
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "reservations" }, async (payload) => {
        const row = payload.new as Booking;
        const { data } = await db.from("businesses").select("name").eq("id", (payload.new as { business_id: string }).business_id).single();
        setBookings((b) => [{ ...row, businesses: data }, ...b].slice(0, 10));
      })
      .subscribe((status) => setLive(status === "SUBSCRIBED"));
    return () => { db.removeChannel(channel); };
  }, []);

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <section className="lg:col-span-2 rounded-xl border border-zinc-200 bg-white p-4">
        <header className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold">Live agent traffic</h2>
          <span className={`text-xs ${live ? "text-emerald-600" : "text-zinc-400"}`}>{live ? "● Realtime connected" : "○ connecting…"}</span>
        </header>
        <ul className="divide-y divide-zinc-100 text-sm">
          {queries.length === 0 && <li className="py-6 text-center text-zinc-400">Waiting for the first agent call…</li>}
          {queries.map((q) => (
            <li key={q.id} className="flex items-start gap-3 py-2">
              <span className={`shrink-0 rounded px-2 py-0.5 font-mono text-xs ${TOOL_COLORS[q.tool_name] ?? "bg-zinc-100"}`}>{q.tool_name}</span>
              <span className="flex-1 truncate text-zinc-700">{summarize(q.query_params)}</span>
              <span className="shrink-0 text-xs text-zinc-400">
                {q.success ? `${q.results_count} res` : "error"} · {q.response_time_ms ?? "–"}ms · {q.agent_identifier ?? "?"}
              </span>
            </li>
          ))}
        </ul>
      </section>
      <section className="rounded-xl border border-zinc-200 bg-white p-4">
        <h2 className="mb-3 font-semibold">Bookings made by agents</h2>
        <ul className="space-y-2 text-sm">
          {bookings.length === 0 && <li className="py-6 text-center text-zinc-400">No bookings yet</li>}
          {bookings.map((b) => (
            <li key={b.id} className="rounded-lg bg-emerald-50 p-3">
              <div className="font-mono text-xs text-emerald-700">{b.confirmation_code}</div>
              <div className="font-medium">{b.businesses?.name ?? "—"}</div>
              <div className="text-zinc-600">
                {b.action.replace("_", " ")} {b.date ?? ""} {b.time ?? ""} {b.party_size ? `· ${b.party_size} ppl` : ""} {b.total_mxn ? `· $${b.total_mxn} MXN` : ""}
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
