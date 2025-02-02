import { useAppContext } from '../context/context';
import style from '../styles/Connect.module.css';

// Function to check and switch network
const checkAndSwitchNetwork = async () => {
  const targetChainId = '0x138D4'; // 80084 in hexadecimal

  if (window.ethereum) {
    try {
      const networkId = await window.ethereum.request({ method: 'eth_chainId' });
      if (networkId !== targetChainId) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: targetChainId,
            chainName: 'Berachain bArtio',
            rpcUrls: ['https://bartio.rpc.berachain.com/'],
            nativeCurrency: {
              name: 'Berachain-bArtio',
              symbol: 'BERA',
              decimals: 18,
            },
            blockExplorerUrls: ['https://bartio.beratrail.io'],
          }],
        });
      }
    } catch (error) {
      console.error('Failed to switch network:', error);
    }
  } else {
    console.log('MetaMask is not installed.');
  }
};

const WalletConnectBtn = () => {
  const { connectWallet, address } = useAppContext();

  const handleConnectWallet = async () => {
    await connectWallet();
    await checkAndSwitchNetwork();
  };

  // Shorten the address to the first 6 and last 4 characters
  const shortenAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className={style.container}>
    <button className={style.loginBtn} onClick={handleConnectWallet}>
      {address ? ` ${shortenAddress(address)}` : 'Connect Wallet'}
    </button>
    </div>
  );
};

export default WalletConnectBtn;
