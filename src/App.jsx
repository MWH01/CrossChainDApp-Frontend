import { useState } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import MyTokenComponent from './components/MyTokenComponent';
import NFTPoolLockAndReleaseComponent from './components/NFTPoolLockAndReleaseComponent';
import WrappedMyTokenComponent from './components/WrappedMyTokenComponent';
import NFTPoolBurnAndMintComponent from './components/NFTPoolBurnAndMintComponent';

export default function App() {
  const [activeTab, setActiveTab] = useState('mytoken'); // 默认展示 MyToken

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white text-gray-800 flex flex-col items-center">
      <div className="w-full max-w-5xl px-6 py-10">
        {/* 标题 */}
        <h1 className="text-5xl font-extrabold text-blue-600 tracking-tight text-center mb-6">
          🔗 CrossChain DApp
        </h1>

        {/* 钱包连接按钮（右上角） */}
        <div className="flex justify-end mb-6">
          <ConnectButton />
        </div>

        {/* 副标题 */}
        <p className="text-center text-gray-600 text-lg mb-10">
          跨链 NFT 管理与演示
        </p>

        {/* Tab 切换按钮 */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
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
          <button
            onClick={() => setActiveTab('wrapped')}
            className={`px-4 py-2 rounded ${activeTab === 'wrapped'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
          >
            包装 NFT 查询
          </button>
          <button
            onClick={() => setActiveTab('burnmint')}
            className={`px-4 py-2 rounded ${activeTab === 'burnmint'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
          >
            跨链接收&销毁
          </button>
        </div>

        {/* 主内容卡片 */}
        <main className="bg-white rounded-3xl shadow-xl p-8 border border-gray-200 space-y-6">
          {activeTab === 'mytoken' && <MyTokenComponent />}
          {activeTab === 'lockpool' && <NFTPoolLockAndReleaseComponent />}
          {activeTab === 'wrapped' && <WrappedMyTokenComponent />}
          {activeTab === 'burnmint' && <NFTPoolBurnAndMintComponent />}
        </main>
      </div>
    </div>
  );
}
