import React, { useState } from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { AppBar, Toolbar, Typography, Tabs, Tab, Box } from '@mui/material';
import theme from './theme.js';
import LogsPage from './pages/LogsPage.jsx';
import AppsAdminPage from './pages/AppsAdminPage.jsx';
import useLoggerWS from './hooks/useLoggerWS.js';

const NAV_TABS = ['Dashboard', 'Logs', 'Profiles', 'Brokers', 'Apps Admin'];
const LOGGER_WS_URL = 'ws://127.0.0.1:8001';

export default function App() {
  const [tab, setTab] = useState(1);
  const wsState = useLoggerWS(LOGGER_WS_URL);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppBar position="fixed" elevation={0}>
        <Toolbar variant="dense" sx={{ minHeight: 48 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mr: 3, letterSpacing: 0.5 }}>
            TRADER BOT
          </Typography>
          <Tabs
            value={tab}
            onChange={(_, v) => setTab(v)}
            textColor="inherit"
            sx={{
              '& .MuiTabs-indicator': { backgroundColor: '#60a5fa' },
              '& .MuiTab-root': { fontSize: 13, minHeight: 48, textTransform: 'none', px: 2 },
            }}
          >
            {NAV_TABS.map((label) => (
              <Tab key={label} label={label} />
            ))}
          </Tabs>
        </Toolbar>
      </AppBar>
      <Box sx={{ mt: '48px', height: 'calc(100vh - 48px)', overflow: 'hidden' }}>
        {tab === 1 ? <LogsPage {...wsState} />
        : tab === 4 ? <AppsAdminPage />
        : (
          <Box sx={{ p: 4, color: 'text.secondary' }}>
            <Typography>{NAV_TABS[tab]} — coming soon</Typography>
          </Box>
        )}
      </Box>
    </ThemeProvider>
  );
}
