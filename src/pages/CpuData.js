import React, { useState, useEffect } from "react";
import axios from "axios";
import image from "../asset/11.gif";
import { useNavigate } from "react-router-dom";
import { Line } from "react-chartjs-2";
import {
  Chart,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { FiRotateCw, FiTrash2 } from "react-icons/fi";
import { FaEye, FaScrewdriverWrench, FaTimeline } from "react-icons/fa6";
import { FaSpinner, FaTimes } from "react-icons/fa";
Chart.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function CpuData() {
  const [data, setData] = useState([]);
  const [cdata, setCData] = useState([]);
  const [showRestartConfirmation, setShowRestartConfirmation] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [showConfigConfirmation, setShowConfigConfirmation] = useState(false);
  const [selectedServer, setSelectedServer] = useState(null);
  const [isSubmit, setIsSubmit] = useState(false);
  const [userPermissions, setUserPermissions] = useState({});
  const [selectedServerIP, setSelectedServerIP] = useState(null);
  const [isSubmiting, setIsSubmiting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedServerName, setSelectedServerName] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [interfaceDetail, setInterface] = useState([]);
  const [showAwsPopup, setShowAwsPopup] = useState(false);
  const [awsIpLogs, setAwsIpLogs] = useState([]);
  const navigate = useNavigate();
  
  useEffect(() => {
    let isMounted = true;
    const source = axios.CancelToken.source();

    const fetchData = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URI}/cpu-usage`,
          {
            headers: {
              Authorization: JSON.parse(localStorage.getItem("token")),
            },
            cancelToken: source.token,
          }
        );
        if (isMounted) {
          console.log(response);
          setData(response.data);
        }
      } catch (error) {
        if (axios.isCancel(error)) {
          console.log("Request canceled");
        } else {
          console.error("Error:", error);
        }
      }
    };

    const interval = setInterval(() => {
      fetchData();
      fetchClickServer();
    }, 1500);

    return () => {
      isMounted = false;
      source.cancel("Component unmounted");
      clearInterval(interval);
    };
  }, []);

  

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedPermissions = localStorage.getItem("userPermissions");
    if (storedToken) {
      if (storedPermissions) {
        setUserPermissions(JSON.parse(storedPermissions));
      }
    } 
  }, []);

  const fetchClickServer = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URI}/click-cpu-usage`,
        {
          headers: {
            Authorization: JSON.parse(localStorage.getItem("token")),
          }
        }
      );
      if (response) {
        console.log(response);
        setCData(response.data);
      }
    } catch (error) {
      if (axios.isCancel(error)) {
        console.log("Request canceled");
      } else {
        console.error("Error:", error);
      }
    }
  };

  const handleRestart = (servername, serverName) => {
    console.log("Restart button clicked for server:", serverName);
    setSelectedServer(serverName);
    setSelectedServerName(serverName);
    setShowRestartConfirmation(true);
  };

  const handleDelete = (serverId, serverName) => {
    console.log("Delete button clicked for server:", serverId);
    setSelectedServer(serverId);
    setSelectedServerName(serverName);
    setShowDeleteConfirmation(true);
  };

  const handleConfirmRestart = async () => {
    setIsSubmit(true);
    console.log("Confirm restart button clicked for server:", selectedServer);
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URI}/reboot`,
        {
          server_name: selectedServer,
        },
        {
          headers: {
            Authorization: JSON.parse(localStorage.getItem("token")),
          },
        }
      );
      if (response.status === 200) {
        alert("Server Restared Sucessfully")
        window.location.reload();
        setIsSubmit(false);
        setShowRestartConfirmation(false);
      } else {
        alert("Failed To Restart server")
        setIsSubmit(false);
        console.error("Restart request failed with status:", response.status);
        console.error("Error message:", response.data);
      }
    } catch (error) {
      console.error("Error during restart request:", error);
      if (error.response) {
        console.error("Response status:", error.response.status);
        console.error("Response data:", error.response.data);
      }
    }
  };

  const handleCancelRestart = () => {
    setShowRestartConfirmation(false);
  };

  const handleConfirmDelete = async () => {
    setIsSubmiting(true)
    console.log("Confirm delete button clicked for server:", selectedServer);
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URI}/delete-server`,
        {
          id: selectedServer,
        },
        {
          headers: {
            Authorization: JSON.parse(localStorage.getItem("token")),
          },
        }
      );
      if (response.status === 200) {
        alert("Server Deleted Sucessfully")
        window.location.reload();
        setShowDeleteConfirmation(false);
        setIsSubmiting(false)
      }
    } catch (error) {
      console.error(error);
    }
  };

  const fetchAwsIpLogs = async (serverId) => {
  console.log("aws id",serverId)
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URI}/aws-ip-log/${serverId}`);
      setAwsIpLogs(response.data);
      setShowAwsPopup(true);
    } catch (error) {
      console.error('Error fetching AWS IP logs:', error);
      alert('Failed to fetch AWS IP logs');
    }
  };

  const serverUsagebutton =()=>{
    navigate('/serverusage')
  }

  const handleCancelDelete = () => {
    setShowDeleteConfirmation(false);
  };

  const handleAddServer = () => {
    navigate("/addserver");
  };

  const handleView = (interface_detail) => {
    console.log(interface_detail)
    if (interface_detail) {
      setInterface(JSON.parse(interface_detail))
    }
    else {
      setInterface(null)
    }

    setShowPopup(true);
  }

  const handleConfig = (serverIP) => {
    console.log("Config button clicked for server IP:", serverIP);
    setSelectedServerIP(serverIP);
    setShowConfigConfirmation(true);
  };

  const handleConfirmConfig = async () => {
    setIsLoading(true);
    console.log("Confirm config button clicked for server IP:", selectedServerIP);
    console.log(selectedServerIP);

    try {
      let response = await axios.get(
        `${process.env.REACT_APP_API_URI}/gc-init/${selectedServerIP}`
      );
      if (response.status === 200) {
        alert('configuration successful');
        setIsLoading(false);
        setShowConfigConfirmation(false);
      } else {
        const errorMessage = response.data?.message || 'An error occurred during configuration.';
        alert(errorMessage);
      }
    } catch (error) {
      if (error.response) {

        const errorMessage = error.response.data?.message || 'An error occurred during configuration.';
        alert(errorMessage);
        setShowConfigConfirmation(false);
        setIsLoading(false);

      } else {
        alert('An error occurred during configuration: ' + error.message);
        setShowConfigConfirmation(false);
        setIsLoading(false);
      }
      console.error(error);
    }
  };

  const hasPermission = (permission) => {
    return userPermissions[permission];
  };

  const handleCancelConfig = () => {
    setShowConfigConfirmation(false);
  };

  const isAdmin = () => {
    return localStorage.getItem('admin') === 'true';
  };

  const chartData = {
    labels: data.map((item) => item.server.server_name),
    datasets: [
      {
        label: "CPU Usage (%)",
        data: data.map((item) => item.cpu),
        backgroundColor: "rgba(75, 192, 192, 0.6)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
      {
        label: "Memory Usage (%)",
        data: data.map((item) => item.mem),
        backgroundColor: "rgba(255, 99, 132, 0.6)",
        borderColor: "rgba(255, 99, 132, 1)",
        borderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const chartData2 = {
    labels: data.map((item) => item.server.server_name),
    datasets: [
      {
        label: "Network Load (mbps)",
        data: data.map((item) => item.nload),
        backgroundColor: "green",
        borderColor: "rgba(55, 329, 153, 6)",
        borderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          stepSize: 20,
          color: "white",
        },
        grid: {
          color: "rgba(255, 255, 255, 0.1)",
        },
      },
      x: {
        ticks: {
          color: "white",
        },
        grid: {
          color: "rgba(255, 255, 255, 0.1)",
        },
      },
    },
    plugins: {
      legend: {
        labels: {
          color: "white",
        },
      },
    },
  };

  const chartOptions2 = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        max: 1200,
        ticks: {
          stepSize: 20,
          color: "white",
        },
        grid: {
          color: "rgba(255, 255, 255, 0.1)",
        },
      },
      x: {
        ticks: {
          color: "white",
        },
        grid: {
          color: "rgba(255, 255, 255, 0.1)",
        },
      },
    },
    plugins: {
      legend: {
        labels: {
          color: "white",
        },
      },
    },
  };

  return (
    <div className="dark:bg-zinc-800  rounded p-4">
      {data.length > 0 ? (
        <>
          <div className="flex flex-col md:flex-row mb-8">
            <div className="w-full bg-blue-600 dark:bg-gray-700 p-4 rounded-lg md:w-1/2 md:mr-4 mb-4 md:mb-0">
              <div style={{ height: "400px" }}>
                <Line data={chartData} options={chartOptions} />
              </div>
            </div>
            <div className="w-full bg-blue-600 dark:bg-gray-700 p-4 rounded-lg md:w-1/2">
              <div style={{ height: "400px" }}>
                <Line data={chartData2} options={chartOptions2} />
              </div>
            </div>
          </div>
          {isAdmin() && (
          <div className="flex justify-between">
               <button
              onClick={serverUsagebutton}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-700 text-white rounded-md hover:scale-110"

            >
              Server Usage
            </button>
            <button
              onClick={handleAddServer}
              className="px-4 py-2 bg-green-500 hover:bg-green-700 text-white rounded-md hover:scale-110"

            >
              Add New Server
            </button>
          </div> )}
          <br />
          <div className="overflow-x-auto rounded-xl">
            <table className="min-w-full divide-y divide-gray-200 graybg rounded-lg shadow-lg">
              <thead className="bg-blue-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                    Server Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                    CPU Usage
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                    Memory Usage
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                    Network Load
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-white uppercase tracking-wider">
                    Server Status
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-white uppercase tracking-wider">
                    Cloud Status
                  </th>
                  {hasPermission("server_write") && (
                    <th className="px-6 py-3 text-right text-xs font-semibold text-white uppercase tracking-wider">
                      Action
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="graybg divide-y divide-gray-600">
                {data.map((item) => (
                  <tr key={item.server_name} className="border-b hover:bg-gray-300 dark:hover:bg-gray-700 border-gray-600">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium textwhite">
                      {item.server.server_name}
                    
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm textwhite">
                      {(item.server.gc_vm_status === "TERMINATED" || item.server.gc_vm_status === "DELETED") ? 0 : item.cpu} %
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm textwhite">
                      {(item.server.gc_vm_status === "TERMINATED" || item.server.gc_vm_status === "DELETED") ? 0 : item.mem} %
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm textwhite">
                      {typeof item.nload === 'string'
                        ? `${(item.server.gc_vm_status === "TERMINATED" || item.server.gc_vm_status === "DELETED") ? 0 : item.nload} mbps`
                        : item.server.server_name &&
                          (item.server.gc_vm_status === "TERMINATED" || item.server.gc_vm_status === "DELETED") ? "0 mbps" : item.nload.map((data) => (
                            <div key={data.interfaceName}>
                              {data.interfaceName} : {data.received} mbps
                            </div>
                          ))
                      }
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-white">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          item.server.gc_vm_status === "TERMINATED" || item.server.gc_vm_status === "DELETED"
                            ? "bg-red-100 text-red-800"
                            : item.status === "online"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {item.server.gc_vm_status === "TERMINATED"
                          ? "Terminated"
                          : item.server.gc_vm_status === "DELETED"
                          ? "Deleted"
                          : item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-white">
                      {item.server.gc_vm_status && (
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                            ${
                              item.server.gc_vm_status === "RUNNING"
                                ? "bg-green-100 text-green-800"
                                : item.server.gc_vm_status === "STOPPED"
                                ? "bg-yellow-100 text-yellow-800"
                                : item.server.gc_vm_status === "TERMINATED" || item.server.gc_vm_status === "DELETED"
                                ? "bg-red-100 text-red-800"
                                : "bg-red-100 text-red-800"
                            }`}
                        >
                          {item.server.gc_vm_status === "RUNNING"
                            ? "Running"
                            : item.server.gc_vm_status === "STOPPED"
                            ? "Stopped"
                            : item.server.gc_vm_status === "TERMINATED"
                            ? "Terminated"
                            : item.server.gc_vm_status === "DELETED"
                            ? "Deleted"
                            : "Unknown"}
                        </span>
                      )}
                    </td>
                    {hasPermission("server_write") && (
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {item.server.server_name.startsWith('aws') && (
                        <button
                          onClick={() => fetchAwsIpLogs(item.server.gc_vm_id)}
                          className="relative m-1 px-4 py-2 hover:scale-110 bg-blue-500 hover:bg-blue-600 mr-1 text-white rounded-md"
                          title="View AWS IP Logs"
                        >
                          <FaEye />
                        </button>
                      )}
                        {(item.server.server_name.startsWith("hs") || item.server.server_name.startsWith("gs") || item.server.server_name.startsWith("ls")) && (
                          <button
                            onClick={() => handleView(item.server?.interface_detail || null)}
                            className="relative m-1 px-4 py-2 hover:scale-110 bg-blue-500 hover:bg-blue-600 mr-1 text-white rounded-md"
                            title="View Status"
                          >
                            <FaEye />
                          </button>
                        )}
                        {(item.server.server_name.startsWith("hs") || item.server.server_name.startsWith("GT3P") || item.server.server_name.startsWith("gs") || item.server.server_name.startsWith("ls")) && (
                          <button
                            onClick={() => handleConfig(item.server.server_ip)}
                            className="relative m-1 px-4 py-2 hover:scale-110 bg-gray-500 hover:bg-gray-600 mr-1 text-white rounded-md"
                            title="Interface Config"
                          >
                            <FaScrewdriverWrench />
                          </button>
                        )}
                        <button
                          className="relative m-1 px-4 py-2 hover:scale-110 bg-yellow-500 hover:bg-yellow-600 mr-1 text-white rounded-md"
                          onClick={() => handleRestart(item.server.id, item.server.server_name)}
                          title="restart server"
                        >
                          <FiRotateCw />
                        </button>
                        <button
                          className="relative m-1 px-4 py-2 hover:scale-110 bg-red-500 hover:bg-red-600 mr-1 text-white rounded-md"
                          onClick={() => handleDelete(item.server.id, item.server.server_name)}
                          title="delete server"
                        >
                          <FiTrash2 />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="textwhite text text-2xl mt-8 text-center font-bold">Click Server Usage</p>

          <div className="overflow-x-auto rounded-xl mt-2">
            <table className="min-w-full divide-y divide-gray-200 graybg rounded-lg shadow-lg">
              <thead className="bg-blue-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                    Server Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                    CPU Usage
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                    Memory Usage
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                    Network Load
                  </th>

                </tr>
              </thead>
              <tbody className="graybg  divide-y divide-gray-600">
                {cdata.map((item) => (
                  <tr key={item.server_name} className="border-b hover:bg-gray-300 dark:hover:bg-gray-700 border-gray-600">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium textwhite">
                      {item.server.server_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm textwhite">
                      {(item.server.gc_vm_status === "TERMINATED" || item.server.gc_vm_status === "DELETED") ? 0 : item.cpu} %
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm textwhite">
                      {(item.server.gc_vm_status === "TERMINATED" || item.server.gc_vm_status === "DELETED") ? 0 : item.mem} %
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm textwhite">
                      {typeof item.nload === 'string'
                        ? `${(item.server.gc_vm_status === "TERMINATED" || item.server.gc_vm_status === "DELETED") ? 0 : item.nload} mbps`
                        : item.server.server_name &&
                          (item.server.gc_vm_status === "TERMINATED" || item.server.gc_vm_status === "DELETED") ? "0 mbps" : item.nload.map((data) => (
                            <div key={data.interfaceName}>
                              {data.interfaceName} : {data.received} &nbsp;
                              {/* : {data.sent}  */}
                              mbps
                            </div>
                          ))
                      }
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div className="text-blue-600 text-center">
          <p>Loading Please Wait!</p>
          <br />
          <img src={image} alt="" className="h-40 mx-auto rounded-full" />
        </div>
      )}
      {showRestartConfirmation && (
        <div className="fixed inset-0  flex items-center justify-center z-50">
          <div className="gray700 text-black rounded-lg p-8 shadow-lg">
            <h2 className="text-xl textwhite font-bold mb-4">Confirm Restart</h2>
            <p className="mb-6 textwhite">
              Are you sure you want to restart <strong>{selectedServerName}</strong> server?
            </p>
            <div className="flex justify-end">
              <button
                className="px-4 py-2 bg-yellow-500 text-white rounded-md mr-2"
                onClick={handleConfirmRestart}
              >
                Yes
                {isSubmit && <span className="inline-block ml-2 animate-spin"><FaSpinner /></span>}
              </button>
              <button
                className="px-4 py-2 bg-gray-400 text-white rounded-md"
                onClick={handleCancelRestart}
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteConfirmation && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="gray700 text-black rounded-lg p-8 shadow-lg">
            <h2 className="text-xl font-bold textwhite mb-4">Confirm Delete</h2>
            <p className="mb-6 textwhite">
              Are you sure you want to delete <strong>{selectedServerName}</strong> server?
            </p>
            <div className="flex justify-end">
              <button
                className="px-4 py-2 bg-red-500 text-white rounded-md mr-2"
                onClick={handleConfirmDelete} >
                Yes
                {isSubmiting && (
                  <span className="inline-block ml-2 animate-spin"><FaSpinner /></span>)}
              </button>
              <button
                className="px-4 py-2 bg-gray-400 text-white rounded-md"
                onClick={handleCancelDelete} >
                No
              </button>
            </div>
          </div>
        </div>
      )}
      {showConfigConfirmation && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="gray700 text-black rounded-lg p-8 shadow-lg">
            <h2 className="text-xl font-bold textwhite mb-4">Confirm Config</h2>
            <p className="mb-6 textwhite">Are you sure you want to configure this server?</p>
            <div className="flex justify-end">
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded-md mr-2"
                onClick={handleConfirmConfig}
              >
                Yes
                {isLoading && <span className="inline-block ml-2 animate-spin"><FaSpinner /></span>}
              </button>
              <button
                className="px-4 py-2 bg-gray-400 text-white rounded-md"
                onClick={handleCancelConfig}>
                No
              </button>
            </div>
          </div>
        </div>
      )}

{showAwsPopup && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="gray700 rounded-lg p-8 shadow-lg max-w-2xl max-h-[80vh] overflow-auto">
             <div className="flex justify-between mt-4">
                         <h2 className="text-xl font-bold mb-4 textwhite">AWS IP Logs</h2>

              <button
                className="px-2 bg-red-500 text-white rounded-lg mb-4"
                onClick={() => setShowAwsPopup(false)}
              >
                <FaTimes/>
              </button>
            </div>
            {awsIpLogs.length > 0 ? (
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="px-4 py-2 textwhite">Private IP</th>
                    <th className="px-4 py-2 textwhite">Public IP</th>
                  </tr>
                </thead>
                <tbody>
                  {awsIpLogs.map((log, index) => (
                    <tr key={index} className="border-t border-gray-600">
                      <td className="px-4 py-2 textwhite">{log.private_ip}</td>
                      <td className="px-4 py-2 textwhite">{log.public_ip}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="textwhite">No AWS IP logs found</p>
            )}
            <div className="flex justify-end mt-4">
              <button
                className="px-4 py-2 bg-gray-400 text-white rounded-md"
                onClick={() => setShowAwsPopup(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
           {showPopup &&
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="gray700 rounded-lg p-8 shadow-lg">
            <h2 className="text-xl font-bold mb-4 textwhite">Status Details</h2>
            {interfaceDetail ?
              interfaceDetail.map((data) => (
                <div key={data.interface}>
                  <p className="textwhite">
                    Interface : <strong>{data.interface}</strong>  &nbsp;
                    IP : <strong> {data.ip} </strong>
                  </p>
                </div>
              )) : <p className="textwhite">No Data Found</p>}
            <div className="flex justify-end mt-4">
              <button
                className="px-4 py-2 bg-gray-400 text-white rounded-md"
                onClick={() => setShowPopup(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  );
}
