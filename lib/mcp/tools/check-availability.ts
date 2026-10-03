import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/server";
import { supabaseAdmin } from "@/lib/supabase";
import { computeAvailability } from "@/lib/availability";
import { nowIn } from "@/lib/hours";
import { idOrSlug, fail, logged, ok } from "@/lib/mcp/util";

const inputSchema = z.object({
  business_id: z.string().min(1).describe("Business id (uuid) or slug."),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().describe("YYYY-MM-DD local date. Defaults to today (America/Monterrey)."),
  time: z.string().regex(/^\d{2}:\d{2}$/).describe("HH:MM 24h local time, e.g. 20:00."),
  party_size: z.number().int().min(1).max(50).optional().describe("Number of people. Default 1."),
});

export function registerCheckAvailability(server: McpServer) {
  server.registerTool(
    "check_availability",
    {
      title: "Check availability",
      description:
        "Check whether a business is open and has capacity at a date/time for a party size. " +
        "Uses opening hours plus live bookings. Statuses: available, limited, likely_available (no live data), full, closed, too_large, in_the_past.",
      inputSchema,
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    logged("check_availability", async (args: z.infer<typeof inputSchema>) => {
      const { data: b } = await supabaseAdmin().from("businesses").select("id, name, hours, timezone, has_agent, capacity, max_party_size, phone")
        .eq(...idOrSlug(args.business_id))
        .maybeSingle();
      if (!b) return { result: fail(`No business found for "${args.business_id}".`), count: 0 };

      const date = args.date ?? nowIn(b.timezone).date;
      const availability = await computeAvailability(b, date, args.time, args.party_size ?? 1);
      return {
        result: ok({
          business_id: b.id,
          business_name: b.name,
          party_size: args.party_size ?? 1,
          ...availability,
          can_book_via_agent: b.has_agent,
          phone: b.phone,
        }),
        count: 1,
      };
    }),
  );
}
