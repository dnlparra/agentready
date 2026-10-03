import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/server";
import { supabaseAdmin } from "@/lib/supabase";
import { idOrSlug, fail, logged, ok } from "@/lib/mcp/util";

const inputSchema = z.object({
  business_id: z.string().min(1).describe("Business id (uuid) or slug."),
  category: z.string().optional().describe('Menu section filter, e.g. "Pasta", "Tacos", "Consultas".'),
  dietary: z.array(z.enum(["vegetarian", "vegan", "gluten_free"])).optional().describe("Items must match ALL of these."),
  max_price: z.number().nonnegative().optional().describe("Max price in MXN."),
  search: z.string().optional().describe("Substring match on item name/description."),
});

type Item = {
  category: string; name: string; description: string | null; price: number | null; currency: string;
  dietary: string[]; duration_minutes: number | null; requires_appointment: boolean; popular: boolean;
};

export function registerGetMenu(server: McpServer) {
  server.registerTool(
    "get_menu",
    {
      title: "Get menu, services and prices",
      description:
        "Menu items, services or products of a business with prices in MXN, grouped by section. Filter by section, dietary needs (vegetarian/vegan/gluten_free), max price or text.",
      inputSchema,
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    logged("get_menu", async (args: z.infer<typeof inputSchema>) => {
      const db = supabaseAdmin();
      const { data: b } = await db.from("businesses").select("id, name, currency").eq(...idOrSlug(args.business_id)).maybeSingle();
      if (!b) return { result: fail(`No business found for "${args.business_id}".`), count: 0 };

      let q = db
        .from("menu_items")
        .select("category, name, description, price, currency, dietary, duration_minutes, requires_appointment, popular")
        .eq("business_id", b.id)
        .eq("available", true)
        .order("sort_order");
      if (args.category) q = q.ilike("category", `%${args.category}%`);
      if (args.dietary?.length) q = q.contains("dietary", args.dietary);
      if (args.max_price != null) q = q.lte("price", args.max_price);
      if (args.search) q = q.or(`name.ilike.%${args.search}%,description.ilike.%${args.search}%`);

      const { data, error } = await q;
      if (error) return { result: fail(error.message), count: 0 };
      const items = (data ?? []) as Item[];

      const sections: Record<string, Omit<Item, "category">[]> = {};
      for (const { category, ...rest } of items) (sections[category] ??= []).push(rest);

      return {
        result: ok({
          business_id: b.id,
          business_name: b.name,
          currency: b.currency,
          filters: { category: args.category, dietary: args.dietary, max_price: args.max_price, search: args.search },
          item_count: items.length,
          sections,
        }),
        count: items.length,
      };
    }),
  );
}
