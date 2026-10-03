import { AsyncLocalStorage } from "node:async_hooks";

/** Per-request info (who is calling) available inside MCP tool handlers. */
export const requestContext = new AsyncLocalStorage<{ agent: string }>();

export function currentAgent(): string {
  return requestContext.getStore()?.agent ?? "unknown";
}

/** Best-effort agent label from request headers. */
export function agentFromRequest(req: Request): string {
  const explicit = req.headers.get("x-agent-name");
  if (explicit) return explicit.slice(0, 60);
  const ua = req.headers.get("user-agent") ?? "unknown";
  return ua.split(" ")[0].slice(0, 60);
}
