# AgentReady — Guía de Pruebas del MCP Server

## URLs de Producción

| Recurso | URL |
|---|---|
| Dashboard / Home | https://agentready-gilt.vercel.app |
| MCP Endpoint | https://agentready-gilt.vercel.app/api/mcp |
| Health Check | https://agentready-gilt.vercel.app/api/health |
| Onboarding UI | https://agentready-gilt.vercel.app/onboard |
| ARD Discovery | https://agentready-gilt.vercel.app/.well-known/ard.json |
| Agents manifest | https://agentready-gilt.vercel.app/agents.json |
| GitHub Repo | https://github.com/dnlparra/agentready |

---

## 1. Health Check

```bash
curl -s https://agentready-gilt.vercel.app/api/health | python3 -m json.tool
```

**Esperado:**
```json
{
    "ok": true,
    "businesses": 15,
    "agent_queries": 5,
    "reservations": 1
}
```
- `businesses` = 15 (seed data)
- `agent_queries` crece con cada llamada MCP
- `reservations` crece con cada booking vía `contact_agent`

---

## 2. MCP tools/list — Listar los 6 tools

```bash
curl -s -X POST https://agentready-gilt.vercel.app/api/mcp \
  -H 'content-type: application/json' \
  -H 'accept: application/json, text/event-stream' \
  -H 'mcp-protocol-version: 2025-06-18' \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}' \
  | sed -n 's/^data: //p' | python3 -m json.tool
```

**Esperado:** 6 tools:
1. `search_businesses` — búsqueda híbrida (semántica + keyword + geo)
2. `get_business` — perfil completo de un negocio
3. `get_menu` — menú/servicios con filtros
4. `check_availability` — disponibilidad por fecha/hora
5. `contact_agent` — hablar con el agente AI del negocio
6. `list_categories` — vocabulario de categorías y capabilities

---

## 3. search_businesses — Búsqueda Semántica

### 3a. Búsqueda por texto libre
```bash
curl -s -X POST https://agentready-gilt.vercel.app/api/mcp \
  -H 'content-type: application/json' \
  -H 'accept: application/json, text/event-stream' \
  -H 'mcp-protocol-version: 2025-06-18' \
  -H 'x-agent-name: test-agent' \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"search_businesses","arguments":{"query":"romantic italian dinner with wine"}}}' \
  | sed -n 's/^data: //p' | python3 -m json.tool
```
**Esperado:** "La Trattoria di Roma" como primer resultado, `search_mode: "hybrid_semantic"`, `has_agent: true`.

### 3b. Búsqueda geográfica (cerca de Macroplaza)
```bash
curl -s -X POST https://agentready-gilt.vercel.app/api/mcp \
  -H 'content-type: application/json' \
  -H 'accept: application/json, text/event-stream' \
  -H 'mcp-protocol-version: 2025-06-18' \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"search_businesses","arguments":{"query":"tacos","lat":25.6692,"lng":-100.3099,"radius_km":5}}}' \
  | sed -n 's/^data: //p' | python3 -m json.tool
```
**Esperado:** "Tacos El Paisa" primero, con `distance_km` ~0.2.

### 3c. Búsqueda con filtros
```bash
curl -s -X POST https://agentready-gilt.vercel.app/api/mcp \
  -H 'content-type: application/json' \
  -H 'accept: application/json, text/event-stream' \
  -H 'mcp-protocol-version: 2025-06-18' \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"search_businesses","arguments":{"query":"place to work with wifi","category":"cafe","capabilities":["wifi"]}}}' \
  | sed -n 's/^data: //p' | python3 -m json.tool
```
**Esperado:** "Café Literario" o "CoWork MTY".

---

## 4. get_business — Perfil Completo

```bash
curl -s -X POST https://agentready-gilt.vercel.app/api/mcp \
  -H 'content-type: application/json' \
  -H 'accept: application/json, text/event-stream' \
  -H 'mcp-protocol-version: 2025-06-18' \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"get_business","arguments":{"business_id":"la-trattoria-di-roma"}}}' \
  | sed -n 's/^data: //p' | python3 -m json.tool
```
**Esperado:** Perfil completo con address, hours, capabilities, policies, `has_agent: true`, `agent_capabilities`.

**Nota:** acepta UUID o slug.

---

## 5. get_menu — Menú con Filtros

### 5a. Filtro dietético
```bash
curl -s -X POST https://agentready-gilt.vercel.app/api/mcp \
  -H 'content-type: application/json' \
  -H 'accept: application/json, text/event-stream' \
  -H 'mcp-protocol-version: 2025-06-18' \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"get_menu","arguments":{"business_id":"la-trattoria-di-roma","dietary":["vegetarian"]}}}' \
  | sed -n 's/^data: //p' | python3 -m json.tool
```
**Esperado:** Items vegetarianos agrupados por sección, con precios en MXN.

### 5b. Filtro por precio máximo
```bash
curl -s -X POST https://agentready-gilt.vercel.app/api/mcp \
  -H 'content-type: application/json' \
  -H 'accept: application/json, text/event-stream' \
  -H 'mcp-protocol-version: 2025-06-18' \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"get_menu","arguments":{"business_id":"la-trattoria-di-roma","max_price":200}}}' \
  | sed -n 's/^data: //p' | python3 -m json.tool
```
**Esperado:** Solo items ≤ 200 MXN.

---

## 6. check_availability — Disponibilidad

```bash
curl -s -X POST https://agentready-gilt.vercel.app/api/mcp \
  -H 'content-type: application/json' \
  -H 'accept: application/json, text/event-stream' \
  -H 'mcp-protocol-version: 2025-06-18' \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"check_availability","arguments":{"business_id":"la-trattoria-di-roma","time":"21:00","party_size":4}}}' \
  | sed -n 's/^data: //p' | python3 -m json.tool
```
**Esperado:** `status: "available"` (si la Trattoria abre sábado 13:00-23:59), `remaining_capacity`, `can_book_via_agent: true`.

---

## 7. contact_agent — Reserva Completa

```bash
curl -s -X POST https://agentready-gilt.vercel.app/api/mcp \
  -H 'content-type: application/json' \
  -H 'accept: application/json, text/event-stream' \
  -H 'mcp-protocol-version: 2025-06-18' \
  -H 'x-agent-name: test-agent' \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"contact_agent","arguments":{"business_id":"la-trattoria-di-roma","action":"make_reservation","message":"Table for 4, anniversary celebration","time":"21:00","party_size":4,"customer_name":"TestUser"}}}' \
  | sed -n 's/^data: //p' | python3 -m json.tool
```
**Esperado:**
- `outcome: "confirmed"`
- `confirmation_code: "LTD-XXXXX"`
- `reply` con mensaje del agente del negocio (Claude)
- `booking` con date, time, party_size, customer_name

**NOTA:** Cada llamada gasta créditos de AI Gateway (Claude genera la respuesta del agente del negocio).

---

## 8. list_categories — Vocabulario

```bash
curl -s -X POST https://agentready-gilt.vercel.app/api/mcp \
  -H 'content-type: application/json' \
  -H 'accept: application/json, text/event-stream' \
  -H 'mcp-protocol-version: 2025-06-18' \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"list_categories","arguments":{}}}' \
  | sed -n 's/^data: //p' | python3 -m json.tool
```
**Esperado:** 12 categorías, 50+ capabilities, `total_businesses: 15`, `with_agent: 9`.

---

## 9. Conectar desde Claude Code

```bash
claude mcp add --transport http agentready https://agentready-gilt.vercel.app/api/mcp
```

Luego probar:
- "Find me a romantic Italian place in Monterrey for 4 tonight at 9pm and book it under Daniel"
- "Find tacos open now near Macroplaza"
- "I need a dentist that speaks English in Monterrey"
- "What vegan options does Café Literario have?"

---

## 10. Conectar desde eve (agente local)

```bash
cd /Users/danielparra/Documents/agent-ready-eve
npm exec -- eve dev
```

En el TUI de eve, probar los mismos prompts del punto 9.

---

## 11. Onboarding — Agregar un nuevo negocio

Navegar a https://agentready-gilt.vercel.app/onboard y pegar un texto descriptivo de un negocio (mínimo 40 caracteres). El AI extrae nombre, categoría, dirección, horarios, servicios y lo hace buscable.

---

## 12. Dashboard en Vivo (Realtime)

Abrir https://agentready-gilt.vercel.app en un navegador. El feed muestra en tiempo real:
- Cada query que hace un agente
- Cada reserva confirmada

Para probarlo: abrir el dashboard en una ventana y hacer una llamada MCP en otra terminal. La fila debe aparecer sin recargar.

---

## Datos en Supabase

Para verificar directamente en Supabase Dashboard (proyecto `fuyciuhbvrkuyjvymipo`):

```sql
-- Conteos
select count(*) from businesses;           -- 15
select count(*) from menu_items;           -- 94
select count(*) from businesses where has_agent;  -- 9
select count(*) from businesses where embedding is not null;  -- 15

-- Queries del agente (live log)
select tool_name, query_params, agent_identifier, created_at 
from agent_queries order by created_at desc limit 10;

-- Reservas
select b.name, r.confirmation_code, r.action, r.customer_name, r.date, r.time, r.party_size
from reservations r join businesses b on r.business_id = b.id
order by r.created_at desc;

-- Vocabulario
select public.business_vocabulary();
```
