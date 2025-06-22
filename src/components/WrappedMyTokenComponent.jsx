import { useAccount } from 'wagmi';
import { ethers } from 'ethers';
import { useEffect, useState } from 'react';
import {
    Card,
    Typography,
    Alert,
    Button,
    Space,
} from 'antd';
import WrappedMyTokenABI from '../abi/WrappedMyToken.json';

const { Title, Text } = Typography;
const CONTRACT_ADDRESS = '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9';

export default function WrappedMyTokenComponent() {
    const { address, isConnected } = useAccount();
    const [contract, setContract] = useState(null);
    const [status, setStatus] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!isConnected || !address) return;

        async function init() {
            try {
                const provider = new ethers.BrowserProvider(window.ethereum);
                const signer = await provider.getSigner();
                const c = new ethers.Contract(CONTRACT_ADDRESS, WrappedMyTokenABI.abi, signer);
                setContract(c);
                setError('');
            } catch (e) {
                setError('加载 WrappedMyToken 合约失败：' + e.message);
            }
        }

        init();
    }, [isConnected, address]);

    const handleCheckBalance = async () => {
        if (!contract || !address) return;
        setError('');
        setStatus('');
        setLoading(true);
        try {
            const balance = await contract.balanceOf(address);
            setStatus(`你当前持有 ${balance.toString()} 个包装 NFT`);
        } catch (e) {
            setError('查询失败: ' + e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card
            title={<Title level={4}>📦 WrappedMyToken 查询</Title>}
            style={{ maxWidth: 600, margin: '0 auto' }}
        >
            <Space direction="vertical" style={{ width: '100%' }}>
                {status && <Alert message={status} type="success" showIcon />}
                {error && <Alert message={error} type="error" showIcon />}

                <Text strong>当前钱包地址：</Text>
                <Text code>{address || '未连接'}</Text>

                <Button
                    type="primary"
                    onClick={handleCheckBalance}
                    loading={loading}
                    disabled={!contract}
                >
                    查询包装 NFT 余额
                </Button>
            </Space>
        </Card>
    );
}
