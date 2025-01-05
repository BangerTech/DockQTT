import React from 'react';
import { Switch } from 'antd';
import { SunOutlined, MoonOutlined } from '@ant-design/icons';
import { theme } from 'antd';

interface ThemeSwitchProps {
  darkMode: boolean;
  onChange: (checked: boolean) => void;
}

export const ThemeSwitch: React.FC<ThemeSwitchProps> = ({ darkMode, onChange }) => {
  const { token } = theme.useToken();
  
  return (
    <Switch
      checked={darkMode}
      onChange={onChange}
      checkedChildren={<MoonOutlined style={{ fontSize: '12px' }} />}
      unCheckedChildren={<SunOutlined style={{ fontSize: '12px' }} />}
      style={{
        backgroundColor: darkMode ? token.colorPrimary : '#f0f0f0',
        width: '56px',
        height: '28px',
      }}
      className="theme-switch"
    />
  );
}; 