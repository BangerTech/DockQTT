import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, theme } from 'antd';
import { Welcome } from './pages/Welcome';
import { Dashboard } from './pages/Dashboard';
import { useThemeStore } from './store/themeStore';
import { useWebSocket } from './hooks/useWebSocket';
import './styles/theme.scss';

export const App: React.FC = () => {
  const { isDarkMode } = useThemeStore();
  
  // Initialize WebSocket connection
  useWebSocket();

  return (
    <ConfigProvider
      theme={{
        algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
      }}
    >
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  );
};

export default App; 