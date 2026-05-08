import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: { main: '#1565c0' },
    background: { default: '#f0f2f5' },
  },
  typography: {
    fontSize: 12,
    fontFamily: '"Inter", "Roboto", sans-serif',
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: { backgroundColor: '#0d1a2e' },
      },
    },
    MuiCssBaseline: {
      styleOverrides: {
        body: { fontFamily: '"Inter", "Roboto", sans-serif' },
      },
    },
  },
});

export default theme;
