import React from 'react';
import { Paper, Box, Typography, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import useClock from '../hooks/useClock.js';

const STALE_MS = 10_000;

function formatPrice(v) {
  if (v == null) return '—';
  return v >= 100 ? v.toFixed(2) : v.toFixed(5);
}

const cellSx = { py: 0.5, px: 1, fontSize: 11, borderBottom: '1px solid #e8f5e9', whiteSpace: 'nowrap' };
const headSx = { ...cellSx, color: '#2e7d32', fontWeight: 600, fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.4, bgcolor: '#f1fdf2' };

export default function TickPanel({ ticks }) {
  const now = useClock(1000);
  const rows = Object.entries(ticks).sort(([a], [b]) => a.localeCompare(b));

  return (
    <Paper
      elevation={0}
      variant="outlined"
      sx={{ width: 280, flexShrink: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden', borderColor: '#a5d6a7' }}
    >
      <Box sx={{ px: 1.5, py: 0.75, bgcolor: '#2e7d32', color: 'white', flexShrink: 0 }}>
        <Typography variant="caption" sx={{ fontWeight: 600, fontSize: 12, letterSpacing: 0.3 }}>
          Market Price
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
