"use client";

import { useState } from "react";

const EXAMPLE = `Somos "Tortas La Abuela", una torter\u00eda familiar en la colonia Mitras Centro, Monterrey (Av. Sim\u00f3n Bol\u00edvar 900). Abrimos de lunes a s\u00e1bado de 8:00 a 17:00, domingos cerrado. Tenemos torta de milanesa ($85), torta cubana ($110), torta de pierna ($80), torta vegetariana de aguacate y panela ($75), aguas frescas ($30). Aceptamos efectivo y tarjeta, hacemos entregas a domicilio en 3 km y pedidos para oficinas. WhatsApp 81 5550 2001.`;

const CATEGORY_LABELS: Record<string, string> = {
  restaurant: "Restaurant",
  cafe: "Caf\u00e9",
  dental_clinic: "Dental Clinic",
  beauty_salon: "Beauty Salon",
  repair_shop: "Repair Shop",
  hotel: "Hotel",
  veterinary: "Veterinary",
  gym: "Gym",
  laundry: "Laundry",
  accounting: "Accounting",
  medical_specialist: "Medical Specialist",
  coworking: "Coworking",
  other: "Other",
};

const DAYS_ORDER = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"] as const;
const DAY_SHORT: Record<string, string> = {
  monday: "Mon", tuesday: "Tue", wednesday: "Wed", thursday: "Thu",
  friday: "Fri", saturday: "Sat", sunday: "Sun",
};

type MenuItem = { name: string; price: number | null; category: string; description: string | null };
type HoursEntry = { open: string; close: string } | null;

type OnboardResult = {
  business_id: string;
  slug: string;
  profile: {
    name: string;
    description: string;
    category: string;
    subcategory: string | null;
    address: string;
    neighborhood: string | null;
    city: string;
    state: string | null;
    capabilities: string[];
    price_range: string | null;
    payment_methods: string[];
    hours: Record<string, HoursEntry>;
    menu: MenuItem[];
    has_agent: boolean;
    [key: string]: unknown;
  };
  menu_items_created: number;
  menu_source: string;
  embedding_generated: boolean;
  location_approximate: boolean;
};

type Phase = "form" | "processing" | "done" | "error";

function groupHours(hours: Record<string, HoursEntry>): string[] {
  const lines: string[] = [];
  let i = 0;
  while (i < DAYS_ORDER.length) {
    const day = DAYS_ORDER[i];
    const entry = hours[day];
    if (!entry) {
      lines.push(`${DAY_SHORT[day]}: Closed`);
      i++;
      continue;
    }
    let j = i + 1;
    while (j < DAYS_ORDER.length) {
      const next = hours[DAYS_ORDER[j]];
      if (!next || next.open !== entry.open || next.close !== entry.close) break;
      j++;
    }
    const range = j - 1 > i
      ? `${DAY_SHORT[DAYS_ORDER[i]]}\u2013${DAY_SHORT[DAYS_ORDER[j - 1]]}`
      : DAY_SHORT[day];
    lines.push(`${range}: ${entry.open}\u2013${entry.close}`);
    i = j;
  }
  return lines;
}

function Spinner() {
  return (
    <svg className="animate-spin-fast size-5 text-emerald-600" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-20" />
      <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export default function OnboardPage() {
  const [doc, setDoc] = useState(EXAMPLE);
  const [apiKey, setApiKey] = useState("");
  const [image, setImage] = useState<{ base64: string; type: string } | null>(null);
  const [phase, setPhase] = useState<Phase>("form");
  const [result, setResult] = useState<OnboardResult | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [showRaw, setShowRaw] = useState(false);

  async function onFile(f: File | undefined) {
    if (!f) return setImage(null);
    const buf = await f.arrayBuffer();
    let bin = "";
    new Uint8Array(buf).forEach((b) => (bin += String.fromCharCode(b)));
    setImage({ base64: btoa(bin), type: f.type });
  }

  async function submit() {
    if (!doc.trim()) return;
    setPhase("processing");
    setErrorMsg("");
    setResult(null);
    try {
      const res = await fetch("/api/onboard", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          ...(apiKey ? { "x-api-key": apiKey } : {}),
        },
        body: JSON.stringify({
          document: doc,
          image_base64: image?.base64,
          image_media_type: image?.type,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
      setResult(data);
      setPhase("done");
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : "Something went wrong");
      setPhase("error");
    }
  }

  function reset() {
    setPhase("form");
    setResult(null);
    setErrorMsg("");
    setDoc("");
    setShowRaw(false);
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-14 md:py-20">
      {/* Hero */}
      <p className="mb-3 text-[13px] font-medium tracking-widest uppercase text-emerald-600">
        Onboarding
      </p>
      <h1
        className="text-[clamp(1.5rem,4vw,2.25rem)] font-bold leading-[1.15] tracking-tight text-neutral-900"
        style={{ textWrap: "balance" }}
      >
        Make a Business Agent-Ready
      </h1>
      <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-neutral-500">
        Paste anything the business wrote about itself. AI extracts a structured, searchable profile and saves it to the directory.
      </p>

      {/* ── Form ──────────────────────────────────── */}
      {(phase === "form" || phase === "error") && (
        <div className="mt-10 space-y-5 animate-fade-in">
          <div>
            <label htmlFor="doc" className="mb-1.5 block text-[13px] font-medium text-neutral-700">
              Business description
            </label>
            <textarea
              id="doc"
              className="block h-44 w-full resize-y rounded-xl border border-neutral-200 bg-white px-4 py-3 text-[14px] leading-relaxed text-neutral-800 placeholder:text-neutral-400 transition-[border-color] duration-150 ease-out focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
              value={doc}
              onChange={(e) => setDoc(e.target.value)}
              placeholder="Describe the business: name, address, hours, services, prices..."
            />
            <p className="mt-1.5 text-[11px] tabular text-neutral-400">
              {doc.length.toLocaleString()} characters
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="menu-photo" className="mb-1.5 block text-[13px] font-medium text-neutral-700">
                Menu photo <span className="font-normal text-neutral-400">(optional)</span>
              </label>
              <input
                id="menu-photo"
                type="file"
                accept="image/*"
                onChange={(e) => onFile(e.target.files?.[0])}
                className="block w-full text-[13px] text-neutral-500 file:mr-3 file:rounded-lg file:border file:border-neutral-200 file:bg-white file:px-3 file:py-1.5 file:text-[13px] file:font-medium file:text-neutral-700 file:transition-colors file:duration-150 hover:file:bg-neutral-50"
              />
              {image && (
                <p className="mt-1.5 text-[11px] text-emerald-600">Image attached</p>
              )}
            </div>
            <div>
              <label htmlFor="api-key" className="mb-1.5 block text-[13px] font-medium text-neutral-700">
                API key <span className="font-normal text-neutral-400">(if set)</span>
              </label>
              <input
                id="api-key"
                type="text"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="x-api-key"
                className="block w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-[13px] text-neutral-700 placeholder:text-neutral-400 transition-[border-color] duration-150 ease-out focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
              />
            </div>
          </div>

          {phase === "error" && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-700 animate-fade-in-up" role="alert">
              {errorMsg}
            </div>
          )}

          <button
            onClick={submit}
            disabled={!doc.trim()}
            className="btn-press inline-flex items-center gap-2 rounded-xl bg-neutral-900 px-5 py-2.5 text-[14px] font-medium text-white transition-opacity duration-150 disabled:opacity-40"
          >
            Make it agent-ready
          </button>
        </div>
      )}

      {/* ── Processing ────────────────────────────── */}
      {phase === "processing" && (
        <div className="mt-10 animate-fade-in-up">
          <div className="rounded-xl border border-neutral-200 bg-white px-6 py-10 text-center">
            <div className="mx-auto mb-4 flex size-10 items-center justify-center">
              <Spinner />
            </div>
            <p className="text-[15px] font-semibold text-neutral-900">Analyzing and structuring&hellip;</p>
            <p className="mt-2 max-w-md mx-auto text-[13px] leading-relaxed text-neutral-500">
              AI is reading the description, extracting the business profile, generating search embeddings, and saving everything to the directory. This usually takes 10&ndash;20 seconds.
            </p>
          </div>
        </div>
      )}

      {/* ── Result ────────────────────────────────── */}
      {phase === "done" && result && (
        <div className="mt-10 space-y-5 stagger">
          {/* Success banner */}
          <div className="flex items-center gap-2.5 animate-fade-in-up">
            <span className="flex size-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-700" aria-hidden="true">
              <svg viewBox="0 0 16 16" fill="currentColor" className="size-3"><path fillRule="evenodd" d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.75.75 0 0 1 1.06-1.06L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z" clipRule="evenodd" /></svg>
            </span>
            <p className="text-[15px] font-semibold text-neutral-900">Onboarded successfully</p>
          </div>

          {/* Profile card */}
          <div className="animate-fade-in-up rounded-xl border border-neutral-200 bg-white overflow-hidden">
            {/* Name & category */}
            <div className="border-b border-neutral-100 px-5 py-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-neutral-900">{result.profile.name}</h2>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-[13px] text-neutral-500">
                    <span className="inline-flex items-center rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
                      {CATEGORY_LABELS[result.profile.category] ?? result.profile.category}
                    </span>
                    {result.profile.subcategory && (
                      <span className="text-neutral-400">&middot; {result.profile.subcategory}</span>
                    )}
                    {result.profile.price_range && (
                      <span className="text-neutral-400">&middot; {result.profile.price_range}</span>
                    )}
                  </div>
                </div>
                {result.profile.has_agent && (
                  <span className="shrink-0 rounded-md border border-violet-200 bg-violet-50 px-2 py-0.5 text-[11px] font-medium text-violet-700">
                    AI Agent
                  </span>
                )}
              </div>
              <p className="mt-3 text-[13px] leading-relaxed text-neutral-600">{result.profile.description}</p>
            </div>

            {/* Location */}
            <div className="border-b border-neutral-100 px-5 py-3">
              <p className="text-[12px] font-medium uppercase tracking-wider text-neutral-400 mb-1">Location</p>
              <p className="text-[13px] text-neutral-700">{result.profile.address}</p>
              {result.profile.neighborhood && (
                <p className="text-[13px] text-neutral-500">{result.profile.neighborhood}, {result.profile.city}</p>
              )}
              {result.location_approximate && (
                <p className="mt-1 text-[11px] text-amber-600">Approximate location (no exact coordinates provided)</p>
              )}
            </div>

            {/* Hours */}
            {result.profile.hours && (
              <div className="border-b border-neutral-100 px-5 py-3">
                <p className="text-[12px] font-medium uppercase tracking-wider text-neutral-400 mb-1">Hours</p>
                <div className="flex flex-wrap gap-x-5 gap-y-0.5 text-[13px] tabular text-neutral-700">
                  {groupHours(result.profile.hours).map((line) => (
                    <span key={line}>{line}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Menu preview */}
            {result.menu_items_created > 0 && (
              <div className="border-b border-neutral-100 px-5 py-3">
                <p className="text-[12px] font-medium uppercase tracking-wider text-neutral-400 mb-2">
                  Menu &middot; {result.menu_items_created} items from {result.menu_source}
                </p>
                <div className="space-y-1">
                  {result.profile.menu.slice(0, 6).map((item) => (
                    <div key={item.name} className="flex items-baseline justify-between gap-3 text-[13px]">
                      <span className="text-neutral-700">{item.name}</span>
                      <span className="tabular shrink-0 text-neutral-500">
                        {item.price != null
                          ? new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(item.price)
                          : "\u2014"}
                      </span>
                    </div>
                  ))}
                  {result.menu_items_created > 6 && (
                    <p className="text-[11px] text-neutral-400">+ {result.menu_items_created - 6} more</p>
                  )}
                </div>
              </div>
            )}

            {/* Capabilities */}
            {result.profile.capabilities.length > 0 && (
              <div className="border-b border-neutral-100 px-5 py-3">
                <p className="text-[12px] font-medium uppercase tracking-wider text-neutral-400 mb-2">Capabilities</p>
                <div className="flex flex-wrap gap-1.5">
                  {result.profile.capabilities.map((cap) => (
                    <span key={cap} className="rounded-md border border-neutral-200 bg-neutral-50 px-2 py-0.5 text-[11px] font-medium text-neutral-600">
                      {cap.replace(/_/g, " ")}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Meta */}
            <div className="px-5 py-3 flex flex-wrap gap-x-5 gap-y-1 text-[12px] text-neutral-400">
              <span>{result.embedding_generated ? "\u2713 Search embedding generated" : "\u2717 Embedding failed (keyword search only)"}</span>
              <span>ID: <code className="font-mono text-[11px]">{result.business_id.slice(0, 8)}</code></span>
              <span>Slug: <code className="font-mono text-[11px]">{result.slug}</code></span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-3 animate-fade-in-up">
            <button
              onClick={reset}
              className="btn-press rounded-xl bg-neutral-900 px-5 py-2.5 text-[14px] font-medium text-white"
            >
              Onboard another
            </button>
            <button
              onClick={() => setShowRaw(!showRaw)}
              className="btn-press rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-[13px] font-medium text-neutral-600 transition-colors duration-150 hover:bg-neutral-50"
            >
              {showRaw ? "Hide" : "Show"} raw response
            </button>
          </div>

          {/* Raw JSON */}
          {showRaw && (
            <pre className="animate-fade-in max-h-96 overflow-auto rounded-xl border border-neutral-200 bg-neutral-900 px-5 py-4 text-[12px] leading-relaxed text-neutral-300">
              {JSON.stringify(result, null, 2)}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}
