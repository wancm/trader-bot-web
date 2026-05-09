import { useEffect, useRef, useState } from 'react';

const STALE_MS = 2000;
const RECONNECT_MS = 3000;

export default function useHeartbeat(url) {
  const [isUp, setIsUp] = useState(false);
  const lastMs = useRef(0);

  useEffect(() => {
    let ws = null;
    let reconnectTimer = null;
    let stopped = false;

    function connect() {
      if (stopped) return;
      ws = new WebSocket(url);
      ws.onmessage = () => { lastMs.current = Date.now(); };
      ws.onclose  = () => { if (!stopped) reconnectTimer = setTimeout(connect, RECONNECT_MS); };
      ws.onerror  = () => { ws.close(); };
    }

    connect();

    const interval = setInterval(() => {
      setIsUp(Date.now() - lastMs.current < STALE_MS);
    }, 500);

    return () => {
      stopped = true;
      clearTimeout(reconnectTimer);
      clearInterval(interval);
      ws?.close();
    };
  }, [url]);

  return isUp;
}
