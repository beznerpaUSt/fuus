import React, { useState } from 'react';
import Modal from './Modal'; // Adjust the import path as necessary

const FileUploadComponent = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [csvFiles, setCsvFiles] = useState([]);
    const [selectedFiles, setSelectedFiles] = useState([]);

    const handleFileChange = (fileName) => {
        // Toggle the selected file in the selectedFiles state
        if (selectedFiles.includes(fileName)) {
            setSelectedFiles(selectedFiles.filter(file => file !== fileName));
        } else {
            setSelectedFiles([...selectedFiles, fileName]);
        }
    };

    const handleUploadClick = () => {
        setIsModalOpen(true); // Open the modal when the upload button is clicked
    };

    const handleModalSubmit = (fileName) => {
        // Logic to handle file upload using the provided fileName
        console.log('Uploading file with name:', fileName);
        // Here you would typically send the file to your server

        // Update the csvFiles state to include the new file
        setCsvFiles([...csvFiles, { filename: fileName, uploadDate: new Date().toISOString() }]);
        
        // Close the modal after submission
        setIsModalOpen(false);
    };

    return (
        <div>
            <button onClick={handleUploadClick}>Upload File</button>
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleModalSubmit}
            />
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr>
                        <th style={{ border: '1px solid #ddd', padding: '8px' }}>Select</th>
                        <th style={{ border: '1px solid #ddd', padding: '8px' }}>Filename</th>
                        <th style={{ border: '1px solid #ddd', padding: '8px' }}>Upload Date</th>
                    </tr>
                </thead>
                <tbody>
                    {csvFiles.map((file, index) => (
                        <tr key={index}>
                            <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                                <input
                                    type="checkbox"
                                    checked={selectedFiles.includes(file.filename)} // Check if the filename is included in selectedFiles
                                    onChange={() => handleFileChange(file.filename)} // Pass the filename to handleFileChange
                                />
                            </td>
                            <td style={{ border: '1px solid #ddd', padding: '8px' }}>{file.filename}</td>
                            <td style={{ border: '1px solid #ddd', padding: '8px' }}>{file.uploadDate}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default FileUploadComponent;