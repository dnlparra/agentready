# Prompt para Opus 5.5 — Verificar y Completar AgentReady

Copia y pega este prompt a Opus 5.5. Dale acceso a la carpeta `/Users/danielparra/Documents/Hackathon/`.

---

```
Eres un QA engineer y senior architect. El proyecto "AgentReady" ya fue construido y desplegado.
Tu trabajo es verificar que todo funciona, encontrar bugs, y completar lo que falte.

## ESTADO ACTUAL

El proyecto está desplegado y funcionando en:
- Production: https://agentready-gilt.vercel.app
- MCP endpoint: https://agentready-gilt.vercel.app/api/mcp
- Health: https://agentready-gilt.vercel.app/api/health
- GitHub: https://github.com/dnlparra/agentready
- Supabase project: fuyciuhbvrkuyjvymipo
- Vercel team: Agent Atlas (team_6x83NgPq62x9tS5r2w9YzsyP)
- Vercel project: agentready (prj_h98Qki7J8uWWz2E6lzyzqozUC4Qd)

Eve agent está en: /Users/danielparra/Documents/agent-ready-eve/
Código principal en: /Users/danielparra/Documents/Hackathon/

Stack: Next.js 16 + Supabase (pgvector + PostGIS) + Vercel AI Gateway + AI SDK 7 + mcp-handler 2.x + eve 0.71

## LO QUE DEBES HACER (en orden)

### PASO 1: Verificar infraestructura (5 min)

Ejecuta estos comandos y reporta el resultado:

```bash
# 1. Health check
curl -s https://agentready-gilt.vercel.app/api/health

# 2. MCP tools/list (debe devolver 6 tools)
curl -s -X POST https://agentready-gilt.vercel.app/api/mcp \
  -H 'content-type: application/json' \
  -H 'accept: application/json, text/event-stream' \
  -H 'mcp-protocol-version: 2025-06-18' \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}' | sed -n 's/^data: //p'

# 3. Discovery files
curl -s https://agentready-gilt.vercel.app/.well-known/ard.json
curl -s https://agentready-gilt.vercel.app/agents.json
```

### PASO 2: Smoke test de cada tool (10 min)

Ejecuta cada uno de estos tests y verifica la respuesta.
Lee el archivo docs/TESTING-GUIDE.md para los comandos completos con respuestas esperadas.

Tests obligatorios:
1. **search_businesses** — query "romantic italian dinner" → primer resultado: "La Trattoria di Roma"
2. **search_businesses geo** — query "tacos" con lat/lng de Macroplaza → "Tacos El Paisa" a ~0.2km
3. **get_business** — slug "la-trattoria-di-roma" → perfil completo con hours, capabilities
4. **get_menu** — filtro vegetarian → items vegetarianos con precios MXN
5. **check_availability** — Trattoria, 21:00, party 4 → status "available" (si es sábado y la hora no ha pasado)
6. **contact_agent** — reserva en Trattoria → outcome "confirmed" + confirmation_code
7. **list_categories** → total_businesses: 15, with_agent: 9

Si CUALQUIER test falla, investiga y arregla. Los errores típicos son:
- 500 en producción pero funciona local → variable de entorno faltante
- search devuelve vacío → schema no corrido o embeddings nulos
- contact_agent timeout → AI Gateway key inválida o sin créditos

### PASO 3: Verificar TypeScript (2 min)

```bash
cd /Users/danielparra/Documents/Hackathon
eval "$(fnm env)" && fnm use 24
npx tsc --noEmit
npx next build
```

Ambos deben pasar sin errores. Si hay errores, corrígelos.

### PASO 4: Verificar eve agent (5 min)

```bash
cd /Users/danielparra/Documents/agent-ready-eve
eval "$(fnm env)" && fnm use 24
npx eve info
```

Debe mostrar: 7 tools, 0 errors, 0 warnings, conexión "agentready" apuntando a https://agentready-gilt.vercel.app/api/mcp.

Si hay errores en la conexión o en la versión de Node, corrígelos.

### PASO 5: Verificar Supabase data (2 min)

Usa el Supabase MCP o ejecuta SQL:

```sql
select count(*) from businesses;                              -- debe ser 15
select count(*) from businesses where embedding is not null;  -- debe ser 15
select count(*) from menu_items;                              -- debe ser 94
select count(*) from businesses where has_agent;              -- debe ser 9
select public.business_vocabulary();                          -- debe retornar el vocabulario completo
```

### PASO 6: Revisar código por bugs (10 min)

Lee estos archivos y busca problemas:
- lib/mcp/tools/*.ts — ¿manejan errores? ¿validan inputs? ¿devuelven isError:true en fallas?
- lib/hours.ts — ¿la lógica de timezone es correcta? ¿maneja close < open (past midnight)?
- lib/availability.ts — ¿descuenta reservas existentes de la capacidad?
- lib/onboard.ts — ¿valida el input? ¿maneja fallas de embedding gracefully?
- app/api/mcp/route.ts — ¿exporta GET, POST, DELETE?
- app/live-feed.tsx — ¿se conecta a Realtime correctamente?
- scripts/seed.ts — ¿es idempotente? (upsert por slug)

Para cada bug que encuentres:
1. Describe el bug
2. Explica el impacto (rompe la demo / cosmético / edge case)
3. Corrígelo si es severidad alta
4. Commit + push si corriges algo

### PASO 7: Dashboard y Onboarding visual (5 min)

Abre en el navegador:
1. https://agentready-gilt.vercel.app — ¿Se carga? ¿Muestra el endpoint MCP? ¿El feed de Realtime se conecta?
2. https://agentready-gilt.vercel.app/onboard — ¿El formulario se ve? ¿El botón funciona?

Si hay errores de UI, corrígelos.

### PASO 8: Test end-to-end con Claude Code (5 min)

```bash
claude mcp add --transport http agentready https://agentready-gilt.vercel.app/api/mcp
```

Luego pregunta al agente:
"Find me a romantic Italian place in Monterrey for 4 tonight at 9pm and book it under Daniel"

Claude debe:
1. Llamar search_businesses
2. Encontrar La Trattoria di Roma
3. Llamar check_availability
4. Llamar contact_agent con make_reservation
5. Devolver un confirmation_code

Verifica en el dashboard que la reserva aparece en tiempo real.

### PASO 9: Reporte final

Genera un reporte con:
- ✅/❌ para cada test
- Bugs encontrados y si se corrigieron
- Sugerencias de mejora que NO hacer (fuera de scope del hackathon)
- Confirmación de que el proyecto está listo para la demo

## RESTRICCIONES

- El hackathon cierra a las 00:30 UTC (hoy 3 de octubre 2026)
- No reescribas archivos de referencia (playbook/reference/) — esos son la fuente de verdad
- Si corriges algo, haz commit + push para que Vercel redespliegue automáticamente
- No hagas cambios cosméticos que no impacten la demo
- Prioriza: funcionalidad > estética

## ARCHIVOS CLAVE

| Archivo | Qué es |
|---|---|
| docs/TESTING-GUIDE.md | Guía completa de pruebas con todos los curl commands |
| playbook/PLAYBOOK.md | El playbook original de Opus 5.5 con arquitectura y task cards |
| lib/mcp/tools/*.ts | Los 6 MCP tools |
| lib/mcp/register.ts | Registro de tools en el server |
| app/api/mcp/route.ts | Endpoint MCP (Streamable HTTP) |
| app/page.tsx | Dashboard con Realtime feed |
| app/onboard/page.tsx | Formulario de onboarding |
| scripts/seed.ts | Script de seed data |
| data/seed-data.json | 15 negocios de Monterrey |
| supabase/schema.sql | Schema completo |
```
