# Glosario de AgentReady

Términos clave para entender el proyecto, explicados de manera sencilla.

---

## Agente (AI Agent)

Un programa que corre en un servidor, usa un LLM (como Claude o GPT) como "cerebro" para razonar, y puede ejecutar acciones reales — buscar en bases de datos, hacer reservaciones, enviar mensajes — de manera autónoma. A diferencia de un chatbot que solo contesta preguntas, un agente ACTÚA.

**Ejemplo:** Un agente de restaurante recibe "reserva mesa para 4 a las 9pm", verifica disponibilidad en la base de datos, genera un código de confirmación, y responde con la confirmación. No necesitó que un humano interviniera.

**Componentes de un agente:**
- **LLM (cerebro):** El modelo de IA que razona y toma decisiones (Claude, GPT, Grok)
- **Herramientas (tools):** Las acciones que el agente puede ejecutar (buscar, reservar, enviar email)
- **Instrucciones:** El contexto que le dice al agente quién es, qué sabe, y cómo debe comportarse
- **Harness / Framework:** El código que conecta todo: recibe la solicitud, le pasa el contexto al LLM, ejecuta la herramienta que el LLM elige, y devuelve el resultado

---

## MCP (Model Context Protocol)

Protocolo abierto creado por Anthropic que define cómo un agente de IA se conecta a herramientas y datos externos de manera estandarizada.

**Analogía:** MCP es como un enchufe universal para agentes. Así como cualquier aparato con enchufe estándar funciona en cualquier tomacorriente, cualquier agente compatible con MCP puede conectarse a cualquier servidor MCP y usar sus herramientas.

**Cómo funciona:**
1. El servidor MCP expone herramientas (ej: `search_businesses`, `get_menu`)
2. El agente se conecta al servidor y pregunta "¿qué herramientas tienes?"
3. El servidor responde con la lista de herramientas y sus parámetros
4. El agente usa las herramientas según lo que necesite

**En AgentReady:** El servidor MCP en `/api/mcp` expone 6 herramientas que cualquier agente MCP-compatible puede usar para buscar negocios, ver menús, verificar disponibilidad, y hacer reservaciones.

---

## A2A (Agent-to-Agent Protocol)

Protocolo abierto creado por Google que permite a dos agentes de IA comunicarse entre sí, sin importar en qué plataforma fueron construidos.

**Analogía:** Si MCP es cómo un agente usa herramientas (como un empleado usa una computadora), A2A es cómo dos agentes se delegan trabajo entre sí (como dos empleados de diferentes empresas que se mandan emails).

**MCP vs A2A:**
- MCP = agente ↔ herramienta (vertical: "usa esta base de datos")
- A2A = agente ↔ agente (horizontal: "hazme esta reservación")

---

## Agent Card (Tarjeta de Agente)

Un archivo JSON público que un agente publica en `/.well-known/agent-card` para que otros agentes puedan descubrir qué sabe hacer, dónde está su endpoint, y cómo autenticarse.

**Analogía:** Es como una tarjeta de presentación digital para agentes. Dice: "Soy el agente de La Trattoria, puedo hacer reservaciones y contestar preguntas sobre el menú, mi endpoint es esta URL, y acepto estos tipos de solicitudes."

**Ejemplo:**
```json
{
  "name": "La Trattoria Agent",
  "description": "Restaurant booking and menu inquiries",
  "url": "https://la-trattoria.bot247.mx/a2a",
  "capabilities": ["make_reservation", "answer_questions"],
  "authentication": { "type": "bearer" }
}
```

**Importancia:** Es el mecanismo de DISCOVERY en A2A. Sin Agent Card, otros agentes no pueden encontrar ni comunicarse con tu agente.

---

## MCP Server Card (SEP-2127)

Similar al Agent Card de A2A, pero para servidores MCP. Un archivo JSON publicado en `/.well-known/mcp/server-cards.json` que describe qué herramientas ofrece un servidor MCP.

**Estado:** Aún en draft (no finalizado). Ningún agente lo busca automáticamente todavía.

---

## Embedding (Embedding vectorial)

Una representación numérica del significado de un texto. Es una lista de números (ej: 1536 números) que captura el SIGNIFICADO semántico, no las palabras exactas.

**Ejemplo:** "restaurante italiano romántico" y "Italian fine dining with candlelight" tienen embeddings MUY similares aunque las palabras son completamente diferentes. Esto permite buscar por significado, no por coincidencia de texto.

**En AgentReady:** Cada negocio tiene un embedding de su descripción almacenado en pgvector. Cuando un agente busca "romantic Italian dinner", se genera un embedding de esa query y se compara con los embeddings de todos los negocios para encontrar los más similares.

---

## pgvector

Extensión de PostgreSQL que permite almacenar y buscar embeddings vectoriales. Es lo que hace posible la búsqueda semántica en Supabase.

**HNSW Index:** Un tipo de índice que pgvector usa para hacer búsquedas rápidas entre miles de embeddings. AgentReady usa HNSW porque funciona bien con pocos datos (a diferencia de ivfflat que necesita muchos datos para entrenarse).

---

## PostGIS

Extensión de PostgreSQL para datos geoespaciales. Permite hacer consultas como "encuentra todos los negocios a menos de 5 km de estas coordenadas".

**En AgentReady:** Cada negocio tiene coordenadas GPS. Cuando un agente busca "tacos near Macroplaza", PostGIS calcula la distancia real entre cada negocio y el punto de referencia.

---

## Streamable HTTP

El mecanismo de transporte que usa MCP para comunicarse por internet. Es un simple POST HTTP — el agente envía un request JSON, el servidor responde con JSON. No requiere WebSockets ni conexiones persistentes.

**Ventaja:** Funciona perfectamente en serverless (Vercel Functions) porque cada request es independiente.

---

## AI Gateway

Servicio de Vercel que actúa como proxy entre la aplicación y los proveedores de IA (OpenAI, Anthropic, Google). En lugar de llamar directamente a cada proveedor, todas las llamadas pasan por el gateway.

**Ventajas:** Un solo API key, logs centralizados, cambio de proveedor sin cambiar código, rate limiting incluido.

**En AgentReady:** El AI Gateway rutea a 3 proveedores:
- OpenAI → embeddings (text-embedding-3-small)
- Anthropic Claude → agente de negocios (contact_agent)
- Google Gemini → visión de menús (fotos de menú → JSON)

---

## ARD (Agentic Resource Discovery)

Estándar emergente para que sitios web declaren que tienen recursos disponibles para agentes. Se publica un archivo JSON en `/.well-known/ard.json`.

**En AgentReady:** El archivo ARD dice "aquí hay un servidor MCP para descubrir negocios locales" y da la URL del endpoint.

---

## llms.txt

Un archivo de texto plano en la raíz del sitio web, diseñado para que los LLMs lo lean y entiendan qué hace el sitio y cómo interactuar con él. Similar a robots.txt pero para modelos de IA en lugar de crawlers.

**AgentReady no tiene uno todavía** — agregarlo ayudaría a que agentes navegando la web puedan descubrir y usar el servicio autónomamente.

---

## Onboarding

El proceso de convertir información no estructurada de un negocio (un texto en español describiendo la tortería) en un perfil estructurado y buscable en la base de datos.

**Flujo en AgentReady:**
1. El negocio (o Bot247) envía un texto libre describiendo el negocio
2. Claude extrae: nombre, dirección, horarios, menú, precios, capabilities
3. OpenAI genera un embedding de la descripción
4. Todo se guarda en Supabase: el negocio es inmediatamente buscable por agentes

---

## RLS (Row Level Security)

Función de PostgreSQL/Supabase que controla quién puede ver/editar qué filas de una tabla. En lugar de controlar acceso a nivel de tabla completa, controla fila por fila.

**En AgentReady:** Las políticas RLS permiten que cualquiera pueda LEER negocios (lectura pública), pero solo el servicio con la Service Role Key puede ESCRIBIR nuevos negocios.

---

## eve

Framework de agentes de Vercel. Permite crear agentes que se conectan a herramientas (via MCP) y pueden tener conversaciones con usuarios.

**Componentes de un agente eve:**
- `agent.ts` — Configuración: qué modelo usa, nombre del agente
- `instructions.md` — Personalidad y reglas del agente (en lenguaje natural)
- `connections/` — Conexiones MCP que el agente puede usar

**Para negocios:** Eve podría ser la base para crear agentes personalizados por negocio. Cada negocio tendría sus propias instructions y datos, pero todos compartirían el mismo framework.

---

## Cold-Start Problem

El problema de que un servicio nuevo no tiene datos, y sin datos no atrae usuarios, y sin usuarios no obtiene datos. Es un problema de "huevo y gallina".

**En AgentReady:** El MCP solo es útil si tiene negocios cargados. Pero los negocios solo se registran si ven valor. Bot247 resuelve esto: ya tiene miles de negocios digitalizados que pueden poblar AgentReady automáticamente.

---

## Hybrid Search

Estrategia de búsqueda que combina múltiples métodos en una sola consulta:

1. **Semántica** (pgvector) — Busca por significado ("romantic dinner" → encuentra "cena romántica italiana")
2. **Keyword** (tsvector) — Busca coincidencia de palabras exactas ("Trattoria" → encuentra negocios con esa palabra)
3. **Geoespacial** (PostGIS) — Filtra por distancia ("near Macroplaza" → negocios a menos de X km)
4. **Filtros duros** — Categoría, precio, capabilities, abierto ahora

**En AgentReady:** Los 4 métodos corren en una sola función de PostgreSQL (`search_businesses`) para máximo rendimiento.

---

## Slug

Un identificador legible por humanos derivado del nombre del negocio. Se usa en URLs y como referencia rápida.

**Ejemplo:** "La Trattoria di Roma" → `la-trattoria-di-roma`

Los agentes pueden buscar negocios por slug (fácil de recordar) o por UUID (preciso pero ilegible).

---

## Supabase Realtime

Función de Supabase que permite recibir actualizaciones en tiempo real cuando cambian datos en la base de datos. Usa WebSockets para "empujar" cambios al navegador sin que el cliente tenga que preguntar repetidamente.

**En AgentReady:** El dashboard en la homepage muestra las queries de agentes y reservaciones en vivo. Cada vez que un agente hace una búsqueda o reservación, aparece en el dashboard instantáneamente.

---

## Capacity / Availability

**Capacity:** Cuántas personas/mesas/citas puede atender un negocio en un momento dado.

**Availability:** Si el negocio está abierto Y tiene capacidad disponible en una fecha/hora específica. AgentReady cruza los horarios del negocio con las reservaciones existentes para calcular disponibilidad real.

---

## has_agent (campo en la base de datos)

Indica si un negocio tiene un agente de IA que puede tomar acciones (reservar, ordenar, cotizar) o si solo tiene información estática.

- `has_agent: true` → El agente puede reservar mesa, tomar pedidos, responder preguntas con contexto del negocio
- `has_agent: false` → Solo información: dirección, horarios, menú. El agente le da al usuario el teléfono/WhatsApp para que contacte directamente

---

## JSON-LD

Formato para incluir datos estructurados dentro de una página web. Los motores de búsqueda y los agentes de IA lo leen para entender qué contiene la página sin tener que interpretar el HTML.

**Ejemplo para un negocio:**
```json
{
  "@type": "Restaurant",
  "name": "La Trattoria di Roma",
  "address": "Monterrey, Mexico",
  "openingHours": "Mo-Sa 12:00-23:00",
  "priceRange": "$$"
}
```

**AgentReady no tiene JSON-LD todavía** — agregarlo mejoraría la discoverability por buscadores y agentes con web search.
