# AgentReady: Build Playbook (Supabase Select 2026)

> **Estado al escribir esto:** ~21:00 UTC. El cierre es a las **00:30 UTC**, así que quedan ~3.5 h.
> Presupuesto: **2 h 15 min de build**, **45 min de bonus/polish** y **30 min de video + submit**. La hora de submit no se negocia.

## Qué hay en esta carpeta

| Archivo | Qué es |
|---|---|
| `PLAYBOOK.md` | Este documento: review, checklist, prompts para el orquestador y las task cards |
| `schema.sql` | Schema completo de Supabase. Se pega en el SQL Editor y se corre. Es re-ejecutable |
| `seed-data.json` | 15 negocios de Monterrey con 94 items de menú/servicios (9 con agente, 6 sin agente) |
| `reference/` | **Implementación de referencia ya verificada**: `tsc` limpio, `next build` OK y handshake MCP probado con `tools/list` y `tools/call` |
| `reference/eve-agent/` | Los archivos `instructions.md` y `connections/agentready.ts` para el agente eve |

**Estrategia clave:** Composer no inventa código. **Copia** los archivos de `reference/`, los verifica y arregla lo que falle contra los servicios reales (Supabase, AI Gateway, Vercel). Eso elimina el riesgo de que alucine APIs. Varias APIs de tu PRD cambiaron (ver Parte 1) y son justo las que un modelo de código se equivocaría.

---

# PARTE 5 (primero): Checklist pre-build (15 min, lo haces TÚ)

- [ ] **Node 24+.** Tu máquina tiene **v22.18**, y eve exige `>=24`. Corre `brew install node@24 && brew link --overwrite node@24` (o `nvm install 24 && nvm use 24`). Verifica con `node -v`.
- [ ] **Créditos de Vercel** redimidos en credits.vercel.sh con el código `SUPASELE-4T9F-SM6E` + tu Team ID (`team_...`).
- [ ] **AI Gateway API key**: Vercel Dashboard → AI Gateway → API Keys → Create. Guárdala como `AI_GATEWAY_API_KEY`.
- [ ] **Proyecto Supabase** creado (región `us-west-1`). Guarda:
  - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
  - anon / publishable key → `NEXT_PUBLIC_SUPABASE_ANON_KEY` (cualquiera de las dos funciona)
  - service_role / secret key → `SUPABASE_SERVICE_ROLE_KEY` (**nunca** al cliente)
- [ ] **Schema:** Supabase → SQL Editor → pega `schema.sql` completo → Run. Debe terminar sin errores.
  - Verificación rápida: `select public.business_vocabulary();` devuelve `{"total_businesses": 0, ...}`.
  - Las extensiones `vector` y `postgis` las habilita el mismo script. No hace falta hacerlo a mano.
- [ ] **Repo GitHub** vacío creado: `agent-ready`.
- [ ] **Cursor** abierto en la carpeta del proyecto. Copia esta carpeta `playbook/` dentro del repo (T0 lo hace).
- [ ] (Opcional, bonus Stripe) **Stripe test mode**: Dashboard → Developers → API keys → `sk_test_...` → `STRIPE_SECRET_KEY`.
- [ ] (Recomendado) **Claude Code o Claude Desktop** instalado como cliente MCP de respaldo para la demo.

`.env.local` (local) y Vercel → Settings → Environment Variables (producción):

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...            # o sb_publishable_...
SUPABASE_SERVICE_ROLE_KEY=eyJ...                # o sb_secret_...
AI_GATEWAY_API_KEY=vck_...
NEXT_PUBLIC_APP_URL=https://agent-ready-xxx.vercel.app   # local: http://localhost:3000
ONBOARD_API_KEY=algo-secreto                    # opcional; protege /api/onboard
STRIPE_SECRET_KEY=sk_test_...                   # opcional (bonus)
```

> En Vercel, el AI Gateway se autentica solo vía OIDC. Aun así, agrega `AI_GATEWAY_API_KEY` para que funcione igual en preview y producción.

---

# PARTE 1: Review del PRD (qué estaba mal y cómo quedó)

### 1. Schema de Supabase

| # | Problema en el PRD | Severidad | Fix (ya aplicado en `schema.sql`) |
|---|---|---|---|
| 1 | `ivfflat ... WITH (lists = 20)` creado sobre una tabla **vacía** con 15 filas. ivfflat entrena los centroides al crear el índice; vacío = centroides basura. Con `probes=1` busca en 1 de 20 listas, **así que la búsqueda puede devolver 0 resultados**. | 🔴 Rompe la demo | **HNSW** (`using hnsw (embedding vector_cosine_ops)`): sin entrenamiento y funciona desde vacío. |
| 2 | `match_threshold 0.65`: con `text-embedding-3-small`, la similitud coseno query-vs-documento corta típicamente cae en **0.25-0.55**. Con 0.65 casi siempre devuelve **vacío**. | 🔴 Rompe la demo | Sin threshold: **rankea** y aplica `limit`. |
| 3 | Semántica, geo y filtros en **3-4 llamadas separadas** que se "intersectan" en TS: lento y propenso a bugs. | 🟠 | **Un solo RPC híbrido** `search_businesses()`: pgvector + `tsvector` + PostGIS `ST_DWithin` + filtros duros + score combinado. Es 1 roundtrip y luce mejor ante los jueces de Supabase. |
| 4 | Sin fallback si falla el embedding. | 🟠 | El RPC acepta `query_embedding = NULL`, cae a full-text (`websearch_to_tsquery('simple', ...)`) y el tool reporta `search_mode: "keyword_fallback"`. |
| 5 | **RLS no habilitado**. Supabase marca las tablas públicas sin RLS como críticas, y Realtime con anon necesita una policy `select`. | 🟠 | RLS ON en las 4 tablas + policies de solo lectura para `anon`. El servidor usa service role. |
| 6 | Funciones sin `search_path`. En Supabase, `vector`/`postgis` viven en el schema `extensions`. | 🟡 | `set search_path = public, extensions` en todas las funciones. |
| 7 | `is_open_now()` en SQL con `America/Mexico_City`. Monterrey es `America/Monterrey` (hoy son iguales, pero es el identificador correcto). Además `to_char(..., 'day')` es frágil y no sirve para `check_availability` con fecha y hora futuras. | 🟡 | La lógica de horarios vive en **TS** (`lib/hours.ts`), con el mismo código para `open_now` y `check_availability`. Soporta cierres después de medianoche y el "spill-over" del día anterior (viernes 08:00-03:00 cubre sábado 01:00). |
| 8 | `reservations` no existe: las reservas eran "simuladas" y no quedaban en ningún lado. | 🟠 Demo | Tabla `reservations` + Realtime. Las reservas aparecen **en vivo** en el dashboard y `check_availability` descuenta la capacidad real. |
| 9 | `lists=20` e índices B-tree en `city`/`has_agent`: con 15 filas son ruido. | ⚪ | Solo los índices que cuentan la historia: GIN (capabilities, fts), GiST (geo) y HNSW (vector). |
| 10 | Columna `lat/lng` y `coordinates` duplicadas. | ⚪ | Se mantiene: el trigger rellena `coordinates` y `lat/lng` es cómodo para JSON. También actualiza `updated_at`. |

**¿pgvector + PostGIS juntos tienen conflicto?** No. Son extensiones independientes en el mismo schema `extensions`. Lo único a cuidar es el `search_path`, y ya está resuelto.

### 2. MCP Server en Next.js App Router

El PRD propone `@modelcontextprotocol/sdk` + transporte manual. **No hagas eso.** Esto es lo que verifiqué hoy en npm:

| Paquete | Versión hoy | Nota |
|---|---|---|
| `mcp-handler` | 2.2.0 | Adaptador oficial de Vercel para Next.js. **Solo Streamable HTTP; ya no necesita Redis** |
| `@modelcontextprotocol/server` | 2.3.0 | **Peer dep requerida por mcp-handler 2.x**. Ya **no** es `@modelcontextprotocol/sdk` (v1) |
| `ai` | 7.0.x | AI SDK 7 |
| `zod` | 4.x | mcp-handler 2 pide zod ≥4.2 |
| `next` | 16.3.x | |
| `eve` | 0.71 | `engines: node >=24` |

Setup exacto, ya verificado con `tools/list` real (`reference/app/api/mcp/route.ts`):

```ts
import { createMcpHandler } from "mcp-handler";
import { registerTools } from "@/lib/mcp/register";
import { agentFromRequest, requestContext } from "@/lib/request-context";

export const runtime = "nodejs";
export const maxDuration = 60;

const handler = createMcpHandler(registerTools, {
  serverInfo: { name: "agentready-discovery", version: "1.0.0" },
  instructions: "AgentReady: ... search_businesses → get_business / get_menu → check_availability → contact_agent ...",
});

async function route(req: Request) {
  return requestContext.run({ agent: agentFromRequest(req) }, () => handler(req));
}
export { route as GET, route as POST, route as DELETE };
```

Así se registra un tool en el SDK v2: `inputSchema` es un **`z.object(...)` completo**, no un raw shape como en v1.

```ts
server.registerTool("get_menu", { title, description, inputSchema: z.object({...}), annotations: { readOnlyHint: true } },
  async (args) => ({ content: [{ type: "text", text: JSON.stringify(data) }], structuredContent: data }));
```

### 3. Tool schemas: correcciones

- **Errores:** se devuelven con `isError: true` dentro del resultado (spec MCP), no lanzando excepciones. Así el agente lee el error y se recupera. Ver `fail()` en `lib/mcp/util.ts`.
- **`structuredContent` + texto JSON:** clientes viejos leen el texto y los nuevos el objeto.
- **`annotations`:** `readOnlyHint: true` en los 4 tools de lectura. Algunos clientes los ejecutan sin pedir permiso y la demo fluye.
- **`business_id` acepta UUID o slug.** Los LLMs a veces mandan `"la-trattoria-di-roma"` en lugar del uuid. Eso evita fallas tontas en la demo.
- `check_availability`: `date` ahora es opcional (default: hoy en Monterrey) y valida los formatos con regex.
- `contact_agent`: el PRD tenía `context: object`, que es libre y difícil para los LLMs. Ahora tiene campos planos tipados (`customer_name`, `date`, `time`, `party_size`, `items[]`). Se eliminó `check_specific_availability` porque ya existe `check_availability`. Se agregó `book_appointment` (clínicas y salones).
- **Antes del LLM hay un check duro de disponibilidad.** El modelo nunca puede "confirmar" una reserva en un horario cerrado o lleno.
- **Tool nuevo `list_categories`:** le da al agente el vocabulario real (categorías y capabilities con conteos). Es barato y hace que los filtros funcionen.

### 4. eve: `defineMcpClientConnection`

Confirmado en eve.dev/docs/connections/mcp:
- Import: `import { defineMcpClientConnection } from "eve/connections"`.
- `url` acepta **Streamable HTTP o SSE**, así que no hace falta nada especial.
- `description` es **obligatorio**. Opcionales: `headers`, `auth`, `tools.allow/block`, `approval`.
- El nombre del archivo es el nombre de la conexión: `agent/connections/agentready.ts` → `agentready`. Los tools aparecen como `agentready__search_businesses`, y el modelo los usa vía `connection_search` / `connection_execute`.
- El modelo se configura en `agent/agent.ts` (o con `--model` en `init`). Arranca con `npm run dev`, que abre una **TUI en la terminal**.
- **Recomendación:** pon el agente eve en un **directorio separado** (`agent-ready-eve/`, creado con `npx eve@latest init`) y úsalo **localmente** apuntando a la URL pública de Vercel. Embeberlo en el Next.js (`eve/next`) o desplegarlo como servicio aparte es riesgo innecesario hoy.

### 5. AI SDK 7

- `embed` / `embedMany`: ✅ correctos. `model: "openai/text-embedding-3-small"` (string) pasa por AI Gateway automáticamente y da 1536 dims, que encaja con `vector(1536)`.
- `generateObject`: la API recomendada hoy es **`generateText({ output: Output.object({ schema }) })`** y se lee `const { output } = ...`. Ya está aplicado.
- IDs de modelo verificados hoy en `ai-gateway.vercel.sh/v1/models`: `anthropic/claude-sonnet-5.5`, `anthropic/claude-haiku-4.5`, `google/gemini-3.8-flash` y `openai/text-embedding-3-small`. **`gpt-6-astra` y `claude-sonnet-4` del PRD no deben usarse.**
- Para structured output, usa `.nullable()` en vez de `.optional()` y arrays en vez de `z.record`. Funciona igual en todos los providers.

### 6. Pipeline de onboarding: lo que faltaba

- Validación del body con zod (mínimo 40 caracteres) y API key opcional (`ONBOARD_API_KEY`). Es un endpoint público que gasta tus créditos.
- **Geocoding:** el LLM no geocodifica bien. Si no hay coordenadas explícitas, usa el centro de Monterrey y devuelve `location_approximate: true`. Es honesto y no rompe PostGIS.
- Slug único: `slugify(name)` + sufijo aleatorio, así no truena el `UNIQUE`.
- Si falla el embedding, el negocio igual se guarda y queda buscable por keyword (fallback del RPC).
- Si falla el insert del menú, se loguea y no tumba el onboarding completo.
- Horarios: el LLM los devuelve como array `{day, open, close}` (más robusto que `record`) y se convierten al formato JSONB.
- **Multimodal (bonus Gemini):** foto del menú → items, usando `google/gemini-3.8-flash`.

### Otros puntos que iban a explotar

- **Logging en serverless:** un `insert` "fire-and-forget" puede morir cuando la función responde. Aquí se hace `await` (~20-50 ms) dentro de `try/catch`.
- **Identificar al agente** para el dashboard: `AsyncLocalStorage` toma `x-agent-name` o el `User-Agent` del request.
- **`/.well-known/ard.json`** va como archivo estático en `public/.well-known/` (verificado: responde 200). Hay que reemplazar `REPLACE_WITH_DOMAIN` después del primer deploy.
- **Next 16 trae un `AGENTS.md`** que avisa a los agentes de código que la API cambió. Composer lo leerá; está bien.

---

# PARTE 2: Mejoras de arquitectura (ya incluidas)

1. **Un RPC híbrido en lugar de 4 queries.** Es más simple, más rápido y es *el* momento "wow" para Ant y Paul: "semantic + keyword + geo + filtros en una sola función Postgres".
2. **Tabla `reservations` + Realtime.** Cierra el loop: el agente reserva → la fila aparece en vivo en el dashboard → `check_availability` refleja la capacidad. Pasa de "simulado" a "estado real en Supabase".
3. **Dashboard = home page.** No hay `/dashboard` aparte: `/` muestra cómo conectar el agente, los tools, el feed en vivo y las reservas. Es una sola pantalla para el video.
4. **Lógica de horarios en TS, compartida.** Un solo lugar, testeable y con timezone correcto.
5. **Validación antes del LLM** en `contact_agent`. El LLM redacta y estructura; la verdad (disponibilidad, menú) sale de la DB.
6. **Claude Code como cliente de respaldo.** Si eve se complica, `claude mcp add --transport http agentready <url>` da el mismo demo en 30 segundos y, de paso, suma para el juez de Anthropic.

**Fuera de alcance** (no lo toques): auth de negocios, CRUD, A2A server, registry submission y geocoding real.

---

# PARTE 3: Plan de build para Opus (orquestador) + subagentes Composer 2.5

## Cómo usarlo

1. Abre el repo en Cursor con **Opus como agente principal**.
2. Pega el **PROMPT MAESTRO** (abajo). Opus lee este playbook, crea `BUILD_LOG.md` y despacha cada **Task Card** a un subagente **Composer 2.5**, pasándole el texto de la card **completo y literal**.
3. Las cards marcadas 🧑 son pasos tuyos: Opus se detiene y te pide hacerlos.
4. Si tu Cursor no permite subagentes, pega cada card directamente en Composer, en orden. Cada card es autocontenida.

## PROMPT MAESTRO (pegar en Opus)

```
Eres el orquestador del build de "AgentReady" para un hackathon con deadline duro (00:30 UTC).
Tu fuente de verdad es docs/playbook/PLAYBOOK.md (sección "TASK CARDS") y la implementación
de referencia verificada en docs/playbook/reference/.

REGLAS:
1. Crea BUILD_LOG.md en la raíz con una tabla: | Task | Estado (todo/doing/done/blocked) | Verificación | Notas |.
   Actualízalo ANTES y DESPUÉS de cada task. Es la memoria compartida del build.
2. Ejecuta las task cards en el orden indicado. Para cada card de tipo 🤖, lanza un subagente
   Composer 2.5 con el texto COMPLETO de la card (no lo resumas). Puedes lanzar en paralelo
   las cards del mismo "grupo paralelo".
3. Las cards 🧑 son acciones humanas: detente, dime exactamente qué hacer y espera mi "listo".
4. Después de cada card, corre TÚ su sección "Verificar". Si falla, manda al subagente el error
   exacto y la card de nuevo (máximo 2 reintentos); si sigue fallando, márcala blocked, explica
   por qué en BUILD_LOG.md y continúa con la siguiente card que no dependa de ella.
5. NUNCA reescribas desde cero un archivo de reference/ "porque se ve mejor". La referencia ya
   pasó tsc, next build y un handshake MCP real. Solo se modifica para arreglar un error observado.
6. NUNCA hagas commit de .env.local ni de keys. Haz commit + push después de T3, T6, T8 y T10
   (mensajes cortos en inglés).
7. Prioridad si se acaba el tiempo: T0–T6 (P0) > T7–T8 (P1) > T9+ (bonus). A las 23:45 UTC
   detén todo lo que no sea P0 y avísame para grabar el video.

Empieza: lee el playbook, crea BUILD_LOG.md con todas las cards en "todo" y arranca con T0.
```

## TASK CARDS

Leyenda: 🤖 = subagente Composer · 🧑 = humano · ⏱ = minutos estimados · ⛓ = dependencias · ∥ = grupo paralelo

---

### T0 🤖 Scaffold del proyecto ⏱10 ⛓ ninguna
```
Objetivo: crear el proyecto Next.js con dependencias exactas.

1. En la carpeta del repo (vacía salvo docs/), ejecuta:
   npx -y create-next-app@latest . --ts --tailwind --app --eslint --no-src-dir --import-alias "@/*" --use-npm --yes
   (Si la carpeta no está vacía, crea en ./tmp-app y mueve el contenido a la raíz.)
2. Instala dependencias EXACTAS:
   npm i @supabase/supabase-js ai mcp-handler @modelcontextprotocol/server zod
   npm i -D tsx
   IMPORTANTE: el paquete es @modelcontextprotocol/server (v2), NO @modelcontextprotocol/sdk.
3. Asegura que docs/playbook/ exista (contiene PLAYBOOK.md, schema.sql, seed-data.json, reference/).
4. En package.json agrega el script: "seed": "tsx --env-file=.env.local scripts/seed.ts"
5. Crea .env.local con estas claves vacías (el humano las llena) y verifica que .gitignore incluya .env*:
   NEXT_PUBLIC_SUPABASE_URL=
   NEXT_PUBLIC_SUPABASE_ANON_KEY=
   SUPABASE_SERVICE_ROLE_KEY=
   AI_GATEWAY_API_KEY=
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ONBOARD_API_KEY=
6. Copia supabase schema: docs/playbook/schema.sql → supabase/schema.sql

Verificar: `npm ls mcp-handler @modelcontextprotocol/server ai zod` sin errores; `npx next build` OK.
```

### T1 🧑 Supabase + env ⏱5 ⛓ T0
Corre `schema.sql` en el SQL Editor (si no lo hiciste en el checklist) y llena `.env.local`.
**Verificar:** `select public.business_vocabulary();` responde sin error.

### T2 🤖 Librerías base ∥A ⏱5 ⛓ T0
```
Objetivo: crear las librerías compartidas. COPIA EXACTAMENTE (byte a byte) estos archivos de
docs/playbook/reference/ a la misma ruta en la raíz del proyecto:
  lib/supabase.ts         — clientes admin (service role) y browser (anon)
  lib/ai.ts               — IDs de modelos vía Vercel AI Gateway
  lib/hours.ts            — lógica de horarios con timezone America/Monterrey
  lib/embedding-text.ts   — texto que se embebe para búsqueda semántica
  lib/request-context.ts  — AsyncLocalStorage para identificar al agente que llama
  lib/availability.ts     — horarios + capacidad - reservas
No cambies imports ni nombres. Usan alias "@/".
Verificar: npx tsc --noEmit sin errores.
```

### T3 🤖 Seed ∥A ⏱10 ⛓ T0, T1, T2
```
Objetivo: poblar Supabase con 15 negocios y sus embeddings.
1. Copia docs/playbook/seed-data.json → data/seed-data.json
2. Copia docs/playbook/reference/scripts/seed.ts → scripts/seed.ts (exacto).
3. Ejecuta: npm run seed
   Debe imprimir "✓ <negocio> (N items)" 15 veces y al final "Done: {...total_businesses: 15...}".
Si falla:
 - "Missing ..." → falta una variable en .env.local: detente y pídela al humano.
 - error de AI Gateway 401/403 → la AI_GATEWAY_API_KEY es inválida o no hay créditos: pídela al humano.
 - error de columna/tabla → el schema no se corrió: pide al humano correr supabase/schema.sql.
Verificar: en el SQL Editor (o vía supabase-js) `select count(*) from businesses where embedding is not null` = 15
y `select count(*) from menu_items` = 94.
```

### T4 🤖 MCP server ∥B ⏱10 ⛓ T2
```
Objetivo: el endpoint MCP (Streamable HTTP) con 6 tools.
COPIA EXACTAMENTE desde docs/playbook/reference/:
  lib/mcp/util.ts                       — ok()/fail()/logged() (log a agent_queries) / idOrSlug()
  lib/mcp/tools/search-businesses.ts    — RPC híbrido search_businesses (pgvector+fts+PostGIS)
  lib/mcp/tools/get-business.ts
  lib/mcp/tools/get-menu.ts
  lib/mcp/tools/check-availability.ts
  lib/mcp/tools/contact-agent.ts        — agente del negocio (Claude vía AI Gateway) + insert en reservations
  lib/mcp/tools/list-categories.ts
  lib/mcp/register.ts
  app/api/mcp/route.ts
  app/api/health/route.ts
Notas de API (no las "corrijas"):
 - mcp-handler 2.x: createMcpHandler(initFn, { serverInfo, instructions }); export GET/POST/DELETE.
 - registerTool usa inputSchema: z.object({...}) (SDK v2), no un raw shape.
 - Structured output en AI SDK 7: generateText({ output: Output.object({ schema }) }) → { output }.
Verificar: npx tsc --noEmit OK; luego T5.
```

### T5 🤖 Smoke test local del MCP ⏱10 ⛓ T3, T4
```
Objetivo: probar todos los tools contra Supabase real.
1. npm run dev (en background) y espera "Ready".
2. Copia docs/playbook/reference/scripts/mcp-call.sh → scripts/mcp-call.sh y chmod +x
   (uso: scripts/mcp-call.sh <url> list   |   scripts/mcp-call.sh <url> <tool> '<json-args>')
3. Ejecuta y revisa cada salida:
   scripts/mcp-call.sh http://localhost:3000/api/mcp list                       → 6 tools
   scripts/mcp-call.sh http://localhost:3000/api/mcp search_businesses '{"query":"romantic italian dinner with wine"}'
        → primer resultado: La Trattoria di Roma, search_mode "hybrid_semantic"
   scripts/mcp-call.sh http://localhost:3000/api/mcp search_businesses '{"query":"tacos","lat":25.6866,"lng":-100.3161,"radius_km":5}'
        → incluye Tacos El Paisa con distance_km
   scripts/mcp-call.sh http://localhost:3000/api/mcp get_menu '{"business_id":"la-trattoria-di-roma","dietary":["vegetarian"]}'
   scripts/mcp-call.sh http://localhost:3000/api/mcp check_availability '{"business_id":"la-trattoria-di-roma","time":"21:00","party_size":4}'
   scripts/mcp-call.sh http://localhost:3000/api/mcp contact_agent '{"business_id":"la-trattoria-di-roma","action":"make_reservation","message":"Table for 4 tonight, anniversary","time":"21:00","party_size":4,"customer_name":"Daniel"}'
        → outcome "confirmed" + confirmation_code (si hoy la hora ya pasó en Monterrey, usa una más tarde o date de mañana)
   scripts/mcp-call.sh http://localhost:3000/api/mcp list_categories
   curl -s localhost:3000/api/health → businesses 15, agent_queries > 0, reservations ≥ 1
4. Si search devuelve vacío o error de RPC: copia el mensaje exacto en BUILD_LOG.md. Errores típicos:
   "function search_businesses ... does not exist" → schema no corrido o firma distinta: re-correr schema.sql y npm run seed.
Verificar: todos los comandos devuelven JSON sin "isError":true (salvo casos esperados).
```

### T6 🧑+🤖 Deploy a Vercel ⏱15 ⛓ T5
1. 🤖 `git add -A && git commit -m "MCP server + schema + seed" && git push` (verifica que `.env.local` **no** está en el commit).
2. 🧑 Vercel → Add New Project → importa el repo → agrega **todas** las env vars → Deploy.
3. 🧑 Ya con el dominio: actualiza `NEXT_PUBLIC_APP_URL` en Vercel y redeploy.
4. 🤖 Reemplaza `REPLACE_WITH_DOMAIN` en `public/.well-known/ard.json` y `public/agents.json` (copia ambos de reference primero) → commit → push.

**Verificar:** `scripts/mcp-call.sh https://<dominio>/api/mcp list` → 6 tools. `curl https://<dominio>/api/health` → ok.
**✅ Hito P0: tu MCP es público. Prueba ya con Claude Code:** `claude mcp add --transport http agentready https://<dominio>/api/mcp`. Luego pregunta: *"Find me a romantic Italian place in Monterrey for 4 tonight at 9pm and book it under Daniel"*.

### T7 🤖 Dashboard en vivo ∥C ⏱10 ⛓ T4
```
COPIA EXACTAMENTE desde docs/playbook/reference/:
  app/live-feed.tsx  — client component: Supabase Realtime (postgres_changes INSERT) en agent_queries y reservations
  app/page.tsx       — home: endpoint MCP, snippets de conexión, tools y LiveFeed
Puedes ajustar app/layout.tsx: title "AgentReady — local businesses for AI agents", <body className="bg-zinc-50">.
Verificar: npm run dev → abre / → "● Realtime connected"; en otra terminal corre
scripts/mcp-call.sh ... search_businesses '{"query":"vegan food"}' → aparece una fila nueva SIN recargar.
Si no aparece: confirma que schema.sql corrió el bloque "alter publication supabase_realtime add table ..." y la policy "public read queries".
```

### T8 🤖 Onboarding (texto → perfil) ∥C ⏱10 ⛓ T2
```
COPIA EXACTAMENTE desde docs/playbook/reference/:
  lib/onboard.ts            — generateText+Output.object (Claude) → perfil; foto opcional → items (Gemini); embed; insert
  app/api/onboard/route.ts  — POST {document, image_base64?, image_media_type?}, header x-api-key si ONBOARD_API_KEY está definido
  app/onboard/page.tsx      — formulario con ejemplo precargado
Verificar: npm run dev → /onboard → "Make it agent-ready" → JSON con business_id, menu_items_created ≥ 4.
Luego: scripts/mcp-call.sh ... search_businesses '{"query":"tortas de milanesa"}' → aparece "Tortas La Abuela".
Commit + push.
```

### T9 🧑 Agente eve ⏱15 ⛓ T6, Node 24
Hazlo en una terminal aparte, **fuera** del repo de Next:
```bash
node -v                                   # debe ser >= 24
npx eve@latest init agent-ready-eve --model anthropic/claude-sonnet-5.5
cd agent-ready-eve
cp <repo>/docs/playbook/reference/eve-agent/agent/instructions.md agent/instructions.md
mkdir -p agent/connections
cp <repo>/docs/playbook/reference/eve-agent/agent/connections/agentready.ts agent/connections/
echo "MCP_SERVER_URL=https://<dominio>/api/mcp" >> .env   # o reemplaza REPLACE_WITH_DOMAIN en el archivo
npx eve info                              # debe listar la conexión "agentready"
npm run dev                               # TUI → prueba el guion de la demo
```
Si `init` pide una cuenta de Vercel o AI Gateway, usa el mismo team donde redimiste créditos. Si eve se traba más de 15 minutos, **corta**: la demo se hace con Claude Code (T6) y eve se menciona como "también compatible".

### T10 🤖 README + submission ⏱10 ⛓ T6
```
Crea README.md con: qué es (2 líneas), URL del MCP, cómo conectar (Claude Code, Cursor mcp.json, eve connection),
tabla de los 6 tools, arquitectura (diagrama ASCII: Agent → Vercel /api/mcp → AI Gateway (embeddings, Claude, Gemini) → Supabase
[pgvector HNSW + tsvector + PostGIS + Realtime + RLS]), cómo correr local (env vars, schema.sql, npm run seed, npm run dev),
y "Built with": Supabase, Vercel (Next.js, Functions, AI Gateway, AI SDK 7, eve), Claude, Gemini, Cursor.
Commit + push.
```

### T11+ Bonus (ver Parte 6). Solo si T0–T8 están `done` antes de las 23:15 UTC.

### Timeline sugerido (UTC)

| Hora | Cards |
|---|---|
| 21:00–21:15 | Checklist + T0, T1 |
| 21:15–21:45 | T2 ∥ T4, luego T3 y T5 |
| 21:45–22:05 | T6 (deploy) → probar con Claude Code |
| 22:05–22:30 | T7 ∥ T8 |
| 22:30–22:50 | T9 (eve) |
| 22:50–23:20 | Bonus (Stripe deposit, Gemini ya incluido) + T10 |
| 23:20–00:05 | **Video** |
| 00:05–00:20 | **Submit** (no esperes al último minuto) |

---

# PARTE 4: Seed data

`seed-data.json` trae 15 negocios ficticios ubicados en colonias reales del área metropolitana de Monterrey: Centro, Barrio Antiguo, Del Valle y Valle Oriente (San Pedro), Obispado, Cumbres, Contry, Fundidora, Mitras, Tecnológico, Vista Hermosa y Doctores.
- **9 con agente** (Trattoria, Sushi Zen, Dental Smile, Estética Luna, Hotel Sierra Vista, Veterinaria San Jorge, Contaduría Rodríguez, Dr. García y CoWork MTY) y **6 sin agente**.
- 94 items con precios en MXN, etiquetas dietéticas (`vegetarian`/`vegan`/`gluten_free`), duraciones y `requires_appointment`.
- Horarios realistas, incluidos cierres después de medianoche (Tacos El Paisa) y 24 h (hotel, veterinaria). **La Trattoria abre el sábado de 13:00 a 23:59**: la demo de "cena esta noche" funciona hoy.
- Teléfonos en el rango ficticio `81 5550 xxxx` y emails/webs en `example.com`. No hay datos personales reales (regla del hackathon).
- Las coordenadas son aproximadas a nivel colonia. `city = "Monterrey"` para todos (zona metro); el municipio real va en `address`/`neighborhood`, así que buscar "San Pedro" funciona vía `p_city`.

Se importa con `npm run seed` (T3). El script es idempotente: hace upsert por slug y reemplaza menús.

---

# PARTE 6: Bonus categories

| Categoría | Qué implementar | Esfuerzo | ¿Vale la pena? |
|---|---|---|---|
| **Vercel** | Ya está: Next.js 16, Functions, `mcp-handler`, AI Gateway (3 providers: OpenAI embeddings, Anthropic, Google), AI SDK 7 y eve. En el video muestra **AI Gateway → Usage** con los 3 providers y el agente eve. | 0 min + 1 toma del video | ✅ Alta probabilidad |
| **Claude** | Ya está: Claude Sonnet 5.5 es el "cerebro" de **cada negocio** (`contact_agent`, agent-to-agent) y del onboarding. **Haz la demo con Claude Code como cliente MCP**: Claude-agente hablando con Claude-negocio. Menciona el detalle de diseño: Claude redacta, pero la DB decide la disponibilidad. | 0 min (+2 min si haces la demo en Claude Code) | ✅ |
| **Gemini multimodal** | Ya está en `lib/onboard.ts`: foto del menú → items con `google/gemini-3.8-flash`. Para que se note: toma una foto de cualquier menú impreso o pizarrón del venue, súbela en `/onboard` y muestra cómo aparecen los items + `menu_source: "image"`. | 5 min de prueba + toma de video | ✅ Diferenciador barato |
| **Stripe** | **Depósito para reservas, iniciado por el agente.** `contact_agent` crea un Stripe Checkout (test mode, MXN) al confirmar una reserva y devuelve `payment_url` al agente → el usuario paga. Ver T11 abajo. | 25 min | 🟡 Solo si P0+P1 están listos antes de 23:15. Le habla directo al juez de Stripe ("agentic commerce para negocios locales") |
| **Codex** | Construiste con Cursor/Composer, no con Codex. Hacerlo artificialmente no suma. | — | ❌ Skip (sé honesto en el form) |

### T11 🤖 (bonus Stripe) Depósito vía Stripe Checkout ⏱25 ⛓ T5
```
1. npm i stripe
2. Copia docs/playbook/reference/lib/stripe.ts → lib/stripe.ts (exacto; devuelve null si no hay STRIPE_SECRET_KEY).
3. En lib/mcp/tools/contact-agent.ts, justo después del insert exitoso en "reservations" (dentro del if confirmation_code),
   agrega:
     let payment_url: string | null = null;
     if (args.action === "make_reservation" && (args.party_size ?? 0) >= 4) {
       try {
         payment_url = await createDepositLink({ businessName: b.name, confirmationCode: confirmation_code, amountMxn: 100 * (args.party_size ?? 1) });
         if (payment_url) await db.from("reservations").update({ payment_url }).eq("confirmation_code", confirmation_code);
       } catch (e) { console.error("[stripe]", e); }
     }
   Declara `payment_url` fuera del if para poder devolverla, e inclúyela en el ok({...}) final como
   payment_url y deposit_note: payment_url ? "Deposit of $100 MXN per guest required to hold tables of 4+. Share this link with the user." : undefined
   Import: import { createDepositLink } from "@/lib/stripe";
4. 🧑 Agrega STRIPE_SECRET_KEY (sk_test_...) en .env.local y en Vercel.
Verificar: T5 contact_agent con party_size 4 → payment_url https://checkout.stripe.com/...; ábrela y paga con 4242 4242 4242 4242.
```

---

# Guion del video (≤3 min). Grábalo en 1080p con QuickTime y voz en inglés

1. **0:00–0:15, hook.** "Agents can buy on Shopify and pay for APIs. Ask one to book dinner in Monterrey and it gives up: local businesses are invisible to agents. AgentReady fixes that."
2. **0:15–0:35, conexión.** Muestra la home con la URL del MCP y luego `claude mcp add ...` (o eve `agent/connections/agentready.ts`). "One line, any MCP agent."
3. **0:35–1:40, demo** en Claude Code o la TUI de eve, **con el dashboard visible en la otra mitad de la pantalla** (las filas entran en vivo):
   - "Find a romantic Italian place in Monterrey for our anniversary tonight, 4 people." → `search_businesses`
   - "Do they have vegetarian pasta? Under 350 pesos." → `get_menu` con filtros
   - "Book 9pm under Daniel." → `check_availability` → `contact_agent` → **confirmation code**, que aparece en "Bookings made by agents" en tiempo real.
   - (Contraste) "Find tacos open now near Macroplaza." → resultado con distancia; no tiene agente → el agente da el WhatsApp.
4. **1:40–2:10, onboarding.** `/onboard`: pega el texto, sube la foto del menú (Gemini) → la tortería queda buscable segundos después.
5. **2:10–2:40, bajo el capó.** SQL Editor con la función `search_businesses` (pgvector + tsvector + PostGIS en una query) → Supabase Table editor con `reservations` → Vercel AI Gateway usage.
6. **2:40–3:00, visión.** "Bot247 already digitizes thousands of Mexican SMBs. AgentReady makes every one of them agent-ready. `/.well-known/ard.json` lets any registry index us."

**Tips:** graba la demo en cuanto T6 funcione, aunque el resto no esté (es tu video de respaldo). Corta los silencios de espera del LLM.

# Submission (campos que cambian vs HACKATHON-overview)
- **Demo URL:** `https://<dominio>` · **Demo Notes:** `claude mcp add --transport http agentready https://<dominio>/api/mcp`, o el snippet de mcp.json.
- **Description:** agrega una línea técnica: *"Hybrid search in a single Postgres function (pgvector HNSW + full-text + PostGIS), agent-to-agent bookings persisted in Supabase and streamed live via Realtime, served over MCP Streamable HTTP from Vercel Functions."*
- **Coding tools:** Cursor (Composer 2.5 + Opus orchestration), Claude Code.
