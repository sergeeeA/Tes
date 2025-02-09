import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/context';
import style from '../styles/CreateDuel.module.css';
import nftAbi from '../utils/nft';
import Web3 from 'web3';

const APPROVE_ADDRESS = '0xBB115E226095cedbF30C5E6D42a7bDf2Bc6A7787';
const web3 = new Web3(Web3.givenProvider || 'http://localhost:8545');

const CreateDuel = ({ onComplete }) => { // Add onComplete prop
  const { createDuel, address, checkAndSwitchNetwork } = useAppContext();
  const [nftId, setNftId] = useState('');
  const [nftContractAddress, setNftContractAddress] = useState('');
  const [message, setMessage] = useState('');
  const [nftContract, setNftContract] = useState(null);
  const [loading, setLoading] = useState(false);
  const [nftInventory, setNftInventory] = useState([]);
  const [connectedAddress, setConnectedAddress] = useState(null);

  const [spinner, setSpinner] = useState('⠋');
  const spinnerCharacters = ['⠋', '⠙', '⠚', '⠞', '⠖', '⠦', '⠴', '⠲', '⠳', '⠓']; 


  const contracts = [
    { address: '0x7424C334EC67DB47768189696813248bf1a16675', name: 'Bera Outlaws', },
    { address: '0x4Ae3985e45784CB73e1886AC603B5FEed4F08a05', name: 'Bera Dwellers',},
    { address: '0x46B4b78d1Cd660819C934e5456363A359fde43f4', name: 'Beramonium',}
  ];
 

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

  const fetchNftInventory = async (contractAddress) => {
    if (!contractAddress || !connectedAddress) return; // Ensure contract address and account are valid

    try {
      const response = await fetch(
        `https://api.routescan.io/v2/network/testnet/evm/80084/etherscan/api?module=account&action=addresstokennftinventory&address=${connectedAddress}&contractaddress=${contractAddress}&page=1&offset=100&apikey=YourApiKeyToken`
      );
      const data = await response.json();

      if (data.status === "1") {
        setNftInventory(data.result || []);
      }
    } catch (error) {

    }
  };

  useEffect(() => {
    const initContract = async () => {
      if (nftContractAddress) {
        const contract = new web3.eth.Contract(nftAbi.nftAbi, nftContractAddress);
        setNftContract(contract);
        fetchNftInventory(nftContractAddress); // Fetch NFT inventory when contract address is set
      }
    };
    initContract();
  }, [nftContractAddress, connectedAddress]); // Trigger fetching when contract address or connected address changes

  useEffect(() => {
    const getConnectedAddress = async () => {
      const accounts = await web3.eth.getAccounts();
      if (accounts.length > 0) {
        setConnectedAddress(accounts[0]);
      } else {
        setConnectedAddress(null);
      }
    };
    getConnectedAddress();
  }, []); // Only run once to get the connected address

const handleSubmit = async (e) => {
    e.preventDefault();
    if (!address) {
      alert('Please connect your wallet first.');
      return;
    }
    if (!nftId || !nftContractAddress ) {
      alert('Please fill in all fields.');
      return;
    }

    if (nftContract) {
      try {
        await checkAndSwitchNetwork();
        const accounts = await web3.eth.getAccounts();
        if (accounts.length === 0) {
          alert('Please connect your wallet.');
          return;
        }

        // Estimate gas for the approval transaction

        const estimatedGas = await nftContract.methods.approve(APPROVE_ADDRESS, nftId).estimateGas({ from: accounts[0] });


        // Optionally, you can check the current gas price
        const gasPrice = await web3.eth.getGasPrice();


        // Approve the NFT before calling createDuel

        setLoading(true);
        const approveResult = await nftContract.methods.approve(APPROVE_ADDRESS, nftId).send({ 
          from: accounts[0],
          gas: estimatedGas, // Use the estimated gas
          gasPrice: gasPrice  // Optionally set a custom gas price (if needed)
        });



        await createDuel(nftId, nftContractAddress, message);
        setNftId('');
        setNftContractAddress('');
        setMessage('');
   
      }  finally {
        setLoading(false);
        if (onComplete) {
          onComplete(); // Notify the parent component that the duel creation process is complete
        }
      }
    }
  };

  // LIMIT NOTIFY
  const handleMessageChange = (e) => {
    const newMessage = e.target.value;
    if (newMessage.length <= 15) {
      setMessage(newMessage);
    }
  };

  const handleContractAddressChange = (e) => {
    let newContractAddress = e.target.value;
  
    // Check if the address is valid using Web3.js isAddress method
    if (web3.utils.isAddress(newContractAddress)) {
      // Convert to checksum address format (this ensures correct capitalization)
      newContractAddress = web3.utils.toChecksumAddress(newContractAddress);
      
      setNftContractAddress(newContractAddress); // Update contract address
      fetchNftInventory(newContractAddress); // Fetch NFT inventory immediately after address is set
    } else {
      // Optionally show an alert or message if the address is invalid
      alert('Please enter a valid contract address.');
    }
  };

  return (
    <div className={style.createDuelContainer}>
      <h2 className={style.createtitle}>Create a New Duel</h2>
      <form onSubmit={handleSubmit} className={style.createDuelForm}>
      
        <div className={style.formGroup}>
  <label>NFT Contract Address:</label>

  <select
  value={nftContractAddress}
  onChange={(e) => setNftContractAddress(e.target.value)} // Handle selection change
  style={{
    padding: '12px',
    fontSize: '15px',
    backgroundColor: '#000',
    border: '1px solid#2f3336',
    borderRadius: '8px',
    color: '#71767b',
    cursor: 'pointer',
    marginTop: '10px',
  }}
>
  <option value="">Select a Contract Address</option>
  {contracts.map(({ address, name,  }) => (
    <option key={address} value={address}>

      {name}
    </option>
  ))}
</select>
<div className={style.or}>or</div>
  <input
    type="text"
    value={nftContractAddress}
    onChange={handleContractAddressChange} // Handle contract address change
    placeholder="Paste any NFT Contract Address"
    maxLength={42}  // Maximum 42 characters
    minLength={42}  // Minimum 42 characters
  />



</div>

  <div className={style.formGroup}>
          <label>NFT TOKEN ID:</label>
          <select
            value={nftId}
            onChange={(e) => setNftId(e.target.value)}
            style={{
              padding: '12px',
              fontSize: '15px',
              backgroundColor: '#000',
              border: '1px solid#2f3336',
              borderRadius: '8px',
              color: '#71767b',
              cursor: 'pointer',
            }}
          >
            <option value="">Select Token ID</option>
            {nftInventory.map((nft) => (
              <option key={nft.TokenId} value={nft.TokenId}>
                {nft.TokenId}
              </option>
            ))}
          </select>
        </div>

        <div className={style.formGroup}>
          <label>Message:</label>
          <input
            type="text"
            value={message}
            onChange={handleMessageChange}
            placeholder="Optional"
            maxLength={55}
          />
          {message.length === 55 && (
            <p className={style.limitNotification}>Character limit reached!</p>
          )}
        </div>
        {loading ? (
          <div className={style.spinnerContainer}>
            <div className={style.loadingSpinner}>
              <span>{spinner}</span> {/* The rotating spinner */}
            </div>
          </div>
        ) : (
          <button type="submit" className={style.submitButton}>
            Create Duel
          </button>
        )}
      </form>
    </div>
  );
};

export default CreateDuel;