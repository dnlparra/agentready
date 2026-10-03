import { z } from "zod";
import { embed, generateText, Output } from "ai";
import { supabaseAdmin } from "@/lib/supabase";
import { EMBEDDING_MODEL, EXTRACTION_MODEL, VISION_MODEL } from "@/lib/ai";
import { buildEmbeddingText } from "@/lib/embedding-text";
import { DAYS } from "@/lib/hours";

const menuItemSchema = z.object({
  category: z.string().describe("Menu section, e.g. Tacos, Pasta, Servicios"),
  name: z.string(),
  description: z.string().nullable(),
  price: z.number().nullable().describe("MXN"),
  dietary: z.array(z.enum(["vegetarian", "vegan", "gluten_free"])),
  duration_minutes: z.number().nullable(),
  requires_appointment: z.boolean(),
  popular: z.boolean(),
});

export const profileSchema = z.object({
  name: z.string(),
  description: z.string().describe("2-3 sentence English description optimized for search: what, for whom, what makes it special."),
  category: z.enum(["restaurant", "cafe", "dental_clinic", "beauty_salon", "repair_shop", "hotel", "veterinary", "gym", "laundry", "accounting", "medical_specialist", "coworking", "other"]),
  subcategory: z.string().nullable(),
  address: z.string(),
  neighborhood: z.string().nullable(),
  city: z.string(),
  state: z.string().nullable(),
  lat: z.number().nullable().describe("Only if explicitly given or you are confident; else null."),
  lng: z.number().nullable(),
  phone: z.string().nullable(),
  whatsapp: z.string().nullable(),
  email: z.string().nullable(),
  website: z.string().nullable(),
  instagram: z.string().nullable(),
  hours: z.array(z.object({ day: z.enum(DAYS), open: z.string().describe("HH:MM"), close: z.string().describe("HH:MM") })).describe("One entry per open day. Omit closed days."),
  capabilities: z.array(z.string()).describe("snake_case tags: delivery, takeout, dine_in, reservation, appointment, wifi, parking, vegetarian_options, home_service, accepts_cards, ..."),
  price_range: z.enum(["$", "$$", "$$$", "$$$$"]).nullable(),
  payment_methods: z.array(z.string()),
  policies: z.array(z.object({ key: z.string(), value: z.string() })),
  faq: z.array(z.object({ q: z.string(), a: z.string() })),
  menu: z.array(menuItemSchema),
});

export type ExtractedProfile = z.infer<typeof profileSchema>;

const MONTERREY_CENTER = { lat: 25.6714, lng: -100.309 };

function slugify(s: string) {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 50);
}

/** Free text (+ optional menu photo) → structured profile → Supabase (+ embedding). */
export async function onboardBusiness(input: { document: string; imageBase64?: string; imageMediaType?: string; hasAgent?: boolean }) {
  const { output: profile } = await generateText({
    model: EXTRACTION_MODEL,
    output: Output.object({ schema: profileSchema }),
    system: "You convert a small business's free-form self-description (Spanish or English) into a structured, machine-readable profile for AI agents. Never invent facts: use null/empty arrays when unknown. Prices in MXN.",
    prompt: input.document,
  });

  let menu = profile.menu;
  let menuSource = "text";
  if (input.imageBase64) {
    // Multimodal: menu/price-list photo → items (Gemini via AI Gateway)
    const { output } = await generateText({
      model: VISION_MODEL,
      output: Output.object({ schema: z.object({ items: z.array(menuItemSchema) }) }),
      messages: [{
        role: "user",
        content: [
          { type: "text", text: `Extract every item and price from this menu/price list of "${profile.name}". Prices in MXN. Group into sections.` },
          { type: "image", image: input.imageBase64, mediaType: input.imageMediaType ?? "image/jpeg" },
        ],
      }],
    });
    if (output.items.length) { menu = output.items; menuSource = "image"; }
  }

  const location_approximate = profile.lat == null || profile.lng == null;
  const row = {
    slug: `${slugify(profile.name)}-${Math.random().toString(36).slice(2, 6)}`,
    name: profile.name,
    description: profile.description,
    category: profile.category,
    subcategory: profile.subcategory,
    address: profile.address,
    neighborhood: profile.neighborhood,
    city: profile.city,
    state: profile.state,
    lat: profile.lat ?? MONTERREY_CENTER.lat,
    lng: profile.lng ?? MONTERREY_CENTER.lng,
    phone: profile.phone,
    whatsapp: profile.whatsapp,
    email: profile.email,
    website: profile.website,
    instagram: profile.instagram,
    hours: Object.fromEntries(DAYS.map((d) => {
      const h = profile.hours.find((x) => x.day === d);
      return [d, h ? { open: h.open, close: h.close } : null];
    })),
    capabilities: profile.capabilities,
    price_range: profile.price_range,
    payment_methods: profile.payment_methods,
    policies: Object.fromEntries(profile.policies.map((p) => [p.key, p.value])),
    faq: profile.faq,
    has_agent: input.hasAgent ?? true,
    agent_capabilities: ["answer_questions", ...(profile.capabilities.includes("reservation") ? ["make_reservation"] : []), ...(profile.capabilities.includes("appointment") ? ["book_appointment"] : [])],
    capacity: 20,
    max_party_size: 8,
    source: "onboarding",
  };

  let embedding: number[] | null = null;
  try {
    ({ embedding } = await embed({ model: EMBEDDING_MODEL, value: buildEmbeddingText({ ...row, menu }) }));
  } catch (e) {
    console.error("[onboard] embedding failed; business still searchable by keyword", e);
  }

  const db = supabaseAdmin();
  const { data, error } = await db.from("businesses").insert({ ...row, embedding }).select("id, slug").single();
  if (error || !data) throw new Error(`Insert failed: ${error?.message}`);

  if (menu.length) {
    const { error: menuError } = await db.from("menu_items").insert(menu.map((m, i) => ({ ...m, business_id: data.id, sort_order: i })));
    if (menuError) console.error("[onboard] menu insert failed", menuError);
  }

  return {
    business_id: data.id,
    slug: data.slug,
    profile: { ...row, menu },
    menu_items_created: menu.length,
    menu_source: menuSource,
    embedding_generated: embedding != null,
    location_approximate,
  };
}
