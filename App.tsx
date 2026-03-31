/**
 * 好好理財 App
 * WellFinianceApp - 主入口
 */

import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { Navigation } from './src/navigation';

export default function App() {
  return (
    <>
      <StatusBar style="auto" />
      <Navigation />
    </>
  );
}
