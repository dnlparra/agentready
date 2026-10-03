import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  const db = supabaseAdmin();
  const [biz, queries, bookings] = await Promise.all([
    db.from("businesses").select("id", { count: "exact", head: true }),
    db.from("agent_queries").select("id", { count: "exact", head: true }),
    db.from("reservations").select("id", { count: "exact", head: true }),
  ]);
  const error = biz.error ?? queries.error ?? bookings.error;
  return Response.json(
    { ok: !error, businesses: biz.count, agent_queries: queries.count, reservations: bookings.count, error: error?.message },
    { status: error ? 500 : 200 },
  );
}
