import { useAccount } from 'wagmi'
import { ethers } from 'ethers' // ethers v6
import { useEffect, useState } from 'react'
import {
    Card,
    Typography,
    Alert,
    Form,
    Input,
    InputNumber,
    Button,
    Space,
} from 'antd'
import NFTPoolLockAndReleaseABI from '../abi/NFTPoolLockAndRelease.json'
import MyTokenABI from '../abi/MyToken.json'

const { Title } = Typography

const NFT_POOL_LOCK_AND_RELEASE_ADDRESS = '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0'
const MY_TOKEN_ADDRESS = '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512'
const NFT_POOL_BURN_AND_MINT_ADDRESS = '0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9'

export default function NFTPoolLockAndReleaseComponent() {
    const { address, isConnected } = useAccount()

    const [contract, setContract] = useState(null)
    const [nftContract, setNftContract] = useState(null)
    const [error, setError] = useState('')
    const [status, setStatus] = useState('')
    const [loading, setLoading] = useState(false)

    const [form] = Form.useForm()

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

                const c = new ethers.Contract(
                    NFT_POOL_LOCK_AND_RELEASE_ADDRESS,
                    NFTPoolLockAndReleaseABI.abi,
                    signer
                )
                const nft = new ethers.Contract(
                    MY_TOKEN_ADDRESS,
                    MyTokenABI.abi,
                    signer
                )

                setContract(c)
                setNftContract(nft)
                setError('')
            } catch (e) {
                setError('加载合约失败: ' + e.message)
            }
        }
        init()
    }, [isConnected, address])

    async function handleLockAndSendNFT(values) {
        const { tokenId, newOwner, chainSelector, receiver } = values

        if (!contract || !nftContract) {
            setError('合约未连接')
            return
        }

        setError('')
        setStatus('')
        setLoading(true)

        try {
            const tokenIdBigInt = BigInt(tokenId)

            setStatus('授权合约操作NFT...')
            const approveTx = await nftContract.approve(
                NFT_POOL_LOCK_AND_RELEASE_ADDRESS,
                tokenIdBigInt
            )
            await approveTx.wait()

            setStatus('跨链锁定并发送NFT交易中...')
            const tx = await contract.lockAndSendNFT(
                tokenIdBigInt,
                newOwner,
                Number(chainSelector),
                receiver
            )
            await tx.wait()

            setStatus('✅ 跨链发送成功！交易哈希：' + tx.hash)
        } catch (e) {
            const message = e?.reason || e?.message || JSON.stringify(e)
            setError('操作失败: ' + message)
            setStatus('')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Card
            title={<Title level={4}>🔗 NFT 跨链锁定与发送</Title>}
            style={{ maxWidth: 600, margin: '0 auto' }}
        >
            <Space direction="vertical" style={{ width: '100%' }}>
                {error && <Alert message={error} type="error" showIcon />}
                {status && <Alert message={status} type="success" showIcon />}

                <Form
                    layout="vertical"
                    form={form}
                    initialValues={{
                        newOwner: address,
                        receiver: NFT_POOL_BURN_AND_MINT_ADDRESS,
                    }}
                    onFinish={handleLockAndSendNFT}
                >
                    <Form.Item
                        label="Token ID"
                        name="tokenId"
                        rules={[{ required: true, message: '请输入 Token ID' }]}
                    >
                        <InputNumber style={{ width: '100%' }} placeholder="请输入 NFT 的 ID" />
                    </Form.Item>

                    <Form.Item
                        label="新拥有者地址 (目标链)"
                        name="newOwner"
                        rules={[{ required: true, message: '请输入新地址' }]}
                    >
                        <Input placeholder="目标链上的 NFT 新拥有者地址" />
                    </Form.Item>

                    <Form.Item
                        label="目标链 Chain Selector"
                        name="chainSelector"
                        rules={[{ required: true, message: '请输入目标链选择器编号' }]}
                    >
                        <InputNumber style={{ width: '100%' }} placeholder="例如：31337" />
                    </Form.Item>

                    <Form.Item
                        label="目标链接收地址"
                        name="receiver"
                        rules={[{ required: true, message: '请输入目标链合约地址' }]}
                    >
                        <Input placeholder="目标链处理跨链消息的合约地址" />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" loading={loading} block>
                            🚀 跨链锁定并发送 NFT
                        </Button>
                    </Form.Item>
                </Form>
            </Space>
        </Card>
    )
}
