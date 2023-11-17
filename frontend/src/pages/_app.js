import '@/styles/globals.css'
import { AuthProvider } from '@/components/authprovider'
import { createTheme, ThemeProvider } from '@mui/material/styles';

const darkTheme = createTheme({
  palette: {
    mode: 'dark', // Switching the dark mode on
  },
});

export default function App({ Component, pageProps }) {
  return (
    <ThemeProvider theme={darkTheme}>
      <AuthProvider>
          <Component {...pageProps} />
      </AuthProvider>
    </ThemeProvider>
  );
}
