import { useAccount } from 'wagmi';
import { ethers } from 'ethers';
import { useEffect, useState } from 'react';
import WrappedMyTokenABI from '../abi/WrappedMyToken.json';

const CONTRACT_ADDRESS = '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9'; // 目标链合约地址

export default function WrappedMyTokenComponent() {
    const { address, isConnected } = useAccount();
    const [contract, setContract] = useState(null);
    const [status, setStatus] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (!isConnected || !address) return;

        async function init() {
            try {
                const provider = new ethers.BrowserProvider(window.ethereum);
                const signer = await provider.getSigner();
                const c = new ethers.Contract(CONTRACT_ADDRESS, WrappedMyTokenABI.abi, signer);
                setContract(c);
            } catch (e) {
                setError('加载 WrappedMyToken 合约失败：' + e.message);
            }
        }

        init();
    }, [isConnected, address]);

    const handleCheckBalance = async () => {
        if (!contract || !address) return;
        try {
            const balance = await contract.balanceOf(address);
            setStatus(`你当前持有 ${balance.toString()} 个包装 NFT`);
        } catch (e) {
            setError('查询失败: ' + e.message);
        }
    };

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-bold">WrappedMyToken 查询</h2>
            {status && <p className="text-green-600">{status}</p>}
            {error && <p className="text-red-600">{error}</p>}
            <button
                className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
                onClick={handleCheckBalance}
            >
                查询包装 NFT 余额
            </button>
        </div>
    );
}
