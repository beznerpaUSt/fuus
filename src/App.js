import React, { useEffect, useState } from 'react';
import PlotlyChart from './PlotlyChart'; // Ensure this path is correct
import axios from 'axios';
import MyHead from './myHead';
import Modal from './Modal';
import './App.css'; // Importing the CSS file
import FileManager from './FileManager';
import DownloadChart from './DownloadChart';
import PasswordInput from './PasswordInput';
import config from './config';

const App = () => {
    const [csvFiles, setCsvFiles] = useState([]);
    const [restorableFiles, setRestorableFiles] = useState([]);
    const [sortConfig, setSortConfig] = useState({ key: '', direction: 'ascending' });
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [isLoggedIn, setIsLoggedIn] = useState(false); // State to track login status
    const baseUrl = `${config.apiBaseUrl}/data/`; // Update this path to your actual CSV file location
    const [xMin, setXMin] = useState(0); // State for minimum x-axis limit
    const [xMax, setXMax] = useState(5); // State for maximum x-axis limit
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [headerSubmit, setHeaderSubmit] = useState([]); 
    const [selections, setSelections] = useState([]); // State to hold selections

    const isSelected = (file, yflag) => {
        //console.log('selections',selections)
        return selections.some(selection => 
            selection.file.filename === file.filename && selection.yflag === yflag
        );
    };

    /*const handleFileChange = (file,indx) => {
        if (selectedFiles.includes(file.filename)) {
            // If the file is already selected, remove it from selectedFiles
            setSelectedFiles(selectedFiles.filter(selected => selected !== file.filename));
            
            // Remove the corresponding metadata
            setSelectedMetadata(selectedMetadata.filter(selected => selected.filename !== file.filename));
        
            setSelectedYflags(selectedMetadata.filter(selected => selected.filename !== file.filename));
        } else {
            // If the file is not selected, add it to selectedFiles
            setSelectedFiles([...selectedFiles, file.filename]);
            
            // Add the corresponding metadata
            setSelectedMetadata([...selectedMetadata, file]);

            setSelectedYflags([...selectedYflags, indx]);
        }
    };*/

    const handleFileChange = (file, yflag) => {
        const existingSelectionIndex = selections.findIndex(selection => 
            selection.file.filename === file.filename && selection.yflag === yflag
        );
    
        if (existingSelectionIndex > -1) {
            // If the selection exists, remove it
            const newSelections = [...selections];
            newSelections.splice(existingSelectionIndex, 1); // Remove the selection
            setSelections(newSelections); // Update the selections state
        } else {
            // If the selection does not exist, add it
            setSelections([...selections, { file, yflag }]); // Add new selection
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(`${config.apiBaseUrl}/login`, 
                new URLSearchParams({
                    username,
                    password,
                }), 
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    withCredentials: true // Important: Include credentials (cookies)
                }
            );
    
            // If the request is successful, you can access the response data
            //console.log(response.data);
            setIsLoggedIn(true); // Set login status to true
            setMessage('Login successful!'); // Show success message
    
            // Optionally, you can fetch the list of files here after logging in
            fetchCsvFiles(); // Fetch files after successful login
        } catch (error) {
            // Handle error response
            if (error.response) {
                // The request was made and the server responded with a status code
                const errorMessage = error.response.data.error || 'Login failed'; // Extract error message
                setMessage(errorMessage); // Set error message
            } else {
                // Something happened in setting up the request that triggered an Error
                setMessage('An error occurred. Please try again.'); // Set general error message
            }
        }
    };

    const fetchCsvFiles = () => {
        //console.log(sortConfig);
        // Construct the API URL with the sortConfig parameter
        const url = `${config.apiBaseUrl}/api/files`; // Update this URL to your API endpoint
        fetch(url)
            .then(response => {
                // Check if the response is okay (status code 200-299)
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                console.log('Fetched data:', data);
    
                // Check if the data has an error property
                if (data.error) {
                    setCsvFiles([]); // Reset to empty if no files found
                } else {
                    // Create a copy of the array for sorting, only including files where render is true
                    let filteredData = data.filter(file => file.render === "true");
                    setCsvFiles(filteredData); // Set the fetched files if there is no error
                    let restData = data.filter(file => file.render === "false");
                    setRestorableFiles(restData); 
                }
            })
            .catch(error => {
                console.error('Error fetching the CSV files:', error);
            });
    };

    const handleUpload = async (event) => {
        event.preventDefault(); // Prevent default form submission
        const fileInput = event.target.elements.file; // Get the file input element
        const file = fileInput.files[0]; // Get the selected file

        if (file) {
            setSelectedFile(file); // Store the selected file
            setIsModalOpen(true); // Open the modal to enter the file name

            // Create a FileReader to read the CSV file
            const reader = new FileReader();
            
            reader.onload = (e) => {
                const text = e.target.result; // Get the file content
                const rows = text.split('\n'); // Split the content into rows
                
                if (rows.length > 0) {
                    const firstRow = rows[0].split(','); // Split the first row by comma
                    setHeaderSubmit(firstRow); // Update state with the first row as an array
                    //console.log(firstRow); // Log the first row for debugging
                } else {
                    setMessage('The file is empty.');
                }
            };

            reader.onerror = (error) => {
                console.error('Error reading the file:', error);
                setMessage('Error reading the file.');
            };

            // Read the file as text
            reader.readAsText(file);
        } else {
            setMessage('Please select a file to upload.');
        }
    };
    
    const handleModalSubmit = async ({ label, k, n ,matchedHeader}) => {
        if (selectedFile) {
            const reader = new FileReader();
            reader.onload = async (e) => {
                const csvContent = e.target.result; // Read the file content
                const rows = csvContent.split('\n'); // Split the content into rows

                // Replace the first row with matchedHeader
                //const matchedHeader = "Your New Header"; // Change this to your actual header string
                rows[0] = matchedHeader;

                // Join the rows back into a single CSV string
                const modifiedCsvContent = rows.join('\n');

                // Create a new Blob from the modified CSV content
                const blob = new Blob([modifiedCsvContent], { type: 'text/csv' });
                const newFile = new File([blob], selectedFile.name, { type: 'text/csv' });

                // Prepare FormData
                const formData = new FormData();
                formData.append('file', newFile); // Use the modified file
                formData.append('label', label);
                formData.append('k', k);
                formData.append('n', n);

                try {
                    const response = await axios.post(`${config.apiBaseUrl}/api/upload`, formData, {
                        withCredentials: true, // Include credentials for session management
                        headers: {
                            'Content-Type': 'multipart/form-data', // Set the content type to multipart/form-data
                        },
                    });

                    // If the request is successful, you can access the response data
                    console.log('File uploaded successfully:', response.data);
                    fetchCsvFiles(); // Refresh the file list after upload
                    setIsModalOpen(false); // Close the modal
                } catch (error) {
                    // Handle error response
                    if (error.response) {
                        const errorMessage = error.response.data.error || 'Upload failed';
                        console.error('Upload failed:', errorMessage);
                        setMessage(errorMessage); // Show error message
                    } else {
                        console.error('Error during file upload:', error);
                        setMessage('An unexpected error occurred during the upload.');
                    }
                }
            }
            reader.readAsText(selectedFile); // Read the file as text
        };
        
    };

    const handleLogout = () => {
        // Clear user data from state
        setIsLoggedIn(false);
        setUsername('');
        setPassword('');
        setMessage('You have logged out successfully.');
    
        // Optionally, you can also clear any tokens or session data here
    };

    const roundDivision = (k, n) => {
        // Return empty if k or n is undefined
        if (k === undefined || n === undefined) {
            return ''; // or return null; depending on your preference
        }
        // Check if n is not zero to avoid division by zero
        if (n === 0) {
            throw new Error("Division by zero is not allowed.");
        }
        // Perform the division and round to four decimal points
        const result = (k / n).toFixed(4);
        return parseFloat(result); // Convert back to a number
    };

    // Function to update the label on the server using Axios
    const updateLabelOnServer = async (filename, newLabel) => {
        try {
            const response = await axios.post(`${config.apiBaseUrl}/api/update-label`, {
                filename, // Ensure this variable is defined
                newLabel  // Ensure this variable is defined
            }, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json', // Ensure the content type is set to application/json
                },
            });
            console.log(response.data.message); // Notify success
        } catch (error) {
            if (error.response) {
                // The request was made and the server responded with a status code
                console.error('Error updating label:', error.response.data.error);
            } else if (error.request) {
                // The request was made but no response was received
                console.error('No response received:', error.request);
            } else {
                // Something happened in setting up the request that triggered an Error
                console.error('Error:', error.message);
            }
        }
        fetchCsvFiles(); // Refresh the file list after upload
    };

    const handleDelete = async (filename) => {
        try {
            const response = await axios.post(`${config.apiBaseUrl}/api/delete-file`, {
                filename
            }, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json',
                },
            });
    
            console.log(response.data.message); // Log success message
            // Optionally, you can update your state to reflect the change in the UI
            // For example, you might want to remove the file from the displayed list
        } catch (error) {
            console.error('Error deleting file:', error.response?.data?.error || error.message);
            // Handle error, e.g., show a notification to the user
        }
        fetchCsvFiles();
    };

    const sortFiles = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        let sortedFiles;
        if (key==='r_c'){
            sortedFiles = [...csvFiles].sort((a, b) => {
                // Calculate r_c for both files
                const a_rc = Number(roundDivision(a.k, a.n));
                const b_rc = Number(roundDivision(b.k, b.n));
                // Compare the calculated r_c values
                if (a_rc < b_rc) {
                    return direction === 'ascending' ? -1 : 1;
                }
                if (a_rc > b_rc) {
                    return direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        } 
        else if (key==='uploadDate') {
            sortedFiles = [...csvFiles].sort((a, b) => {
                const aValue = new Date(a[key]); // Convert to number
                const bValue = new Date(b[key]); // Convert to number
                //console.log(aValue,'<',bValue, '###',a[key],b[key])
                if (aValue < bValue) {
                    console.log(aValue,'<',bValue)
                    return direction === 'ascending' ? -1 : 1;
                }
                if (aValue > bValue) {
                    return direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }
        else if (key==='k' || key==='n'){
            sortedFiles = [...csvFiles].sort((a, b) => {
                const aValue = Number(a[key]); // Convert to number
                const bValue = Number(b[key]); // Convert to number

                if (aValue < bValue) {
                    return direction === 'ascending' ? -1 : 1;
                }
                if (aValue > bValue) {
                    return direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }
        else {
            sortedFiles = [...csvFiles].sort((a, b) => {
                if (a[key] < b[key]) {
                    //console.log(a[key],'<',b[key])
                    return direction === 'ascending' ? -1 : 1;
                }
                if (a[key] > b[key]) {
                    //console.log(a[key],'>',b[key])
                    return direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }
        setCsvFiles(sortedFiles);
        setSortConfig({ key, direction });
    };

    function formatDate(isoString) {
        const date = new Date(isoString);
        
        // Define options for formatting
        const options = {
            year: 'numeric',
            month: 'short', // You can use 'short' for abbreviated month names
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        };
        
        // Format the date
        return date.toLocaleString('en', options);
    }


    return (

        <div>
            <MyHead />
            {isLoggedIn ? (
                
                <>
                
                    {selections.length > 0 && (
                        <div>
                            <DownloadChart/>
                            <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                                <PlotlyChart 
                                selectedFiles={selections.map(selection => selection.file)} // Extract filenames
                                xMin={xMin} // Pass xMin to PlotlyChart
                                xMax={xMax} // Pass xMax to PlotlyChart 
                                baseUrl={baseUrl}
                                yFlag={selections.map(selection => selection.yflag)} // Extract yflags
                                />
                            </div>
                        </div>
                    )}
                    <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead className="table-header" style={{ position: 'sticky', top: 0, zIndex: 1 }}>
                                <tr>
                                    <th className="table-border">FER</th>
                                    <th className="table-border">BER</th>
                                    <th 
                                        className="table-border left-align" 
                                        style={{ cursor: 'pointer' }} 
                                        onClick={() => sortFiles('filename')}
                                    >
                                        Filename
                                    </th>
                                    <th 
                                        className="table-border" 
                                        style={{ cursor: 'pointer' }} 
                                        onClick={() => sortFiles('uploadDate')}
                                    >
                                        Upload Date
                                    </th>
                                    <th 
                                        className="table-border left-align label-column" // Add label-column class here
                                        style={{ cursor: 'pointer' }} 
                                        onClick={() => sortFiles('label')}
                                    >
                                        Label
                                    </th>
                                    <th 
                                        className="table-border" 
                                        style={{ cursor: 'pointer' }} 
                                        onClick={() => sortFiles('k')}
                                    >
                                        K
                                    </th>
                                    <th 
                                        className="table-border" 
                                        style={{ cursor: 'pointer' }} 
                                        onClick={() => sortFiles('n')}
                                    >
                                        N
                                    </th>
                                    <th 
                                        className="table-border" 
                                        style={{ cursor: 'pointer' }} 
                                        onClick={() => sortFiles('r_c')}
                                    >
                                        R_c
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {csvFiles.map((file, index) => (
                                    <tr key={index} className={isSelected(file, 'FER') || isSelected(file, 'BER') ? 'highlighted-row' : ''}>
                                        <td className="table-border table-cell">
                                            <input
                                                type="checkbox"
                                                checked={isSelected(file, 'FER')}
                                                onChange={() => handleFileChange(file, 'FER')}
                                            />
                                        </td>
                                        <td className="table-border table-cell">
                                            <input
                                                type="checkbox"
                                                checked={isSelected(file, 'BER')}
                                                onChange={() => handleFileChange(file, 'BER')}
                                            />
                                        </td>
                                        <td className="table-border table-cell table-cell-left">
                                            <a href={`${baseUrl}${file.filename}`} download>
                                                <button>Download</button>
                                            </a>
                                            <button onClick={() => handleDelete(file.filename)}>Delete</button>
                                            <span style={{ paddingLeft: '10px' }}>{file.filename}</span>
                                        </td>
                                        <td className="table-border table-cell">{formatDate(file.uploadDate)}</td>
                                        <td
                                            className="table-border table-cell table-cell-left label-column" // Add label-column class here
                                            style={{ cursor: 'pointer' }}
                                            onClick={() => {
                                                const newLabel = prompt("Enter a new label:", file.label);
                                                if (newLabel !== null && newLabel !== "") {
                                                    updateLabelOnServer(file.filename, newLabel); // Call the function to update the label
                                                }
                                            }}
                                        >
                                            {file.label}
                                        </td>
                                        <td className="table-border table-cell">{file.k}</td>
                                        <td className="table-border table-cell">{file.n}</td>
                                        <td className="table-border table-cell">{roundDivision(file.k, file.n)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <form onSubmit={handleUpload} className="upload-form">
                        <input type="file" name="file" accept=".csv" required />
                        <button type="submit">Upload CSV</button>
                    </form>
                    <Modal
                        isOpen={isModalOpen}
                        onClose={() => setIsModalOpen(false)}
                        onSubmit={handleModalSubmit}
                        headerIn={headerSubmit}
                    />
                    <div>
                        <FileManager 
                            restorableFilesIn={restorableFiles} 
                            fetchCsvFiles={fetchCsvFiles} 
                        />
                    </div>
                    
                </>
            ) : (
                <div className="login-container">
                    <form className="login-form" onSubmit={handleLogin}>
                        <h1>Login</h1>
                        <input
                            type="text"
                            placeholder="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                        <PasswordInput password={password} setPassword={setPassword} />
                        <button className="loginbutton"  type="submit">Login</button>
                    </form>
                    {message && <p className="message">{message}</p>}
                </div>
            )}
            {/*<button onClick={handleLogout}>Logout</button>*/}
        </div>
    );
};

export default App;
