import { useWalletClient, useAccount } from 'wagmi';
import { ethers } from 'ethers';
import { useEffect, useState } from 'react';
import MyTokenABI from '../abi/MyToken.json';

const CONTRACT_ADDRESS = '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512'; // 替换成你的地址

export default function MyTokenComponent() {
    const { data: walletClient } = useWalletClient();
    const { address, isConnected } = useAccount();
    const [contract, setContract] = useState(null);
    const [error, setError] = useState('');
    const [status, setStatus] = useState('');

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

            {error && (
                <div className="text-red-500 mb-2">
                    错误：{error}
                </div>
            )}
            {status && (
                <div className="text-green-600 mb-2">
                    状态：{status}
                </div>
            )}

            {!isConnected && (
                <div className="text-yellow-500 mb-2">请先连接钱包</div>
            )}

            <button
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded mr-2"
                onClick={handleCheckSupply}
                disabled={!contract}
            >
                查看总供应量
            </button>
            <button
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
                onClick={handleMint}
                disabled={!contract}
            >
                铸造一个 NFT
            </button>
        </div>
    );
}
