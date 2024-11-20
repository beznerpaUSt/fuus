// FeatureRequestForm.js
import React, { useState } from 'react';
import emailjs from 'emailjs-com'; // Import EmailJS

const FeatureRequestForm = ({ onClose }) => {
  const [featureRequest, setFeatureRequest] = useState(''); // State to store user input
  const [userName, setUserName] = useState(''); 

  const handleFeatureRequestChange = (event) => {
    setFeatureRequest(event.target.value); // Update the feature request state when the user types
  };

  const handleFeatureRequestSubmit = (event) => {
    event.preventDefault(); // Prevent default form submission

    const templateParams = {
      from_name: userName, // You can replace this with the user's name or email
      to_name: 'bezner@inue.uni-stuttgart.de', // Replace with the recipient's name or email
      message: featureRequest, // The feature request text
    };

    emailjs.send('service_dm0gnar', 'template_j8ukw2g', templateParams, 'StpPDTmcFfBhJWFHo')
      .then((response) => {
        console.log('Email sent successfully!', response.status, response.text);
        alert(`Feature request sent to bezner@inue.uni-stuttgart.de:\n ${featureRequest}`);
        setFeatureRequest(''); // Reset the feature request state
        onClose(); // Hide the popup after submission
      })
      .catch((error) => {
        console.error('Failed to send email.', error);
        alert('Failed to send feature request. Please try again later.');
      });
  };

  return (
    <div style={{
      position: 'fixed',
      top: '0',
      left: '0',
      right: '0',
      bottom: '0',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '5px',
        width: '400px',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
      }}>
        <h2 style={{ textAlign: 'center' }}>Feature Request</h2>
        <form onSubmit={handleFeatureRequestSubmit}>
          {/* Username Input Field */}
          <div style={{ marginBottom: '10px' }}>
            <label>
              Your Name:
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)} // Update user name state
                placeholder="Enter your name..."
                required
                style={{
                  width: 'calc(100% - 0px)', // Adjust width to account for padding
                  padding: '10px',
                  marginTop: '5px',
                  boxSizing: 'border-box', // Ensure padding is included in width
                }}
              />
            </label>
          </div>
          
          {/* Feature Request Textarea */}
          <div style={{ marginBottom: '10px' }}>
            <label>
              Feature Request:
              <textarea
                value={featureRequest}
                onChange={handleFeatureRequestChange}
                placeholder="Enter your feature request here..."
                rows="4"
                required
                style={{
                  width: 'calc(100% - 0px)', // Adjust width to account for padding
                  padding: '10px',
                  marginTop: '5px',
                  boxSizing: 'border-box', // Ensure padding is included in width
                  resize: 'none', // Prevent resizing
                }}
              />
            </label>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <button type="button" onClick={onClose} style={{
              padding: '10px 15px',
              backgroundColor: '#323232',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
            }}>
              Close
            </button>
            <button type="submit" style={{
              padding: '10px 15px',
              backgroundColor: '#004191',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
            }}>
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FeatureRequestForm;