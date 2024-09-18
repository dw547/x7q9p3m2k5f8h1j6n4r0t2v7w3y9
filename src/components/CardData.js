import React, { useState, useEffect } from "react";
import image from "../asset/11.gif";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaPlay, FaSkullCrossbones, FaSpinner, FaStop, FaTrash } from "react-icons/fa";
import { FaEye } from "react-icons/fa6";

const CardData = () => {
  const [processDataArray, setProcessDataArray] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filteredProcesses, setFilteredProcesses] = useState([]);
  const [serverFilter, setServerFilter] = useState("All Servers");
  const [searchValue, setSearchValue] = useState("");
  const [totalQPS, setTotalQPS] = useState(0);
  const [selectedServer, setSelectedServer] = useState(null);
  const [selectedServers, setSelectedServers] = useState([]);
  const [isStartSubmitting, setIsStartSubmitting] = useState(false);
  const [isStopSubmitting, setIsStopSubmitting] = useState(false);
  const [isDeleteSubmitting, setIsDeleteSubmitting] = useState(false);
  const [isForceDeleteSubmitting, setIsForceDeleteSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isSubmit, setIsSubmit] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [userPermissions, setUserPermissions] = useState({});


  const navigate = useNavigate();
  const apiUrl = `${process.env.REACT_APP_API_URI}/all-processes`;

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedPermissions = localStorage.getItem("userPermissions");
    if (storedToken) {
      setUserPermissions(safeJsonParse(storedPermissions, {}));
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = safeJsonParse(localStorage.getItem("token"), "");
        
        const response = await axios.get(apiUrl, {
          headers: { Authorization: token },
        });
        console.log(response)
  
        if (response.status === 200) {
          const newData = response.data;
          setProcessDataArray(newData);
  
          const storedServer = localStorage.getItem('selectedServer');
          if (storedServer && storedServer !== "All Servers") {
            const filteredData = newData.filter(
              (processData) => processData.server_list.server_name === storedServer
            );
  
            if (filteredData.length === 0) {
              setServerFilter("All Servers");
              localStorage.removeItem('selectedServer');
              setFilteredProcesses(newData);
  
              const totalQPS = newData.reduce(
                (sum, processData) => sum + processData.tick_rate,
                0
              );
              setTotalQPS(totalQPS);
            } else {
              setServerFilter(storedServer);
              setFilteredProcesses(filteredData);
  
              const totalQPS = filteredData.reduce(
                (sum, processData) => sum + processData.tick_rate,
                0
              );
              setTotalQPS(totalQPS);
            }
          } else {
            setFilteredProcesses(newData);
  
            const totalQPS = newData.reduce(
              (sum, processData) => sum + processData.tick_rate,
              0
            );
            setTotalQPS(totalQPS);
          }
        } else {
          console.error(
            "Failed to fetch data:",
            response.status,
            response.statusText
          );
        }
      } catch (error) {
        if (error.response && error.response.status === 401) {
          navigate("/login");
        } else if (error.response && error.response.status === 403) {
          setPermissionDenied(true);
        } else {
          console.error("Error fetching data:", error);
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [navigate, apiUrl]);

  const safeJsonParse = (jsonString, defaultValue = null) => {
    if (typeof jsonString !== 'string') {
      return defaultValue;
    }
    
    try {
      return JSON.parse(jsonString);
    } catch (error) {
      console.error('Error parsing JSON:', error);
      return defaultValue;
    }
  };

  const handleViewProcess = (selectedProcessData) => {
    window.open(`/viewprocess?id=${selectedProcessData.process_id}`, "_blank");
  };

  const hasPermission = (permission) => {
    return userPermissions[permission];
  };

  const handleSearchChange = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchValue(value);

    let filteredData = processDataArray;

    if (value !== "") {
      filteredData = filteredData.filter(
        (processData) =>
          processData.process_name.toLowerCase().includes(value) ||
          processData.process_id.toString().includes(value) ||
          processData.server_list.server_name.toLowerCase().includes(value) ||
          (typeof processData.process_status === 'string' && processData.process_status.toLowerCase().includes(value)) ||
          (processData.link && processData.link.toLowerCase().includes(value))
      );
    }

    if (serverFilter !== "All Servers") {
      filteredData = filteredData.filter(
        (processData) => processData.server_list.server_name === serverFilter
      );
    }

    setFilteredProcesses(filteredData);

    const totalQPS = filteredData.reduce(
      (sum, processData) => sum + processData.tick_rate,
      0
    );
    setTotalQPS(totalQPS);
  };

  const handleSelectAllServers = (event) => {
    if (event.target.checked) {
      const allServerIds = filteredProcesses.map((processData) => processData.process_id);
      setSelectedServers(allServerIds);
    } else {
      setSelectedServers([]);
    }
  };

  const handleSelectServer = (serverId) => {
    if (selectedServers.includes(serverId)) {
      setSelectedServers(selectedServers.filter((id) => id !== serverId));
    } else {
      setSelectedServers([...selectedServers, serverId]);
    }
  };

  const controlSelectedServers = async (action) => {

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(`${process.env.REACT_APP_API_URI}/multi-process-control`, {
        action: action,
        server: {
          id: selectedServer.id,
          server_ip: selectedServer.server_ip,
          server_port: selectedServer.server_port,
        },
        process: selectedServers,
      }, {
        headers: { Authorization: JSON.parse(token) },
      });

      if (response.status === 200) {
        alert(`Successfully performed action: ${action}`)
        console.log(`Successfully performed action: ${action}`);
        window.location.reload();
      } else {
        alert(`Failed to ${action} processes:`, response.status, response.statusText);
        console.error(`Failed to ${action} processes:`, response.status, response.statusText);
      }
    } catch (error) {
      alert(`Error ${action}ing processes:`, error)
      console.error(`Error ${action}ing processes:`, error);
    }
  };

  const handleControlSelectedServers = (action) => {
    if (selectedServers.length === 0) {
      alert("No servers selected");
      return;
    }

    let confirmMessage = "";
    if (action === "delete") {
      confirmMessage = "Are you sure you want to delete the selected processes?";
    } else if (action === "force-delete") {
      confirmMessage = "Are you sure you want to force delete the selected processes?";
    }

    if (confirmMessage !== "") {
      const confirmed = window.confirm(confirmMessage);
      if (!confirmed) {
        return;
      }
    }

    switch (action) {
      case 'start':
        setIsStartSubmitting(true);
        break;
      case 'stop':
        setIsStopSubmitting(true);
        break;
      case 'delete':
        setIsDeleteSubmitting(true);
        break;
      case 'force-delete':
        setIsForceDeleteSubmitting(true);
        break;
      default:
        break;
    }

    controlSelectedServers(action)
      .then(() => {
        switch (action) {
          case 'start':
            setIsStartSubmitting(false);
            break;
          case 'stop':
            setIsStopSubmitting(false);
            break;
          case 'delete':
            setIsDeleteSubmitting(false);
            break;
          case 'force-delete':
            setIsForceDeleteSubmitting(false);
            break;
          default:
            break;
        }
      })
      .catch((error) => {
        switch (action) {
          case 'start':
            setIsStartSubmitting(false);
            break;
          case 'stop':
            setIsStopSubmitting(false);
            break;
          case 'delete':
            setIsDeleteSubmitting(false);
            break;
          case 'force-delete':
            setIsForceDeleteSubmitting(false);
            break;
          default:
            break;
        }
        console.error(`Error ${action}ing processes:`, error);
      });
  };

  const handleServerFilterChange = (event) => {
    setSelectedServer(false)
    const selectedServerName = event.target.value;
    setServerFilter(selectedServerName);
    localStorage.setItem('selectedServer', selectedServerName);

    let filteredData = processDataArray;

    if (selectedServerName !== "All Servers") {
      filteredData = filteredData.filter(
        (processData) => processData.server_list.server_name === selectedServerName
      );
    }

    if (searchValue !== "") {
      filteredData = filteredData.filter(
        (processData) =>
          processData.process_name.toLowerCase().includes(searchValue) ||
        processData.link.toLowerCase.includes(searchValue) ||
          processData.process_id.toString().includes(searchValue) ||
          processData.server_list.server_name
            .toLowerCase()
            .includes(searchValue) ||
          processData.process_status.toLowerCase().includes(searchValue)
      );
    }

    setFilteredProcesses(filteredData);
    const totalQPS = filteredData.reduce(
      (sum, processData) => sum + processData.tick_rate,
      0
    );
    setTotalQPS(totalQPS);
  };

  const aggregatedData = filteredProcesses.reduce((acc, processData) => {
    const { server_name } = processData.server_list;
    if (!acc[server_name]) {
      acc[server_name] = {
        server_name,
        processes: [],
        totalQPS: 0,
      };
    }
    acc[server_name].processes.push(processData);
    acc[server_name].totalQPS += processData.tick_rate;
    if (processData.process_status !== 'online') {
      acc[server_name].status = 'offline';
    }
    return acc;
  }, {});

  const handleCardClick = (serverName) => {
    const serverData = processDataArray.find(
      (processData) => processData.server_list.server_name === serverName
    ).server_list;

    setSelectedServer(serverData);

    const filteredData = processDataArray.filter(
      (processData) => processData.server_list.server_name === serverName
    );
    setFilteredProcesses(filteredData);
    const totalQPS = filteredData.reduce(
      (sum, processData) => sum + processData.tick_rate,
      0
    );
    setTotalQPS(totalQPS);
    setServerFilter(serverName);
    localStorage.setItem('selectedServer', serverName);
  };

  const handleDelete = async (processData) => {
    setShowConfirmation(true);
    setSelectedServer(processData);
  };


  
  const handleConfirmDelete = async () => {
    setIsSubmit(true);
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URI}/change-process-status`,
        {
          serverId: selectedServer.server_list.id,
          action: "delete",
          process_id: selectedServer.process_id,
        },
        {
          headers: {
            Authorization: JSON.parse(localStorage.getItem("token")),
          },
        }
      );
      if (response.status === 200) {
        alert("Process Deleted Successfully");
        window.location.reload();
        setShowConfirmation(false);
      }
    } catch (error) {
      console.error(error);
      if (error.response && error.response.status === 401) {
        navigate("/login");
      }
    }
  };

  const handleCancelDelete = () => {
    setIsSubmit(false);
    setShowConfirmation(false);
  };

  const formatRelativeTime = (dateString) => {
    const padZero = (num) => num.toString().padStart(2, '0');

    const currentTime = new Date();
    const updatedTime = new Date(dateString);
    const timeDiff = currentTime - updatedTime;

    const seconds = Math.floor(timeDiff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    const displayHours = padZero(hours);
    const displayMinutes = padZero(minutes % 60);
    const displaySeconds = padZero(seconds % 60);

    return `${displayHours}:${displayMinutes}:${displaySeconds}`;
  };


  return (
    <div className="overflow-x-auto mt-4 zincbg rounded p-6 pt-0 sm:mt-0">
      {isLoading ? (
        <div className="text-blue-600 text-center">
          <p>Loading Please Wait!</p>
          <br />
          <img src={image} alt="" className="h-40 mx-auto rounded-full" />
        </div>
      ) : permissionDenied ? (
        <div className="flex justify-center items-center h-screen">
          <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4 text-red-500">Permission Denied</h2>
            <p className="text-gray-600 dark:text-gray-400">You don't have the necessary permissions to access this data.</p>
          </div>
        </div>
      ) : processDataArray.length === 0 ? (
        <div className="text-gray-500 text-center">
          <p>No process running</p>
        </div>
      ) : (
        <>
          <div className="flex flex-col sm:flex-row graybg p-2 rounded-xl items-center justify-between mb-6">
            <div className="mb-2 sm:mb-0">
              <input
                type="text"
                placeholder="Search by name or ID"
                className="w-full border bg-gray-100 textwhite dark:bg-gray-700 text-sm p-2 mr-2 rounded-md sm:w-auto"
                value={searchValue}
                onChange={handleSearchChange}
              />
            </div>
            <div className="p-2 m-2 mt-1 border bg-gray-100 textwhite dark:bg-gray-700 text-sm rounded-md">
              Running Processes:{" "}
              <span className="font-bold">
                {
                  filteredProcesses.filter(
                    (processData) => processData.process_status === "online"
                  ).length
                }
              </span>
            </div>
            <div className="p-2 m-2 mt-1 border bg-gray-100 textwhite dark:bg-gray-700 text-sm rounded-md">
              Total QPS = <span className="font-bold">{totalQPS}</span>
            </div>
            <div className="mb-2 sm:mb-0">
              <select
                className="w-full border bg-gray-100 textwhite dark:bg-gray-700 text-sm p-2 rounded-md sm:w-auto"
                value={serverFilter}
                onChange={handleServerFilterChange}
              >
                <option value="All Servers">All Servers</option>
                {processDataArray
                  .map((processData) => processData.server_list.server_name)
                  .filter((value, index, self) => self.indexOf(value) === index)
                  .map((serverName, index) => (
                    <option key={index} value={serverName}>
                      {serverName}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {Object.values(aggregatedData).map((serverData, index) => (
              <div
                key={index}
                className={`bg-gradient-to-r graybg p-6 rounded-xl shadow-xl hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors duration-300 transform hover:-translate-y-1 hover:scale-105 ${selectedServer && selectedServer.server_name === serverData.server_name ? "  pb-4 pr-20 pl-20 border-4 border-blue-500" : ""
                  }`}
                onClick={() => handleCardClick(serverData.server_name)}
              >
                <p className="textwhite text-center font-bold text-lg mb-2">Server: {serverData.server_name}</p>
                <p className="textwhite text-center mb-1">Processes Running: {serverData.processes.length}</p>
                <p className="textwhite text-center mb-4">Total QPS: {serverData.totalQPS}</p>

                {selectedServer && selectedServer.server_name === serverData.server_name && hasPermission("process_write") &&  (
                  <div className="flex flex-wrap justify-center gap-2 mt-4">
                    <button
                      className="bg-green-500 hover:bg-green-600 hover:scale-110 rounded-full p-2 textwhite flex items-center justify-center transition-all duration-300 text-sm sm:text-base"
                      onClick={() => handleControlSelectedServers('start')}
                      title="Start Selected Process"
                      disabled={selectedServers.length === 0}
                    >
                      <FaPlay className="mr-1 sm:mr-2" />
                      <span className="hidden sm:inline">Start</span>
                      {isStartSubmitting && <FaSpinner className="ml-1 sm:ml-2 animate-spin" />}
                    </button>
                    <button
                      className="bg-red-500 hover:bg-red-600 hover:scale-110 rounded-full p-2 textwhite flex items-center justify-center transition-all duration-300 text-sm sm:text-base"
                      onClick={() => handleControlSelectedServers('stop')}
                      title="Stop Selected Process"
                      disabled={selectedServers.length === 0}
                    >
                      <FaStop className="mr-1 sm:mr-2" />
                      <span className="hidden sm:inline">Stop</span>
                      {isStopSubmitting && <FaSpinner className="ml-1 sm:ml-2 animate-spin" />}
                    </button>
                    <button
                      className="bg-red-700 hover:bg-red-800 hover:scale-110 rounded-full p-2 textwhite flex items-center justify-center transition-all duration-300 text-sm sm:text-base"
                      onClick={() => handleControlSelectedServers('delete')}
                      title="Delete Selected Process"
                      disabled={selectedServers.length === 0}
                    >
                      <FaTrash className="mr-1 sm:mr-2" />
                      <span className="hidden sm:inline">Delete</span>
                      {isDeleteSubmitting && <FaSpinner className="ml-1 sm:ml-2 animate-spin" />}
                    </button>
                    <button
                      className="bg-red-900 hover:bg-red-800 hover:scale-110 rounded-full p-2 textwhite flex items-center justify-center transition-all duration-300 text-sm sm:text-base"
                      onClick={() => handleControlSelectedServers('force-delete')}
                      title="Force Delete Selected Process"
                      disabled={selectedServers.length === 0}
                    >
                      <FaSkullCrossbones className="mr-1 sm:mr-2" />
                      <span className="hidden sm:inline">Force Delete</span>
                      {isForceDeleteSubmitting && <FaSpinner className="ml-1 sm:ml-2 animate-spin" />}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="overflow-x-auto rounded-xl">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-blue-700 textwhite">

                  {selectedServer && <th className="border-b text-sm font-medium p-4 text-left">
                    <input
                      type="checkbox"
                      checked={selectedServers.length === filteredProcesses.length}
                      onChange={handleSelectAllServers}
                    />
                    &nbsp; Select All
                  </th>}
                  {!selectedServer && <th className="border-b text-sm font-medium p-4 text-left">Sr No</th>}
                  <th className="border-b text-sm font-medium p-4 text-left">Process Name</th>
                  <th className="border-b text-sm font-medium p-4 text-left">Process ID</th>
                  <th className="border-b text-sm font-medium p-4 text-left">Server Name</th>
                  <th className="border-b text-sm font-medium p-4 text-left">Process Status</th>
                  <th className="border-b text-sm font-medium p-4 text-left">QPS</th>
                  <th className="border-b text-sm font-medium p-4 text-left">Updated Before</th>
                  <th className="border-b text-sm font-medium p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredProcesses.map((processData, index) => (
                  <tr
                    key={index}
                    className={`hover:bg-gray-300 dark:hover:bg-gray-700 graybg `}
                  >
                    {selectedServer && <td className="border-b  textwhite mr-3 border-gray-600 text-sm p-4">
                      <input
                        type="checkbox"
                        checked={selectedServers.includes(processData.process_id)}
                        onChange={() => handleSelectServer(processData.process_id)}
                      />
                    </td>}
                    {!selectedServer && <td onClick={() => handleViewProcess(processData)} className="border-b  textwhite border-gray-600 text-sm p-4">
                      {index + 1}
                    </td>}
                    <td onDoubleClick={() => handleViewProcess(processData)} className="border-b  textwhite border-gray-600 text-sm p-4">
                      {processData.process_name}
                    </td>
                    <td onDoubleClick={() => handleViewProcess(processData)} className="border-b  textwhite border-gray-600 text-sm p-4">
                      {processData.process_id}
                    </td>
                    <td onDoubleClick={() => handleViewProcess(processData)} className="border-b  textwhite border-gray-600 text-sm p-4">
                      {processData.server_list.server_name}
                    </td>
                    <td onDoubleClick={() => handleViewProcess(processData)} className="border-b  textwhite border-gray-600 text-sm p-4">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${processData.process_status === "online"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                          }`}
                      >
                        {processData.process_status}
                      </span>
                    </td>
                    <td onDoubleClick={() => handleViewProcess(processData)} className="border-b  textwhite border-gray-600 text-sm p-4">
                      {processData.tick_rate}
                    </td>
                    <td onDoubleClick={() => handleViewProcess(processData)} className="border-b textwhite border-gray-600 text-sm p-4">
                      {formatRelativeTime(processData?.updatedAt)}
                    </td>
                    <td className="border-b border-gray-600 text-sm p-4 text-right">
                      <div className="flex justify-end space-x-2">
                        <button
                          className="relative px-4 py-2 hover:scale-110 bg-blue-500 hover:bg-blue-600 textwhite font-bold rounded text-sm"
                          onClick={() => handleViewProcess(processData)}
                          title="View Process"
                        >
                          <FaEye className="fa-lg" />
                        </button>
                        {hasPermission("process_write") && (
                        <button
                          className="bg-red-500 hover:bg-red-600 hover:scale-110 relative text-white font-bold py-2 px-4 rounded flex items-center"
                          onClick={() => handleDelete(processData)}
                          title="Delete Process">
                          <FaTrash className="fa-lg" />
                        </button> )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
      {showConfirmation && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="gray700 text-black rounded-lg p-8 shadow-lg">
            <h2 className="text-xl textwhite font-bold mb-4">Confirm Delete</h2>
            <p className="mb-6 textwhite">
              Are you sure you want to delete the  <strong >{selectedServer.process_name}</strong> process?
            </p>
            <div className="flex justify-end">
              <button
                className="px-4 py-2 bg-red-500 textwhite rounded-md mr-2"
                onClick={handleConfirmDelete}
              >
                Yes
                {isSubmit && <span className="inline-block ml-2 animate-spin"><FaSpinner /></span>}
              </button>
              <button
                className="px-4 py-2 bg-gray-400 textwhite rounded-md"
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
};

export default CardData;
