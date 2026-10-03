import { supabaseAdmin } from "@/lib/supabase";
import { currentAgent } from "@/lib/request-context";

type ToolResult = {
  content: { type: "text"; text: string }[];
  structuredContent?: Record<string, unknown>;
  isError?: boolean;
};

export function ok(data: Record<string, unknown>): ToolResult {
  return {
    content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
    structuredContent: data,
  };
}

/** Tool-level error: the agent sees it and can recover (spec: isError, not a protocol error). */
export function fail(message: string, extra: Record<string, unknown> = {}): ToolResult {
  return {
    content: [{ type: "text", text: JSON.stringify({ error: message, ...extra }) }],
    isError: true,
  };
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Agents pass ids or slugs interchangeably — accept both. Usage: .eq(...idOrSlug(x)) */
export function idOrSlug(value: string): [string, string] {
  return UUID_RE.test(value) ? ["id", value] : ["slug", value.trim().toLowerCase()];
}

/**
 * Wraps a tool handler: times it, catches errors, logs to agent_queries
 * (which streams to the live dashboard via Supabase Realtime).
 */
export function logged<A extends Record<string, unknown>>(
  toolName: string,
  handler: (args: A) => Promise<{ result: ToolResult; count: number }>,
) {
  return async (args: A): Promise<ToolResult> => {
    const started = Date.now();
    let result: ToolResult;
    let count = 0;
    let error: string | null = null;
    try {
      ({ result, count } = await handler(args));
      if (result.isError) error = result.content[0]?.text ?? "error";
    } catch (e) {
      error = e instanceof Error ? e.message : String(e);
      console.error(`[mcp] ${toolName} failed`, e);
      result = fail(`Internal error in ${toolName}: ${error}`);
    }
    try {
      await supabaseAdmin().from("agent_queries").insert({
        tool_name: toolName,
        query_params: args,
        results_count: count,
        response_time_ms: Date.now() - started,
        agent_identifier: currentAgent(),
        success: !error,
        error,
      });
    } catch (e) {
      console.error("[mcp] failed to log query", e);
    }
    return result;
  };
}

export const BUSINESS_SUMMARY_COLUMNS =
  "id, slug, name, category, subcategory, description, address, neighborhood, city, price_range, rating, capabilities, has_agent, agent_capabilities, hours, timezone, phone, whatsapp";
