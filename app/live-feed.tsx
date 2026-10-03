"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase";

type Query = {
  id: string;
  tool_name: string;
  query_params: Record<string, unknown> | null;
  results_count: number;
  response_time_ms: number | null;
  agent_identifier: string | null;
  success: boolean;
  created_at: string;
};

type Booking = {
  id: string;
  confirmation_code: string;
  action: string;
  date: string | null;
  time: string | null;
  party_size: number | null;
  customer_name: string | null;
  total_mxn: number | null;
  created_at: string;
  businesses?: { name: string } | null;
};

const TOOL_ACCENT: Record<string, string> = {
  search_businesses: "text-sky-600 bg-sky-50 border-sky-200",
  get_business: "text-violet-600 bg-violet-50 border-violet-200",
  get_menu: "text-amber-600 bg-amber-50 border-amber-200",
  check_availability: "text-teal-600 bg-teal-50 border-teal-200",
  contact_agent: "text-rose-600 bg-rose-50 border-rose-200",
  list_categories: "text-neutral-600 bg-neutral-50 border-neutral-200",
};

function summarize(p: Record<string, unknown> | null): string {
  if (!p) return "\u2014";
  if (typeof p.query === "string") return `\u201c${p.query}\u201d`;
  if (typeof p.message === "string") {
    const action = typeof p.action === "string" ? p.action.replace(/_/g, " ") : "";
    return `${action}: \u201c${p.message}\u201d`;
  }
  if (typeof p.business_id === "string") return p.business_id as string;
  return Object.entries(p)
    .filter(([, v]) => v != null)
    .map(([k, v]) => `${k}=${typeof v === "object" ? JSON.stringify(v) : v}`)
    .join(" \u00b7 ");
}

function timeAgo(iso: string): string {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  return `${Math.floor(s / 3600)}h ago`;
}

export function LiveFeed() {
  const [queries, setQueries] = useState<Query[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [live, setLive] = useState(false);

  useEffect(() => {
    const db = supabaseBrowser();

    db.from("agent_queries")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(30)
      .then(({ data }) => setQueries((data as Query[]) ?? []));

    db.from("reservations")
      .select("*, businesses(name)")
      .order("created_at", { ascending: false })
      .limit(10)
      .then(({ data }) => setBookings((data as Booking[]) ?? []));

    const channel = db
      .channel("agent-activity")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "agent_queries" },
        (payload) =>
          setQueries((q) => [payload.new as Query, ...q].slice(0, 30)),
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "reservations" },
        async (payload) => {
          const row = payload.new as Booking;
          const { data } = await db
            .from("businesses")
            .select("name")
            .eq(
              "id",
              (payload.new as { business_id: string }).business_id,
            )
            .single();
          setBookings((b) => [{ ...row, businesses: data }, ...b].slice(0, 10));
        },
      )
      .subscribe((status) => setLive(status === "SUBSCRIBED"));

    return () => {
      db.removeChannel(channel);
    };
  }, []);

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      {/* Traffic log */}
      <section className="lg:col-span-2" aria-label="Agent traffic log">
        <header className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold tracking-tight text-neutral-900">
            Live Agent Traffic
          </h2>
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium ${
              live
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-neutral-200 bg-neutral-50 text-neutral-400"
            }`}
            role="status"
            aria-live="polite"
          >
            <span
              className={`inline-block size-1.5 rounded-full ${
                live ? "bg-emerald-500" : "bg-neutral-300"
              }`}
              aria-hidden="true"
            />
            {live ? "Connected" : "Connecting\u2026"}
          </span>
        </header>

        <div className="overflow-hidden rounded-xl border border-neutral-200">
          {/* Table header */}
          <div className="grid grid-cols-[140px_1fr_100px_60px] gap-2 border-b border-neutral-200 bg-neutral-50 px-4 py-2 text-[11px] font-medium uppercase tracking-wider text-neutral-400">
            <span>Tool</span>
            <span>Query</span>
            <span className="text-right">Agent</span>
            <span className="text-right">Time</span>
          </div>

          {queries.length === 0 && (
            <p className="px-4 py-12 text-center text-sm text-neutral-400">
              Waiting for the first agent call\u2026
            </p>
          )}

          <ul className="divide-y divide-neutral-100 bg-white">
            {queries.map((q) => (
              <li
                key={q.id}
                className="grid grid-cols-[140px_1fr_100px_60px] items-center gap-2 px-4 py-2.5 text-[13px]"
              >
                <span
                  className={`inline-block w-fit truncate rounded border px-2 py-0.5 font-mono text-[11px] font-medium ${
                    TOOL_ACCENT[q.tool_name] ?? "text-neutral-600 bg-neutral-50 border-neutral-200"
                  }`}
                >
                  {q.tool_name}
                </span>
                <span className="truncate text-neutral-600" title={summarize(q.query_params)}>
                  {summarize(q.query_params)}
                </span>
                <span className="truncate text-right text-[11px] text-neutral-400">
                  {q.agent_identifier ?? "\u2014"}
                </span>
                <span className="tabular text-right text-[11px] text-neutral-400">
                  {q.response_time_ms != null ? `${q.response_time_ms}ms` : "\u2014"}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Bookings */}
      <section aria-label="Agent bookings">
        <h2 className="mb-4 text-xl font-semibold tracking-tight text-neutral-900">
          Bookings
        </h2>

        <div className="space-y-3">
          {bookings.length === 0 && (
            <p className="rounded-xl border border-neutral-200 bg-white px-4 py-12 text-center text-sm text-neutral-400">
              No bookings yet
            </p>
          )}

          {bookings.map((b) => (
            <article
              key={b.id}
              className="rounded-xl border border-neutral-200 bg-white p-4"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-[15px] font-semibold text-neutral-900">
                    {b.businesses?.name ?? "\u2014"}
                  </p>
                  <p className="mt-0.5 text-[13px] text-neutral-500">
                    {b.action.replace(/_/g, " ")}
                    {b.customer_name ? ` \u00b7 ${b.customer_name}` : ""}
                  </p>
                </div>
                <code className="shrink-0 rounded border border-emerald-200 bg-emerald-50 px-2 py-0.5 font-mono text-[11px] font-semibold text-emerald-700">
                  {b.confirmation_code}
                </code>
              </div>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-neutral-400 tabular">
                {b.date && <span>{b.date}</span>}
                {b.time && <span>{b.time}</span>}
                {b.party_size != null && <span>{b.party_size} guests</span>}
                {b.total_mxn != null && (
                  <span>
                    {new Intl.NumberFormat("es-MX", {
                      style: "currency",
                      currency: "MXN",
                    }).format(Number(b.total_mxn))}
                  </span>
                )}
                <span>{timeAgo(b.created_at)}</span>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
