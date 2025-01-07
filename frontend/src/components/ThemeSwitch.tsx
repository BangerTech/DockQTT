import React from 'react';
import { SunOutlined, MoonOutlined } from '@ant-design/icons';
import './ThemeSwitch.css';

interface ThemeSwitchProps {
  darkMode: boolean;
  onChange: (checked: boolean) => void;
  style?: React.CSSProperties;
}

export const ThemeSwitch: React.FC<ThemeSwitchProps> = ({ darkMode, onChange, style }) => {
  return (
    <div className="toggle-container" style={style}>
      <div 
        className={`toggle ${darkMode ? 'active' : ''}`} 
        onClick={() => {
          if (typeof onChange === 'function') {
            onChange(!darkMode);
          }
        }}
      >
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