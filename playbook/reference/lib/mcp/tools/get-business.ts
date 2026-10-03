import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/server";
import { supabaseAdmin } from "@/lib/supabase";
import { hoursLabel, isOpenNow, DAYS, type WeeklyHours } from "@/lib/hours";
import { idOrSlug, fail, logged, ok } from "@/lib/mcp/util";

const inputSchema = z.object({
  business_id: z.string().min(1).describe("Business id (uuid) or slug from search_businesses."),
});

export function registerGetBusiness(server: McpServer) {
  server.registerTool(
    "get_business",
    {
      title: "Get business profile",
      description:
        "Full profile of one business: address, coordinates, contact, weekly hours, open-now status, capabilities, policies, FAQ, payment methods and what its AI agent can do.",
      inputSchema,
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    logged("get_business", async ({ business_id }: z.infer<typeof inputSchema>) => {
      const { data: b, error } = await supabaseAdmin()
          .from("businesses")
          .select("id, slug, name, description, category, subcategory, address, neighborhood, city, state, country, lat, lng, timezone, phone, whatsapp, email, website, instagram, hours, capabilities, price_range, currency, has_agent, agent_capabilities, max_party_size, policies, faq, payment_methods, rating, verified")
        .eq(...idOrSlug(business_id))
        .maybeSingle();
      if (error) return { result: fail(error.message), count: 0 };
      if (!b) return { result: fail(`No business found for "${business_id}". Use search_businesses to get a valid id.`), count: 0 };

      const { count: menuCount } = await supabaseAdmin()
        .from("menu_items").select("id", { count: "exact", head: true }).eq("business_id", b.id);

      const hours = b.hours as WeeklyHours;
      return {
        result: ok({
          ...b,
          hours: Object.fromEntries(DAYS.map((d) => [d, hoursLabel(hours[d])])),
          open_now: isOpenNow(hours, b.timezone),
          menu_items: menuCount ?? 0,
          how_to_act: b.has_agent
            ? `This business has an AI agent. Use contact_agent with action one of: ${b.agent_capabilities.join(", ")}.`
            : `No AI agent. Share phone ${b.phone ?? "n/a"}${b.whatsapp ? ` or WhatsApp ${b.whatsapp}` : ""} with the user.`,
        }),
        count: 1,
      };
    }),
  );
}
