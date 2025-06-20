import { useWalletClient, useAccount } from 'wagmi';
import { ethers } from 'ethers';
import { useEffect, useState } from 'react';
import MyTokenABI from '../abi/MyToken.json';

const CONTRACT_ADDRESS = '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512';
const TARGET_CHAIN_ID = 31337; // Hardhat

export default function MyTokenComponent() {
    const { data: walletClient } = useWalletClient();
    const { address, isConnected } = useAccount();

    const [contract, setContract] = useState(null);
    const [error, setError] = useState('');
    const [status, setStatus] = useState('');
    const [currentChainId, setCurrentChainId] = useState(null);

    // 监听链变化
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

    // 加载合约
    useEffect(() => {
        async function loadContract() {
            if (!walletClient || !isConnected || !address) {
                setError('钱包未连接或客户端未准备好');
                return;
            }

            try {
                const provider = new ethers.BrowserProvider(window.ethereum);
                const signer = await provider.getSigner(address);
                const myContract = new ethers.Contract(CONTRACT_ADDRESS, MyTokenABI.abi, signer);
                setContract(myContract);
                setError('');
            } catch (err) {
                setError('加载合约失败: ' + err.message);
            }
        }

        loadContract();
    }, [walletClient, isConnected, address]);

    // 切换网络
    const switchToTargetChain = async () => {
        try {
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: '0x7a69' }], // 0x7a69 是 31337 的16进制
            });
            setError('');
        } catch (switchError) {
            // 如果用户钱包没有该链，尝试添加
            if (switchError.code === 4902) {
                try {
                    await window.ethereum.request({
                        method: 'wallet_addEthereumChain',
                        params: [
                            {
                                chainId: '0x7a69',
                                chainName: 'Hardhat Localhost',
                                nativeCurrency: {
                                    name: 'ETH',
                                    symbol: 'ETH',
                                    decimals: 18,
                                },
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
            setStatus(`铸造成功！交易哈希：${receipt.hash}`);
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
        <div className="p-4">
            <h2 className="text-lg font-bold mb-2">MyToken NFT 操作</h2>

            {error && <div className="text-red-500 mb-2">错误：{error}</div>}
            {status && <div className="text-green-600 mb-2">状态：{status}</div>}

            {!isConnected && <div className="text-yellow-500 mb-2">请先连接钱包</div>}

            {currentChainId !== TARGET_CHAIN_ID && (
                <div className="mb-4 text-yellow-600">
                    <p className="mb-2">当前链ID：{currentChainId ?? '未知'}，请切换到本地链 Hardhat (31337)</p>
                    <button
                        onClick={switchToTargetChain}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded"
                    >
                        切换到 Hardhat 本地链
                    </button>
                </div>
            )}

            <button
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded mr-2"
                onClick={handleCheckSupply}
                disabled={!contract || currentChainId !== TARGET_CHAIN_ID}
            >
                查看总供应量
            </button>
            <button
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
                onClick={handleMint}
                disabled={!contract || currentChainId !== TARGET_CHAIN_ID}
            >
                铸造一个 NFT
            </button>
        </div>
    );
}
