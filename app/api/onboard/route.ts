import { z } from "zod";
import { onboardBusiness } from "@/lib/onboard";

export const runtime = "nodejs";
export const maxDuration = 120;

const body = z.object({
  document: z.string().min(40, "Describe the business in at least a few sentences.").max(20000),
  image_base64: z.string().max(8_000_000).optional(),
  image_media_type: z.string().optional(),
  has_agent: z.boolean().optional(),
});

export async function POST(req: Request) {
  const required = process.env.ONBOARD_API_KEY;
  if (required && req.headers.get("x-api-key") !== required) {
    return Response.json({ error: "Invalid or missing x-api-key" }, { status: 401 });
  }
  const parsed = body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ error: parsed.error.issues.map((i) => i.message).join("; ") }, { status: 400 });
  }
  try {
    const result = await onboardBusiness({
      document: parsed.data.document,
      imageBase64: parsed.data.image_base64,
      imageMediaType: parsed.data.image_media_type,
      hasAgent: parsed.data.has_agent,
    });
    return Response.json(result);
  } catch (e) {
    console.error("[onboard]", e);
    return Response.json({ error: e instanceof Error ? e.message : "Onboarding failed" }, { status: 500 });
  }
}
