import { createMcpHandler } from "mcp-handler";
import { registerTools } from "@/lib/mcp/register";
import { agentFromRequest, requestContext } from "@/lib/request-context";

export const runtime = "nodejs";
export const maxDuration = 60;

const handler = createMcpHandler(registerTools, {
  serverInfo: { name: "agentready-discovery", version: "1.0.0" },
  instructions:
    "AgentReady: discover and act on local businesses in Mexico (Monterrey). " +
    "Typical flow: search_businesses → get_business / get_menu → check_availability → contact_agent (only when has_agent=true). " +
    "Times are local America/Monterrey, prices MXN.",
});

async function route(req: Request) {
  return requestContext.run({ agent: agentFromRequest(req) }, () => handler(req));
}

export { route as GET, route as POST, route as DELETE };
