# AgentReady — Estado del Proyecto (Oct 3, 2026 ~22:25 UTC)

## Production

| Recurso | URL | Estado |
|---|---|---|
| Homepage / Dashboard | https://agentready-gilt.vercel.app | Live |
| MCP Endpoint | https://agentready-gilt.vercel.app/api/mcp | 6 tools |
| Health | https://agentready-gilt.vercel.app/api/health | 15 businesses |
| Onboarding | https://agentready-gilt.vercel.app/onboard | Functional |
| GitHub | https://github.com/dnlparra/agentready | Up to date |

## QA Report (by Opus 5.5)

| Test | Result |
|---|---|
| Health, tools/list, discovery files | Pass |
| search_businesses (semantic) | Pass - La Trattoria di Roma first |
| search_businesses (geo) | Pass - Tacos El Paisa at 0.2 km |
| get_business | Pass - Full profile with hours |
| get_menu (dietary filter) | Pass - 6 vegetarian items |
| check_availability | Pass - available, capacity 56 |
| contact_agent | Pass - confirmed, code LTD-GRFWJ |
| list_categories | Pass - 15 businesses, 9 with agent |
| TypeScript + Build | Pass - No errors |
| Supabase data integrity | Pass - 15/15 embeddings, 94 items |
| Dashboard Realtime | Pass - Events appear live |
| Onboarding (text to profile) | Pass - 14s, 4 items created |
| Claude Code end-to-end | Pass - Full booking flow |
| Eve agent | Not tested (macOS EPERM) |

## Known Issues (Non-blocking)

1. `/api/onboard` is open (no `ONBOARD_API_KEY` set) - anyone can spend credits
2. `contact_agent` replies in Spanish even for English requests (cosmetic)
3. Low-relevance results appear at bottom of search (e.g., CoWork for "tacos")
4. `get_menu` with special characters in `search` param may error
5. Duplicate reservations possible if agent retries
6. Late-night bookings (01:00) may count against wrong date

## Test Reservations in Production

| Code | Customer | Source |
|---|---|---|
| LTD-M9MBF | Daniel | Initial smoke test |
| LTD-GRFWJ | QA Test | Opus 5.5 verification |
| LTD-CQZB7 | Daniel | Claude Code e2e test |

> Consider deleting QA reservations before recording the demo video.

## Build Completion

| Phase | Status |
|---|---|
| T0 Scaffold | Done |
| T1 Supabase + env | Done |
| T2 Libraries | Done |
| T3 Seed (15 businesses, 94 items) | Done |
| T4 MCP Server (6 tools) | Done |
| T5 Smoke test | Done |
| T6 Deploy to Vercel | Done |
| T7 Dashboard (Realtime) | Done |
| T8 Onboarding | Done |
| T9 Eve agent | Setup done, not deployed |
| T10 README | Done |
| T11 Stripe (bonus) | Not started |
| UI Redesign | Done (Stripe-like) |

**Overall: ~90% complete. Ready for demo.**
