/** Text that gets embedded for semantic search. Shared by seed script and onboarding. */
export function buildEmbeddingText(b: {
  name: string;
  description: string;
  category: string;
  subcategory?: string | null;
  neighborhood?: string | null;
  city: string;
  capabilities?: string[];
  price_range?: string | null;
  menu?: { name: string; category?: string }[];
}): string {
  return [
    `${b.name}. ${b.description}`,
    `Category: ${b.category}${b.subcategory ? ` / ${b.subcategory}` : ""}.`,
    `Location: ${b.neighborhood ? `${b.neighborhood}, ` : ""}${b.city}.`,
    b.capabilities?.length ? `Features: ${b.capabilities.join(", ").replaceAll("_", " ")}.` : "",
    b.price_range ? `Price: ${b.price_range}.` : "",
    b.menu?.length ? `Offers: ${b.menu.slice(0, 25).map((m) => m.name).join(", ")}.` : "",
  ].filter(Boolean).join("\n");
}
