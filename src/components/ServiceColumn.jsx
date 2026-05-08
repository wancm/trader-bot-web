import React, { useMemo } from 'react';
import { Box, Paper, Typography, Divider, Chip } from '@mui/material';

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
  const p = entry.tick ?? {};
  const colors = ACTION_COLOR[p.action] ?? ACTION_COLOR.HOLD;
  const confidence = p.confidence != null ? `${(p.confidence * 100).toFixed(0)}%` : '—';
  const duration = p.call_duration_ms != null ? `${p.call_duration_ms}ms` : '';

  return (
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
          {p.symbol ?? entry.message?.split(' ')[0]}
        </Typography>
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
  'trader-bot': { header: '#1565c0', border: '#90caf9', counter: '#90caf9' },
  default:      { header: '#0d1a2e', border: undefined,  counter: '#94a3b8' },
};

export default function ServiceColumn({ name, data, search, typeFilter }) {
  const errors = data?.errors ?? [];
  const logs = data?.logs ?? [];
  const aiDecisions = data?.aiDecisions ?? [];
  const orders = data?.orders ?? [];
  const showAI = name === 'trader-bot';
  const theme = THEME[name] ?? THEME.default;

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
      <Box sx={{ px: 1.5, py: 0.75, bgcolor: theme.header, color: 'white', flexShrink: 0 }}>
        <Typography variant="caption" sx={{ fontWeight: 600, fontSize: 12, letterSpacing: 0.3 }}>
          {name}
        </Typography>
        <Typography variant="caption" sx={{ ml: 1, color: theme.counter, fontSize: 11 }}>
          {errors.length}E · {logs.length}L{showAI ? ` · ${aiDecisions.length}AI · ${orders.length}ORD` : ''}
        </Typography>
      </Box>

      {/* Row 1 — Errors / Warnings */}
      <Box sx={{ flex: '0 0 20%', display: 'flex', flexDirection: 'column', minHeight: 0, bgcolor: '#fff5f5' }}>
        <Box sx={{ px: 1, py: 0.25, flexShrink: 0 }}>
          <Typography variant="caption" sx={{ fontSize: 10, color: '#ef4444', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Errors / Warnings
          </Typography>
        </Box>
        <Section
          entries={errors}
          bgcolor="#fff5f5"
          emptyLabel="no errors"
          search={search}
          typeFilter={typeFilter}
          relevantTypes={ERROR_TYPES}
        />
      </Box>

      <Divider />

      {/* Row 2 — AI Decisions (trader-bot only) */}
      {showAI && (
        <>
          <Box sx={{ flex: '0 0 25%', display: 'flex', flexDirection: 'column', minHeight: 0, bgcolor: '#f8faff' }}>
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

          {/* Row 3 — Orders */}
          <Box sx={{ flex: '0 0 22%', display: 'flex', flexDirection: 'column', minHeight: 0, bgcolor: '#fffbf0' }}>
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
        </>
      )}

      {/* Row 4 — Logs */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <Box sx={{ px: 1, py: 0.25, flexShrink: 0 }}>
          <Typography variant="caption" sx={{ fontSize: 10, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Logs
          </Typography>
        </Box>
        <Section
          entries={logs}
          bgcolor="white"
          emptyLabel="no logs"
          search={search}
          typeFilter={typeFilter}
          relevantTypes={LOG_TYPES}
        />
      </Box>
    </Paper>
  );
}
