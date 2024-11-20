import React from 'react';
import { ReactComponent as MyIcon } from './fuus.svg'; // Import your SVG foot icon

const KickingFoot = () => {
  return (
    <div className="kicking-foot-container">
      <FootIcon className="kicking-foot" />
      <style>
        {`
          .kicking-foot-container {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh; /* Center vertically */
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
              transform: rotate(20deg); /* Kicking position */
            }
          }
        `}
      </style>
    </div>
  );
};

export default KickingFoot;