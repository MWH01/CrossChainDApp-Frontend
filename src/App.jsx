import { useState } from 'react';
import { Layout, Tabs, Typography, theme } from 'antd';
import { ConnectButton } from '@rainbow-me/rainbowkit';

import MyTokenComponent from './components/MyTokenComponent';
import NFTPoolLockAndReleaseComponent from './components/NFTPoolLockAndReleaseComponent';
import WrappedMyTokenComponent from './components/WrappedMyTokenComponent';
import NFTPoolBurnAndMintComponent from './components/NFTPoolBurnAndMintComponent';

const { Header, Content, Footer } = Layout;
const { Title, Paragraph } = Typography;

export default function App() {
  const [activeTab, setActiveTab] = useState('mytoken');

  const items = [
    { key: 'mytoken', label: '🎨 MyToken 操作', children: <MyTokenComponent /> },
    { key: 'lockpool', label: '🔒 跨链锁定池操作', children: <NFTPoolLockAndReleaseComponent /> },
    { key: 'wrapped', label: '📦 包装 NFT 查询', children: <WrappedMyTokenComponent /> },
    { key: 'burnmint', label: '🔥 跨链接收&销毁', children: <NFTPoolBurnAndMintComponent /> },
  ];

  const {
    token: { colorBgContainer },
  } = theme.useToken();

  return (
    <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      {/* 顶部 Header */}
      <Header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#001529' }}>
        <Title level={3} style={{ color: 'white', margin: 0 }}>
          🔗 CrossChain DApp
        </Title>
        <ConnectButton />
      </Header>

      {/* 主体内容区域 */}
      <Content style={{ maxWidth: 1000, margin: '0 auto', padding: '32px 16px', background: colorBgContainer }}>
        <Paragraph style={{ textAlign: 'center', marginBottom: 24, fontSize: 16 }}>
          跨链 NFT 管理与演示平台，支持 Chainlink CCIP 模拟
        </Paragraph>

        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={items}
          tabBarGutter={16}
          size="large"
          centered
        />
      </Content>

      {/* 底部 Footer */}
      <Footer style={{ textAlign: 'center', background: '#fff' }}>
        Chainlink CCIP 跨链演示 DApp ©2025 Created by CryptoM
      </Footer>
    </Layout>
  );
}
