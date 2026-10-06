# Prompt para Claude Opus 5.5 — Investigación de Arquitectura

Copia todo debajo de la línea y pásalo a Opus 5.5. Adjunta como contexto:
- `docs/WHAT-IS-AGENTREADY.md`
- `docs/GLOSSARY.md`
- `docs/FOLLOW-UP.md`
- `lib/mcp/tools/contact-agent.ts`
- `lib/mcp/tools/search-businesses.ts`
- `lib/onboard.ts`
- `app/api/mcp/route.ts`

---

```
## CONTEXTO

Soy Daniel Parra. Tengo un producto llamado Bot247 que digitaliza negocios locales (PyMEs) en México. Construí "AgentReady" en el Supabase Select 2026 Hackathon — un MCP server que hace estos negocios locales descubribles y reservables por agentes de IA.

## ESTADO ACTUAL (funcional, en producción)

AgentReady es un MCP server deployado en Vercel Functions que expone 6 herramientas:
- search_businesses: búsqueda híbrida (pgvector semántica + tsvector keyword + PostGIS geoespacial)
- get_business: perfil completo de un negocio
- get_menu: menú/servicios con precios
- check_availability: horarios + capacidad en tiempo real
- contact_agent: el agente llamante habla con el "agente" del negocio (Claude genera la respuesta usando datos del negocio como contexto)
- list_categories: vocabulario del directorio

Stack: Next.js 16, Supabase (pgvector, PostGIS, Realtime, RLS), Vercel AI Gateway, AI SDK 7, Streamable HTTP transport.

Producción: https://agentready-gilt.vercel.app/api/mcp
15 negocios seed, 94 menu items, búsqueda y reservaciones verificadas end-to-end con Claude Code.

## EL MODELO ACTUAL DE "AGENTE DE NEGOCIO"

Hoy, cuando un agente llama `contact_agent`, NO hay un agente separado corriendo. Lo que pasa es:
1. Se busca el perfil del negocio en Supabase (menú, horarios, políticas)
2. Se construye un system prompt: "Eres el asistente de [nombre del negocio], aquí están tus datos..."
3. Se llama a Claude via AI Gateway con ese prompt + el mensaje del agente
4. Claude genera una respuesta "como si fuera" el agente del negocio
5. Si la acción es una reservación, se valida disponibilidad y se guarda en DB

Esto funciona pero tiene limitaciones:
- No hay memoria entre conversaciones
- No puede hacer acciones fuera del MCP (no manda WhatsApp, no llama por teléfono)
- No es un agente real — es un prompt con datos del negocio

## LA VISIÓN A LARGO PLAZO

Queremos evolucionar hacia un ecosistema donde:

1. **Bot247 como plataforma de agentes**: Cuando un negocio se registra en Bot247, automáticamente se crea un agente personalizado para ese negocio con:
   - Instructions personalizadas (personalidad, políticas, conocimiento del negocio)
   - Herramientas propias (acceso a su calendario, su sistema de inventario, su WhatsApp Business)
   - Su propio A2A Agent Card publicado para discovery

2. **AgentReady como directorio + discovery layer**: AgentReady ya no solo contiene la data sino que CONECTA a agentes clientes con los agentes de cada negocio. Cuando `contact_agent` se llama, AgentReady delega al agente real del negocio via A2A.

3. **Interoperabilidad abierta**: Los agentes de negocios pueden comunicarse con CUALQUIER agente del ecosistema — no solo los de Bot247. Un GrokBot, un agente de Muse, un agente custom — cualquiera que implemente A2A puede descubrir y hablar con el agente de un negocio.

4. **Dual discovery**: Los negocios son descubribles tanto via MCP (agentes configurados) como via API REST + llms.txt (agentes navegando internet).

## LO QUE NECESITO QUE INVESTIGUES

### A. Arquitectura de agentes multi-tenant

Necesito que investigues y propongas una arquitectura donde Bot247 pueda crear y gestionar miles de agentes de negocios:

1. ¿Cuál es la mejor arquitectura para agentes multi-tenant? ¿Un servidor con routing por business_id, o instancias separadas?
2. ¿Cómo se personaliza cada agente (instructions, tools, data access) sin crear deployments separados?
3. ¿Qué framework es el más adecuado? Evalúa: eve (Vercel), LangGraph, CrewAI, AG2, o un harness custom con AI SDK.
4. ¿Cómo se maneja la memoria/contexto por negocio sin mezclar datos entre agentes?
5. ¿Cuánto cuesta mantener N agentes? ¿El costo escala linealmente o hay economías?

### B. A2A Integration

1. ¿Cómo se implementa un A2A server que pueda servir como endpoint para miles de negocios?
2. ¿Cada negocio necesita su propia URL de Agent Card, o pueden compartir un endpoint con multi-tenancy?
3. ¿Cómo se delega de MCP (AgentReady) a A2A (agente del negocio) en la práctica?
4. ¿A2A v1.0 ya soporta multi-tenancy nativamente?
5. ¿Cómo se autentican las comunicaciones A2A entre agentes?

### C. Discovery autónomo

1. ¿Qué cambios se necesitan para que un agente navegando internet pueda usar AgentReady sin configuración previa?
2. ¿Es viable exponer un API REST paralelo al MCP? ¿O hay una forma mejor?
3. ¿Qué formato debería tener el llms.txt para máxima utilidad?
4. ¿Qué estándares de SEO agentic (JSON-LD, Content Signals, WebMCP, MCP Server Cards) vale la pena implementar hoy vs. esperar?

### D. Capacidades del agente de negocio

Para cada tipo de negocio (restaurante, clínica, salón, hotel), investiga:
1. ¿Qué acciones concretas haría el agente que generen valor real?
2. ¿Qué integraciones necesitaría (WhatsApp, calendar, POS, inventario)?
3. ¿Qué acciones puede hacer solo con datos en Supabase vs. cuáles necesitan integración externa?
4. ¿Pueden clientes humanos hablar directamente con el agente del negocio (no solo agentes de IA)?

### E. Evaluación de viabilidad técnica

1. ¿El stack actual (Next.js + Supabase + Vercel) soporta esta evolución o necesita cambios fundamentales?
2. ¿Vercel Functions tiene limitaciones para agentes persistentes (timeout, memoria)?
3. ¿Se necesita un servicio separado para los agentes (ej: un servidor Node.js en Railway/Fly.io)?
4. ¿Cuál es el MVP mínimo para pasar de "prompt con datos" a "agente real"?

## FORMATO DE RESPUESTA

1. **Assessment técnico**: ¿Es viable la visión? ¿Qué es factible a 3 meses vs. 12 meses?
2. **Arquitectura propuesta**: Diagrama y descripción de la arquitectura target
3. **Migration path**: Pasos concretos para ir del estado actual a la arquitectura target, priorizados por impacto y complejidad
4. **Stack recommendation**: Qué tecnologías agregar, cuáles mantener, cuáles reemplazar
5. **Riesgos y mitigaciones**: Qué puede salir mal y cómo prevenirlo

## RESTRICCIONES

- El stack actual (Supabase + Vercel) debe mantenerse como base — estamos comprometidos con estas plataformas
- Los 6 MCP tools actuales NO deben romperse — toda evolución es aditiva
- Bot247 ya tiene miles de negocios digitalizados en México — el cold-start problem del directorio está resuelto
- Presupuesto de infra: ~$500-1000 USD/mes para empezar
- Equipo: 1-2 developers full-time

Sé específico con código, diagramas, y recomendaciones accionables. No teorices sin aterrizar.
```
