import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ConfigProvider, theme } from 'antd';
import { ThemeProvider } from './contexts/ThemeContext';
import { AppRoutes } from './routes';
import { useTheme } from './hooks/useTheme';
import './services/mqtt'; // Import the socket service

const AppContent: React.FC = () => {
  const { darkMode } = useTheme();

  return (
    <ConfigProvider
      theme={{
        algorithm: darkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {
          borderRadius: 6,
          colorBgContainer: darkMode ? '#141414' : '#ffffff',
        },
      }}
    >
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </ConfigProvider>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
};

export default App; 