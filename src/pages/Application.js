import React, { useState, useEffect } from "react";
import FileUploader from "../components/FileUploader";
import axios from "axios";
import EditHardmask from "./EditHardmask";
import { useNavigate } from "react-router-dom";
import { FaSpinner, FaDownload, FaTrash } from "react-icons/fa";

function Application() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [selectedManageOS, setSelectedManageOS] = useState("");
  const [osList, setOsList] = useState([]);

  const navigate = useNavigate();
  const [appValue, setAppValue] = useState({
    appname: "",
    appbundle: "",
    appurl: "",
    os_type: "",
    all_hardmask: "",
  });

  // Hardcoded select type options
  const osTypeOptions = {
    iOS: ["apple_ctv", "apple_inapp"],
    Android: ["android_inapp", "android_ctv", "android_inapp_ua"],
    Roku: ["roku_al", "roku_number"],
    "Fire TV": ["fire_ctv"],
    Tizen: ["all_tizen"],
  };

  useEffect(() => {
    const storedData = localStorage.getItem("appValue");
    if (storedData) {
      setAppValue(JSON.parse(storedData));
    }
    
    axios.get(`${process.env.REACT_APP_API_URI}/get-all-os`, {
      headers: {
        Authorization: JSON.parse(localStorage.getItem("token")),
      },
    })
      .then((response) => {
        setOsList(response.data.map(os => ({ id: os.id, name: os.name })));
      })
      .catch((error) => {
        console.log(error);
        if (error.response && error.response.status === 401) {
          navigate("/login");
        }
      });
  }, [navigate]);

  useEffect(() => {
    const storedData = localStorage.getItem("appValue");
    if (storedData) {
      setAppValue(JSON.parse(storedData));
    }
  }, []);

  const onSubmit = () => {
    setIsSubmitting(true);
    if (
      appValue.appname === "" ||
      appValue.appbundle === "" ||
      appValue.appurl === "" ||
      appValue.os_type === "" ||
      appValue.all_hardmask === ""
    ) {
      alert("Please fill in all required fields.");
      setIsSubmitting(false);
      return;
    }
    axios
      .post(
        `${process.env.REACT_APP_API_URI}/add-new`,
        appValue,
        {
          headers: {
            Authorization: JSON.parse(localStorage.getItem("token")),
          },
        }
      )
      .then(function (response) {
        console.log(response);
        if (response.status === 200) {
          setShowSuccessAlert(true);
          setTimeout(() => {
            setIsSubmitting(false);
            setShowSuccessAlert(false);
          }, 5000);
          setAppValue({
            appname: "",
            appbundle: "",
            appurl: "",
            os_type: "",
            all_hardmask: "",
          });
        }
      })
      .catch(function (error) {
        console.log(error);
        if (error.response && error.response.status === 401) {
          navigate("/login");
        } else {
          alert("An error occurred. Please try again later.");
        }
        setIsSubmitting(false);
      });
  };

   const handleOSChange = (e) => {
    setAppValue({
      ...appValue,
      os_type: e.target.value,
      all_hardmask: "",
    });
  };

  const handleAllHardmask = (e) => {
    setAppValue({
      ...appValue,
      all_hardmask: e.target.value,
    });
  };

  useEffect(() => {
    localStorage.setItem("appValue", JSON.stringify(appValue));
  }, [appValue]);

  const handleAddhardmaskList = (payload) => {
    setAppValue((prevAppValue) => ({
      ...prevAppValue,
      hardmaskIds: [...(prevAppValue.hardmaskIds || []), payload.id],
    }));
  };
  
  const handleManageOSChange = (e) => {
    setSelectedManageOS(e.target.value);
  };

  const DownloadAllHardmasks = () => {
    if (!selectedManageOS) {
      alert("Please select an OS first.");
      return;
    }
    setIsDownloading(true);
    axios.get(`${process.env.REACT_APP_API_URI}/download-hardmask`, {
      params: { os: selectedManageOS === "all" ? "all" : selectedManageOS },
      headers: {
        Authorization: JSON.parse(localStorage.getItem("token")),
      },
      responseType: 'blob',
    }).then((response) => {
      const blob = new Blob([response.data], { type: 'text/csv' });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      
      const contentDisposition = response.headers['content-disposition'];
      let filename = selectedManageOS === "all" ? 'all_hardmasks.csv' : `${selectedManageOS}_hardmasks.csv`;
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename=(.*)/);
        if (filenameMatch && filenameMatch.length === 2)
          filename = filenameMatch[1];
      }
      
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
      alert("Hardmasks CSV Downloaded Successfully");
    }).catch((error) => {
      console.error("Error downloading Hardmasks CSV:", error);
      alert("Error Downloading Hardmasks CSV");
    }).finally(() => {
      setIsDownloading(false);
    });
  };

  const handlePasswordSubmit = () => {
    setPasswordError("");
    setIsVerifying(true);

    if (!password) {
      setPasswordError("Password is required");
      setIsVerifying(false);
      return;
    }

    const email = localStorage.getItem("userEmail"); 

    const axiosInstance = axios.create();

    axiosInstance
      .post(`${process.env.REACT_APP_API_URI}/login`, {
        email,
        password,
      })
      .then(function (response) {
        console.log('API Response:', response.data);
        if (response.data.token) {
          DeleteAllHardmasks();
        } else {
          setPasswordError("Invalid credentials. Please try again.");
        }
      })
      .catch(function (error) {
        console.log(error);
        if (error.response && error.response.status === 401) {
          setPasswordError("Invalid credentials. Please try again.");
        } else {
          setPasswordError("An error occurred. Please try again.");
        }
      })
      .finally(() => {
        setIsVerifying(false);
      });
  };
  
  const DeleteAllHardmasks = () => {
    if (!selectedManageOS) {
      alert("Please select an OS first.");
      return;
    }
    setIsDeleting(true);
    axios.get(`${process.env.REACT_APP_API_URI}/delete-all-hardmask`, {
      params: { os: selectedManageOS === "all" ? "all" : selectedManageOS },
      headers: {
        Authorization: JSON.parse(localStorage.getItem("token")),
      },
    }).then((response) => {
      if (response.status === 200) {
        alert("Hardmasks deleted successfully");
        setConfirmDelete(false);
        setPassword("");
      }
    }).catch((error) => {
      console.error("Error deleting Hardmasks:", error);
      alert("Error deleting Hardmasks");
    }).finally(() => {
      setIsDeleting(false);
    });
  };

  return (
    <div className="min-h-screen zincbg py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white shadow-lg rounded-lg overflow-hidden">
            <div className="px-4 border-2 border-gray-300 rounded-lg py-5 sm:p-6 graybg">
              {showSuccessAlert && (
                <div className="rounded-md bg-green-50 p-4 mb-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-5 w-5 text-green-400"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM9 4a1 1 0 011-1h.01a1 1 0 01.71 1.71A3.998 3.998 0 0115 10a3.998 3.998 0 01-6.29 3.29l-4.59 4.59a1 1 0 01-1.42-1.42l4.59-4.59A3.98 3.98 0 019 4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-green-700">
                        Hardmask created successfully
                      </p>
                    </div>
                  </div>
                </div>
              )}
              <h3 className="text-lg font-semibold leading-6 textwhite text-center">
                Add New Hardmask
              </h3>
              <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div className="sm:col-span-6">
                  <label
                    htmlFor="appname"
                    className="block text-sm font-medium leading-6 textwhite"
                  >
                    App Name
                  </label>
                  <div className="mt-2">
                    <input
                      type="text"
                      name="appname"
                      id="appname"
                      value={appValue.appname}
                      onChange={(e) =>
                        setAppValue({
                          ...appValue,
                          [e.target.name]: e.target.value,
                        })
                      }
                      autoComplete="appname"
                      className="input"
                    />
                  </div>
                </div>
  
                <div className="sm:col-span-6">
                  <label
                    htmlFor="appbundle"
                    className="block text-sm font-medium leading-6 textwhite"
                  >
                    App Bundle
                  </label>
                  <div className="mt-2">
                    <input
                      type="text"
                      name="appbundle"
                      id="appbundle"
                      value={appValue.appbundle}
                      onChange={(e) =>
                        setAppValue({
                          ...appValue,
                          [e.target.name]: e.target.value,
                        })
                      }
                      autoComplete="appbundle"
                      className="input"
                    />
                  </div>
                </div>
  
                <div className="sm:col-span-6">
                  <label
                    htmlFor="appurl"
                    className="block text-sm font-medium leading-6 textwhite"
                  >
                    App URL
                  </label>
                  <div className="mt-2">
                    <input
                      type="text"
                      name="appurl"
                      id="appurl"
                      value={appValue.appurl}
                      onChange={(e) =>
                        setAppValue({
                          ...appValue,
                          [e.target.name]: e.target.value,
                        })
                      }
                      autoComplete="appurl"
                      className="input"
                    />
                  </div>
                </div>
              </div>
              <div className="sm:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label
                    htmlFor="os_type"
                    className="block text-sm font-medium leading-6 textwhite"
                  >
                     OS Type
          </label>
          <div className="mt-2">
            <select
              id="os_type"
              name="os_type"
              value={appValue.os_type}
              onChange={handleOSChange}
              className="dropdown"
            >
              <option value="">Select OS</option>
              {osList.map((os) => (
                <option key={os.id} value={os.name}>
                  {os.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="all_hardmask"
            className="block text-sm font-medium leading-6 textwhite"
          >
            Select Type
          </label>
          <select
            id="all_hardmask"
            name="all_hardmask"
            value={appValue.all_hardmask}
            onChange={handleAllHardmask}
            className="dropdown"
          >
            <option value="">Select Type</option>
            {appValue.os_type && osTypeOptions[appValue.os_type] &&
              osTypeOptions[appValue.os_type].map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
          </select>
                </div>
              </div>
  
              <div className="mt-6">
                <button
                  type="submit"
                  onClick={onSubmit}
                  className="inline-flex justify-center hover:scale-110 rounded-md bg-indigo-600 py-2 px-4 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                >
                  Submit
                  {isSubmitting && (
                    <span className="inline-block ml-2 animate-spin">
                      <FaSpinner />
                    </span>
                  )}
                </button>
              </div>
  
              <div className="mt-8">
                <h3 className="text-lg font-semibold leading-6 textwhite">
                  Upload File
                </h3>
                <FileUploader />
              </div>
            </div>
          </div>
  
          <div className="graybg shadow-lg border-2 border-gray-300 rounded-lg overflow-hidden">
            <div className="px-4 py-5 sm:p-6 graybg">
              <h3 className="text-lg font-semibold leading-6 pb-2 textwhite text-center">
                Edit Hardmask
              </h3>
              <EditHardmask
                onButtonClick={handleAddhardmaskList}
                selectedOSType={appValue.os_type}
              />
            </div>
          </div>
        </div>
      </div>
      <div className="graybg border-2 border-gray-300 rounded-xl p-6 max-w-2xl mx-auto mt-8 shadow-md">
        <h1 className="text-2xl font-bold textwhite mb-6">Manage Hardmask</h1>
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold textwhite mb-2">OS Type</h2>
            <select
              id="manage_os_type"
              name="manage_os_type"
              value={selectedManageOS}
              onChange={(e) => setSelectedManageOS(e.target.value)}
              className="input"
            >
              <option value="">Select OS</option>
              <option value="all">All OS</option>
              {osList.map((os) => (
                <option key={os.id} value={os.name.toLowerCase()}>
                  {os.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-between items-center">
            <button 
              onClick={DownloadAllHardmasks}
              title="Download Hardmasks CSV"
              className="flex items-center bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-md transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!selectedManageOS || isDownloading}
            >
              <FaDownload className="mr-2" />
              Download Hardmask
              {isDownloading && (
                <FaSpinner className="ml-2 animate-spin" />
              )}
            </button>
            <button 
              onClick={()=>setConfirmDelete(true)}
              title="Delete All Hardmask" 
              className="flex items-center bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-md transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!selectedManageOS || isDeleting}
            >
              <FaTrash className="mr-2" />
              Delete All Hardmask
            </button>
          </div>
        </div>
      </div>
  
      {confirmDelete && (
        <div className="bg-black bg-opacity-50 fixed inset-0 flex items-center justify-center">
          <div className="p-8 graybg rounded-lg">
            <h1 className="font-bold textwhite text-2xl">Confirm Delete</h1>
            <h1 className="textwhite mb-4">Are You Sure You Want To Delete All Hardmask</h1>
            <div className="mb-4">
              <label htmlFor="password" className="block text-sm font-medium textwhite">Enter Password to Confirm</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input"
                placeholder="Enter your password"
              />
              {passwordError && <p className="text-red-500 text-sm mt-1">{passwordError}</p>}
            </div>
            <div className="flex justify-end gap-4">
              <button 
                className="bg-red-500 px-4 p-1 rounded-lg text-white" 
                onClick={handlePasswordSubmit}
                disabled={isVerifying || isDeleting}
              >
                Yes
                {(isVerifying || isDeleting) && <FaSpinner className="ml-2 animate-spin" />}
              </button>
              <button 
                onClick={() => {
                  setConfirmDelete(false);
                  setPassword("");
                  setPasswordError("");
                }} 
                className="bg-blue-500 px-4 p-1 rounded-lg text-white"
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

export default Application;
