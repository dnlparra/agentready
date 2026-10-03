# 🔍 Investigación Profunda: Agent & Business Discovery Registry

**Fecha:** 3 de Octubre, 2026  
**Objetivo:** Evaluar la viabilidad de construir un "Agent & Business Discovery Registry" para el hackathon "BUILD SOMETHING AGENTS WANT"  
**Contexto:** Bot247 — plataforma mexicana de digitalización para MiPYMEs

---

## Tabla de Contenidos

1. [Principales Registries y Directorios](#1-principales-registries-y-directorios)
2. [¿Cómo se Registra un Agente?](#2-cómo-se-registra-un-agente)
3. [Protocolos y Formatos de Discovery](#3-protocolos-y-formatos-de-discovery)
4. [¿Existe un Registry Universal?](#4-existe-un-registry-universal)
5. [Business Discovery](#5-business-discovery)
6. [Modelo Económico](#6-modelo-económico)
7. [Discovery vs Transaction Pipeline](#7-discovery-vs-transaction-pipeline)
8. [Competitive Landscape](#8-competitive-landscape)
9. [¿Qué Está Commoditizado?](#9-qué-está-commoditizado)
10. [Problemas Abiertos](#10-problemas-abiertos)
11. [Análisis de la Variación de la Idea](#11-análisis-de-la-variación-de-la-idea)
12. [Hypothesis: Agent-Ready Businesses](#12-hypothesis-agent-ready-businesses)
13. [Relación con Bot247](#13-relación-con-bot247)
14. [Hackathon Fit](#14-hackathon-fit)
15. [Diferenciadores Propuestos](#15-diferenciadores-propuestos)
16. [Conclusión y Resumen Ejecutivo](#16-conclusión-y-resumen-ejecutivo)

---

## 1. Principales Registries y Directorios

### 1.1 Registries Públicos de Agentes y Tools

#### MCP Registry (Oficial)
- **Organización:** MCP Project (Anthropic, GitHub, PulseMCP, Microsoft)
- **URL:** https://registry.modelcontextprotocol.io
- **Estado:** Preview (API freeze v0.1 desde Oct 2025)
- **Tipo:** Público, Open Source
- **Qué registra:** Metadata de MCP servers públicos (nombre, paquete, URL remota, instrucciones de instalación)
- **Quién puede registrarse:** Cualquier desarrollador con namespace verificado (DNS o GitHub)
- **Quién puede descubrir:** Cualquiera via REST API sin autenticación
- **Soporta agentes:** No directamente — solo MCP servers (tools)
- **Soporta negocios:** No
- **Protocolos:** MCP; REST API para discovery
- **Discovery:** `GET /v0.1/servers` con filtros de búsqueda, cursor, limit, updated_since
- **Problema que resuelve:** "App Store" para MCP servers — un lugar canónico para publicar metadata
- **Fuente:** [GitHub](https://github.com/modelcontextprotocol/registry), [Docs](https://modelcontextprotocol.io/registry/about.md)

#### Google Cloud Agent Registry
- **Organización:** Google Cloud
- **URL:** https://docs.cloud.google.com/agent-registry/
- **Estado:** GA (disponible)
- **Tipo:** Enterprise, Propietario (Google Cloud)
- **Qué registra:** Agentes A2A, agentes ADK, agentes REST custom
- **Quién puede registrarse:** Desarrolladores con proyecto Google Cloud
- **Quién puede descubrir:** Dentro del ecosistema Google Cloud
- **Soporta agentes:** ✅ Sí (A2A y non-A2A)
- **Soporta negocios:** No directamente
- **Protocolos:** A2A v0.3 y v1.0, REST
- **Discovery:** API de Agent Registry, Console, gcloud CLI
- **Problema que resuelve:** Registro y gobernanza de agentes dentro de Google Cloud
- **Fuente:** [Docs](https://docs.cloud.google.com/agent-registry/register-agents)

#### AGNTCY Agent Directory Service (ADS)
- **Organización:** AGNTCY / Linux Foundation (origen Cisco)
- **URL:** https://dir.agntcy.org/latest/ | https://github.com/agntcy/dir
- **Estado:** Open Source, implementación activa
- **Tipo:** Público, Open Source (Apache 2.0)
- **Qué registra:** Records OASF para agentes, MCP servers, skills, otros assets agentic
- **Quién puede registrarse:** Cualquier operador que publique records validados
- **Quién puede descubrir:** Cualquier agente o sistema via API/DHT
- **Soporta agentes:** ✅ Sí
- **Soporta negocios:** No directamente
- **Soporta tools/APIs/services:** ✅ Sí (MCP servers, skills)
- **Protocolos:** ADS, OASF, ARD; puede indexar A2A y MCP
- **Discovery:** Queries por capability/skill, DHT-based routing entre instancias, REST API
- **Problema que resuelve:** Discovery federado cross-framework para agentes
- **Internet Draft:** [draft-mp-agntcy-ads-02](https://datatracker.ietf.org/doc/html/draft-mp-agntcy-ads-02)

#### AWS Agent Registry (Bedrock AgentCore)
- **Organización:** Amazon Web Services
- **URL:** https://aws.amazon.com/bedrock/agentcore/
- **Estado:** GA (Agosto 31, 2026)
- **Tipo:** Enterprise, Propietario (AWS)
- **Qué registra:** Agentes privados, tools, skills, MCP servers, recursos custom
- **Quién puede registrarse:** Organizaciones con cuenta AWS
- **Quién puede descubrir:** Dentro de la organización
- **Protocolos:** MCP interface, AWS APIs
- **Pricing:** Free tier: 5,000 records, 1M searches, 2M Get/List calls/mes; después usage-based
- **Problema que resuelve:** Catálogo organizacional gobernado de agentes
- **Fuente:** [AWS](https://aws.amazon.com/about-aws/whats-new/2026/08/aws-agent-registry-generally-available/)

#### Microsoft Agent 365 Registry
- **Organización:** Microsoft
- **URL:** https://www.microsoft.com/en-us/microsoft-agent-365
- **Estado:** GA (cross-cloud sync en Julio 2026)
- **Tipo:** Enterprise, Propietario
- **Qué registra:** Agentes organizacionales (Microsoft + externos sincronizados)
- **Protocolos:** Microsoft connectors, agent identities
- **Pricing:** $15/user/month (standalone)
- **Problema que resuelve:** Inventario, gobernanza y compliance de agentes enterprise

#### A2A Registry (Público)
- **Organización:** Comunidad
- **URL:** https://www.a2a-registry.org/
- **Estado:** Live
- **Tipo:** Público, gratuito
- **Qué registra:** A2A Agent Cards, endpoints, payment capabilities
- **Quién puede registrarse:** Cualquiera
- **Discovery:** Browse/API, filtros
- **Precio:** Gratuito
- **Fuente:** [a2a-registry.org](https://www.a2a-registry.org/)

#### MARS (Multi-Agentic Registry Service)
- **Organización:** MARS Project
- **URL:** https://mars.glass/
- **Estado:** Spec v1.0, implementación Rust 0.1.0
- **Tipo:** Open Source (Apache 2.0)
- **Qué registra:** 14 tipos: agentes, tools, skills, modelos, datasets, servicios, organizaciones, identity roots, MAP plugins
- **Discovery:** MARS-QL queries bounded con cursor y paginación
- **Trust:** Signed entries, bonds slashable, federation con keys pinned
- **Problema que resuelve:** Registry federado con identidad criptográfica y provenance
- **Fuente:** [Docs](https://docs.mars.glass/), [Spec](https://mars.glass/spec)

### 1.2 Marketplaces de Agentes

| Marketplace | Organización | URL | Tipo |
|---|---|---|---|
| Google Cloud Marketplace (AI Agents) | Google | https://cloud.google.com/marketplace | Partner-submitted agents |
| AWS Marketplace (AI Agents & Tools) | AWS | https://aws.amazon.com/marketplace/solutions/ai-agents-and-tools | Partner agents/tools |
| Salesforce AgentExchange | Salesforce | https://www.salesforce.com/au/agentforce/agentexchange/ | Agents, sub-agents, MCP servers |
| ServiceNow AI Marketplace | ServiceNow | https://store.servicenow.com/store/ai-marketplace | Partner agents/apps |
| IBM watsonx Agent Catalog | IBM | https://www.ibm.com/products/watsonx-orchestrate/agent-catalog | Agents y tools |
| MuleSoft Agent Fabric | Salesforce/MuleSoft | https://www.mulesoft.com/ai/agent-fabric | Agents, MCP, APIs |
| Agent.ai | Agent.ai | https://agent.ai | Workflow agents |
| Fetch.ai Agentverse | Fetch.ai/ASI | https://agentverse.ai | uAgents + A2A |
| Agent Exchange | Independiente | https://exchange.agentexchange.work/ | Agent-to-agent task marketplace |

### 1.3 Directorios de MCP Servers

| Directorio | URL | Estado | Notas |
|---|---|---|---|
| MCP Registry (Oficial) | https://registry.modelcontextprotocol.io | Preview | Canónico, backed by Anthropic/GitHub/MS |
| Smithery | https://smithery.ai/servers | Live | Discovery + hosting |
| Glama | https://glama.ai/mcp/servers | Live | Index + quality/security signals |
| PulseMCP | https://www.pulsemcp.com/servers | Live | Aggregated listings |
| Docker MCP Catalog | https://hub.docker.com/mcp | Live | Containerized, curated |
| mcp.so | https://mcp.so | Live | Community listings |
| mcp.directory | https://mcp.directory | Live | Submissions + imports |
| Cline MCP Marketplace | https://cline.bot/mcp-marketplace | Live | In-client marketplace |

### 1.4 Registries de Payments/Commerce

| Registry | URL | Qué indexa |
|---|---|---|
| Coinbase x402 Bazaar | https://docs.cdp.coinbase.com/x402/buyer/discover-services | Payment-gated endpoints y MCP tools |
| Circle Agent Marketplace | https://developers.circle.com/agent-stack/agent-marketplace | 600+ x402 services, compliance-first |
| Agent402 Index | https://agent402.tools/marketplace | 2,080+ sellers (Base), 24K+ tools cross-chain |
| PayanAgent | https://payanagent.com | 24K+ live x402 services aggregados |

---

## 2. ¿Cómo se Registra un Agente?

### 2.1 A2A (Agent2Agent) — Google

**Mecanismo:** Agent Card JSON en `/.well-known/agent-card.json`

**Proceso:**
1. El desarrollador crea un Agent Card JSON con metadata del agente
2. El agente sirve el card en `https://{domain}/.well-known/agent-card.json`
3. Opcionalmente, se registra en Google Cloud Agent Registry:

```bash
gcloud agent-registry services create my-agent \
  --project=PROJECT_ID \
  --location=REGION \
  --display-name="My Agent" \
  --agent-spec-type=a2a-agent-card \
  --agent-spec-content=@agent-card.json
```

**Agent Card Schema (real, de la spec A2A):**

```json
{
  "name": "Recipe Agent",
  "description": "Agent that helps users with recipes and cooking.",
  "version": "1.0.0",
  "supportedInterfaces": [
    {
      "protocol": "A2A",
      "url": "https://recipe-agent.example.com/a2a"
    }
  ],
  "provider": {
    "organization": "Example Corp",
    "url": "https://example.com"
  },
  "capabilities": {
    "extendedAgentCard": true
  },
  "skills": [
    {
      "name": "recipe_search",
      "description": "Search for recipes based on ingredients, cuisine, or dietary requirements"
    },
    {
      "name": "nutrition_info",
      "description": "Get nutritional information for recipes"
    }
  ],
  "defaultInputModes": ["text"],
  "defaultOutputModes": ["text"],
  "securitySchemes": {
    "oauth2": {
      "type": "oauth2",
      "flows": {
        "clientCredentials": {
          "tokenUrl": "https://auth.example.com/token",
          "scopes": {}
        }
      }
    }
  }
}
```

**Campos requeridos:** `name`, `description`, `supportedInterfaces`, `version`, `capabilities`, `defaultInputModes`, `defaultOutputModes`, `skills`

**Validación:** No hay validación centralizada de claims. El registry de Google Cloud verifica namespace, no capabilities.

**Fuente:** [A2A Spec](https://a2a-protocol.org/latest/specification/), [Google Cloud Docs](https://docs.cloud.google.com/agent-registry/register-agents)

### 2.2 MCP Registry (Oficial)

**Mecanismo:** `server.json` + namespace verification (DNS o GitHub)

**Proceso:**
1. Crear un `server.json` con metadata del server
2. Verificar namespace ownership (reverse-DNS: `io.github.username/server-name` o `com.example/server`)
3. Submit via publisher tool o GitHub PR

**server.json Schema (real, del registry):**

```json
{
  "name": "io.github.user/server-name",
  "description": "A server that does X",
  "repository": {
    "url": "https://github.com/user/server-name",
    "source": "github",
    "id": "b94b5f7e-..."
  },
  "version_detail": {
    "version": "1.0.0",
    "release_date": "2026-01-15",
    "is_latest": true
  },
  "packages": [
    {
      "registry_name": "npm",
      "name": "@user/server-name",
      "version": "1.0.0"
    }
  ],
  "remotes": [
    {
      "transport_type": "sse",
      "url": "https://server.example.com/mcp"
    }
  ]
}
```

**API:** `GET /v0.1/servers`, `GET /v0.1/servers/{serverName}/versions/{version}`

**Fuente:** [GitHub](https://github.com/modelcontextprotocol/registry), [OpenAPI](https://github.com/modelcontextprotocol/registry/blob/main/docs/reference/api/openapi.yaml)

### 2.3 ARD (Agentic Resource Discovery)

**Mecanismo:** Publish `/.well-known/ard.json` en tu dominio

**Proceso:**
1. Publisher crea un manifest en `/.well-known/ard.json`
2. Registries crawlean y indexan el manifest
3. Discovery via search API federada

**Ejemplo de ard.json (de la spec):**

```json
{
  "version": "0.9",
  "entries": [
    {
      "type": "application/a2a+json",
      "name": "My Agent",
      "url": "https://example.com/.well-known/agent-card.json",
      "description": "An agent that helps with tasks",
      "capabilities": ["summarization", "translation"]
    },
    {
      "type": "application/mcp+json",
      "name": "My MCP Server",
      "url": "https://example.com/mcp",
      "description": "A tool server for data analysis"
    }
  ]
}
```

**Búsqueda federada:**

```json
{
  "query": {
    "text": "summarize legal documents",
    "filter": {
      "capabilities": ["summarization"]
    }
  },
  "federation": "auto"
}
```

**Fuente:** [ARD Spec](https://agenticresourcediscovery.org/spec/), [Interoperability](https://agenticresourcediscovery.org/interoperability/)

### 2.4 agents.txt / agents.json

**Mecanismo:** Archivos en root del dominio (`/agents.txt`, `/agents.json`) o well-known (`/.well-known/agents.txt`, `/.well-known/agents.json`)

**Dos specs competidoras:**
1. **IETF Draft** (`draft-car-agents-txt-wellknown-00`): `/.well-known/agents.txt` y `/.well-known/agents.json`
2. **agents-txt.com**: `/agents.txt` y `/agents.json` (root-level, como robots.txt)

**Propósito:** Declaración positiva de qué PUEDE hacer un agente en un sitio — endpoints sancionados, protocolos soportados, autenticación, rate limits.

**agents.json ejemplo:**

```json
{
  "agents": {
    "allow": ["/api/*"],
    "disallow": ["/admin/*"],
    "protocols": ["REST", "MCP", "A2A"],
    "authentication": ["oauth2", "api_key"],
    "rate_limit": "100/minute"
  }
}
```

**Relación con llms.txt:** Complementario. `llms.txt` = "qué contenido hay aquí" (para LLMs). `agents.txt` = "qué acciones están permitidas aquí" (para agentes).

**Fuente:** [IETF Draft](https://datatracker.ietf.org/doc/html/draft-car-agents-txt-wellknown-00), [agents-txt.com](https://agents-txt.com/spec), [GitHub](https://github.com/agents-txt/agents-txt)

### 2.5 MARS

**Mecanismo:** Signed entries con 7 verbos: `register`, `resolve`, `discover`, `update`, `revoke`, `transfer`, `federate`

**Registro requiere:**
- Signed record (JCS canonicalization)
- Capability apropiada
- Idempotency key
- MINTS bond (proporcional al risk tier, slashable por misbehavior)

**MARS-QL Query:**

```bash
curl "$MARS_URL/v1/discover/marsql" \
  -H 'Content-Type: application/json' \
  --data '{
    "query": "DISCOVER AgentDefinition WHERE tags CONTAINS \"research\" ORDER BY published_at DESC LIMIT 10"
  }'
```

**Fuente:** [MARS Spec](https://mars.glass/spec), [Docs](https://docs.mars.glass/)

---

## 3. Protocolos y Formatos de Discovery

### Tabla Comparativa de Protocolos

| Protocolo/Estándar | Tipo | Discovery | Communication | Registry | Identity | Payment | Estado 2026 |
|---|---|---|---|---|---|---|---|
| **A2A** (Google) | Comunicación agent-to-agent | Agent Card en well-known | ✅ JSON-RPC/HTTP | No prescribe registry API | Agent Card signatures | No | Shipping, Linux Foundation |
| **MCP** (Anthropic) | Protocolo host↔tool server | server.json en registry | ✅ JSON-RPC | Official Registry (preview) | Namespace verification | No nativo | Ampliamente adoptado |
| **ARD** | Discovery layer federado | `/.well-known/ard.json` | No (overlay) | Federated search API | Domain-anchored | No | Spec jun 2026, implementaciones |
| **UCP** (Google/Shopify) | Commerce protocol | `/.well-known/ucp` profile | ✅ REST/MCP/A2A | Via catalogs (Shopify) | OAuth 2.0 + AP2 mandates | ✅ AP2, checkout | Jan 2026, production |
| **ACP** (OpenAI/Stripe) | Commerce checkout | Product feeds | ✅ REST checkout API | Approved partners only | Merchant verification | ✅ Stripe SPT | Beta, production |
| **x402** (Coinbase/LF) | HTTP payment protocol | Bazaar extension (opcional) | HTTP 402 challenge/response | Via facilitators/Bazaar | Wallet identity | ✅ Stablecoins | Shipping, 3.1M+ txns |
| **AGNTCY ADS** | Distributed directory | DHT + REST API | Via records | Federated peer instances | OASF records + DIDs | No | Open source, IETF draft |
| **MARS** | Federated signed registry | MARS-QL queries | No (registry only) | Self-hostable + federation | Signed entries + bonds | Bonds (slashable) | Spec v1.0, Rust 0.1.0 |
| **agents.txt/json** | Site-level capability declaration | `/agents.txt`, `/agents.json` | No (declaration only) | No | Domain ownership | Optional (x402 blocks) | IETF draft |
| **ANS** (ITU) | DNS-inspired naming | DNS resolution | Adapter layer (A2A/MCP/ACP) | Agent Registry with certs | Certificate-based | No | Draft/proposal |
| **ERC-8004** | On-chain identity/reputation | Chain indexers | Registration files → endpoints | On-chain registry | DID-linked | Chain-native | Deployed, evolving |
| **IICP** | Intent-based discovery | Intent URN queries | Node routing | Intent Registry + Node Directory | Node profiles | No | Live, PHP/Rust |

### Detalle de Protocolos Clave

#### A2A (Agent2Agent) — Lo que necesitas saber

**Es:** Un protocolo de COMUNICACIÓN agent-to-agent con un formato de METADATA (Agent Card).

**No es:** Un registry ni un servicio de discovery centralizado.

**El Agent Card es el estándar de facto** para describir un agente. Campos clave:
- `name`, `description`, `version`
- `supportedInterfaces` (protocolos soportados)
- `capabilities` (qué puede hacer el agente)
- `skills` (habilidades específicas, descriptivas)
- `securitySchemes` (cómo autenticarse)
- `signatures` (JWS para verificación de provenance)

**Extended Agent Card:** Solo accesible tras autenticación, puede revelar más skills/capabilities.

**Discovery en A2A:** A2A explícitamente **NO prescribe una API de registry curada**. Un agente descubre otro por:
1. Fetch del well-known URL del dominio conocido
2. Query a un registry compatible
3. Configuración directa

**Fuente:** [A2A Spec](https://a2a-protocol.org/latest/specification/)

#### ARD — La Pieza que Más se Acerca a tu Idea

**ARD es un SUPERSET de discovery.** No reemplaza registries; actúa como un overlay federado que los une.

Cita textual de la spec:
> "ARD inverts the relationship. Instead of publishing into each collection, a publisher describes a resource once on its own domain, and any discovery service can index it organically — no central gatekeeper."

**Soporta:** A2A agents, MCP servers, APIs, skills, cualquier recurso agentic.

**Federación:** Modos `auto`, `referrals`, `none`.

**Relación con AGNTCY:** AGNTCY Directory implementa ARD como spec de discovery.

**Fuente:** [ARD Spec](https://agenticresourcediscovery.org/spec/), [Interoperability](https://agenticresourcediscovery.org/interoperability/)

#### UCP — El Protocolo de Commerce que Importa

**UCP es para COMMERCE lo que A2A es para COMUNICACIÓN.**

- Co-desarrollado por Google y Shopify
- Cubre discovery → checkout → order → post-purchase
- Merchants publican `/.well-known/ucp` con capabilities
- AI agents query catalogs (ej: Shopify Catalog MCP)
- Soporta REST, MCP y A2A como transports
- AP2 (Agent Payments Protocol) para pagos autónomos con mandatos criptográficos

**Shopify ya lo usa en producción:** Merchants son UCP-enabled por default. AI agents pueden hacer `search_catalog`, `lookup_catalog`, `get_product` via MCP.

**Fuente:** [UCP.dev](http://ucp.dev/), [GitHub](https://github.com/Universal-Commerce-Protocol/ucp)

---

## 4. ¿Existe un Registry Universal?

### Respuesta directa: **NO existe un "DNS for AI Agents" universal.**

Existen múltiples intentos, pero están **fragmentados**:

| Enfoque | Builder | Qué existe en 2026 | Por qué no es universal |
|---|---|---|---|
| ARD + AGNTCY | Google, Microsoft, Cisco/AGNTCY | Spec abierta + implementación federada | Requiere adopción masiva de publishers |
| MARS | MARS Project | Spec v1.0, Rust server | Proyecto temprano, no mainstream |
| ANS (Agent Name Service) | ITU / propuesta académica | Draft/paper | Solo propuesta, no implementado |
| NANDA Index | MIT | Proyecto de investigación | Scope limitado, experimental |
| DNS-AID | Infoblox/GoDaddy | IETF drafts | En desarrollo, no adoptado |
| ERC-8004 | Ethereum community | On-chain registries | Solo blockchain ecosystem |
| MCP Registry | Anthropic/community | Preview, funcional | Solo MCP servers |
| A2A directories | Community projects | Varios live | Fragmentados, sin API unificada |

### ¿Por qué no existe?

1. **A2A no prescribe una API de registry curada** — deliberadamente deja esto fuera del protocolo
2. **Cada ecosistema tiene su propio registry** — AWS, Microsoft, Google, Salesforce, etc.
3. **El problema combina múltiples tipos de recursos** — agentes, tools, APIs, negocios, servicios
4. **Trust y identity no están resueltos** — no hay un "CA" para agentes
5. **Incentivos económicos divergen** — cada plataforma quiere ser THE registry

### Lo más cercano que existe: ARD

ARD es la spec que más se acerca a resolver esto. Su diseño:
- Publish once en tu dominio → indexable por cualquier discovery service
- Soporta A2A, MCP, APIs, cualquier recurso
- Federación entre registries
- No requiere un gatekeeper central

**PERO:** ARD fue anunciado en junio 2026 — es muy nuevo. Adopción limitada.

---

## 5. Business Discovery

### ¿Puede un negocio registrarse para ser descubierto por agentes?

**Sí, pero solo en contextos específicos de e-commerce:**

#### Shopify Catalog + UCP (El más avanzado)
- **URL:** https://shopify.dev/docs/agents/catalog
- **Qué hace:** Merchants Shopify son automáticamente descubribles por AI agents
- **Scope:** Productos de Shopify merchants
- **API:** MCP tools `search_catalog`, `lookup_catalog`, `get_product`
- **Endpoint Global:** `https://catalog.shopify.com/api/ucp/mcp`
- **Endpoint Store:** `https://{storeDomain}/api/ucp/mcp`
- **UCP Profile:** `/.well-known/ucp`
- **Merchants elegibles por default** — sin trabajo adicional
- **Limitación:** Solo Shopify merchants, solo productos, no servicios locales genéricos

#### OpenAI/Stripe ACP (ChatGPT Shopping)
- **URL:** https://developers.openai.com/commerce/guides/get-started
- **Qué hace:** Merchants envían product feeds → ChatGPT indexa → usuarios descubren
- **Scope:** Approved partners only (no es open)
- **Limitación:** Cerrado a partners aprobados, self-serve planeado pero no GA

#### Google Merchant Center + Business Agent
- **URL:** https://business.google.com/us/merchant-center/
- **Requisitos:** Cuenta verificada, brand profile, 50+ approved free listings (solo US ecommerce)
- **Limitación:** Solo US, solo ecommerce con productos listados

#### x402 Bazaar (Para APIs/Tools pagados)
- **URL:** https://docs.cdp.coinbase.com/x402/seller/get-discovered
- **Qué hace:** Seller lista endpoint pagado → indexado por facilitators → descubrible por agentes
- **Scope:** APIs y tools pagados con x402, no negocios del mundo real

### ¿Qué hay para negocios locales (restaurantes, hoteles, etc.)?

**Casi nada específico para agent discovery.**

Los negocios locales dependen de:
1. **Google Business Profile** — no tiene API de agent discovery nativa
2. **Schema.org structured data** — ayuda a legibilidad machine pero no es un registry
3. **Yelp, TripAdvisor, etc.** — no tienen protocolos agent-native

**Productos emergentes identificados:**
- **anewera.ai** — genera `agent.md` y `agent.json` business profiles con API/MCP endpoint
- **Local SEO Data** — REST/MCP server que retorna data de Google Business Profile como JSON

### Gap crítico identificado: **NO existe infraestructura para convertir un negocio local en agent-discoverable.**

Esto es **exactamente** donde Bot247 podría aportar valor.

---

## 6. Modelo Económico

### Pricing de Registries

| Registry/Plataforma | Registro | Discovery | Per-call | Transaction | Revenue share |
|---|---|---|---|---|---|
| MCP Registry (Oficial) | Gratis | Gratis (API pública) | No | No | No |
| A2A Registry (público) | Gratis | Gratis | No | No | No |
| AGNTCY ADS | Gratis (self-host) | Gratis | No | No | No |
| MARS | Self-host (costo infra) | Gratis (query) | No | Bonds slashable | No |
| AWS Agent Registry | Free tier: 5K records | Free tier: 1M searches | Después: usage-based | No | No |
| Microsoft Agent 365 | $15/user/month | Incluido | Incluido | No | No |
| MuleSoft Agent Fabric | Desde $2K/month | Incluido | Incluido | No | No |
| Google Cloud Marketplace | Listing gratuito | Gratuito | Revenue share (Google) | Sí | Sí |
| Circle Agent Marketplace | Gratuito (curated) | Gratuito | x402 per-request | Sí (USDC) | No |
| Agent Exchange | Free (passport) | Gratuito | 0.05 USDC/task post | Wallet-to-wallet | Toll fee only |

### Agent-to-Agent Payments — ¿Ya existe?

**Sí, existe y está activo:**

#### x402 Protocol (Coinbase / Linux Foundation)
- **Mecanismo:** HTTP 402 → payment challenge → stablecoin payment → retry → resource
- **Volumen real:** 3.1M transacciones en 30 días (mayo 2026 en Base)
- **Valor transferido:** $1.2M en 30 días
- **Sellers:** 2,080+ en Base, 24K+ cross-chain
- **Implementaciones:** Coinbase, Cloudflare, Amazon Bedrock AgentCore
- **Batch settlement:** Para high-frequency — vouchers criptográficos → settle en bulk
- **Fuente:** [x402.org](https://x402.org/), [Base Blog](https://blog.base.org/the-agentic-economy-is-here)

#### Stripe MPP (Machine Payments Protocol)
- **Lanzamiento:** Marzo 2026
- **Mecanismo:** HTTP payment challenges, soporta stablecoins + cards
- **Diferencia con x402:** Soporta también pagos con tarjeta (pero minimums hacen micropagos imprácticos)
- **Fuente:** [Stripe Blog](https://stripe.com/blog/machine-payments-protocol)

#### AP2 (Agent Payments Protocol — Google)
- **Mecanismo:** Mandatos criptográficos firmados que prueban autorización del usuario
- **Para:** Pagos delegados donde un agente actúa en nombre del usuario
- **Diferencia:** No es un rail de pago, es un framework de AUTORIZACIÓN
- **Fuente:** [Google Cloud Blog](https://cloud.google.com/blog/products/ai-machine-learning/announcing-agents-to-payments-ap2-protocol)

#### Agent Exchange (Task Marketplace)
```
1. Register agent passport (free) — name, skills, wallet, endpoint
2. Post task with budget (0.05 USDC toll fee via x402)
3. Agents bid (free)
4. Poster awards one
5. Settlement wallet-to-wallet via x402
6. Receipt on-chain → BotScore reputation
```
**URL:** https://exchange.agentexchange.work/
**Endpoints reales:**
- `POST /agents/register`
- `GET /tasks` — discover open work
- `POST /tasks` — create task (x402 0.05 USDC)
- `POST /tasks/{id}/bids`
- `POST /tasks/{id}/award`
- `POST /tasks/{id}/receipt`

### Discovery + Transaction conectados

**Sí existe, en el ecosistema x402:**

1. **Agente descubre** servicio en Bazaar/Circle Marketplace
2. **Agente llama** al endpoint
3. **Recibe 402** con terms de pago
4. **Paga** (USDC, gasless)
5. **Recibe** resultado
6. **Receipt** on-chain como proof

El pago ES la autenticación. No hay API keys, no hay cuentas.

---

## 7. Discovery vs Transaction Pipeline

### Estado de cada capa en 2026

| Capa | Estado | Soluciones existentes | Gaps |
|---|---|---|---|
| **DISCOVERY** — "¿Quién puede hacer esta tarea?" | 🟡 Parcialmente resuelto | A2A cards, MCP Registry, ARD, AGNTCY, x402 Bazaar | Fragmentado por protocolo/tipo. No hay un discovery universal cross-everything |
| **MATCHING** — "¿Cuál es adecuada?" | 🟡 Parcialmente resuelto | Capability-based search (ARD, ADS), semantic search (Bazaar) | No hay ranking estandarizado, no hay comparación cross-registry |
| **TRUST** — "¿Puedo confiar?" | 🔴 Problema abierto | ERC-8004 (on-chain), MARS bonds, Agent Card signatures, BotScore (x402) | No hay trust universal. Firma verifica publisher, no quality. Reputation no portable |
| **INTERACTION** — "¿Cómo me comunico?" | 🟢 Resuelto | A2A protocol, MCP protocol, REST APIs, UCP transports | Interoperabilidad cross-protocol es el reto |
| **TRANSACTION** — "¿Puedo pagarle?" | 🟡 Parcialmente resuelto | x402 (stablecoins), MPP (Stripe), AP2 (Google), UCP checkout | Solo para crypto o partners aprobados. Pagos tradicionales requieren setup |
| **EXECUTION** — "¿Puede realizar la acción?" | 🟢 Resuelto (per-protocol) | A2A tasks, MCP tool calls, REST API calls, UCP checkout flows | Depende del protocolo del endpoint |

### El "Full Stack" que falta

```
DISCOVERY      → ARD/AGNTCY (nuevo, poca adopción)
  ↓
MATCHING       → No hay solución cross-registry estándar
  ↓
TRUST          → No hay solución dominante
  ↓
INTERACTION    → A2A/MCP/REST (resuelto per-protocol)
  ↓
TRANSACTION    → x402/MPP/AP2 (fragmentado por rail)
  ↓
EXECUTION      → Protocol-dependent (resuelto)
```

**La oportunidad está en las primeras 3 capas, especialmente para NEGOCIOS.**

---

## 8. Competitive Landscape

### Tabla Comparativa Completa

| # | Producto | Organización | Tipo | Agent Discovery | Business Discovery | Protocolos | Agent Card | API | Registro Auto | Verificación | Trust | Actions | Transactions | Payments | Precio | Open Source | Cómo se registra | Cómo se descubre | URL |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | **ARD Spec** | Google/MS/Cisco | Spec de discovery | ✅ | ❌ | A2A, MCP, APIs | Via entries | REST search | Via crawl | Domain-anchored | No | No (discovery only) | No | No | Gratis (spec) | ✅ | `/.well-known/ard.json` | Federated search | https://agenticresourcediscovery.org |
| 2 | **AGNTCY ADS** | Linux Foundation | Registry distribuido | ✅ | ❌ | OASF, ARD, A2A/MCP | OASF records | REST + DHT | No | Records validation | Verifiable claims | Via referencia | No | No | Gratis (self-host) | ✅ | Publish records | Capability queries/DHT | https://dir.agntcy.org |
| 3 | **A2A Registry** | Community | Directory público | ✅ | ❌ | A2A | ✅ Agent Cards | ✅ | Manual | Básica | ❌ | Via A2A protocol | ❌ | Metadata only | Gratis | ✅ | Submit Agent Card | Browse/API | https://a2a-registry.org |
| 4 | **MCP Registry** | Anthropic/community | Metadata registry | ❌ (tools only) | ❌ | MCP | server.json | ✅ REST | Publish tool | DNS/GitHub namespace | ❌ | Via MCP connect | ❌ | ❌ | Gratis | ✅ | publisher tool + PR | REST API | https://registry.modelcontextprotocol.io |
| 5 | **Shopify Catalog** | Shopify | Commerce catalog | ❌ | ✅ (merchants) | UCP, MCP | UCP profile | ✅ MCP | ✅ Default | Merchant account | Shopify-verified | ✅ Checkout | ✅ | ✅ UCP/AP2 | Incluido en Shopify | ❌ | Auto (Shopify merchant) | `search_catalog` MCP | https://shopify.dev/docs/agents/catalog |
| 6 | **UCP** | Google/Shopify | Commerce protocol | ❌ | ✅ (merchants) | REST, MCP, A2A | `/.well-known/ucp` | ✅ | ✅ (Shopify) | OAuth 2.0 | AP2 mandates | ✅ Full checkout | ✅ | ✅ | Spec gratis | ✅ | Publish UCP profile | Agent fetches profile | https://ucp.dev |
| 7 | **OpenAI ACP** | OpenAI/Stripe | Commerce checkout | ❌ | ✅ (approved) | REST | Product feeds | ✅ | ❌ (manual) | Partner approval | Stripe-verified | ✅ Checkout | ✅ | ✅ Stripe SPT | Stripe fees | ✅ (spec) | Apply + product feed | ChatGPT shopping | https://agenticcommerce.dev |
| 8 | **x402 Bazaar** | Coinbase/LF | Payment discovery | ✅ (paid APIs) | ❌ | x402, HTTP, MCP | Bazaar metadata | ✅ | Via facilitators | Compliance screening | Sanctions check | ✅ HTTP call | ✅ | ✅ USDC | Gratis discovery | ✅ (protocol) | Enable x402 + Bazaar | Semantic search API | https://docs.cdp.coinbase.com/x402 |
| 9 | **MARS** | MARS Project | Federated registry | ✅ | ❌ | MARS protocol | 14 entry types | ✅ REST | ❌ | Signed entries | Bonds slashable | No | No | Bonds | Self-host cost | ✅ (Apache 2.0) | Signed record + bond | MARS-QL queries | https://mars.glass |
| 10 | **AWS Agent Registry** | AWS | Enterprise catalog | ✅ (internal) | ❌ | MCP, AWS APIs | Custom records | ✅ | Partial | AWS IAM | AWS governance | Via agents | ❌ | ❌ | Free tier → usage | ❌ | Console/SDK/CLI | Internal search | https://aws.amazon.com/bedrock/agentcore |
| 11 | **Agent Exchange** | Independent | Task marketplace | ✅ | ❌ | x402, REST | Agent passport | ✅ | Manual | ❌ | BotScore | ✅ Task execution | ✅ | ✅ USDC p2p | 0.05 USDC/task | ❌ | POST /agents/register | GET /tasks | https://exchange.agentexchange.work |
| 12 | **Circle Marketplace** | Circle | Curated x402 catalog | ✅ (x402) | ❌ | x402, USDC | Structured listings | ✅ | ❌ | ✅ Sanctions | ✅ Compliance | ✅ Per-request | ✅ | ✅ USDC | Gratis discovery | ❌ | Submit service | Catalog API | https://developers.circle.com/agent-stack |

---

## 9. ¿Qué Está Commoditizado?

### Ya es infraestructura estándar (NO construir):

| Componente | Estado | Evidencia |
|---|---|---|
| **Agent Cards (A2A)** | ✅ Commoditizado | Spec estable, Google Cloud, multiple registries |
| **MCP server discovery** | ✅ Commoditizado | Registry oficial + 8+ directorios |
| **server.json format** | ✅ Commoditizado | Estándar de facto para MCP |
| **A2A communication** | ✅ Commoditizado | Linux Foundation, amplia adopción |
| **MCP communication** | ✅ Commoditizado | Estándar de facto, todas las plataformas |
| **x402 micropayments** | ✅ Commoditizado | SDKs, facilitators, 24K+ servicios |
| **UCP commerce (Shopify)** | ✅ Commoditizado (para Shopify) | Production, merchants by default |
| **Enterprise agent registries** | ✅ Commoditizado | AWS, Microsoft, MuleSoft, Kong |
| **Product feed → AI shopping** | ✅ Commoditizado (para ecommerce grande) | OpenAI/Stripe ACP, Shopify, Google |

### En progreso (se está resolviendo):

| Componente | Estado | Quién lo resuelve |
|---|---|---|
| **ARD federated discovery** | 🟡 Nuevo (jun 2026) | Google, Microsoft, AGNTCY |
| **agents.txt/agents.json** | 🟡 Drafts | IETF, community |
| **Cross-registry search** | 🟡 En progreso | ARD, AGNTCY ADS |
| **Agent identity (DID/VC)** | 🟡 En progreso | AGNTCY, ERC-8004 |

### NO resuelto (oportunidad):

| Componente | Estado | Evidencia de gap |
|---|---|---|
| **Business discovery para agentes** | 🔴 No resuelto | Solo ecommerce grande (Shopify/OpenAI). Nada para negocios locales |
| **SMB agent-readiness** | 🔴 No resuelto | Solo anewera.ai (muy temprano). No hay plataforma mainstream |
| **Trust/reputation portable** | 🔴 No resuelto | Fragmentado, no estandarizado |
| **Cross-protocol discovery** | 🔴 No resuelto | ARD es el intento pero es muy nuevo |
| **Local business → agent profile** | 🔴 No resuelto | Nadie convierte info de negocio local en profile discoverable |
| **Service discovery (no ecommerce)** | 🔴 No resuelto | Restaurantes, doctores, servicios → invisible para agentes |

---

## 10. Problemas Abiertos

### 10.1 Los 10 Problemas Más Importantes Sin Resolver

1. **No hay discovery universal cross-type** — Un solo query no puede encontrar agentes + negocios + APIs + MCP servers + servicios
2. **Business discovery para SMBs no existe** — Millones de negocios son invisibles para agentes
3. **Trust y reputation no son portables** — Cada registry tiene su propio sistema
4. **Identity verification es débil** — Agent Cards verifican publisher, no calidad ni veracidad
5. **Cross-protocol discovery fragmentado** — ARD es nuevo, sin adopción masiva
6. **Business onboarding es manual y costoso** — No hay pipeline automatizado para hacer un negocio agent-ready
7. **Stale information** — Endpoints cambian, negocios cierran, datos se desactualizan
8. **Capability matching es semántico, no estandarizado** — No hay taxonomía universal de capabilities
9. **Agent-to-agent payments para servicios del mundo real** — x402 funciona para APIs, no para reservaciones de restaurante
10. **Small/local business discovery** — Google Business Profile no tiene protocol agent-native

### 10.2 El Gap Más Grande: Business → Agent Bridge

```
SITUACIÓN ACTUAL:

Negocio tiene:
├── Website (humano)
├── Google Maps (humano)
├── Instagram (humano)
├── WhatsApp (humano)
└── ??? (agentes) ← NO EXISTE

SITUACIÓN DESEADA:

Negocio tiene:
├── Website (humano)
├── Google Maps (humano + agentes parcial)
├── Instagram (humano)
├── WhatsApp (humano)
├── Agent Card / ARD entry (agentes)
├── UCP Profile (commerce agents)
├── MCP Server (tool agents)
└── Structured Business Profile (consulta)
```

**¿Quién está bridging este gap?** Prácticamente nadie para negocios locales.

---

## 11. Análisis de la Variación de la Idea

### La idea: "Universal Discovery Layer"

```
USER REQUEST
     ↓
DISCOVERY LAYER (tu producto)
     ↓
  ┌──────────────────────────────┐
  │  A2A Agents                  │
  │  MCP servers                 │
  │  APIs                        │
  │  Businesses (SIN agente)     │
  │  Businesses (CON agente)     │
  │  Services                    │
  └──────────────────────────────┘
     ↓
Capability matching
     ↓
Trust / verification
     ↓
Interaction
     ↓
Transaction / action
```

### ¿Ya existe esta capa?

**ARD es lo más cercano conceptualmente**, pero:

| Aspecto | ARD | Tu idea |
|---|---|---|
| A2A agents | ✅ | ✅ |
| MCP servers | ✅ | ✅ |
| APIs | ✅ | ✅ |
| **Negocios SIN agente** | ❌ | ✅ ← DIFERENCIADOR |
| **Negocios CON agente** | Parcial (si tienen A2A card) | ✅ |
| **Servicios locales** | ❌ | ✅ ← DIFERENCIADOR |
| Capability matching | Text search | ✅ Enhanced |
| Trust | Domain-anchored | ✅ Business verification |
| Transaction | No | ✅ Opcional |
| **Onboarding automatizado** | No | ✅ ← DIFERENCIADOR (via Bot247) |

### Veredicto: La idea COMO discovery layer genérico compite con ARD. Pero el DIFERENCIADOR está en la parte de BUSINESS discovery.

---

## 12. Hypothesis: Agent-Ready Businesses

### "Millions of small businesses will eventually need to become discoverable and usable by AI agents."

#### Evidencia a favor:

1. **Accenture (FY26 report):** "Nearly all companies will need to structure their offerings to be seen and chosen by AI agents."
   - Fuente: [Accenture Agentic Commerce Report](https://www.accenture.com/content/dam/accenture/final/accenture-com/document-fy26/q3/Accenture-Agentic-Commerce-FY26-Unmissable-Report.pdf)

2. **EY:** "The winners will be the businesses whose products, prices, rules and promises are clear and consistent enough for machines to trust and to scale."
   - Fuente: [EY Agentic Commerce Strategy](https://www.ey.com/en_us/insights/ai/agentic-commerce-strategy)

3. **Shopify:** Merchants son UCP-enabled por default. UCP es "the open standard for how agents and merchants interact."
   - Fuente: [Shopify Spring '26 Edition](https://www.shopify.com/news/spring-26-edition-merchant)

4. **OpenAI:** ChatGPT shopping product discovery está live, con ACP como estándar.
   - Fuente: [OpenAI Commerce](https://developers.openai.com/commerce)

5. **DeepLumen Benchmark:** "Agentic commerce readiness is the ability of a merchant to be discovered, understood, recommended, purchased from, and supported by AI agents."
   - Fuente: [DeepLumen Benchmark](https://www.deeplumen.com/whitepapers/agentic-commerce-readiness-benchmark/)

#### Gap para SMBs:

**Todo lo anterior aplica a ecommerce grandes (Shopify merchants, approved OpenAI partners).**

Para un restaurante, hotel, doctor o servicio local en México:
- ❌ No tiene tienda Shopify
- ❌ No va a aplicar como partner de OpenAI
- ❌ No tiene API
- ❌ No sabe qué es un Agent Card
- ❌ No puede implementar UCP
- ❌ No tiene equipo técnico

**Necesita una plataforma que lo convierta automáticamente en agent-ready.** Eso es Bot247.

### Infraestructura que falta para "Agent-Ready SMBs"

```
SMB proporciona:
├── Nombre del negocio
├── Categoría
├── Ubicación
├── Horarios
├── Productos/Servicios
├── Precios
├── Políticas
├── Contacto
└── FAQ

Se necesita generar:
├── Business Profile (structured, machine-readable)
├── Agent Card (si tiene agente Bot247)
├── ARD entry (para discovery)
├── agents.json (capabilities)
├── UCP-compatible profile (para commerce)
├── MCP endpoint (para queries)
└── Registry listing (para indexación)
```

**¿Quién hace esto hoy?** Nadie mainstream. Solo anewera.ai (muy temprano, scope limitado).

---

## 13. Relación con Bot247

### Evaluación: Bot247 como "Agentification Layer"

#### CASO 1: Business SIN agente

Bot247 tiene el Documento Maestro → puede generar:

```json
{
  "version": "1.0",
  "type": "business-profile",
  "business": {
    "name": "Tacos El Paisa",
    "category": "restaurant",
    "subcategory": "mexican",
    "location": {
      "address": "Av. Revolución 123, Monterrey, NL, México",
      "coordinates": {"lat": 25.6866, "lng": -100.3161}
    },
    "hours": {
      "monday": {"open": "10:00", "close": "22:00"},
      "sunday": "closed"
    },
    "services": ["dine-in", "takeout", "delivery"],
    "menu": [
      {
        "name": "Tacos al pastor",
        "price": {"amount": 45, "currency": "MXN"},
        "dietary": ["contains-gluten"]
      }
    ],
    "policies": {
      "reservations": false,
      "minimum_order_delivery": {"amount": 150, "currency": "MXN"}
    },
    "contact": {
      "phone": "+52-81-1234-5678",
      "whatsapp": "+52-81-1234-5678"
    }
  },
  "capabilities": {
    "query_info": true,
    "check_hours": true,
    "view_menu": true,
    "make_reservation": false,
    "place_order": false
  },
  "discovery": {
    "ard_entry": "https://bot247.mx/.well-known/ard.json",
    "agent_card": null,
    "mcp_endpoint": "https://api.bot247.mx/mcp/businesses/tacos-el-paisa"
  }
}
```

Un agente externo puede:
- ✅ Descubrir el negocio
- ✅ Consultar información (horarios, menú, precios)
- ✅ Obtener ubicación y contacto
- ❌ No puede ejecutar acciones (sin agente)

#### CASO 2: Business CON agente Bot247

Además del Business Profile, genera un Agent Card:

```json
{
  "name": "Tacos El Paisa Agent",
  "description": "AI assistant for Tacos El Paisa restaurant in Monterrey. Can answer questions, check availability, and take orders.",
  "version": "1.0.0",
  "provider": {
    "organization": "Bot247",
    "url": "https://bot247.mx"
  },
  "supportedInterfaces": [
    {
      "protocol": "A2A",
      "url": "https://agents.bot247.mx/a2a/tacos-el-paisa"
    },
    {
      "protocol": "MCP",
      "url": "https://agents.bot247.mx/mcp/tacos-el-paisa"
    }
  ],
  "capabilities": {
    "streaming": true,
    "extendedAgentCard": false
  },
  "skills": [
    {
      "name": "menu_inquiry",
      "description": "Answer questions about the menu, prices, ingredients, and dietary options"
    },
    {
      "name": "order_placement",
      "description": "Take food orders for delivery or takeout"
    },
    {
      "name": "hours_inquiry",
      "description": "Provide business hours and holiday schedules"
    },
    {
      "name": "location_directions",
      "description": "Provide directions and location information"
    }
  ],
  "defaultInputModes": ["text"],
  "defaultOutputModes": ["text"]
}
```

Un agente externo puede:
- ✅ Descubrir el negocio
- ✅ Consultar información
- ✅ Comunicarse con el agente Bot247
- ✅ Ejecutar acciones (pedir comida, consultar disponibilidad)

### ¿Ya existe algo similar?

| Aspecto | ¿Existe? | Quién | Diferencia con Bot247 |
|---|---|---|---|
| Auto-generar Agent Card desde info de negocio | ❌ No mainstream | Solo anewera.ai (temprano) | Bot247 ya tiene el data pipeline (Documento Maestro) |
| Business Profile machine-readable para SMBs | ❌ No mainstream | Schema.org (manual) | Bot247 lo genera automáticamente |
| Registry que combine businesses + agents | ❌ No existe | Nada | Oportunidad clara |
| SMB → agent-ready pipeline automatizado | ❌ No existe | Nada mainstream | Esto ES el diferenciador |
| Agent que represente al negocio | Parcial | Wix Symphony (solo Wix) | Bot247 es cross-platform |

### Arquitectura propuesta Bot247 Agent-Ready

```
Business Owner
     ↓
Documento Maestro (info del negocio)
     ↓
Bot247 Platform
     ↓
  ┌────────────────────────────────────────┐
  │ Generates automatically:               │
  │                                        │
  │  1. Business Profile (structured JSON) │
  │  2. Agent Card (A2A compatible)        │
  │  3. ARD Entry (for discovery)          │
  │  4. MCP Endpoint (for tool queries)    │
  │  5. agents.json (capability declaration)│
  │  6. Bot247 AI Assistant (optional)     │
  │  7. Microsite                          │
  │  8. Knowledge Base                     │
  │  9. Chat widget                        │
  └────────────────────────────────────────┘
     ↓
Bot247 Registry (indexes all businesses)
     ↓
  ┌────────────────────────────────────────┐
  │ External agents can:                   │
  │                                        │
  │  → Discover businesses by capability   │
  │  → Query business information          │
  │  → Check hours, menu, prices           │
  │  → Talk to Bot247 agent (if exists)    │
  │  → Execute actions (orders, bookings)  │
  └────────────────────────────────────────┘
```

### ¿Es novedoso?

**Sí, por la combinación de:**
1. Auto-generación de profiles desde un solo documento
2. Soporte para negocios CON y SIN agente
3. Focus en SMBs locales (no ecommerce)
4. Registry que combina business profiles + agent capabilities
5. Multi-protocol output (A2A, MCP, ARD)

**Lo que NO es novedoso:**
- Agent Cards (commoditizado)
- MCP endpoints (commoditizado)
- Discovery APIs (ARD/AGNTCY hacen esto)

---

## 14. Hackathon Fit

### "BUILD SOMETHING AGENTS WANT"

#### Lo que sería INTERESANTE para agentes:
1. **Descubrir negocios locales** — los agentes HOY no pueden hacer esto bien
2. **Capability-based business search** — "encuentra un restaurante que pueda hacer reservaciones"
3. **Structured business data** — no scraping, datos limpios y actualizados
4. **MCP endpoint para queries** — el agente puede preguntar directamente

#### Lo que sería INFRAESTRUCTURA ABURRIDA:
1. Formularios de registro de negocios
2. Dashboard admin
3. UI bonita para humanos
4. Auth/billing system

#### Qué puede demostrarse en 4 horas (MVP):

```
MVP: "Business Discovery MCP Server"

1. Pre-cargar 10-20 negocios ficticios (o reales de Bot247)
   con datos estructurados completos

2. Crear un MCP Server que exponga:
   - search_businesses(query, location, category, capabilities)
   - get_business(id)
   - check_hours(id)
   - get_menu(id)  
   - get_services(id)

3. Crear un A2A Agent Card para un negocio Bot247
   que pueda responder preguntas

4. Crear un mini-registry con /.well-known/ard.json
   que liste todos los negocios

5. DEMO: Un agente de usuario (Claude/ChatGPT) usa el
   MCP server para descubrir negocios y ejecutar queries
```

#### Qué NO construir en el hackathon:
- ❌ Un registry completo distribuido (AGNTCY ya lo hace)
- ❌ Payments (x402 ya lo resuelve)
- ❌ Un Agent Card generator genérico (commoditizado)
- ❌ UI/dashboard para humanos
- ❌ Auth system complejo

#### Demo clara:

```
USUARIO → "Encuentra un restaurante mexicano en Monterrey 
           que esté abierto ahora y tenga opciones vegetarianas"

AGENTE → [usa Business Discovery MCP Server]
       → Encuentra 3 restaurantes compatibles
       → Muestra info estructurada
       → "¿Quieres que pregunte disponibilidad?"

USUARIO → "Sí, pregunta al primero"

AGENTE → [se comunica con el Agent Bot247 del restaurante via A2A]
       → "Hay mesa disponible para 2 a las 8pm"
       → "¿Quieres que reserve?"
```

---

## 15. Diferenciadores Propuestos — Evaluados con Evidencia

### A. Business Discovery MCP Server ⭐ RECOMENDADO PARA HACKATHON

**Propuesta:** Un MCP server que permite a cualquier agente descubrir y consultar negocios locales estructurados.

**Evidencia de oportunidad:**
- ❌ No existe un MCP server para business discovery de SMBs
- ✅ Los agentes ya usan MCP como protocolo principal de tools
- ✅ Shopify hace esto para ecommerce, nadie lo hace para servicios locales
- ✅ Demostrable en 4 horas
- ✅ Alineado con "BUILD SOMETHING AGENTS WANT"

**Riesgo:** Puede verse como "solo un MCP server con datos hardcoded"
**Mitigación:** Mostrar el pipeline Bot247 → structured data → MCP server como plataforma

### B. Agent-Ready Business Onboarding (Bot247 Extension) ⭐ VALOR LARGO PLAZO

**Propuesta:** Pipeline que toma Documento Maestro → genera automáticamente Business Profile + Agent Card + ARD entry + MCP endpoint.

**Evidencia de oportunidad:**
- ❌ Nadie hace esto automáticamente para SMBs
- ✅ Bot247 ya tiene el data pipeline
- ✅ anewera.ai es el único competidor (muy temprano)
- ✅ Accenture, EY, Shopify validan la tesis

**Riesgo:** Difícil de demostrar en 4 horas como plataforma completa
**Mitigación:** Mostrar el "before/after" — documento → profile → descubrible

### C. Cross-Protocol Discovery Layer 🟡 PARCIAL

**Propuesta:** Discovery layer que unifica A2A + MCP + APIs + Businesses.

**Evidencia de gap:**
- ✅ ARD intenta resolver esto pero es muy nuevo
- ✅ Fragmentación evidente entre ecosistemas

**Riesgo:** ARD/AGNTCY ya están trabajando en esto exactamente
**Evaluación:** **Evitar.** Compites directamente con Google, Microsoft y Cisco.

### D. Trust & Verification Layer 🔴 DEMASIADO AMBICIOSO

**Propuesta:** Sistema de trust/reputation para agentes y negocios.

**Evidencia de gap:**
- ✅ No hay trust universal
- ✅ Es un problema real

**Riesgo:** Demasiado complejo para un hackathon. Requiere masa crítica.
**Evaluación:** **No recomendado para hackathon.**

### E. Agent-to-Business Transaction Bridge 🟡 INTERESANTE PERO COMPLEJO

**Propuesta:** Conectar discovery con execution (reservaciones, pedidos).

**Evidencia:**
- ✅ UCP/ACP resuelven esto para ecommerce
- ❌ Nadie lo resuelve para servicios locales
- ✅ Técnicamente impresionante si funciona

**Riesgo:** 4 horas no son suficientes para implementar pagos reales
**Evaluación:** **Demo simulada sí, implementación real no.**

---

## 16. Conclusión y Resumen Ejecutivo

---

### RESUMEN EJECUTIVO

#### 1. ¿Ya existe exactamente esta idea?

**No exactamente.** ARD + AGNTCY ADS son lo más cercano al concepto de "universal discovery layer", pero:
- **No incluyen negocios sin agente** (solo recursos técnicos: agentes, MCP servers, APIs)
- **No tienen onboarding para SMBs** (requieren conocimiento técnico para registrarse)
- **No resuelven business discovery** para servicios locales

#### 2. ¿Qué productos se parecen más?

| Producto | Similitud | Diferencia clave |
|---|---|---|
| ARD Spec | 70% (discovery layer cross-protocol) | No incluye businesses sin agente |
| Shopify Catalog | 50% (business discovery) | Solo ecommerce Shopify |
| AGNTCY ADS | 60% (federated agent directory) | No business discovery |
| anewera.ai | 40% (agent-ready business profiles) | Muy temprano, no es registry |
| x402 Bazaar | 30% (discovery + payment) | Solo APIs pagados, no businesses |

#### 3. ¿Qué partes ya están resueltas?

- ✅ Agent Cards (A2A spec) — no construir
- ✅ MCP server protocol y registry — no construir
- ✅ Agent-to-agent communication (A2A) — no construir
- ✅ Micropayments (x402) — no construir
- ✅ E-commerce agentic (UCP/ACP) — no construir
- ✅ Enterprise agent registries — no competir

#### 4. ¿Qué parte sigue siendo un problema?

**EL PROBLEMA PRINCIPAL:** Los negocios locales y SMBs son invisibles para agentes de IA.

No hay:
- Pipeline automatizado para hacer un negocio agent-ready
- Registry que combine businesses (con y sin agente)
- MCP server para descubrir negocios locales por capability
- Estándar para "Business Profile" machine-readable para SMBs

#### 5. ¿Dónde existe una oportunidad real?

**En el "last mile" de agent-readiness para SMBs:**

```
Enterprise/Ecommerce ← YA RESUELTO (Shopify, UCP, ACP)
     ↑
   [GAP] ← AQUÍ ESTÁ LA OPORTUNIDAD
     ↓
SMBs/Local Businesses ← NADIE LO RESUELVE
```

Bot247 está en posición única porque:
1. Ya tiene el pipeline de datos (Documento Maestro)
2. Ya sirve a SMBs mexicanas
3. Puede auto-generar profiles sin intervención técnica del negocio

#### 6. ¿Qué construir para el hackathon?

**"Business Discovery MCP Server + Agent-Ready Pipeline Demo"**

Un MCP server que permite a agentes de IA descubrir y consultar negocios locales, alimentado por perfiles auto-generados desde un "Documento Maestro" estilo Bot247.

#### 7. ¿Qué MVP construir en 4 horas?

```
HORA 1: Data & Schema
  - Definir Business Profile schema (JSON)
  - Crear 10-15 negocios de ejemplo con datos reales/realistas
  - Definir capability taxonomy (restaurant, delivery, reservation, etc.)

HORA 2: MCP Server
  - Implementar MCP server con tools:
    • search_businesses(query, location, category, capabilities)
    • get_business(id) 
    • get_menu_or_services(id)
    • check_availability(id, date, time)
  - In-memory data store (JSON files)

HORA 3: A2A Agent + Discovery
  - Implementar un A2A Agent Card para un negocio Bot247
  - Crear /.well-known/ard.json con entries de todos los negocios
  - Implementar un agent Bot247 básico que responda queries

HORA 4: Demo & Polish
  - Crear demo flow completo:
    "Encuentra restaurante → consulta info → habla con agente → reserva"
  - Testing con un AI agent real (Claude/Cursor)
  - Preparar pitch
```

#### 8. ¿Qué dejar fuera?

- ❌ UI/dashboard para humanos
- ❌ Base de datos real (usar JSON files)
- ❌ Payments/transactions reales
- ❌ Auth/security complejo
- ❌ Federation/DHT distribuido
- ❌ Trust/reputation system
- ❌ Multi-tenancy

#### 9. ¿Qué debería demostrar la demo?

**El "aha moment":**

> "Hoy, un agente de IA no puede encontrar un restaurante mexicano en Monterrey y hacer una reservación. Con Bot247 Agent-Ready, cualquier pequeño negocio puede ser descubierto y utilizado por agentes de IA — sin necesitar equipo técnico."

**Demo flow:**

1. Mostrar un negocio registrado en Bot247 (Documento Maestro → auto-generación)
2. Un agente externo descubre el negocio via MCP server
3. El agente consulta información estructurada
4. El agente se comunica con el agente Bot247 del negocio
5. El agente ejecuta una acción (reservación simulada)

**Métrica de éxito del hackathon:** ¿Resolvemos algo que los agentes QUIEREN hacer pero HOY no pueden?

**Respuesta: SÍ.** Los agentes hoy no pueden descubrir y consultar negocios locales de forma estructurada. Este proyecto resuelve exactamente eso.

---

### Stack Técnico Recomendado para el MVP

| Componente | Tecnología | Justificación |
|---|---|---|
| MCP Server | TypeScript + `@modelcontextprotocol/sdk` | Estándar, fast to implement |
| A2A Agent | TypeScript + A2A SDK | Compatible con discovery |
| Business Data | JSON files (in-memory) | Sin DB, rápido |
| Discovery | `/.well-known/ard.json` + `agents.json` | Standards-compliant |
| Business Profile | Custom JSON schema | No hay estándar aún |
| Hosting | Local / Cloudflare Workers | Rápido deploy |

### Nombre Sugerido para el Proyecto

**"AgentReady"** — Make any business discoverable by AI agents.

O en español: **"Bot247 AgentReady"** — Convierte cualquier negocio en agent-discoverable.

---

---

## 17. Business Discovery MCP Server — Diseño Detallado

### La pregunta central

¿Por qué un MCP Server y no una API REST, un Agent Card, o un website?

**Porque MCP es el protocolo que los agentes ya hablan.** Un agente con acceso a un MCP server puede usar sus tools de forma nativa, sin configuración adicional, sin parsear HTML, sin APIs custom. El agente llama un tool, recibe data estructurada, y actúa. Así de simple.

El paralelo exacto es **Shopify Catalog MCP**: Shopify expone `search_catalog`, `lookup_catalog` y `get_product` como MCP tools, y cualquier agente con acceso al server puede descubrir y consultar millones de productos. Nosotros hacemos lo mismo pero para **negocios locales y servicios**.

---

### LADO A: DESDE LOS AGENTES

#### ¿Quiénes son "los agentes"?

Cualquier AI agent que pueda conectarse a un MCP server:

- **Claude** (Anthropic) via Cursor, Claude Desktop, Claude Code
- **ChatGPT** via plugins o MCP bridge
- **Agentes custom** construidos con LangChain, CrewAI, AutoGen, ADK, etc.
- **Agentes empresariales** de Salesforce, Microsoft, IBM
- **Agentes personales** tipo asistentes de productividad
- **Agentes de viaje, concierge, compras** que necesitan info de negocios reales
- **Otros agentes Bot247** buscando negocios para sus usuarios

#### ¿Cómo se conecta un agente al MCP Server?

Dos modalidades:

**1. Remote MCP Server (Streamable HTTP)**

El agente se conecta a una URL pública:
```
https://discovery.bot247.mx/mcp
```

Cualquier agente con soporte MCP puede conectarse. Sin API keys para discovery básico. El server anuncia sus tools y el agente los usa.

**2. Configuración en un MCP Client (ej. Claude Desktop)**

```json
{
  "mcpServers": {
    "bot247-discovery": {
      "url": "https://discovery.bot247.mx/mcp",
      "description": "Discover and query local businesses in Mexico"
    }
  }
}
```

Una vez conectado, el agente ve los tools disponibles y puede usarlos naturalmente en la conversación.

---

#### Tools disponibles para agentes

##### Tool 1: `search_businesses`

**Propósito:** El tool principal. Buscar negocios por lo que el usuario necesita.

**Cuándo lo usa el agente:** Cuando el usuario pide encontrar un negocio, servicio, o lugar. El agente interpreta la intención del usuario y construye el query.

**Input Schema:**
```json
{
  "name": "search_businesses",
  "description": "Search for local businesses by natural language query, category, location, capabilities, or any combination. Returns businesses that match the criteria with structured profiles including hours, services, prices, and available capabilities.",
  "inputSchema": {
    "type": "object",
    "properties": {
      "query": {
        "type": "string",
        "description": "Natural language description of what the user is looking for. Examples: 'Italian restaurant with outdoor seating', 'dentist that accepts walk-ins', 'mechanic specialized in electric cars'"
      },
      "location": {
        "type": "object",
        "properties": {
          "city": { "type": "string" },
          "state": { "type": "string" },
          "country": { "type": "string", "default": "MX" },
          "coordinates": {
            "type": "object",
            "properties": {
              "lat": { "type": "number" },
              "lng": { "type": "number" }
            }
          },
          "radius_km": { "type": "number", "default": 10 }
        }
      },
      "category": {
        "type": "string",
        "description": "Business category. Examples: restaurant, hotel, clinic, salon, mechanic, gym, veterinary, coworking"
      },
      "capabilities": {
        "type": "array",
        "items": { "type": "string" },
        "description": "Required capabilities. Examples: 'delivery', 'reservation', 'online_ordering', 'accepts_cards', 'parking', 'wifi', 'pet_friendly', 'vegetarian_options', 'home_service'"
      },
      "open_now": {
        "type": "boolean",
        "description": "If true, only return businesses currently open"
      },
      "price_range": {
        "type": "string",
        "enum": ["$", "$$", "$$$", "$$$$"],
        "description": "Price range filter"
      },
      "limit": {
        "type": "number",
        "default": 5,
        "description": "Maximum number of results"
      }
    },
    "required": ["query"]
  }
}
```

**Output que recibe el agente:**
```json
{
  "results": [
    {
      "id": "biz_tacos_el_paisa",
      "name": "Tacos El Paisa",
      "category": "restaurant",
      "subcategory": "mexican",
      "short_description": "Authentic Mexican tacos and traditional dishes in downtown Monterrey. Known for tacos al pastor and handmade tortillas.",
      "location": {
        "address": "Av. Revolución 456, Centro, Monterrey, NL",
        "city": "Monterrey",
        "state": "Nuevo León",
        "coordinates": { "lat": 25.6714, "lng": -100.3093 },
        "distance_km": 2.3
      },
      "hours": {
        "today": { "open": "11:00", "close": "23:00", "is_open_now": true },
        "note": "Open Monday-Saturday. Closed Sundays."
      },
      "price_range": "$",
      "rating": 4.6,
      "capabilities": [
        "dine_in", "takeout", "delivery", "accepts_cards",
        "accepts_cash", "parking", "vegetarian_options"
      ],
      "contact": {
        "phone": "+52-81-1234-5678",
        "whatsapp": "+52-81-1234-5678"
      },
      "has_agent": false,
      "interaction_level": "info_only",
      "detail_tools": ["get_business", "get_menu"]
    },
    {
      "id": "biz_la_trattoria",
      "name": "La Trattoria di Roma",
      "category": "restaurant",
      "subcategory": "italian",
      "short_description": "Italian restaurant with wood-fired pizza and fresh pasta. Reservations recommended for weekends.",
      "location": {
        "address": "Calzada San Pedro 102, San Pedro Garza García, NL",
        "city": "San Pedro Garza García",
        "state": "Nuevo León",
        "coordinates": { "lat": 25.6573, "lng": -100.4022 },
        "distance_km": 5.1
      },
      "hours": {
        "today": { "open": "13:00", "close": "23:30", "is_open_now": true },
        "note": "Open daily. Kitchen closes 30 min before closing."
      },
      "price_range": "$$$",
      "rating": 4.8,
      "capabilities": [
        "dine_in", "reservation", "accepts_cards", "parking",
        "outdoor_seating", "vegetarian_options", "gluten_free_options",
        "wine_list", "private_events"
      ],
      "contact": {
        "phone": "+52-81-8765-4321",
        "whatsapp": "+52-81-8765-4321",
        "email": "reservaciones@latrattoria.mx"
      },
      "has_agent": true,
      "interaction_level": "agent_capable",
      "agent_capabilities": [
        "answer_questions", "check_availability",
        "make_reservation", "view_menu"
      ],
      "detail_tools": ["get_business", "get_menu", "check_availability", "contact_agent"]
    }
  ],
  "total_results": 2,
  "search_context": {
    "query_interpreted": "Restaurants in Monterrey area currently open",
    "location_used": "Monterrey, Nuevo León, MX",
    "filters_applied": ["open_now"]
  }
}
```

**Lo que el agente hace con esto:**

El agente recibe data completamente estructurada. No tiene que parsear HTML, adivinar horarios, o interpretar texto ambiguo. Puede directamente:
- Presentar opciones al usuario con info precisa
- Comparar negocios por precio, distancia, capabilities
- Saber cuáles tienen agente (puede interactuar más profundo) vs cuáles solo tienen info
- Decidir qué tool usar después (`get_menu`, `check_availability`, `contact_agent`)

---

##### Tool 2: `get_business`

**Propósito:** Obtener el perfil completo de un negocio específico.

**Cuándo lo usa el agente:** Cuando el usuario selecciona un negocio o pide más detalles. O cuando el agente necesita información completa para tomar una decisión.

**Input:**
```json
{
  "name": "get_business",
  "description": "Get the complete structured profile of a specific business, including full hours, all services/products, policies, FAQ, and agent capabilities if available.",
  "inputSchema": {
    "type": "object",
    "properties": {
      "business_id": {
        "type": "string",
        "description": "Business ID from search results"
      }
    },
    "required": ["business_id"]
  }
}
```

**Output:**
```json
{
  "id": "biz_la_trattoria",
  "name": "La Trattoria di Roma",
  "category": "restaurant",
  "subcategory": "italian",
  "description": "Authentic Italian restaurant founded in 2015, located in San Pedro Garza García. We specialize in wood-fired Neapolitan pizza, fresh handmade pasta, and traditional Italian dishes. Our chef trained in Rome and uses imported Italian ingredients. We have a curated wine list with over 60 Italian and Mexican labels.",
  "location": {
    "address": "Calzada San Pedro 102, Col. Del Valle, San Pedro Garza García, NL 66220",
    "city": "San Pedro Garza García",
    "state": "Nuevo León",
    "country": "MX",
    "coordinates": { "lat": 25.6573, "lng": -100.4022 },
    "google_maps_url": "https://maps.google.com/?q=25.6573,-100.4022",
    "parking": "Free valet parking available",
    "landmarks": "Next to Plaza Fiesta San Agustín"
  },
  "hours": {
    "monday":    { "open": "13:00", "close": "23:00" },
    "tuesday":   { "open": "13:00", "close": "23:00" },
    "wednesday": { "open": "13:00", "close": "23:00" },
    "thursday":  { "open": "13:00", "close": "23:30" },
    "friday":    { "open": "13:00", "close": "00:00" },
    "saturday":  { "open": "12:00", "close": "00:00" },
    "sunday":    { "open": "12:00", "close": "22:00" },
    "special_notes": "Kitchen closes 30 minutes before closing time. Dec 24-25 closed. Dec 31 special menu, reservation required."
  },
  "contact": {
    "phone": "+52-81-8765-4321",
    "whatsapp": "+52-81-8765-4321",
    "email": "reservaciones@latrattoria.mx",
    "website": "https://latrattoria.mx",
    "instagram": "@latrattoriamty"
  },
  "capabilities": [
    "dine_in", "reservation", "accepts_cards", "accepts_cash",
    "parking", "valet", "outdoor_seating", "indoor_seating",
    "vegetarian_options", "gluten_free_options", "vegan_options",
    "wine_list", "private_events", "kids_menu", "high_chairs",
    "wheelchair_accessible", "wifi"
  ],
  "price_range": "$$$",
  "average_ticket": {
    "per_person": { "min": 350, "max": 800, "currency": "MXN" },
    "note": "Excludes drinks. Wine pairing adds approximately $400/person."
  },
  "policies": {
    "reservations": "Recommended for dinner, required for groups of 6+. Cancel 4 hours before or a no-show fee may apply.",
    "dress_code": "Smart casual. No beachwear or flip-flops.",
    "children": "Welcome. Kids menu available for children under 12.",
    "pets": "Allowed on outdoor terrace only.",
    "smoking": "Non-smoking indoors. Permitted on terrace.",
    "cancellation": "Cancel at least 4 hours before reservation time.",
    "groups": "Groups of 10+ require a deposit and pre-selected menu."
  },
  "faq": [
    {
      "question": "Do you have vegetarian options?",
      "answer": "Yes, we have 8 vegetarian dishes including pasta, risotto, and wood-fired pizzas. We can also modify most dishes. Please inform your server about dietary needs."
    },
    {
      "question": "Can I host a private event?",
      "answer": "Yes, our private dining room seats up to 30 guests. Contact us at eventos@latrattoria.mx for pricing and availability."
    },
    {
      "question": "Do you deliver?",
      "answer": "We do not offer our own delivery. You can order through UberEats and Rappi for a limited delivery menu."
    }
  ],
  "payment_methods": ["visa", "mastercard", "amex", "cash", "apple_pay"],
  "rating": 4.8,
  "reviews_summary": "Highly rated for pasta and ambiance. Some comments about wait times on weekends.",
  "agent": {
    "has_agent": true,
    "agent_id": "agent_la_trattoria",
    "capabilities": [
      "answer_questions",
      "check_availability",
      "make_reservation",
      "view_menu",
      "dietary_recommendations"
    ],
    "how_to_interact": "Use the 'contact_agent' tool with this business_id to start a conversation with the restaurant's AI agent."
  },
  "last_updated": "2026-10-01T14:30:00Z",
  "verified": true,
  "powered_by": "Bot247"
}
```

**Lo que el agente hace con esto:**

Tiene TODA la información del negocio estructurada. Puede:
- Responder cualquier pregunta del usuario sin ambigüedad
- Verificar si el negocio cumple requisitos específicos (ej: "¿aceptan mascotas?")
- Decidir si escalar a `contact_agent` para acciones (reservaciones)
- Comparar con otros negocios que obtuvo del search

---

##### Tool 3: `get_menu`

**Propósito:** Obtener el menú, catálogo de productos, o lista de servicios de un negocio.

**Cuándo lo usa el agente:** Cuando el usuario pregunta "¿qué tienen?", "¿cuánto cuesta?", "¿tienen opciones veganas?", o necesita elegir un servicio/producto específico.

**Input:**
```json
{
  "name": "get_menu",
  "description": "Get the full menu, product catalog, or service list of a business. For restaurants returns dishes with prices and dietary info. For other businesses returns their services or products with descriptions and prices.",
  "inputSchema": {
    "type": "object",
    "properties": {
      "business_id": { "type": "string" },
      "category_filter": {
        "type": "string",
        "description": "Filter by menu/service category. Examples: 'pizza', 'pasta', 'desserts', 'haircut', 'consultation'"
      },
      "dietary_filter": {
        "type": "array",
        "items": { "type": "string" },
        "description": "Dietary filters. Examples: 'vegetarian', 'vegan', 'gluten_free', 'dairy_free'"
      },
      "price_max": {
        "type": "number",
        "description": "Maximum price filter in local currency"
      }
    },
    "required": ["business_id"]
  }
}
```

**Output (restaurante):**
```json
{
  "business_id": "biz_la_trattoria",
  "business_name": "La Trattoria di Roma",
  "menu_type": "restaurant",
  "currency": "MXN",
  "categories": [
    {
      "name": "Antipasti",
      "items": [
        {
          "name": "Bruschetta Classica",
          "description": "Toasted ciabatta with fresh tomatoes, basil, garlic, and extra virgin olive oil",
          "price": 145,
          "dietary": ["vegetarian", "vegan_possible"],
          "popular": true
        },
        {
          "name": "Carpaccio di Manzo",
          "description": "Thin-sliced raw beef with arugula, parmesan, capers, and truffle oil",
          "price": 220,
          "dietary": ["gluten_free"]
        }
      ]
    },
    {
      "name": "Pizza",
      "note": "All pizzas are wood-fired Neapolitan style, 12 inch",
      "items": [
        {
          "name": "Margherita",
          "description": "San Marzano tomatoes, mozzarella fior di latte, fresh basil",
          "price": 195,
          "dietary": ["vegetarian"],
          "popular": true
        },
        {
          "name": "Quattro Formaggi",
          "description": "Mozzarella, gorgonzola, fontina, parmigiano-reggiano",
          "price": 245,
          "dietary": ["vegetarian"]
        }
      ]
    },
    {
      "name": "Pasta",
      "note": "Fresh pasta made daily. Gluten-free pasta available +$35",
      "items": [
        {
          "name": "Cacio e Pepe",
          "description": "Tonnarelli with pecorino romano and black pepper",
          "price": 225,
          "dietary": ["vegetarian"]
        }
      ]
    }
  ],
  "notes": "Prices include tax. 10% service charge for groups of 8+. Ask your server about daily specials."
}
```

**Output (servicio — ejemplo clínica dental):**
```json
{
  "business_id": "biz_dental_smile",
  "business_name": "Dental Smile Monterrey",
  "menu_type": "services",
  "currency": "MXN",
  "categories": [
    {
      "name": "General Dentistry",
      "items": [
        {
          "name": "Dental Cleaning",
          "description": "Professional cleaning including scaling, polishing, and fluoride treatment",
          "price": 800,
          "duration_minutes": 45,
          "requires_appointment": true
        },
        {
          "name": "General Consultation",
          "description": "Oral examination, diagnosis, and treatment plan. Includes X-rays if needed.",
          "price": 500,
          "duration_minutes": 30,
          "requires_appointment": true,
          "note": "First visit includes free panoramic X-ray"
        }
      ]
    }
  ]
}
```

---

##### Tool 4: `check_availability`

**Propósito:** Verificar disponibilidad de un negocio para una fecha/hora específica.

**Cuándo lo usa el agente:** Cuando el usuario quiere saber si puede ir, reservar, o agendar algo.

**Input:**
```json
{
  "name": "check_availability",
  "description": "Check if a business is available at a specific date and time. For restaurants, checks table availability. For service businesses, checks appointment slots. Returns availability status and alternatives if not available.",
  "inputSchema": {
    "type": "object",
    "properties": {
      "business_id": { "type": "string" },
      "date": {
        "type": "string",
        "format": "date",
        "description": "Date to check (YYYY-MM-DD)"
      },
      "time": {
        "type": "string",
        "description": "Preferred time (HH:MM in 24h format)"
      },
      "party_size": {
        "type": "number",
        "description": "Number of people (for restaurants) or 1 for individual services"
      },
      "service": {
        "type": "string",
        "description": "Specific service needed (for service businesses). Example: 'dental_cleaning', 'haircut'"
      }
    },
    "required": ["business_id", "date", "time"]
  }
}
```

**Output:**
```json
{
  "business_id": "biz_la_trattoria",
  "business_name": "La Trattoria di Roma",
  "requested": {
    "date": "2026-10-03",
    "time": "20:00",
    "party_size": 4
  },
  "availability": {
    "status": "available",
    "message": "Table for 4 is available at 8:00 PM tonight.",
    "confirmation_required": true,
    "how_to_confirm": "Use 'contact_agent' tool to make the reservation, or call +52-81-8765-4321"
  },
  "alternatives": [
    { "time": "19:30", "status": "available" },
    { "time": "20:30", "status": "available" },
    { "time": "21:00", "status": "available" }
  ],
  "notes": "Outdoor terrace tables are first-come, reservation is for indoor seating."
}
```

**Nota importante sobre este tool:**
- Para negocios **SIN agente** (`has_agent: false`): devuelve info basada en los datos estáticos del negocio (horarios, capacidad general). El status puede ser `"likely_available"` en vez de `"available"` — el agente sabe que no es confirmación en tiempo real.
- Para negocios **CON agente** (`has_agent: true`): puede consultar al agente Bot247 del negocio para obtener disponibilidad en tiempo real.

---

##### Tool 5: `contact_agent`

**Propósito:** Iniciar comunicación con el agente AI de un negocio para ejecutar una acción.

**Cuándo lo usa el agente:** Cuando el usuario quiere hacer algo (reservar, pedir, preguntar algo específico) y el negocio tiene un agente Bot247.

**Input:**
```json
{
  "name": "contact_agent",
  "description": "Send a message to a business's AI agent to execute an action or ask a specific question. Only available for businesses with has_agent=true. The business agent can make reservations, take orders, answer detailed questions, and more depending on its capabilities.",
  "inputSchema": {
    "type": "object",
    "properties": {
      "business_id": { "type": "string" },
      "action": {
        "type": "string",
        "enum": ["ask_question", "make_reservation", "place_order", "request_quote", "check_specific_availability"],
        "description": "The type of action to perform"
      },
      "message": {
        "type": "string",
        "description": "The message or request to send to the business agent"
      },
      "context": {
        "type": "object",
        "description": "Structured context for the action",
        "properties": {
          "date": { "type": "string" },
          "time": { "type": "string" },
          "party_size": { "type": "number" },
          "items": { "type": "array", "items": { "type": "string" } },
          "special_requests": { "type": "string" },
          "contact_name": { "type": "string" },
          "contact_phone": { "type": "string" }
        }
      }
    },
    "required": ["business_id", "action", "message"]
  }
}
```

**Output:**
```json
{
  "business_id": "biz_la_trattoria",
  "agent_id": "agent_la_trattoria",
  "action": "make_reservation",
  "response": {
    "status": "confirmed",
    "message": "Reservation confirmed for 4 guests on Saturday October 3rd at 8:00 PM. Indoor seating. Confirmation number: LT-2026-1003-2000-4. Please arrive 5-10 minutes early. For changes or cancellations, call +52-81-8765-4321 or WhatsApp the same number at least 4 hours before.",
    "confirmation": {
      "confirmation_number": "LT-2026-1003-2000-4",
      "date": "2026-10-03",
      "time": "20:00",
      "party_size": 4,
      "seating": "indoor",
      "contact_for_changes": "+52-81-8765-4321"
    }
  }
}
```

**Este tool es el que diferencia a un negocio CON agente de uno SIN agente.**

Para negocios sin agente, `contact_agent` retorna:
```json
{
  "error": "agent_not_available",
  "message": "This business does not have an AI agent. You can contact them directly.",
  "alternatives": {
    "phone": "+52-81-1234-5678",
    "whatsapp": "+52-81-1234-5678",
    "email": "info@negocio.mx"
  }
}
```

---

#### Escenarios completos de uso por agentes

##### Escenario 1: Agente personal de un turista

```
TURISTA: "I'm in Monterrey for the weekend. Find me a nice restaurant 
          for dinner tonight, something Italian or Mexican, with 
          vegetarian options. We're 4 people."

AGENTE:
  1. Llama search_businesses({
       query: "Italian or Mexican restaurant with vegetarian options",
       location: { city: "Monterrey", state: "Nuevo León" },
       capabilities: ["reservation", "vegetarian_options"],
       open_now: true,
       party_size: 4,   // pasa como contexto
       limit: 5
     })
  
  2. Recibe 5 resultados estructurados
  
  3. Presenta opciones al turista con precio, distancia, rating
  
TURISTA: "The Italian one sounds great. Can we get a table at 8?"

AGENTE:
  4. Llama check_availability({
       business_id: "biz_la_trattoria",
       date: "2026-10-03",
       time: "20:00",
       party_size: 4
     })
  
  5. Recibe: available
  
  6. "There's a table available! Want me to book it?"

TURISTA: "Yes please, under the name John."

AGENTE:
  7. Llama contact_agent({
       business_id: "biz_la_trattoria",
       action: "make_reservation",
       message: "Reservation for 4 at 8pm tonight",
       context: {
         date: "2026-10-03",
         time: "20:00",
         party_size: 4,
         contact_name: "John"
       }
     })
  
  8. Recibe confirmación con número
  
  9. "Done! Reservation confirmed: #LT-2026-1003-2000-4 
      for 4 at 8:00 PM at La Trattoria di Roma.
      Address: Calzada San Pedro 102. Free valet parking.
      They have a dress code: smart casual."
```

##### Escenario 2: Agente de productividad empresarial

```
EMPLEADO: "Necesito encontrar un coworking en Monterrey que tenga 
           sala de juntas para 10 personas disponible el lunes."

AGENTE:
  1. search_businesses({
       query: "coworking space with meeting room",
       location: { city: "Monterrey" },
       capabilities: ["meeting_rooms", "wifi", "projector"]
     })
  
  2. Obtiene 3 opciones
  
  3. Para cada una, llama get_business(id) para ver precios de salas
  
  4. Llama check_availability para cada una, lunes, horario laboral
  
  5. Presenta comparativa: precio por hora, capacidad, equipamiento, 
     disponibilidad confirmada vs probable
```

##### Escenario 3: Agente que trabaja para otro agente (agent-to-agent)

```
AGENTE DE VIAJES:
  Está armando un itinerario para Monterrey.
  Necesita: hotel + 3 restaurantes + 1 tour + 1 spa
  
  Para cada categoría:
  1. search_businesses con categoría y capabilities relevantes
  2. get_business para los top resultados
  3. check_availability para las fechas del viaje
  4. contact_agent donde esté disponible para pre-reservar
  
  Resultado: itinerario completo con reservaciones confirmadas
  donde fue posible, e info de contacto donde no.
```

##### Escenario 4: Agente que compara precios

```
USUARIO: "¿Cuánto cuesta una limpieza dental en Monterrey?"

AGENTE:
  1. search_businesses({
       query: "dental clinic",
       location: { city: "Monterrey" },
       capabilities: ["accepts_cards"],
       limit: 10
     })
  
  2. Para cada resultado, llama get_menu(id, 
       category_filter: "cleaning")
  
  3. Compara precios, incluye info de duración, qué incluye
  
  4. "Found 8 dental clinics. Prices for dental cleaning range 
      from $500 to $1,200 MXN. Here's a comparison:
      - Dental Smile: $800 (45 min, includes fluoride)  
      - Clínica San Pedro: $650 (30 min, basic cleaning)
      - ..."
```

---

### LADO B: DESDE LOS NEGOCIOS

#### El principio fundamental

**El negocio NO necesita saber que existe el MCP Server.** No necesita saber qué es MCP, qué es un agente, ni qué es un protocol. El negocio solo interactúa con Bot247.

La cadena es:

```
Business Owner
  ↓ proporciona info
Bot247 Platform
  ↓ genera automáticamente
Business Profile (structured data)
  ↓ se expone via
MCP Server (transparente para el negocio)
  ↓ usado por
AI Agents del mundo
```

#### ¿Cómo entra un negocio al sistema?

##### Paso 1: El negocio se registra en Bot247 (ya existe este proceso)

El dueño proporciona su **Documento Maestro**: un documento con toda la información del negocio. Puede ser texto libre, un PDF, un formulario, o una conversación guiada.

Contenido típico:
- Nombre del negocio
- Qué hace / a qué se dedica
- Dirección y ubicación
- Horarios
- Productos o servicios con precios
- Formas de pago
- Políticas (cancelación, devolución, reservaciones)
- Preguntas frecuentes
- Contacto (teléfono, WhatsApp, email, redes)
- Cualquier info relevante

##### Paso 2: Bot247 procesa el Documento Maestro

Bot247 ya hace esto hoy para generar micrositios y asistentes AI. La extensión sería:

**Antes (Bot247 actual):**
```
Documento Maestro → Bot247 →
  ├── Microsite
  ├── Knowledge Base  
  ├── AI Assistant
  └── Chat Widget
```

**Después (Bot247 + AgentReady):**
```
Documento Maestro → Bot247 →
  ├── Microsite
  ├── Knowledge Base
  ├── AI Assistant
  ├── Chat Widget
  └── Agent-Ready Layer (NUEVO):
      ├── Structured Business Profile (JSON)
      ├── Agent Card (A2A) — si tiene agente
      ├── MCP endpoint entry
      ├── Capability declarations
      └── Indexed in Discovery Server
```

##### Paso 3: El negocio es automáticamente descubrible

Sin que el dueño haga NADA adicional, su negocio aparece en el MCP Server de discovery. Cualquier agente de IA puede encontrarlo.

**El negocio no necesita:**
- ❌ Crear una cuenta en ningún registry
- ❌ Escribir JSON o YAML
- ❌ Entender protocolos
- ❌ Tener un desarrollador
- ❌ Pagar por un listing
- ❌ Mantener una API

**Bot247 se encarga de:**
- ✅ Estructurar los datos del Documento Maestro
- ✅ Generar el Business Profile en formato machine-readable
- ✅ Mantener los datos actualizados cuando el negocio actualiza su info
- ✅ Exponer el negocio en el MCP Server
- ✅ Manejar queries de agentes externos
- ✅ Rutear acciones al agente Bot247 si existe

---

#### Los dos niveles de participación

##### Nivel 1: Business Info Only (sin agente)

**Qué obtiene el negocio:**
- Su información está disponible para agentes de IA
- Agentes pueden descubrirlo, recomendar, y presentar su info a usuarios
- Nuevo canal de "descubrimiento" sin esfuerzo

**Qué pueden hacer los agentes externos:**
- ✅ Encontrar el negocio en búsquedas
- ✅ Leer info completa (horarios, menú, precios, ubicación)
- ✅ Responder preguntas sobre el negocio a sus usuarios
- ✅ Recomendar el negocio
- ❌ No pueden ejecutar acciones (reservar, pedir, agendar)
- ℹ️ Pueden dar al usuario los datos de contacto para que actúe manualmente

**Analogía:** Es como tener tu negocio en Google Maps. No haces nada activo, pero la gente te encuentra. Aquí, en vez de personas, te encuentran agentes.

**Costo para el negocio:** Ninguno adicional — viene incluido con Bot247.

##### Nivel 2: Business + Agent (con agente Bot247)

**Qué obtiene el negocio:**
- Todo lo de Nivel 1
- ADEMÁS: un agente AI que representa al negocio
- Agentes externos pueden "hablar" con el agente del negocio
- Se pueden ejecutar acciones en nombre del negocio

**Qué pueden hacer los agentes externos:**
- Todo lo del Nivel 1
- ✅ Hacer preguntas específicas en tiempo real
- ✅ Verificar disponibilidad real
- ✅ Hacer reservaciones
- ✅ Tomar pedidos
- ✅ Solicitar cotizaciones
- ✅ Iniciar procesos (agendar cita, solicitar servicio)

**Analogía:** Es como pasar de tener tu negocio en Google Maps a tener un empleado 24/7 que atiende llamadas, responde preguntas, y puede tomar reservaciones. Pero es un agente AI.

**Costo para el negocio:** El costo del agente Bot247 (plan que incluya asistente AI).

---

#### ¿Qué ve el dueño del negocio?

El dueño no ve el MCP Server. Ve su dashboard de Bot247 con info como:

```
📊 Bot247 Dashboard — Tacos El Paisa

Agent Discovery:
  ✅ Your business is discoverable by AI agents
  📈 This week: 47 agent queries about your business
     - 23 menu inquiries
     - 12 hours/location checks  
     - 8 "is it open now?" checks
     - 4 capability checks

  Top queries from agents:
  1. "Mexican restaurant near downtown Monterrey" (appeared in 15 searches)
  2. "Tacos al pastor delivery" (appeared in 8 searches)
  3. "Restaurant open late night" (appeared in 6 searches)

  💡 Tip: Add delivery capability to appear in more searches.
      You appeared in 8 "delivery" searches but couldn't be 
      recommended because you don't list delivery.

  [Upgrade to Agent-Ready+] to let AI agents take orders 
  and reservations on your behalf →
```

**Para el negocio, esto es simplemente un nuevo canal de tráfico.** Como cuando les dices "tu negocio ahora aparece en Google Maps" — no necesitan entender la tecnología detrás.

---

#### Flujo de actualización de datos

```
1. Negocio actualiza horarios de Navidad en Bot247
     ↓
2. Bot247 actualiza el Business Profile
     ↓  
3. MCP Server sirve los nuevos datos inmediatamente
     ↓
4. Agentes que consulten obtienen info actualizada
     ↓
5. "¿Está abierto La Trattoria el 25 de diciembre?"
   → "No, La Trattoria is closed on December 24-25."
```

No hay delay, no hay re-indexación, no hay crawling. El dato cambia en Bot247 y el MCP Server lo refleja.

---

#### ¿Qué problema le resuelve al negocio?

**Hoy:**
```
Un usuario le dice a Claude: "Recomiéndame un restaurante italiano en Monterrey"

Claude: "No tengo información actualizada sobre restaurantes específicos 
         en Monterrey. Te sugiero buscar en Google Maps o TripAdvisor..."

→ El negocio perdió una oportunidad.
  El usuario tuvo una mala experiencia.
  El agente no pudo ayudar.
```

**Con Bot247 AgentReady:**
```
Un usuario le dice a Claude: "Recomiéndame un restaurante italiano en Monterrey"

Claude: [usa search_businesses tool]

Claude: "Found 3 Italian restaurants in Monterrey:

1. La Trattoria di Roma ⭐4.8 — $$$
   Wood-fired pizza and fresh pasta in San Pedro.
   Open today until 11:30 PM. Free valet parking.
   They can take reservations.

2. Piccola Italia ⭐4.5 — $$  
   Casual Italian with great lunch deals.
   Open today until 10 PM.
   
3. Nonna's Kitchen ⭐4.3 — $$
   Family-style Italian, kids eat free on Sundays.
   Open today until 9 PM.

Would you like me to check availability or see the menu?"

→ El negocio ganó visibilidad.
  El usuario obtuvo info precisa.
  El agente pudo ayudar.
  
  Si el negocio tiene agente Bot247, el flujo puede 
  continuar hasta la reservación confirmada.
```

---

#### Resumen visual de la arquitectura completa

```
┌─────────────────────────────────────────────────────────────────┐
│                    BUSINESS SIDE                                 │
│                                                                  │
│  Business Owner                                                  │
│       │                                                          │
│       ▼                                                          │
│  ┌─────────────────┐                                             │
│  │  Documento       │  Plain text, PDF, form, or guided chat     │
│  │  Maestro         │  with all business information             │
│  └────────┬─────────┘                                            │
│           │                                                      │
│           ▼                                                      │
│  ┌─────────────────────────────────────────────────────────┐     │
│  │                  Bot247 Platform                         │     │
│  │                                                          │     │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────────┐ │     │
│  │  │Microsite │ │Knowledge │ │AI Agent  │ │Agent-Ready │ │     │
│  │  │          │ │Base      │ │(optional)│ │Layer (NEW) │ │     │
│  │  └──────────┘ └──────────┘ └──────────┘ └─────┬──────┘ │     │
│  │                                                │        │     │
│  └────────────────────────────────────────────────┼────────┘     │
│                                                   │              │
└───────────────────────────────────────────────────┼──────────────┘
                                                    │
                        Generates & serves          │
                                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                 DISCOVERY INFRASTRUCTURE                         │
│                                                                  │
│  ┌──────────────────────────────────────────────────────┐       │
│  │         Business Discovery MCP Server                 │       │
│  │         https://discovery.bot247.mx/mcp               │       │
│  │                                                       │       │
│  │  Tools:                                               │       │
│  │   • search_businesses (query, location, caps)         │       │
│  │   • get_business (full profile)                       │       │
│  │   • get_menu (products/services/prices)               │       │
│  │   • check_availability (date/time/party)              │       │
│  │   • contact_agent (actions, only if has_agent)        │       │
│  │                                                       │       │
│  │  Data: All Bot247 business profiles, live-synced      │       │
│  └───────────────────────┬───────────────────────────────┘       │
│                          │                                       │
│  Also publishes:         │                                       │
│   • /.well-known/ard.json (ARD entries)                         │
│   • /agents.json (capability declarations)                       │
│   • A2A Agent Cards (for businesses with agents)                 │
│                          │                                       │
└──────────────────────────┼───────────────────────────────────────┘
                           │
                           │  MCP protocol
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                      AGENT SIDE                                  │
│                                                                  │
│  Any AI agent that speaks MCP:                                   │
│                                                                  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────────┐   │
│  │  Claude   │ │ ChatGPT  │ │ Custom   │ │ Other Bot247     │   │
│  │  Desktop  │ │ Agent    │ │ Agent    │ │ Business Agents  │   │
│  └──────────┘ └──────────┘ └──────────┘ └──────────────────┘   │
│       │            │            │               │                │
│       ▼            ▼            ▼               ▼                │
│   ┌────────────────────────────────────────────────────┐        │
│   │              End Users                              │        │
│   │                                                     │        │
│   │  "Find me a restaurant..."                          │        │
│   │  "What's the cheapest dental cleaning?"             │        │
│   │  "Book a table for 4 at 8pm"                        │        │
│   │  "Is there a pet-friendly hotel nearby?"            │        │
│   └────────────────────────────────────────────────────┘        │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 18. Hackathon Resources — Cómo Usarlos Óptimamente

### Recursos disponibles (Supabase Select Hackathon)

**Fuente:** [Hacker Resources Notion Page](https://app.notion.com/p/vercel/Supabase-Select-Hackathon-Hacker-Resources-3eee06b059c481c18fe3e32a1f41a3ef)

| Recurso | Qué es | Cómo lo obtienes |
|---|---|---|
| **Vercel Pro Trial** | Plan Pro para tu equipo durante el hackathon | Redimir en [credits.vercel.sh](https://credits.vercel.sh/) con code `SUPASELE-4T9F-SM6E` |
| **AI Gateway Credits** | Créditos para acceso a modelos (OpenAI, Anthropic, etc.) via API unificada | Mismo form, mismo código |
| **Supabase** | Base de datos PostgreSQL, auth, storage, realtime, vectors | Via [Vercel Marketplace](https://vercel.com/marketplace/supabase) |
| **eve** | Framework de agentes de Vercel (filesystem-first, Apache 2.0) | `npx eve@latest init my-agent` |
| **AI SDK** | TypeScript APIs para generación, streaming, structured output, tools | `npm install ai` |
| **AI Gateway** | Gateway unificado a modelos con routing, failover, spend controls | API key en Vercel dashboard |
| **Vercel Functions** | Backend serverless para API routes y webhooks | Incluido con Vercel Pro |
| **Vercel Sandbox** | Entornos aislados para ejecución de código | Disponible en Vercel Pro |
| **Vercel Workflows** | Ejecución multi-step durable con retries y resumption | Disponible en Vercel Pro |
| **Vercel Connect** | Acceso OAuth a APIs de terceros | Disponible en Vercel Pro |
| **Vercel Blob** | Object storage para archivos | Disponible en Vercel Pro |
| **v0** | Generación de UI con AI | [v0.app](https://v0.app) |
| **shadcn/ui** | Componentes UI reutilizables | `npx shadcn@latest init` |
| **Next.js** | Framework full-stack React | Template starter disponible |

---

### Mapeo Óptimo: Recurso → Función en Nuestro Proyecto

```
┌─────────────────────────────────────────────────────────────────────┐
│                    ARQUITECTURA CON HACKATHON STACK                 │
│                                                                     │
│  ┌─────────────┐     ┌──────────────┐     ┌──────────────────────┐ │
│  │  SUPABASE    │     │  NEXT.JS     │     │  EVE AGENT           │ │
│  │             │     │  on VERCEL   │     │  (demo consumer)     │ │
│  │ • businesses│────▶│              │◀────│                      │ │
│  │ • categories│     │ API Routes:  │     │ Connects to our      │ │
│  │ • pgvector  │     │ MCP Server   │     │ MCP Server as an     │ │
│  │ • menus     │     │ endpoints    │     │ MCP Connection and   │ │
│  │ • agent_logs│     │              │     │ demonstrates the     │ │
│  └─────────────┘     └──────┬───────┘     │ full discovery flow  │ │
│                             │             └──────────────────────┘ │
│                             │                                       │
│  ┌─────────────┐            │             ┌──────────────────────┐ │
│  │ AI GATEWAY   │            │             │  AI SDK              │ │
│  │             │            │             │                      │ │
│  │ Models for: │            │             │ • Structured output  │ │
│  │ • Doc→JSON  │────────────┤             │ • Tool definitions   │ │
│  │ • Semantic  │            │             │ • Streaming          │ │
│  │   matching  │            │             │ • Agent loop         │ │
│  │ • Agent     │            │             └──────────────────────┘ │
│  │   responses │            │                                       │
│  └─────────────┘            │                                       │
│                             ▼                                       │
│                    ┌──────────────────┐                              │
│                    │  EXTERNAL AGENTS │                              │
│                    │  Claude, ChatGPT │                              │
│                    │  Custom agents   │                              │
│                    │  Other eve agents│                              │
│                    └──────────────────┘                              │
└─────────────────────────────────────────────────────────────────────┘
```

---

### Componente por Componente

#### 1. SUPABASE — El cerebro de datos 🧠

**Rol:** Almacena TODA la información de negocios de forma estructurada y buscable.

**¿Por qué Supabase y no JSON files?**
Porque Supabase nos da TODO lo que necesitamos gratis en un hackathon:
- **pgvector** → búsqueda semántica ("restaurante romántico para aniversario" encuentra el lugar correcto aunque no diga "romántico" en sus datos)
- **PostGIS** → búsqueda geoespacial (negocios dentro de X km)
- **Row Level Security** → control de acceso si lo necesitamos
- **Realtime** → updates en vivo en un dashboard de monitoreo
- **Auth** → si queremos que negocios se registren con login
- **Full SQL** → queries complejas, joins, aggregations

**Schema de base de datos:**

```sql
-- Businesses table
CREATE TABLE businesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  subcategory TEXT,
  
  -- Location (PostGIS)
  address TEXT,
  city TEXT NOT NULL,
  state TEXT,
  country TEXT DEFAULT 'MX',
  coordinates GEOGRAPHY(POINT, 4326),
  
  -- Hours (JSONB for flexibility)
  hours JSONB,
  
  -- Contact
  phone TEXT,
  whatsapp TEXT,
  email TEXT,
  website TEXT,
  instagram TEXT,
  
  -- Capabilities (array for fast filtering)
  capabilities TEXT[] DEFAULT '{}',
  
  -- Pricing
  price_range TEXT CHECK (price_range IN ('$', '$$', '$$$', '$$$$')),
  currency TEXT DEFAULT 'MXN',
  
  -- Agent info
  has_agent BOOLEAN DEFAULT FALSE,
  agent_capabilities TEXT[] DEFAULT '{}',
  agent_endpoint TEXT,
  
  -- Policies and FAQ (JSONB)
  policies JSONB DEFAULT '{}',
  faq JSONB DEFAULT '[]',
  
  -- Metadata
  rating NUMERIC(2,1),
  verified BOOLEAN DEFAULT FALSE,
  source TEXT DEFAULT 'bot247',
  
  -- Embedding for semantic search
  description_embedding VECTOR(1536),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Menu/Services table
CREATE TABLE menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10,2),
  currency TEXT DEFAULT 'MXN',
  dietary TEXT[] DEFAULT '{}',
  duration_minutes INTEGER,
  requires_appointment BOOLEAN DEFAULT FALSE,
  popular BOOLEAN DEFAULT FALSE,
  available BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0
);

-- Indexes for fast queries
CREATE INDEX idx_businesses_category ON businesses(category);
CREATE INDEX idx_businesses_city ON businesses(city);
CREATE INDEX idx_businesses_capabilities ON businesses USING GIN(capabilities);
CREATE INDEX idx_businesses_coordinates ON businesses USING GIST(coordinates);
CREATE INDEX idx_businesses_embedding ON businesses 
  USING ivfflat(description_embedding vector_cosine_ops);

-- Agent query logs (analytics)
CREATE TABLE agent_queries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_name TEXT NOT NULL,
  query_params JSONB,
  results_count INTEGER,
  agent_identifier TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Function: search by distance
CREATE OR REPLACE FUNCTION nearby_businesses(
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  radius_km DOUBLE PRECISION DEFAULT 10
)
RETURNS SETOF businesses AS $$
  SELECT *
  FROM businesses
  WHERE ST_DWithin(
    coordinates,
    ST_MakePoint(lng, lat)::geography,
    radius_km * 1000
  )
  ORDER BY ST_Distance(
    coordinates,
    ST_MakePoint(lng, lat)::geography
  );
$$ LANGUAGE sql STABLE;

-- Function: semantic search
CREATE OR REPLACE FUNCTION search_businesses_semantic(
  query_embedding VECTOR(1536),
  match_threshold FLOAT DEFAULT 0.7,
  match_count INT DEFAULT 5
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  description TEXT,
  category TEXT,
  similarity FLOAT
) AS $$
  SELECT
    b.id,
    b.name,
    b.description,
    b.category,
    1 - (b.description_embedding <=> query_embedding) AS similarity
  FROM businesses b
  WHERE 1 - (b.description_embedding <=> query_embedding) > match_threshold
  ORDER BY b.description_embedding <=> query_embedding
  LIMIT match_count;
$$ LANGUAGE sql STABLE;
```

**Supabase AI & Vectors** es la clave aquí. Cuando un agente busca "lugar tranquilo para trabajar con buen café", podemos:
1. Generar un embedding del query con AI Gateway
2. Buscar businesses con embeddings similares via pgvector
3. Combinar con filtros duros (categoría, ubicación, open_now)

**Docs relevantes:**
- [Supabase AI & Vectors](https://supabase.com/docs/guides/ai)
- [Supabase on Vercel Marketplace](https://vercel.com/marketplace/supabase)

---

#### 2. NEXT.JS + VERCEL FUNCTIONS — El MCP Server 🔌

**Rol:** Implementa el MCP Server como una aplicación Next.js desplegada en Vercel.

**¿Por qué Next.js y no un server standalone?**
- Despliega en Vercel con un push a git — instant
- API routes son Vercel Functions (serverless, escalan auto)
- Podemos tener un frontend para el dashboard de monitoreo
- AI SDK se integra nativamente
- Template starter listo: [Next.js + Supabase](https://vercel.com/templates/next.js/supabase)

**Estructura del proyecto:**

```
my-project/
├── app/
│   ├── page.tsx                    # Landing/Dashboard
│   ├── dashboard/
│   │   └── page.tsx                # Monitor de queries de agentes
│   ├── api/
│   │   ├── mcp/
│   │   │   └── route.ts            # ← MCP Server endpoint (Streamable HTTP)
│   │   ├── onboard/
│   │   │   └── route.ts            # Procesar Documento Maestro → Business Profile
│   │   └── health/
│   │       └── route.ts            # Health check
│   └── .well-known/
│       └── ard.json/
│           └── route.ts            # ARD discovery entry point
├── lib/
│   ├── mcp/
│   │   ├── server.ts               # MCP server implementation
│   │   └── tools/
│   │       ├── search-businesses.ts
│   │       ├── get-business.ts
│   │       ├── get-menu.ts
│   │       ├── check-availability.ts
│   │       └── contact-agent.ts
│   ├── supabase/
│   │   ├── client.ts               # Supabase client
│   │   └── queries.ts              # Database queries
│   ├── ai/
│   │   ├── embeddings.ts           # Generate embeddings via AI Gateway
│   │   ├── document-processor.ts   # Documento Maestro → structured JSON
│   │   └── business-agent.ts       # Bot247 agent brain (AI SDK)
│   └── data/
│       └── seed-businesses.ts      # Seed data for demo
├── agent/                          # ← eve agent (demo consumer)
│   ├── instructions.md
│   ├── tools/
│   │   └── ... 
│   └── connections/
│       └── bot247-discovery.ts     # MCP connection to our server
├── supabase/
│   └── migrations/
│       └── 001_initial.sql         # Schema migration
└── package.json
```

**MCP Server implementation (key file):**

El MCP server se implementa como una API route de Next.js usando Streamable HTTP transport. Cuando un agente se conecta a `https://our-app.vercel.app/api/mcp`, recibe la lista de tools y puede llamarlos.

Cada tool:
1. Recibe los parámetros del agente
2. Hace queries a Supabase (SQL + pgvector)
3. Retorna data estructurada al agente
4. Loguea la query en `agent_queries` para analytics

---

#### 3. AI GATEWAY — Acceso a modelos 🤖

**Rol:** Tres usos específicos en nuestro proyecto:

##### Uso 1: Documento Maestro → Structured Business Profile

Cuando un negocio proporciona su información (texto libre), usamos un modelo via AI Gateway para extraer y estructurar los datos.

```typescript
import { generateObject } from 'ai';
import { z } from 'zod';

const businessProfile = await generateObject({
  model: 'openai/gpt-6-astra',  // via AI Gateway
  schema: z.object({
    name: z.string(),
    category: z.string(),
    subcategory: z.string().optional(),
    description: z.string(),
    address: z.string(),
    city: z.string(),
    hours: z.record(z.object({
      open: z.string(),
      close: z.string()
    })),
    capabilities: z.array(z.string()),
    // ... full schema
  }),
  prompt: `Extract structured business information from this document:
  
  ${documentoMaestro}
  
  Return a complete business profile with all available information.`
});
```

AI SDK `generateObject` con schema Zod = output estructurado garantizado.

##### Uso 2: Embeddings para búsqueda semántica

```typescript
import { embed } from 'ai';

const { embedding } = await embed({
  model: 'openai/text-embedding-3-small', // via AI Gateway
  value: business.description + ' ' + business.capabilities.join(' ')
});

// Store in Supabase pgvector
await supabase
  .from('businesses')
  .update({ description_embedding: embedding })
  .eq('id', business.id);
```

Cuando un agente busca, generamos embedding del query y hacemos vector search:

```typescript
const { embedding: queryEmbedding } = await embed({
  model: 'openai/text-embedding-3-small',
  value: searchQuery
});

const { data } = await supabase.rpc('search_businesses_semantic', {
  query_embedding: queryEmbedding,
  match_threshold: 0.7,
  match_count: 10
});
```

##### Uso 3: Bot247 Business Agent responses

Cuando un agente externo usa `contact_agent`, el agente Bot247 del negocio usa AI Gateway para generar respuestas basadas en la knowledge base del negocio:

```typescript
import { generateText } from 'ai';

const response = await generateText({
  model: 'openai/gpt-6-astra',
  system: `You are the AI assistant for ${business.name}. 
    Use ONLY the following business information to answer:
    ${JSON.stringify(businessProfile)}
    
    You can: ${business.agent_capabilities.join(', ')}`,
  prompt: agentMessage
});
```

**Costo:** Los AI Gateway credits del hackathon cubren todo esto. Un query típico cuesta fracciones de centavo.

**Docs:**
- [AI Gateway Getting Started](https://vercel.com/docs/ai-gateway/getting-started)
- [AI SDK Structured Output](https://ai-sdk.dev/docs/ai-sdk-core/generating-structured-data)

---

#### 4. EVE — El agente que demuestra el producto 🎯

**Rol:** Eve es el CONSUMIDOR de nuestro MCP Server. Es el agente que demuestra por qué nuestro servicio es útil.

**¿Por qué eve y no solo un MCP client manual?**
- Eve es el framework de agentes de Vercel — los jueces lo conocen
- Se conecta nativamente a MCP servers via `defineMcpClientConnection`
- Deploy en Vercel con un push
- Tiene tools, sessions, channels — todo lo que necesitamos para la demo
- La hackathon explícitamente sugiere eve como framework de agentes

**Cómo encaja eve:**

La página de recursos dice literalmente:

> "use eve to build an agent that consumes your tool or service and demonstrates why it is useful"

Eso es exactamente lo que hacemos:

1. Nuestro **servicio** es el Business Discovery MCP Server
2. Nuestro **eve agent** se conecta al MCP server como una connection
3. El eve agent demuestra el flujo completo: search → details → availability → reservation

**Configuración del eve agent:**

```
agent/
├── instructions.md          # "You help users discover and interact with 
│                            #  local businesses in Mexico..."
├── connections/
│   └── bot247-discovery.ts  # MCP connection to our discovery server
├── tools/
│   └── format-results.ts    # Optional: format results nicely
└── config.ts                # Model config
```

**`agent/connections/bot247-discovery.ts`:**

```typescript
import { defineMcpClientConnection } from "eve/connections";

export default defineMcpClientConnection({
  url: process.env.MCP_SERVER_URL || "https://our-app.vercel.app/api/mcp",
  description: "Bot247 Business Discovery — search, query, and interact with local businesses in Mexico. Find restaurants, clinics, salons, and services by location, category, and capabilities."
});
```

**`agent/instructions.md`:**

```markdown
You are a local business discovery assistant powered by Bot247.

You help users find businesses, services, and places in Mexico. You can:
- Search for businesses by what the user needs
- Get detailed information about any business
- Check menus, services, and prices
- Verify availability for specific dates/times
- Make reservations or place orders (when the business has an agent)

Always use the bot247-discovery connection tools to find real business data.
Never make up business information.

When presenting results:
- Show the most relevant options first
- Include key details: name, location, hours, price range
- Mention if the business has an AI agent (can do more actions)
- Offer to get more details or check availability

When a user wants to take action (reserve, order, etc.):
- Check if the business has_agent = true
- If yes, use contact_agent to execute the action
- If no, provide the business contact info for manual action
```

**Demo flow con eve:**

```
1. Developer opens eve chat interface
2. Types: "Find me a restaurant in Monterrey for dinner tonight, 
           4 people, somewhere nice with Italian food"
3. Eve agent calls connection_search → finds bot247-discovery tools
4. Eve calls connection_execute → search_businesses(...)
5. Eve presents 3 options with prices, ratings, distances
6. User: "The first one sounds great, do they have vegetarian pasta?"
7. Eve calls connection_execute → get_menu(id, dietary_filter: ["vegetarian"])
8. Eve shows vegetarian menu items with prices
9. User: "Perfect, can you reserve for 4 at 8pm?"
10. Eve calls connection_execute → check_availability(id, tonight, 20:00, 4)
11. Eve calls connection_execute → contact_agent(id, make_reservation, ...)
12. Eve: "Reserved! Confirmation #LT-2026-1003-2000-4. 
          La Trattoria di Roma, tonight 8 PM, 4 guests.
          Free valet parking. Smart casual dress code."
```

**Esto es EXACTAMENTE lo que la hackathon pide:** "build something agents want" + "demonstrate an agent actually using it."

**Docs:**
- [eve Getting Started](https://eve.dev/docs)
- [eve MCP Connections](https://eve.dev/docs/connections/mcp)
- [eve Tools](https://eve.dev/docs/tools)
- [Deploy eve to Vercel](https://eve.dev/docs/guides/deployment/vercel)

---

#### 5. AI SDK — Tools y Structured Output 🛠️

**Rol:** Implementar los MCP tools con typed inputs/outputs, y manejar la lógica de AI.

**Elementos que usamos:**

| Feature del AI SDK | Uso en nuestro proyecto |
|---|---|
| `generateObject` | Documento Maestro → structured profile |
| `embed` | Generar embeddings para semantic search |
| `generateText` | Bot247 agent responses a queries |
| `tool` definitions | Definir MCP tool schemas |
| Streaming | Stream responses del bot247 agent |
| Structured output | Guaranteed JSON output de todas las queries |

**Docs:**
- [AI SDK Quickstart](https://ai-sdk.dev/docs/getting-started/nextjs-app-router)
- [AI SDK Tool Calling](https://ai-sdk.dev/docs/ai-sdk-core/tools-and-tool-calling)
- [AI SDK Structured Output](https://ai-sdk.dev/docs/ai-sdk-core/generating-structured-data)

---

#### 6. v0 + shadcn/ui — Dashboard minimalista 📊

**Rol:** UI mínima para dos propósitos:

1. **Onboarding demo:** Form donde pegas un "Documento Maestro" y ves cómo se convierte en Business Profile
2. **Dashboard de monitoreo:** Ver queries de agentes en tiempo real

**No es prioridad** — la demo principal es el eve agent usando el MCP server. Pero un dashboard bonito ayuda en la presentación.

**Approach:**
- Usar v0 para generar la UI rápido
- shadcn/ui para componentes consistentes
- Supabase Realtime para live updates de queries

---

### Plan de Ejecución Optimizado (4 horas)

```
HORA 1 — Foundation (0:00 - 1:00)
├── 0:00 - 0:10  Redimir credits en credits.vercel.sh
│                 Setup Vercel team + Supabase project
├── 0:10 - 0:20  npx create-next-app + supabase template
│                 Deploy initial to Vercel (empty app running)
├── 0:20 - 0:40  Create Supabase schema (SQL migration)
│                 businesses, menu_items, agent_queries tables
│                 Enable pgvector extension
│                 Create indexes + functions
├── 0:40 - 1:00  Seed database with 12-15 realistic businesses
│                 Use AI Gateway to generate embeddings for each
│                 Mix of restaurants, clinics, services in Monterrey

HORA 2 — MCP Server Core (1:00 - 2:00)  
├── 1:00 - 1:20  Implement MCP server endpoint (app/api/mcp/route.ts)
│                 Setup Streamable HTTP transport
│                 Register 5 tools with schemas
├── 1:20 - 1:40  Implement search_businesses tool
│                 Combine: text search + pgvector + PostGIS + capability filter
│                 This is the star tool — make it great
├── 1:40 - 2:00  Implement get_business + get_menu tools
│                 Straightforward Supabase queries
│                 Deploy to Vercel — MCP server is LIVE

HORA 3 — Agent Layer + Demo (2:00 - 3:00)
├── 2:00 - 2:15  Implement check_availability tool
│                 Basic logic: check hours + static availability
├── 2:15 - 2:35  Implement contact_agent tool
│                 AI Gateway model call for Bot247 agent responses
│                 Simulated reservation confirmations
├── 2:35 - 3:00  Setup eve agent
│                 npx eve@latest init
│                 Configure MCP connection to our server
│                 Write agent instructions
│                 Test: can the eve agent find businesses?

HORA 4 — Polish + Pitch (3:00 - 4:00)
├── 3:00 - 3:15  Add /.well-known/ard.json endpoint
│                 Add /agents.json for standards compliance
│                 Add document onboarding endpoint (bonus)
├── 3:15 - 3:30  Quick dashboard with v0/shadcn
│                 Show live agent queries (Supabase Realtime)
│                 Show "before/after" of document → profile
├── 3:30 - 3:45  Full demo run-through
│                 Fix bugs, polish responses
│                 Test edge cases
├── 3:45 - 4:00  Prepare pitch
│                 Record demo if needed
│                 Final deploy
```

---

### Lo que le presentarías a los jueces

**Pitch de 2 minutos:**

> "Today, AI agents can buy things on Shopify and search APIs with x402.
> But they can't find a restaurant in Monterrey and make a reservation.
> 
> 24,000+ paid API services are discoverable by agents. But millions of
> local businesses — restaurants, clinics, salons — are completely invisible.
> 
> We built Bot247 AgentReady: a Business Discovery MCP Server that makes
> local businesses discoverable and usable by AI agents.
> 
> A business provides their information once. We automatically generate a
> structured, machine-readable profile with semantic search capabilities.
> 
> Any agent — Claude, ChatGPT, eve, custom — connects to our MCP server
> and can search businesses by natural language, check menus and prices,
> verify availability, and even make reservations through our business agents.
> 
> Let me show you."
>
> [Demo: eve agent finds restaurant → shows menu → checks availability → makes reservation]
>
> "We're doing for local businesses what Shopify Catalog does for ecommerce.
> Built on Supabase pgvector for semantic search, Vercel AI Gateway for
> intelligence, and standards-compliant with ARD and A2A Agent Cards.
> 
> This is something agents genuinely want — and can't get today."

---

### Alignment con judging criteria

La hackathon dice:

> "treat an agent as your product's user. Build a tool, API, data source, or service that helps it complete a task, and demonstrate an agent actually using it."

Nuestro proyecto:

| Criterio | Cómo lo cumplimos |
|---|---|
| **Agent es el usuario** | ✅ El MCP server es 100% para agentes, no para humanos |
| **Tool/API/data source** | ✅ MCP server con 5 tools + structured business data |
| **Helps complete a task** | ✅ Descubrir negocios, obtener info, hacer reservaciones |
| **Demonstrate an agent using it** | ✅ eve agent demuestra el flujo completo end-to-end |
| **Uses Supabase** | ✅ pgvector, PostGIS, Realtime, toda la data en Supabase |
| **Uses Vercel** | ✅ Next.js, AI Gateway, AI SDK, eve, Vercel Functions |

Además usamos los project ideas sugeridos de forma combinada:
- "A tool or API that gives agents a useful capability" → ✅ Business discovery
- "A retrieval or data-processing service for agents" → ✅ Semantic business search
- "An agent that demonstrates your service across multiple steps" → ✅ eve agent demo

---

*Sección añadida el 3 de Octubre, 2026.*
