import { useState, useEffect, useRef, useCallback } from 'react';

const MAX_ENTRIES = 300;
const SERVICES = ['trader-bot', 'portfolio-manager', 'broker-manager'];
const ERROR_TYPES = new Set(['error', 'warning']);

function initState() {
  return {
    byService: Object.fromEntries(SERVICES.map((s) => [s, { errors: [], logs: [], aiDecisions: [], orders: [] }])),
    ticks: {},
    connected: false,
  };
}

export default function useLoggerWS(url) {
  const [state, setState] = useState(initState);
  const wsRef = useRef(null);
  const retryRef = useRef(null);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => setState((s) => ({ ...s, connected: true }));

    ws.onclose = () => {
      setState((s) => ({ ...s, connected: false }));
      retryRef.current = setTimeout(connect, 5000);
    };

    ws.onerror = () => ws.close();

    ws.onmessage = (evt) => {
      let entry;
      try {
        entry = JSON.parse(evt.data);
      } catch {
        return;
      }

      // diagnostic — remove once tick display is confirmed working
      console.log('[ws]', entry.type, entry.source_system, entry.tick?.symbol ?? '');

      setState((s) => {
        if (entry.type === 'tick') {
          const sym = entry.tick?.symbol ?? '';
          if (!sym) return s;
          return {
            ...s,
            ticks: {
              ...s.ticks,
              [sym]: { ...entry.tick, _at: Date.now() },
            },
          };
        }

        if (entry.type === 'order') {
          const bucket = s.byService['trader-bot'];
          const next = [entry, ...bucket.orders].slice(0, MAX_ENTRIES);
          return {
            ...s,
            byService: {
              ...s.byService,
              'trader-bot': { ...bucket, orders: next },
            },
          };
        }

        if (entry.type === 'ai_decisions') {
          const bucket = s.byService['trader-bot'];
          const next = [entry, ...bucket.aiDecisions].slice(0, MAX_ENTRIES);
          return {
            ...s,
            byService: {
              ...s.byService,
              'trader-bot': { ...bucket, aiDecisions: next },
            },
          };
        }

        const src = entry.source_system;
        if (!SERVICES.includes(src)) return s;

        const bucket = s.byService[src];
        const isError = ERROR_TYPES.has(entry.type);
        const key = isError ? 'errors' : 'logs';
        const next = [entry, ...bucket[key]].slice(0, MAX_ENTRIES);

        return {
          ...s,
          byService: {
            ...s.byService,
            [src]: { ...bucket, [key]: next },
          },
        };
      });
    };
  }, [url]);

  useEffect(() => {
    connect();
    return () => {
      clearTimeout(retryRef.current);
      wsRef.current?.close();
    };
  }, [connect]);

  return state;
}
