import React, { useState } from 'react';
import axios from 'axios';


const FileManager = ({ restorableFilesIn,fetchCsvFiles }) => {
    const [restorableFiles, setRestorableFiles] = useState([]);
    const [sortConfig, setSortConfig] = useState({ key: '', direction: 'ascending' });
    const [isRestorableFilesVisible, setIsRestorableFilesVisible] = useState(false);

    const handleRestoreClick = () => {
        if (!isRestorableFilesVisible) {
            setRestorableFiles(restorableFilesIn); // Assuming restorableFilesIn is defined
        }
        setIsRestorableFilesVisible(!isRestorableFilesVisible); // Toggle visibility
    };

    const restoreFile = async (filename) => {
        try {
            const response = await axios.post('http://localhost:5000/api/restore-file', { filename });
            //console.log(response.data.message);
            fetchCsvFiles();
            // Optionally refresh the list of files or update the state to reflect the restored file
        } catch (error) {
            console.error('Error restoring file:', error.response?.data?.error || error.message);
        }
    };

    const sortFiles = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        let sortedFiles;
        if (key==='k' || key==='n'){
            sortedFiles = [...restorableFiles].sort((a, b) => {
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
            sortedFiles = [...restorableFiles].sort((a, b) => {
                if (a[key] < b[key]) {
                    return direction === 'ascending' ? -1 : 1;
                }
                if (a[key] > b[key]) {
                    return direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }
        setRestorableFiles(sortedFiles);
        setSortConfig({ key, direction });
    };


    return (
        <div>
            <button onClick={handleRestoreClick}>
                {isRestorableFilesVisible ? 'Hide Restorable Files' : 'Show Restorable Files'}
            </button>
            {isRestorableFilesVisible && restorableFiles.length > 0 && (
                <div>
                    <div style={{ maxHeight: '400px', overflowY: 'auto', border: '1px solid #ddd', marginTop: '20px' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead className="table-header" style={{ position: 'sticky', top: 0, zIndex: 1 }}>
                                <tr>
                                    <th 
                                        className="table-border left-align" 
                                        style={{ cursor: 'pointer' }} 
                                        onClick={() => sortFiles('filename')}
                                    >
                                        Restorable Files
                                    </th>
                                    <th 
                                        className="table-border center-align" 
                                        style={{ cursor: 'pointer' }} 
                                        onClick={() => sortFiles('uploadDate')}
                                    >
                                        Upload Date
                                    </th>
                                    <th 
                                        className="table-border left-align label-column" 
                                        style={{ cursor: 'pointer' }} 
                                        onClick={() => sortFiles('label')}
                                    >
                                        Label
                                    </th>
                                    <th 
                                        className="table-border center-align" 
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
                                </tr>
                            </thead>
                            <tbody>
                                {restorableFiles.map((file, index) => (
                                    <tr key={index}>
                                        <td className="table-border table-cell table-cell-left">
                                            <button onClick={() => restoreFile(file.filename)}>
                                                Restore
                                            </button>
                                            <span style={{ paddingLeft: '10px' }}>{file.filename}</span>
                                        </td>
                                        <td className="table-border table-cell center-align">{file.uploadDate}</td>
                                        <td className="table-border table-cell table-cell-left label-column">{file.label}</td>
                                        <td className="table-border table-cell center-align">{file.k}</td>
                                        <td className="table-border table-cell">{file.n}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FileManager;