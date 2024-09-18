import React, { useState, useEffect } from "react";
import image from "../asset/11.gif";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaEye, FaEyeSlash, FaSpinner, FaTrash } from "react-icons/fa";

const Migration = () => {
  const [processDataArray, setProcessDataArray] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmit, setIsSubmit] = useState(false);
  const [availableServer, setAvailableServer] = useState([]);
  const [selectedSourceServer, setSelectedSourceServer] = useState(null);
  const [selectedDestinationServer, setSelectedDestinationServer] = useState(null);
  const [isSubmiting, setIsSubmiting] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [showDetails, setShowDetails] = useState({});
const[migrationToDelete,setMigrationToDelete]=useState(null)

  const navigate = useNavigate();

  const apiUrl = `${process.env.REACT_APP_API_URI}/get-migration`;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(apiUrl, {
          headers: { Authorization: JSON.parse(token) },
        });

        if (response.status === 200) {
          const newData = response.data;
          setProcessDataArray(newData.result);
          setIsRunning(newData.is_gs_automation);
        } else {
          alert.error(
            "Failed to fetch data:",
            response.status,
            response.statusText
          );
        }
      } catch (error) {
        if (error.response && error.response.status === 401) {
          navigate("/login");
        } else {
          console.error("Error fetching data:", error);
        }
      } finally {
        setIsLoading(false);
      }
    };

    const fetchServers = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${process.env.REACT_APP_API_URI}/all-servers`, {
          headers: {
            Authorization: JSON.parse(token),
          },
        });
        setAvailableServer(response.data);
      } catch (error) {
        console.error("Error fetching servers:", error);
      }
    };

    fetchData();
    fetchServers();
  }, [navigate]);

  const handleToggle = async () => {
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const action = isRunning ? "stop" : "start";
      const response = await axios.post(
        `${process.env.REACT_APP_API_URI}/control-gs-automation`,
        { action },
        { headers: { Authorization: JSON.parse(token) } }
      );

      if (response.status === 200) {
        alert("Successful");
        setIsRunning(!isRunning);
      } else {
        console.error("Failed to toggle process:", response.status, response.statusText);
      }
    } catch (error) {
      console.error("Error toggling process:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMigration = async () => {
    if (!selectedSourceServer || !selectedDestinationServer) {
      alert("Please select both source and destination servers.");
      return;
    }

    setIsSubmit(true);

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${process.env.REACT_APP_API_URI}/migrate-all-process`,
        {
          mfrom: selectedSourceServer,
          mto: selectedDestinationServer,
        },
        { headers: { Authorization: JSON.parse(token) } }
      );

      if (response.status === 200) {
        alert("Migration started successfully!");
      } else {
        console.error("Failed to start migration:", response.status, response.statusText);
      }
    } catch (error) {
      console.error("Error starting migration:", error);
    } finally {
      setIsSubmit(false);
    }
  };

  const handleSourceServerChange = (e) => {
    setSelectedSourceServer(e.target.value);
  };

  const handleDestinationServerChange = (e) => {
    setSelectedDestinationServer(e.target.value);
  };

  const handleConfirmDelete = async () => {
    setIsSubmiting(true);
    console.log("id",migrationToDelete)
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URI}/delete-migration/${migrationToDelete}`,
        {
          headers: {
            Authorization: JSON.parse(localStorage.getItem("token")),
          },
        }
      );
      if (response.status === 200) {
        alert("Details Deleted Successfully");
        window.location.reload();
        setShowDeleteConfirmation(false);
        setIsSubmiting(false);
      }
    } catch (error) {
      alert("Failed to delete details");
      setIsSubmiting(false);
      setShowDeleteConfirmation(false);
      setMigrationToDelete(null);
      console.error(error);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirmation(false);
  };

  const handleDelete = (id) => {
    setMigrationToDelete(id)
    setShowDeleteConfirmation(true);
  };

 
  const handleToggleDetails = (id, type) => {
    setShowDetails(prevState => ({
      ...prevState,
      [id]: {
        ...prevState[id],
        [type]: !prevState[id]?.[type]
      }
    }));
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row items-center justify-between mb-6 graybg p-4 rounded-xl">
        <button
          onClick={handleToggle}
          className={`px-4 py-2 font-bold text-white rounded ${isRunning ? "bg-red-500 hover:bg-red-600 hover:scale-110" : "bg-green-500 hover:bg-green-600 hover:scale-110"
            } ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
          disabled={isSubmitting}
        >
          {isRunning ? "Stop Automation" : "Start Automation"}
          {isSubmitting && (
            <span className="inline-block ml-2 animate-spin"><FaSpinner /></span>
          )}
        </button>

        <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4 mt-4 md:mt-0">
          <div>
            <select
              id="sourceServer"
              name="sourceServer"
              value={selectedSourceServer || ""}
              onChange={handleSourceServerChange}
              className="dropdown p-1 rounded-lg"
            >
              <option value="">Select Source Server</option>
              {availableServer.map((server) => (
                <option key={server.server_name} value={server.server_name}>
                  {server.server_name}
                </option>
              ))}
            </select>
          </div>
          <p className="text-white font-bold">TO</p>
          <div>
            <select
              id="destinationServer"
              name="destinationServer"
              value={selectedDestinationServer || ""}
              onChange={handleDestinationServerChange}
              className="dropdown p-1 rounded-lg"
            >
              <option value="">Destination Server</option>
              {availableServer.map((server) => (
                <option key={server.server_name} value={server.server_name}>
                  {server.server_name}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={handleMigration}
            className={`px-4 py-2 font-bold hover:scale-110 text-white rounded bg-blue-500 hover:bg-blue-600 ${isSubmit ? "opacity-50 cursor-not-allowed" : ""
              }`}
            disabled={isSubmit}
          >
            Start Migration
            {isSubmit && (
              <span className="inline-block ml-2 animate-spin"><FaSpinner /></span>
            )}
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="text-blue-600 text-center">
          <p>Loading Please Wait!</p>
          <br />
          <img src={image} alt="" className="h-40 mx-auto rounded-full" />
        </div>
      ) : processDataArray.length === 0 ? (
        <div className="text-gray-500 text-center">
          <p>Migration Data Not Available</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg">
          <table className="w-full border-collapse rounded-lg">
            <thead>
              <tr className="bg-blue-700 text-white rounded-lg">
                <th className="border-b text-sm font-medium p-4 text-left">Sr No</th>
                <th className="border-b text-sm font-medium p-4 text-left">ID</th>
                <th className="border-b text-sm font-medium p-4 text-left">Name</th>
                <th className="border-b text-sm font-medium p-4 text-left">Status</th>
                <th className="border-b text-sm font-medium p-4 text-left">Success</th>
                <th className="border-b text-sm font-medium p-4 text-left">Failed</th>
                <th className="border-b text-sm font-medium p-4 text-right">Completed</th>
                <th className="border-b text-sm font-medium p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {processDataArray.map((processData, index) => {
                const successProcesses = processData.success.split(",").filter((process) => process.trim() !== "");
                const failedProcesses = processData.failed.split(",").filter((process) => process.trim() !== "");

                return (
                  <tr key={index} className="graybg">
                    <td className="border-b textwhite border-gray-600 text-sm p-4">{index + 1}</td>
                    <td className="border-b textwhite border-gray-600 text-sm p-4">{processData.id}</td>
                    <td className="border-b textwhite border-gray-600 text-sm p-4">{processData.name}</td>
                    <td className="border-b textwhite border-gray-600 text-sm p-4">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${processData.status === "completed" || processData.status === "started"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                          }`}
                      >
                        {processData.status}
                      </span>
                    </td>
                    <td className="border-b textwhite border-gray-600 text-sm p-4 whitespace-pre-line">
                      {successProcesses.length > 0 && (
                        <button
                          onClick={() => handleToggleDetails(processData.id, 'success')}
                          className="bg-green-500 hover:bg-green-700 hover:scale-110 relative text-white font-bold py-2 px-4 rounded flex items-center mb-2"
                        >
                          {showDetails[processData.id]?.success ? <FaEyeSlash /> : <FaEye />}
                          <span className="ml-2"> ({successProcesses.length})</span>
                        </button>
                      )}
                      {showDetails[processData.id]?.success && (
                        <div>
                          {successProcesses.map((success, idx) => (
                            <div key={idx}>{success.trim()}</div>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="border-b textwhite border-gray-600 text-sm p-4 whitespace-pre-line">
                      {failedProcesses.length > 0 && (
                        <button
                          onClick={() => handleToggleDetails(processData.id, 'failed')}
                          className="bg-red-500 hover:bg-red-700 hover:scale-110 relative text-white font-bold py-2 px-4 rounded flex items-center mb-2"
                        >
                          {showDetails[processData.id]?.failed ? <FaEyeSlash /> : <FaEye />}
                          <span className="ml-2">({failedProcesses.length})</span>
                        </button>
                      )}
                      {showDetails[processData.id]?.failed && (
                        <div>
                          {failedProcesses.map((failed, idx) => (
                            <div key={idx}>{failed.trim()}</div>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="border-b textwhite border-gray-600 text-sm p-4 text-right">
                      {new Date(processData.completed_time).toLocaleString()}
                    </td>
                    <td className="border-b textwhite border-gray-600 text-sm p-4 text-right">
                      <button
                        className="bg-red-500 hover:bg-red-600 hover:scale-110 relative text-white font-bold py-2 px-4 rounded flex items-center"
                        onClick={()=>handleDelete(processData.id)}
                        title="Delete Automation">
                        <FaTrash className="fa-lg" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {showDeleteConfirmation && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white text-black rounded-lg p-8 shadow-lg">
            <h2 className="text-xl font-bold mb-4">Confirm Delete</h2>
            <p className="mb-6">Are you sure you want to delete server?</p>
            <div className="flex justify-end">
              <button
                className="px-4 py-2 bg-red-500 text-white rounded-md mr-2"
                onClick={handleConfirmDelete}
              >
                Yes
                {isSubmiting && (
                  <span className="inline-block ml-2 animate-spin"><FaSpinner /></span>
                )}
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
    </div>
  );
};

export default Migration;