# Prompt para Claude Opus 5.5 — Review & Build Plan

## Cómo usar este prompt

1. Abre una nueva conversación con Claude Opus 5.5 (o el modelo avanzado que prefieras)
2. Adjunta los 3 archivos como contexto:
   - `RESEARCH-agent-discovery-hackathon.md`
   - `HACKATHON-overview.md`
   - `PRD-draft-agent-ready.md`
3. Copia y pega el prompt de abajo
4. El modelo debe darte un PRD final completo con instrucciones de build paso a paso

---

## El Prompt

```
Eres un senior full-stack engineer y technical architect. Te voy a dar 3 documentos de un proyecto para un hackathon y necesito que los revises, mejores, y produzcas un plan de build extremadamente específico.

## CONTEXTO

Estoy en el Supabase Select 2026 Hackathon (hoy, 3 de octubre de 2026).
El prompt del hackathon es: "BUILD SOMETHING AGENTS WANT"
Tengo aproximadamente 4 horas para construir el proyecto.
Voy a construir usando Cursor con Composer 2.5 como coding agent.

## EL PROYECTO

"AgentReady" — un Business Discovery MCP Server que permite a AI agents descubrir y consultar negocios locales (restaurantes, clínicas, salones, servicios) en México.

Stack: Next.js + Supabase (pgvector + PostGIS) + Vercel AI Gateway + AI SDK + eve agent framework

## DOCUMENTOS ADJUNTOS

1. **RESEARCH** — Investigación profunda del ecosistema de agent discovery en 2026. Incluye análisis de competidores, protocolos (A2A, MCP, ARD, UCP, x402), gaps del mercado, y la oportunidad específica para business discovery de SMBs.

2. **HACKATHON-overview** — Información del hackathon, criterios de evaluación, panel de jueces, bonus categories (Best Use of Vercel, Claude, Stripe, Codex, Gemini), y estrategia.

3. **PRD-draft** — Draft del PRD técnico con: prerequisitos, schema de Supabase, 5 MCP tools, pipeline de onboarding, eve agent config, seed data plan, y plan del demo video.

## LO QUE NECESITO QUE HAGAS

### PARTE 1: Review del PRD

Revisa el PRD-draft críticamente. Para cada sección:
- ¿Es técnicamente correcto?
- ¿Falta algo?
- ¿Algo está mal implementado?

Específicamente valida:
1. **Schema de Supabase** — ¿Los tipos son correctos? ¿pgvector y PostGIS se usan así? ¿Los indexes son eficientes? ¿Las SQL functions están bien?
2. **MCP Server** — ¿Cómo se implementa un MCP server con Streamable HTTP en una API route de Next.js App Router? ¿Se usa `@modelcontextprotocol/sdk`? Dame el código exacto del setup.
3. **Tool schemas** — ¿Los parámetros y returns siguen la spec MCP correctamente?
4. **Eve connection** — ¿`defineMcpClientConnection` funciona con una URL remota? ¿Necesita algo especial para Streamable HTTP?
5. **AI SDK** — ¿`generateObject` y `embed` son las APIs correctas en AI SDK 7? ¿Cómo se conecta al AI Gateway de Vercel?
6. **Onboarding pipeline** — ¿El flow de text → AI → Supabase está bien diseñado? ¿Falta manejo de errores?

### PARTE 2: Mejoras de Arquitectura

Sugiere mejoras que sean realizables en 4 horas:
- ¿Hay una forma más simple de implementar algo?
- ¿Algo va a causar problemas en producción rápida (hackathon)?
- ¿Falta algún error handling crítico?
- ¿El approach de pgvector + PostGIS juntos funciona bien o hay conflictos?

### PARTE 3: Plan de Build para Composer 2.5

Esta es la parte más importante. Necesito un plan de build que pueda pasarle directamente a Composer 2.5 (modelo de coding de Cursor). Composer 2.5 es muy bueno ejecutando instrucciones específicas pero necesita:
- Instrucciones paso a paso claras
- Código completo (no pseudocódigo)
- Un archivo a la vez
- Context claro de qué hace cada pieza

Genera el plan como una SECUENCIA de prompts/instrucciones que le daré a Composer 2.5, organizados por hora:

#### HORA 1: Foundation
Prompt 1: "Crea el proyecto Next.js con estas dependencias: ..."
Prompt 2: "Crea el schema SQL de Supabase: ..."
Prompt 3: "Crea el seed script con estos 15 negocios: ..."
... etc.

#### HORA 2: MCP Server
Prompt 4: "Implementa el MCP server en /api/mcp/route.ts: ..."
Prompt 5: "Implementa el tool search_businesses: ..."
... etc.

#### HORA 3: Agent + Onboarding
... etc.

#### HORA 4: Polish + Demo
... etc.

Para cada prompt, incluye:
- Qué archivo crear o modificar
- El código completo o la descripción precisa
- Cómo verificar que funciona
- Dependencias de pasos anteriores

### PARTE 4: Seed Data Completa

Genera los 15 negocios de seed data completos con:
- Datos realistas de Monterrey, México
- Coordenadas GPS reales
- Menús/servicios con precios en MXN
- Horarios realistas
- Capabilities correctas para cada tipo de negocio
- Un mix de negocios con y sin agente

Entrega como un JSON que pueda importarse directamente con un script.

### PARTE 5: Checklist Pre-Build

Antes de empezar a construir, dame una checklist de verificación:
- [ ] Todas las cuentas creadas
- [ ] Todos los créditos redimidos
- [ ] Todas las dependencias instaladas
- [ ] Proyecto de Supabase creado con extensiones habilitadas
- [ ] Variables de entorno listas
- [ ] Repo de GitHub creado
- [ ] Proyecto conectado a Vercel
- etc.

### PARTE 6: Estrategia para Bonus Categories

Del HACKATHON-overview, tenemos estos bonus categories:
- Best Use of Vercel
- Best Use of Claude
- Best Use of Stripe
- Best Use of Codex
- Best Use of Multimodal AI for Gemini

Para cada uno, dime exactamente qué implementar (si vale la pena) y el effort requerido en minutos.

## FORMATO DE RESPUESTA

Quiero que tu respuesta sea un documento completo y autocontenido que pueda usar como mi "playbook" durante las 4 horas del hackathon. Debe ser tan específico que pueda copiar y pegar los prompts directamente en Composer 2.5 y que funcione.

No necesito que repitas la investigación de mercado ni el análisis competitivo — eso ya está en el RESEARCH. Enfócate 100% en el BUILD.

## RESTRICCIONES

- Solo 4 horas de build time
- Stack obligatorio: Supabase + Vercel (requerido por el hackathon)
- Node.js 24+ (requerido por eve)
- Deploy debe funcionar en Vercel
- MCP server debe ser accesible públicamente
- Los jueces evalúan: innovación, ejecución técnica, uso de Supabase, impacto práctico, y demo
- Un juez es de Anthropic, uno de Stripe, uno de Vercel, dos de Supabase
```

---

## Notas sobre el uso del prompt

### Si el modelo pide más contexto:
- Dale acceso a los 3 archivos completos
- Si pregunta sobre MCP SDK, dale la URL: https://modelcontextprotocol.io/docs
- Si pregunta sobre AI SDK, dale la URL: https://ai-sdk.dev/docs
- Si pregunta sobre eve, dale la URL: https://eve.dev/docs
- Si pregunta sobre Supabase pgvector, dale la URL: https://supabase.com/docs/guides/ai

### Si el modelo es demasiado ambicioso:
- Recuérdale: "Solo tengo 4 horas. Prefiero algo que funcione al 100% con 3 tools que algo que falle con 5 tools."
- Prioridad: search_businesses > get_business > get_menu > contact_agent > check_availability

### Qué hacer con la respuesta:
1. Leer el review del PRD y corregir errores
2. Guardar el plan de build como tu playbook
3. Copiar los prompts uno por uno a Composer 2.5 durante el hackathon
4. Guardar la seed data como un archivo JSON en el proyecto
5. Seguir la checklist antes de empezar a construir
