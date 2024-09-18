import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { FaDownload, FaTrash, FaChevronLeft, FaChevronRight, FaFileCsv } from 'react-icons/fa6';
import Switch from 'react-switch';
import { CSVLink } from "react-csv";

export default function Incoming() {
  const [url, setUrl] = useState('http://12.ctvads.net/layer1?');
  const [copyMessage, setCopyMessage] = useState('');
  const [data, setData] = useState({ total_page: 0, current_page: 1, incomming_files: [] });
  const [loading, setLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [error, setError] = useState(null);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isToggle, setIsToggle] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [isSubmiting, setIsSubmiting] = useState(false);
  const [csvData, setCSVData] = useState([]);

  useEffect(() => {
    fetchData(data.current_page);
  }, [data.current_page, itemsPerPage]);

  const fetchData = async (page) => {
    setError(null);
    setLoading(true);
    setLoadingProgress(0);
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URI}/get-incomming/?limit=${itemsPerPage}&page=${page}`, {
        headers: {
          Authorization: JSON.parse(localStorage.getItem("token")),
        },
      });
  
      if (response.status === 200) {
        const totalFiles = response.data.incomming_files.length;
        const parsedFiles = await Promise.all(response.data.incomming_files.map(async (file, index) => {
          try {
            const fileResponse = await axios.get(`${process.env.REACT_APP_API_URI}/get-single-incomming/${file}`, {
              headers: {
                Authorization: JSON.parse(localStorage.getItem("token")),
              },
            });
            setLoadingProgress((index + 1) / totalFiles * 100);
            return { fileName: file, ...parseFileContent(fileResponse.data) };
          } catch (error) {
            console.error("Error fetching file content:", error);
            return { fileName: file, error: "Failed to fetch file content" };
          }
        }));

        setData(prevData => ({
          ...prevData,
          incomming_files: parsedFiles,
          total_page: response.data.total_page
        }));
        setIsToggle(response.data.incomming_status);
        prepareCSVData(parsedFiles);
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Failed to fetch data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const parseFileContent = (content) => {
    const lines = content.split('\n');
    const parsedContent = {};
    let currentKey = '';

    lines.forEach(line => {
      if (line.includes(':')) {
        const [key, ...valueParts] = line.split(':');
        currentKey = key.trim();
        parsedContent[currentKey] = valueParts.join(':').trim();
      } else if (currentKey && line.trim()) {
        parsedContent[currentKey] += '\n' + line.trim();
      }
    });

    return parsedContent;
  };

  const prepareCSVData = (files) => {
    const allKeys = new Set(['fileName']);
    files.forEach(file => {
      Object.keys(file).forEach(key => allKeys.add(key));
    });
    const headers = Array.from(allKeys);

    const csvData = [
      headers,
      ...files.map(file => headers.map(header => file[header] || ''))
    ];

    setCSVData(csvData);
  };


  const handleUrlChange = (e) => {
    setUrl(e.target.value);
  };

  const handleCopyClick = () => {
    navigator.clipboard.writeText(url).then(() => {
      setCopyMessage('Copied to clipboard!');
      setTimeout(() => {
        setCopyMessage('');
      }, 2000);
    });
  };

  const handleDeleteAll = async () => {
    setIsSubmiting(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${process.env.REACT_APP_API_URI}/delete-all-incomming`, {
        headers: { Authorization: JSON.parse(token) },
      });
      if (response.status === 200) {
        setIsSubmiting(false);
        setShowConfirmDelete(false);
        alert("All logs deleted successfully");
        fetchData(1);
      } else {
        console.error("Failed to delete logs", response.status, response.statusText);
      }
    } catch (error) {
      setIsSubmiting(false);
      alert("Error deleting logs", error);
      console.error("Error deleting logs", error);
    }
  };

  const handleDownload = async () => {
    setIsSubmiting(true);

    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${process.env.REACT_APP_API_URI}/download-all-incomming`, {
        headers: { Authorization: JSON.parse(token) },
        responseType: 'blob',
      });

      if (response.status === 200) {
        setIsSubmiting(false);
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'logs.zip');
        document.body.appendChild(link);
        link.click();
        link.remove();
        alert("All logs downloaded successfully");
      }
    } catch (error) {
      setIsSubmiting(false);
      alert("Error downloading logs", error);
      console.error("Error downloading logs", error);
    }
  };

  const handleToggleIncoming = async () => {
    setIsToggle(!isToggle);
    try {
      const token = localStorage.getItem("token");
      const action = isToggle ? "stop" : "start";
      const response = await axios.post(
        `${process.env.REACT_APP_API_URI}/control-incomming`,
        { action },
        { headers: { Authorization: JSON.parse(token) } }
      );
      if (response.status === 200) {
        alert("Successful");
        setIsToggle(!isToggle)

      } else {

        console.error("Failed to toggle", response.status, response.statusText);
      }
    } catch (error) {
      alert("Error toggling button", error);
      console.error("Error toggling button", error);
    }
  };

  const paginate = (pageNumber) => {
    setData(prevData => ({ ...prevData, current_page: pageNumber }));
  };

const handleItemsPerPageChange = (e) => {
  setItemsPerPage(parseInt(e.target.value));
  setData(prevData => ({ ...prevData, current_page: 1 }));
};

const renderTableContent = () => {
  const allKeys = new Set(['fileName']);
  data.incomming_files.forEach(file => {
    Object.keys(file).forEach(key => allKeys.add(key));
  });
  const sortedKeys = ['fileName', ...Array.from(allKeys).filter(key => key !== 'fileName').sort()];

  return (
    <>
      <tr className="bg-gradient-to-r from-blue-700 to-blue-800 text-white">
        <th>Sr no</th>
        {sortedKeys.map(key => (
          <th key={key} className="py-3 px-4 text-left">{key === 'fileName' ? 'File Name' : key}</th>
        ))}
      </tr>
      {data.incomming_files.map((file, fileIndex) => (
        <tr key={fileIndex} className="border-b border-gray-700 hover:bg-gray-300 dark:hover:bg-gray-700 transition duration-300">
          <td className='textwhite p-1 ml-2'>{fileIndex +1}</td>
          {sortedKeys.map(key => (
            
            <td key={key} className="py-3 px-4 textwhite">
              
              <pre className="whitespace-pre-wrap font-mono text-sm">{file[key] || '-'}</pre>
            </td>
          ))}
        </tr>
      ))}
    </>
  );
};

if (error) return <div className="text-red-500 text-center">{error}</div>;




  return (
    <div className="p-8 graybg min-h-screen rounded-lg shadow-lg">
      <h2 className="text-center textwhite text-4xl mb-8 font-bold">Incomming Logs</h2>
      <div className="flex items-center justify-center mb-8">
        <input
          className="w-96 px-4 py-2 gray700 textwhite border-2 border-gray-700 rounded-l-lg text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          type="text"
          onChange={handleUrlChange}
          value={url}
          readOnly
        />
        <button
          onClick={handleCopyClick}
          className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-2 px-6 rounded-r-lg ml-2 transition duration-300" >
          Copy
        </button>
        <div className="ml-4">
          <Switch
            checked={isToggle}
            onChange={handleToggleIncoming}
            onColor="#86d3ff"
            onHandleColor="#2693e6"
            handleDiameter={30}
            uncheckedIcon={false}
            checkedIcon={false}
            boxShadow="0px 1px 5px rgba(0, 0, 0, 0.6)"
            activeBoxShadow="0px 0px 1px 10px rgba(0, 0, 0, 0.2)"
            height={20}
            width={48}
            className="react-switch"
          />
        </div>
      </div>
      {copyMessage && <p className="text-center text-green-500 mb-8 text-lg">{copyMessage}</p>}
     
      {loading ? (
        <div className="textwhite text-center">
          <div className="mb-2">Loading... {loadingProgress.toFixed(0)}%</div>
          <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
            <div className="bg-blue-600 h-2.5 rounded-full" style={{width: `${loadingProgress}%`}}></div>
          </div>
        </div>
      ) : data.incomming_files.length > 0 ? (
        <>
          <div className="flex justify-between items-center mb-4">
            <div className="textwhite font-bold">
              <label htmlFor="itemsPerPage" className="mr-2">Items per page:</label>
              <select
                id="itemsPerPage"
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(parseInt(e.target.value))}
                className="gray700 textwhite rounded px-2 py-1"
              >
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="40">40</option>
                <option value="60">60</option>
                <option value="80">80</option>
                <option value="100">100</option>
              </select>
            </div>

            <div className="flex justify-start mt-4 space-x-4">
              <CSVLink
                data={csvData}
                filename={"incoming_logs.csv"}
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-3 px-6 rounded-full shadow-lg transition duration-300 flex items-center"
                target="_blank"
              >
                <FaFileCsv className="mr-2" />
                Download CSV
              </CSVLink>
              {/* <button
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-3 px-6 rounded-full shadow-lg transition duration-300 relative"
                title='Download Log'
                onClick={handleDownload}
              >
                <FaDownload size={22} />
                {isSubmiting && (
                  <span className="spinner inline-block ml-2 border-4 border-t-4 border-blue-500 rounded-full w-4 h-4 animate-spin"></span>
                )}
              </button> */}
            </div>

            <div className="flex justify-end mt-4">
              <button
                className="bg-red-500 hover:bg-red-600 hover:scale-110 mr-4 text-white font-bold py-2 px-4 rounded transition duration-300 relative"
                title='Delete All Logs'
                onClick={() => setShowConfirmDelete(true)}
              >
                <FaTrash />
              </button>
            </div>
          </div>
          
          <div className='overflow-x-auto rounded-xl shadow-lg'>
            <table className="w-full border-collapse">
              <thead>
                {renderTableContent()}
              </thead>
            </table>
          </div>
          
          <div className="flex justify-center mt-4">
            <nav className="flex items-center">
              <button
                onClick={() => paginate(data.current_page - 1)}
                disabled={data.current_page === 1}
                className="px-3 py-1 rounded-l-md gray700 textwhite hover:bg-gray-300 dark:hover:bg-gray-800 disabled:opacity-50"
              >
                <FaChevronLeft />

              </button>
              {data.total_page <= 7 ? (
                [...Array(data.total_page).keys()].map((number) => (
                  <button
                    key={number + 1}
                    onClick={() => paginate(number + 1)}
                    className={`px-3 py-1 gray700 textwhite ${data.current_page === number + 1
                      ? 'bg-blue-600 hover:bg-blue-700'
                      : 'hover:bg-gray-300 dark:hover:bg-gray-800'
                      }`}
                  >
                    {number + 1}
                  </button>
                ))
              ) : (
                <>
                  {data.current_page > 4 && (
                    <>
                      <button
                        onClick={() => paginate(1)}
                        className="px-3 py-1 gray700 textwhite hover:bg-gray-300 dark:hover:bg-gray-800"
                      >
                        1
                      </button>
                      {data.current_page > 5 && <span className="px-3 py-1 gray700 textwhite">...</span>}
                    </>
                  )}
                  {[...Array(5).keys()]
                    .map((number) => data.current_page + number - 2)
                    .filter((number) => number > 0 && number <= data.total_page)
                    .map((number) => (
                      <button
                        key={number}
                        onClick={() => paginate(number)}
                        className={`px-3 py-1 gray700 textwhite ${data.current_page === number
                          ? 'bg-blue-600 hover:bg-blue-700'
                          : 'hover:bg-gray-300 dark:hover:bg-gray-800'
                          }`}
                      >
                        {number}
                      </button>
                    ))}
                  {data.current_page < data.total_page - 3 && (
                    <>
                      {data.current_page < data.total_page - 4 && <span className="px-3 py-1 gray700 textwhite">...</span>}
                      <button
                        onClick={() => paginate(data.total_page)}
                        className="px-3 py-1 gray700 textwhite hover:bg-gray-300 dark:hover:bg-gray-800"
                      >
                        {data.total_page}
                      </button>
                    </>
                  )}
                </>
              )}              <button
                onClick={() => paginate(data.current_page + 1)}
                disabled={data.current_page === data.total_page}
                className="px-3 py-1 rounded-r-md gray700 textwhite hover:bg-gray-300 dark:hover:bg-gray-800 disabled:opacity-50"
              >
                <FaChevronRight />
              </button>
            </nav>
          </div>
        </>
      ) : (
        <div className="textwhite text-center text-xl">No logs available</div>
      )}

      {showConfirmDelete && (

        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 shadow-lg">
            <h2 className="text-xl font-bold mb-4">Confirm Delete</h2>
            <p className="mb-6">
              Are you sure you want to delete all logs?
            </p>
            <div className="flex justify-end">
              <button
                className="px-4 py-2 bg-red-500 text-white rounded-md mr-2"
                onClick={handleDeleteAll} >
                Yes
                {isSubmiting && (
                  <span className="spinner inline-block ml-2 border-4 border-t-4 border-blue-500 rounded-full w-4 h-4 animate-spin"></span>
                )}
              </button>
              <button
                className="px-4 py-2 bg-gray-400 text-white rounded-md"
                onClick={() => setShowConfirmDelete(false)} >
                No
              </button>
            </div>
          </div>
        </div>
      )}
     
    </div>
  );
}