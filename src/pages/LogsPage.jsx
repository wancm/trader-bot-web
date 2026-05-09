import React, { useState, useRef } from 'react';
import {
  Box, TextField, Stack, Chip, Button, Typography, InputAdornment,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import PauseIcon from '@mui/icons-material/Pause';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ServiceColumn from '../components/ServiceColumn.jsx';
import useHeartbeat from '../hooks/useHeartbeat.js';

const SERVICES = ['trader-bot', 'portfolio-manager', 'broker-manager'];
const TYPE_FILTERS = ['error', 'warning', 'info', 'verbose'];

const HEARTBEAT_URLS = {
  'trader-bot':        'ws://127.0.0.1:9000/ws',
  'portfolio-manager': 'ws://127.0.0.1:9001/ws',
  'broker-manager':    'ws://127.0.0.1:9002/ws',
};

export default function LogsPage({ byService, ticks, connected }) {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState(null);
  const [paused, setPaused] = useState(false);

  const tbUp = useHeartbeat(HEARTBEAT_URLS['trader-bot']);
  const pmUp = useHeartbeat(HEARTBEAT_URLS['portfolio-manager']);
  const bmUp = useHeartbeat(HEARTBEAT_URLS['broker-manager']);
  const isUp = { 'trader-bot': tbUp, 'portfolio-manager': pmUp, 'broker-manager': bmUp };

  // freeze display when paused
  const snapshot = useRef({ byService, ticks });
  if (!paused) snapshot.current = { byService, ticks };
  const display = snapshot.current;

  function toggleType(t) {
    setTypeFilter((cur) => (cur === t ? null : t));
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', bgcolor: 'background.default' }}>
      {/* Toolbar */}
      <Box
        sx={{
          px: 2,
          py: 0.75,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          bgcolor: 'white',
          borderBottom: '1px solid',
          borderColor: 'divider',
          flexShrink: 0,
        }}
      >
        <TextField
          size="small"
          placeholder="Search logs…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                </InputAdornment>
              ),
            },
          }}
          sx={{ width: 260, '& .MuiInputBase-input': { fontSize: 13 } }}
        />

        <Stack direction="row" spacing={0.5}>
          {TYPE_FILTERS.map((f) => (
            <Chip
              key={f}
              label={f}
              size="small"
              color={typeFilter === f ? 'primary' : 'default'}
              variant={typeFilter === f ? 'filled' : 'outlined'}
              onClick={() => toggleType(f)}
              sx={{ fontSize: 11, height: 24 }}
            />
          ))}
        </Stack>

        <Box sx={{ flex: 1 }} />

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              bgcolor: connected ? 'success.main' : 'error.main',
            }}
          />
          <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: 11 }}>
            {connected ? 'connected' : 'disconnected'}
          </Typography>
        </Box>

        <Button
          size="small"
          variant={paused ? 'contained' : 'outlined'}
          startIcon={paused ? <PlayArrowIcon sx={{ fontSize: 16 }} /> : <PauseIcon sx={{ fontSize: 16 }} />}
          onClick={() => setPaused((p) => !p)}
          sx={{ fontSize: 12, textTransform: 'none', minWidth: 90 }}
        >
          {paused ? 'Resume' : 'Pause'}
        </Button>
      </Box>

      {/* Columns */}
      <Box sx={{ flex: 1, display: 'flex', gap: 1, p: 1, overflow: 'hidden', minHeight: 0 }}>
        {SERVICES.map((svc) => (
          <ServiceColumn
            key={svc}
            name={svc}
            data={display.byService[svc]}
            search={search}
            typeFilter={typeFilter}
            isUp={isUp[svc]}
          />
        ))}
      </Box>
    </Box>
  );
}
