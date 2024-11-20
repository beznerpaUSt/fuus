// MyHead.js
import React, { useState } from 'react';
import { ReactComponent as MyIcon } from './fuus.svg';
import FeatureRequestForm from './FeatureRequestForm'; // Import the FeatureRequestForm component

const MyHead = () => {
  const [showPopup, setShowPopup] = useState(false); // State to track popup visibility
  const [showKickingFoot, setShowKickingFoot] = useState(false); // State to track kicking foot visibility

  const handleButtonClick = () => {
    setShowPopup(true); // Show the popup when the button is clicked
  };

  const handlePopupClose = () => {
    setShowPopup(false); // Hide the popup when the close button is clicked
  };

  const handleIconClick = () => {
    setShowKickingFoot(true); // Show the kicking foot animation
    setTimeout(() => {
      window.location.reload(); // Reload the page after 2 seconds
    }, 2000);
  };

  return (
    <div>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        marginBottom: '20px', 
        backgroundColor: '#004191', 
        padding: '10px',
        border: 'none',
        borderRadius: '5px',
        }}>

        <div style={{ display: 'flex'}}> 
          <div onClick={handleIconClick} style={{ cursor: 'pointer' }}  >
            <MyIcon style={{ width: '50px', height: '50px', marginRight: '25px' }} />
          </div>
          <h1 style={{ margin: 0, color: 'white', fontSize: '32px' }}>
            <span style={{ fontWeight: 'bold', fontSize: '36px' }}>F</span>
            <span style={{ fontSize: '24px' }}>ile </span>
            <span style={{ fontWeight: 'bold', fontSize: '36px' }}>U</span>
            <span style={{ fontSize: '24px' }}>pload </span>
            <span style={{ fontWeight: 'bold', fontSize: '36px' }}>U</span>
            <span style={{ fontSize: '24px' }}>niversity of </span>
            <span style={{ fontWeight: 'bold', fontSize: '36px' }}>S</span>
            <span style={{ fontSize: '24px' }}>tuttgart</span>
          </h1>
        </div>
        <button style={{
          padding: '15px 30px',
          fontSize: '18px',
          backgroundColor: '#fff',
          color: '#004191',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          fontWeight: 'bold',
          transition: 'background-color 0.3s',
        }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#D8DADB'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fff'}
          onClick={handleButtonClick} // Show popup on button click
        >
          Feature Request
        </button>
      </div>

      {/* Popup Component */}
      {showPopup && (
        <FeatureRequestForm onClose={handlePopupClose} /> // Pass the close function as a prop
      )}

      {/* Kicking Foot Animation */}
      {showKickingFoot && (
        <div className="kicking-foot-container" style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 1000,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          borderRadius: '10px',
          padding: '20px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          width: '600px', // Set a fixed width
          height: '600px', // Set a fixed height
        }}>
          <MyIcon className="kicking-foot" style={{ width: '600px', height: '600px' }} />
        </div>
      )}

      <style>
        {`
          .kicking-foot-container {
            display: flex;
            justify-content: center;
            align-items: center;
            /* Removed height: 100vh to fit the SVG */
          }


          .kicking-foot {
            width: 100px; /* Adjust size as needed */
            animation: kick 0.5s infinite alternate; /* Kick animation */
          }

          @keyframes kick {
            0% {
              transform: rotate(0deg); /* Starting position */
            }
            100% {
              transform: rotate(30deg); /* Kicking position */
            }
          }
        `}
      </style>
    </div>
  );
};

export default MyHead;