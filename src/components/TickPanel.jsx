import React from 'react';
import { Paper, Box, Typography, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import useClock from '../hooks/useClock.js';
import useHeartbeat from '../hooks/useHeartbeat.js';

const STALE_MS = 10_000;

function formatPrice(v) {
  if (v == null) return '—';
  return v >= 100 ? v.toFixed(2) : v.toFixed(5);
}

const cellSx = { py: 0.5, px: 1, fontSize: 11, borderBottom: '1px solid #e8f5e9', whiteSpace: 'nowrap' };
const headSx = { ...cellSx, color: '#2e7d32', fontWeight: 600, fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.4, bgcolor: '#f1fdf2' };

export default function TickPanel({ ticks }) {
  const now = useClock(1000);
  const isUp = useHeartbeat('ws://127.0.0.1:9003/ws');
  const rows = Object.entries(ticks).sort(([a], [b]) => a.localeCompare(b));

  return (
    <Paper
      elevation={0}
      variant="outlined"
      sx={{ width: 280, flexShrink: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden', borderColor: '#a5d6a7' }}
    >
      <Box sx={{ px: 1.5, py: 0.75, bgcolor: '#2e7d32', color: 'white', flexShrink: 0, display: 'flex', alignItems: 'center', gap: 1 }}>
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
        <Typography variant="caption" sx={{ fontWeight: 600, fontSize: 12, letterSpacing: 0.3 }}>
          Logger
        </Typography>
      </Box>

      <Box sx={{ flex: 1, overflowY: 'auto', bgcolor: '#f9fef9' }}>
        {rows.length === 0 ? (
          <Typography variant="caption" sx={{ display: 'block', px: 1.5, py: 1, color: 'text.disabled', fontSize: 11 }}>
            no ticks received
          </Typography>
        ) : (
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={headSx}>Symbol</TableCell>
                <TableCell sx={headSx} align="right">Bid</TableCell>
                <TableCell sx={headSx} align="right">Ask</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map(([sym, tick]) => {
                const stale = now - (tick._at ?? 0) > STALE_MS;
                return (
                  <TableRow key={sym} sx={{ bgcolor: stale ? '#fff8e1' : 'white' }}>
                    <TableCell sx={{ ...cellSx, fontWeight: 600, fontFamily: 'monospace', color: stale ? '#f97316' : 'inherit' }}>
                      {sym}
                    </TableCell>
                    <TableCell sx={{ ...cellSx, fontFamily: 'monospace' }} align="right">
                      {formatPrice(tick.bid)}
                    </TableCell>
                    <TableCell sx={{ ...cellSx, fontFamily: 'monospace' }} align="right">
                      {formatPrice(tick.ask)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </Box>
    </Paper>
  );
}
