# 🏆 Supabase Select 2026 Hackathon — Overview

## Información General

| Campo | Detalle |
|---|---|
| **Evento** | Supabase Select 2026 Hackathon |
| **Fecha** | Sábado 3 de Octubre, 2026 (15:00 UTC) → Domingo 4 de Octubre (00:30 UTC) |
| **Duración** | ~9.5 horas |
| **Ubicación** | 580 20th Street, San Francisco (Y Combinator) — Presencial |
| **Organizador** | Supabase |
| **Partners** | Vercel, Anthropic (Claude), Stripe, Google (Gemini) |
| **Equipos** | Solo o hasta 4 personas |
| **Plataforma de submission** | https://hackathon.supabase.com |
| **Código de créditos** | `SUPASELE-4T9F-SM6E` → [credits.vercel.sh](https://credits.vercel.sh/) |
| **Coding Tool** | Cursor |

---

## 🎯 Prompt del Hackathon

> **"BUILD SOMETHING AGENTS WANT"**

### Cómo interpretar el prompt (de la guía oficial de Vercel):

> *"Treat an agent as your product's user. Build a tool, API, data source, or service that helps it complete a task, and demonstrate an agent actually using it."*

**El agente es el usuario.** No estamos construyendo para humanos. Estamos construyendo algo que un AI agent necesita y puede usar.

Una interfaz humana puede ayudar con setup, permisos, y observar resultados — pero el producto principal es para agentes.

---

## 📋 Reglas Clave

**Fuente:** [Hackathon Rules](https://hackathon.supabase.com/hackathon-rules)

1. **Trabajo original durante el evento.** Todo debe crearse durante el hackathon. Se pueden usar librerías, frameworks y APIs como building blocks.
2. **Debe usar Supabase.** Para ser elegible, la submission debe integrar significativamente Supabase (database, auth, storage, edge functions, o realtime).
3. **No data sensible.** No usar datos personales sensibles ni PHI.
4. **Submission antes del deadline.** Incluir: descripción del proyecto, demo o código, instrucciones para ejecutar.
5. **Late submissions no se consideran.**

---

## ⚖️ Criterios de Evaluación

Los proyectos se evalúan en escala 1-5 por cada criterio:

| # | Criterio | Descripción | Peso implícito |
|---|---|---|---|
| 1 | **Innovation & Creativity** | Originalidad de la idea y el enfoque | Alto |
| 2 | **Technical Execution** | Calidad de la implementación, escalabilidad, dificultad técnica | Alto |
| 3 | **Use of Supabase** | Qué tan significativamente se integran las features de Supabase | Alto |
| 4 | **Practical Impact** | Utilidad, relevancia, o potencial valor en el mundo real | Medio-Alto |
| 5 | **Presentation & Demo** | Claridad, polish, y efectividad de la demo | Alto |

### Cómo maximizar cada criterio con nuestro proyecto:

#### 1. Innovation & Creativity
**Nuestro ángulo:** Nadie ha construido un Business Discovery MCP Server para negocios locales. ARD/AGNTCY existen para agentes técnicos, Shopify Catalog para ecommerce — pero el "last mile" de convertir SMBs en agent-discoverable no existe.

**Key point para jueces:** "24,000+ paid APIs are discoverable by agents via x402. But millions of local businesses are completely invisible. We're fixing that."

#### 2. Technical Execution
**Lo que mostramos:**
- Supabase pgvector para búsqueda semántica
- PostGIS para búsqueda geoespacial
- MCP Server completo con 5 tools
- AI SDK structured output para document processing
- eve agent como consumidor
- Standards-compliant (ARD, A2A Agent Cards, agents.json)

#### 3. Use of Supabase
**Features de Supabase que usamos:**
- ✅ **Database (PostgreSQL)** — toda la data de negocios
- ✅ **pgvector** — embeddings y búsqueda semántica
- ✅ **PostGIS** — búsqueda geoespacial por distancia
- ✅ **Realtime** — dashboard live de queries de agentes
- ✅ **Row Level Security** — control de acceso a datos
- ✅ **Auth** — login para registro de negocios (si alcanza tiempo)
- ✅ **Storage** — logos e imágenes de negocios (si alcanza tiempo)

**Esto es uso SIGNIFICATIVO. No es un read/write simple — es pgvector + PostGIS + Realtime.**

#### 4. Practical Impact
**El argumento:** Bot247 ya existe como producto real en México para MiPYMEs. Esta extensión convertiría automáticamente a sus negocios en agent-discoverable. No es un concepto — es una extensión de un producto existente con usuarios reales.

#### 5. Presentation & Demo
**El "aha moment":** Un eve agent encuentra un restaurante en Monterrey, consulta el menú, verifica disponibilidad, y hace una reservación — todo via MCP tools conectados a data real en Supabase.

---

## 🏅 Premios

### Premio Principal
- **100K+ en créditos compartidos** entre todos los participantes (Supabase, Claude, Stripe, Vercel)
- **31K credits prize pool** para equipos ganadores
- **Top 6 equipos** hacen demo live en stage
- **Equipos ganadores** desayunan con los fundadores de Supabase (Ant Wilson y Paul Copplestone) 🥞
- Comida todo el día, swag incluido

### Bonus Categories (Side Quests)

Estas categorías no cuentan para el score final pero pueden ganar premios adicionales en créditos:

| Categoría | Cómo aplicaría a nuestro proyecto |
|---|---|
| **Best Use of Vercel** | Next.js en Vercel, AI Gateway para modelos, AI SDK para tools, eve como agent framework, Vercel Functions para MCP server |
| **Best Use of Claude** | Usar Claude via AI Gateway para procesar Documentos Maestros → structured profiles, y como modelo del eve agent |
| **Best Use of Stripe** | Integrar Stripe para modelo económico: negocios pagan suscripción por ser discoverable, o pay-per-query para agentes premium |
| **Best Use of Codex** | Usar Codex durante el desarrollo (coding assistant). Documentar el uso de Cursor + Codex en el proceso de build |
| **Best Use of Multimodal AI for Gemini** | Usar Gemini para procesar imágenes de menús/negocios → extraer data estructurada multimodal (foto del menú → JSON) |

---

## 👨‍⚖️ Panel de Jueces

| Juez | Rol | Empresa | Qué le importa |
|---|---|---|---|
| **Ant Wilson** | Co-founder & CTO | Supabase | Uso técnico profundo de Supabase, arquitectura |
| **Paul Copplestone** | Co-founder & CEO | Supabase | Vision de producto, impacto real |
| **Pratik Gupta** | Senior Engineering Leader | Stripe | Calidad de implementación, potencial comercial |
| **John Robison** | Startup Partnerships | Anthropic | Uso de AI/Claude, innovación agentic |
| **George Fahmy** | Member of Technical Staff | Vercel | Uso del stack Vercel, agent framework (eve) |

### Estrategia por juez:

- **Para Ant/Paul (Supabase):** Mostrar pgvector + PostGIS + Realtime juntos. No es un CRUD — es semantic + geospatial search en Supabase.
- **Para Pratik (Stripe):** Mencionar el modelo económico, potencial de monetización, cómo escala.
- **Para John (Anthropic):** Enfatizar el concepto agentic — agents descubriendo negocios, agent-to-agent communication, el gap que resolvemos.
- **Para George (Vercel):** Mostrar eve, AI Gateway, AI SDK, Vercel Functions — full stack Vercel.

---

## 📝 Submission Requirements

Basado en el formulario de hackathon.supabase.com:

| Campo | Contenido para nuestro proyecto |
|---|---|
| **Project Title** | "AgentReady — Business Discovery MCP Server" |
| **Description** | [Ver draft abajo] |
| **Repository Type** | GitHub |
| **Repository URL** | `https://github.com/[username]/agent-ready` |
| **Demo URL** | `https://agent-ready.vercel.app` |
| **Demo Notes** | Instrucciones para conectar el MCP server a Claude Desktop o eve |
| **Demo Video** | MP4 ≤ 100MB mostrando el flujo completo |
| **Project Images** | Hasta 10 imágenes (screenshots del flow) |
| **Coding Tools Used** | Cursor |

### Draft de Description para submission:

> **AgentReady — Business Discovery MCP Server**
>
> AI agents can buy things on Shopify and pay for APIs with x402. But they can't find a restaurant in Monterrey and make a reservation. Millions of local businesses are completely invisible to agents.
>
> AgentReady is an MCP Server that makes local businesses discoverable and usable by AI agents. Businesses provide their information once (a "Master Document"), and we automatically generate structured, machine-readable profiles with semantic search capabilities.
>
> Any agent — Claude, ChatGPT, eve, custom — connects to our MCP server and can:
> - Search businesses by natural language, location, and capabilities
> - Get detailed profiles, menus, services, and prices
> - Check real-time availability
> - Interact with business AI agents for reservations and orders
>
> Built on Supabase pgvector for semantic search, PostGIS for geospatial queries, and Realtime for live monitoring. Powered by Vercel AI Gateway, AI SDK, and the eve agent framework.
>
> We're doing for local businesses what Shopify Catalog does for ecommerce — making them agent-ready.

---

## ⏱️ Timeline del Evento

```
15:00 UTC (8:00 AM PST) — Evento comienza
  │
  ├── ~30 min: Setup, redimir créditos, crear equipo
  │
  ├── HORA 1: Foundation (schema Supabase, seed data, deploy base)
  ├── HORA 2: MCP Server core (search, get_business, get_menu)
  ├── HORA 3: Agent layer (availability, contact_agent, eve agent)
  ├── HORA 4: Polish + Demo video
  │
  ├── ~últimos 30 min: Submit
  │
00:30 UTC (5:30 PM PST) — Submissions cerran
  │
  └── Top 6 equipos demo live → Jueces eligen ganadores
```

---

## 🎯 Estrategia para Side Quests

Para maximizar la probabilidad de ganar side quests sin perder foco:

### Best Use of Vercel (alta probabilidad ⭐)
Ya lo usamos todo: Next.js, AI Gateway, AI SDK, eve, Vercel Functions. Solo asegurarnos de mencionarlo claramente.

### Best Use of Claude (media probabilidad)
Usar Claude como modelo principal via AI Gateway. Documentar por qué Claude es bueno para structured data extraction.

### Best Use of Multimodal AI for Gemini (oportunidad interesante)
Añadir un tool `process_menu_photo` que acepte una imagen del menú de un restaurante y use Gemini multimodal para extraer los items como JSON. 30 min de trabajo extra con alto impacto visual.

### Best Use of Stripe (requiere trabajo extra)
Implementar un endpoint con Stripe Checkout para que negocios puedan pagar por ser "verified" en el registry. O implementar per-query billing. Solo si hay tiempo.

### Best Use of Codex (fácil)
Documentar que usamos Cursor para construir todo el proyecto. Puede merecer mención sin trabajo adicional.
