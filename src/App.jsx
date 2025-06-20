import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { ConnectButton } from '@rainbow-me/rainbowkit';
import MyTokenComponent from './components/MyTokenComponent';
import NFTPoolLockAndReleaseComponent from './components/NFTPoolLockAndReleaseComponent';

export default function App() {
  const [activeTab, setActiveTab] = useState('mytoken'); // 默认展示 MyToken

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white text-gray-800 p-8 flex flex-col items-center">
      {/* 标题 */}
      <h1 className="text-5xl font-extrabold text-blue-600 tracking-tight mb-6">
        🔗 CrossChain DApp
      </h1>
      {/* 钱包按钮放标题下方右侧 */}
      <div className="w-full max-w-3xl flex justify-end mb-6">
        <ConnectButton />
      </div>
      {/* 副标题 */}
      <p className="max-w-3xl text-center text-gray-600 text-lg mb-10">
        跨链 NFT 管理与演示
      </p>
      {/* Tab 切换按钮 */}
      <div className="flex space-x-4 mb-8">
        <button
          onClick={() => setActiveTab('mytoken')}
          className={`px-4 py-2 rounded ${activeTab === 'mytoken'
            ? 'bg-blue-600 text-white'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
        >
          MyToken 操作
        </button>
        <button
          onClick={() => setActiveTab('lockpool')}
          className={`px-4 py-2 rounded ${activeTab === 'lockpool'
            ? 'bg-blue-600 text-white'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
        >
          跨链锁定池操作
        </button>
      </div>

      {/* 主内容卡片 */}
      <main className="w-full max-w-3xl bg-white rounded-3xl shadow-xl p-8 border border-gray-200">
        {activeTab === 'mytoken' && <MyTokenComponent />}
        {activeTab === 'lockpool' && <NFTPoolLockAndReleaseComponent />}
      </main>
    </div>
  );
}
