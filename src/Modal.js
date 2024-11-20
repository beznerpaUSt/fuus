import React, { useState, useEffect, useRef } from 'react';

const Modal = ({ isOpen, onClose, onSubmit, headerIn }) => {
    const [label, setLabel] = useState('');
    const [k, setK] = useState('');
    const [n, setN] = useState('');
    const [error, setError] = useState('');
    const [header, setHeader] = useState(headerIn); // State to hold the header
    const [selectedValues, setSelectedValues] = useState(["", "", ""]); // State to hold selected values for three dropdowns
    const [selectedIndices, setSelectedIndices] = useState([]); // State to hold the indices of selected values

    // Effect to set header after a short delay
    useEffect(() => {
        const timer = setTimeout(() => {
            if (headerIn && headerIn.length > 0) {
                setHeader(headerIn); // Set header to headerIn after delay
            }
        }, 1000); // Adjust the delay as needed (1000ms = 1 second)

        return () => clearTimeout(timer); // Cleanup the timer on unmount
    }, [headerIn]);

    const handleSelectChange = (index, value) => {
        const newSelectedValues = [...selectedValues];
        newSelectedValues[index] = value; // Update the selected value at the specified index
        setSelectedValues(newSelectedValues); // Update selected values
    };

    //const containerRef = useRef(null);
    //const leftBoxes = useRef(null);

    //const [boxPosition, setBoxPosition] = useState({ x: 0, y: 0 }); // State for clicked box posi
    //const [selectedIndex, setSelectedIndex] = useState(null);
    //const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    // Update mouse position relative to the container
    /*const handleMouseMove = (event) => {
        if (containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            setMousePosition({
                x: event.clientX - rect.left, // Mouse position relative to the container
                y: event.clientY - rect.top,
            });
        }
    };*/

    /*// Add event listener for mouse move
    useEffect(() => {
        window.addEventListener('mousemove', handleMouseMove);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, []);


    const handleBoxClick = (index) => {
        setSelectedIndex(index);
        // Get the clicked box element
        const boxElement = leftBoxes.current.children[index];
        if (boxElement && containerRef.current) {
            const rectContainer = containerRef.current.getBoundingClientRect();
            const rect = boxElement.getBoundingClientRect();
            const position = {
                x: rect.left + rect.width-rectContainer.left, // Right edge of the box
                y: rect.top-rectContainer.top,                // Top edge of the box
            };
            setBoxPosition(position); // Update state with the box position
            console.log('Clicked Box Position:', position);
        }
    };*/

    //console.warn(header);
    const handleSubmit = () => {
        // Validate K and N before submission
        const kValue = validateAndCompute(k, 'K');
        const nValue = validateAndCompute(n, 'N');
    
        // Check if there was an error in validation
        if (error) {
            return; // If there's an error, do not proceed with submission
        }
    
        // Prepare submission object
        const submissionData = { label };
    
        // Check if K and N are valid before submission
        if (kValue === undefined) {
            setError('K must be a valid integer or expression.');
            return; // Prevent submission if K is invalid
        }
    
        if (nValue === undefined) {
            setError('N must be a valid integer or expression.');
            return; // Prevent submission if N is invalid
        }
    
        // Check if N is greater than K if both are provided
        if (nValue <= kValue) {
            setError('N must be greater than K.');
            return; // Prevent submission if this condition is not met
        }
    
        // Update the header based on selected values
        const newHeader = [...header]; // Create a copy of the header
        selectedValues.forEach((value, index) => {
            if (value) {
                const selectedIndex = headerIn.indexOf(value);
                if (selectedIndex !== -1) {
                    // Replace header string based on the dropdown index
                    if (index === 0) {
                        newHeader[selectedIndex] = "FER";
                    } else if (index === 1) {
                        newHeader[selectedIndex] = "BER";
                    } else if (index === 2) {
                        newHeader[selectedIndex] = "SNRb";
                    }
                }
            }
        });
        
        // Update the header state
        setHeader(newHeader);
        submissionData.k = kValue;
        submissionData.n = nValue;
        submissionData.matchedHeader = newHeader.join(', ');
        console.warn(submissionData.matchedHeader);
        
        // Submit the validated values
        onSubmit(submissionData);
        resetFields(); // Reset input fields and close modal
    };

    const resetFields = () => {
        setLabel('');
        setK('');
        setN('');
        setError(''); // Clear any previous error messages
        setSelectedValues(["", "", ""]); // Reset selected values
        onClose(); // Close modal
    };

    const validateAndCompute = (value, variableName) => {
        // Validate the input value
        if (value.trim() === '') {
            setError(`${variableName} must be a valid integer or expression.`);
            return undefined; // Return undefined if the input is empty
        }

        const isInteger = /^-?\d+$/.test(value);
        const isExpression = /^[\d\s\+\-\*\/\(\)]+$/.test(value);

        if (isInteger) {
            return parseInt(value, 10);
        } else if (isExpression) {
            try {
                const result = eval(value);
                if (Number.isInteger(result)) {
                    return result;
                } else {
                    setError(`${variableName} must be an integer.`);
                }
            } catch {
                setError(`Invalid expression for ${variableName}.`);
            }
        } else {
            setError(`${variableName} must be an integer or a valid expression.`);
        }
    
        return undefined; // Return undefined if validation fails
    };
    
    // Function to send debug messages to the server
    const sendDebugMessage = (variableName, value) => {
        fetch('http://localhost:5000/api/debug', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                variableName: variableName,
                value: value,
            }),
        }).catch((err) => console.error('Error sending debug message:', err));
    };


    if (!isOpen) return null; // Don't render if not open

    return (
        <div style={modalStyles.overlay}>
            <div style={modalStyles.modal}>
            <h2 style={{ textAlign: 'center' }}>Enter Details</h2>
                <div style={modalStyles.inputContainer}>
                <textarea
                    type="text"
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    placeholder="Enter label e.g. LDPC DVBS-2 BP-8"
                    rows="2"
                    style={{
                        width: '100%',
                        padding: '5px',
                        boxSizing: 'border-box',
                        resize: 'none', // Disable resizing
                    }}
                />
                <input
                    type="text"
                    value={k}
                    onChange={(e) => {
                        setK(e.target.value);
                        setError(''); // Clear error when user types
                    }}
                    placeholder="Enter K"
                    style={{
                        width: '100%',
                        padding: '5px',
                        boxSizing: 'border-box',
                    }}
                />
                <input
                    type="text"
                    value={n}
                    onChange={(e) => {
                        setN(e.target.value);
                        setError(''); // Clear error when user types
                    }}
                    placeholder="Enter N"
                    style={{
                        width: '100%',
                        padding: '5px',
                        boxSizing: 'border-box',
                    }}
                />
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative', marginTop: '20px', marginBottom: '20px' }}>
                    {/* Left Curly Bracket */}
                    <div style={{ position: 'absolute', left: '-20px', fontSize: '24px', height: '100%', display: 'flex', alignItems: 'center' }}>
                        <div class="rotated-text--90" style={{ marginLeft: '0px', fontSize: '16px' }}>Your .csv header</div>
                    </div>
                    {/* Dropdown Menus */}
                    <div style={{ display: 'flex', flexDirection: 'column', marginRight: '50px' }}>
                        {selectedValues.map((value, index) => (
                            <select
                                key={index}
                                value={value}
                                onChange={(e) => handleSelectChange(index, e.target.value)}
                                style={{ 
                                    fontSize: '12px', 
                                    border: '1px solid black', 
                                    padding: '10px', 
                                    marginBottom: '5px',
                                    marginTop: '5px', 

                                    borderRadius: '4px', 
                                    width: '100px' 
                                }}>
                                <option value="" disabled>Select an option</option> {/* Placeholder option */}
                                {headerIn.map((headerItem, headerIndex) => (
                                    <option key={headerIndex} value={headerItem}>{headerItem}</option>
                                ))}
                            </select>
                        ))}
                    </div>
                    {/* Header Boxes 
                    <div ref={leftBoxes} style={{ display: 'flex', flexDirection: 'column', marginRight: '50px' }}>
                        {header.map((header, index) => (
                            <div
                                key={index}
                                onClick={() => handleBoxClick(index)}
                                style={{ 
                                    fontSize: '12px', 
                                    border: '1px solid black', 
                                    padding: '10px', 
                                    marginBottom: '10px', 
                                    borderRadius: '4px', 
                                    width: '100px', 
                                    textAlign: 'center' }}>
                                {header}
                            </div>
                        ))}
                    </div>*/}

                    {/* Right Curly Bracket */}
                    <div style={{ position: 'absolute', right: '-20px', fontSize: '24px', height: '100%', display: 'flex', alignItems: 'center' }}>
                        <div class="rotated-text-90" style={{ marginRight: '5px', fontSize: '16px' }}>Extracted data</div>
                    </div>

                    {/* Render fixed boxes on the right */}
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <div style={{ fontSize: '12px', border: '1px solid black', padding: '10px', marginBottom: '10px', borderRadius: '4px', width: '100px', textAlign: 'center' }}>FER</div>
                        <div style={{ fontSize: '12px', border: '1px solid black', padding: '10px', marginBottom: '10px', borderRadius: '4px', width: '100px', textAlign: 'center' }}>BER</div>
                        <div style={{ fontSize: '12px', border: '1px solid black', padding: '10px', borderRadius: '4px', width: '100px', textAlign: 'center' }}>SNR(Eb/N0)</div>
                    </div>
                            
                    {/* Line Drawing */}
                    {/* {selectedIndex !== null && (
                            <svg style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}>
                                <line
                                    x1 ={boxPosition.x} // Center x position    
                                    y1={boxPosition.y} // Example: position based on index
                                    x2={mousePosition.x}
                                    y2={mousePosition.y}
                                    stroke="black"
                                    strokeWidth="2"
                                />
                            </svg>
                        )}*/}
                </div>

                {error && <p style={{ color: 'red' }}>{error}</p>} {/* Display error message */}
                <div style={modalStyles.buttonContainer}>
                    <button style={{    
                        padding: '10px 15px',
                        backgroundColor: '#323232',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        }}
                        onClick={onClose}>Cancel</button>
                    <button style={{
                        padding: '10px 15px',
                        backgroundColor: '#004191',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        }} 
                        onClick={handleSubmit}>Submit</button>
                    
                </div>
            </div>
        </div>
    );
};

const modalStyles = {
    overlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
    modal: {
        background: '#fff',
        padding: '20px', // Adjusted padding for consistency
        borderRadius: '8px',
        boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)', // Slightly softer shadow
        maxWidth: '400px',
        width: '90%', // Increased width for better responsiveness
    },
    inputContainer: {
        display: 'flex',
        flexDirection: 'column', // Stack inputs vertically
        gap: '15px', // Increased space between inputs for better separation
        marginBottom: '20px', // Space below the input section
    },
    input: {
        padding: '12px', // Increased padding for a more comfortable feel
        border: '1px solid #ccc',
        borderRadius: '5px',
        fontSize: '16px',
    },
    buttonContainer: {
        display: 'flex',
        justifyContent: 'space-between',
    },
};

export default Modal;