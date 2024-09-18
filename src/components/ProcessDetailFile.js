import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import image from "../asset/11.gif";
import LogPopup from "./LogPopup";
import { FaBook, FaCopy, FaEdit, FaEye, FaPlay, FaRedo, FaSkullCrossbones, FaSpinner, FaStop, FaTimes, FaTrash } from "react-icons/fa";

const ProcessDetailFile = () => {
  const id = window.location.search.substring(4);
  const [processDetails, setProcessDetails] = useState(null);
  const [isProcessRunning, setIsProcessRunning] = useState(false);
  const [isCopy, setIsCopy] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmit, setIsSubmit] = useState(false);
  const [isSubmiting, setIsSubmiting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showForceDeleteConfirmation, setShowForceDeleteConfirmation] = useState(false);
  const [processDataNotFound, setProcessDataNotFound] = useState(false);
  const [userPermissions, setUserPermissions] = useState({});
  const [hasRequiredProperties, setHasRequiredProperties] = useState(false);
  const [showData, setShowData] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URI}/single-process/${id}`,
          {
            headers: {
              Authorization: JSON.parse(localStorage.getItem("token")),
            },
          }
        );
        if (response.status === 200) {
          const data = response.data;
          console.log(response.data)
          setProcessDetails(data);
          setIsCopy(data.os_type === "nil");
          setIsProcessRunning(data.process_status === "online");

          const hasProperties = data.hardmask.every((item) =>
            item.hardmask_type || (item.appname && item.appbundle && item.appurl)
          );
          setHasRequiredProperties(hasProperties);
        } else {
          console.error("Failed to fetch data:", response.status, response.statusText);
          setProcessDataNotFound(true);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        if (error.response && error.response.status === 401) {
          navigate("/login");
        } else {
          setProcessDataNotFound(true);
        }
      }
    };
    fetchData();
  }, [id, navigate]);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedPermissions = localStorage.getItem("userPermissions");
    if (storedToken) {
      if (storedPermissions) {
        setUserPermissions(JSON.parse(storedPermissions));
      }
    }
  }, [])

  const hasPermission = (permission) => {
    return userPermissions[permission];
  };

  const handleRestart = async () => {
    setIsSubmiting(true);
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URI}/change-process-status`,
        {
          serverId: processDetails.serverId,
          action: "restart",
          process_id: processDetails.process_id,
        },
        {
          headers: {
            Authorization: JSON.parse(localStorage.getItem("token")),
          },
        }
      );
      if (response.status === 200) {
        setIsSubmiting(false);
        alert("Process Restarted Successfully")
        window.location.reload();
      }
    } catch (error) {
      console.error(error);
      if (error.response && error.response.status === 401) {
        navigate("/login");
      }
    }
  };

  const handleForceDelete = async () => {
    setShowForceDeleteConfirmation(true);
  };

  const handleConfirmForceDelete = async () => {
    setIsSubmit(true);
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URI}/change-process-status`,
        {
          serverId: processDetails.serverId,
          action: "force-delete",
          process_id: processDetails.process_id,
        },
        {
          headers: {
            Authorization: JSON.parse(localStorage.getItem("token")),
          },
        }
      );
      if (response.status === 200) {
        alert("Process Deleted Successfully")
        navigate("/dashboard");
        setShowForceDeleteConfirmation(false);
      }
    } catch (error) {
      console.error(error);
      if (error.response && error.response.status === 401) {
        navigate("/login");
      }
    }
  };

  const handleCancelForceDelete = () => {
    setShowForceDeleteConfirmation(false);
  };

  const handleDelete = async () => {
    setShowConfirmation(true);
  };

  const handleConfirmDelete = async () => {
    setIsSubmit(true);
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URI}/change-process-status`,
        {
          serverId: processDetails.serverId,
          action: "delete",
          process_id: processDetails.process_id,
          process_log: processDetails.process_log,
        },
        {
          headers: {
            Authorization: JSON.parse(localStorage.getItem("token")),
          },
        }
      );
      if (response.status === 200) {
        alert("Process Deleted Successfully")
        navigate("/dashboard");
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

  const handleEdit = () => {
    setIsSubmitting(true);
    navigate(`/editprocess?id=${processDetails.process_id}`);
  };

  const handleCopy = () => {
    setIsSubmitting(true);
    navigate(`/copyprocess?id=${processDetails.process_id}`);
  };

  const handleLog = () => {
    setShowPopup(true);
  };

  const handleClosePopup = () => {
    setShowPopup(false);
  };

  const handleStartStop = async () => {
    setIsLoading(true);
    try {
      const action = isProcessRunning ? "stop" : "start";
      const response = await axios.post(
        `${process.env.REACT_APP_API_URI}/change-process-status`,
        {
          serverId: processDetails.serverId,
          action: action,
          process_id: processDetails.process_id,
        },
        {
          headers: {
            Authorization: JSON.parse(localStorage.getItem("token")),
          },
        }
      );
      if (response.status === 200) {
        alert(`Process ${action === "start" ? "Started" : "Stopped"} Successfully`);
        window.location.reload();
      }
    } catch (error) {
      console.error(error);
      if (error.response && error.response.status === 401) {
        navigate("/login");
      }
    }
  };

  const toggleShowData = () => {
    setShowData(!showData);
  };

  if (!processDetails) return <div className="text-blue-600 text-center">
  <p>Loading Please Wait!</p>
  <br />
  <img src={image} alt="" className="h-40 mx-auto rounded-full" />
</div>;


  return (
    <div className="container mx-auto mt-0 my-8 p-4 sm:p-6 lg:p-8 bg-gray-100 dark:bg-gray-800 textwhite rounded-lg shadow-lg">
      <div className="p-4 sm:p-6">
        <h2 className="text-2xl font-bold mb-4">Process Details</h2>
        <div className="flex flex-col md:flex-row gap-6">
          {/* Left Column */}
          <div className="w-full md:w-1/2">
            <div className="overflow-auto rounded-lg shadow mb-6">
              <table className="w-full text-sm lg:text-base" cellSpacing="0">
                <thead className="graybg">
                  <tr className="h-12 uppercase">
                    <th className="text-left py-3 px-5">Name</th>
                    <th className="text-left py-3 px-5">Value</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="textwhite">
                    <td className="py-4 px-5 border-b border-gray-700">Process Name</td>
                    <td className="py-4 px-5 border-b border-gray-700">{processDetails.process_name}</td>
                  </tr>
                  <tr className="textwhite">
                    <td className="py-4 px-5 border-b border-gray-700">Process ID</td>
                    <td className="py-4 px-5 border-b border-gray-700">{processDetails.process_id}</td>
                  </tr>
                  <tr className="textwhite">
                    <td className="py-4 px-5 border-b border-gray-700">Process Status</td>
                    <td className={`py-4 px-5 border-b border-gray-700 ${isProcessRunning ? "text-green-500" : "text-red-500"}`}>
                      {processDetails.process_status}
                    </td>
                  </tr>
                  <tr className="textwhite">
                    <td className="py-4 px-5 border-b border-gray-700">VPN</td>
                    <td className="py-4 px-5 border-b border-gray-700">{processDetails.vpn}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Right Column */}
          <div className="w-full md:w-1/2">
            <div className="overflow-auto rounded-lg shadow mb-6">
              <table className="w-full text-sm lg:text-base" cellSpacing="0">
                <thead className="graybg">
                  <tr className="h-12 uppercase">
                    <th className="text-left py-3 px-5">Name</th>
                    <th className="text-left py-3 px-5">Value</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="textwhite">
                    <td className="py-4 px-5 border-b border-gray-700">OS Type</td>
                    <td className="py-4 px-5 border-b border-gray-700">{processDetails.os_type}</td>
                  </tr>
                  <tr className="textwhite">
                    <td className="py-4 px-5 border-b border-gray-700">User Agent</td>
                    <td className="py-4 px-5 border-b border-gray-700">{processDetails.ua_list}</td>
                  </tr>

                  <tr className="textwhite">
                    <td className="py-4 px-5 border-b border-gray-700">Created At</td>
                    <td className="py-4 px-5 border-b border-gray-700">{new Date(processDetails.createdAt).toLocaleString()}</td>
                  </tr>
                  <tr className="textwhite">
                    <td className="py-4 px-5 border-b border-gray-700">Updated At</td>
                    <td className="py-4 px-5 border-b border-gray-700">{new Date(processDetails.updatedAt).toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div className="overflow-auto rounded-lg shadow mb-6 mt-0">
          <table className="w-full text-sm lg:text-base">
            <tbody>
              <tr className="textwhite">
                <td className="py-4 px-5 border-b border-gray-700 font-semibold">Process URL</td>
                <td className="py-4 px-5 border-b text-xs border-gray-700 break-all">{processDetails?.link}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className='flex justify-between items-center mt-6'>
          <h3 className="text-xl font-bold">App Details:</h3>
          <button
            onClick={toggleShowData}
            title={`${showData ? 'Close Details' : 'View App Details'}`}
            className={`p-2 text-white relative px-4 rounded-lg ${showData ? 'bg-red-500 hover:bg-red-700' : 'bg-blue-500 hover:bg-blue-700'}`}
          >
            {showData ? <FaTimes /> : <FaEye />}
          </button>
        </div>

        {showData && (
          <div className="mt-6 overflow-x-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {processDetails.hardmask.map((item, index) => (
                <div key={index} className="border-gray-700 border graybg p-4 rounded-lg shadow-2xl overflow-hidden">
                  {item?.hardmask_type ? (
                    <p className="font-semibold">
                      All Hardmask Type: <span className="font-normal">{item.hardmask_type || "Data not found"}</span>
                    </p>
                  ) : (
                    <table className="w-full text-sm">
                      <thead className="bg-blue-600 rounded-xl">
                        <tr>
                          <th className="py-2 px-4 text-left">Field</th>
                          <th className="py-2 px-4 text-left">Details</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { label: "App Name", value: item?.appname },
                          { label: "App Bundle", value: item?.appbundle },
                          { label: "App URL", value: item?.appurl },
                        ].map(({ label, value }, idx) => (
                          <tr key={idx} className="border-b border-gray-200">
                            <td className="py-2 px-4 font-semibold">{label}</td>
                            <td className="py-2 px-4 break-all">{value || "Data not found"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-wrap justify-around mt-6 space-y-2 space-x-0 sm:space-x-2 sm:space-y-0">
        {isProcessRunning ? hasPermission("process_write") && (
          <button
            className="relative bg-red-500 hover:bg-red-600 hover:scale-110 text-white font-bold py-2 px-4 rounded flex items-center"
            onClick={handleStartStop}
            title="Stop Process"
          >
            <FaStop className="fa-lg" />
            {isLoading && (
              <span className="inline-block ml-2 animate-spin"><FaSpinner /></span>
            )}
          </button>
        ) : (
          <button
            className="relative bg-green-500 hover:bg-green-600 hover:scale-110 text-white font-bold py-2 px-4 rounded flex items-center"
            onClick={handleStartStop}
            title="Start Process"
          >
            <FaPlay className="fa-lg" />
            {isLoading && (
              <span className="inline-block ml-2 animate-spin"><FaSpinner /></span>
            )}
          </button>
        )}
        {hasPermission("process_write") && (
          <button
            className="bg-yellow-500 hover:bg-yellow-600 hover:scale-110 text-white font-bold py-2 px-4 rounded flex items-center relative"
            onClick={handleRestart}
            title="Restart Process"
          >
            <FaRedo className="fa-lg" />
            {isSubmiting && (
              <span className="inline-block ml-2 animate-spin"><FaSpinner /></span>
            )}
          </button>
        )}
        {!isCopy && hasPermission("process_write") && (
          <button
            className={`bg-pink-500 hover:bg-pink-600 hover:scale-110 relative text-white font-bold py-2 px-4 rounded flex items-center ${!hasRequiredProperties ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={handleEdit}
            title="Edit Process"
            disabled={!hasRequiredProperties}
          >
            <FaEdit className="fa-lg" />
          </button>
        )}
        {!isCopy && hasPermission("process_write") && (
          <button
            className={`bg-gray-500 hover:bg-gray-700 hover:scale-110 dark:hover:bg-gray-700 relative text-white font-bold py-2 px-4 rounded flex items-center ${!hasRequiredProperties ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={handleCopy}
            title="Copy Process"
            disabled={!hasRequiredProperties}
          >
            <FaCopy className="fa-lg" />
          </button>
        )}
        {hasPermission("process_write") && (
          <button
            className="bg-red-500 hover:bg-red-600 hover:scale-110 relative text-white font-bold py-2 px-4 rounded flex items-center"
            onClick={handleDelete}
            title="Delete Process"
          >
            <FaTrash className="fa-lg" />
          </button>
        )}
        {hasPermission("process_write") && (
          <button
            className="bg-red-800 hover:bg-red-900 relative hover:scale-110 text-white font-bold py-2 px-4 rounded flex items-center"
            onClick={handleForceDelete}
            title="Force Delete"
          >
            <FaSkullCrossbones className="fa-lg" />
          </button>
        )}
        {hasPermission("process_write") && (
          <button
            className="bg-orange-500 hover:bg-orange-600 relative hover:scale-110 text-white font-bold py-2 px-4 rounded flex items-center"
            onClick={handleLog}
            title="View Log"
          >
            <FaBook className="fa-lg" />
          </button>
        )}
      </div>

      {showPopup && (
        <LogPopup
          onClose={handleClosePopup}
          serverId={processDetails.serverId}
          processId={processDetails.process_id}
        />
      )}

      {showConfirmation && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="gray700 text-black rounded-lg p-8 shadow-lg">
            <h2 className="text-xl textwhite font-bold mb-4">Confirm Delete</h2>
            <p className="mb-6 textwhite">Are you sure you want to delete this process?</p>
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

      {showForceDeleteConfirmation && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="gray700 text-black rounded-lg p-8 shadow-lg">
            <h2 className="text-xl textwhite font-bold mb-4">Confirm Force Delete</h2>
            <p className="mb-6 textwhite">Are you sure you want to force delete this process?</p>
            <div className="flex justify-end">
              <button
                className="px-4 py-2 bg-red-500 textwhite rounded-md mr-2"
                onClick={handleConfirmForceDelete}
              >
                Yes
                {isSubmit && <span className="inline-block ml-2 animate-spin"><FaSpinner /></span>}
              </button>
              <button
                className="px-4 py-2 bg-gray-400 textwhite rounded-md"
                onClick={handleCancelForceDelete}
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

export default ProcessDetailFile;
