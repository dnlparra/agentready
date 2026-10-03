"use client";

import { useState } from "react";

const EXAMPLE = `Somos "Tortas La Abuela", una tortería familiar en la colonia Mitras Centro, Monterrey (Av. Simón Bolívar 900). Abrimos de lunes a sábado de 8:00 a 17:00, domingos cerrado. Tenemos torta de milanesa ($85), torta cubana ($110), torta de pierna ($80), torta vegetariana de aguacate y panela ($75), aguas frescas ($30). Aceptamos efectivo y tarjeta, hacemos entregas a domicilio en 3 km y pedidos para oficinas. WhatsApp 81 5550 2001.`;

export default function OnboardPage() {
  const [doc, setDoc] = useState(EXAMPLE);
  const [apiKey, setApiKey] = useState("");
  const [image, setImage] = useState<{ base64: string; type: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<unknown>(null);

  async function onFile(f: File | undefined) {
    if (!f) return setImage(null);
    const buf = await f.arrayBuffer();
    let bin = "";
    new Uint8Array(buf).forEach((b) => (bin += String.fromCharCode(b)));
    setImage({ base64: btoa(bin), type: f.type });
  }

  async function submit() {
    setLoading(true);
    setResult(null);
    const res = await fetch("/api/onboard", {
      method: "POST",
      headers: { "content-type": "application/json", ...(apiKey ? { "x-api-key": apiKey } : {}) },
      body: JSON.stringify({ document: doc, image_base64: image?.base64, image_media_type: image?.type }),
    });
    setResult(await res.json());
    setLoading(false);
  }

  return (
    <main className="mx-auto max-w-4xl space-y-4 p-6">
      <h1 className="text-2xl font-bold">Onboard a business</h1>
      <p className="text-zinc-600">Paste anything the business wrote about itself. AI turns it into a structured, searchable, agent-ready profile in Supabase.</p>
      <textarea className="h-48 w-full rounded-lg border p-3 text-sm" value={doc} onChange={(e) => setDoc(e.target.value)} />
      <div className="flex flex-wrap items-center gap-4 text-sm">
        <label>Menu photo (optional): <input type="file" accept="image/*" onChange={(e) => onFile(e.target.files?.[0])} /></label>
        <input className="rounded border px-2 py-1" placeholder="x-api-key (if set)" value={apiKey} onChange={(e) => setApiKey(e.target.value)} />
        <button onClick={submit} disabled={loading} className="rounded-lg bg-emerald-600 px-4 py-2 font-medium text-white disabled:opacity-50">
          {loading ? "Processing…" : "Make it agent-ready"}
        </button>
      </div>
      {result != null && <pre className="max-h-[32rem] overflow-auto rounded-lg bg-zinc-900 p-4 text-xs text-zinc-100">{JSON.stringify(result, null, 2)}</pre>}
    </main>
  );
}
