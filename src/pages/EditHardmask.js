import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaSpinner } from "react-icons/fa";

const EditHardmask = ({ onButtonClick }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isSubmit, setIsSubmit] = useState(false);
  const [osList, setOsList] = useState([]);

  const [currentItem, setCurrentItem] = useState({
    appbundle: "",
    appname: "",
    appurl: "",
    id: null,
    os_type: "",
    all_hardmask: "",
  });
  const [suggestions, setSuggestions] = useState([]);
  const [selectedSuggestion, setSelectedSuggestion] = useState(0);
  const navigate = useNavigate();

  const osTypeOptions = {
    iOS: ["apple_ctv", "apple_inapp"],
    Android: ["android_inapp", "android_ctv", "android_inapp_ua"],
    Roku: ["roku_al", "roku_number"],
    "Fire TV": ["fire_ctv"],
    Tizen: ["all_tizen"],
  };

  useEffect(() => {
    // Fetch OS types from API
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
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URI}/hardmask?appname=${searchTerm}&os_type=${currentItem.os_type}`,
          {
            headers: {
              Authorization: JSON.parse(localStorage.getItem("token")),
            },
          }
        );
        const data = response.data;
        setSuggestions(data);
        console.log("Hardmask suggestions fetched:", data);
      } catch (error) {
        console.error("Error fetching hardmask data:", error);
        if (error.response && error.response.status === 401) {
          navigate("/login");
        }
      }
    };

    if (searchTerm.trim() !== "" && currentItem.os_type !== "") {
      fetchData();
    } else {
      setSuggestions([]);
    }
  }, [searchTerm, currentItem.os_type, navigate]);

  const handleInputChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleSuggestionClick = (suggestion) => {
    setCurrentItem({
      appbundle: suggestion.appbundle,
      appname: suggestion.appname,
      appurl: suggestion.appurl,
      id: suggestion.id,
      os_type: suggestion.os_type,
      all_hardmask: suggestion.type,
    });
    setSearchTerm("");
  };

  const handleAllHardmask = (e) => {
    setCurrentItem({
      ...currentItem,
      all_hardmask: e.target.value,
    });
  };

  const handleKeyDown = (event) => {
    if (event.key === "ArrowUp") {
      setSelectedSuggestion((prev) =>
        prev > 0 ? prev - 1 : suggestions.length - 1
      );
    } else if (event.key === "ArrowDown") {
      setSelectedSuggestion((prev) =>
        prev < suggestions.length - 1 ? prev + 1 : 0
      );
    } else if (event.key === "Enter") {
      setSearchTerm(suggestions[selectedSuggestion]);
      setSuggestions([]);
    }
  };

  const handleUpdate = () => {
    setIsSubmit(true);
    axios
      .put(
        `${process.env.REACT_APP_API_URI}/update-hardmask?action=update`,
        {
          id: currentItem.id,
          appname: currentItem.appname,
          appbundle: currentItem.appbundle,
          appurl: currentItem.appurl,
          os_type: currentItem.os_type,
          type: currentItem.all_hardmask,
        },
        {
          headers: {
            Authorization: JSON.parse(localStorage.getItem("token")),
          },
        }
      )
      .then((response) => {
        console.log(response);
        if (response.status === 200) {
          setIsSubmit(false);
          setUpdateSuccess(true);
          setTimeout(() => {
            setUpdateSuccess(false);
          }, 2000);
          setCurrentItem({
            appbundle: "",
            appname: "",
            appurl: "",
            id: null,
            os_type: "",
            all_hardmask: "",
          });
        }
      })
      .catch((error) => {
        console.log(error);
        if (error.response && error.response.status === 401) {
          navigate("/login");
        }
        setIsSubmit(false);
      });
  };

  const handleDelete = () => {
    setIsSubmitting(true);
    axios
      .put(
        `${process.env.REACT_APP_API_URI}/update-hardmask?action=delete`,
        currentItem,
        {
          headers: {
            Authorization: JSON.parse(localStorage.getItem("token")),
          },
        }
      )
      .then((response) => {
        console.log(response);
        if (response.status === 200) {
          setIsSubmitting(false);
          setDeleteSuccess(true);
          setConfirmDelete(false);
          setTimeout(() => {
            setDeleteSuccess(false);
          }, 2000);
          setCurrentItem({
            appbundle: "",
            appname: "",
            appurl: "",
            id: null,
            os_type: "",
            all_hardmask: "",
          });
        }
      })
      .catch((error) => {
        console.log(error);
        if (error.response && error.response.status === 401) {
          navigate("/login");
        }
        setIsSubmitting(false);
        setConfirmDelete(false);
      });
  };

  const handleOSChange = (e) => {
    setCurrentItem({
      ...currentItem,
      os_type: e.target.value,
      all_hardmask: "",
    });
  };

  return (
    <div className="graybg p-8 rounded-md">
      {deleteSuccess && (
        <div className="bg-red-500 textwhite p-4 rounded-md mb-4">
          Hardmask deleted successfully!
        </div>
      )}

      {updateSuccess && (
        <div className="bg-green-500 textwhite p-4 rounded-md mb-4">
          Hardmask Updated successfully!
        </div>
      )}
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
            value={currentItem.os_type}
            onChange={handleOSChange}
            className="input m-0"
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
      {currentItem.os_type !== "" && (
        <div>
          <label
            htmlFor="appname"
            className="block text-sm font-medium leading-6 textwhite pb-2 mt-4"
          >
            Search Hardmask
          </label>
          <input
            type="text"
            value={searchTerm}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Search Hardmask"
            className="input mb-0"
          />
        </div>
      )}
      <div className="max-h-40 overflow-y-auto rounded-md mb-4 gray700 textwhite">
        {suggestions.length > 0 ? (
          <ul className="list-none p-0">
            {suggestions.map((suggestion, index) => (
              <li
                key={index}
                className={`p-2 cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-800 ${
                  index === selectedSuggestion ? "bg-gray-200 dark:bg-gray-700" : ""
                }`}
                onClick={() => handleSuggestionClick(suggestion)}
              >
                {suggestion.appname}
              </li>
            ))}
          </ul>
        ) : searchTerm !== "" ? (
          <p className="text-red-500 text-center">
            Hardmask not available in the database.
          </p>
        ) : null}
      </div>
      <label
        htmlFor="appname"
        className="block text-sm font-medium leading-6 textwhite pb-2"
      >
        App Name
      </label>
      <input
        type="text"
        placeholder="App Name"
        onChange={(e) =>
          setCurrentItem({
            ...currentItem,
            [e.target.name]: e.target.value,
          })
        }
        name="appname"
        value={currentItem.appname}
        className="input"
      />
      <label
        htmlFor="appbundle"
        className="block text-sm font-medium leading-6 textwhite pb-2"
      >
        App Bundle
      </label>
      <input
        type="text"
        placeholder="App Bundle"
        onChange={(e) =>
          setCurrentItem({
            ...currentItem,
            [e.target.name]: e.target.value,
          })
        }
        name="appbundle"
        value={currentItem.appbundle}
        className="input"
      />
      <label
        htmlFor="appurl"
        className="block text-sm font-medium leading-6 pb-2 textwhite"
      >
        App URL
      </label>
      <input
        type="text"
        placeholder="App URL"
        onChange={(e) =>
          setCurrentItem({
            ...currentItem,
            [e.target.name]: e.target.value,
          })
        }
        name="appurl"
        value={currentItem.appurl}
        className="input"
      />

      <div className="flex flex-col sm:col-span-6">
        <label
          htmlFor="all_hardmask"
          className="block text-sm font-medium leading-6 pb-2 textwhite"
        >
          Select Type
        </label>

        <select
          id="all_hardmask"
          name="all_hardmask"
          value={currentItem.all_hardmask}
          onChange={handleAllHardmask}
          className="input"
        >
          <option value="">Select Type</option>
          {currentItem.os_type && osTypeOptions[currentItem.os_type] &&
            osTypeOptions[currentItem.os_type].map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
        </select>
      </div>
      <br />
      <div className="flex justify-center gap-4">
        <button
          onClick={handleUpdate}
          className={`w-full sm:w-auto bg-green-500 hover:bg-green-600 hover:scale-110 text-white px-4 py-2 rounded-md mr-2 focus:outline-none focus:bg-green-600 ${
            isSubmit ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          disabled={isSubmit}
        >
          Update HardMask
          {isSubmit && (
            <span className="inline-block ml-2 animate-spin"><FaSpinner /></span>
          )}
        </button>
        <button
          onClick={() => setConfirmDelete(true)}
          className={`w-full sm:w-auto bg-red-500 hover:bg-red-600 hover:scale-110 text-white px-4 py-2 rounded-md focus:outline-none focus:bg-red-600 ${
            isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          disabled={isSubmitting}
        >
          Delete HardMask
        </button>
      </div>
      {confirmDelete && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="gray700 text-black rounded-lg p-8 shadow-lg">
            <h2 className="text-xl font-bold textwhite mb-4">Confirm Delete</h2>
            <h2 className="font-bold textwhite mb-4">Are You Sure You Want To Delete This HardMask?</h2>
            <div className="flex justify-end gap-4">
              <button onClick={handleDelete} className="bg-red-500 hover:bg-red-700 px-3 p-1 rounded-lg text-white">
                Yes
                {isSubmitting && (
                  <span className="inline-block ml-2 animate-spin"><FaSpinner /></span>
                )}
              </button>
              <button onClick={() => setConfirmDelete(false)} className="bg-blue-500 hover:bg-blue-700 px-3 p-1 rounded-lg text-white">No</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditHardmask;