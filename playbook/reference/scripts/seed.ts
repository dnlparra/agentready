// Run: npm run seed   (reads .env.local; idempotent — upserts by slug, replaces menus)
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
import { embedMany } from "ai";
import { buildEmbeddingText } from "../lib/embedding-text";
import { EMBEDDING_MODEL } from "../lib/ai";

type SeedMenuItem = {
  category: string; name: string; description?: string; price?: number; dietary?: string[];
  duration_minutes?: number; requires_appointment?: boolean; popular?: boolean;
};
type SeedBusiness = Record<string, unknown> & {
  slug: string; name: string; description: string; category: string; subcategory?: string;
  neighborhood?: string; city: string; capabilities: string[]; price_range?: string; menu: SeedMenuItem[];
};

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Missing Supabase env vars (.env.local)");
  if (!process.env.AI_GATEWAY_API_KEY) throw new Error("Missing AI_GATEWAY_API_KEY (.env.local)");
  const db = createClient(url, key, { auth: { persistSession: false } });

  const { businesses } = JSON.parse(readFileSync("data/seed-data.json", "utf8")) as { businesses: SeedBusiness[] };
  console.log(`Embedding ${businesses.length} businesses with ${EMBEDDING_MODEL}...`);
  const { embeddings } = await embedMany({
    model: EMBEDDING_MODEL,
    values: businesses.map((b) => buildEmbeddingText(b)),
  });

  for (const [i, b] of businesses.entries()) {
    const { menu, ...profile } = b;
    const { data, error } = await db
      .from("businesses")
      .upsert({ ...profile, embedding: embeddings[i] }, { onConflict: "slug" })
      .select("id")
      .single();
    if (error || !data) throw new Error(`${b.slug}: ${error?.message}`);

    await db.from("menu_items").delete().eq("business_id", data.id);
    const { error: menuError } = await db.from("menu_items").insert(
      menu.map((m, sort_order) => ({ ...m, business_id: data.id, sort_order })),
    );
    if (menuError) throw new Error(`${b.slug} menu: ${menuError.message}`);
    console.log(`✓ ${b.name} (${menu.length} items)`);
  }

  const { data: check, error } = await db.rpc("business_vocabulary");
  if (error) throw error;
  console.log("Done:", JSON.stringify(check));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
