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

  const [selectedDuel, setSelectedDuel] = useState(null);
  const duelRef = useRef(null);
  const [animatedDuels, setAnimatedDuels] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [messageVisible, setMessageVisible] = useState(true);
  const [searchQuery, setSearchQuery] = useState(''); // State for search input

  const handleHistoryTabClick = useCallback(() => {
    setActiveTab('history');
    fetchDuelHistory(1);
  }, [fetchDuelHistory]);

  const handleActiveTabClick = useCallback(() => {
    setActiveTab('active');
    fetchDuelData();
  }, [fetchDuelData]);

  const handleDuelClick = (duelId, nftContractAddress, creatorAddress) => {
    if (address === creatorAddress) {
      setErrorMessage('You cannot challenge your own duel!');
      setMessageVisible(true);

      // Hide the message after 3 seconds
      setTimeout(() => {
        setMessageVisible(false);
      }, 3000);

      return;
    }

    setSelectedDuel({ duelId, nftContractAddress });
  };

  const shortenAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const addressImages = {
    'Bera outlaws': '/beraoutlaws.jpg',
    'beradwellers': '/beradwellers.jpg',
    'beramonium': '/beramonium.png',
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
      imageSrc = addressImages['beradwellers'];
    } else if (address === '0x46B4b78d1Cd660819C934e5456363A359fde43f4') {
      name = 'Beramonium Bartiosis';
      imageSrc = addressImages['beramonium'];
    } else if (address === '?????') {
      name = 'Unknown Address or Contract';
    } else {
      name = shortenAddress(address);
    }
    
    return { name, imageSrc };
  };

  const groupedDuels = useMemo(() => {
    return duelDetails.reduce((acc, duel, index) => {
      const contractAddress = duel?.nftContractAddress || 'Unknown';
      if (!acc[contractAddress]) {
        acc[contractAddress] = [];
      }
      acc[contractAddress].push({ ...duel, duelId: activeDuelIds[index] });
      return acc;
    }, {});
  }, [duelDetails, activeDuelIds]);

  const filteredDuelHistory = useMemo(() => {
    const sortedDuels = [...duelHistory].sort((a, b) => b.duelId - a.duelId);
    const filtered = sortedDuels.filter((duel) => duel.winner === address || duel.loser === address);
    return filtered.slice(0, 25); // Limit to the most recent 25 2 duels
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

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('Contract address copied to clipboard!');
    }).catch(err => {
      console.error('Failed to copy: ', err);
    });
  };

  // Filter groupedDuels fruom on search query
  const filteredGroupedDuels = useMemo(() => {
    if (!searchQuery) return groupedDuels;
  
    return Object.keys(groupedDuels).reduce((acc, contractAddress) => {
      const { name } = getAddressName(contractAddress);  // Get the address name
      if (
        contractAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
        name.toLowerCase().includes(searchQuery.toLowerCase())  // Include name in search
      ) {
        acc[contractAddress] = groupedDuels[contractAddress];
      }
      return acc;
    }, {});
  }, [groupedDuels, searchQuery]);

  return (
    <div className={style.wrapper}>
      {errorMessage && (
        <div className={`${style.errorMessage} ${messageVisible ? '' : style.hidden}`}>
          {errorMessage}
        </div>
      )}

      <div className={style.pageHeaderContainer}>
        <div className={style.pageHeader}>
          <h2
            className={`${style.pageTitle} ${activeTab === 'active' ? style.pagetitlesecond : ''}`}
            onClick={handleActiveTabClick}
          >
            Active Duels
          </h2>

          <h2
            className={`${style.pageTitle} ${activeTab === 'history' ? style.pagetitlesecond : ''}`}
            onClick={handleHistoryTabClick}
          >
            My Duel History
          </h2>
        </div>
      </div>

      {/* Search BaR */}
      {activeTab === 'active' && (
        <div className={style.searchContainer}>
          <input
            type="text"
            placeholder="NFT contract address or name"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={style.searchInput}
          />
        </div>
      )}

      {!address && (
        <div className={style.noDuels}>
          <p>Please connect wallet to access the DApp</p>
        </div>
      )}

      {activeTab === 'active' ? (
        Object.keys(filteredGroupedDuels).length > 0 ? (
          Object.entries(filteredGroupedDuels)
            .sort(([a], [b]) => {
              const priorityAddresses = [
                '0x7424C334EC67DB47768189696813248bf1a16675',
                '0x4Ae3985e45784CB73e1886AC603B5FEed4F08a05'
              ];
              const aPriority = priorityAddresses.includes(a) ? 1 : 0;
              const bPriority = priorityAddresses.includes(b) ? 1 : 0;
              return bPriority - aPriority;
            })
            .map(([contractAddress, duels]) => {
              const { name: addressName, imageSrc } = getAddressName(contractAddress);
              return (
                <div key={contractAddress} className={style.contractGroup}>
                  <h3 
                    className={style.contractAddress}
                    onClick={() => copyToClipboard(contractAddress)}
                  >
                    {addressName}
                  </h3>

                  <div className={style.duelContainer}>
                    {duels.map((duel, index) => (
                      <div 
                        key={`${contractAddress}-${duel.duelId}`} 
                        className={style.duelCard}
                        style={{ animationDelay: `${index * 0.1}s` }}
                        onClick={() => handleDuelClick(
                          duel.duelId, 
                          duel.nftContractAddress, 
                          duel.creator)}
                      >
                        <div className={style.duelHeader}>
                          <div className={style.addressWithImage}>
                            <img
                              src={imageSrc}
                              alt={addressName}
                              className={style.addressImage}
                            />
                          </div>
                          <span className={style.nftIdduel}>
                               <div className={style.tokenID}>({duel.nftId})</div> 
                               <div className={style.ID}>ID</div>
                               <div className={style.duelID}>{duel.duelId} </div>
                          </span>
                          <span className={style.nftIdduel}>
                    
                          </span>
                     
                          <span className={style.creator}>
                            {getAddressName(duel.creator).name}
                          </span>
                        </div>
                        <div className={style.duelContent}>
                          <p className={style.messageduel}>
                            {duel.message.length > 15
                              ? `${duel.message.slice(0, 15)}...`
                              : duel.message}
                          </p>
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

    <div className={style.duelContainer}>
      Showing the latest 25 duels
      {filteredDuelHistory.length > 0 ? (
        <>
    

          {/* HISTORY */}
          {filteredDuelHistory
            .sort((a, b) => b.duelId - a.duelId)
            .map((duel, index) => {
              const { name: contractName, imageSrc: contractImage } = getAddressName(
                duel.nftContractAddress
              );

              const isWinner = duel.winner === address;
              const isLoser = duel.loser === address;

              let displayText = '';
              let displayAddress = '';
              let displayColor = '';

              if (isWinner) {
                displayText = ' ( You Won) ';
                displayAddress = duel.winner;
                displayColor = '#09ff00';
              } else if (isLoser) {
                displayText = '( You Lost)';
                displayAddress = duel.winner;
                displayColor = '#ff0000';
              }

              return (
                <div
                  key={duel.duelId}
                  className={style.duelCardHistory}
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

                    <span className={style.creator}>
                      {duel.winnerTokenId} {duel.loserTokenId}
                    </span>
                  </div>

                  <div className={style.duelContent}>
                    <div className={style.message}>
                      <div
                        className={style.winnerLoser}
                        style={{ color: displayColor }}
                      >
                        {shortenAddress(displayAddress)}
                      </div>
                      <div className={style.resultText}>
                        {displayText}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
        </>
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