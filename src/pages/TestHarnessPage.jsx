import React, { useState, useRef, useEffect } from 'react';
import { Box, Typography, Paper, Button, Divider } from '@mui/material';
import useHeartbeat from '../hooks/useHeartbeat.js';

// ── Pre-populated payloads ────────────────────────────────────────────────────

const TICK_PAYLOAD = JSON.stringify(
  { symbol: 'EURUSD', bid: 1.085, ask: 1.08512, volume: 100, rsi: 45.2, timestamp: 1746793200 },
  null, 2,
);

const PORTFOLIO_STATE_PAYLOAD = JSON.stringify(
  { type: 'get_portfolio_state', request_id: 'test-001', user_alias: 'wancm', symbol: 'EURUSD' },
  null, 2,
);

const VALIDATE_ORDER_PAYLOAD = JSON.stringify(
  { type: 'validate_order', request_id: 'test-002', user_alias: 'wancm', symbol: 'EURUSD', action: 'BUY', quantity: 10, price: 1.085 },
  null, 2,
);

// ── LED (same style as ServiceColumn / TickPanel) ─────────────────────────────

function Led({ isUp }) {
  return (
    <Box sx={{
      width: 11, height: 11, borderRadius: '50%', flexShrink: 0,
      bgcolor: isUp ? '#22c55e' : '#ef4444',
      boxShadow: isUp
        ? '0 0 0 2px rgba(34,197,94,0.25), 0 0 8px 2px rgba(34,197,94,0.45)'
        : '0 0 0 2px rgba(239,68,68,0.25), 0 0 8px 2px rgba(239,68,68,0.35)',
      animation: isUp ? 'ledPulse 2s ease-in-out infinite' : 'ledAlert 1s ease-in-out infinite',
      '@keyframes ledPulse': {
        '0%, 100%': { opacity: 1, transform: 'scale(1)' },
        '50%': { opacity: 0.65, transform: 'scale(0.88)' },
      },
      '@keyframes ledAlert': {
        '0%, 100%': { opacity: 1 },
        '50%': { opacity: 0.4 },
      },
    }} />
  );
}

// ── Status badge ──────────────────────────────────────────────────────────────

const STATUS_STYLE = {
  idle:       { label: 'idle',       color: '#64748b', bg: '#f1f5f9' },
  connecting: { label: 'connecting', color: '#f97316', bg: '#fff7ed' },
  sent:       { label: 'sent',       color: '#3b82f6', bg: '#eff6ff' },
  ok:         { label: 'ok',         color: '#16a34a', bg: '#dcfce7' },
  listening:  { label: 'listening',  color: '#8b5cf6', bg: '#f5f3ff' },
  error:      { label: 'error',      color: '#dc2626', bg: '#fee2e2' },
};

function StatusBadge({ status }) {
  const s = STATUS_STYLE[status] ?? STATUS_STYLE.idle;
  return (
    <Box sx={{ px: 0.75, py: 0.1, borderRadius: 0.5, bgcolor: s.bg, color: s.color, fontSize: 10, fontWeight: 700, letterSpacing: 0.3 }}>
      {s.label}
    </Box>
  );
}

// ── TestCase ──────────────────────────────────────────────────────────────────
//
// mode='request'   — open WS, send payload, receive one response, close.
// mode='subscribe' — open WS, receive push messages until user disconnects.

function TestCase({ title, endpoint, initialPayload, mode = 'request' }) {
  const [payload, setPayload] = useState(initialPayload);
  const [status, setStatus] = useState('idle');
  const [response, setResponse] = useState('');
  const wsRef = useRef(null);

  useEffect(() => () => { wsRef.current?.close(); }, []);

  const isSubscribed = status === 'listening';

  function handleAction() {
    if (mode === 'subscribe' && isSubscribed) {
      wsRef.current?.close();
      wsRef.current = null;
      setStatus('idle');
      return;
    }

    wsRef.current?.close();
    wsRef.current = null;
    setStatus('connecting');
    setResponse('');

    const ws = new WebSocket(endpoint);
    wsRef.current = ws;

    ws.onopen = () => {
      if (mode === 'request') {
        try {
          ws.send(payload);
          setStatus('sent');
        } catch (e) {
          setStatus('error');
          setResponse(String(e));
          ws.close();
        }
      } else {
        setStatus('listening');
      }
    };

    ws.onmessage = (evt) => {
      try {
        setResponse(JSON.stringify(JSON.parse(evt.data), null, 2));
      } catch {
        setResponse(evt.data);
      }
      if (mode === 'request') {
        setStatus('ok');
        wsRef.current = null;
        ws.close();
      }
    };

    ws.onerror = () => {
      setStatus('error');
      setResponse('WebSocket connection failed — is the service running?');
    };

    ws.onclose = () => {
      if (wsRef.current === ws) {
        wsRef.current = null;
        if (mode === 'subscribe') setStatus(s => s === 'listening' ? 'idle' : s);
      }
    };
  }

  const btnLabel = mode === 'subscribe'
    ? (isSubscribed ? 'Disconnect' : 'Subscribe')
    : 'Send';

  return (
    <Box>
      {/* Title row */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{title}</Typography>
        <StatusBadge status={status} />
        <Typography sx={{ fontSize: 11, color: '#94a3b8', fontFamily: 'monospace', ml: 'auto', flexShrink: 0 }}>
          {endpoint}
        </Typography>
      </Box>

      {/* Payload + Response */}
      <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
        <Box sx={{ flex: 1 }}>
          <Typography sx={{ fontSize: 10, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5, mb: 0.5 }}>
            {mode === 'subscribe' ? 'Expected format' : 'Payload'}
          </Typography>
          <textarea
            value={payload}
            onChange={e => setPayload(e.target.value)}
            readOnly={mode === 'subscribe'}
            style={{
              width: '100%',
              height: 130,
              fontFamily: 'monospace',
              fontSize: 11,
              padding: '8px',
              border: '1px solid #e2e8f0',
              borderRadius: '4px',
              resize: 'vertical',
              color: '#0f172a',
              outline: 'none',
              boxSizing: 'border-box',
              backgroundColor: mode === 'subscribe' ? '#f8fafc' : 'white',
            }}
          />
        </Box>

        <Box sx={{ flex: 1 }}>
          <Typography sx={{ fontSize: 10, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5, mb: 0.5 }}>
            Response
          </Typography>
          <Box sx={{
            minHeight: 130,
            maxHeight: 220,
            border: '1px solid #e2e8f0',
            borderRadius: '4px',
            p: 1,
            fontFamily: 'monospace',
            fontSize: 11,
            color: '#0f172a',
            bgcolor: '#f8fafc',
            overflowY: 'auto',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}>
            {response || <Box component="span" sx={{ color: '#cbd5e1' }}>—</Box>}
          </Box>
        </Box>
      </Box>

      {/* Action */}
      <Box sx={{ mt: 1, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          size="small"
          variant={isSubscribed ? 'outlined' : 'contained'}
          color={isSubscribed ? 'error' : 'primary'}
          onClick={handleAction}
          sx={{ textTransform: 'none', fontSize: 12, minWidth: 90 }}
        >
          {btnLabel}
        </Button>
      </Box>
    </Box>
  );
}

// ── ServiceSection ────────────────────────────────────────────────────────────

function ServiceSection({ label, headerColor, hbUrl, children }) {
  const isUp = useHeartbeat(hbUrl);

  return (
    <Paper variant="outlined" sx={{ mb: 2.5, overflow: 'hidden' }}>
      <Box sx={{ px: 2, py: 1, bgcolor: headerColor, color: 'white', display: 'flex', alignItems: 'center', gap: 1 }}>
        <Led isUp={isUp} />
        <Typography sx={{ fontSize: 13, fontWeight: 700, letterSpacing: 0.3 }}>{label}</Typography>
        {!isUp && (
          <Typography sx={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', ml: 1 }}>
            no heartbeat — service may be down
          </Typography>
        )}
      </Box>
      <Box sx={{ p: 2.5, opacity: isUp ? 1 : 0.4, pointerEvents: isUp ? 'auto' : 'none', transition: 'opacity 0.3s' }}>
        {children}
      </Box>
    </Paper>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function TestHarnessPage() {
  return (
    <Box sx={{ height: '100%', overflowY: 'auto', bgcolor: '#f8fafc', p: 3 }}>
      <Box sx={{ maxWidth: 1100, mx: 'auto' }}>
        <Typography sx={{ fontSize: 22, fontWeight: 700, color: '#0f172a', mb: 0.5 }}>
          Test Harness
        </Typography>
        <Typography sx={{ fontSize: 13, color: '#64748b', mb: 3 }}>
          Live WebSocket tests for each service. Sections grey out when no heartbeat is detected.
        </Typography>

        {/* Trader Bot */}
        <ServiceSection label="Trader Bot" headerColor="#1565c0" hbUrl="ws://127.0.0.1:9000/ws">
          <TestCase
            title="Tick"
            endpoint="ws://127.0.0.1:8002/ws"
            initialPayload={TICK_PAYLOAD}
            mode="subscribe"
          />
        </ServiceSection>

        {/* Portfolio Manager */}
        <ServiceSection label="Portfolio Manager" headerColor="#0d1a2e" hbUrl="ws://127.0.0.1:9001/ws">
          <TestCase
            title="Portfolio State Query"
            endpoint="ws://127.0.0.1:7000/ws"
            initialPayload={PORTFOLIO_STATE_PAYLOAD}
            mode="request"
          />
          <Divider sx={{ my: 2.5 }} />
          <TestCase
            title="Risk Validation"
            endpoint="ws://127.0.0.1:7001/ws"
            initialPayload={VALIDATE_ORDER_PAYLOAD}
            mode="request"
          />
        </ServiceSection>

        {/* Broker Manager */}
        <ServiceSection label="Broker Manager" headerColor="#0d1a2e" hbUrl="ws://127.0.0.1:9002/ws">
          <Typography sx={{ fontSize: 13, color: '#94a3b8', py: 1, textAlign: 'center' }}>
            Test cases coming soon
          </Typography>
        </ServiceSection>
      </Box>
    </Box>
  );
}
