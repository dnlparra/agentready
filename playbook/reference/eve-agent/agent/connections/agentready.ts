import { defineMcpClientConnection } from "eve/connections";

export default defineMcpClientConnection({
  url: process.env.MCP_SERVER_URL ?? "https://REPLACE_WITH_DOMAIN/api/mcp",
  description:
    "AgentReady Business Discovery — search, read menus/prices, check availability and book " +
    "reservations/appointments at local businesses in Monterrey, Mexico (restaurants, cafes, " +
    "dentists, doctors, salons, vets, hotels, gyms, coworking, services).",
  headers: { "x-agent-name": "eve-demo" },
});
