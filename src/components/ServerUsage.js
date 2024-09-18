import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const API_URL = `${process.env.REACT_APP_API_URI}/server-status`;
const ALL_SERVERS_URL = `${process.env.REACT_APP_API_URI}/all-servers`;

const timeIntervals = [
  { value: 'minute', label: '1 Minute' },
  { value: '10minute', label: '10 Minutes' },
  { value: '30minute', label: '30 Minutes' },
  { value: 'hour', label: '1 Hour' },
  { value: 'day', label: '1 Day' },
];

const metrics = [
  { key: 'avgCpu', label: 'CPU Usage', color: '#8884d8' },
  { key: 'avgMem', label: 'Memory Usage', color: '#82ca9d' },
  { key: 'avgNet', label: 'Network Usage', color: '#ffc658' },
  { key: 'onlinePercentage', label: 'Uptime', color: '#ff7300' },
];

const ServerMonitoringDashboard = () => {
  const [servers, setServers] = useState([]);
  const [selectedServer, setSelectedServer] = useState(null);
  const [timeInterval, setTimeInterval] = useState('10minute');
  const [days, setDays] = useState(1);
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(false);

  const fetchServers = useCallback(async () => {
    try {
      const token = JSON.parse(localStorage.getItem("token"));
      const response = await axios.get(ALL_SERVERS_URL, {
        headers: { Authorization: token }
      });
      setServers(response.data);
    } catch (err) {
      setError("Failed to fetch servers: " + err.message);
    }
  }, []);

  useEffect(() => {
    fetchServers();
  }, [fetchServers]);

  const fetchData = useCallback(async () => {
    if (!selectedServer) return;

    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          days,
          interval: timeInterval,
          server_ip: selectedServer.server_ip,
          server_name: selectedServer.server_name
        })
      });
      const result = await response.json();
      if (result.success && result.data) {
        setData(result.data);
      } else {
        throw new Error('Failed to fetch data');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [selectedServer, timeInterval, days]);

  useEffect(() => {
    if (selectedServer) {
      fetchData();
    }
    if (autoRefresh) {
      const intervalId = setInterval(fetchData, 60000);
      return () => clearInterval(intervalId);
    }
  }, [fetchData, autoRefresh, selectedServer]);

  const formatXAxis = (tickItem) => {
    const date = new Date(tickItem);
    return `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  const renderOverviewCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {metrics.map((metric) => {
        const latestData = data[data.length - 1];
        const value = latestData ? latestData[metric.key] : null;
        return (
          <div key={metric.key} className="gray700 shadow rounded-lg p-4">
            <h3 className="text-sm font-semibold textwhite mb-1">{metric.label}</h3>
            <p className="text-2xl textwhite font-bold">{value !== null ? `${value.toFixed(2)}%` : 'N/A'}</p>
          </div>
        );
      })}
    </div>
  );

  const renderMainChart = () => (
    <div className="gray700 shadow rounded-lg p-4 col-span-4">
      <h3 className="text-lg textwhite font-semibold mb-4">Server Performance Overview</h3>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" tickFormatter={formatXAxis} />
          <YAxis />
          <Tooltip labelFormatter={(label) => new Date(label).toLocaleString()} />
          <Legend />
          {metrics.map((metric) => (
            <Line
              key={metric.key}
              type="monotone"
              dataKey={metric.key}
              name={metric.label}
              stroke={metric.color}
              strokeWidth={2}
              dot={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );

  const renderDetailCharts = () => (
    <>
      {metrics.map((metric) => (
        <div key={metric.key} className="gray700 shadow rounded-lg p-4 col-span-2">
          <h3 className="text-lg textwhite font-semibold mb-4">{metric.label}</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tickFormatter={formatXAxis} />
              <YAxis />
              <Tooltip labelFormatter={(label) => new Date(label).toLocaleString()} />
              <Bar dataKey={metric.key} fill={metric.color} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ))}
    </>
  );

  return (
    <div className="container mx-auto p-4 graybg min-h-screen">
      <h1 className="text-3xl font-bold mb-6 textwhite">Server Monitoring Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <select
          value={selectedServer?.id || ''}
          onChange={(e) => setSelectedServer(servers.find(s => s.id.toString() === e.target.value))}
          className="input"
        >
          <option value="">Select a server</option>
          {servers.map((server) => (
            <option key={server.id} value={server.id}>
              {server.server_name} ({server.server_ip})
            </option>
          ))}
        </select>

        <select
          value={timeInterval}
          onChange={(e) => setTimeInterval(e.target.value)}
          className="input"
        >
          {timeIntervals.map((interval) => (
            <option key={interval.value} value={interval.value}>
              {interval.label}
            </option>
          ))}
        </select>

        <div className="flex items-center space-x-2">
          <input
            type="number"
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            min="1"
            max="30"
            className="input w-20"
          />
          <span className="textwhite">days</span>
        </div>
      </div>

      <div className="flex justify-between items-center mb-6">
        <button
          onClick={fetchData}
          disabled={isLoading || !selectedServer}
          className={`px-4 py-2 rounded-md textwhite font-semibold ${
            isLoading || !selectedServer
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50'
          }`}
        >
          {isLoading ? "Loading..." : "Refresh Data"}
        </button>
        <div className="flex items-center space-x-2">
          <label className="inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={() => setAutoRefresh(!autoRefresh)}
              className="sr-only peer"
            />
            <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">Auto-refresh</span>
          </label>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      )}

      {selectedServer && data.length > 0 && (
        <>
          {renderOverviewCards()}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {renderMainChart()}
            {renderDetailCharts()}
          </div>
        </>
      )}

      {(!selectedServer || data.length === 0) && !isLoading && !error && (
        <div className="gray700 shadow rounded-lg p-6 text-center">
          <svg className="mx-auto h-12 w-12 textwhite" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium textwhite">No server selected</h3>
          <p className="mt-1 text-sm textwhite">Select a server to view monitoring data</p>
        </div>
      )}
    </div>
  );
};

export default ServerMonitoringDashboard;