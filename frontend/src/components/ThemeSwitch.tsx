import React from 'react';
import { SunOutlined, MoonOutlined } from '@ant-design/icons';
import './ThemeSwitch.css';

interface ThemeSwitchProps {
  darkMode: boolean;
  onChange: (checked: boolean) => void;
}

export const ThemeSwitch: React.FC<ThemeSwitchProps> = ({ darkMode, onChange }) => {
  return (
    <div className="toggle-container">
      <div className={`toggle ${darkMode ? 'active' : ''}`} onClick={() => onChange(!darkMode)}>
        <div className="knob">
          {darkMode ? (
            <MoonOutlined className="icon" />
          ) : (
            <SunOutlined className="icon" />
          )}
        </div>
      </div>
    </div>
  );
}; 