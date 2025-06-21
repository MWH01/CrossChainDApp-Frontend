import { useAccount } from 'wagmi';
import { ethers } from 'ethers';
import { useEffect, useState } from 'react';
import NFTPoolBurnAndMintABI from '../abi/NFTPoolBurnAndMint.json';
import WrappedMyTokenABI from '../abi/WrappedMyToken.json';

// 合约地址（本地 hardhat 部署）
const BURN_AND_MINT_CONTRACT = '0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9';
const WRAPPED_NFT_CONTRACT = '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9'; // WrappedMyToken 地址
const DEST_CHAIN_SELECTOR = '31337'; // 示例：Hardhat 网络 ID
const CALLBACK_CONTRACT = '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0'; // NFTPoolLockAndRelease 合约地址

export default function NFTPoolBurnAndMintComponent() {
    const { address, isConnected } = useAccount();
    const [contract, setContract] = useState(null);
    const [wrappedNFT, setWrappedNFT] = useState(null);

    const [tokenIdInput, setTokenIdInput] = useState('');
    const [recipientInput, setRecipientInput] = useState(address || '');
    const [status, setStatus] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (!isConnected || !address) return;

        async function init() {
            try {
                const provider = new ethers.BrowserProvider(window.ethereum);
                const signer = await provider.getSigner();

                const pool = new ethers.Contract(BURN_AND_MINT_CONTRACT, NFTPoolBurnAndMintABI.abi, signer);
                const wnft = new ethers.Contract(WRAPPED_NFT_CONTRACT, WrappedMyTokenABI.abi, signer);

                setContract(pool);
                setWrappedNFT(wnft);
            } catch (e) {
                setError('加载合约失败: ' + e.message);
            }
        }

        init();
    }, [isConnected, address]);

    const handleBurnAndMint = async () => {
        if (!contract || !wrappedNFT) {
            setError('合约未连接');
            return;
        }

        if (!tokenIdInput || !recipientInput) {
            setError('请填写 Token ID 和接收地址');
            return;
        }

        setError('');
        setStatus('开始操作...');

        try {
            const tokenIdBigInt = BigInt(tokenIdInput);
            const chainSelector = Number(DEST_CHAIN_SELECTOR);

            // 授权 burnAndMint 合约处理该 tokenId
            setStatus('授权合约销毁包装 NFT 中...');
            const approveTx = await wrappedNFT.approve(BURN_AND_MINT_CONTRACT, tokenIdBigInt);
            await approveTx.wait();

            // 执行 burnAndMint 操作
            setStatus('调用 burnAndMint 中...');
            const tx = await contract.burnAndMint(
                tokenIdBigInt,
                recipientInput, // 原链上的 新 拥有者
                chainSelector,
                CALLBACK_CONTRACT // 原链锁仓合约地址
            );
            await tx.wait();

            setStatus(`跨链销毁并发送成功！交易哈希：${tx.hash}`);
        } catch (e) {
            const message = e?.reason || e?.message || JSON.stringify(e);
            setError('操作失败: ' + message);
            setStatus('');
        }
    };

    return (
        <div className="space-y-4 p-4 max-w-md mx-auto bg-white shadow rounded">
            <h2 className="text-xl font-bold">包装 NFT 销毁并解锁</h2>

            {status && <p className="text-green-600">{status}</p>}
            {error && <p className="text-red-600">{error}</p>}

            <label className="block font-semibold">Token ID:</label>
            <input
                type="number"
                className="w-full border px-2 py-1 rounded"
                placeholder="包装 NFT 的 Token ID"
                value={tokenIdInput}
                onChange={(e) => setTokenIdInput(e.target.value)}
            />

            <label className="block font-semibold mt-2">接收地址（目标链原始 NFT 所属者）:</label>
            <input
                type="text"
                className="w-full border px-2 py-1 rounded"
                placeholder="目标链接收者地址"
                value={recipientInput}
                onChange={(e) => setRecipientInput(e.target.value)}
            />

            <button
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 w-full mt-4"
                onClick={handleBurnAndMint}
            >
                销毁包装 NFT 并跨链解锁原始 NFT
            </button>
        </div>
    );
}
