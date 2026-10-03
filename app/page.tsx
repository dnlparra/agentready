import { LiveFeed } from "./live-feed";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
const MCP_URL = `${APP_URL}/api/mcp`;

const TOOLS: [string, string, string][] = [
  ["search_businesses", "Hybrid search", "Semantic (pgvector HNSW) + keyword (tsvector) + geospatial (PostGIS) search with filters."],
  ["get_business", "Full profile", "Address, hours, open-now status, capabilities, policies, FAQ, payment methods."],
  ["get_menu", "Menu and prices", "Products or services grouped by category. Filter by dietary needs, max price, or text."],
  ["check_availability", "Live availability", "Opening hours cross-referenced with existing bookings. Returns remaining capacity."],
  ["contact_agent", "Agent-to-agent", "Talk to the business\u2019s own AI agent. Book reservations, place orders, ask questions."],
  ["list_categories", "Directory vocabulary", "Categories, capability tags, and cities with counts. Build precise filters."],
];

function CopyBlock({ label, value, mono = true }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="space-y-1.5">
      <p className="text-xs font-medium tracking-wide uppercase text-neutral-500">{label}</p>
      <pre
        className={`overflow-x-auto rounded-lg border border-neutral-200 bg-white px-4 py-3 text-[13px] leading-relaxed text-neutral-800 ${mono ? "font-mono" : ""}`}
      >
        {value}
      </pre>
    </div>
  );
}

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="border-b border-neutral-200 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-16 md:py-20">
          <p className="mb-3 text-[13px] font-medium tracking-widest uppercase text-emerald-600">
            MCP Server
          </p>
          <h1 className="max-w-2xl text-[clamp(2rem,5vw,3rem)] font-bold leading-[1.1] tracking-tight text-neutral-900" style={{ textWrap: "balance" }}>
            Local Businesses,{" "}
            <span className="text-neutral-400">Discoverable by AI Agents</span>
          </h1>
          <p className="mt-5 max-w-xl text-[17px] leading-relaxed text-neutral-500">
            One endpoint connects any MCP-compatible agent to restaurants, clinics, salons, and services in Mexico. Search by meaning, location, or capability. Book in real time.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <code className="rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-2.5 font-mono text-sm text-neutral-700">
              {MCP_URL}
            </code>
            <span className="text-xs text-neutral-400">Streamable HTTP &middot; No auth required</span>
          </div>
        </div>
      </section>

      {/* Connect */}
      <section className="border-b border-neutral-200">
        <div className="mx-auto max-w-6xl px-6 py-14">
          <h2 className="mb-8 text-xl font-semibold tracking-tight text-neutral-900">Connect Your Agent</h2>
          <div className="grid gap-6 md:grid-cols-3">
            <CopyBlock
              label="Claude Code"
              value={`claude mcp add --transport http \\\n  agentready ${MCP_URL}`}
            />
            <CopyBlock
              label="Cursor / Claude Desktop"
              value={JSON.stringify({ mcpServers: { agentready: { url: MCP_URL } } }, null, 2)}
            />
            <CopyBlock
              label="Any MCP Client"
              value={`POST ${MCP_URL}\nContent-Type: application/json\nMCP-Protocol-Version: 2025-06-18`}
            />
          </div>
          <p className="mt-6 text-xs text-neutral-400">
            Discovery:{" "}
            <a href="/.well-known/ard.json" className="underline underline-offset-2 hover:text-neutral-600">/.well-known/ard.json</a>
            {" "}&middot;{" "}
            <a href="/agents.json" className="underline underline-offset-2 hover:text-neutral-600">/agents.json</a>
          </p>
        </div>
      </section>

      {/* Tools */}
      <section className="border-b border-neutral-200 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-14">
          <h2 className="mb-8 text-xl font-semibold tracking-tight text-neutral-900">6 Tools</h2>
          <div className="grid gap-px overflow-hidden rounded-xl border border-neutral-200 bg-neutral-200 md:grid-cols-2 lg:grid-cols-3">
            {TOOLS.map(([name, title, desc]) => (
              <article key={name} className="bg-white p-5">
                <code className="text-[13px] font-medium text-emerald-600">{name}</code>
                <h3 className="mt-1.5 text-[15px] font-semibold text-neutral-900">{title}</h3>
                <p className="mt-1 text-[13px] leading-relaxed text-neutral-500">{desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Architecture */}
      <section className="border-b border-neutral-200">
        <div className="mx-auto max-w-6xl px-6 py-10">
          <p className="mb-3 text-xs font-medium tracking-widest uppercase text-neutral-400">Architecture</p>
          <pre className="overflow-x-auto rounded-xl border border-neutral-200 bg-white px-6 py-4 font-mono text-[13px] leading-loose text-neutral-600">
{`Agent  \u2192  Vercel Functions (/api/mcp)
       \u2192  AI Gateway  \u2192  OpenAI (embeddings)
                      \u2192  Claude Sonnet 5.5 (business agents)
                      \u2192  Gemini 3.8 Flash (menu vision)
       \u2192  Supabase    \u2192  pgvector HNSW (semantic search)
                      \u2192  tsvector (keyword fallback)
                      \u2192  PostGIS (geospatial)
                      \u2192  Realtime (live dashboard)
                      \u2192  RLS (row-level security)`}
          </pre>
        </div>
      </section>

      {/* Live Feed */}
      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-6 py-14">
          <LiveFeed />
        </div>
      </section>
    </>
  );
}
