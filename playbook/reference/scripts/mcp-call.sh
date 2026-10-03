#!/usr/bin/env bash
# usage: scripts/mcp-call.sh <mcp-url> list
#        scripts/mcp-call.sh <mcp-url> <tool> '<json-args>'
URL="${1:-http://localhost:3000/api/mcp}"
TOOL="$2"
ARGS="${3:-"{}"}"
if [ "$TOOL" = "list" ]; then
  BODY='{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}'
else
  BODY="{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"tools/call\",\"params\":{\"name\":\"$TOOL\",\"arguments\":$ARGS}}"
fi
curl -s -X POST "$URL" \
  -H 'content-type: application/json' \
  -H 'accept: application/json, text/event-stream' \
  -H 'mcp-protocol-version: 2025-06-18' \
  -H 'x-agent-name: smoke-test' \
  -d "$BODY" | sed -n 's/^data: //p'
echo
