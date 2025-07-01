import { useWalletClient, useAccount } from 'wagmi';
import { ethers } from 'ethers';
import { useEffect, useState } from 'react';
import { Button, Alert, Card, Typography, Space, Tag } from 'antd';
import MyTokenABI from '../abi/MyToken.json';

const { Title, Text } = Typography;
const CONTRACT_ADDRESS = '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512';
const TARGET_CHAIN_ID = 31337; // Hardhat

export default function MyTokenComponent() {
    const { data: walletClient } = useWalletClient();
    const { address, isConnected } = useAccount();

    const [contract, setContract] = useState(null);
    const [error, setError] = useState('');
    const [status, setStatus] = useState('');
    const [currentChainId, setCurrentChainId] = useState(null);

    useEffect(() => {
        if (window.ethereum) {
            const handleChainChanged = (chainIdHex) => {
                const chainId = parseInt(chainIdHex, 16);
                setCurrentChainId(chainId);
            };

            window.ethereum.request({ method: 'eth_chainId' }).then(handleChainChanged);
            window.ethereum.on('chainChanged', handleChainChanged);

            return () => {
                window.ethereum.removeListener('chainChanged', handleChainChanged);
            };
        }
    }, []);

    useEffect(() => {
        async function loadContract() {
            if (!walletClient || !isConnected || !address) {
                setError('钱包未连接或客户端未准备好');
                return;
            }

            try {
                const provider = new ethers.BrowserProvider(window.ethereum);
                const signer = await provider.getSigner();
                const myContract = new ethers.Contract(CONTRACT_ADDRESS, MyTokenABI.abi, signer);
                setContract(myContract);
                setError('');
            } catch (err) {
                setError('加载合约失败: ' + err.message);
            }
        }

        loadContract();
    }, [walletClient, isConnected, address]);

    const switchToTargetChain = async () => {
        try {
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: '0x7a69' }],
            });
            setError('');
        } catch (switchError) {
            if (switchError.code === 4902) {
                try {
                    await window.ethereum.request({
                        method: 'wallet_addEthereumChain',
                        params: [
                            {
                                chainId: '0x7a69',
                                chainName: 'Hardhat Localhost',
                                nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
                                rpcUrls: ['http://127.0.0.1:8545'],
                                blockExplorerUrls: [],
                            },
                        ],
                    });
                } catch (addError) {
                    setError('添加网络失败: ' + addError.message);
                }
            } else {
                setError('切换网络失败: ' + switchError.message);
            }
        }
    };

    const handleMint = async () => {
        if (!contract || !address) {
            setError('合约未加载或地址不存在');
            return;
        }
        try {
            setStatus('铸造中...');
            const tx = await contract.safeMint(address);
            const receipt = await tx.wait();
            setStatus(`✅ 铸造成功！交易哈希：${receipt.hash}`);
        } catch (err) {
            console.error(err);
            setStatus('');
            setError('铸造失败: ' + err.message);
        }
    };

    const handleCheckSupply = async () => {
        if (!contract) {
            setError('合约尚未连接');
            return;
        }
        try {
            const total = await contract.totalSupply();
            setStatus(`当前总供应量：${total.toString()}`);
            setError('');
        } catch (err) {
            console.error(err);
            setError('查询失败: ' + err.message);
        }
    };

    return (
        <Card title="🎨 MyToken NFT 操作面板" style={{ maxWidth: 600, margin: '0 auto' }}>
            <Space direction="vertical" style={{ width: '100%' }}>
                {!isConnected && <Alert message="请先连接钱包" type="warning" showIcon />}
                {error && <Alert message={error} type="error" showIcon />}
                {status && <Alert message={status} type="success" showIcon />}

                <Text strong>钱包地址：</Text>
                <Text code>{address || '未连接'}</Text>

                <Text>
                    当前网络：
                    <Tag color={currentChainId === TARGET_CHAIN_ID ? 'green' : 'orange'}>
                        {currentChainId ?? '未知'}
                    </Tag>
                </Text>

                {currentChainId !== TARGET_CHAIN_ID && (
                    <Button type="primary" danger onClick={switchToTargetChain}>
                        🔁 切换到 Hardhat 本地链
                    </Button>
                )}

                <Space>
                    <Button
                        type="default"
                        onClick={handleCheckSupply}
                        disabled={!contract || currentChainId !== TARGET_CHAIN_ID}
                    >
                        📦 查看总供应量
                    </Button>
                    <Button
                        type="primary"
                        onClick={handleMint}
                        disabled={!contract || currentChainId !== TARGET_CHAIN_ID}
                    >
                        🪙 铸造一个 NFT
                    </Button>
                </Space>
            </Space>
        </Card>
    );
}
