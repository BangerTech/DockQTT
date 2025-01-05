import React from 'react';
import { useWebSocket } from '../hooks/useWebSocket';
import { MessageViewer } from '../components/MessageViewer';
import { Button } from 'antd';
import { SunOutlined, MoonOutlined } from '@ant-design/icons';

export const Dashboard: React.FC<{ darkMode: boolean, setDarkMode: (mode: boolean) => void }> = ({ darkMode, setDarkMode }) => {
  useWebSocket();

  return (
    <div style={{ padding: '24px' }}>
      <Button
        type="text"
        icon={darkMode ? <SunOutlined /> : <MoonOutlined />}
        onClick={() => {
          setDarkMode(!darkMode);
          console.log('Switching theme to:', !darkMode ? 'dark' : 'light'); // Debug-Log
        }}
        style={{
          color: darkMode ? '#fff' : '#000',
          background: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
          borderRadius: '50%',
          width: '48px',
          height: '48px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '16px',
        }}
      />
      <MessageViewer />
    </div>
  );
}; 