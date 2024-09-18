import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { format, parseISO, isWithinInterval } from 'date-fns';
import { FaDownload, FaEye, FaEyeSlash, FaSpinner } from 'react-icons/fa';
import image from "../asset/11.gif";


const VPNLogDashboard = () => {
  const [logData, setLogData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState(null);
  const [selectedServer, setSelectedServer] = useState('');
  const [selectedVpn, setSelectedVpn] = useState('');
  const [loading, setLoading] = useState(false);
  const [visibleMessages, setVisibleMessages] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const itemsPerPage = 10;

  useEffect(() => {
    if (selectedServer && selectedVpn) {
      getClickLog();
    }
  }, [selectedServer, selectedVpn]);

  const getClickLog = () => {
    setLoading(true);
    setLogData([]);
    setError(null);

    axios.get(`${process.env.REACT_APP_API_URI}/get-click-log/?server=${selectedServer}&click=${selectedVpn}`, {
      headers: {
        Authorization: `${JSON.parse(localStorage.getItem('token'))}`
      }
    }).then((response) => {
      if (response.status === 200) {
        console.log("Raw Data Received:", response.data);
        const parsedData = parseLogData(response.data);
        console.log("Parsed Data:", parsedData);
        setLogData(parsedData);
      }
    }).catch((error) => {
      setError("Error Fetching Data: " + error.message);
    }).finally(() => {
      setLoading(false);
    });
  };

  const parseLogData = (data) => {
    return data.split('\n').map(line => {
      console.log("Parsing line:", line);
      
      let match = line.match(/\[(.+?)\] IP did not match \[(.+?)\] old IP: (.+?), new IP: (.+?), VPN is (.+)/);
      if (match) {
        return {
          datetime: match[1],
          source: match[2],
          oldIP: match[3],
          newIP: match[4],
          vpn: match[5],
          message: line
        };
      }
      
      match = line.match(/\[ (.+?) \] (.+)/);
      if (match) {
        return {
          datetime: match[1],
          message: match[2],
          source: '',
          oldIP: '',
          newIP: '',
          vpn: ''
        };
      }
      
      console.log("No match found for line:", line);
      return null;
    }).filter(Boolean);
  };

  const filteredData = useMemo(() => {
    try {
      return logData.filter(item => {
        const itemDate = parseISO(item.datetime);
        const isWithinDateRange = (!startDate || !endDate) ? true : 
          isWithinInterval(itemDate, { start: parseISO(startDate), end: parseISO(endDate) });
        
        const matchesSearch = 
          item.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.source.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.oldIP.includes(searchTerm) ||
          item.newIP.includes(searchTerm) ||
          item.vpn.toLowerCase().includes(searchTerm.toLowerCase());

        return isWithinDateRange && matchesSearch;
      });
    } catch (err) {
      setError(err.message);
      return [];
    }
  }, [logData, searchTerm, startDate, endDate]);

  const pageCount = Math.ceil(filteredData.length / itemsPerPage);
  
  const paginatedData = useMemo(() => {
    const firstPageIndex = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(firstPageIndex, firstPageIndex + itemsPerPage);
  }, [filteredData, currentPage]);

  const formatDate = (dateString) => {
    try {
      return format(parseISO(dateString), 'MMM dd, yyyy HH:mm:ss');
    } catch (err) {
      return 'Invalid Date';
    }
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const toggleMessage = (index) => {
    setVisibleMessages(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const handleDownload = () => {
    setIsSubmitting(true);
    
    const logText = filteredData.map(item => 
      `[${item.datetime}] Source: ${item.source}, Old IP: ${item.oldIP}, New IP: ${item.newIP}, VPN: ${item.vpn}\n${item.message}`
    ).join('\n\n');

    const blob = new Blob([logText], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = 'vpn_log.txt';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    
    setIsSubmitting(false);
  };

  const renderPagination = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;
    let startPage, endPage;
    
    if (pageCount <= maxPagesToShow) {
      startPage = 1;
      endPage = pageCount;
    } else {
      const middlePage = Math.floor(maxPagesToShow / 2);
      if (currentPage <= middlePage) {
        startPage = 1;
        endPage = maxPagesToShow;
      } else if (currentPage + middlePage >= pageCount) {
        startPage = pageCount - maxPagesToShow + 1;
        endPage = pageCount;
      } else {
        startPage = currentPage - middlePage;
        endPage = currentPage + middlePage;
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(
        <button
          key={i}
          className={`px-3 py-1 mx-1 rounded ${currentPage === i ? 'bg-blue-500 text-white' : 'bg-gray-200 '}`}
          onClick={() => handlePageChange(i)}
        >
          {i}
        </button>
      );
    }

    return (
      <div className="flex justify-center items-center space-x-2">
        <button 
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
          onClick={() => handlePageChange(1)}
          disabled={currentPage === 1}
        >
          First
        </button>
        <button 
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Previous
        </button>
        {pageNumbers}
        <button 
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === pageCount}
        >
          Next
        </button>
        <button 
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
          onClick={() => handlePageChange(pageCount)}
          disabled={currentPage === pageCount}
        >
          Last
        </button>
      </div>
    );
  };

  if (error) {
    return (
      <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
        <h2 className="text-lg font-bold">Error</h2>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="p-4 graybg space-y-4">
      <h1 className="text-2xl textwhite font-bold">VPN Log Dashboard</h1>
      
      <div className="flex justify-between">
        <div className="flex space-x-2">
        <select 
          className="p-2 border rounded"
          value={selectedServer} 
          onChange={(e) => setSelectedServer(e.target.value)}
        >
          <option value="">Select Server</option>
          <option value="cs-1">cs-1 (gs click)</option>
          <option value="cs-2">cs-2 (other click)</option>
        </select>
        
        <select 
          className="p-2 border rounded"
          value={selectedVpn} 
          onChange={(e) => setSelectedVpn(e.target.value)}
        >
          <option value="">Select VPN</option>
          <option value="nine22/luna">nine22/luna</option>
          <option value="pxs">pxs</option>
        </select>
        </div>
     
        <div className="flex justify-end ">
          <button
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-1 px-4 rounded-lg shadow-lg transition duration-300 relative mr-2 mb-1"
            title='Download Log'
            onClick={handleDownload}
            disabled={isSubmitting}
          >
            <FaDownload size={22} />
            {isSubmitting && (
              <span className="spinner inline-block ml-2 animate-spin"> <FaSpinner/></span>
            )}
          </button>
        </div>
      </div>
     
      <div className="flex space-x-2">
        
        <input
          className="p-2 border rounded"
          type="text"
          placeholder="Search logs"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {/* <input
          className="p-2 border rounded"
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
        <input
          className="p-2 border rounded"
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        /> */}
        
      </div>

      {loading ? (
         <div className="text-blue-600 text-center">
         <p>Loading Please Wait!</p>
         <br />
         <img src={image} alt="" className="h-40 mx-auto rounded-full" />
       </div>
      ) : paginatedData.length > 0 ? (
        <table className="w-full rounded-md border-collapse">
          <thead>
            <tr className="bg-blue-500 rounded-lg text-white">
              <th className="p-2 text-left">Date & Time</th>
              <th className="p-2 text-left">Source</th>
              <th className="p-2 text-left">Old IP</th>
              <th className="p-2 text-left">New IP</th>
              <th className="p-2 text-left">VPN</th>
              <th className="p-2 text-left">Message</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((item, index) => (
              <tr key={index} className="gray700 border-b textwhite">
                <td className="p-2">{formatDate(item.datetime)}</td>
                <td className="p-2">{item.source}</td>
                <td className="p-2">{item.oldIP}</td>
                <td className="p-2">{item.newIP}</td>
                <td className="p-2">{item.vpn}</td>
                <td className="p-2">
                  <button
                    onClick={() => toggleMessage(index)}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center"
                  >
                    {visibleMessages[index] ? <FaEyeSlash /> : <FaEye />}
                  </button>
                  {visibleMessages[index] && (
                    <span className="ml-2">{item.message}</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="text-center textwhite">No data to display</div>
      )}
      
      {renderPagination()}
    </div>
  );
};

export default VPNLogDashboard;