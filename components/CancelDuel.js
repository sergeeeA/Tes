import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/context';
import style from '../styles/CreateDuel.module.css';

const CancelDuel = () => {
  const { address, activeDuelIds, duelDetails, cancelDuel, checkAndSwitchNetwork } = useAppContext();
  const [loading, setLoading] = useState(false);

  const addressImages = {
    'Bera outlaws': '/beraoutlaws.jpg',
    'beradwellers': '/beradwellers.jpg',
    'beramonium': '/beramonium.png',
    'Unknown Address or Contract': '/unknown.png',
  };

  // SHORTEN ADDRESS (Helper function)
  const shortenAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getAddressName = (address) => {
    let name = '';
    let imageSrc = addressImages['Unknown Address or Contract']; // Default image

    if (address === '0x7424C334EC67DB47768189696813248bf1a16675') {
      name = 'Bera Outlaws';
      imageSrc = addressImages['Bera outlaws'];

    } else if (address === '0x4Ae3985e45784CB73e1886AC603B5FEed4F08a05') {
      name = 'Bera Dwellers';
      imageSrc = addressImages['beradwellers'];

    } else if (address === '0x46B4b78d1Cd660819C934e5456363A359fde43f4') {
      name = 'Beramonium';
      imageSrc = addressImages['beramonium'];

    } else if (address === '?????') {
      name = 'Unknown Address or Contract';
    } else {
      
      
      name = shortenAddress(address);
    }

    return { name, imageSrc };
  };

  // Handle cancel duel functionality
  const handleCancelDuel = async (duelId) => {
    setLoading(true);
    
    try {
      await checkAndSwitchNetwork();
      await cancelDuel(duelId);  // Make sure this is correctly interacting with your API or contract

    }  finally {
      setLoading(false);
    }
  };

  // Filter duels to only show those where the connected address is the creator
  const filteredDuels = duelDetails?.filter((duel) => duel?.creator === address) || [];

  // Filter activeDuelIds to only include the duel IDs where the connected address is the creator
  const filteredDuelIds = activeDuelIds?.filter((duelId, index) => {
    const duel = duelDetails?.[index];
    return duel?.creator === address;
  }) || [];

  return (
    <div className={style.createDuelContainer}>
      <h2 className={style.canceltitle}>Active Duels</h2>
      {filteredDuels.length > 0 ? (
        filteredDuels.map((duel, index) => {
          const { name: contractName, imageSrc: contractImage } = getAddressName(duel.nftContractAddress); // Get contract name and image
          const duelId = filteredDuelIds[index];
          return (
            <div key={`${duel.duelId}-${index}`} className={style.duelCard}> {/* Combined key */}
              <div className={style.cancelcontainer}>
                <div className={style.addressWithImage}>
                  <img src={contractImage} alt={contractName} className={style.addressImage} />
                  <span className={style.canceltitle}>
                    NFT: {contractName} ({duel.nftId})
                  </span>
                </div>
                <p className={style.message}>
                  ID: {duelId}
                </p> 
                <p className={style.message}>
                  {duel.message.length > 15 ? `${duel.message.slice(0, 15)}...` : duel.message}
                </p>

                {/* Cancel Duel Button */}
                <button
                  onClick={() => handleCancelDuel(duelId)}  
                  disabled={loading}
                  className={style.cancelButton}
                >
                  {loading ? 'Cancelling...' : 'Cancel Duel'}
                </button>
              </div>
            </div>
          );
        })
      ) : (
        <p>No active duels</p>
      )}
    </div>
  );
};

export default CancelDuel;
