import { useAccount } from 'wagmi'
import { ethers } from 'ethers' // ethers v6 
import { useEffect, useState } from 'react'
import NFTPoolLockAndReleaseABI from '../abi/NFTPoolLockAndRelease.json'
import MyTokenABI from '../abi/MyToken.json'

const NFT_POOL_LOCK_AND_RELEASE_ADDRESS = '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0'
const MY_TOKEN_ADDRESS = '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512'
const NFT_POOL_BURN_AND_MINT_ADDRESS = '0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9'

export default function NFTPoolLockAndReleaseComponent() {
    const { address, isConnected } = useAccount()

    const [contract, setContract] = useState(null)
    const [nftContract, setNftContract] = useState(null)
    const [error, setError] = useState('')
    const [status, setStatus] = useState('')
    const [tokenIdInput, setTokenIdInput] = useState('')
    const [newOwnerInput, setNewOwnerInput] = useState(address || '')
    const [chainSelectorInput, setChainSelectorInput] = useState('')
    const [receiverInput, setReceiverInput] = useState(NFT_POOL_BURN_AND_MINT_ADDRESS || '')

    useEffect(() => {
        if (!isConnected || !address) {
            setContract(null)
            setNftContract(null)
            return
        }
        async function init() {
            try {
                const provider = new ethers.BrowserProvider(window.ethereum)
                const signer = await provider.getSigner()

                const c = new ethers.Contract(NFT_POOL_LOCK_AND_RELEASE_ADDRESS, NFTPoolLockAndReleaseABI.abi, signer)
                const nft = new ethers.Contract(MY_TOKEN_ADDRESS, MyTokenABI.abi, signer)

                setContract(c)
                setNftContract(nft)
                setError('')
            } catch (e) {
                setError('加载合约失败: ' + e.message)
            }
        }
        init()
    }, [isConnected, address])

    async function handleLockAndSendNFT() {
        if (!contract || !nftContract) {
            setError('合约未连接')
            return
        }
        if (!tokenIdInput || !newOwnerInput || !chainSelectorInput || !receiverInput) {
            setError('请填写所有字段')
            return
        }
        setError('')
        setStatus('准备交易...')

        try {
            // ethers v6 转 BigInt
            const tokenIdBigInt = BigInt(tokenIdInput)

            setStatus('授权合约操作NFT...')
            const approveTx = await nftContract.approve(NFT_POOL_LOCK_AND_RELEASE_ADDRESS, tokenIdBigInt)
            await approveTx.wait()

            setStatus('跨链锁定并发送NFT交易中...')
            const tx = await contract.lockAndSendNFT(
                tokenIdBigInt,
                newOwnerInput,
                Number(chainSelectorInput),
                receiverInput
            )
            await tx.wait()

            setStatus('跨链锁定并发送成功！交易哈希：' + tx.hash)
        } catch (e) {
            // ethers v6 错误信息获取稍有不同
            let message = e?.reason || e?.message || JSON.stringify(e)
            setError('操作失败: ' + message)
            setStatus('')
        }
    }

    return (
        <div className="p-4 max-w-md mx-auto bg-white shadow rounded">
            <h2 className="text-xl font-bold mb-4">NFT 跨链锁定池</h2>
            {error && <div className="text-red-600 mb-2">{error}</div>}
            {status && <div className="text-green-600 mb-2">{status}</div>}

            <label className="block mb-1 font-semibold">Token ID:</label>
            <input
                type="number"
                value={tokenIdInput}
                onChange={(e) => setTokenIdInput(e.target.value)}
                className="w-full mb-3 border rounded px-2 py-1"
            />

            <label className="block mb-1 font-semibold">新拥有者地址 (目标链上):</label>
            <input
                type="text"
                value={newOwnerInput}
                onChange={(e) => setNewOwnerInput(e.target.value)}
                className="w-full mb-3 border rounded px-2 py-1"
                placeholder="目标链上NFT新拥有者地址"
            />

            <label className="block mb-1 font-semibold">目标链 Chain Selector (数字):</label>
            <input
                type="number"
                value={chainSelectorInput}
                onChange={(e) => setChainSelectorInput(e.target.value)}
                className="w-full mb-3 border rounded px-2 py-1"
                placeholder="比如本地测试链 31337"
            />

            <label className="block mb-1 font-semibold">目标链接收地址 (目标链跨链合约地址):</label>
            <input
                type="text"
                value={receiverInput}
                onChange={(e) => setReceiverInput(e.target.value)}
                className="w-full mb-4 border rounded px-2 py-1"
                placeholder="目标链处理跨链消息的合约地址"
            />

            <button
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                onClick={handleLockAndSendNFT}
            >
                跨链锁定并发送 NFT
            </button>
        </div>
    )
}
