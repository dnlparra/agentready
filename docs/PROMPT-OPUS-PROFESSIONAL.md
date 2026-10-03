# Prompt for Claude Opus 5.5 — Make AgentReady Production-Grade

Copy everything below the line and paste it to Opus 5.5. Attach these files as context:
- `docs/FOLLOW-UP.md`
- `docs/WHAT-IS-AGENTREADY.md`
- `app/page.tsx`
- `app/onboard/page.tsx`
- `app/layout.tsx`
- `app/globals.css`
- `app/live-feed.tsx`
- `lib/onboard.ts`
- `lib/mcp/tools/search-businesses.ts`
- `lib/mcp/tools/contact-agent.ts`
- `app/api/onboard/route.ts`
- `app/api/mcp/route.ts`

---

```
You are a senior full-stack engineer reviewing and upgrading "AgentReady," an MCP server that makes local businesses discoverable by AI agents. The project is built with Next.js 16, Supabase (pgvector, PostGIS, Realtime), Vercel AI Gateway, and AI SDK 7.

Live: https://agentready-gilt.vercel.app
MCP: https://agentready-gilt.vercel.app/api/mcp
Repo: https://github.com/dnlparra/agentready

## CURRENT STATE

AgentReady was built during the Supabase Select 2026 Hackathon. It works: 6 MCP tools are live, onboarding creates businesses from free text, Claude Code verified the full search→book flow. But it's hackathon-quality code, not production code.

Read `docs/FOLLOW-UP.md` for the full list of what's missing. Read `docs/WHAT-IS-AGENTREADY.md` for context on what it does.

## WHAT I NEED YOU TO DO

Implement the following improvements IN THIS ORDER. Work through each section completely before moving to the next. After each section, verify your changes compile (`npx next build`) and don't break existing functionality.

### SECTION 1: Security hardening (Critical)

1. **Protect /api/onboard**: Require ONBOARD_API_KEY on every POST. If env var is empty, endpoint should return 503 "Onboarding disabled" instead of being open.

2. **Rate limiting**: Add Vercel-compatible rate limiting to /api/mcp and /api/onboard. Use in-memory rate limiting (Map with TTL cleanup) since we don't have KV. Limits:
   - /api/mcp: 60 requests per minute per IP
   - /api/onboard: 5 requests per minute per IP
   Rate limit the AI Gateway calls implicitly by rate limiting the endpoints.

3. **Input sanitization**: In `lib/onboard.ts`, after AI extraction, sanitize all string fields (strip HTML tags, limit string lengths). The Zod schema validates structure but not content safety.

4. **CORS**: Add proper CORS headers to /api/mcp (allow all origins since MCP clients are diverse) and /api/onboard (restrict to same origin only).

### SECTION 2: Data integrity

5. **Deduplication**: Before inserting a new business in `lib/onboard.ts`, check for existing businesses with cosine similarity > 0.93 against the new embedding. If found, return `{ duplicate: true, existing_business_id, existing_slug, similarity }` instead of creating a duplicate.

6. **Business CRUD**: Create `app/api/businesses/[id]/route.ts` with:
   - GET: public, return full business profile
   - PATCH: requires ONBOARD_API_KEY, update business fields, re-embed if description changes
   - DELETE: requires ONBOARD_API_KEY, cascade delete menu_items
   Re-use existing Supabase client and validation patterns.

### SECTION 3: UI polish

7. **Business detail page**: Create `app/business/[slug]/page.tsx` — a server component that fetches the business by slug from Supabase and renders a beautiful profile page. Include: name, category, description, address (with Google Maps link), hours grid, full menu with prices, capabilities, contact info, FAQ. Match the existing design language (neutral palette, emerald accents, Geist font, tabular-nums for prices). Add a "Search with this MCP" CTA linking to the homepage.

8. **Loading skeletons**: Replace "Waiting for the first agent call…" and "No bookings yet" empty states in live-feed.tsx with subtle pulse skeleton placeholders. Use CSS animations, not a library.

9. **OG image**: Create `app/opengraph-image.tsx` using Next.js OG image generation. Show the AgentReady logo, tagline, and MCP URL on a clean white background with the emerald accent.

### SECTION 4: Health and observability

10. **Enhanced health check**: Update `/api/health` to check:
    - Supabase connectivity (SELECT 1)
    - Business count
    - Menu item count
    - Last agent query timestamp
    Return `{ status: "ok" | "degraded", checks: {...}, timestamp }`.

11. **Error boundaries**: Add a React error boundary component in `app/error.tsx` that catches rendering errors and shows a clean fallback UI matching the design system.

### SECTION 5: Performance

12. **Embedding cache**: In the search-businesses tool, cache query embeddings in a module-level Map keyed by query text hash. TTL: 5 minutes. Max entries: 200. This prevents redundant AI Gateway calls for repeated searches.

13. **Static generation**: Ensure the homepage and onboard page are statically generated (they already are). Add `revalidate: 60` to the business detail page so it's cached but fresh.

## CONSTRAINTS

- NEVER rewrite reference files from scratch. Modify existing files incrementally.
- NEVER remove existing functionality. Only add.
- NEVER commit .env.local or any secrets.
- All new pages must include the shared header/footer from layout.tsx (already handled by the layout).
- All new UI must follow the existing design: neutral-900 headings, neutral-500 body text, emerald-600 accents, rounded-xl cards, 13px body text, Geist font.
- Use CSS animations from globals.css (animate-fade-in-up, btn-press, etc.) — don't add new animation libraries.
- Run `npx next build` after each section to verify.

## VERIFICATION

After completing all sections, run these checks:

1. `npx next build` — should succeed with no errors
2. `curl -X POST https://agentready-gilt.vercel.app/api/onboard -H 'content-type: application/json' -d '{"document":"test"}' ` — should return 503 or 401 (protected)
3. Visit `/business/[slug]` for any seeded business — should show the detail page
4. Visit `/api/health` — should return enhanced health data
5. Visit `/onboard` and submit — should still work with API key
6. MCP tools should still work: `curl -X POST .../api/mcp -H 'content-type: application/json' -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'`

Report what you completed and what you couldn't.
```
