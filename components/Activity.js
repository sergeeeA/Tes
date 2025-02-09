import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useAppContext } from '../context/context';
import style from '../styles/Activity.module.css';

const Activity = () => {
  const { duelHistory, fetchDuelHistory, address } = useAppContext(); // Removed setDuelHistory
  const [loading, setLoading] = useState(false);

  const fetchAndUpdateDuelHistory = useCallback(async () => {
    setLoading(true);
  
    try {
      await fetchDuelHistory(1); // Fetch duel history without updating it
    }  finally {
      setLoading(false);
    }
  }, [fetchDuelHistory]);

  useEffect(() => {
    let isMounted = true;
  
    const fetchData = async () => {
      if (!isMounted) return;
      await fetchAndUpdateDuelHistory(); 
    };
  
   //(5 seconds)
    const intervalId = setInterval(fetchData, 10000);
    return () => {
      isMounted = false;
      clearInterval(intervalId); 
    };
  }, [fetchAndUpdateDuelHistory]);
  
  
  

  // Truncation function
  const truncateAddress = (address) => {
    return address ? `${address.slice(0, 6)}...${address.slice(-4)}` : '';
  };

  // Sort duelHistory by duelId in descending order and get the recent duels
  const recentDuels = useMemo(() => {
    return [...(duelHistory || [])].sort((a, b) => b.duelId - a.duelId).slice(0, 10);
  }, [duelHistory]);

  return (
    <div className={style.wrapper}>
      <div className={style.pageTitle}>
        RECENT DUELS
      </div>
      
      <div className={style.duelList}>
        {recentDuels.length > 0 ? (
          recentDuels.map((duel) => (
            <div key={duel.duelId} className={style.duelContainer}>
              <div className={style.duelItem}>
                <div className={style.duelDetails}>
                  <div className={style.winnerLoser}>
                    <p className={style.winner}>{truncateAddress(duel.winner)}</p>
                    <p className={style.loser}>{truncateAddress(duel.loser)}</p>
                  </div>
                  <strong >NFT</strong> {truncateAddress(duel.nftContractAddress)}
                  <span className={style.greyed}> {duel.winnerTokenId}  {duel.loserTokenId}</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className={style.greyed}>No recent duels yet</p>
        )}
      </div>
    </div>
  );
};

export default Activity;
