import React, { useState, useEffect } from "react";
import axios from "axios";
import AutocompleteSearch from "../components/AutocompleteSearch";
import { useNavigate } from "react-router-dom";
import { FiTrash2 } from "react-icons/fi";
import { FaSpinner } from "react-icons/fa";
import SaveButton from "../components/SaveButton";
import FileUploadComponent from "../components/FileUploder";

export default function Process() {
  const [processValues, setProcessValues] = useState({
    process_name: "",
    url: "",
    usp: "",
    dnt: "",
    gdpr: "",
    gdpr_c: "",
    schain: "",
    tick_rate: '',
    os_type: "Select OS",
    ua_list: "Select User Agent",
    vpn: "Select VPN",
    hardmaskIds: [],
    server: "Select server",
    cron: "Cron Time",
    all_hardmask: "Select All Hardmask",
    at: "Select AT",
    bidfloor: "",
    timeout: "",
    lat_macro: true,
    lon_macro: true,
    os_macro: true,
    idfa_macro: true,
    adid_macro: true,
    ifa_macro: true,
    usp_enabled: false,
    gdpr_enabled: false,
    gdpr_c_enabled: false,
    dnt_enabled: false,
    schain_enabled: false,
    pbid: "",
    sid: "",
    hp: '',
    asi: "",
    device_type: "",
    ua_id: "",
    aid: ""

  });
  const [hardmaskList, setHardmaskList] = useState([]);
  const navigate = useNavigate();
  const [selectedServer, setSelectedServer] = useState(null);
  const [availableServer, setAvailableServer] = useState([]);
  const [isButtonClicked, setIsButtonClicked] = useState(false);
  const [isHardmaskSelected, setIsHardmaskSelected] = useState(false);
  const [selectAllHardmask, setSelectAllHardmask] = useState(false);
  const [isRTBChecked, setIsRTBChecked] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [osList, setOsList] = useState([]);
  const [uploadedData, setUploadedData] = useState(null);
  const [uaList, setUaList] = useState([]);
  const [selectedOSId, setSelectedOSId] = useState('');
  const [selectedHeader, setSelectedHeader] = useState('');
  const [headerList, setHeaderList] = useState([]);
  const [uniqueHeaders, setUniqueHeaders] = useState([]);
  const [emptyFields, setEmptyFields] = useState({
    process_name: false,
    url: false,
    ua_list: false,
    vpn: false,
    os_type: false,
    aid: false,
    tick_rate: false,
  });
  const [isLogChecked, setIsLogChecked] = useState({
    process_log: false,
  });

  useEffect(() => {
    const storedServer = localStorage.getItem("current_server");
    if (storedServer) {
      try {
        const parsedServer = JSON.parse(storedServer);
        setSelectedServer(parsedServer.server_name);
      } catch (error) {
        console.log("Error parsing stored server:");
      }
    } else {
      axios
        .get(`${process.env.REACT_APP_API_URI}/all-servers`, {
          headers: {
            Authorization: JSON.parse(localStorage.getItem("token")),
          },
        })
        .then(function (response) {
          localStorage.setItem(
            "current_server",
            JSON.stringify(response.data[0])
          );
        })
        .catch(function (error) {
          alert("Server Error");
          navigate("/");
          console.log(error);
        });
    }

    axios
      .get(`${process.env.REACT_APP_API_URI}/all-servers`, {
        headers: {
          Authorization: JSON.parse(localStorage.getItem("token")),
        },
      })
      .then(function (response) {
        setAvailableServer(response.data);
      })
      .catch(function (error) {
        console.log(error);
      });
  }, []);

  useEffect(() => {
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
      });
  }, []);

  useEffect(() => {
    fetchHeaders();
  }, []);

  useEffect(() => {
    // Create a unique list of headers based on aid and aname
    const uniqueHeaderMap = new Map();
    headerList.forEach(header => {
      const key = `${header.aid}-${header.aname}`;
      if (!uniqueHeaderMap.has(key)) {
        uniqueHeaderMap.set(key, header);
      }
    });
    setUniqueHeaders(Array.from(uniqueHeaderMap.values()));
  }, [headerList]);


  const fetchHeaders = () => {
    axios.get(`${process.env.REACT_APP_API_URI}/get-all-header`, {
      headers: {
        Authorization: JSON.parse(localStorage.getItem("token"))
      }
    }).then((response) => {
      if (response.status === 200) {
        setHeaderList(response.data);
      }
    }).catch((error) => {
      console.log("Error Fetching Header", error);
    });
  };

  const handleHeaderChange = (e) => {
    const selectedHeaderId = e.target.value;
    const selectedHeader = uniqueHeaders.find(header => header.id.toString() === selectedHeaderId);
    if (selectedHeader) {
      setProcessValues(prevValues => ({
        ...prevValues,
        aid: selectedHeader.aid.toString(),
      }));
    }
  };

  const handleUAChange = (e) => {
    const selectedUA = uaList.find(ua => ua.id.toString() === e.target.value);
    if (selectedUA) {
      setProcessValues(prevValues => ({
        ...prevValues,
        ua_list: selectedUA.name,
        ua_id: selectedUA.id.toString(),
        hardmaskIds: [],
        all_hardmask: "",
      }));
      setHardmaskList([]);
      setSelectAllHardmask(false);
    }
  };

  const handleRemoveHardmask = (index) => {
    setHardmaskList(prevList => prevList.filter((_, i) => i !== index));
    setProcessValues(prevValues => ({
      ...prevValues,
      hardmaskIds: prevValues.hardmaskIds.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = () => {
    setIsButtonClicked(true);
    setIsSubmitting(true);

    const newEmptyFields = {
      process_name: processValues.process_name === "",
      url: processValues.url === "",
      ua_list: processValues.ua_list === "Select User Agent",
      vpn: processValues.vpn === "Select VPN",
      os_type: processValues.os_type === "Select OS",
      tick_rate: processValues.tick_rate === "",
      aid: processValues.aid === "",
    };

    if (Object.values(newEmptyFields).some((field) => field)) {
      alert("Please fill in all required fields.");
      setEmptyFields(newEmptyFields);
      setIsButtonClicked(false);
      setIsSubmitting(false);
      return;
    }

    if (
      processValues.all_hardmask === "" &&
      processValues.hardmaskIds.length === 0
    ) {
      alert(
        "Please select at least one hardmask or choose an 'All Hardmask' option."
      );
      setIsButtonClicked(false);
      setIsSubmitting(false);
      return;
    }

    const dataToSend = {
      process_name: processValues.process_name,
      url: processValues.url,
      pbid: processValues.pbid,
      hp: processValues.hp,
      asi: processValues.asi,
      sid: processValues.sid,
      device_type: processValues.device_type,
      os_type: processValues.os_type,
      vpn: processValues.vpn,
      ua_list: processValues.ua_list,
      ua_id: processValues.ua_id,
      header_aid: processValues.aid,
      ua_id: processValues.ua_id,
      tick_rate: processValues.tick_rate,
      server: JSON.parse(localStorage.getItem("current_server")),
      cron: processValues.cron,
      rtb: isRTBChecked,
      at: processValues.at,
      timeout: processValues.timeout,
      bidfloor: processValues.bidfloor,
      process_log: isLogChecked.process_log,
      lat_macro: processValues.lat_macro,
      lon_macro: processValues.lon_macro,
      os_macro: processValues.os_macro,
      idfa_macro: processValues.idfa_macro,
      adid_macro: processValues.adid_macro,
      ifa_macro: processValues.ifa_macro,
      usp: processValues.usp_enabled ? processValues.usp : undefined,
      gdpr: processValues.gdpr_enabled ? processValues.gdpr : undefined,
      gdpr_c: processValues.gdpr_c_enabled ? processValues.gdpr_c : undefined,
      dnt: processValues.dnt_enabled ? processValues.dnt : undefined,
      schain: processValues.schain_enabled ? processValues.schain : undefined,
    };

    Object.keys(dataToSend).forEach(key =>
      dataToSend[key] === undefined && delete dataToSend[key]
    );


    if (selectAllHardmask) {
      dataToSend.all_hardmask = processValues.ua_list;
    } else {
      dataToSend.hardmaskIds = processValues.hardmaskIds;
    }

    console.log(dataToSend)
    axios
      .post(`${process.env.REACT_APP_API_URI}/create-process`, dataToSend, {
        headers: {
          Authorization: JSON.parse(localStorage.getItem("token")),
        },
      })
      .then(function (response) {
        if (response.status === 200) {
          navigate("/dashboard");
        } else {
          alert("Server not available. Please try again later.");
        }
        setIsButtonClicked(false);
      })
      .catch(function (error) {
        console.error("Error:", error);
        if (error.response && error.response.status === 401) {
          navigate("/login");
        } else if (error.response && error.response.status === 403) {
          alert("Permission Denied");
          setIsSubmitting(false)
        } else {
          alert("An server error occurred. Please try again later.");
          setIsSubmitting(false)
        }
        setIsButtonClicked(false);
      });
  };

  const handleServerChange = (e) => {
    if (e.target.value === "Add Server") {
      navigate("/addserver");
    } else {
      let server_name = e.target.value;
      let server = availableServer.filter(
        (server) => server.server_name === server_name
      );
      localStorage.setItem("current_server", JSON.stringify(server[0]));
      setSelectedServer(server_name);
      setProcessValues({
        ...processValues,
        server: e.target.value,
      });
    }
  };

  const handleAddhardmaskList = (payload) => {
    if (!selectAllHardmask) {
      setProcessValues((prevProcessValues) => ({
        ...prevProcessValues,
        hardmaskIds: [...prevProcessValues.hardmaskIds, payload.id],
        all_hardmask: "",
      }));

      setHardmaskList((list) => [...list, { ...payload, showDetails: false }]);
      setIsHardmaskSelected(true);
      setSelectAllHardmask(false);
    }
  };

  const handleOSChange = (e) => {
    const selectedOSId = e.target.value;
    const selectedOSName = e.target.options[e.target.selectedIndex].text;
    console.log(selectedOSName)
    setSelectedOSId(selectedOSId);
    setProcessValues({
      ...processValues,
      os_type: selectedOSName,
      ua_list: "",
      all_hardmask: "",
      hardmaskIds: [],
    });

    if (selectedOSId) {
      axios.get(`${process.env.REACT_APP_API_URI}/get-ua-by-os/${selectedOSId}`, {
        headers: {
          Authorization: JSON.parse(localStorage.getItem("token")),
        },
      })
        .then((response) => {
          setUaList(response.data);
        })
        .catch((error) => {
          console.log(error);
        });
    } else {
      setUaList([]);
    }
  };

  // const handleUAChange = (e) => {
  //   const selectedUAName = e.target.options[e.target.selectedIndex].text;
  //   setProcessValues({
  //     ...processValues,
  //     ua_list: selectedUAName,
  //     hardmaskIds: [],
  //     all_hardmask: "",
  //   });
  //   setHardmaskList([]);
  //   setSelectAllHardmask(false);
  // };

  const handleAllHardmask = (e) => {
    setProcessValues({
      ...processValues,
      all_hardmask: e.target.value,
      hardmaskIds: [],
    });

    setHardmaskList([]);
    setIsHardmaskSelected(false);
  };

  const handleVpnChange = (e) => {
    setProcessValues({
      ...processValues,
      vpn: e.target.value,
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProcessValues(prevValues => ({
      ...prevValues,
      [name]: value,
    }));
  };

  const handleFileUpload = (data) => {
    if (data && typeof data === 'object') {
      setProcessValues(prevValues => ({
        ...prevValues,
        ...data,
        os_type: data.os_type || "Select OS",
        ua_list: data.ua_list || "Select User Agent"
      }));

      if (data.hardmaskList && Array.isArray(data.hardmaskList)) {
        setHardmaskList(data.hardmaskList);
        setProcessValues(prevValues => ({
          ...prevValues,
          hardmaskIds: data.hardmaskList.map((_, index) => index) // Use index as temporary ID
        }));
      }

      if (data.os_type) {
        const osId = osList.find(os => os.name === data.os_type)?.id;
        if (osId) {
          setSelectedOSId(osId);
          fetchUAList(osId);
        }
      }
    }
  };

  const fetchUAList = (osId) => {
    axios.get(`${process.env.REACT_APP_API_URI}/get-ua-by-os/${osId}`, {
      headers: {
        Authorization: JSON.parse(localStorage.getItem("token")),
      },
    })
      .then((response) => {
        setUaList(response.data);
      })
      .catch((error) => {
        console.error('Error fetching UA list:', error);
      });
  };


  const handleRTBChange = (e) => {
    setIsRTBChecked(e.target.checked);
  };

  const handleAT = (e) => {
    setProcessValues({
      ...processValues,
      at: e.target.value,
    });
  };

  const handleCheckboxChange = (name) => {
    setProcessValues(prevValues => ({
      ...prevValues,
      [name]: !prevValues[name],
      ...(name.endsWith('_enabled') ? {
        [name.replace('_enabled', '')]: prevValues[name] ? '' : prevValues[name.replace('_enabled', '')]
      } : {})
    }));
  };

  const AddLink = async () => {
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URI}/add-url`,
        {
          url: processValues.url
        },
        {
          headers: {
            Authorization: JSON.parse(localStorage.getItem('token'))
          }
        }
      )
      if (response.status === 200) {
        alert("Link Added Sucessfully")
      }
    }
    catch (error) {
      console.log(error)
      alert("Error Adding Link");
    }
  }

  return (
    <div className="min-h-screen zincbg py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className=" rounded-lg overflow-hidden">
            <div className="px-4 py-5 rounded-lg border-2 border-gray-300 sm:p-6 graybg">
              <h3 className="text-lg font-extrabold text-center leading-6 mb-2 textwhite">
                Create New Process
              </h3>
              <FileUploadComponent
                onFileUpload={handleFileUpload}

              />
              <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div className="sm:col-span-6">
                  <div className="mt-0">
                    <input
                      type="text"
                      name="process_name"
                      id="process_name"
                      placeholder=" Process Name"
                      value={processValues.process_name}
                      onChange={(e) =>
                        setProcessValues({
                          ...processValues,
                          [e.target.name]: e.target.value,
                        })
                      }
                      autoComplete="process_name"
                      className={`input ${emptyFields.process_name ? "border-red-500" : ""}`}

                    />
                  </div>
                </div>

                <div className="sm:col-span-6 flex">
                  <div className="mt-0 flex-grow">
                    <input
                      type="text"
                      name="url"
                      id="url"
                      placeholder="Enter URL"
                      value={processValues.url || processValues.link}
                      onChange={(e) =>
                        setProcessValues({
                          ...processValues,
                          [e.target.name]: e.target.value,
                        })
                      }
                      autoComplete="url"
                      className={`input ${emptyFields.url ? "border-red-500" : ""}`}
                    />
                  </div>
                  {/* <div className="ml-2">
                    <button
                      onClick={AddLink}
                      className="bg-blue-500 text-white hover:bg-blue-800 px-4 py-1 rounded-md"
                    >
                      +
                    </button>
                  </div> */}
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={isRTBChecked}
                    onChange={handleRTBChange}
                    className="h-5 w-5 mr-2"
                  />
                  <label className="block text-sm font-bold leading-6 textwhite">
                    Select RTB
                  </label>
                </div>

                {isRTBChecked && (
                  <div className="sm:col-span-6 grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-bold leading-6 textwhite">
                        AT
                      </label>
                      <div className="mt-2">
                        <select
                          id="at"
                          name="at"
                          value={processValues.at}
                          onChange={handleAT}
                          className="dropdown"
                        >
                          <option value="Select AT">Select AT</option>
                          <option value="1">1</option>
                          <option value="2">2</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-bold leading-6 textwhite">
                        bidfloor
                      </label>
                      <div className="mt-2">
                        <input
                          type="number"
                          name="bidfloor"
                          id="bidfloor"
                          value={processValues.bidfloor}
                          onChange={(e) =>
                            setProcessValues({
                              ...processValues,
                              [e.target.name]: e.target.value,
                            })
                          }
                          autoComplete="bidfloor"
                          className="dropdown"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-bold leading-6 textwhite">
                        timeout
                      </label>
                      <div className="mt-2">
                        <input
                          type="number"
                          name="timeout"
                          id="timeout"
                          value={processValues.timeout}
                          onChange={(e) =>
                            setProcessValues({
                              ...processValues,
                              [e.target.name]: e.target.value,
                            })
                          }
                          autoComplete="timeout"
                          className="dropdown"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-bold leading-6 textwhite">
                        Publisher Id
                      </label>
                      <div className="mt-2">
                        <input
                          type="text"
                          name="pbid"
                          id="pbid"
                          value={processValues.pbid}
                          onChange={(e) =>
                            setProcessValues({
                              ...processValues,
                              [e.target.name]: e.target.value,
                            })}
                          autoComplete="pbid"
                          className="dropdown "
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-bold leading-6 textwhite">
                        Device Type
                      </label>
                      <div className="mt-2">
                        <input
                          type="number"
                          name="device_type"
                          id="device_type"
                          value={processValues.device_type}
                          onChange={(e) =>
                            setProcessValues({
                              ...processValues,
                              [e.target.name]: e.target.value,
                            })
                          }

                          className="dropdown"
                        />
                      </div>
                    </div>


                    <div className="space-y-2">
                      <label className="block text-sm font-bold leading-6 textwhite">
                        asi
                      </label>
                      <div className="mt-2">
                        <input
                          type="text"
                          name="asi"
                          id="asi"
                          value={processValues.asi}
                          onChange={(e) =>
                            setProcessValues({
                              ...processValues,
                              [e.target.name]: e.target.value,
                            })
                          }
                          autoComplete="asi"
                          className="dropdown"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-bold leading-6 textwhite">
                        hp
                      </label>
                      <div className="mt-2">
                        <input
                          type="text"
                          name="hp"
                          id="hp"
                          value={processValues.hp}
                          onChange={(e) =>
                            setProcessValues({
                              ...processValues,
                              [e.target.name]: e.target.value,
                            })
                          }
                          autoComplete="hp"
                          className="dropdown"
                        />
                      </div>
                    </div>


                    <div className="space-y-2">
                      <label className="block text-sm font-bold leading-6 textwhite">
                        sid
                      </label>
                      <div className="mt-2">
                        <input
                          type="text"
                          name="sid"
                          id="sid"
                          value={processValues.sid}
                          onChange={(e) =>
                            setProcessValues({
                              ...processValues,
                              [e.target.name]: e.target.value,
                            })
                          }
                          autoComplete="sid"
                          className="dropdown"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {!isRTBChecked && (
                  <div className="sm:col-span-6 space-y-4">
                    {/* <h4 className="text-lg font-medium textwhite">Privacy Settings</h4> */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {/* US Privacy */}
                      <div>
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id="usp_enabled"
                            checked={processValues.usp_enabled}
                            onChange={() => handleCheckboxChange('usp_enabled')}
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                          />
                          <label htmlFor="usp_enabled" className="ml-2 block text-sm textwhite">
                            US Privacy
                          </label>
                        </div>
                        {processValues.usp_enabled && (
                          <input
                            name="usp"
                            id="usp"
                            value={processValues.usp}
                            onChange={handleInputChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-slate-700 textwhite"
                          />
                        )}
                      </div>

                      {/* GDPR */}
                      <div>
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id="gdpr_enabled"
                            checked={processValues.gdpr_enabled}
                            onChange={() => handleCheckboxChange('gdpr_enabled')}
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded" />
                          <label htmlFor="gdpr_enabled" className="ml-2 block text-sm textwhite">
                            GDPR
                          </label>
                        </div>
                        {processValues.gdpr_enabled && (
                          <select
                            name="gdpr"
                            id="gdpr"
                            value={processValues.gdpr}
                            onChange={handleInputChange}
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md dark:bg-slate-700 textwhite"
                          >
                            <option value="">Select</option>
                            <option value="0">0</option>
                            <option value="1">1</option>
                          </select>
                        )}
                      </div>

                      {/* GDPR Consent */}
                      <div>
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id="gdpr_c_enabled"
                            checked={processValues.gdpr_c_enabled}
                            onChange={() => handleCheckboxChange('gdpr_c_enabled')}
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                          />
                          <label htmlFor="gdpr_c_enabled" className="ml-2 block text-sm textwhite">
                            GDPR Consent
                          </label>
                        </div>
                        {processValues.gdpr_c_enabled && (
                          <select
                            name="gdpr_c"
                            id="gdpr_c"
                            value={processValues.gdpr_c}
                            onChange={handleInputChange}
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md dark:bg-slate-700 textwhite"
                          >
                            <option value="">Select</option>
                            <option value="0">0</option>
                            <option value="1">1</option>
                          </select>
                        )}
                      </div>

                      {/* DNT */}
                      <div>
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id="dnt_enabled"
                            checked={processValues.dnt_enabled}
                            onChange={() => handleCheckboxChange('dnt_enabled')}
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                          />
                          <label htmlFor="dnt_enabled" className="ml-2 block text-sm textwhite">
                            DNT
                          </label>
                        </div>
                        {processValues.dnt_enabled && (
                          <select
                            name="dnt"
                            id="dnt"
                            value={processValues.dnt}
                            onChange={handleInputChange}
                            className="mt-1 block w-full pl-3 pr-10 py-2 dark:bg-slate-700 textwhite text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                          >
                            <option value="">Select</option>
                            <option value="0">0</option>
                            <option value="1">1</option>
                          </select>
                        )}
                      </div>

                      {/* SChain */}
                      <div className="sm:col-span-2 md:col-span-3">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id="schain_enabled"
                            checked={processValues.schain_enabled}
                            onChange={() => handleCheckboxChange('schain_enabled')}
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded "
                          />
                          <label htmlFor="schain_enabled" className="ml-2 block text-sm textwhite">
                            SChain
                          </label>
                        </div>
                        {processValues.schain_enabled && (
                          <input
                            type="text"
                            name="schain"
                            placeholder="Enter schain"
                            id="schain"
                            value={processValues.schain}
                            onChange={handleInputChange}
                            className="mt-1 block w-full border dark:bg-slate-700 textwhite border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          />
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <div className="sm:col-span-6 space-y-4">
                  {/* <h3 className="text-lg font-semibold textwhite mb-2">Additional Options</h3> */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="lat_macro"
                        name="lat_macro"
                        checked={processValues.lat_macro}
                        onChange={() => handleCheckboxChange('lat_macro')}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <label htmlFor="lat_macro" className="textwhite text-sm font-medium">Lat</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="lon_macro"
                        name="lon_macro"
                        checked={processValues.lon_macro}
                        onChange={() => handleCheckboxChange('lon_macro')}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <label htmlFor="lon_macro" className="textwhite text-sm font-medium">Lon</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="os_macro"
                        name="os_macro"
                        checked={processValues.os_macro}
                        onChange={() => handleCheckboxChange('os_macro')}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <label htmlFor="os_macro" className="textwhite text-sm font-medium">OS</label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="idfa_macro"
                        name="idfa_macro"
                        checked={processValues.idfa_macro}
                        onChange={() => handleCheckboxChange('idfa_macro')}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <label htmlFor="os_macro" className="textwhite text-sm font-medium">idfa</label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="adid_macro"
                        name="adid_macro"
                        checked={processValues.adid_macro}
                        onChange={() => handleCheckboxChange('adid_macro')}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <label htmlFor="os_macro" className="textwhite text-sm font-medium">adid</label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="ifa_macro"
                        name="ifa_macro"
                        checked={processValues.ifa_macro}
                        onChange={() => handleCheckboxChange('ifa_macro')}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <label htmlFor="ifa_macro" className="textwhite text-sm font-medium">ifa</label>
                    </div>

                  </div>
                </div>



                <div className="sm:col-span-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="os_type" className="block text-sm font-bold leading-6 textwhite">
                      Select OS
                    </label>
                    <div className="mt-2">
                      <select
                        id="os_type"
                        name="os_type"
                        value={selectedOSId}
                        onChange={handleOSChange}
                        className={`dropdown ${emptyFields.os_type ? "border-red-500" : ""}`}
                      >
                        <option value="">Select OS</option>
                        {osList.map((os) => (
                          <option key={os.id} value={os.id}>
                            {os.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="ua_list" className="block text-sm font-bold leading-6 textwhite">
                      UA List
                    </label>
                    <div className="mt-2">
                      <select
                        id="ua_list"
                        name="ua_list"
                        value={uaList.find(ua => ua.name === processValues.ua_list)?.id || ""}
                        onChange={handleUAChange}
                        className={`dropdown ${emptyFields.ua_list ? "border-red-500" : ""}`}
                        disabled={!selectedOSId}
                      >
                        <option value="">Select User Agent</option>
                        {uaList.map((ua) => (
                          <option key={ua.id} value={ua.id.toString()}>
                            {ua.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="header" className="block text-sm font-bold leading-6 textwhite">
                      Select Header
                    </label>
                    <div className="mt-2">
                      <select
                        id="aid"
                        name="aid"
                        value={processValues.aid ? uniqueHeaders.find(h => h.aid.toString() === processValues.aid)?.id : ""}
                        onChange={handleHeaderChange}
                        className={`dropdown ${emptyFields.aid ? "border-red-500" : ""}`}
                      >
                        <option value="">Select Header</option>
                        {uniqueHeaders.map((header) => (
                          <option key={header.id} value={header.id.toString()}>
                            {header.aname}
                          </option>
                        ))}
                      </select>

                    </div>
                  </div>

                </div>

                <div className="sm:col-span-6">
                  <AutocompleteSearch
                    onButtonClick={handleAddhardmaskList}
                    selectedOS={processValues.os_type}
                    isAllHardmaskSelected={processValues.all_hardmask !== ""}
                  />
                </div>

                {processValues.os_type !== "Select OS" && (
                  <>
                    <div className="flex flex-col sm:col-span-6">
                      <label
                        htmlFor="ua_list"
                        className="block text-sm p-1 font-bold leading-6 textwhite"
                      >
                        All Hardmask Type
                      </label>
                      <select
                        id="all_hardmask"
                        name="all_hardmask"
                        value={processValues.all_hardmask}
                        onChange={handleAllHardmask}
                        disabled={isHardmaskSelected}
                        className={`block w-full rounded-md border-0 py-2 gray700 textwhite shadow-sm sm:max-w-xs sm:text-sm sm:leading-6 ${isHardmaskSelected
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                          }`}
                      >
                        <option value="Select All Hardmask">
                          Select All Hardmask
                        </option>
                        {processValues.os_type === "iOS" && (
                          <>
                            <option value="apple_ctv">apple_ctv</option>
                            <option value="apple_inapp">apple_inapp</option>
                          </>
                        )}
                        {processValues.os_type === "Android" && (
                          <>
                            <option value="android_inapp">android_inapp</option>
                            <option value="android_ctv">android_ctv</option>
                          </>
                        )}
                        {processValues.os_type === "Roku" && (
                          <>
                            <option value="roku_al">roku_al Hardmask</option>
                            <option value="roku_number">roku_number</option>
                          </>
                        )}
                        {processValues.os_type === "Fire TV" && (
                          <>
                            <option value="fire_ctv">fire_ctv</option>
                          </>
                        )}
                        {processValues.os_type === "Tizen" && (
                          <>
                            <option value="all_tizen">all_tizen</option>
                          </>
                        )}
                      </select>
                    </div>

                  </>
                )}

                <div className="sm:col-span-6 grid grid-cols-1 sm:grid-cols-3 gap-4">

                  <div className="space-y-2">
                    <label
                      htmlFor="vpn"
                      className="block text-sm font-bold leading-6 textwhite"
                    >
                      VPN
                    </label>
                    <div className="mt-2">
                      <select
                        id="vpn"
                        name="vpn"
                        value={processValues.vpn}
                        onChange={handleVpnChange}
                        className={`dropdown ${emptyFields.vpn ? "border-red-500" : ""}`}
                      >
                        <option value="Select VPN">Select VPN</option>
                        <option value="nine22">nine22</option>
                        <option value="luna">luna</option>
                        <option value="webshare">webshare</option>
                        <option value="pxs">pxs</option>
                        <option value="pxs+luna">pxs+luna</option>

                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="tick_rate"
                      className="block text-sm font-bold leading-6 textwhite"
                    >
                      QPS
                    </label>
                    <div className="mt-2 flex items-center">
                      <input
                        type="number"
                        name="tick_rate"
                        id="tick_rate"
                        value={processValues.tick_rate}
                        onChange={(e) =>
                          setProcessValues({
                            ...processValues,
                            tick_rate: parseInt(e.target.value),
                          })
                        }
                        className={`dropdown pl-2 ${emptyFields.tick_rate ? "border-red-500" : ""}`}

                      />
                    </div>
                  </div>

                  <div className="space-2">
                    <label
                      htmlFor="server"
                      className="block text-sm font-bold leading-6 textwhite"
                    >
                      Server
                    </label>
                    <div className="mt-2">
                      <select
                        id="server"
                        name="server"
                        value={selectedServer || "Loading"}
                        onChange={handleServerChange}
                        className="dropdown"
                      >
                        {availableServer.length === 0 && <option>Loading</option>}
                        {availableServer.length > 0 &&
                          availableServer.map((server) => (
                            <option
                              key={server.server_name}
                              value={server.server_name}
                            >
                              {server.server_name}
                            </option>
                          ))}
                        {/* <option value="Add Server" className="text-red-500">
                          Add Server
                        </option> */}
                      </select>
                    </div>
                  </div>
                </div>
                <div className="sm:col-span-6 flex items-center">
                  <label className="block text-sm font-bold leading-6 textwhite mr-4">
                    Process Log
                  </label>
                  <input
                    type="checkbox"
                    checked={isLogChecked.process_log}
                    onChange={(e) =>
                      setIsLogChecked((prevState) => ({
                        ...prevState,
                        process_log: e.target.checked,
                      }))
                    }
                    className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </div>
                <br /> <p> </p>
                <div className="flex flex-col  sm:col-span-6">
                  <button
                    className={`btn2 ${isButtonClicked
                      ? "opacity-50 cursor-not-allowed"
                      : "w-full bg-blue-500 border hover:scale-105 text-white font-bold px-4 py-2 rounded-md focus:outline-none p-3 hover:bg-blue-600 mb-2"
                      }`}
                    onClick={handleSubmit}
                    disabled={isButtonClicked}
                  >
                    Start Process
                    {isSubmitting && (
                      <span className="inline-block ml-2 animate-spin"><FaSpinner /></span>
                    )}
                  </button>
                  <SaveButton
                    processValues={processValues}
                    isRTBChecked={isRTBChecked}
                    hardmaskList={hardmaskList}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="max-w-4xl w-full px-4">
            <div className="grid grid-cols-1 gap-8">
              <div className="border-2 border-gray-300 graybg rounded-lg p-6">
                <h3 className="textwhite text-lg text-center mb-4">
                  Selected Hardmask
                </h3>
                {hardmaskList.map((selected, index) => (
                  <div key={index} className="mb-4">
                    <div className="gray700 p-2 mb-2 flex justify-between items-center">
                      <p
                        className="textwhite cursor-pointer"
                        onClick={() =>
                          setHardmaskList((prevList) =>
                            prevList.map((mask, i) =>
                              i === index
                                ? { ...mask, showDetails: !mask.showDetails }
                                : mask
                            )
                          )
                        }
                      >
                        {selected.appname}
                      </p>
                      <button
                        onClick={() => handleRemoveHardmask(index)}
                        className="bg-red-500 textwhite py-1 px-2 rounded"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                    {selected.showDetails && (
                      <div className="mt-2">
                        <input
                          type="text"
                          placeholder="App Bundle"
                          name="appBundle"
                          value={selected.appbundle}
                          disabled={true}
                          className="input"
                        />
                        <input
                          type="text"
                          placeholder="App URL"
                          name="appUrl"
                          value={selected.appurl}
                          disabled={true}
                          className="input"
                        />
                        <input
                          type="text"
                          placeholder="OS"
                          name="os"
                          value={selected.os_type}
                          disabled={true}
                          className="input"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
