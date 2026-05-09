import { useEffect, useState } from 'react';

const RECONNECT_MS = 3000;

export default function useTicks(url) {
  const [ticks, setTicks] = useState({});

  useEffect(() => {
    if (!url) return;
    let ws = null;
    let reconnectTimer = null;
    let stopped = false;

    function connect() {
      if (stopped) return;
      ws = new WebSocket(url);
      ws.onmessage = (evt) => {
        try { setTicks(JSON.parse(evt.data)); } catch {}
      };
      ws.onclose = () => { if (!stopped) reconnectTimer = setTimeout(connect, RECONNECT_MS); };
      ws.onerror = () => { ws.close(); };
    }

    connect();
    return () => {
      stopped = true;
      clearTimeout(reconnectTimer);
      ws?.close();
    };
  }, [url]);

  return ticks;
}
