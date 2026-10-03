import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/server";
import { supabaseAdmin } from "@/lib/supabase";
import { fail, logged, ok } from "@/lib/mcp/util";

export function registerListCategories(server: McpServer) {
  server.registerTool(
    "list_categories",
    {
      title: "List categories and capabilities",
      description: "Vocabulary of this directory: categories, capability tags and cities with counts. Use it to build precise search_businesses filters.",
      inputSchema: z.object({}),
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    logged("list_categories", async () => {
      const { data, error } = await supabaseAdmin().rpc("business_vocabulary");
      if (error) return { result: fail(error.message), count: 0 };
      return { result: ok(data as Record<string, unknown>), count: 1 };
    }),
  );
}
