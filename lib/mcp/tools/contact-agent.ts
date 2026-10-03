import { z } from "zod";
import { generateText, Output } from "ai";
import type { McpServer } from "@modelcontextprotocol/server";
import { supabaseAdmin } from "@/lib/supabase";
import { AGENT_MODEL } from "@/lib/ai";
import { computeAvailability } from "@/lib/availability";
import { nowIn } from "@/lib/hours";
import { currentAgent } from "@/lib/request-context";
import { idOrSlug, fail, logged, ok } from "@/lib/mcp/util";

const ACTIONS = ["ask_question", "make_reservation", "book_appointment", "place_order", "request_quote"] as const;

const inputSchema = z.object({
  business_id: z.string().min(1).describe("Business id (uuid) or slug. Business must have has_agent=true."),
  action: z.enum(ACTIONS).describe("What you want the business's agent to do."),
  message: z.string().min(1).describe("Your request in natural language, as you would say it to the business."),
  customer_name: z.string().optional().describe("Name for the booking/order."),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().describe("YYYY-MM-DD local date (reservations/appointments)."),
  time: z.string().regex(/^\d{2}:\d{2}$/).optional().describe("HH:MM 24h local time."),
  party_size: z.number().int().min(1).max(50).optional(),
  items: z.array(z.object({ name: z.string(), quantity: z.number().int().min(1) })).optional().describe("Order lines for place_order."),
});

const agentReply = z.object({
  reply: z.string().describe("What the business agent says back, concise, in the language of the request."),
  outcome: z.enum(["confirmed", "needs_more_info", "declined", "answered"]),
  missing_fields: z.array(z.string()).describe("Fields needed before confirming, empty if none."),
  order_lines: z.array(z.object({ name: z.string(), quantity: z.number(), unit_price: z.number().nullable() })).describe("Priced order/quote lines, empty if not an order/quote."),
  total_mxn: z.number().nullable(),
});

const BOOKING_ACTIONS = new Set(["make_reservation", "book_appointment"]);

export function registerContactAgent(server: McpServer) {
  server.registerTool(
    "contact_agent",
    {
      title: "Talk to the business's AI agent",
      description:
        "Send a request to a business's own AI agent (agent-to-agent). Ask questions, make reservations, book appointments, place orders or request quotes. " +
        "Only for businesses with has_agent=true. Bookings are checked against live availability and return a confirmation_code.",
      inputSchema,
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false },
    },
    logged("contact_agent", async (args: z.infer<typeof inputSchema>) => {
      const db = supabaseAdmin();
      const { data: b } = await db.from("businesses").select("*").eq(...idOrSlug(args.business_id)).maybeSingle();
      if (!b) return { result: fail(`No business found for "${args.business_id}".`), count: 0 };
      if (!b.has_agent) {
        return {
          result: fail(`${b.name} has no AI agent. Contact them directly.`, { phone: b.phone, whatsapp: b.whatsapp }),
          count: 0,
        };
      }
      if (args.action !== "ask_question" && !b.agent_capabilities.includes(args.action)) {
        return { result: fail(`${b.name}'s agent cannot ${args.action}. Supported: ${b.agent_capabilities.join(", ")}.`), count: 0 };
      }

      const now = nowIn(b.timezone);
      const date = args.date ?? (BOOKING_ACTIONS.has(args.action) ? now.date : undefined);

      // Hard check before the LLM: never let the model confirm an impossible booking.
      let availability: Awaited<ReturnType<typeof computeAvailability>> | null = null;
      if (BOOKING_ACTIONS.has(args.action)) {
        if (!args.time) {
          return { result: ok({ business: b.name, outcome: "needs_more_info", missing_fields: ["time"], reply: "What time would you like?" }), count: 0 };
        }
        availability = await computeAvailability(b, date!, args.time, args.party_size ?? 1);
        if (!["available", "limited", "likely_available"].includes(availability.status)) {
          return { result: ok({ business: b.name, outcome: "declined", availability, reply: availability.message }), count: 0 };
        }
      }

      const { data: menu } = await db
        .from("menu_items").select("category, name, price, dietary, duration_minutes").eq("business_id", b.id).eq("available", true).order("sort_order");

      const { output } = await generateText({
        model: AGENT_MODEL,
        output: Output.object({ schema: agentReply }),
        system: [
          `You are the AI agent of "${b.name}" (${b.category}) in ${b.neighborhood ?? b.city}. You are talking to another AI agent acting for a customer.`,
          `Local time now: ${now.date} ${now.time} (${b.timezone}).`,
          `Use ONLY this business data. Never invent items, prices or policies. Prices are MXN.`,
          `PROFILE: ${JSON.stringify({ description: b.description, address: b.address, hours: b.hours, policies: b.policies, faq: b.faq, payment_methods: b.payment_methods, capabilities: b.capabilities })}`,
          `MENU/SERVICES: ${JSON.stringify(menu ?? [])}`,
          `You can: ${b.agent_capabilities.join(", ")}.`,
          availability ? `Availability for the requested slot was already verified by the system: ${availability.status}. You may confirm.` : "",
          `Rules: set outcome=confirmed only for ${args.action} when you have everything needed (bookings need time and party size or service; orders need items that exist on the menu). ` +
            `For questions use outcome=answered. Price order/quote lines from the menu and compute total_mxn. Mention relevant policies (cancellation, dress code, deposits). Keep reply under 80 words.`,
        ].filter(Boolean).join("\n"),
        prompt: JSON.stringify({
          action: args.action, message: args.message, customer_name: args.customer_name,
          date, time: args.time, party_size: args.party_size, items: args.items,
        }),
      });

      let confirmation_code: string | null = null;
      if (output.outcome === "confirmed" && args.action !== "ask_question") {
        confirmation_code = `${b.slug.split("-").map((w: string) => w[0]).join("").toUpperCase().slice(0, 3)}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
        const { error } = await db.from("reservations").insert({
          business_id: b.id,
          confirmation_code,
          action: args.action,
          date: date ?? null,
          time: args.time ?? null,
          party_size: args.party_size ?? null,
          customer_name: args.customer_name ?? null,
          details: { message: args.message, items: output.order_lines },
          total_mxn: output.total_mxn,
          agent_identifier: currentAgent(),
        });
        if (error) return { result: fail(`Booking could not be saved: ${error.message}`), count: 0 };
      }

      return {
        result: ok({
          business: b.name,
          action: args.action,
          ...output,
          confirmation_code,
          booking: confirmation_code ? { date, time: args.time, party_size: args.party_size, customer_name: args.customer_name } : undefined,
          availability: availability ?? undefined,
        }),
        count: 1,
      };
    }),
  );
}
