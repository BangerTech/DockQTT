import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { theme } from './theme';
import WelcomePage from './components/WelcomePage';
import Dashboard from './components/Dashboard';
import { ConnectionProvider } from './context/ConnectionContext';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <ConnectionProvider>
          <Routes>
            <Route path="/" element={<WelcomePage />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        </ConnectionProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App; 