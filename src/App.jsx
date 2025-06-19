import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { ConnectButton } from '@rainbow-me/rainbowkit';
import MyTokenComponent from './components/MyTokenComponent';

export default function App() {
  return (
    <div style={{ padding: 40 }}>
      <h1>🧠 CrossChain DApp</h1>
      <ConnectButton />
      <MyTokenComponent />
    </div>
  );
}
