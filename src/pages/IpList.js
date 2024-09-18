import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaSpinner, FaTrash } from "react-icons/fa";

export default function IpList() {
  const [serverData, setServerData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSubmit, setIsSubmit] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [selectedServerId, setSelectedServerId] = useState(null);

  useEffect(() => {
    const source = axios.CancelToken.source();
    const fetchServerData = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URI}/get-server-log`, {
          headers: {
            Authorization: JSON.parse(localStorage.getItem("token")),
          },
          cancelToken: source.token,
        });
        const data = response.data;
        setServerData(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching server data:', error);
        setServerData([]);
      }
    };
    fetchServerData();
    return () => {
      source.cancel("Request canceled by user");
    };
  }, []);

  const handleInputChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const isMatch = (ip) => {
    if (searchTerm.trim() === "") {
      return false;
    }
    return ip.toLowerCase().includes(searchTerm.toLowerCase());
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirmation(false);
    setSelectedServerId(null);
  };

  const handleDelete = (id) => {
    setSelectedServerId(id);
    setShowDeleteConfirmation(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedServerId) return;
console.log(selectedServerId)
    setIsSubmit(true);
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URI}/delete-server-log/${selectedServerId}`,
        {
          headers: {
            Authorization: JSON.parse(localStorage.getItem('token'))
          }
        }
      );
      if (response.status === 200) {
        alert("Deleted Successfully");
        setServerData(serverData.filter(data => data.id !== selectedServerId));
      }
    } catch (error) {
      console.error('Error deleting IP:', error);
      alert("Failed to delete");
    } finally {
      setIsSubmit(false);
      setShowDeleteConfirmation(false);
      setSelectedServerId(null);
    }
  };

  return (
    <div className="container mx-auto px-4">
      <div className='flex justify-center w-full mb-4'>
        <input
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          placeholder="Search By IP"
          className="w-full max-w-md p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="bg-blue-700 text-white p-2 text-center text-lg font-semibold rounded-t-lg">
          Interface Details
        </div>
        <div className="overflow-x-auto">
          <table className="w-full table-auto text-left">
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {serverData.map((data) => {
                const interfaces = data.interface_detail ? JSON.parse(data.interface_detail) : [];
                return (
                  <tr key={data.id} className="hover:bg-gray-100 dark:hover:bg-gray-700">
                    <td className="px-4 py-3 whitespace-nowrap text-right">
                      <button
                        className='bg-red-500 hover:scale-105 hover:bg-red-700 text-white p-2 rounded-lg relative'
                        title='Delete'
                        onClick={() => handleDelete(data.id)}
                      >
                        <FaTrash />
                      </button>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {data.server_name}
                    </td>
                    {interfaces.length > 0 ? (
                      interfaces.map((item, index) => (
                        <td key={`${data.id} - ${index}`} className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                          <span className="font-medium">{item?.interface || "N/A"}:</span>
                          &nbsp;
                          <span className={isMatch(item.ip) ? 'bg-yellow-200 dark:bg-yellow-700 px-1 rounded' : ''}>
                            {item?.ip || "N/A"}
                          </span>
                        </td>
                      ))
                    ) : (
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                        N/A : N/A
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      {showDeleteConfirmation && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white text-black rounded-lg p-8 shadow-lg">
            <h2 className="text-xl font-bold mb-4">Confirm Delete</h2>
            <p className="mb-6">Are you sure you want to delete this server?</p>
            <div className="flex justify-end">
              <button
                className="px-4 py-2 bg-red-500 text-white rounded-md mr-2"
                onClick={handleConfirmDelete}
                disabled={isSubmit}
              >
                Yes
                {isSubmit && (
                  <span className="inline-block ml-2 animate-spin"><FaSpinner /></span>
                )}
              </button>
              <button
                className="px-4 py-2 bg-gray-400 text-white rounded-md"
                onClick={handleCancelDelete}
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}