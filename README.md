# trader-bot-web

Vanilla-JavaScript operator console for the trader-bot stack. Two pages:

- `/` — Home (navigation hub for future tools)
- `/log-viewer/` — Live WebSocket message viewer for `portfolio-manager` (`:8081/ws`)

Stack: [Vite](https://vitejs.dev) + [Material Web Components](https://github.com/material-components/material-web) (`@material/web`). No framework, no router, no TypeScript.

## Quickstart

```bash
cd applications/trader-bot-web
cp configs/.env.example configs/.env       # one-time
npm install
npm run dev                                  # http://localhost:5173/
```

Re-running `npm install && npm run dev` is safe — nothing is generated outside `node_modules/`, `dist/`, and `.vite/` (all gitignored).

## Build

```bash
npm run build      # → dist/index.html, dist/log-viewer/index.html
npm run preview    # serve dist/ on http://localhost:5173/
```

## Connecting to the backend

The Log Viewer's **Connect** button opens a WebSocket to `VITE_WS_URL`. Default: same-origin `/ws` on the dev server, which Vite proxies to `ws://localhost:8081` (see `vite.config.js → server.proxy`). Start `portfolio-manager` first:

```bash
cd ../portfolio-manager/cmd && go run .
```

**Why the proxy:** the backend uses `coder/websocket` with default `AcceptOptions`, which enforces same-origin and returns HTTP 403 to direct browser connections from `:5173 → :8081`. Routing through Vite makes the connection look same-origin to the backend.

The `/ws` endpoint is **request/response** — it does not push unsolicited messages. Use the **Send test request** panel on the Log Viewer page to issue a `get_portfolio_state` call and watch the response appear in the log.

## Configuration

| Variable | Default | Purpose |
|---|---|---|
| `VITE_WS_URL` | `ws://localhost:8081/ws` | WebSocket endpoint the Log Viewer connects to |

Vite reads env files from `configs/` (matches the rest of the repo's convention — see `applications/trader-bot/configs/.env.example`). Only `VITE_`-prefixed vars are exposed to client code.

## Security

Localhost-only, no auth — matches the system topology in [CLAUDE.md](../../CLAUDE.md) §4. Do **not** add token auth or TLS to this UI; the entire stack assumes loopback-only operation.
