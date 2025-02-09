import { useAppContext } from '../context/context';
import style from '../styles/Connect.module.css';
import { useMemo, useEffect, useRef } from 'react';

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
  const { connectWallet, address, duelHistory, fetchDuelHistory } = useAppContext(); 

  const hasFetched = useRef(false); 

 
  useEffect(() => {
    if (address && !hasFetched.current) {

      fetchDuelHistory(1); 
      hasFetched.current = true; 
    }
  }, [address, fetchDuelHistory]);


  const handleConnectWallet = async () => {
    await connectWallet(); 
    await checkAndSwitchNetwork(); 
  };

  // Shorten the address to the first 6 and last 4 characters
  const shortenAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Calculate win/loss ratio
  const winLossRatio = useMemo(() => {
    if (!duelHistory || duelHistory.length === 0) return { wins: 0, losses: 0, ratio: 'N/A' };

    let wins = 0;
    let losses = 0;

    duelHistory.forEach((duel) => {
      if (duel.winner === address) wins++;
      if (duel.loser === address) losses++;
    });

    const ratio = losses === 0 && wins > 0 ? 'Perfect Score' : (wins / losses).toFixed(2);// Avoid division by zero and display as infinity if no losses
    return { wins, losses, ratio };
  }, [duelHistory, address]);

  const ratioColor = winLossRatio.ratio === 'Perfect Score' 
  ? '#09ff00' 
  : winLossRatio.ratio >= 1 
  ? '#09ff00' 
  : winLossRatio.ratio >= 0.5
  ? 'yellow' 
  : winLossRatio.ratio >= 0.25
  ? 'orange' 
  : winLossRatio.ratio >= 0 
  ? '#71767b' 
  : 'red';

  const winsColor = '#09ff00';
  const lossesColor = 'red';
  
  return (
    <div className={style.parentcontainer}>
      <div className={style.container}>
        <button className={style.loginBtn} onClick={handleConnectWallet}>
          {address ? ` ${shortenAddress(address)}` : 'Connect Wallet'}
        </button>

        {address && (
          <div className={style.ratioContainer}>
            <span className={style.ratioText}>
            <span >
              Wins
            </span> / 
            <span >
              Losses
            </span>: 
            <span style={{ color: winsColor }}>
              {winLossRatio.wins}
            </span> / 
            <span style={{ color: lossesColor }}>
              {winLossRatio.losses}
            </span> = 
            <span style={{ color: winLossRatio.ratio === 'Perfect Score' ? '#09ff00' : ratioColor }}>
              {winLossRatio.ratio}
            </span>


            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default WalletConnectBtn;
