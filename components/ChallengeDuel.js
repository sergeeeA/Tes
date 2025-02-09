import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/context';
import style from '../styles/CreateDuel.module.css';
import Web3 from 'web3';
import nftAbi from '../utils/nft';
import homeStyle from '../styles/Home.module.css';

const APPROVE_ADDRESS = '0xBB115E226095cedbF30C5E6D42a7bDf2Bc6A7787';
const web3 = new Web3(Web3.givenProvider || 'http://localhost:8545');

const ChallengeDuel = ({ selectedDuel, onComplete }) => {
  const { challengeDuel, address, checkAndSwitchNetwork } = useAppContext();
  const [nftId, setNftId] = useState('');
  const [nftContractAddress, setNftContractAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [nftInventory, setNftInventory] = useState([]);
  const [connectedAddress, setConnectedAddress] = useState(null);
  const [spinner, setSpinner] = useState('⠋');
  const spinnerCharacters = ['⠋', '⠙', '⠚', '⠞', '⠖', '⠦', '⠴', '⠲', '⠳', '⠓']; 

  const fetchNftInventory = async (contractAddress) => {
    const currentTime = Date.now();
    const cooldownPeriod = 11000;

    try {
      const accounts = await web3.eth.getAccounts();
      if (accounts.length > 0) {
        setConnectedAddress(accounts[0]); // Set the connected account
      } else {
        setConnectedAddress(null); // Reset if no account is connected
      }

      const response = await fetch(
        `https://api.routescan.io/v2/network/testnet/evm/80084/etherscan/api?module=account&action=addresstokennftinventory&address=${connectedAddress}&contractaddress=${contractAddress}&page=1&offset=100&apikey=YourApiKeyToken`
      );
      const data = await response.json();

      if (data.status === "1") {
        setNftInventory(data.result || []);
      }
    } catch  {
      // Handle error
    }
  };

  const getAddressName = (address) => {
    let name = '';


    if (address === '0x7424C334EC67DB47768189696813248bf1a16675') {
      name = 'Bera Outlaws';
    } else if (address === '0x4Ae3985e45784CB73e1886AC603B5FEed4F08a05') {
      name = 'Bera Dwellers';
    } else if (address === '0x46B4b78d1Cd660819C934e5456363A359fde43f4') {
      name = 'Beramonium Bartiosis';
    } else if (address === '?????') {
      name = 'Unknown Address or Contract';
    } else {

    }
    
    return { name,  };
  };

  // Fetch inventory when contract address is updated
  useEffect(() => {
    if (nftContractAddress) {
      fetchNftInventory(nftContractAddress);
    }
  }, [nftContractAddress, connectedAddress]);

  // Automatically fill inputs if a selected duel is passed
  useEffect(() => {
    if (selectedDuel) {
      setNftId(selectedDuel.nftId || '');
      setNftContractAddress(selectedDuel.nftContractAddress || '');
    }
  }, [selectedDuel]);

  useEffect(() => {
    let spinnerInterval;
    if (loading) {
      spinnerInterval = setInterval(() => {
        setSpinner((prevSpinner) => {
          const currentIndex = spinnerCharacters.indexOf(prevSpinner);
          const nextIndex = (currentIndex + 1) % spinnerCharacters.length;
          return spinnerCharacters[nextIndex];
        });
      }, 100); // Change spinner every 100ms
    } else {
      setSpinner('⠋'); // Reset spinner when not loading
    }

    // Cleanup spinner interval on component unmount or loading change
    return () => clearInterval(spinnerInterval);
  }, [loading]);

  const handleChallenge = async (selectedTokenId) => {
    if (!selectedDuel || !selectedTokenId || !nftContractAddress) {
      return;
    }
   
    setLoading(true);

    try {
      await checkAndSwitchNetwork();
      const accounts = await web3.eth.getAccounts();
      if (accounts.length === 0) {
        alert('Please connect your wallet.');
        return;
      }

      const contractAddress = nftContractAddress;
      const nftContract = new web3.eth.Contract(nftAbi.nftAbi, contractAddress);

      // Step 1: Approve the NFT
      const estimatedGas = await nftContract.methods.approve(APPROVE_ADDRESS, selectedTokenId).estimateGas({ from: accounts[0] });
      const gasPrice = await web3.eth.getGasPrice();

      const approveResult = await nftContract.methods.approve(APPROVE_ADDRESS, selectedTokenId).send({
        from: accounts[0],
        gas: estimatedGas,
        gasPrice: gasPrice
      });

      // Wait for the approval transaction to be mined
      await web3.eth.getTransactionReceipt(approveResult.transactionHash);
   
      // Step 2: Challenge the Duel after approval
      await challengeDuel(selectedDuel.duelId, selectedTokenId, contractAddress);

    } catch (error) {
      alert('An error occurred: ' + error.message);
    } finally {
      setLoading(false);
      if (onComplete) {
        onComplete(); // Notify the parent component that the challenge process is complete
      }
    }
  };

  // Use getAddressName for the NFT contract address
  const { name: contractAddressName, imageSrc } = getAddressName(nftContractAddress);

  return (
    <div className={homeStyle.modalContent}>
      <div className={style.createDuelContainer}>
        <h2>Challenging</h2>
        <p><strong>Duel ID:</strong> {selectedDuel ? selectedDuel.duelId : 'N/A'}</p>

        <p><strong>NFT:</strong> {contractAddressName}</p>
        {/* You can also display the imageSrc if it's relevant */}
        <img src={imageSrc} alt={contractAddressName} />

        <form className={style.createDuelForm}>
          {/* NFT Token ID Dropdown */}
          <div className={style.formGroup}>
            <label htmlFor="nftId">NFT TOKEN ID:</label>
            <div className={style.formGroup}>
              <select
                style={{
                  padding: '12px',
                  fontSize: '15px',
                  backgroundColor: '#000',
                  border: '1px solid#2f3336',
                  borderRadius: '8px',
                  color: '#71767b',
                  cursor: 'pointer',
                }}
                id="nftId"
                value={nftId}
                onChange={(e) => {
                  const selectedTokenId = e.target.value;
                  setNftId(selectedTokenId); // Set the selected NFT token ID
                  handleChallenge(selectedTokenId); // Automatically call handleChallenge when an NFT is selected
                }}
              >
                <option value="">Select NFT</option>
                {nftInventory.map((nft) => (
                  <option key={nft.TokenId} value={nft.TokenId}>
                    {nft.TokenId}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* NFT Contract Address input - auto-filled */}
          <div className={style.formGroup}>
            <label htmlFor="nftContractAddress">NFT Contract Address:</label>
            <input
              type="text"
              id="nftContractAddress"
              value={nftContractAddress}
              readOnly
              style={{
                padding: '12px',
                fontSize: '15px',
                backgroundColor: '#000',
                border: '1px solid#2f3336',
                borderRadius: '8px',
                color: '#71767b',
                cursor: 'pointer',
              }}
            />
          </div>
        </form>

        {/* Spinner when loading */}
        {loading && (
          <div className={style.loadingSpinner}>
            <span>{spinner}</span> {/* The rotating spinner */}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChallengeDuel;
