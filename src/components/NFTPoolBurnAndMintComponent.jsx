import { useAccount } from 'wagmi';
import { ethers } from 'ethers';
import { useEffect, useState } from 'react';
import {
    Card,
    Typography,
    Alert,
    Input,
    InputNumber,
    Button,
    Form,
    Space,
} from 'antd';
import NFTPoolBurnAndMintABI from '../abi/NFTPoolBurnAndMint.json';
import WrappedMyTokenABI from '../abi/WrappedMyToken.json';

const { Title } = Typography;

const BURN_AND_MINT_CONTRACT = '0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9';
const WRAPPED_NFT_CONTRACT = '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9';
const DEST_CHAIN_SELECTOR = '31337';
const CALLBACK_CONTRACT = '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0';

export default function NFTPoolBurnAndMintComponent() {
    const { address, isConnected } = useAccount();
    const [contract, setContract] = useState(null);
    const [wrappedNFT, setWrappedNFT] = useState(null);
    const [status, setStatus] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();

    useEffect(() => {
        if (!isConnected || !address) return;

        async function init() {
            try {
                const provider = new ethers.BrowserProvider(window.ethereum);
                const signer = await provider.getSigner();

                const pool = new ethers.Contract(
                    BURN_AND_MINT_CONTRACT,
                    NFTPoolBurnAndMintABI.abi,
                    signer
                );
                const wnft = new ethers.Contract(
                    WRAPPED_NFT_CONTRACT,
                    WrappedMyTokenABI.abi,
                    signer
                );

                setContract(pool);
                setWrappedNFT(wnft);
                setError('');
            } catch (e) {
                setError('加载合约失败: ' + e.message);
            }
        }

        init();
    }, [isConnected, address]);

    const handleBurnAndMint = async (values) => {
        const { tokenId, recipient } = values;

        if (!contract || !wrappedNFT) {
            setError('合约未连接');
            return;
        }

        setError('');
        setStatus('');
        setLoading(true);

        try {
            const tokenIdBigInt = BigInt(tokenId);
            const chainSelector = Number(DEST_CHAIN_SELECTOR);

            setStatus('授权合约销毁包装 NFT 中...');
            const approveTx = await wrappedNFT.approve(
                BURN_AND_MINT_CONTRACT,
                tokenIdBigInt
            );
            await approveTx.wait();

            setStatus('调用 burnAndMint 中...');
            const tx = await contract.burnAndMint(
                tokenIdBigInt,
                recipient,
                chainSelector,
                CALLBACK_CONTRACT
            );
            await tx.wait();

            setStatus(`🔥 销毁并跨链发送成功！交易哈希：${tx.hash}`);
        } catch (e) {
            const message = e?.reason || e?.message || JSON.stringify(e);
            setError('操作失败: ' + message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card
            title={<Title level={4}>🔥 包装 NFT 销毁 & 跨链解锁</Title>}
            style={{ maxWidth: 600, margin: '0 auto' }}
        >
            <Space direction="vertical" style={{ width: '100%' }}>
                {status && <Alert message={status} type="success" showIcon />}
                {error && <Alert message={error} type="error" showIcon />}

                <Form
                    layout="vertical"
                    form={form}
                    initialValues={{ recipient: address }}
                    onFinish={handleBurnAndMint}
                >
                    <Form.Item
                        label="Token ID"
                        name="tokenId"
                        rules={[{ required: true, message: '请输入包装 NFT 的 Token ID' }]}
                    >
                        <InputNumber style={{ width: '100%' }} placeholder="包装 NFT 的 Token ID" />
                    </Form.Item>

                    <Form.Item
                        label="接收地址（原链接收者）"
                        name="recipient"
                        rules={[{ required: true, message: '请输入原链的接收地址' }]}
                    >
                        <Input placeholder="目标链解锁后的原始 NFT 接收者地址" />
                    </Form.Item>

                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            block
                            loading={loading}
                        >
                            🚀 销毁包装 NFT 并跨链解锁原始 NFT
                        </Button>
                    </Form.Item>
                </Form>
            </Space>
        </Card>
    );
}
