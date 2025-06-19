// WalletProvider.jsx
import '@rainbow-me/rainbowkit/styles.css';
import { getDefaultWallets, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { mainnet, polygon, arbitrum, sepolia } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// 手动添加 Hardhat 本地链
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
        default: {
            http: ['http://127.0.0.1:8545'],
        },
        public: {
            http: ['http://127.0.0.1:8545'],
        },
    },
};

// 添加你需要支持的链（mainnet等可选，开发时只用 localhost 也行）
const chains = [localhost, mainnet, polygon, arbitrum, sepolia];

const { connectors } = getDefaultWallets({
    appName: 'CrossChain DApp',
    projectId: '69339a218e42870f32d7f9c5319ace0d', // 你之前的 WalletConnect 项目 ID
    chains,
});

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

const queryClient = new QueryClient();

export function WalletProvider({ children }) {
    return (
        <QueryClientProvider client={queryClient}>
            <WagmiProvider config={config}>
                <RainbowKitProvider chains={chains}>
                    {children}
                </RainbowKitProvider>
            </WagmiProvider>
        </QueryClientProvider>
    );
}

