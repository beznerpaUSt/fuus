import React, { useState, useRef } from 'react';
import Plotly from 'plotly.js-basic-dist';

const DownloadChart = () => {
    const [isDownloading, setIsDownloading] = useState(false);
    const downloadButtonRef = useRef(null);

    const handleDownload = () => {
        if (isDownloading) {
            console.log("Download already in progress.");
            return; // Exit if a download is already in progress
        }

        setIsDownloading(true); // Set the flag to true

        // Prompt the user for the file name
        const fileName = prompt("Enter a name for the file:", "plotly_chart");

        // If the user cancels the prompt, reset the flags and exit
        if (fileName === null) {
            setIsDownloading(false); // Reset the flag
            return; // Exit if no file name is provided
        }

        // Initiate the download of the chart as an SVG image
        Plotly.downloadImage('plotly-chart', {
            format: 'svg', // Set the format to SVG
            filename: fileName || 'plotly_chart', // Use the entered name or default to 'plotly_chart'
            scale: 1 // Set the scale for the image
        }).then(() => {
            console.log("Download completed."); // Log success message
        }).catch((error) => {
            console.error("Error during download:", error); // Log any errors
        }).finally(() => {
            setIsDownloading(false); // Reset the flag
        });
    };

    return (
        <div>
            <button
                id="download-svg"
                onClick={handleDownload}
                disabled={isDownloading} // Disable the button while downloading
            >
                Download Chart
            </button>
        </div>
    );
};

export default DownloadChart;