import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Welcome } from './pages/Welcome';
import { Dashboard } from './pages/Dashboard';

export const AppRoutes: React.FC = () => (
  <Routes>
    <Route path="/" element={<Welcome />} />
    <Route path="/dashboard" element={<Dashboard />} />
  </Routes>
); 