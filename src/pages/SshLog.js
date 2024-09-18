import React, { useCallback, useEffect, useState, useRef } from 'react';
import axios from 'axios';

export default function SshLog() {
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedDay, setSelectedDay] = useState('');
  const [selectedLogType, setSelectedLogType] = useState('Failed');
  const [selectedServer, setSelectedServer] = useState('');
  const [servers, setServers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');

  const monthsRef = useRef(null);

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  useEffect(() => {
    const currentDate = new Date();
    const currentMonth = months[currentDate.getMonth()];
    setSelectedMonth(currentMonth);

    if (monthsRef.current) {
      const selectedMonthElement = monthsRef.current.querySelector(`[data-month="${currentMonth}"]`);
      if (selectedMonthElement) {
        selectedMonthElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, []);

  const fetchServers = useCallback(async () => {
    try {
      const token = JSON.parse(localStorage.getItem("token"));
      const response = await axios.get(`${process.env.REACT_APP_API_URI}/all-servers`, {
        headers: { Authorization: token }
      });
      setServers(response.data);
    } catch (err) {
      setStatus("Failed to fetch servers: " + err);
    }
  }, []);

  useEffect(() => {
    fetchServers();
  }, [fetchServers]);


  const handleGetLog = () => {
    if (!selectedMonth || !selectedDay) {
      setStatus('Please select both month and day.');
      return;
    }

    setLoading(true);
    setStatus('');
    setLogs([]);

    const formattedDate = `${selectedMonth} ${selectedDay.padStart(2, '0')}`;

    axios.post(`${process.env.REACT_APP_API_URI}/admin-ssh-status/${selectedLogType}`, {
      date: formattedDate
    }, {
      headers: {
        Authorization: JSON.parse(localStorage.getItem('token'))
      }
    }).then((response) => {
      if (response.data && typeof response.data === 'string') {
        const logEntries = response.data.split('\n')
          .filter(entry => entry.trim() !== '')
          .map(parseLogEntry);
        setLogs(logEntries);
      } else {
        setLogs([]);
      }
      setStatus('success');
    }).catch((error) => {
      console.log("Error Fetching Log", error);
      setStatus(error.response?.data?.message || 'Failed to fetch logs. Please try again.');
    }).finally(() => {
      setLoading(false);
    });
  }

  const parseLogEntry = (entry) => {
    const parts = entry.split(' ');
    const date = `${parts[0]} ${parts[1]} ${parts[2]}`;
    const message = parts.slice(5).join(' ');
    
    let userType = 'N/A';
    let username = 'N/A';
    let ipAddress = 'N/A';
    let port = 'N/A';

    if (message.includes('invalid user')) {
      userType = 'Invalid';
      username = message.split('invalid user ')[1].split(' ')[0];
    } else if (message.includes('for root')) {
      userType = 'Root';
      username = 'root';
    }

    const ipMatch = message.match(/from (\d+\.\d+\.\d+\.\d+)/);
    if (ipMatch) {
      ipAddress = ipMatch[1];
    }

    const portMatch = message.match(/port (\d+)/);
    if (portMatch) {
      port = portMatch[1];
    }

    return { date, userType, username, ipAddress, port };
  }

  return (
    <div className='graybg text-white p-4 rounded-lg'>
      <div className='flex flex-wrap items-start mb-4 gap-4'>
      <div className='flex flex-col'>
          <label className='mb-2 textwhite text-lg'>Select Month</label>
          <div className='relative'>
            <div 
              ref={monthsRef}
              className='flex flex-col overflow-y-auto py-2 px-1 rounded-lg gray700'
              style={{
                height: '70px',
                width: '120px',
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
              }}
            >
              {months.map((month, index) => (
                <button
                  key={month}
                  data-month={month}
                  className={`px-4 py-1 rounded-full mb-2 text-sm focus:outline-none transition-all duration-200 ${
                    selectedMonth === month 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-600 hover:bg-gray-500'
                  }`}
                  onClick={() => setSelectedMonth(month)}
                >
                  {month}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className='flex flex-col'>
          <label className='mb-2 textwhite text-lg'>Select Day</label>
          <input
            type='number'
            min="1"
            max="31"
            placeholder="Day"
            className='gray700 textwhite p-2  rounded w-20 mt-3'
            value={selectedDay}
            onChange={(e) => setSelectedDay(e.target.value)}
          />
        </div>

        <div className='flex flex-col'>
          <label className='mb-2 textwhite text-lg'>Log Type</label>
          <select
            className='gray700 textwhite p-2 rounded mt-3'
            value={selectedLogType}
            onChange={(e) => setSelectedLogType(e.target.value)}
          >
            <option value="Failed">Failed</option>
            <option value="Accepted">Accepted</option>
          </select>
        </div>

        <div className='flex flex-col'>
          <label className='mb-2 textwhite text-lg'>Select Server</label>
          <select
            value={selectedServer?.id || ''}
            onChange={(e) => setSelectedServer(servers.find(s => s.id.toString() === e.target.value))}
            className="gray700 textwhite p-2 rounded mt-3"
          >
            <option value="">Select a server</option>
            {servers.map((server) => (
              <option key={server.id} value={server.id}>
                {server.server_name} 
              </option>
            ))}
          </select>
        </div>

        <button
          className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-200 mt-12'
          onClick={handleGetLog}
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Get Log Details'}
        </button>
      </div>

      <div className='graybg rounded-xl p-4 overflow-x-auto'>
        <h2 className='text-xl textwhite font-bold mb-2'>Log Details:</h2>
        {status && status !== 'success' && <p className='text-red-500 mb-2'>{status}</p>}
        {logs.length > 0 ? (
          <table className='min-w-full bg-gray-700 rounded-lg overflow-hidden'>
            <thead className='bg-gray-600'>
              <tr>
                <th className='px-4 py-2 text-left'>Date</th>
                <th className='px-4 py-2 text-left'>User Type</th>
                <th className='px-4 py-2 text-left'>Username</th>
                <th className='px-4 py-2 text-left'>IP Address</th>
                <th className='px-4 py-2 text-left'>Port</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((entry, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-gray-700' : 'bg-gray-650'}>
                  <td className='px-4 py-2'>{entry.date}</td>
                  <td className='px-4 py-2'>{entry.userType}</td>
                  <td className='px-4 py-2'>{entry.username}</td>
                  <td className='px-4 py-2'>{entry.ipAddress}</td>
                  <td className='px-4 py-2'>{entry.port}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className='textwhite'>{loading ? 'Loading logs...' : 'No logs to display. Select a date and log type, then click "Get Log Details"'}</p>
        )}
      </div>
    </div>
  )
}