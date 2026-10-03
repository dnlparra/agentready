import type { McpServer } from "@modelcontextprotocol/server";
import { registerSearchBusinesses } from "@/lib/mcp/tools/search-businesses";
import { registerGetBusiness } from "@/lib/mcp/tools/get-business";
import { registerGetMenu } from "@/lib/mcp/tools/get-menu";
import { registerCheckAvailability } from "@/lib/mcp/tools/check-availability";
import { registerContactAgent } from "@/lib/mcp/tools/contact-agent";
import { registerListCategories } from "@/lib/mcp/tools/list-categories";

export function registerTools(server: McpServer) {
  registerSearchBusinesses(server);
  registerGetBusiness(server);
  registerGetMenu(server);
  registerCheckAvailability(server);
  registerContactAgent(server);
  registerListCategories(server);
}
