import { z } from "zod";
import { embed } from "ai";
import type { McpServer } from "@modelcontextprotocol/server";
import { supabaseAdmin } from "@/lib/supabase";
import { EMBEDDING_MODEL } from "@/lib/ai";
import { hoursLabel, isOpenNow, nowIn, type WeeklyHours } from "@/lib/hours";
import { fail, logged, ok } from "@/lib/mcp/util";

const inputSchema = z.object({
  query: z.string().min(1).describe('What the user needs, in natural language (any language). E.g. "romantic italian dinner", "dentist that speaks english", "quiet cafe to work".'),
  city: z.string().optional().describe('City or neighborhood filter, e.g. "Monterrey", "San Pedro", "Barrio Antiguo".'),
  category: z.string().optional().describe("Category filter: restaurant, cafe, dental_clinic, beauty_salon, repair_shop, hotel, veterinary, gym, laundry, accounting, medical_specialist, coworking. Call list_categories for the live list."),
  capabilities: z.array(z.string()).optional().describe("Business must have ALL of these, e.g. [\"delivery\"], [\"reservation\",\"vegetarian_options\"], [\"open_24h\"]."),
  open_now: z.boolean().optional().describe("Only return businesses open right now (local Monterrey time)."),
  lat: z.number().min(-90).max(90).optional().describe("User latitude, enables distance ranking."),
  lng: z.number().min(-180).max(180).optional().describe("User longitude, enables distance ranking."),
  radius_km: z.number().positive().max(100).optional().describe("Search radius when lat/lng are given. Default 10."),
  price_range: z.enum(["$", "$$", "$$$", "$$$$"]).optional(),
  limit: z.number().int().min(1).max(20).optional().describe("Max results, default 5."),
});

type Row = {
  id: string; slug: string; name: string; category: string; subcategory: string | null;
  description: string; address: string; neighborhood: string | null; city: string;
  price_range: string | null; rating: number | null; capabilities: string[];
  has_agent: boolean; agent_capabilities: string[]; hours: WeeklyHours; phone: string | null;
  similarity: number | null; distance_km: number | null; score: number;
};

export function registerSearchBusinesses(server: McpServer) {
  server.registerTool(
    "search_businesses",
    {
      title: "Search local businesses",
      description:
        "Find local businesses (restaurants, clinics, salons, hotels, services) in Mexico that match a need. " +
        "Hybrid semantic + keyword + geo search. Returns ranked summaries with ids; then call get_business, get_menu, check_availability or contact_agent with the id.",
      inputSchema,
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    logged("search_businesses", async (args: z.infer<typeof inputSchema>) => {
      const limit = args.limit ?? 5;
      if ((args.lat == null) !== (args.lng == null)) {
        return { result: fail("Provide both lat and lng, or neither."), count: 0 };
      }

      let embedding: number[] | null = null;
      try {
        ({ embedding } = await embed({ model: EMBEDDING_MODEL, value: args.query }));
      } catch (e) {
        console.error("[search] embedding failed, falling back to keyword search", e);
      }

      const { data, error } = await supabaseAdmin().rpc("search_businesses", {
        query_embedding: embedding,
        query_text: args.query,
        p_city: args.city ?? null,
        p_category: args.category ?? null,
        p_capabilities: args.capabilities?.length ? args.capabilities : null,
        p_price_range: args.price_range ?? null,
        p_lat: args.lat ?? null,
        p_lng: args.lng ?? null,
        p_radius_km: args.radius_km ?? 10,
        p_limit: args.open_now ? 50 : limit,
      });
      if (error) return { result: fail(`Search failed: ${error.message}`), count: 0 };

      const now = nowIn();
      let rows = (data ?? []) as Row[];
      if (args.open_now) rows = rows.filter((r) => isOpenNow(r.hours));
      rows = rows.slice(0, limit);

      const results = rows.map((r) => ({
        id: r.id,
        slug: r.slug,
        name: r.name,
        category: r.subcategory ? `${r.category} / ${r.subcategory}` : r.category,
        description: r.description,
        address: r.address,
        neighborhood: r.neighborhood,
        price_range: r.price_range,
        rating: r.rating,
        open_now: isOpenNow(r.hours),
        today_hours: hoursLabel(r.hours[now.day]),
        distance_km: r.distance_km != null ? Math.round(r.distance_km * 10) / 10 : undefined,
        capabilities: r.capabilities,
        has_agent: r.has_agent,
        agent_actions: r.has_agent ? r.agent_capabilities : [],
        relevance: Math.round(r.score * 100) / 100,
      }));

      return {
        result: ok({
          query: args.query,
          search_mode: embedding ? "hybrid_semantic" : "keyword_fallback",
          local_time: `${now.date} ${now.time} (America/Monterrey)`,
          count: results.length,
          results,
          next_steps:
            results.length === 0
              ? "No matches. Retry with fewer filters, a broader query, or call list_categories."
              : "Use get_menu(business_id) for prices, check_availability before booking, and contact_agent when has_agent=true.",
        }),
        count: results.length,
      };
    }),
  );
}
