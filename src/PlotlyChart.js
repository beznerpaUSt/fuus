import React, { useEffect, useRef } from 'react';
import Plotly from 'plotly.js-basic-dist';
import Papa from 'papaparse';

const PlotlyChart = ({ selectedFiles, xMin, xMax, baseUrl, yFlag }) => {
    const isDownloading = useRef(false); // 

    useEffect(() => {
        const loadData = async () => {
            const traces = [];
            const csvFiles = selectedFiles.map(file => `${baseUrl}${file.filename}`);
            let i = 0;
            let n_th_file=0;
            const filenameColorMap = {};
            // Define a color map for different codes
            const colorMap = {
                '0': 'blue',
                '1': 'green',
                '2': 'red',
                // Add more codes and their corresponding colors as needed
            };

            for (const csvFile of csvFiles) {
                const results = await new Promise((resolve, reject) => {
                    Papa.parse(csvFile, {
                        download: true,
                        header: true,
                        complete: (results) => {
                            resolve(results.data);
                        },
                        error: (error) => {
                            reject(error);
                        }
                    });
                });

                const xColumnName = Object.keys(results[0]).find(key => key.includes("SNRb"));
                const yColumnName = Object.keys(results[0]).find(key => key.includes(yFlag[i]));

                const parsedData = results.filter(row => {
                    const xValue = parseFloat(row[xColumnName]);
                    const yValue = parseFloat(row[yColumnName]);
                    return !isNaN(xValue) && !isNaN(yValue);
                });

                const xData = parsedData.map(row => parseFloat(row[xColumnName]));
                const yData = parsedData.map(row => parseFloat(row[yColumnName]));

                // Check for NaN values
                if (xData.some(isNaN) || yData.some(isNaN)) {
                    console.error(`NaN values found in data from ${csvFile}`);
                    return; // Stop execution if NaN is found
                }

                // Determine the code from the selected file's label
                let traceColor;
                let showleg=false;

                // Check if the filename has already been plotted
                if (filenameColorMap[csvFile]) {
                    traceColor = filenameColorMap[csvFile]; // Use existing color
                } else {
                    traceColor = colorMap[n_th_file] || 'black'; // Default to black if code not found
                    filenameColorMap[csvFile] = traceColor; // Store the color for future use
                    n_th_file+=1;
                    showleg=true;
                }

                // Create the trace for the current file
                const trace = {
                    x: xData,
                    y: yData,
                    mode: 'lines+markers',
                    type: 'scatter',
                    name: selectedFiles[i].label + ' K=' + selectedFiles[i].k + ' N=' + selectedFiles[i].n,
                    line: { 
                        color: traceColor,
                        dash: (yFlag[i] === 'BER') ? 'dash' : 'solid' // Set dashed lines for BER
                    },
                    marker: { size: 5 },
                    showlegend: showleg,
                };

                traces.push(trace);

                i += 1;
            }

            Plotly.purge('plotly-chart'); // Clear previous plot
            Plotly.newPlot('plotly-chart', traces, {
                title: 'Error rate for selected codes',
                xaxis: {
                    title: {
                        text: 'Eb/N0 in dB',
                        font: {
                            size: 18,
                            family: 'Arial',
                            color: 'black',
                            weight: 'bold'
                        }
                    },
                    range: [xMin, xMax], // Set the x-axis range using props
                },
                yaxis: {
                    title: {
                        text: 'FER or BER',
                        font: {
                            size: 18,
                            family: 'Arial',
                            color: 'black',
                            weight: 'bold'
                        }
                    },
                    type: 'log',
                    tickvals: [
                        1, 
                        0.1, 
                        0.01, 
                        0.001, 
                        0.0001, 
                        0.00001, 
                        0.000001, 
                        0.0000001, 
                        0.00000001, 
                        0.000000001, 
                        0.0000000001, 
                        0.00000000001, 
                        0.000000000001, 
                        0.0000000000001, 
                        0.00000000000001, 
                        0.000000000000001
                    ],
                    ticktext: [
                        '10<sup>0</sup>', 
                        '10<sup>-1</sup>', 
                        '10<sup>-2</sup>', 
                        '10<sup>-3</sup>', 
                        '10<sup>-4</sup>', 
                        '10<sup>-5</sup>', 
                        '10<sup>-6</sup>', 
                        '10<sup>-7</sup>', 
                        '10<sup>-8</sup>', 
                        '10<sup>-9</sup>', 
                        '10<sup>-10</sup>', 
                        '10<sup>-11</sup>', 
                        '10<sup>-12</sup>', 
                        '10<sup>-13</sup>', 
                        '10<sup>-14</sup>', 
                        '10<sup>-15</sup>'
                    ],
                },
                showlegend: true,
            });
        };
        
        if (selectedFiles.length > 0) {
            loadData(); // Load the data when the component mounts
        }

    }, [selectedFiles, xMin, xMax, baseUrl, yFlag]); // Add dependencies to re-run effect when these change

    return (
        <div id="plotly-chart" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '60%', height: '60vh' }} />
    ); // Set dimensions for the chart
};

export default PlotlyChart;