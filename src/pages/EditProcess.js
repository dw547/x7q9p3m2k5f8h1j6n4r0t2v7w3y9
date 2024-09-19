import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import AutocompleteSearch from "../components/AutocompleteSearch";
import { FiTrash2 } from "react-icons/fi";
import { FaSpinner } from "react-icons/fa";
import SaveButton from "../components/SaveButton";

export default function EditProcess() {
  const id = window.location.search.substring(4);
  console.log(id);
  const navigate = useNavigate();
  const [isHardmaskSelected, setIsHardmaskSelected] = useState(false);
  const [isRTBChecked, setIsRTBChecked] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [osList, setOsList] = useState([]);
  const [uaList, setUaList] = useState([]);
  const [selectedOSId, setSelectedOSId] = useState('');
  const [headerList, setHeaderList] = useState([]);
  const [uniqueHeaders, setUniqueHeaders] = useState([]);
  const [isLogChecked, setIsLogChecked] = useState({
    process_log: false,
  });

  const [processValues, setProcessValues] = useState({
    process_name: "",
    link: "",
    usp: "",
    dnt: "",
    gdpr: "",
    gdpr_c: "",
    schain: "",
    tick_rate: 0,
    os_type: "Select OS",
    ua_list: "Select User Agent",
    vpn: "Select VPN",
    hardmask: [],
    serverId: "",
    server_list: {},
    process_id: "",
    hardmask_type: "Select All Hardmask",
    at: "Select AT",
    bidfloor: "",
    timeout: 0,
    process_log: false,
    lat_macro: true,
    lon_macro: true,
    os_macro: true,
    idfa_macro:true,
    ifa_macro:true,
    adid_macro:true,
    usp_enabled: false,
    gdpr_enabled: false,
    gdpr_c_enabled: false,
    dnt_enabled: false,
    schain_enabled: false,
    pbid: "",
    sid: "",
    hp: '',
    header: "",
    ua_id: "",
    asi: "",
    device_type: "",
  });
  const [hardmaskList, setHardmaskList] = useState([]);

  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_API_URI}/edit-process/${id}`, {
        headers: {
          Authorization: JSON.parse(localStorage.getItem("token")),
        },
      })
      .then((response) => {
        const processData = response.data;
        console.log("Process Data:", response.data);
        setProcessValues(processData);
        setHardmaskList(processData.hardmask || []);
        setIsRTBChecked(processData.rtb || false);

        // Find the OS ID based on the name
        const matchingOS = osList.find(os => os.name === processData.os_type);
        if (matchingOS) {
          setSelectedOSId(matchingOS.id);
          // Fetch UA list for the selected OS
          fetchUAList(matchingOS.id, processData.ua_list);
        }

        // Fetch headers and set the selected header
        fetchHeaders().then(() => {
          const matchingHeader = uniqueHeaders.find(header => header.aid.toString() === processData.aid);
          if (matchingHeader) {
            setProcessValues(prev => ({
              ...prev,
              aid: matchingHeader.id.toString()
            }));
          }
        });
      })
      .catch((error) => {
        console.log(error);
        if (error.response && error.response.status === 401) {
          navigate("/login");
        }
      });
  }, [id, osList]);

  useEffect(() => {
    // Fetch OS list
    axios.get(`${process.env.REACT_APP_API_URI}/get-all-os`, {
      headers: {
        Authorization: JSON.parse(localStorage.getItem("token")),
      },
    })
      .then((response) => {
        setOsList(response.data);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

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
        console.log(error);
      });
  };

  const handleSubmit = () => {
    setIsButtonDisabled(true);
    setIsSubmitting(true);
    const dataToSend = {
      process_name: processValues.process_name,
      link: processValues.link,
      os_type: processValues.os_type,
      vpn: processValues.vpn,
      hardmask: processValues.hardmask,
      ua_list: processValues.ua_list,
      process_id: processValues.process_id,
      tick_rate: processValues.tick_rate,
      server_list: processValues.server_list,
      all_hardmask: processValues.hardmask_type,
      rtb: isRTBChecked,
      at: processValues.at,
      timeout: processValues.timeout,
      bidfloor: processValues.bidfloor,
      process_log: processValues.process_log,
      lat_macro: processValues.lat_macro,
      lon_macro: processValues.lon_macro,
      idfa_macro: processValues.idfa_macro,
      ifa_macro:processValues.ifa_macro,
      adid_macro: processValues.adid_macro,
      os_macro: processValues.os_macro,
      usp: processValues.usp_enabled ? processValues.usp : undefined,
      gdpr: processValues.gdpr_enabled ? processValues.gdpr : undefined,
      gdpr_c: processValues.gdpr_c_enabled ? processValues.gdpr_c : undefined,
      dnt: processValues.dnt_enabled ? processValues.dnt : undefined,
      schain: processValues.schain_enabled ? processValues.schain : undefined,
      pbid: processValues.pbid,
      hp: processValues.hp,
      asi: processValues.asi,
      header_aid: processValues.header,
      ua_id: processValues.ua_id,
      sid: processValues.sid,
      device_type: processValues.device_type,
    };

    // Remove undefined values
    Object.keys(dataToSend).forEach(key => 
      dataToSend[key] === undefined && delete dataToSend[key]
    );

    console.log("Data to send:", dataToSend);

    axios
      .post(
        `${process.env.REACT_APP_API_URI}/edit-process`,
        dataToSend,
        {
          headers: {
            Authorization: JSON.parse(localStorage.getItem("token")),
          },
        }
      )
      .then(function (response) {
        console.log(response);
        if (response.status === 200) {
          setIsSubmitting(false);
          setIsButtonDisabled(false);
          navigate("/dashboard");
        } else {
          alert("Server not available. Please try again later.");
          setIsButtonDisabled(false);
        }
      })
      .catch(function (error) {
        setIsSubmitting(false);
        setIsButtonDisabled(false);
        console.error("Error:", error);
        if (error.response && error.response.status === 401) {
          setIsSubmitting(false);
          navigate("/login");
        } else {
          alert("An server error occurred. Please try again later.");
          setIsSubmitting(false);
          setIsButtonDisabled(false);

        }
      });
  };

  const handleAddhardmaskList = (payload) => {
    setProcessValues((prevProcessValues) => ({
      ...prevProcessValues,
      hardmask: [...prevProcessValues.hardmask, payload],
    }));

    setHardmaskList((list) => [...list, payload]);
    setIsHardmaskSelected(true);
  };

  const handleAllHardmask = (e) => {
    setProcessValues({
      ...processValues,
      hardmask_type: e.target.value,
    });
    setIsHardmaskSelected(false);
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
    });

    // Fetch UA list for the selected OS
    if (selectedOSId) {
      fetchUAList(selectedOSId);
    } else {
      setUaList([]);
    }
  };

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
    return axios.get(`${process.env.REACT_APP_API_URI}/get-all-header`, {
      headers: {
        Authorization: JSON.parse(localStorage.getItem("token"))
      }
    }).then((response) => {
      if (response.status === 200) {
        setHeaderList(response.data);
        // Create a unique list of headers based on aid and aname
        const uniqueHeaderMap = new Map();
        response.data.forEach(header => {
          const key = `${header.aid}-${header.aname}`;
          if (!uniqueHeaderMap.has(key)) {
            uniqueHeaderMap.set(key, header);
          }
        });
        setUniqueHeaders(Array.from(uniqueHeaderMap.values()));
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
        header: selectedHeader.aid.toString(),
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
      }));
    }
  };

  const handleVpnChange = (e) => {
    setProcessValues({
      ...processValues,
      vpn: e.target.value,
    });
  };

  const handleua_listChange = (e) => {
    setProcessValues({
      ...processValues,
      ua_list: e.target.value,
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProcessValues(prevValues => ({
      ...prevValues,
      [name]: value,
    }));
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
  const handleRemoveHardmask = (index) => {
    setHardmaskList(prevList => prevList.filter((_, i) => i !== index));
    setProcessValues(prevValues => ({
      ...prevValues,
      hardmask: prevValues.hardmask.filter((_, i) => i !== index)
    }));
  
    if (hardmaskList.length === 1) {
      setIsHardmaskSelected(false);
    }
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

  console.log("Render Hardmask List:", hardmaskList);

  return (
    <div className="min-h-screen zincbg py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white shadow-lg rounded-lg overflow-hidden">
            <div className="px-4 py-5 rounded-lg border-2 border-gray-300 sm:p-6 graybg">
              <h3 className="text-lg font-extrabold text-center leading-6 textwhite">
                Update Process
              </h3>
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
                      className="input"
                    />
                  </div>
                </div>

                <div className="sm:col-span-6">

                  <div className="mt-0">
                    <input
                      type="text"
                      name="link"
                      id="link"
                      value={processValues.link}
                      onChange={(e) =>
                        setProcessValues({
                          ...processValues,
                          [e.target.name]: e.target.value,
                        })
                      }
                      autoComplete="link"
                      className="input"
                    />
                  </div>
                </div>

                <div className="flex items-center">

                  <input
                    type="checkbox"
                    checked={isRTBChecked}
                    onChange={handleRTBChange}
                    className="h-5 w-10 mr-2"
                  />
                  <label className="block text-sm font-bold leading-6 textwhite">Select RTB</label>
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
                            })
                          }
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
                          className="dropdown "
                        />
                      </div>
                      </div>
                  </div>
                )}

{!isRTBChecked && (
                <div className="sm:col-span-6 space-y-4">
                  <h4 className="text-lg font-medium textwhite">Privacy Settings</h4>
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
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"/>
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
<h3 className="text-lg font-semibold textwhite mb-2">Additional Options</h3>
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
                        id="ifa_macro"
                        name="ifa_macro"
                        checked={processValues.ifa_macro}
                        onChange={() => handleCheckboxChange('ifa_macro')}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <label htmlFor="ifa_macro" className="textwhite text-sm font-medium">ifa</label>
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
              className={`dropdown`}
            >
              <option value="">Select OS</option>
              {osList.map((os) => (
                <option key={os.id} value={os.id} selected={os.name === processValues.os_type}>
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
              className={`dropdown`}
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
              id="header"
              name="header"
              value={uniqueHeaders.find(h => h.aid.toString() === processValues.header)?.id || ""}
              onChange={handleHeaderChange}
              className="dropdown"
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
                    // isAllHardmaskSelected={processValues.hardmask_type !== ""}
                    isAllHardmaskSelected={false}
                  />
                </div>
                {processValues.os_type !== "Select OS" && (
                  <>
                    <div className="flex flex-col  sm:col-span-6">
                      <label
                        htmlFor="ua_list"
                        className="block text-sm p-1 font-bold leading-6 textwhite"
                      >
                        All Hardmask Type
                      </label>
                      <select
                        id="all_hardmask"
                        name="all_hardmask"
                        value={processValues.hardmask_type}
                        onChange={handleAllHardmask}
                        // disabled={isHardmaskSelected}
                        // className={`block w-full rounded-md border-0 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:max-w-xs sm:text-sm sm:leading-6 ${isHardmaskSelected ? 'opacity-50 cursor-not-allowed' : ''
                        //   }`}
                        className={`block w-full rounded-md border-0 py-2 gray700 textwhite shadow-sm  sm:max-w-xs sm:text-sm sm:leading-6
                          }`}
                      >
                        <option value="">Select All Hardmask</option>
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
                        className="dropdown"
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
                        className="dropdown text-center"
                      />
                    </div>
                  </div>

                </div>

                <div className="sm:col-span-6 flex items-center">
                  <label className="block text-sm font-bold leading-6 textwhite mr-4">
                    Process Log
                  </label>
                  <input
                    type="checkbox"
                    checked={processValues.process_log}
                    onChange={(e) =>
                      setProcessValues((prevState) => ({
                        ...prevState,
                        process_log: e.target.checked,
                      }))
                    }
                    className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </div>
                <div className="flex justify-center sm:col-span-6 gap-8">
                  <div>
                  <button
                    onClick={handleSubmit}
                    disabled={isButtonDisabled}
                    className={`w-full ${isButtonDisabled ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-700'
                      } border border-black rounded p-2 px-8 textwhite`}
                  >
                    Update Process
                    {isSubmitting && (
                      <span className="inline-block ml-2 animate-spin"><FaSpinner /></span>
                    )}
                  </button>
                  </div>
                  <div>
                  <SaveButton 
                processValues={processValues} 
                isRTBChecked={isRTBChecked} 
                hardmaskList={hardmaskList}
              />
                  </div>
              
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
