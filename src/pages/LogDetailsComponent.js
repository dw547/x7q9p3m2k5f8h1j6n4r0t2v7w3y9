import React, { useState, useEffect } from 'react';

const LogDetailsComponent = ({ logData }) => {
  const [parsedData, setParsedData] = useState(null);

  useEffect(() => {
    if (logData) {
      const parsed = parseLogData(logData);
      setParsedData(parsed);
    }
  }, [logData]);

  const parseLogData = (data) => {
    const parsedData = {
      originalLink: {},
      headers: {},
      ip: '',
      ipSources: []
    };

    if (typeof data === 'string') {
      const lines = data.split('\n');
      lines.forEach(line => {
        if (line.startsWith('original link is:')) {
          const linkParams = new URLSearchParams(line.split('?')[1]);
          for (let [key, value] of linkParams) {
            parsedData.originalLink[key] = value;
          }
        } else if (line.startsWith('headers for the request are:')) {
          const headersString = lines.slice(lines.indexOf(line) + 1).join('\n');
          try {
            parsedData.headers = JSON.parse(headersString);
          } catch (e) {
            console.error('Error parsing headers:', e);
          }
        } else if (line.startsWith('ip is :')) {
          parsedData.ip = line.split(':')[1].trim();
        } else if (line.startsWith('Ip from various sources are:')) {
          parsedData.ipSources = line.split(':')[1].trim().split(', ');
        }
      });
    } else if (typeof data === 'object') {
      // Assume the data is already parsed
      return data;
    }

    return parsedData;
  };

  const downloadAsText = () => {
    const element = document.createElement("a");
    const file = new Blob([JSON.stringify(parsedData, null, 2)], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = "log_details.txt";
    document.body.appendChild(element);
    element.click();
  };

  const downloadAsCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";

    // Original Link Parameters
    csvContent += "Original Link Parameters\n";
    csvContent += "Parameter,Value\n";
    Object.entries(parsedData.originalLink).forEach(([key, value]) => {
      csvContent += `${key},${value}\n`;
    });

    csvContent += "\nHeaders\n";
    csvContent += "Header,Value\n";
    Object.entries(parsedData.headers).forEach(([key, value]) => {
      csvContent += `${key},${value}\n`;
    });

    csvContent += "\nIP Information\n";
    csvContent += `IP,${parsedData.ip}\n`;
    parsedData.ipSources.forEach((source, index) => {
      csvContent += `IP Source ${index + 1},${source}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "log_details.csv");
    document.body.appendChild(link);
    link.click();
  };

  if (!parsedData) return <div>Loading...</div>;

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Log Details</h2>
      
      <h3 className="text-xl font-semibold mt-4 mb-2">Original Link Parameters</h3>
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-300 p-2">Parameter</th>
            <th className="border border-gray-300 p-2">Value</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(parsedData.originalLink).map(([key, value]) => (
            <tr key={key}>
              <td className="border border-gray-300 p-2">{key}</td>
              <td className="border border-gray-300 p-2">{value}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3 className="text-xl font-semibold mt-4 mb-2">Headers</h3>
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-300 p-2">Header</th>
            <th className="border border-gray-300 p-2">Value</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(parsedData.headers).map(([key, value]) => (
            <tr key={key}>
              <td className="border border-gray-300 p-2">{key}</td>
              <td className="border border-gray-300 p-2">{value}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3 className="text-xl font-semibold mt-4 mb-2">IP Information</h3>
      <p><strong>IP:</strong> {parsedData.ip}</p>
      <p><strong>IP Sources:</strong> {parsedData.ipSources.join(', ')}</p>

      <div className="mt-4">
        <button onClick={downloadAsText} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-2">
          Download as Text
        </button>
        <button onClick={downloadAsCSV} className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
          Download as CSV
        </button>
      </div>
    </div>
  );
};

export default LogDetailsComponent;