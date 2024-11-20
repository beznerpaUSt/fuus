// src/config.js

const config = {
    // Base URL for the API
    apiBaseUrl: process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000',
    frontendBaseUrl: process.env.REACT_APP_FRONTEND_BASE_URL || 'http://localhost:3000',
    // You can add more configurations as needed
  };
  
  export default config;