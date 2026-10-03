# 📋 PRD Draft — AgentReady: Business Discovery MCP Server

**Versión:** 0.2 (Draft para revisión por LLM avanzado)  
**Fecha:** 3 de Octubre, 2026  
**Autor:** Daniel Parra  
**Contexto:** Supabase Select 2026 Hackathon — "BUILD SOMETHING AGENTS WANT"  
**Tiempo de build:** ~4 horas

---

## 0. Prerequisitos — Todo lo que necesitas antes de empezar

### Cuentas necesarias

| Cuenta | URL | Para qué | Gratis/Pagado |
|---|---|---|---|
| **Vercel** | https://vercel.com | Hosting de la app Next.js, AI Gateway, eve agent | Pro trial con código del hackathon |
| **Supabase** | https://supabase.com | Base de datos PostgreSQL con pgvector y PostGIS | Free tier suficiente para hackathon |
| **GitHub** | https://github.com | Repositorio del código, deploy automático a Vercel | Gratis |

### Créditos y códigos del hackathon

| Recurso | Cómo obtenerlo |
|---|---|
| **Vercel Pro Trial + AI Gateway Credits** | Ir a [credits.vercel.sh](https://credits.vercel.sh/) → usar código `SUPASELE-4T9F-SM6E` con tu Vercel Team ID |
| **Vercel Team ID** | En Vercel dashboard → Settings → General → "Team ID" (empieza con `team_`) |

### Software que debe estar instalado en tu computadora

| Software | Versión mínima | Cómo verificar | Cómo instalar |
|---|---|---|---|
| **Node.js** | v24+ (eve lo requiere) | `node --version` | https://nodejs.org o `brew install node` |
| **npm** | Viene con Node.js | `npm --version` | Viene con Node.js |
| **Git** | Cualquier versión reciente | `git --version` | `brew install git` o https://git-scm.com |
| **Cursor** | Última versión | Ya lo tienes | https://cursor.com |
| **Vercel CLI** (opcional) | Última | `npx vercel --version` | `npm i -g vercel` |

### Variables de entorno que necesitarás

```bash
# Vercel AI Gateway (obtienes del dashboard de Vercel)
AI_GATEWAY_API_KEY=your_vercel_ai_gateway_key

# Supabase (obtienes al crear el proyecto de Supabase)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIs...

# URL de tu app (se genera al hacer deploy en Vercel)
MCP_SERVER_URL=https://agent-ready.vercel.app/api/mcp
NEXT_PUBLIC_APP_URL=https://agent-ready.vercel.app
```

### Setup paso a paso (los primeros 15 minutos del hackathon)

```
PASO 1: Redimir créditos de Vercel
  → Ir a credits.vercel.sh
  → Ingresar tu email, Team ID, y código SUPASELE-4T9F-SM6E
  → Click "Redeem Code"

PASO 2: Crear proyecto Supabase
  → Ir a supabase.com/dashboard → New Project
  → Nombre: "agent-ready"
  → Región: us-west-1 (más cercana a SF)
  → Guardar la URL y las keys (anon key + service role key)

PASO 3: Crear el proyecto Next.js
  → En terminal:
     npx create-next-app@latest agent-ready --typescript --tailwind --app --use-npm
  → cd agent-ready

PASO 4: Instalar dependencias
  → npm install @supabase/supabase-js ai @ai-sdk/openai @modelcontextprotocol/sdk zod

PASO 5: Crear repo en GitHub y conectar a Vercel
  → git init && git add . && git commit -m "init"
  → Crear repo en GitHub
  → git remote add origin https://github.com/TU_USER/agent-ready.git
  → git push -u origin main
  → En Vercel dashboard: "Add New Project" → importar desde GitHub
  → Agregar las variables de entorno
  → Deploy

PASO 6: Configurar Supabase
  → En Supabase SQL Editor: correr el schema SQL (sección 3.3 de este PRD)
  → Habilitar extensiones: pgvector y PostGIS

PASO 7: Seed data
  → Correr el seed script para insertar los 15 negocios de ejemplo
```

---

## 0.1 ¿Dónde vive cada pieza? (Supabase vs Vercel)

### Separación clara de responsabilidades

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│                         VERCEL                                      │
│                    (aplicación + lógica)                             │
│                                                                     │
│   Todo el CÓDIGO vive aquí:                                         │
│                                                                     │
│   • Next.js App (frontend + API routes)                             │
│   • MCP Server endpoint (/api/mcp/route.ts)                        │
│   • Onboarding endpoint (/api/onboard/route.ts)                    │
│   • Eve agent (agent/ folder)                                       │
│   • AI Gateway calls (embeddings, structured extraction, agent)     │
│   • Dashboard UI (React components)                                 │
│   • Static files (/.well-known/ard.json, /agents.json)             │
│                                                                     │
│   Vercel NO almacena datos. Solo ejecuta código.                    │
│                                                                     │
└─────────────────────────────┬───────────────────────────────────────┘
                              │
                    Lee y escribe datos via
                    Supabase JS client (HTTPS)
                              │
┌─────────────────────────────┴───────────────────────────────────────┐
│                                                                     │
│                        SUPABASE                                     │
│                    (datos + búsqueda)                                │
│                                                                     │
│   Toda la DATA vive aquí:                                           │
│                                                                     │
│   • PostgreSQL database                                             │
│     ├── businesses (tabla principal de negocios)                     │
│     ├── menu_items (productos/servicios de cada negocio)            │
│     └── agent_queries (log de queries de agentes)                   │
│                                                                     │
│   • pgvector extension (búsqueda semántica por embeddings)          │
│   • PostGIS extension (búsqueda geoespacial por coordenadas)       │
│   • SQL Functions (nearby_businesses, match_businesses, is_open_now)│
│   • Realtime (stream de agent_queries para dashboard live)          │
│                                                                     │
│   Supabase NO ejecuta lógica de negocio. Solo almacena y busca.    │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Ejemplo concreto de un request

```
1. AGENTE llama: search_businesses("Italian restaurant in Monterrey")
       │
       ▼
2. VERCEL recibe el request en /api/mcp (Vercel Function)
       │
       ├── 3a. VERCEL llama AI Gateway → genera embedding del query
       │         (AI Gateway está en Vercel, modelo en la nube del provider)
       │
       ├── 3b. VERCEL llama Supabase → match_businesses(embedding)
       │         (Supabase ejecuta la búsqueda pgvector en PostgreSQL)
       │
       ├── 3c. VERCEL llama Supabase → filtra por city, capabilities, etc.
       │         (Supabase ejecuta SQL con WHERE clauses)
       │
       ├── 3d. VERCEL llama Supabase → nearby_businesses(lat, lng)
       │         (Supabase ejecuta PostGIS ST_DWithin)
       │
       ├── 4. VERCEL combina resultados, rankea, formatea
       │
       ├── 5. VERCEL inserta log en Supabase → agent_queries
       │
       └── 6. VERCEL retorna JSON estructurado al agente
```

**En resumen:**
- **Vercel = el cerebro** (recibe requests, orquesta, llama AI, formatea responses)
- **Supabase = la memoria** (almacena datos, ejecuta búsquedas, emite eventos realtime)

---

## 0.2 ¿Cómo encuentran los agentes este MCP Server?

### La pregunta fundamental: ¿Cómo sabe un agente que este MCP server existe?

**Respuesta honesta:** Hoy, un agente NO descubre mágicamente MCP servers. Alguien tiene que configurar la conexión. Esto es cierto para TODOS los MCP servers — incluso los de Shopify, GitHub, o Stripe.

### Los 5 canales de descubrimiento (de más práctico a más visionario)

#### Canal 1: Configuración manual (cómo funciona HOY — 100% de los casos)

Un humano agrega la URL del MCP server a la configuración de su agente:

**Claude Desktop** (`claude_desktop_config.json`):
```json
{
  "mcpServers": {
    "agentready": {
      "url": "https://agent-ready.vercel.app/api/mcp",
      "description": "Discover local businesses in Mexico"
    }
  }
}
```

**Cursor** (Settings → MCP):
```json
{
  "mcpServers": {
    "agentready": {
      "url": "https://agent-ready.vercel.app/api/mcp"
    }
  }
}
```

**Eve agent** (connection file):
```typescript
export default defineMcpClientConnection({
  url: "https://agent-ready.vercel.app/api/mcp",
  description: "Bot247 Business Discovery"
});
```

**Esto es exactamente como funcionan Shopify Catalog MCP, GitHub MCP, Stripe MCP, y todos los demás.** Un humano configura la conexión una vez, y el agente puede usarla siempre.

#### Canal 2: MCP Registry (registro público oficial)

Podemos registrar nuestro server en el [MCP Registry oficial](https://registry.modelcontextprotocol.io) para que aparezca en directorios públicos como Smithery, Glama, PulseMCP, etc.

Esto requiere:
1. Crear un `server.json` con metadata del server
2. Verificar namespace ownership (DNS o GitHub)
3. Submit al registry

**Resultado:** Cualquier persona buscando "business discovery" en un directorio de MCP servers nos encuentra y puede configurar su agente para conectarse.

#### Canal 3: `/.well-known/ard.json` (standard de discovery emergente)

Publicamos un archivo ARD en nuestro dominio para que registries y crawlers puedan indexarnos automáticamente:

```
https://agent-ready.vercel.app/.well-known/ard.json
```

Cualquier servicio de discovery compatible con ARD (como AGNTCY Directory) puede crawlear este archivo e indexar nuestro MCP server.

#### Canal 4: `/agents.json` (capability declaration)

Publicamos qué protocolos soportamos y qué capabilities ofrecemos:

```
https://agent-ready.vercel.app/agents.json
```

Agentes que sigan el estándar agents.txt/agents.json pueden descubrir qué pueden hacer en nuestro sitio.

#### Canal 5: Bot247 distribución (visión a futuro)

Cada negocio en Bot247 tendría en su microsite:
```
https://mi-negocio.bot247.mx/.well-known/ard.json
```
que apunta al MCP server de AgentReady. Así, si un agente llega al sitio del negocio, descubre que puede interactuar via MCP.

### ¿Qué aplica para el hackathon?

| Canal | ¿Lo implementamos? | Esfuerzo | Impacto en demo |
|---|---|---|---|
| **Manual config** | ✅ Sí (eve connection pre-configurada) | 0 min | El demo funciona |
| **ARD manifest** | ✅ Sí (un archivo JSON estático) | 5 min | Muestra standards compliance |
| **agents.json** | ✅ Sí (un archivo JSON estático) | 5 min | Muestra standards compliance |
| **MCP Registry** | ❌ No (proceso de review tarda) | N/A | No para el hackathon |
| **Bot247 distribución** | ❌ No (requiere Bot247 integration) | N/A | Mencionarlo en el pitch |

### La realidad del ecosistema MCP en 2026

```
¿CÓMO ENCUENTRA UN AGENTE UN MCP SERVER HOY?

  90% → Un humano lo configura manualmente
   5% → El agente ya viene con connections pre-configuradas (ej: Cursor tiene servers built-in)
   3% → Un directorio/registry lo lista y el humano lo instala
   2% → Discovery automático (ARD, agents.json — muy nuevo, poca adopción)
```

**Nuestro MCP server se descubre igual que cualquier otro.** La diferencia no es HOW se descubre, sino WHAT ofrece — nadie más ofrece business discovery para negocios locales.

---

## 1. Problem Statement

### El problema que resolvemos

Los AI agents en 2026 pueden:
- ✅ Buscar y comprar productos en Shopify (via UCP/Catalog MCP)
- ✅ Pagar por APIs y servicios (via x402, 24K+ servicios indexados)
- ✅ Comunicarse con otros agentes (via A2A protocol)
- ✅ Usar herramientas (via MCP)
- ✅ Hacer checkout en tiendas aprobadas (via ACP/OpenAI+Stripe)

Pero **NO pueden:**
- ❌ Encontrar un restaurante local y hacer una reservación
- ❌ Descubrir una clínica dental cercana y agendar cita
- ❌ Buscar un plomero disponible hoy en su zona
- ❌ Consultar el menú y precios de una taquería
- ❌ Verificar horarios de un negocio local en tiempo real

**¿Por qué?** Porque los negocios locales y SMBs no tienen representación machine-readable. Su información está dispersa en websites, Google Maps, redes sociales — ninguna en un formato que un agente pueda consumir programáticamente.

### Quién sufre el problema

1. **AI Agents** — No pueden completar tareas que requieren información de negocios locales
2. **Usuarios finales** — Cuando piden a su agente "encuentra un restaurante", el agente no puede ayudar realmente
3. **Negocios locales** — Pierden un canal emergente de descubrimiento (los agentes no los pueden recomendar)

---

## 2. Solution Overview

### Qué es AgentReady

Un **MCP Server** que expone negocios locales como recursos estructurados y buscables para AI agents.

### Cómo funciona (high level)

```
NEGOCIO                    AGENTREADY                    AGENTES
                                                          
Documento     ──────▶   AI procesa    ──────▶   MCP Server
Maestro                 y estructura              expone tools
(texto libre)           en Supabase               
                        (pgvector +               search_businesses
                         PostGIS)                 get_business
                                                  get_menu
                        Bot247 Agent              check_availability
                        (opcional)                contact_agent
                              │                        │
                              │                        │
                              ◀────────────────────────┘
                              responde queries y
                              ejecuta acciones
```

### Principio de diseño

**Zero-effort para el negocio.** El negocio proporciona su información UNA VEZ (texto, formulario, o documento). AgentReady se encarga de todo lo demás: estructurar, indexar, exponer, y mantener actualizado.

---

## 3. Arquitectura Técnica

### 3.1 Stack

| Capa | Tecnología | Justificación |
|---|---|---|
| **Database** | Supabase PostgreSQL | pgvector + PostGIS + Realtime + RLS |
| **Backend/API** | Next.js App Router on Vercel | API routes = Vercel Functions, deploy automático |
| **MCP Server** | Streamable HTTP transport en `/api/mcp` | Estándar MCP, cualquier client puede conectarse |
| **AI Models** | Vercel AI Gateway | Acceso unificado a modelos, créditos del hackathon |
| **AI Logic** | Vercel AI SDK | generateObject, embed, generateText, tools |
| **Demo Agent** | eve (Vercel agent framework) | MCP connection nativa, deploy en Vercel |
| **UI** | Next.js + shadcn/ui (v0) | Dashboard de monitoreo mínimo |
| **Hosting** | Vercel Pro | Incluido con créditos del hackathon |

### 3.2 Diagrama de Arquitectura

```
┌──────────────────────────────────────────────────────────────────┐
│                         VERCEL                                    │
│                                                                    │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │              NEXT.JS APPLICATION                          │    │
│  │                                                            │    │
│  │  ┌─────────────────┐    ┌──────────────────────────────┐  │    │
│  │  │  /api/mcp        │    │  /api/onboard                │  │    │
│  │  │  MCP Server      │    │  Document → Profile pipeline │  │    │
│  │  │  (Streamable HTTP)│    │  (AI Gateway + AI SDK)       │  │    │
│  │  │                   │    │                              │  │    │
│  │  │  Tools:           │    │  Input: raw text/document    │  │    │
│  │  │  • search         │    │  Output: structured JSON     │  │    │
│  │  │  • get_business   │    │  → saves to Supabase         │  │    │
│  │  │  • get_menu       │    │  → generates embedding       │  │    │
│  │  │  • check_avail    │    └──────────────────────────────┘  │    │
│  │  │  • contact_agent  │                                      │    │
│  │  └────────┬──────────┘    ┌──────────────────────────────┐  │    │
│  │           │               │  /dashboard                   │  │    │
│  │           │               │  Real-time query monitor      │  │    │
│  │           │               │  (Supabase Realtime)          │  │    │
│  │           │               └──────────────────────────────┘  │    │
│  └───────────┼──────────────────────────────────────────────────┘    │
│              │                                                       │
│  ┌───────────┼───────────┐   ┌────────────────────────────────┐    │
│  │  AI GATEWAY           │   │  EVE AGENT (demo)              │    │
│  │  • Embeddings         │   │  • MCP connection → /api/mcp   │    │
│  │  • Structured extract │   │  • Instructions for discovery  │    │
│  │  • Agent responses    │   │  • Demo flow in chat UI        │    │
│  └───────────────────────┘   └────────────────────────────────┘    │
│                                                                     │
└───────────────────────────────┬──────────────────────────────────────┘
                                │
                    ┌───────────┴───────────┐
                    │      SUPABASE          │
                    │                        │
                    │  PostgreSQL + pgvector  │
                    │  + PostGIS             │
                    │                        │
                    │  Tables:               │
                    │  • businesses           │
                    │  • menu_items           │
                    │  • agent_queries        │
                    │                        │
                    │  Functions:             │
                    │  • nearby_businesses()  │
                    │  • semantic_search()    │
                    │                        │
                    │  Realtime:              │
                    │  • agent_queries stream │
                    └────────────────────────┘
```

### 3.3 Database Schema

#### Table: `businesses`

```sql
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE businesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  subcategory TEXT,
  
  -- Location
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT,
  country TEXT DEFAULT 'MX',
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  coordinates GEOGRAPHY(POINT, 4326),
  
  -- Contact
  phone TEXT,
  whatsapp TEXT,
  email TEXT,
  website TEXT,
  instagram TEXT,
  
  -- Hours (JSONB)
  hours JSONB NOT NULL DEFAULT '{}',
  -- Format: {"monday": {"open": "09:00", "close": "18:00"}, ...}
  
  -- Capabilities (filterable array)
  capabilities TEXT[] DEFAULT '{}',
  -- Examples: delivery, reservation, online_ordering, parking, wifi,
  --           pet_friendly, vegetarian_options, accepts_cards, home_service
  
  -- Pricing
  price_range TEXT CHECK (price_range IN ('$', '$$', '$$$', '$$$$')),
  currency TEXT DEFAULT 'MXN',
  
  -- Agent
  has_agent BOOLEAN DEFAULT FALSE,
  agent_capabilities TEXT[] DEFAULT '{}',
  -- Examples: answer_questions, make_reservation, place_order, request_quote
  
  -- Extra structured data
  policies JSONB DEFAULT '{}',
  faq JSONB DEFAULT '[]',
  payment_methods TEXT[] DEFAULT '{}',
  
  -- Metadata
  rating NUMERIC(2,1),
  verified BOOLEAN DEFAULT FALSE,
  source TEXT DEFAULT 'bot247',
  
  -- Semantic search embedding
  description_embedding VECTOR(1536),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-set coordinates from lat/lng
CREATE OR REPLACE FUNCTION set_coordinates()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.lat IS NOT NULL AND NEW.lng IS NOT NULL THEN
    NEW.coordinates = ST_SetSRID(ST_MakePoint(NEW.lng, NEW.lat), 4326)::geography;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_coordinates
BEFORE INSERT OR UPDATE ON businesses
FOR EACH ROW EXECUTE FUNCTION set_coordinates();

-- Indexes
CREATE INDEX idx_biz_category ON businesses(category);
CREATE INDEX idx_biz_city ON businesses(city);
CREATE INDEX idx_biz_has_agent ON businesses(has_agent);
CREATE INDEX idx_biz_capabilities ON businesses USING GIN(capabilities);
CREATE INDEX idx_biz_geo ON businesses USING GIST(coordinates);
CREATE INDEX idx_biz_embedding ON businesses 
  USING ivfflat(description_embedding vector_cosine_ops)
  WITH (lists = 20);
```

#### Table: `menu_items`

```sql
CREATE TABLE menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  category TEXT NOT NULL,         -- "Pizza", "Pasta", "Haircut", "Consultation"
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10,2),
  currency TEXT DEFAULT 'MXN',
  dietary TEXT[] DEFAULT '{}',    -- vegetarian, vegan, gluten_free
  duration_minutes INTEGER,       -- For service businesses
  requires_appointment BOOLEAN DEFAULT FALSE,
  popular BOOLEAN DEFAULT FALSE,
  available BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_menu_business ON menu_items(business_id);
CREATE INDEX idx_menu_dietary ON menu_items USING GIN(dietary);
```

#### Table: `agent_queries` (analytics)

```sql
CREATE TABLE agent_queries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_name TEXT NOT NULL,
  query_params JSONB,
  results_count INTEGER DEFAULT 0,
  response_time_ms INTEGER,
  agent_identifier TEXT,
  session_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Realtime for this table
ALTER PUBLICATION supabase_realtime ADD TABLE agent_queries;
```

#### SQL Functions

```sql
-- Nearby businesses by distance
CREATE OR REPLACE FUNCTION nearby_businesses(
  p_lat DOUBLE PRECISION,
  p_lng DOUBLE PRECISION,
  p_radius_km DOUBLE PRECISION DEFAULT 10
)
RETURNS TABLE (
  id UUID, name TEXT, category TEXT, description TEXT,
  address TEXT, city TEXT, distance_km DOUBLE PRECISION,
  has_agent BOOLEAN, capabilities TEXT[], price_range TEXT
) AS $$
  SELECT 
    b.id, b.name, b.category, b.description,
    b.address, b.city,
    ST_Distance(b.coordinates, ST_MakePoint(p_lng, p_lat)::geography) / 1000.0 AS distance_km,
    b.has_agent, b.capabilities, b.price_range
  FROM businesses b
  WHERE ST_DWithin(
    b.coordinates,
    ST_MakePoint(p_lng, p_lat)::geography,
    p_radius_km * 1000
  )
  ORDER BY distance_km;
$$ LANGUAGE sql STABLE;

-- Semantic search
CREATE OR REPLACE FUNCTION match_businesses(
  query_embedding VECTOR(1536),
  match_threshold FLOAT DEFAULT 0.65,
  match_count INT DEFAULT 10
)
RETURNS TABLE (
  id UUID, name TEXT, category TEXT, description TEXT,
  city TEXT, similarity FLOAT
) AS $$
  SELECT
    b.id, b.name, b.category, b.description, b.city,
    1 - (b.description_embedding <=> query_embedding) AS similarity
  FROM businesses b
  WHERE 1 - (b.description_embedding <=> query_embedding) > match_threshold
  ORDER BY b.description_embedding <=> query_embedding
  LIMIT match_count;
$$ LANGUAGE sql STABLE;

-- Check if business is open now (considering timezone)
CREATE OR REPLACE FUNCTION is_open_now(business_hours JSONB)
RETURNS BOOLEAN AS $$
DECLARE
  day_name TEXT;
  today_hours JSONB;
  open_time TIME;
  close_time TIME;
  current_time_local TIME;
BEGIN
  day_name := LOWER(to_char(NOW() AT TIME ZONE 'America/Mexico_City', 'day'));
  day_name := TRIM(day_name);
  today_hours := business_hours -> day_name;
  
  IF today_hours IS NULL OR today_hours = 'null'::jsonb OR today_hours = '"closed"'::jsonb THEN
    RETURN FALSE;
  END IF;
  
  open_time := (today_hours ->> 'open')::TIME;
  close_time := (today_hours ->> 'close')::TIME;
  current_time_local := (NOW() AT TIME ZONE 'America/Mexico_City')::TIME;
  
  IF close_time < open_time THEN
    RETURN current_time_local >= open_time OR current_time_local <= close_time;
  END IF;
  
  RETURN current_time_local BETWEEN open_time AND close_time;
END;
$$ LANGUAGE plpgsql STABLE;
```

---

## 4. MCP Server Specification

### 4.1 Transport

- **Protocol:** MCP (Model Context Protocol)
- **Transport:** Streamable HTTP
- **Endpoint:** `POST /api/mcp`
- **Auth:** None required for basic discovery (public data)

### 4.2 Server Info

```json
{
  "name": "agentready-discovery",
  "version": "1.0.0",
  "description": "Discover and interact with local businesses. Search by natural language, location, category, and capabilities. Get menus, check availability, and communicate with business agents."
}
```

### 4.3 Tools

#### Tool 1: `search_businesses`

| Property | Value |
|---|---|
| **Purpose** | Find businesses matching user needs |
| **Main query source** | Supabase pgvector semantic search + text match + capability filter + geo filter |
| **Returns** | Array of business summaries with relevance info |

**Parameters:**

| Param | Type | Required | Description |
|---|---|---|---|
| `query` | string | ✅ | Natural language search query |
| `city` | string | ❌ | City filter |
| `category` | string | ❌ | Business category |
| `capabilities` | string[] | ❌ | Required capabilities |
| `open_now` | boolean | ❌ | Only currently open businesses |
| `lat` | number | ❌ | Latitude for geo search |
| `lng` | number | ❌ | Longitude for geo search |
| `radius_km` | number | ❌ | Search radius (default 10) |
| `price_range` | string | ❌ | Price filter ($, $$, $$$, $$$$) |
| `limit` | number | ❌ | Max results (default 5, max 20) |

**Logic flow:**
1. Generate embedding of `query` via AI Gateway (`text-embedding-3-small`)
2. Run `match_businesses()` in Supabase for semantic results
3. Apply hard filters: city, category, capabilities (SQL WHERE + array overlap)
4. If lat/lng provided, run `nearby_businesses()` and intersect
5. If `open_now`, filter by `is_open_now(hours)`
6. Merge and rank results
7. Log query to `agent_queries`
8. Return top N results

#### Tool 2: `get_business`

| Property | Value |
|---|---|
| **Purpose** | Get complete profile of one business |
| **Query** | Simple Supabase select by ID |
| **Returns** | Full business profile JSON |

**Parameters:**

| Param | Type | Required |
|---|---|---|
| `business_id` | string | ✅ |

**Returns:** Complete business object including hours, capabilities, policies, FAQ, contact, agent info, payment methods.

#### Tool 3: `get_menu`

| Property | Value |
|---|---|
| **Purpose** | Get menu/services/products of a business |
| **Query** | Supabase select from menu_items with filters |
| **Returns** | Categorized list of items with prices |

**Parameters:**

| Param | Type | Required |
|---|---|---|
| `business_id` | string | ✅ |
| `category_filter` | string | ❌ |
| `dietary_filter` | string[] | ❌ |
| `price_max` | number | ❌ |

#### Tool 4: `check_availability`

| Property | Value |
|---|---|
| **Purpose** | Check if business is available at a specific time |
| **Logic** | Check hours data + static capacity rules |
| **Returns** | Availability status + alternatives |

**Parameters:**

| Param | Type | Required |
|---|---|---|
| `business_id` | string | ✅ |
| `date` | string (YYYY-MM-DD) | ✅ |
| `time` | string (HH:MM) | ✅ |
| `party_size` | number | ❌ |
| `service` | string | ❌ |

**Logic:**
- Sin agente: verifica contra horarios estáticos, retorna `likely_available` o `closed`
- Con agente: delega al agente Bot247 para respuesta en tiempo real

#### Tool 5: `contact_agent`

| Property | Value |
|---|---|
| **Purpose** | Interact with a business's AI agent |
| **Prerequisite** | Business must have `has_agent = true` |
| **AI Model** | AI Gateway → modelo con system prompt del negocio |
| **Returns** | Agent response, potentially with confirmation data |

**Parameters:**

| Param | Type | Required |
|---|---|---|
| `business_id` | string | ✅ |
| `action` | enum | ✅ |
| `message` | string | ✅ |
| `context` | object | ❌ |

**Actions:** `ask_question`, `make_reservation`, `place_order`, `request_quote`, `check_specific_availability`

**Logic:**
1. Fetch business profile from Supabase
2. Build system prompt with business data (name, menu, hours, policies, FAQ)
3. Call AI Gateway with user message + context
4. For `make_reservation`: generate confirmation number, simulate booking
5. Return structured response

---

## 5. Document Processing Pipeline (Onboarding)

### Endpoint: `POST /api/onboard`

**Purpose:** Tomar información de un negocio en formato libre y convertirla en un Business Profile estructurado.

**Flow:**

```
Raw text/document
       │
       ▼
AI Gateway (generateObject)
       │  
       │  Schema: BusinessProfile (Zod)
       │  Model: claude-sonnet-4 or gpt-6-astra
       │
       ▼
Structured Business Profile (JSON)
       │
       ├──▶ Save to Supabase (businesses table)
       │
       ├──▶ Generate embedding (AI Gateway embed)
       │    Save to description_embedding column
       │
       ├──▶ Extract menu items
       │    Save to menu_items table
       │
       └──▶ Return profile + business_id
```

**Input:**
```json
{
  "document": "Somos Tacos El Paisa, una taquería en el centro de Monterrey...",
  "source": "bot247"
}
```

**Output:**
```json
{
  "business_id": "uuid-here",
  "profile": { /* structured business profile */ },
  "menu_items_created": 15,
  "embedding_generated": true
}
```

---

## 6. Discovery Endpoints (Standards Compliance)

### `GET /.well-known/ard.json`

ARD (Agentic Resource Discovery) manifest que lista todos los negocios como entries:

```json
{
  "version": "0.9",
  "entries": [
    {
      "type": "application/mcp+json",
      "name": "AgentReady Business Discovery",
      "url": "https://agent-ready.vercel.app/api/mcp",
      "description": "Search and interact with local businesses in Mexico via MCP tools"
    }
  ]
}
```

### `GET /agents.json`

Capability declaration para el site:

```json
{
  "name": "AgentReady",
  "description": "Business Discovery MCP Server for AI agents",
  "protocols": ["MCP"],
  "endpoints": {
    "mcp": "https://agent-ready.vercel.app/api/mcp"
  },
  "capabilities": [
    "business_search", "business_info", "menu_lookup",
    "availability_check", "agent_interaction"
  ]
}
```

---

## 7. Eve Agent (Demo Consumer)

### Purpose

Un eve agent que demuestra el valor del MCP server. Es el "cliente" que usa nuestro servicio.

### Files

```
agent/
├── index.ts                    # Agent config (model, etc.)
├── instructions.md             # Agent personality and behavior rules
└── connections/
    └── agentready.ts           # MCP connection to our server
```

### `agent/instructions.md`

```markdown
You are a local business discovery assistant powered by AgentReady.

Your job is to help users find businesses, services, and places in Mexico.
You have access to the AgentReady MCP server through your connections.

## What you can do
- Search for businesses by what the user needs (restaurants, clinics, salons, etc.)
- Get detailed information about any business (hours, location, policies)
- Show menus, services, and prices
- Check availability for specific dates and times
- Make reservations or place orders when the business has an AI agent

## How to behave
- Always use the agentready connection tools to find real business data
- Never make up business information
- Present results clearly with key details: name, location, price, rating
- Indicate which businesses have AI agents (can take actions) vs info-only
- When a user wants action and the business has no agent, provide contact info
- Be concise but complete — agents and users value structured, actionable answers

## Important
- Distances are in kilometers
- Prices are in MXN (Mexican Pesos) unless stated otherwise
- Hours are in Mexico City timezone (CST/CDT)
- Use 24h format for times
```

### `agent/connections/agentready.ts`

```typescript
import { defineMcpClientConnection } from "eve/connections";

export default defineMcpClientConnection({
  url: process.env.MCP_SERVER_URL!,
  description: 
    "AgentReady Business Discovery — search, query, and interact with " +
    "local businesses in Mexico. Restaurants, clinics, salons, and services.",
});
```

---

## 8. Seed Data

### Negocios de ejemplo (12-15 para la demo)

Mezcla de categorías en Monterrey, México:

| # | Nombre | Categoría | has_agent | Capabilities destacadas |
|---|---|---|---|---|
| 1 | Tacos El Paisa | Restaurant (Mexican) | ❌ | dine_in, takeout, delivery |
| 2 | La Trattoria di Roma | Restaurant (Italian) | ✅ | reservation, wine_list, private_events |
| 3 | Sushi Zen | Restaurant (Japanese) | ✅ | reservation, online_ordering, delivery |
| 4 | Café Literario | Café | ❌ | wifi, coworking_friendly, breakfast |
| 5 | Dental Smile Monterrey | Dental Clinic | ✅ | appointment, emergency, insurance |
| 6 | Estética Luna | Beauty Salon | ✅ | appointment, home_service |
| 7 | TechFix Pro | Phone/Computer Repair | ❌ | walk_in, warranty |
| 8 | Hotel Sierra Vista | Hotel | ✅ | reservation, pool, gym, restaurant |
| 9 | Veterinaria San Jorge | Veterinary | ✅ | appointment, emergency_24h, grooming |
| 10 | CrossFit Monterrey | Gym | ❌ | trial_class, parking, showers |
| 11 | Lavandería Express | Laundry | ❌ | delivery, same_day, eco_friendly |
| 12 | Contaduría Rodríguez | Accounting Services | ✅ | consultation, remote_service, tax_filing |
| 13 | Pizzería Don Carlo | Restaurant (Italian) | ❌ | delivery, takeout, party_packages |
| 14 | Dr. García Traumatología | Medical Specialist | ✅ | appointment, telemedicine, insurance |
| 15 | CoWork MTY | Coworking Space | ✅ | day_pass, meeting_rooms, events |

Cada negocio tendrá:
- Perfil completo (descripción, dirección, horarios, contacto)
- 5-15 items en menu_items (dishes/services con precios)
- Coordenadas GPS reales de Monterrey
- Capabilities y políticas realistas

---

## 9. API Endpoints Summary

| Method | Path | Purpose | Auth |
|---|---|---|---|
| POST | `/api/mcp` | MCP Server (Streamable HTTP) | None (public) |
| POST | `/api/onboard` | Process document → business profile | API key |
| GET | `/.well-known/ard.json` | ARD discovery manifest | None |
| GET | `/agents.json` | Capability declaration | None |
| GET | `/api/health` | Health check + stats | None |
| GET | `/dashboard` | Real-time query monitor UI | None |

---

## 10. Entregables del Hackathon

### Submission checklist

- [ ] MCP Server funcional con 5 tools
- [ ] 12-15 negocios con data completa en Supabase
- [ ] Búsqueda semántica con pgvector funcionando
- [ ] Búsqueda geoespacial con PostGIS funcionando
- [ ] Eve agent conectado y demostrando el flow
- [ ] Dashboard con Supabase Realtime mostrando queries
- [ ] Demo video (MP4 ≤ 100MB)
- [ ] README con instrucciones
- [ ] Deploy en Vercel
- [ ] `.well-known/ard.json` y `agents.json`

---

## 11. Out of Scope (No construir en el hackathon)

- ❌ Auth/login para negocios
- ❌ CRUD completo para editar negocios
- ❌ Pagos reales (Stripe checkout)
- ❌ Federation/DHT distribuido
- ❌ Trust/reputation system
- ❌ Multi-tenancy
- ❌ Rate limiting sofisticado
- ❌ Internacionalización (solo México/Monterrey)
- ❌ A2A server completo (solo Agent Card estático)
- ❌ Mobile app
- ❌ WhatsApp/Instagram integration

---

## 12. Riesgos y Mitigaciones

| Riesgo | Probabilidad | Impacto | Mitigación |
|---|---|---|---|
| MCP server no funciona con eve | Media | Alto | Testear la conexión MCP temprano (hora 2) |
| pgvector no da buenos resultados | Baja | Medio | Fallback a text search con ILIKE/tsvector |
| AI Gateway rate limits | Baja | Medio | Cache embeddings, minimizar calls |
| Seed data no es convincente | Media | Medio | Usar negocios reales de Monterrey como inspiración |
| Demo video sin tiempo | Alta | Alto | Grabar mientras se desarrolla, no al final |
| Eve agent no entiende tools | Baja | Alto | Instructions claras, tool descriptions detalladas |

---

## 13. Métricas de Éxito del Hackathon

1. ✅ Un agente puede buscar "restaurante italiano en Monterrey" y obtener resultados relevantes
2. ✅ Un agente puede ver el menú completo con precios
3. ✅ Un agente puede verificar si un negocio está abierto ahora
4. ✅ Un agente puede hacer una reservación a través del agente del negocio
5. ✅ El dashboard muestra queries en tiempo real
6. ✅ El video demo muestra el flow completo en < 3 minutos

---

## 14. Plan del Demo Video

### Formato
- **Duración:** 2-3 minutos
- **Formato:** MP4 ≤ 100MB
- **Resolución:** 1080p mínimo
- **Audio:** Narración en voz (inglés preferido para jueces) o text captions

### Estructura del video

```
0:00-0:15 — HOOK
  "AI agents can buy from Shopify and pay for APIs with x402.
   But they can't find a restaurant and make a reservation.
   We built AgentReady to fix that."

0:15-0:30 — THE PROBLEM (screen recording)
  Show an AI agent failing to find a local business
  "Today, when you ask an agent to find a restaurant in Monterrey..."
  → Agent says "I don't have real-time access to local business data"

0:30-0:50 — THE SOLUTION (architecture slide)
  Quick visual of how it works:
  Business → Bot247 → Structured Profile → Supabase → MCP Server → Any Agent
  "AgentReady makes local businesses discoverable by AI agents.
   A business provides info once. We handle the rest."

0:50-1:30 — LIVE DEMO: Discovery Flow
  Show eve agent chat:
  1. User: "Find me an Italian restaurant in Monterrey for dinner tonight"
  2. Agent calls search_businesses → shows 3 results with ratings and prices
  3. User: "Show me the menu of the first one"
  4. Agent calls get_menu → shows categorized menu with prices
  
  "Any agent with MCP support can do this — Claude, ChatGPT, custom agents."

1:30-2:10 — LIVE DEMO: Action Flow  
  Continue in eve:
  5. User: "Do they have vegetarian options?"
  6. Agent filters menu → shows vegetarian items
  7. User: "Reserve a table for 4 at 8pm"
  8. Agent calls check_availability → available
  9. Agent calls contact_agent → RESERVATION CONFIRMED with number
  
  "Businesses WITH agents can take reservations, orders, and more.
   Businesses WITHOUT agents still provide structured, queryable info."

2:10-2:30 — TECH STACK (quick)
  Show Supabase dashboard: pgvector embeddings, PostGIS coordinates
  Show Vercel dashboard: AI Gateway usage, deployment
  "Built on Supabase pgvector for semantic search, PostGIS for geo,
   Realtime for monitoring. Deployed on Vercel with AI Gateway and eve."

2:30-2:50 — THE VISION
  Show the dashboard with real-time queries flowing
  "We're doing for local businesses what Shopify Catalog does for ecommerce.
   Bot247 already digitizes thousands of small businesses in Mexico.
   AgentReady makes them visible to the entire agent ecosystem."

2:50-3:00 — CLOSE
  Show the ARD endpoint and agents.json
  "Standards-compliant with ARD, A2A Agent Cards, and agents.json.
   Any registry can index us. Any agent can discover us.
   This is something agents genuinely want — and can't get today."
  
  Logo + team + URL
```

### Tips para el video

1. **Grabar mientras desarrollas.** No dejes el video para el final.
2. **Screen recording + voiceover.** QuickTime Player o OBS.
3. **Speed up las partes lentas.** Mostrar solo resultados, no loading.
4. **Keep it under 3 minutes.** Los jueces ven muchos videos.
5. **Show, don't tell.** Más demo, menos slides.
6. **El hook es crucial.** Los primeros 10 segundos determinan si siguen viendo.
7. **Mostrar la query real de Supabase** en el dashboard — los jueces de Supabase lo valoran.
8. **Mostrar AI Gateway usage** — los jueces de Vercel lo valoran.

### Herramientas para el video

- **Screen recording:** QuickTime Player (macOS) o OBS
- **Editing rápido:** iMovie o incluso QuickTime (trim)
- **Voiceover:** Grabar en Voice Memos, importar
- **Alternativa sin edición:** Loom (graba pantalla + cámara + audio)

---

## 15. Información para el LLM Revisor

### Lo que necesito que el LLM revise:

1. **Schema de Supabase** — ¿Falta algo? ¿Los indexes son correctos? ¿pgvector + PostGIS así se usan?
2. **MCP Server implementation** — ¿Cómo se implementa Streamable HTTP en Next.js? ¿Necesito un SDK específico?
3. **Tool schemas** — ¿Los parámetros y returns son correctos para MCP?
4. **Eve connection** — ¿`defineMcpClientConnection` funciona así con una URL remota?
5. **AI SDK usage** — ¿`generateObject` y `embed` son las APIs correctas para AI SDK 7?
6. **Seed data** — Generar los 15 negocios completos con datos realistas de Monterrey
7. **API route structure** — ¿`/api/mcp/route.ts` es la forma correcta en Next.js App Router?
8. **Deployment** — ¿Algo que configurar especialmente en Vercel para MCP o eve?
9. **Performance** — ¿El approach de semantic + geo search es eficiente para un hackathon?
10. **Missing pieces** — ¿Qué no estoy considerando que va a explotar durante el build?

### Lo que NO necesito:

- No necesito que re-haga la investigación de mercado (ya está en RESEARCH)
- No necesito UI design detallado (dashboard es minimal)
- No necesito modelo de negocio largo plazo
- No necesito security review exhaustivo

### Context files que el LLM debe tener:

- Este PRD
- `RESEARCH-agent-discovery-hackathon.md` (secciones 17 y 18 especialmente)
- `HACKATHON-overview.md`
- Documentación de MCP SDK: https://modelcontextprotocol.io
- Documentación de AI SDK: https://ai-sdk.dev
- Documentación de eve: https://eve.dev/docs
- Documentación de Supabase pgvector: https://supabase.com/docs/guides/ai

---

*Draft creado el 3 de Octubre, 2026. Pendiente de revisión por LLM avanzado antes de comenzar build.*