# Follow-Up: What AgentReady Needs for Production

This document describes everything that would need to be added, fixed, or improved for AgentReady to function as a production-grade service.

---

## Priority 1 — Security and Stability

These items represent real vulnerabilities or failure modes.

### 1.1 Protect the onboarding endpoint

`ONBOARD_API_KEY` is currently empty. Anyone can POST to `/api/onboard` and insert businesses. Set a key in Vercel env vars and require it on every request.

### 1.2 Rate limiting

No rate limiting exists on any endpoint. An agent calling `search_businesses` in a loop would consume AI Gateway credits (embedding calls) and hit Supabase connection limits.

Options:
- Vercel Edge Middleware with `@vercel/kv` token bucket
- Upstash Ratelimit (`@upstash/ratelimit`)
- Per-IP and per-agent limits (use `x-agent-name` header)

### 1.3 Input sanitization

The onboarding endpoint passes raw user text directly to AI models. A malicious input could:
- Inject prompt instructions that cause the model to output harmful structured data
- Insert XSS payloads into the business description (rendered on the dashboard)
- Create businesses with misleading names or categories

Mitigations: validate AI output against the Zod schema (already done), sanitize HTML from all string fields before insert, limit description length server-side.

### 1.4 Error monitoring

Add Sentry or Vercel's built-in error tracking. Current error handling is `console.error` only — errors in production are invisible.

### 1.5 CORS configuration

The MCP endpoint is currently open to all origins. For production, restrict CORS to known agent clients or implement proper MCP authentication.

---

## Priority 2 — Data Quality

### 2.1 Business deduplication

Submitting the same business text twice creates two entries. Implement:
- Slug collision detection (currently adds a random suffix)
- Embedding similarity check before insert: if cosine similarity > 0.95, reject as duplicate
- Phone/WhatsApp uniqueness constraint

### 2.2 Business editing and deletion

No way to update or delete a business after onboarding. Need:
- `PATCH /api/businesses/:id` for updates
- `DELETE /api/businesses/:id` for removal
- Re-embed on description change

### 2.3 Clean up test data

Multiple "Tortas La Abuela" entries exist from testing. Before the demo:
```sql
DELETE FROM menu_items WHERE business_id IN (
  SELECT id FROM businesses WHERE source = 'onboarding'
);
DELETE FROM businesses WHERE source = 'onboarding';
```

### 2.4 Richer seed data

Current seed data has 15 businesses. For a convincing demo:
- Add 10–15 more across different categories
- Include businesses with photos/logos
- Add realistic FAQ and policies data
- Vary price ranges and capabilities more

---

## Priority 3 — Feature Completeness

### 3.1 Business detail pages

`/business/[slug]` — public page showing the full profile, menu, hours, map. Currently agents get this data via `get_business` but there's no human-readable page.

### 3.2 Directory browsing

`/directory` — public page listing all businesses with category filters, search bar, and map view. For humans who want to see what's in the directory.

### 3.3 Business owner dashboard

Authenticated area where a business owner can:
- View their profile as agents see it
- See queries and bookings from agents
- Edit hours, menu, prices, capabilities
- Upload photos

Requires: Supabase Auth, RLS policies scoped to business owner.

### 3.4 Stripe monetization

Two possible models:
- **Business pays**: monthly subscription to be listed and discoverable by agents
- **Agent pays**: per-query or per-booking fee via x402 or Stripe Checkout

Implementation:
- Stripe Checkout for business subscriptions
- Webhook to update `verified` / `active` status in Supabase
- Display "Verified" badge on premium listings

### 3.5 Notification system

Business owners need to know when an agent makes a booking:
- Email notification (via Supabase Edge Function + Resend)
- WhatsApp notification (via Twilio or WhatsApp Business API)
- In-app notification (via Supabase Realtime)

### 3.6 Reservation management

Current reservations are stored but not manageable. Need:
- Cancel / modify reservation endpoints
- Capacity management (track actual seats/slots)
- Calendar integration (Google Calendar, iCal)
- Confirmation emails to customers

### 3.7 Multi-language support

Business descriptions are currently in mixed Spanish/English. The AI extraction generates English descriptions, but:
- Menu items keep Spanish names (correct for Mexican businesses)
- Search should work in both languages (already handled by semantic search)
- UI could offer language toggle

---

## Priority 4 — Performance and Observability

### 4.1 Embedding cache

Every `search_businesses` call generates a new embedding via AI Gateway. Cache embeddings for identical or near-identical queries using:
- In-memory LRU cache (per-function-invocation, limited but free)
- Vercel KV for cross-invocation cache
- Hash the query text, store `{ hash → embedding }` with TTL

### 4.2 Response caching

`list_categories` and `get_business` responses change rarely. Add:
- `Cache-Control` headers for CDN caching
- Supabase query result caching
- ETags for conditional requests

### 4.3 Analytics dashboard

Current `agent_queries` table logs calls but no visualization:
- Queries per hour/day
- Most popular tools
- Most searched categories
- Agent breakdown
- Response time percentiles
- Error rate

### 4.4 Health check improvements

`/api/health` should check:
- Supabase connectivity
- AI Gateway accessibility
- Embedding model availability
- Database row counts (businesses, menu_items)

---

## Priority 5 — Developer Experience

### 5.1 Tests

Zero tests exist. Add:
- Unit tests for utility functions (`groupHours`, `slugify`, `buildEmbeddingText`)
- Integration tests for MCP tools (mock Supabase + AI Gateway)
- E2E test: onboard → search → book → verify

### 5.2 CI/CD

- GitHub Actions: lint, typecheck, test on PR
- Preview deployments for PRs (Vercel handles this)
- Production deploy only on main merge

### 5.3 API documentation

OpenAPI spec for REST endpoints (`/api/onboard`, `/api/health`). MCP tools are self-documenting via the protocol, but a human-readable reference would help.

### 5.4 Local development

- Docker Compose for local Supabase (currently only remote)
- `.env.example` file
- Seed script improvements (idempotent seeding)

---

## Estimated effort for a professional MVP

| Category | Items | Effort |
|---|---|---|
| Security | API key, rate limiting, input sanitization, CORS | 2–3 days |
| Data quality | Dedup, CRUD, cleanup | 2 days |
| Business pages | Detail page, directory, owner dashboard | 3–4 days |
| Monetization | Stripe integration | 2 days |
| Notifications | Email + WhatsApp on booking | 1–2 days |
| Performance | Caching, analytics | 1–2 days |
| Tests + CI | Unit, integration, E2E, GitHub Actions | 2–3 days |
| **Total** | | **~15–20 days** |
