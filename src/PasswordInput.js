import React, { useState } from 'react';

const PasswordInput = ({password, setPassword}) => {
    const [showPassword, setShowPassword] = useState(false);

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <div className="password-input-container">
            <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="password-input"
            />
            <button
                type="button"
                onClick={togglePasswordVisibility}
                className="toggle-password-button"
            >
                {showPassword ? 'Hide' : 'Show'}
            </button>
        </div>
    );
};

export default PasswordInput;