import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaSpinner, FaEdit, FaTrash } from 'react-icons/fa';

const vpnOptions = [
  { name: "nine22" },
  { name: "luna" },
  { name: "pxs" },
];

export default function VPN() {
  const [newVpn, setNewVpn] = useState({
    name: '',
    host: '',
    port: '',
    username: '',
    password: '',
    description: '',
    proxy_list: '',
    tablesize: '',
    type: ''
  });
  const [vpnList, setVpnList] = useState(vpnOptions);
  const [submit, setSubmit] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [vpnName, setVpnName] = useState(null);
  const [vpnToDelete, setVpnToDelete] = useState(null);
  const [selectedVpn, setSelectedVpn] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [vpnStatus, setVpnStatus] = useState(null);

  useEffect(() => {
    fetchVpn();
  }, []);

  const fetchVpn = async () => {
    try {
      const token = JSON.parse(localStorage.getItem("token"));
      const headers = { Authorization: `${token}` };
      const response = await axios.get(`${process.env.REACT_APP_API_URI}/get-all-vpn`, { headers });
      setVpnList(response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setNewVpn(prevState => ({
      ...prevState,
      [id]: value
    }));
  };

  const handleAddVPN = async () => {
    if (!newVpn.name.trim()) {
      alert("Please enter a VPN name");
      return;
    }
    setSubmit(true);
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URI}/create-vpn`,
        newVpn,
        {
          headers: {
            Authorization: JSON.parse(localStorage.getItem("token")),
            'Content-Type': 'application/json'
          },
        }
      );
      if (response.status === 201) {
        setSubmit(false);
        setVpnList([...vpnList, newVpn]);
        setNewVpn({
          name: '',
          host: '',
          port: '',
          username: '',
          password: '',
          description: '',
          proxy_list: '',
          tablesize: '',
          type: ''
        });
        alert("VPN added successfully");
        fetchVpn(); 
      }
    } catch (error) {
      alert(error.response?.data?.message || "Error adding VPN");
      setSubmit(false);
    }
  };

  const handleUpdateVPN = async (vpn) => {
    const updatedName = prompt("Enter new name for VPN", vpn.name);
    if (updatedName && updatedName !== vpn.name) {
      try {
        const response = await axios.put(
          `${process.env.REACT_APP_API_URI}/update-vpn`,
          { oldName: vpn.name, newName: updatedName },
          {
            headers: {
              Authorization: JSON.parse(localStorage.getItem('token')),
              'Content-Type': 'application/json'
            }
          }
        );

        if (response.status === 200) {
          setVpnList(vpnList.map(v => v.name === vpn.name ? { ...v, name: updatedName } : v));
          alert("VPN updated successfully");
        }
      } catch (error) {
        console.error(error);
        alert("Error updating VPN");
      }
    }
  };

  const handleDeleteVPN = async () => {
    try {
      const response = await axios.delete(
        `${process.env.REACT_APP_API_URI}/delete-vpn/${vpnToDelete.name}`,
        {
          headers: {
            Authorization: JSON.parse(localStorage.getItem('token'))
          }
        }
      );

      if (response.status === 200) {
        setVpnList(vpnList.filter(v => v.name !== vpnToDelete.name));
        alert("VPN deleted successfully");
        setConfirmDelete(false);
        setVpnToDelete(null);
      }
    } catch (error) {
      console.error(error);
      alert("Error deleting VPN");
      setConfirmDelete(false);
      setVpnToDelete(null);
    }
  };

  const handleConfirmDelete = (vpn) => {
    setVpnToDelete(vpn);
    setVpnName(vpn.name);
    setConfirmDelete(true);
  };

  const handleGetDistinct = async () => {
    if (!selectedVpn) {
      alert("Please select a VPN");
      return;
    }
    setIsLoading(true);
    try {
      const token = JSON.parse(localStorage.getItem("token"));
      const headers = { Authorization: `${token}` };
      const response = await axios.get(`${process.env.REACT_APP_API_URI}/get-distinct-ip/${selectedVpn}`, { headers });
      setVpnStatus(response.data);
    } catch (error) {
      console.error("Error fetching VPN status:", error);
      alert("Error fetching VPN status");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full mx-auto p-6 space-y-8">
      <div className='graybg rounded-lg p-6 shadow-lg'>
        <h2 className='textwhite text-2xl font-bold mb-6'>Add/Update VPN</h2>

        <div className='grid grid-cols-2 gap-4 mb-6'>
          <div>
            <label className='block textwhite text-sm font-semibold mb-2' htmlFor="name">
              VPN Name
            </label>
            <input
              id="name"
              type='text'
              className='dropdown w-full rounded'
              value={newVpn.name}
              onChange={handleInputChange}
              placeholder="Enter VPN name"
            />
          </div>
          <div>
            <label className='block textwhite text-sm font-semibold mb-2' htmlFor="host">
              Host
            </label>
            <input
              id="host"
              type='text'
              className='dropdown w-full rounded'
              value={newVpn.host}
              onChange={handleInputChange}
              placeholder="Enter Host"
            />
          </div>
          <div>
            <label className='block textwhite text-sm font-semibold mb-2' htmlFor="port">
              Port Number
            </label>
            <input
              id="port"
              type='text'
              className='dropdown w-full rounded'
              value={newVpn.port}
              onChange={handleInputChange}
              placeholder="Enter Port Number" />
          </div>
          <div>
            <label className='block textwhite text-sm font-semibold mb-2' htmlFor="username">
              Username
            </label>
            <input
              id="username"
              type='text'
              className='dropdown w-full rounded'
              value={newVpn.username}
              onChange={handleInputChange}
              placeholder="Enter username"
              autoComplete="off"
            />
          </div>
          <div>
            <label className='block textwhite text-sm font-semibold mb-2' htmlFor="tablesize">
              Table Size
            </label>
            <input
              id="tablesize"
              type='number'
              className='dropdown w-full rounded'
              value={newVpn.tablesize}
              onChange={handleInputChange}
              placeholder="Enter ip number row"
              autoComplete="off"
            />
          </div>
          <div>
            <label className='block textwhite text-sm font-semibold mb-2' htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type='password'
              className='dropdown w-full rounded'
              value={newVpn.password}
              onChange={handleInputChange}
              placeholder="Enter Password"
              autoComplete="new-password"
            />
          </div>
          <div className="">
            <label className='block textwhite text-sm font-semibold mb-2' htmlFor="description">
              Description
            </label>
            <textarea
              id="description"
              className='dropdown w-full rounded'
              value={newVpn.description}
              onChange={handleInputChange}
              placeholder="Enter Description"
            />
          </div>
          <div className="">
            <label className='block textwhite text-sm font-semibold mb-2' htmlFor="proxy_list">
              Proxy List
            </label>
            <textarea
              id="proxy_list"
              className='dropdown w-full rounded'
              value={newVpn.proxy_list}
              onChange={handleInputChange}
              placeholder="Enter Proxy List"
            />
          </div>
          <div>
            <label className='textwhite font-semibold'>Select Type</label>
            <select
              id="type"
              className='dropdown w-full rounded'
              value={newVpn.type}
              onChange={handleInputChange}
            >
              <option value="">Select type</option>
              <option value='sid'>sid</option>
              <option value='static'>static</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleAddVPN}
            className="bg-blue-500 hover:bg-blue-700 hover:scale-105 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out"
          >
            Add VPN
            {submit && (
              <span className='ml-2 inline-block animate-spin'>
                <FaSpinner />
              </span>
            )}
          </button>
        </div>
      </div>

      <div className='graybg rounded-lg p-6 shadow-lg'>
        <h2 className='textwhite text-2xl font-bold mb-6'>VPN List</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-blue-700">
                <th className="px-4 py-2 text-left text-white">VPN Name</th>
                {/* <th className="px-4 py-2 text-right text-white">Action</th> */}
              </tr>
            </thead>
            <tbody>
              {vpnList.map((item) => (
                <tr key={item.name} className="border-b border-gray-600 hover:bg-gray-300 dark:hover:bg-gray-700 transition duration-300">
                  <td className="px-4 py-3 textwhite">{item.name}</td>
                  {/* <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleUpdateVPN(item)}
                      className="mr-2 bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-1 px-2 rounded transition duration-300 ease-in-out relative"
                      title="Edit VPN"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleConfirmDelete(item)}
                      className="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-2 rounded transition duration-300 ease-in-out relative"
                      title="Delete VPN"
                    >
                      <FaTrash />
                    </button>
                  </td> */}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className='graybg rounded-lg p-6 shadow-lg'>
        <h2 className='textwhite text-2xl font-bold mb-6'>VPN Status</h2>
        <div className="flex items-center space-x-4 mb-4">
          <select
            className="dropdown w-64 rounded"
            value={selectedVpn}
            onChange={(e) => setSelectedVpn(e.target.value)}
          >
            <option value="">Select VPN</option>
            {vpnList.map((vpn) => (
              <option key={vpn.name} value={vpn.name}>{vpn.name}</option>
            ))}
          </select>
          <button
            onClick={handleGetDistinct}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="inline-block animate-spin mr-2">
                <FaSpinner />
              </span>
            ) : null}
            Get Status
          </button>
        </div>
        {vpnStatus && (
          <div className="graybg rounded-lg p-4 mt-4">
            <h3 className="textwhite text-xl font-semibold mb-2">VPN Status Details</h3>
            <p className="textwhite">
              <span className="font-semibold">Distinct IP Count:</span> {vpnStatus.distinctIp['COUNT(ip)']}
            </p>
            <p className="textwhite">
              <span className="font-semibold">Total IP Count:</span> {vpnStatus.totalIp['COUNT(ip)']}
            </p>
            <p className="textwhite">
              <span className="font-semibold">Last Updated:</span> {new Date(vpnStatus.updatedAt.updatedAt).toLocaleString()}
            </p>
          </div>
        )}
      </div>

      {confirmDelete && (
        <div className='bg-black bg-opacity-50 inset-0 fixed flex justify-center items-center'>
          <div className='graybg rounded-lg p-8'>
            <h1 className='text-2xl font-bold textwhite mb-2'>Confirm Delete</h1>
            <h1 className='textwhite font-semibold'>
              Are you sure you want to delete {vpnName} Vpn?
            </h1>
            <div className='flex justify-end gap-2 mt-4'>
              <button className='bg-red-500 px-4 rounded-lg p-1 text-white' onClick={handleDeleteVPN}>Yes</button>
              <button className='bg-blue-500 px-4 rounded-lg p-1 text-white' onClick={() => setConfirmDelete(false)}>NO</button>
            </div>
          </div>
        </div>
      )}
      </div>
  )}