// WalletProvider.jsx
import '@rainbow-me/rainbowkit/styles.css';
import { getDefaultWallets, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { mainnet, polygon, arbitrum, sepolia } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// ========== 1. 自定义链 ==========
const localhost = {
    id: 31337,
    name: 'Hardhat',
    network: 'localhost',
    nativeCurrency: {
        name: 'Ether',
        symbol: 'ETH',
        decimals: 18,
    },
    rpcUrls: {
        default: { http: ['http://127.0.0.1:8545'] },
        public: { http: ['http://127.0.0.1:8545'] },
    },
};

// ========== 2. 支持的链 ==========
const chains = [localhost, mainnet, polygon, arbitrum, sepolia];

// ========== 3. 钱包连接器 ==========
const { connectors } = getDefaultWallets({
    appName: 'CrossChain DApp',
    projectId: '69339a218e42870f32d7f9c5319ace0d', // WalletConnect 项目 ID
    chains,
});

// ========== 4. wagmi 配置 ==========
const config = createConfig({
    autoConnect: false,
    connectors,
    chains,
    transports: {
        [localhost.id]: http('http://127.0.0.1:8545'),
        [mainnet.id]: http(),
        [polygon.id]: http(),
        [arbitrum.id]: http(),
        [sepolia.id]: http(),
    },
});

// ========== 5. QueryClient ==========
const queryClient = new QueryClient();

// ========== 6. Provider 组件 ==========
export function WalletProvider({ children }) {
    return (
        <QueryClientProvider client={queryClient}>
            <WagmiProvider config={config}>
                <RainbowKitProvider chains={chains}>{children}</RainbowKitProvider>
            </WagmiProvider>
        </QueryClientProvider>
    );
}
