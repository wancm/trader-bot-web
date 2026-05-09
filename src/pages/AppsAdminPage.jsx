import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Paper, Switch, Button, Divider, CircularProgress,
} from '@mui/material';

const ADMIN_BASE = 'http://127.0.0.1:5001';

// ── Static app registry ─────────────────────────────────────────────────────

const APPS = [
  { id: 'trader-bot',       label: 'Trader Bot',       status: 'RUNNING' },
  { id: 'trader-bot-web',   label: 'Trader Bot Web',   status: 'STOPPED' },
  { id: 'portfolio-manager',label: 'Portfolio Manager', status: 'RUNNING' },
  { id: 'broker-manager',   label: 'Broker Manager',   status: 'PARTIAL' },
  { id: 'logger',           label: 'Logger',           status: 'RUNNING' },
];

const TRADER_BOT_FEATURES = [
  { key: 'tick-listening', label: 'Tick Listening', desc: 'Subscribe to live tick stream from broker' },
  { key: 'make-orders',    label: 'Make Orders',    desc: 'Allow strategy to submit live orders' },
];

const STATUS_STYLE = {
  RUNNING: { label: 'RUNNING', color: '#16a34a', bg: '#dcfce7', dot: '#16a34a' },
  STOPPED: { label: 'STOPPED', color: '#64748b', bg: '#f1f5f9', dot: '#94a3b8' },
  PARTIAL: { label: 'PARTIAL', color: '#ea580c', bg: '#fff7ed', dot: '#ea580c' },
};

// ── Small reusable pieces ───────────────────────────────────────────────────

function StatusBadge({ status }) {
  const s = STATUS_STYLE[status] ?? STATUS_STYLE.STOPPED;
  return (
    <Box sx={{
      px: 1, py: 0.25, borderRadius: 0.75,
      bgcolor: s.bg, color: s.color,
      fontSize: 10, fontWeight: 700, letterSpacing: 0.5,
      flexShrink: 0,
    }}>
      {s.label}
    </Box>
  );
}

function SectionLabel({ children }) {
  return (
    <Typography sx={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', letterSpacing: 0.8, textTransform: 'uppercase', mb: 1 }}>
      {children}
    </Typography>
  );
}

function FeatureRow({ label, desc, checked, onChange, disabled }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 1.25 }}>
      <Box>
        <Typography sx={{ fontSize: 14, fontWeight: 500, color: '#0f172a' }}>{label}</Typography>
        <Typography sx={{ fontSize: 12, color: '#64748b', mt: 0.25 }}>{desc}</Typography>
      </Box>
      <Switch
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        size="small"
        sx={{ ml: 2, flexShrink: 0 }}
      />
    </Box>
  );
}

// ── App cards ───────────────────────────────────────────────────────────────

function CardHeader({ label, status, meta }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
      <Typography sx={{ fontSize: 15, fontWeight: 700, color: '#0f172a' }}>{label}</Typography>
      <StatusBadge status={status} />
      {meta && (
        <Typography sx={{ ml: 'auto', fontSize: 11, color: '#94a3b8', flexShrink: 0 }}>{meta}</Typography>
      )}
    </Box>
  );
}

function EmptyFeatures() {
  return (
    <Box sx={{ py: 3, textAlign: 'center' }}>
      <Typography sx={{ fontSize: 13, color: '#94a3b8' }}>No configurable features yet</Typography>
      <Typography sx={{ fontSize: 12, color: '#3b82f6', mt: 0.5, cursor: 'default' }}>+ Request feature flag</Typography>
    </Box>
  );
}

function TraderBotCard({ staged, onToggle, loading }) {
  return (
    <Paper variant="outlined" sx={{ p: 2.5, height: '100%' }}>
      <CardHeader label="Trader Bot" status="RUNNING" meta="v2.4.1 · pid —" />
      <SectionLabel>Features</SectionLabel>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
          <CircularProgress size={20} />
        </Box>
      ) : (
        TRADER_BOT_FEATURES.map((f, i) => (
          <React.Fragment key={f.key}>
            {i > 0 && <Divider />}
            <FeatureRow
              label={f.label}
              desc={f.desc}
              checked={staged[f.key] ?? true}
              onChange={(e) => onToggle(f.key, e.target.checked)}
            />
          </React.Fragment>
        ))
      )}
    </Paper>
  );
}

function TraderBotWebCard() {
  return (
    <Paper variant="outlined" sx={{ p: 2.5, height: '100%' }}>
      <CardHeader label="Trader Bot Web" status="STOPPED" meta="v1.0.7" />
      <SectionLabel>Features</SectionLabel>
      <EmptyFeatures />
    </Paper>
  );
}

function PortfolioManagerCard() {
  return (
    <Paper variant="outlined" sx={{ p: 2.5, height: '100%' }}>
      <CardHeader label="Portfolio Manager" status="RUNNING" meta="v3.1.0 · pid —" />
      <SectionLabel>Features</SectionLabel>
      <EmptyFeatures />
    </Paper>
  );
}

const BROKERS = [
  { id: 'moomoo', label: 'MooMoo', initials: 'M', bg: '#2563eb',
    status: 'connected', statusColor: '#16a34a',
    detail: 'acct ****4218 · session expires 2h' },
  { id: 'ibkr', label: 'IBKR', initials: 'IB', bg: '#374151',
    status: 'auth failed', statusColor: '#dc2626',
    detail: 'acct U9912**** · token expired 4m ago' },
];

function BrokerManagerCard() {
  const [enabled, setEnabled] = useState({ moomoo: true, ibkr: true });
  return (
    <Paper variant="outlined" sx={{ p: 2.5, height: '100%' }}>
      <CardHeader label="Broker Manager" status="PARTIAL" meta="v2.0.3 · 1 of 2 ok" />
      <SectionLabel>Brokers Enabled</SectionLabel>
      {BROKERS.map((b, i) => (
        <React.Fragment key={b.id}>
          {i > 0 && <Divider />}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1.25 }}>
            <Box sx={{ width: 32, height: 32, borderRadius: '50%', bgcolor: b.bg, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
              {b.initials}
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                <Typography sx={{ fontSize: 14, fontWeight: 600 }}>{b.label}</Typography>
                <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: b.statusColor }} />
                <Typography sx={{ fontSize: 12, color: b.statusColor }}>{b.status}</Typography>
              </Box>
              <Typography sx={{ fontSize: 11, color: '#94a3b8' }}>{b.detail}</Typography>
            </Box>
            <Switch checked={enabled[b.id]} onChange={(e) => setEnabled(p => ({ ...p, [b.id]: e.target.checked }))} size="small" />
          </Box>
        </React.Fragment>
      ))}
    </Paper>
  );
}

const LOG_LEVELS = [
  { label: 'Error',   color: '#ef4444', rate: '~12/min',             defaultOn: true  },
  { label: 'Warning', color: '#f97316', rate: '~38/min',             defaultOn: true  },
  { label: 'Info',    color: '#3b82f6', rate: '~480/min',            defaultOn: true  },
  { label: 'Verbose', color: '#94a3b8', rate: '~6,200/min · high volume', defaultOn: false },
];

function LoggerCard() {
  const [levels, setLevels] = useState(() => Object.fromEntries(LOG_LEVELS.map(l => [l.label, l.defaultOn])));
  return (
    <Paper variant="outlined" sx={{ p: 2.5 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
        <Typography sx={{ fontSize: 15, fontWeight: 700, color: '#0f172a', mr: 1 }}>Logger</Typography>
        <StatusBadge status="RUNNING" />
        <Typography sx={{ ml: 'auto', fontSize: 11, color: '#94a3b8' }}>
          writes —/s · queue 0 · last flush —
        </Typography>
      </Box>
      <SectionLabel>Save to database — types not toggled on are streamed but not persisted</SectionLabel>
      <Box sx={{ display: 'flex', gap: 0, flexWrap: 'wrap' }}>
        {LOG_LEVELS.map((l) => (
          <Box key={l.label} sx={{ flex: '1 1 200px', display: 'flex', alignItems: 'center', gap: 1, px: 1.5, py: 1, borderRight: '1px solid #f1f5f9' }}>
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: l.color, flexShrink: 0 }} />
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ fontSize: 13, fontWeight: 500 }}>{l.label}</Typography>
              <Typography sx={{ fontSize: 11, color: '#94a3b8' }}>{l.rate}</Typography>
            </Box>
            <Switch
              checked={levels[l.label]}
              onChange={(e) => setLevels(p => ({ ...p, [l.label]: e.target.checked }))}
              size="small"
            />
          </Box>
        ))}
      </Box>
    </Paper>
  );
}

// ── Sidebar ─────────────────────────────────────────────────────────────────

function Sidebar({ selected, onSelect }) {
  return (
    <Box sx={{ width: 200, flexShrink: 0, pt: 0.5 }}>
      <Typography sx={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', letterSpacing: 0.8, textTransform: 'uppercase', px: 2, mb: 1 }}>
        Apps
      </Typography>
      {APPS.map((app) => {
        const dot = STATUS_STYLE[app.status]?.dot ?? '#94a3b8';
        const active = selected === app.id;
        return (
          <Box
            key={app.id}
            onClick={() => onSelect(app.id)}
            sx={{
              display: 'flex', alignItems: 'center', gap: 1,
              px: 2, py: 0.875,
              cursor: 'pointer',
              borderLeft: active ? '3px solid #3b82f6' : '3px solid transparent',
              bgcolor: active ? '#eff6ff' : 'transparent',
              '&:hover': { bgcolor: active ? '#eff6ff' : '#f8fafc' },
            }}
          >
            <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: dot, flexShrink: 0 }} />
            <Typography sx={{ fontSize: 13, fontWeight: active ? 600 : 400, color: active ? '#1d4ed8' : '#374151' }}>
              {app.label}
            </Typography>
          </Box>
        );
      })}
    </Box>
  );
}

// ── Main page ───────────────────────────────────────────────────────────────

export default function AppsAdminPage() {
  const [selected, setSelected] = useState('trader-bot');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // committed = what's live on the server; staged = what the user has toggled
  const [committed, setCommitted] = useState({ 'tick-listening': true, 'make-orders': true });
  const [staged, setStaged]       = useState({ 'tick-listening': true, 'make-orders': true });

  const pendingKeys = Object.keys(staged).filter(k => staged[k] !== committed[k]);
  const pendingCount = pendingKeys.length;

  // Load current flag state from admin API
  useEffect(() => {
    fetch(`${ADMIN_BASE}/admin/features`)
      .then(r => r.json())
      .then(data => {
        setCommitted(data);
        setStaged(data);
      })
      .catch(() => {}) // admin API may not be running; defaults stay
      .finally(() => setLoading(false));
  }, []);

  const handleToggle = useCallback((key, value) => {
    setStaged(s => ({ ...s, [key]: value }));
  }, []);

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      await Promise.all(
        pendingKeys.map(key =>
          fetch(`${ADMIN_BASE}/admin/features/${key}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ flag: staged[key] }),
          })
        )
      );
      setCommitted({ ...staged });
    } finally {
      setSaving(false);
    }
  }, [pendingKeys, staged]);

  return (
    <Box sx={{ display: 'flex', height: '100%', overflow: 'hidden', bgcolor: '#f8fafc' }}>
      {/* Sidebar */}
      <Box sx={{ borderRight: '1px solid #e2e8f0', pt: 3, bgcolor: 'white', overflowY: 'auto' }}>
        <Sidebar selected={selected} onSelect={setSelected} />
      </Box>

      {/* Main */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Page header */}
        <Box sx={{ px: 4, py: 2.5, bgcolor: 'white', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexShrink: 0 }}>
          <Box>
            <Typography sx={{ fontSize: 22, fontWeight: 700, color: '#0f172a' }}>Apps Admin</Typography>
            <Typography sx={{ fontSize: 13, color: '#64748b', mt: 0.25 }}>
              Feature flags and runtime configuration · {APPS.length} apps
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', mt: 0.5 }}>
            <Button variant="outlined" size="small" sx={{ textTransform: 'none', fontSize: 13, borderColor: '#e2e8f0', color: '#374151' }}>
              Audit log
            </Button>
            <Button
              variant="contained"
              size="small"
              disabled={pendingCount === 0 || saving}
              onClick={handleSave}
              sx={{ textTransform: 'none', fontSize: 13, bgcolor: '#2563eb', '&:hover': { bgcolor: '#1d4ed8' } }}
            >
              {saving ? 'Saving…' : pendingCount > 0 ? `Save changes · ${pendingCount}` : 'Save changes'}
            </Button>
          </Box>
        </Box>

        {/* Cards grid */}
        <Box sx={{ flex: 1, overflowY: 'auto', p: 3 }}>
          {/* Row 1 */}
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2 }}>
            <TraderBotCard staged={staged} onToggle={handleToggle} loading={loading} />
            <TraderBotWebCard />
          </Box>
          {/* Row 2 */}
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2 }}>
            <PortfolioManagerCard />
            <BrokerManagerCard />
          </Box>
          {/* Row 3 — full width */}
          <LoggerCard />

          {/* Bottom hint */}
          {pendingCount > 0 && (
            <Typography sx={{ mt: 2, fontSize: 12, color: '#64748b' }}>
              Changes apply on Save.
            </Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
}
