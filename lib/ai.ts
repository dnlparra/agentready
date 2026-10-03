// All model calls go through Vercel AI Gateway: plain "provider/model" strings.
// Auth: AI_GATEWAY_API_KEY locally; on Vercel, OIDC is used automatically.
export const EMBEDDING_MODEL = "openai/text-embedding-3-small"; // 1536 dims = vector(1536)
export const AGENT_MODEL = "anthropic/claude-sonnet-5.5"; // business agents (contact_agent)
export const EXTRACTION_MODEL = "anthropic/claude-sonnet-5.5"; // onboarding text → profile
export const VISION_MODEL = "google/gemini-3.8-flash"; // onboarding menu photo → items
