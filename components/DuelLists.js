import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import style from '../styles/DuelLists.module.css';
import { useAppContext } from '../context/context';
import ChallengeDuel from './ChallengeDuel'; // Import ChallengeDuel component
import modal from '../styles/Home.module.css';

const Duel = () => {
  const [activeTab, setActiveTab] = useState('active');
  const { 
    activeDuelIds, 
    duelDetails, 
    duelHistory, 
    fetchDuelHistory, 
    address,
    fetchDuelData, 
  } = useAppContext();
  const hasFetched = useRef(false);
  const [selectedDuel, setSelectedDuel] = useState(null);
  const duelRef = useRef(null);
  const [animatedDuels, setAnimatedDuels] = useState([]);

  const handleHistoryTabClick = useCallback(() => {
    setActiveTab('history');
    fetchDuelHistory(1);
  }, [fetchDuelHistory]);

  const handleActiveTabClick = useCallback(() => {
    setActiveTab('active');
    fetchDuelData();
  }, [fetchDuelData]);

  const handleDuelClick = (duelId, nftContractAddress) => {
    setSelectedDuel({ duelId, nftContractAddress });
  };

  const shortenAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const addressImages = {
    'Bera outlaws': '/beraoutlaws.jpg',
    'NFT B': '/beradwellers.jpg',
    'Unknown Address or Contract': '/unknown.png',
  };

  const getAddressName = (address) => {
    let name = '';
    let imageSrc = addressImages['Unknown Address or Contract'];

    if (address === '0x7424C334EC67DB47768189696813248bf1a16675') {
      name = 'Bera Outlaws';
      imageSrc = addressImages['Bera outlaws'];
    } else if (address === '0x4Ae3985e45784CB73e1886AC603B5FEed4F08a05') {
      name = 'Bera Dwellers';
      imageSrc = addressImages['NFT B'];
    } else if (address === '?????') {
      name = 'Unknown Address or Contract';
    } else {
      name = shortenAddress(address);
    }

    return { name, imageSrc };
  };

  const groupedDuels = useMemo(() => {
    if (!hasFetched.current) {
  
      hasFetched.current = true; // Mark that the log has been shown at least once
    }
    return duelDetails.reduce((acc, duel, index) => {
      const contractAddress = duel?.nftContractAddress || 'Unknown';
      if (!acc[contractAddress]) {
        acc[contractAddress] = [];
      }
      acc[contractAddress].push({ ...duel, duelId: activeDuelIds[index] });
      return acc;
    }, {});
  }, [duelDetails, activeDuelIds]);

// Memoize filteredDuelHistory with a limit of 10 items
const filteredDuelHistory = useMemo(() => {
  const sortedDuels = [...duelHistory].sort((a, b) => b.duelId - a.duelId);
  const filtered = sortedDuels.filter((duel) => duel.winner === address || duel.loser === address);
  return filtered.slice(0, 10); // Limit to the most recent 10 duels
}, [duelHistory, address]);

  const newAnimatedDuels = useMemo(() => {
    return activeTab === 'active' 
      ? Object.values(groupedDuels).flat().map((duel, index) => ({ ...duel, id: index }))
      : filteredDuelHistory.map((duel, index) => ({ ...duel, id: index }));
  }, [groupedDuels, filteredDuelHistory, activeTab]);

  useEffect(() => {
    if (newAnimatedDuels.length !== animatedDuels.length || 
        !newAnimatedDuels.every((duel, index) => duel.id === animatedDuels[index]?.id)) {
      setAnimatedDuels(newAnimatedDuels);
    }
  }, [newAnimatedDuels, animatedDuels]);

  const handleModalClick = (event) => {
    if (event.target === duelRef.current) {
      setSelectedDuel(null);
    }
  };

  const handleInsideClick = (event) => {
    event.stopPropagation();
  };

  const handleChallengeComplete = () => {
    setSelectedDuel(null);
  };

  return (
    <div className={style.wrapper}>
      <div className={style.pageHeaderContainer}>
        <div className={style.pageHeader}>
          <h2
            className={`${style.pageTitle} ${activeTab === 'active' ? style.activeTab : ''}`}
            onClick={handleActiveTabClick}
          >
            Active Duels
          </h2>

          <h2
            className={`${style.pageTitle} ${activeTab === 'history' ? style.activeTab : ''}`}
            onClick={handleHistoryTabClick}
          >
            My Duel History
          </h2>
        </div>
      </div>

      {!address && (
        <div className={style.noDuels}>
          <p>Please connect wallet to access the DApp</p>
        </div>
      )}

      {activeTab === 'active' ? (
        Object.keys(groupedDuels).length > 0 ? (
          Object.entries(groupedDuels).map(([contractAddress, duels]) => {
            const { name: addressName, imageSrc } = getAddressName(contractAddress);
            return (
              <div key={contractAddress} className={style.contractGroup}>
                <div className={style.duelContainer}>
                  {duels.map((duel, index) => (
                    <div 
                      key={`${contractAddress}-${duel.duelId}`} 
                      className={style.duelCard}
                      style={{ animationDelay: `${index * 0.1}s` }}
                      onClick={() => handleDuelClick(duel.duelId, duel.nftContractAddress)}
                    >
                      <div className={style.duelHeader}>
                        <div className={style.addressWithImage}>
                          <img
                            src={imageSrc}
                            alt={addressName}
                            className={style.addressImage}
                          />
                          <span className={style.nftId}>
                            {addressName}
                          </span>
                        </div>
                        <span className={style.nftId}>
                          {duel.nftId}
                        </span>
                        <span className={style.creator}>
                          @{getAddressName(duel.creator).name}
                        </span>
                      </div>
                      <div className={style.duelContent}>
                        <p className={style.message}>
                          {duel.message.length > 55
                            ? `${duel.message.slice(0, 55)}...`
                            : duel.message}
                        </p>
                      </div>
                      <div className={style.swordSymbol}>
                        ⚔︎
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        ) : (
          <p className={style.noDuels}>No active duels</p>
        )
      ) : (
        <div className={style.wrapper}>
          {filteredDuelHistory.length > 0 ? (
            filteredDuelHistory
              .sort((a, b) => b.duelId - a.duelId)
              .map((duel, index) => {
                const { name: contractName, imageSrc: contractImage } = getAddressName(
                  duel.nftContractAddress
                );
        
                return (
                  <div 
                    key={duel.duelId} 
                    className={style.duelCard}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className={style.duelHeader}>
                      <div className={style.addressWithImage}>
                        <img
                          src={contractImage}
                          alt={contractName}
                          className={style.addressImage}
                        />
                        <span className={style.nftId}>
                          {contractName}
                        </span>
                      </div>
        
                      <span className={style.nftId}>
                        {duel.winnerTokenId}
                      </span>
        
                      <span className={style.nftId}>
                        {duel.loserTokenId}
                      </span>
                    </div>
                    <div className={style.duelContent}>
                      <div className={style.message}>
                        <div className={style.winner}>
                          {getAddressName(duel.winner).name}
                        </div>{' '}
                        won against{' '}
                        <div className={style.loser}>
                          {getAddressName(duel.loser).name}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
          ) : (
            <p className={style.noDuels}>No duel history available</p>
          )}
        </div>
      )}

      {selectedDuel && (
        <div
          className={modal.modalOverlay}
          ref={duelRef}
          onClick={handleModalClick}
        >
          <div onClick={handleInsideClick}>
            <ChallengeDuel 
              selectedDuel={selectedDuel} 
              onComplete={handleChallengeComplete}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Duel;
