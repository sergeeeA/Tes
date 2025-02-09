import React, { useState, useEffect } from 'react';

import style from '../styles/CreateDuel.module.css';

const Guide = () => {


  return (
    <div className={style.createDuelContainer}>
    <h2 className={style.canceltitle}>Challenge Duel</h2>
    <div className={style.cancelcontainer}>
        1.) Click on any boxes that contains the NFT
        <p> (follow the yellow arrow)</p>
        <h2 className={style.canceltitle}>
        <img
            src="../guidefirst.png" // Adjust the path based on where your PNG is located
            alt="Logo"
            draggable="false"
            style={{
  
                width: '150px',
                backgroundColor: '#f8f8f8',
                margin:'25px',
  
              }} 
       // Optional: Apply a CSS class for custom styling
          />
          </h2>
        </div>

        <div className={style.cancelcontainer}>
        2.) A Pop-up modal will appear, click on any NFT TOKEN ID you want to wager.
       <p> (If you do not have any NFT, the NFT TOKEN ID options are empty)</p>
        <h2 className={style.canceltitle}>
        <img
            src="../guidesecond.png" // Adjust the path based on where your PNG is located
            alt="Logo"
            draggable="false"
            style={{
  
                width: '200px',
                backgroundColor: '#f8f8f8',
                margin:'25px',
  
              }} 
       // Optional: Apply a CSS class for custom styling
          />
          </h2>
        </div>

        <div className={style.cancelcontainer}>
        3.) Clicking on an NFT Token ID automatically wagers your NFT.
        <p>This will send an Approval Request followed by a Deposit Request to your NFT.</p>
        <h2 className={style.canceltitle}>

          </h2>
        </div>
        <div className={style.cancelcontainer}>
        Please duel responsibly and avoid wagering high-value NFTs.
        <p>There are 50/50 odds of winning, with equal chances between you and your opponent.</p>
        </div>
        
    </div>
  );
};

export default Guide;