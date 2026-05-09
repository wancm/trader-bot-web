import React, { useMemo, useState } from 'react';
import useTicks from '../hooks/useTicks.js';
import { Box, Paper, Typography, Divider, Chip, Dialog, DialogTitle, DialogContent, IconButton } from '@mui/material';
import OpenInFullIcon from '@mui/icons-material/OpenInFull';
import CloseIcon from '@mui/icons-material/Close';

function formatPrice(v) {
  if (v == null || v === 0) return '—';
  return v >= 100 ? v.toFixed(2) : v.toFixed(5);
}

const ERROR_TYPES = new Set(['error', 'warning']);
const LOG_TYPES = new Set(['info', 'verbose']);

const TYPE_COLOR = {
  error: '#ef4444',
  warning: '#f97316',
  info: '#3b82f6',
  verbose: '#9ca3af',
};

const ACTION_COLOR = {
  BUY: { bg: '#dcfce7', text: '#16a34a' },
  SELL: { bg: '#fee2e2', text: '#dc2626' },
  HOLD: { bg: '#f1f5f9', text: '#64748b' },
};

const STATUS_COLOR = {
  FILLED:   { bg: '#dcfce7', text: '#16a34a' },
  PARTIAL:  { bg: '#fff7ed', text: '#c2410c' },
  PENDING:  { bg: '#fef9c3', text: '#a16207' },
  REJECTED: { bg: '#fee2e2', text: '#dc2626' },
  FAILED:   { bg: '#fee2e2', text: '#dc2626' },
};

function formatTime(ts) {
  if (!ts) return '—';
  const d = new Date(ts);
  return d.toLocaleTimeString('en-US', { hour12: false });
}

function formatDateTime(ts) {
  if (!ts) return '—';
  const d = new Date(ts);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const time = d.toLocaleTimeString('en-US', { hour12: false });
  return `${mm}/${dd} ${time}`;
}

function EntryRow({ entry }) {
  const color = TYPE_COLOR[entry.type] ?? '#9ca3af';
  return (
    <Box
      sx={{
        display: 'flex',
        gap: 0.75,
        px: 1,
        py: 0.25,
        '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' },
        alignItems: 'flex-start',
      }}
    >
      <Box
        sx={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          bgcolor: color,
          mt: '5px',
          flexShrink: 0,
        }}
      />
      <Typography
        variant="caption"
        sx={{ color: 'text.secondary', fontFamily: 'monospace', flexShrink: 0, fontSize: 11 }}
      >
        {formatTime(entry.timestamp)}
      </Typography>
      <Typography
        variant="caption"
        sx={{ fontSize: 11, wordBreak: 'break-word', lineHeight: 1.5 }}
      >
        {entry.message}
      </Typography>
    </Box>
  );
}

function AIDecisionRow({ entry }) {
  const [open, setOpen] = useState(false);
  const p = entry.tick ?? {};
  const colors = ACTION_COLOR[p.action] ?? ACTION_COLOR.HOLD;
  const confidence = p.confidence != null ? `${(p.confidence * 100).toFixed(0)}%` : '—';
  const duration = p.call_duration_ms != null ? `${p.call_duration_ms}ms` : '';
  const symbol = p.symbol ?? entry.message?.split(' ')[0] ?? '—';

  const aiReason = useMemo(() => {
    if (!p.response) return null;
    try {
      return JSON.parse(p.response)?.reason ?? null;
    } catch {
      return null;
    }
  }, [p.response]);

  return (
    <>
      <Box
        sx={{
          px: 1,
          py: 0.5,
          borderBottom: '1px solid #f1f5f9',
          '&:hover': { bgcolor: 'rgba(0,0,0,0.03)' },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.25 }}>
          <Typography
            variant="caption"
            sx={{ color: 'text.secondary', fontFamily: 'monospace', fontSize: 10, flexShrink: 0 }}
          >
            {formatDateTime(entry.timestamp)}
          </Typography>
          <Box
            sx={{
              px: 0.75,
              py: 0.1,
              borderRadius: 0.5,
              bgcolor: colors.bg,
              color: colors.text,
              fontSize: 10,
              fontWeight: 700,
              lineHeight: 1.6,
              flexShrink: 0,
            }}
          >
            {p.action ?? '—'}
          </Box>
          <Typography variant="caption" sx={{ fontSize: 11, fontWeight: 600 }}>
            {symbol}
          </Typography>
          <IconButton
            size="small"
            onClick={() => setOpen(true)}
            sx={{ p: 0.25, color: '#94a3b8', '&:hover': { color: '#1565c0' } }}
          >
            <OpenInFullIcon sx={{ fontSize: 11 }} />
          </IconButton>
          <Typography variant="caption" sx={{ fontSize: 10, color: 'text.secondary', ml: 'auto' }}>
            {confidence}
          </Typography>
          {duration && (
            <Typography variant="caption" sx={{ fontSize: 10, color: '#94a3b8' }}>
              {duration}
            </Typography>
          )}
          {p.modified && (
            <Chip label="adj" size="small" sx={{ height: 14, fontSize: 9, bgcolor: '#fef3c7', color: '#92400e' }} />
          )}
        </Box>
        {p.signal && (
          <Typography variant="caption" sx={{ fontSize: 10, color: '#64748b', pl: 0.5 }}>
            {p.signal}
          </Typography>
        )}
      </Box>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle
          sx={{
            fontSize: 14,
            fontWeight: 700,
            bgcolor: '#1565c0',
            color: 'white',
            py: 1.25,
            px: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <Box
            sx={{
              px: 0.75,
              py: 0.1,
              borderRadius: 0.5,
              bgcolor: colors.bg,
              color: colors.text,
              fontSize: 11,
              fontWeight: 700,
            }}
          >
            {p.action ?? '—'}
          </Box>
          {symbol}
          <Typography variant="caption" sx={{ color: '#90caf9', fontSize: 11, ml: 0.5 }}>
            {confidence} · {formatDateTime(entry.timestamp)}
          </Typography>
          <IconButton
            size="small"
            onClick={() => setOpen(false)}
            sx={{ ml: 'auto', color: 'rgba(255,255,255,0.7)', '&:hover': { color: 'white' } }}
          >
            <CloseIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {p.signal && (
            <Box sx={{ mb: 2 }}>
              <Typography sx={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5, mb: 0.5 }}>
                Signal
              </Typography>
              <Typography sx={{ fontSize: 13, color: '#374151' }}>{p.signal}</Typography>
            </Box>
          )}
          <Box>
            <Typography sx={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5, mb: 0.5 }}>
              AI Reasoning
            </Typography>
            <Typography sx={{ fontSize: 13, color: '#0f172a', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
              {aiReason ?? '—'}
            </Typography>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
}

function OrderRow({ entry }) {
  const p = entry.tick ?? {};
  const actionColors = ACTION_COLOR[p.action] ?? ACTION_COLOR.HOLD;
  const statusColors = STATUS_COLOR[p.status] ?? STATUS_COLOR.PENDING;
  const filled = p.filled_qty ?? 0;
  const total = p.quantity ?? 0;

  return (
    <Box
      sx={{
        px: 1,
        py: 0.5,
        borderBottom: '1px solid #f1f5f9',
        '&:hover': { bgcolor: 'rgba(0,0,0,0.03)' },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
        <Typography variant="caption" sx={{ color: 'text.secondary', fontFamily: 'monospace', fontSize: 10, flexShrink: 0 }}>
          {formatDateTime(entry.timestamp)}
        </Typography>
        <Box sx={{ px: 0.75, py: 0.1, borderRadius: 0.5, bgcolor: actionColors.bg, color: actionColors.text, fontSize: 10, fontWeight: 700, lineHeight: 1.6, flexShrink: 0 }}>
          {p.action ?? '—'}
        </Box>
        <Typography variant="caption" sx={{ fontSize: 11, fontWeight: 600 }}>
          {p.symbol ?? '—'}
        </Typography>
        <Box sx={{ px: 0.75, py: 0.1, borderRadius: 0.5, bgcolor: statusColors.bg, color: statusColors.text, fontSize: 9, fontWeight: 700, lineHeight: 1.6, ml: 'auto', flexShrink: 0 }}>
          {p.status ?? '—'}
        </Box>
      </Box>
      <Box sx={{ display: 'flex', gap: 1.5, pl: 0.5, mt: 0.25 }}>
        <Typography variant="caption" sx={{ fontSize: 10, color: '#64748b' }}>
          {filled}/{total} lots
        </Typography>
        {p.avg_fill_price > 0 && (
          <Typography variant="caption" sx={{ fontSize: 10, color: '#64748b' }}>
            @ {formatPrice(p.avg_fill_price)}
          </Typography>
        )}
        {p.error && (
          <Typography variant="caption" sx={{ fontSize: 10, color: '#dc2626' }}>
            {p.error}
          </Typography>
        )}
      </Box>
    </Box>
  );
}

function Section({ entries, bgcolor, emptyLabel, search, typeFilter, relevantTypes }) {
  const filtered = useMemo(() => {
    let list = entries;
    if (typeFilter && relevantTypes.has(typeFilter)) {
      list = list.filter((e) => e.type === typeFilter);
    } else if (typeFilter && !relevantTypes.has(typeFilter)) {
      list = [];
    }
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((e) => e.message?.toLowerCase().includes(q));
    }
    return list;
  }, [entries, typeFilter, search, relevantTypes]);

  return (
    <Box sx={{ bgcolor, overflowY: 'auto', minHeight: 0 }}>
      {filtered.length === 0 ? (
        <Typography
          variant="caption"
          sx={{ display: 'block', px: 1, py: 0.5, color: 'text.disabled', fontSize: 11 }}
        >
          {emptyLabel}
        </Typography>
      ) : (
        filtered.map((e, i) => <EntryRow key={i} entry={e} />)
      )}
    </Box>
  );
}

const THEME = {
  'trader-bot': { header: '#1565c0', border: '#90caf9', counter: '#90caf9', label: 'Trader Bot' },
  default:      { header: '#0d1a2e', border: undefined,  counter: '#94a3b8', label: null },
};

export default function ServiceColumn({ name, data, search, typeFilter, isUp }) {
  const errors = data?.errors ?? [];
  const logs = data?.logs ?? [];
  const aiDecisions = data?.aiDecisions ?? [];
  const orders = data?.orders ?? [];
  const showAI = name === 'trader-bot';
  const theme = THEME[name] ?? THEME.default;
  const displayName = theme.label ?? name;
  const tickData = useTicks(showAI ? 'ws://127.0.0.1:8001' : null);
  const tickRows = useMemo(
    () => Object.entries(tickData).sort(([a], [b]) => a.localeCompare(b)),
    [tickData],
  );

  const ledSx = {
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
  };

  return (
    <Paper
      elevation={0}
      variant="outlined"
      sx={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        minWidth: 0,
        ...(theme.border ? { borderColor: theme.border } : {}),
      }}
    >
      {/* Header */}
      <Box sx={{ px: 1.5, py: 0.75, bgcolor: theme.header, color: 'white', flexShrink: 0, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Box sx={ledSx} />
        <Typography variant="caption" sx={{ fontWeight: 600, fontSize: 12, letterSpacing: 0.3 }}>
          {displayName}
        </Typography>
        <Typography variant="caption" sx={{ ml: 0.5, color: theme.counter, fontSize: 11 }}>
          {errors.length}E · {logs.length}L{showAI ? ` · ${aiDecisions.length}AI · ${orders.length}ORD` : ''}
        </Typography>
      </Box>

      {showAI ? (
        <>
          {/* Tick */}
          <Box sx={{ flex: '0 0 15%', display: 'flex', flexDirection: 'column', minHeight: 0, bgcolor: '#f8faff' }}>
            <Box sx={{ px: 1, py: 0.25, flexShrink: 0 }}>
              <Typography variant="caption" sx={{ fontSize: 10, color: '#1565c0', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Tick
              </Typography>
              <Typography variant="caption" sx={{ ml: 0.75, color: '#94a3b8', fontSize: 10 }}>
                {tickRows.length}
              </Typography>
            </Box>
            <Box sx={{ overflowY: 'auto', minHeight: 0 }}>
              {tickRows.length === 0 ? (
                <Typography variant="caption" sx={{ display: 'block', px: 1, py: 0.5, color: 'text.disabled', fontSize: 11 }}>
                  no ticks
                </Typography>
              ) : (
                tickRows.map(([sym, tick]) => (
                  <Box key={sym} sx={{ display: 'flex', px: 1, py: 0.25, borderBottom: '1px solid #e3eaf7', '&:hover': { bgcolor: 'rgba(0,0,0,0.03)' } }}>
                    <Typography variant="caption" sx={{ fontFamily: 'monospace', fontWeight: 600, fontSize: 11, flex: '0 0 80px' }}>
                      {sym}
                    </Typography>
                    <Typography variant="caption" sx={{ fontFamily: 'monospace', fontSize: 11, flex: 1, textAlign: 'right' }}>
                      {formatPrice(tick.bid)}
                    </Typography>
                    <Typography variant="caption" sx={{ fontFamily: 'monospace', fontSize: 11, flex: 1, textAlign: 'right' }}>
                      {formatPrice(tick.ask)}
                    </Typography>
                  </Box>
                ))
              )}
            </Box>
          </Box>

          <Divider />

          {/* Orders */}
          <Box sx={{ flex: '0 0 18%', display: 'flex', flexDirection: 'column', minHeight: 0, bgcolor: '#fffbf0' }}>
            <Box sx={{ px: 1, py: 0.25, flexShrink: 0 }}>
              <Typography variant="caption" sx={{ fontSize: 10, color: '#92400e', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Orders
              </Typography>
              <Typography variant="caption" sx={{ ml: 0.75, color: '#94a3b8', fontSize: 10 }}>
                {orders.length}
              </Typography>
            </Box>
            <Box sx={{ overflowY: 'auto', minHeight: 0 }}>
              {orders.length === 0 ? (
                <Typography variant="caption" sx={{ display: 'block', px: 1, py: 0.5, color: 'text.disabled', fontSize: 11 }}>
                  no orders yet
                </Typography>
              ) : (
                orders.map((e, i) => <OrderRow key={i} entry={e} />)
              )}
            </Box>
          </Box>

          <Divider />

          {/* AI Decisions */}
          <Box sx={{ flex: '0 0 22%', display: 'flex', flexDirection: 'column', minHeight: 0, bgcolor: '#f8faff' }}>
            <Box sx={{ px: 1, py: 0.25, flexShrink: 0 }}>
              <Typography variant="caption" sx={{ fontSize: 10, color: '#1565c0', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                AI Decisions
              </Typography>
              <Typography variant="caption" sx={{ ml: 0.75, color: '#94a3b8', fontSize: 10 }}>
                {aiDecisions.length}
              </Typography>
            </Box>
            <Box sx={{ overflowY: 'auto', minHeight: 0 }}>
              {aiDecisions.length === 0 ? (
                <Typography variant="caption" sx={{ display: 'block', px: 1, py: 0.5, color: 'text.disabled', fontSize: 11 }}>
                  no decisions yet
                </Typography>
              ) : (
                aiDecisions.map((e, i) => <AIDecisionRow key={i} entry={e} />)
              )}
            </Box>
          </Box>

          <Divider />

          {/* Logs */}
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            <Box sx={{ px: 1, py: 0.25, flexShrink: 0 }}>
              <Typography variant="caption" sx={{ fontSize: 10, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Logs
              </Typography>
            </Box>
            <Section entries={logs} bgcolor="white" emptyLabel="no logs" search={search} typeFilter={typeFilter} relevantTypes={LOG_TYPES} />
          </Box>

          <Divider />

          {/* Errors / Warnings */}
          <Box sx={{ flex: '0 0 20%', display: 'flex', flexDirection: 'column', minHeight: 0, bgcolor: '#fff5f5' }}>
            <Box sx={{ px: 1, py: 0.25, flexShrink: 0 }}>
              <Typography variant="caption" sx={{ fontSize: 10, color: '#ef4444', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Errors / Warnings
              </Typography>
            </Box>
            <Section entries={errors} bgcolor="#fff5f5" emptyLabel="no errors" search={search} typeFilter={typeFilter} relevantTypes={ERROR_TYPES} />
          </Box>
        </>
      ) : (
        <>
          {/* Errors / Warnings */}
          <Box sx={{ flex: '0 0 20%', display: 'flex', flexDirection: 'column', minHeight: 0, bgcolor: '#fff5f5' }}>
            <Box sx={{ px: 1, py: 0.25, flexShrink: 0 }}>
              <Typography variant="caption" sx={{ fontSize: 10, color: '#ef4444', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Errors / Warnings
              </Typography>
            </Box>
            <Section entries={errors} bgcolor="#fff5f5" emptyLabel="no errors" search={search} typeFilter={typeFilter} relevantTypes={ERROR_TYPES} />
          </Box>

          <Divider />

          {/* Logs */}
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            <Box sx={{ px: 1, py: 0.25, flexShrink: 0 }}>
              <Typography variant="caption" sx={{ fontSize: 10, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Logs
              </Typography>
            </Box>
            <Section entries={logs} bgcolor="white" emptyLabel="no logs" search={search} typeFilter={typeFilter} relevantTypes={LOG_TYPES} />
          </Box>
        </>
      )}
    </Paper>
  );
}
