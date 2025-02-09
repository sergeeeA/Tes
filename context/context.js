import { createContext, useState, useEffect, useContext } from 'react';
import Web3 from 'web3';
import createLotteryContract from '../utils/lottery';

export const appContext = createContext();

export const AppProvider = ({ children }) => {
  const [web3, setWeb3] = useState(null);
  const [address, setAddress] = useState('');
  const [lotteryContract, setLotteryContract] = useState(null);  // Ensuring lotteryContract is initialized
  const [activeDuelIds, setActiveDuelIds] = useState([]);
  const [duelDetails, setDuelDetails] = useState([]);
  const [duelHistory, setDuelHistory] = useState([]);  



  useEffect(() => {
    const debounceTimeout = setTimeout(() => {
      if (lotteryContract) {
        fetchActiveDuelIds();
      }
    }, 500); // Delay of 500ms before fetching
    
    return () => clearTimeout(debounceTimeout); // Cleanup on unmount or when contract changes
  }, [lotteryContract]);
  
  

  const fetchDuelData = async () => {
    if (lotteryContract) {
      try {
        await fetchActiveDuelIds();
      } catch (error) {

      }
    }
  };
  
  const fetchActiveDuelIds = async () => {
    if (lotteryContract) {
      try {
        const ids = await lotteryContract.methods.getActiveDuelIds().call();
        setActiveDuelIds(ids);
  
        // Only fetch duel details if there are active duels
        if (ids.length > 0) {
          fetchBatchDuelDetails(ids);  // Fetch duel details after getting active duel IDs
        } else {
          setDuelDetails([]); // Clear duel details if no active duels
        }
      } catch (error) {

      }
    }
  };
  
  // Fetch batch duel details for the provided active duel IDs
  const fetchBatchDuelDetails = async (duelIds) => {
    if (lotteryContract && duelIds.length) {
      try {
        const details = await lotteryContract.methods.getBatchDuelDetails(duelIds).call();
        setDuelDetails(details);  // Update duel details after fetching them
      } catch (error) {

      }
    }
  };

  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  const fetchDuelHistory = async (page) => {
    if (!lotteryContract) return;
  
    try {
      // Get the current duelCounter value to use as the pageSize
      const duelCounter = await lotteryContract.methods.duelCounter().call();
  
      // Call getPaginatedDuelHistory with the current page and duelCounter as pageSize
      const history = await lotteryContract.methods.getPaginatedDuelHistory(page, duelCounter).call();
  
      // Format the data to match frontend display expectations
      const formattedHistory = history.map(duel => ({
        duelId: duel.duelId.toString(),
        winner: duel.winner,
        loser: duel.loser,
        nftContractAddress: duel.nftContractAddress,
        winnerTokenId: duel.winnerTokenId.toString(),
        loserTokenId: duel.loserTokenId.toString(),
      }));
  
      // Sort the duels by duelId in descending order to get the most recent first
      const sortedHistory = formattedHistory.sort((a, b) => b.duelId - a.duelId);
  
      // Store the sorted duel history (without filtering by address)
      setDuelHistory(sortedHistory);
  
    } catch (error) {
      // If rate limit is exceeded, retry after a delay
      if (error.message.includes('429')) {

        await delay(1000); // Wait for 1 second before retrying
        fetchDuelHistory(page); // Retry fetching duel history
      } else {
        console.error('Error fetching duel history:', error);
      }
    }
  };



// New challengeDuel function with DUEL_FEE amount
const challengeDuel = async (duelId, challengerNftId, nftContractAddress) => {
  if (!lotteryContract || !address) {

    return;
  }



  try {
    // Retrieve the DUEL_FEE amount from the contract

    const duelFee = await lotteryContract.methods.DUEL_FEE().call();
    // Estimate the gas for the challengeDuel function
    const gasEstimate = await lotteryContract.methods
      .challengeDuel(duelId, challengerNftId, nftContractAddress)
      .estimateGas({ from: address, value: duelFee });

      
    // Send the transaction with the estimated gas and DUEL_FEE amount
    await lotteryContract.methods
      .challengeDuel(duelId, challengerNftId, nftContractAddress)
      .send({ from: address, gas: gasEstimate, value: duelFee });


    // Optionally, refresh any relevant data after challenging the duel (e.g., fetch duels)
    fetchActiveDuelIds();  // Refresh active duels if needed
    fetchDuelHistory(1);
  } catch (error) {

  }
};


  const createDuel = async (nftId, nftContractAddress, message) => {
    if (!lotteryContract || !address) {

      return;
    }


    try {
      const duelFee = await lotteryContract.methods.DUEL_FEE().call();

      // Estimate the gas before sending the transaction
      const gasEstimate = await lotteryContract.methods
        .createDuel(nftId, nftContractAddress, message)
        .estimateGas({ from: address, value: duelFee });

      // Send the transaction with the estimated gas
      await lotteryContract.methods
        .createDuel(nftId, nftContractAddress, message)
        .send({ from: address, value: duelFee, gas: gasEstimate });

      fetchActiveDuelIds();  // Refresh the list of active duels
    } catch (error) {

    }
  };
 // New cancelDuel function
 const cancelDuel = async (duelId) => {
  if (!lotteryContract || !address) {
    return;
  }



  try {
    // Estimate gas and send transaction to cancel the duel
    const gasEstimate = await lotteryContract.methods
      .cancelDuel(duelId)
      .estimateGas({ from: address });

    // Send the cancel duel transaction
    await lotteryContract.methods
      .cancelDuel(duelId)
      .send({ from: address, gas: gasEstimate });

    // After cancelling the duel, refresh the active duel data
    fetchActiveDuelIds();
  } catch (error) {
    console.error('Error canceling duel:', error);
  }
};


// Example checkAndSwitchNetwork function without loading delays
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



const connectWallet = async () => {
  if (typeof window !== 'undefined' && typeof window.ethereum !== 'undefined') {
    try {
      await window.ethereum.request({ method: 'eth_requestAccounts' });

      // Check and switch network if needed
      await checkAndSwitchNetwork();

      const web3 = new Web3(window.ethereum); // Initialize Web3 here
      setWeb3(web3);  // Store web3 in context
      const accounts = await web3.eth.getAccounts();
      setAddress(accounts[0]);

      // Initialize the lottery contract after connecting the wallet
      const lotteryContractInstance = createLotteryContract(web3);
      setLotteryContract(lotteryContractInstance);

      window.ethereum.on('accountsChanged', async () => {
        const accounts = await web3.eth.getAccounts();
        setAddress(accounts[0]);
      });
    } catch (err) {
      console.error('Error connecting wallet:', err);
    }
  } else {
    console.log('Ethereum is not available.');
  }
};


  return (
    <appContext.Provider
      value={{
        address,
       

        connectWallet,

        fetchDuelData,

        fetchDuelHistory,
        duelHistory, 
        activeDuelIds,
        duelDetails,

        challengeDuel,
        createDuel,
        cancelDuel, 
        checkAndSwitchNetwork,
        lotteryContract, 
      }}
    >
      {children}
    </appContext.Provider>
  );
};

export const useAppContext = () => {
  return useContext(appContext);
};
