# What Is AgentReady?

AgentReady is an MCP server that makes local businesses in Mexico discoverable and bookable by AI agents.

---

## The Problem

AI agents can buy products on Shopify and call APIs with payment protocols. But ask an agent to book dinner in Monterrey, find a dentist that speaks English, or get a haircut appointment, and it gives up. **Local businesses are invisible to AI agents.**

There is no structured, searchable directory of small businesses that an AI agent can query, filter, and act on through a standard protocol.

## The Solution

AgentReady is a single MCP endpoint that any AI agent can connect to. It provides:

- **Semantic search** across business descriptions using pgvector
- **Geospatial search** to find nearby businesses using PostGIS
- **Real-time availability** cross-referenced with existing bookings
- **Agent-to-agent communication** where the calling agent talks to the business's own AI agent to make reservations, place orders, or ask questions

---

## For AI Agents

Any MCP-compatible agent (Claude, Cursor, eve, custom agents) can connect to AgentReady with one line of configuration:

```
https://agentready-gilt.vercel.app/api/mcp
```

### What agents can do

| Tool | What it does |
|---|---|
| `search_businesses` | Find businesses by meaning ("romantic Italian dinner"), location (lat/lng + radius), category, capabilities, or price range |
| `get_business` | Get the full profile: address, hours, open-now status, capabilities, policies, payment methods |
| `get_menu` | Browse products or services with prices in MXN. Filter by dietary needs (vegetarian, vegan, gluten-free), max price, or text search |
| `check_availability` | Check if the business is open at a specific date/time and has capacity for a given party size |
| `contact_agent` | Talk to the business's AI agent. Make reservations, book appointments, place orders, request quotes, or ask questions |
| `list_categories` | Get the directory's vocabulary: all categories, capability tags, and cities with counts |

### Typical agent flow

```
1. search_businesses("dentist that speaks English near Centro")
   → Dental Smile Monterrey (has_agent: true)

2. get_menu("dental-smile-monterrey")
   → Services: Cleaning $800 MXN, Whitening $2500 MXN...

3. check_availability("dental-smile-monterrey", time: "10:00", date: "2026-10-04")
   → status: "available", remaining_capacity: 3

4. contact_agent("dental-smile-monterrey", action: "book_appointment",
     message: "Cleaning tomorrow at 10am for Maria", customer_name: "Maria")
   → outcome: "confirmed", confirmation_code: "DSM-A3X7K"
```

The agent never needs to know about Supabase, SQL, or APIs. It just uses the 6 MCP tools.

---

## For Businesses

Businesses don't interact with the MCP server directly. They become discoverable through two paths:

### 1. Onboarding (text or document)

A business owner (or Bot247) submits a text description of the business. AI extracts the structured profile:

- Name, category, address, coordinates
- Hours of operation
- Services/products with prices
- Capabilities (delivery, WiFi, parking, etc.)
- Contact information

The business is searchable within seconds of onboarding.

### 2. Bot247 Integration (future)

Bot247 is a platform that digitalizes Mexican SMBs. When a business creates a Bot247 account and uploads its "Documento Maestro" (master document), Bot247 automatically registers the business in AgentReady, making it discoverable by all AI agents.

### What businesses get

- **Visibility to AI agents** without building any technology
- **Bookings made by agents** appear in real time on the dashboard
- **An AI agent that represents them** (for businesses with `has_agent: true`): Claude handles customer interactions, answers questions, and processes reservations according to the business's policies
- **A structured digital profile** that works across any MCP-compatible platform

### Business categories currently supported

Restaurants, cafes, dental clinics, beauty salons, medical specialists, hotels, veterinary clinics, gyms, laundries, accounting firms, coworking spaces, repair shops, and more.

---

## Architecture

```
AI Agent (Claude, Cursor, eve, custom)
    │
    ▼
Vercel Functions (/api/mcp)          ← Streamable HTTP, no auth
    │
    ├── AI Gateway
    │     ├── OpenAI         → text-embedding-3-small (semantic search)
    │     ├── Claude 5.5     → business agent responses
    │     └── Gemini 3.8     → menu photo extraction
    │
    └── Supabase
          ├── pgvector HNSW  → semantic similarity search
          ├── tsvector       → keyword fallback search
          ├── PostGIS        → geospatial queries (distance, radius)
          ├── Realtime       → live dashboard updates
          └── RLS            → row-level security (read-only for public)
```

All search modes (semantic, keyword, geospatial, filtered) run in a **single Postgres RPC call** for performance and simplicity.

---

## Key Technical Decisions

1. **HNSW over ivfflat** for vector index: works correctly on small tables without training
2. **No relevance threshold**: rank and return top-N instead of cutting off results
3. **Hybrid search in one RPC**: pgvector + tsvector + PostGIS + hard filters in a single Postgres function
4. **Business agent validation**: Claude generates the response, but the database validates availability before confirming any booking
5. **Slug + UUID support**: agents can reference businesses by human-readable slug or UUID
6. **Keyword fallback**: if embedding fails, search falls back to full-text search automatically
