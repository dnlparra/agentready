# AgentReady — Local Businesses for AI Agents

MCP server that makes local SMBs (restaurants, clinics, salons, services) discoverable and actionable by AI agents.

**Live:** [https://agentready-gilt.vercel.app](https://agentready-gilt.vercel.app)  
**MCP endpoint:** `https://agentready-gilt.vercel.app/api/mcp`

---

## Connect

### Claude Code

```bash
claude mcp add --transport http agentready https://agentready-gilt.vercel.app/api/mcp
```

### Cursor (`mcp.json`)

```json
{
  "mcpServers": {
    "agentready": {
      "url": "https://agentready-gilt.vercel.app/api/mcp"
    }
  }
}
```

### eve connection

```typescript
import { defineMcpClientConnection } from "eve/connections";

export default defineMcpClientConnection({
  url: process.env.MCP_SERVER_URL ?? "https://REPLACE_WITH_DOMAIN/api/mcp",
  description:
    "AgentReady Business Discovery — search, read menus/prices, check availability and book " +
    "reservations/appointments at local businesses in Monterrey, Mexico (restaurants, cafes, " +
    "dentists, doctors, salons, vets, hotels, gyms, coworking, services).",
  headers: { "x-agent-name": "eve-demo" },
});
```

---

## Tools

| Tool | Description |
|------|-------------|
| `search_businesses` | Hybrid semantic (pgvector) + keyword + geo (PostGIS) search |
| `get_business` | Full profile, hours, open-now, policies, FAQ |
| `get_menu` | Menu / services with MXN prices, dietary filters |
| `check_availability` | Hours + live capacity from bookings |
| `contact_agent` | Agent-to-agent: questions, reservations, orders, quotes |
| `list_categories` | Directory vocabulary for precise filters |

---

## Architecture

```
┌─────────┐     ┌──────────────────┐     ┌─────────────────────────────────────────┐
│  Agent  │────▶│ Vercel /api/mcp  │────▶│ AI Gateway                              │
└─────────┘     └──────────────────┘     │  embeddings: OpenAI                   │
                                         │  agents: Claude                       │
                                         │  vision: Gemini                       │
                                         └──────────────────┬──────────────────────┘
                                                            │
                                                            ▼
                                         ┌─────────────────────────────────────────┐
                                         │ Supabase                                │
                                         │  pgvector HNSW · tsvector · PostGIS     │
                                         │  Realtime · RLS                         │
                                         └─────────────────────────────────────────┘
```

---

## Run locally

```bash
git clone <repo-url>
cd Hackathon
npm install
```

Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
AI_GATEWAY_API_KEY=
```

1. Run `supabase/schema.sql` in the Supabase SQL Editor  
2. `npm run seed`  
3. `npm run dev`

---

## Built with

Supabase (pgvector, PostGIS, Realtime, RLS) · Vercel (Next.js 16, Functions, AI Gateway, AI SDK 7, eve) · Claude Sonnet 5.5 · Gemini 3.8 Flash · Cursor

---

**Hackathon:** Built for [Supabase Select 2026](https://select.supabase.com)
