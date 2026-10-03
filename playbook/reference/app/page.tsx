import { LiveFeed } from "./live-feed";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
const MCP_URL = `${APP_URL}/api/mcp`;

const TOOLS = [
  ["search_businesses", "Hybrid semantic (pgvector) + keyword + geo (PostGIS) search"],
  ["get_business", "Full profile, hours, open-now, policies, FAQ"],
  ["get_menu", "Menu / services with MXN prices, dietary filters"],
  ["check_availability", "Hours + live capacity from bookings"],
  ["contact_agent", "Agent-to-agent: questions, reservations, orders, quotes"],
  ["list_categories", "Directory vocabulary for precise filters"],
];

export default function Home() {
  return (
    <main className="mx-auto max-w-6xl space-y-8 p-6 text-zinc-900">
      <header className="space-y-2">
        <p className="text-sm font-medium text-emerald-700">MCP server · Supabase · Vercel</p>
        <h1 className="text-4xl font-bold tracking-tight">AgentReady</h1>
        <p className="max-w-2xl text-lg text-zinc-600">
          Local businesses in Mexico, discoverable and bookable by any AI agent. Agents search, read menus,
          check availability and make reservations through one MCP endpoint.
        </p>
      </header>

      <section className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-zinc-200 bg-white p-4">
          <h2 className="mb-2 font-semibold">Connect your agent</h2>
          <p className="mb-2 text-sm text-zinc-600">Streamable HTTP endpoint, no auth:</p>
          <code className="block rounded bg-zinc-900 p-3 text-sm text-emerald-300">{MCP_URL}</code>
          <p className="mt-3 mb-1 text-sm text-zinc-600">Claude Code:</p>
          <code className="block rounded bg-zinc-900 p-3 text-xs text-zinc-100">claude mcp add --transport http agentready {MCP_URL}</code>
          <p className="mt-3 mb-1 text-sm text-zinc-600">Cursor / Claude Desktop (mcp.json):</p>
          <pre className="overflow-x-auto rounded bg-zinc-900 p-3 text-xs text-zinc-100">{JSON.stringify({ mcpServers: { agentready: { url: MCP_URL } } }, null, 2)}</pre>
          <p className="mt-3 text-xs text-zinc-500">
            Discovery: <a className="underline" href="/.well-known/ard.json">/.well-known/ard.json</a> ·{" "}
            <a className="underline" href="/agents.json">/agents.json</a> · <a className="underline" href="/api/health">/api/health</a> ·{" "}
            <a className="underline" href="/onboard">onboard a business</a>
          </p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-4">
          <h2 className="mb-2 font-semibold">Tools</h2>
          <ul className="space-y-2 text-sm">
            {TOOLS.map(([name, desc]) => (
              <li key={name}><span className="font-mono text-emerald-700">{name}</span> — <span className="text-zinc-600">{desc}</span></li>
            ))}
          </ul>
        </div>
      </section>

      <LiveFeed />
    </main>
  );
}
