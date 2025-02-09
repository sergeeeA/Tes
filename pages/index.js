import { useState } from 'react';
import DuelLists from '../components/DuelLists';
import WalletConnectBtn from '../components/WalletConnectBtn';

import Guide from '../components/Guide';
import CreateDuel from '../components/CreateDuel';
import CancelDuel from '../components/CancelDuel';

import Activity from '../components/Activity';
import homeStyle from '../styles/Home.module.css';

export default function Home() {
  const [showCreateDuel, setShowCreateDuel] = useState(false);
  const [showCancelDuel, setShowCancelDuel] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  // Callback to close the CreateDuel modal
  const handleCreateDuelComplete = () => {
    setShowCreateDuel(false);
  };

  return (
    <div className={homeStyle.wrapper}>

      {/* Main content in the middle */}
      <div className={homeStyle.mainContent}>
      <div className={homeStyle.sideContainer}>
          <img
            src="../logo.png" // Adjust the path based on where your PNG is located
            alt="Logo"
            draggable="false"
            className={homeStyle.logoImage} // Optional: Apply a CSS class for custom styling
          />
        </div>
        <Activity />
        <div className={homeStyle.scrollableContent}>
          <DuelLists />
        </div>
      </div>

      {/* Right Wrapper */}
      <div className={homeStyle.rightWrapper}>
        <div className={homeStyle.sideContainer}>
          <WalletConnectBtn />
          <button
            className={homeStyle.Button}
            onClick={() => setShowGuide(true)}
          >
            Guide
          </button>
          <button
            className={homeStyle.createDuelButton}
            onClick={() => setShowCreateDuel(true)}
          >
            Create Duel
          </button>
          
          <button
            className={homeStyle.cancelDuelButton}
            onClick={() => setShowCancelDuel(true)}
          >
            Cancel Duel
          </button>
        </div>
      </div>

      {/* Modals */}
      {showGuide && (
        <div
          className={homeStyle.modalOverlay}
          onClick={() => setShowGuide(false)} // Close modal when overlay is clicked
        >
          <div
            className={homeStyle.modalContent}
            onClick={(e) => e.stopPropagation()} // Prevent clicks inside the modal from closing it
          >
            <Guide/>
            <button
              className={homeStyle.closeButton}
              onClick={() => setShowGuide(false)}
            >
              X
            </button>
          </div>
        </div>
      )}

      {showCreateDuel && (
        <div
          className={homeStyle.modalOverlay}
          onClick={() => setShowCreateDuel(false)} // Close modal when overlay is clicked
        >
          <div
            className={homeStyle.modalContent}
            onClick={(e) => e.stopPropagation()} // Prevent clicks inside the modal from closing it
          >
            <CreateDuel onComplete={handleCreateDuelComplete} /> {/* Pass the callback */}
            <button
              className={homeStyle.closeButton}
              onClick={() => setShowCreateDuel(false)}
            >
              X
            </button>
          </div>
        </div>
      )}

      {showCancelDuel && (
        <div
          className={homeStyle.modalOverlay}
          onClick={() => setShowCancelDuel(false)} // Close modal when overlay is clicked
        >
          <div
            className={homeStyle.modalContent}
            onClick={(e) => e.stopPropagation()} // Prevent clicks inside the modal from closing it
          >
            <CancelDuel />
            <button
              className={homeStyle.closeButton}
              onClick={() => setShowCancelDuel(false)}
            >
              X
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className={homeStyle.footer}>
        
 

        <button
          className={homeStyle.cancelDuelButtonMobile}
          onClick={() => setShowCancelDuel(true)}
        >
          Cancel Duel
        </button>
        <button
          className={homeStyle.createDuelButtonMobile}
          onClick={() => setShowCreateDuel(true)}
        >
          Create Duel
        </button>
   
        <WalletConnectBtn />
        <button
            className={homeStyle.ButtonMobile}
            onClick={() => setShowGuide(true)}
          >
            Guide
          </button>
      </div>
    </div>
  );
}