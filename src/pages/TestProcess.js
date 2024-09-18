import React, { useState, useEffect } from "react";
import axios from "axios";
import AutocompleteSearch from "../components/AutocompleteSearch";
import { useNavigate } from "react-router-dom";

export default function Process() {
  const [processValues, setProcessValues] = useState({
    process_name: "",
    url: "",
    tick_rate: 0,
    os_type: "Select OS",
    ua_list: "Select User Agent",
    vpn: "Select VPN",
    hardmaskIds: [],
    server: "Select server",
    cron: "Cron Time",
    all_hardmask: "Select All Hardmask",
  });
  const [hardmaskList, setHardmaskList] = useState([]);
  const navigate = useNavigate();
  const [selectedServer, setSelectedServer] = useState(null);
  const [availableServer, setAvailableServer] = useState([]);
  const [isButtonClicked, setIsButtonClicked] = useState(false);
  const [isHardmaskSelected, setIsHardmaskSelected] = useState(false);

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
          console.log(error);
          if (error.response && error.response.status === 401) {
            navigate("/login");
          }
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
        if (error.response && error.response.status === 401) {
          navigate("/login");
        }
      });
  }, []);

  const handleRemoveHardmask = (id) => {
    const updatedHardmaskIds = processValues.hardmaskIds.filter(
      (hardmaskId) => hardmaskId !== id
    );
    const updatedHardmaskList = hardmaskList.filter((item) => item.id !== id);

    setProcessValues((prevProcessValues) => ({
      ...prevProcessValues,
      hardmaskIds: updatedHardmaskIds,
    }));

    setHardmaskList(updatedHardmaskList);

    if (updatedHardmaskIds.length === 0) {
      setIsHardmaskSelected(false);
    }
  };

  const handleTickrateChange = (value) => {
    const newTickrate = processValues.tick_rate + value;
    setProcessValues({ ...processValues, tick_rate: newTickrate });
  };

  const handleSubmit = () => {
    setIsButtonClicked(true);

    if (
      processValues.process_name === "" ||
      processValues.url === "" ||
      processValues.ua_list === "Select User Agent" ||
      processValues.vpn === "Select VPN" ||
      processValues.os_type === "Select OS"
    ) {
      alert("Please fill in all required fields.");
      setIsButtonClicked(false);
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
      return;
    }

    const dataToSend = {
      process_name: processValues.process_name,
      url: processValues.url,
      os_type: processValues.os_type,
      vpn: processValues.vpn,
      ua_list: processValues.ua_list,
      tick_rate: processValues.tick_rate,
      server: JSON.parse(localStorage.getItem("current_server")),
      cron: processValues.cron,
    };

    if (processValues.all_hardmask !== "") {
      dataToSend.all_hardmask = processValues.all_hardmask;
    } else {
      dataToSend.hardmaskIds = processValues.hardmaskIds;
    }

    axios
      .post(`${process.env.REACT_APP_API_URI}/create-test-process`, dataToSend, {
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
        } else {
          alert("An server error occurred. Please try again later.");
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
    setProcessValues((prevProcessValues) => ({
      ...prevProcessValues,
      hardmaskIds: [...prevProcessValues.hardmaskIds, payload.id],
      all_hardmask: "",
    }));

    setHardmaskList((list) => [...list, { ...payload, showDetails: false }]);
    setIsHardmaskSelected(true);
  };

  const handleOSChange = (e) => {
    const selectedOS = e.target.value;
    setProcessValues({
      ...processValues,
      os_type: selectedOS,
      ua_list: "Select User Agent",
      all_hardmask: "",
      hardmaskIds: [],
    });
  };

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

  const handleCronChange = (e) => {
    setProcessValues({
      ...processValues,
      cron: e.target.value,
    });
  };

  const handleua_listChange = (e) => {
    setProcessValues({
      ...processValues,
      ua_list: e.target.value,
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white shadow-lg rounded-lg overflow-hidden ">
            <div className="px-4 py-5 sm:p-6 graybg">
              <h3 className="text-lg font-extrabold text-center leading-6 textwhite">
                Create New Process
              </h3>
              <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div className="sm:col-span-6">
                  <label
                    htmlFor="process_name"
                    className="block text-sm font-bold leading-6 textwhite"
                  >
                    Process Name
                  </label>
                  <div className="mt-2">
                    <input
                      type="text"
                      name="process_name"
                      id="process_name"
                      value={processValues.process_name}
                      onChange={(e) =>
                        setProcessValues({
                          ...processValues,
                          [e.target.name]: e.target.value,
                        })
                      }
                      autoComplete="process_name"
                      className="w-full p-2 mb-4 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="sm:col-span-6">
                  <label
                    htmlFor="url"
                    className="block text-sm font-bold leading-6 textwhite"
                  >
                    URL
                  </label>
                  <div className="mt-2">
                    <input
                      type="text"
                      name="url"
                      id="url"
                      value={processValues.url}
                      onChange={(e) =>
                        setProcessValues({
                          ...processValues,
                          [e.target.name]: e.target.value,
                        })
                      }
                      autoComplete="url"
                      className="w-full p-2 mb-4 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="flex flex-col  sm:col-span-6">
                  <label
                    htmlFor="os_type"
                    className="block text-sm font-bold leading-6 textwhite"
                  >
                    OS Type
                  </label>
                  <div className="mt-2">
                    <select
                      id="os_type"
                      name="os_type"
                      value={processValues.os_type}
                      onChange={handleOSChange}
                      className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:max-w-xs sm:text-sm sm:leading-6"
                    >
                      <option value="Select OS">Select OS</option>
                      <option value="IOS">iOS</option>
                      <option value="Android">Android</option>
                      <option value="Roku">Roku</option>
                      <option value="Tizen">Tizen</option>{" "}
                      <option value="Fire TV">Fire TV</option>
                    </select>
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
                    {/* All Hardmask */}
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
                        value={processValues.all_hardmask}
                        onChange={handleAllHardmask}
                        disabled={isHardmaskSelected}
                        className={`block w-full rounded-md border-0 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:max-w-xs sm:text-sm sm:leading-6 ${isHardmaskSelected
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                          }`}
                      >
                        <option value="Select All Hardmask">
                          Select All Hardmask
                        </option>
                        {processValues.os_type === "IOS" && (
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

                    {/* User Agent List */}
                    <div className="flex flex-col  sm:col-span-6">
                      <label
                        htmlFor="ua_list"
                        className="block text-sm font-bold leading-6 textwhite"
                      >
                        User Agent List
                      </label>
                      <div className="mt-2">
                        <select
                          id="ua_list"
                          name="ua_list"
                          value={processValues.ua_list}
                          onChange={handleua_listChange}
                          className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:max-w-xs sm:text-sm sm:leading-6"
                        >
                          <option value="Select User Agent">
                            Select User Agent
                          </option>
                          {processValues.os_type === "IOS" && (
                            <>
                              <option value="apple_inapp_ua">
                                apple_inapp_ua
                              </option>
                              <option value="apple_ctv_ua">apple_ctv_ua</option>
                            </>
                          )}
                          {processValues.os_type === "Android" && (
                            <>
                              <option value="android_ctv_ua">
                                android_ctv_ua
                              </option>
                              <option value="android_inapp_ua">
                                android_inapp_ua
                              </option>
                            </>
                          )}
                          {processValues.os_type === "Roku" && (
                            <>
                              <option value="roku_ctv_ua">roku_ctv_ua</option>
                            </>
                          )}
                          {processValues.os_type === "Fire TV" && (
                            <>
                              <option value="firetv_ua">firetv_ua</option>
                            </>
                          )}
                          {processValues.os_type === "Tizen" && (
                            <>
                              <option value="samsung_ctv_ua">
                                samsung_ctv_ua
                              </option>
                            </>
                          )}
                        </select>
                      </div>
                    </div>
                  </>
                )}

                <div className="flex flex-col  sm:col-span-6">
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
                      className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:max-w-xs sm:text-sm sm:leading-6"
                    >
                      <option value="Select VPN">Select VPN</option>
                      <option value="nine22">nine22</option>
                      <option value="luna">luna</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-col  sm:col-span-6">
                  <label
                    htmlFor="tick_rate"
                    className="block text-sm font-bold leading-6 textwhite"
                  >
                    Concurrent Task
                  </label>
                  <div className="mt-2 flex items-center">
                    <button
                      type="button"
                      onClick={() => handleTickrateChange(-1)}
                      className="rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 m-2"
                    >
                      -
                    </button>
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
                      className="block w-20 rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 p-1 "
                    />
                    <button
                      type="button"
                      onClick={() => handleTickrateChange(1)}
                      className="ml-2 rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="flex flex-col sm:col-span-6">
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
                      className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:max-w-xs sm:text-sm sm:leading-6"
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
                      <option value="Add Server" className="text-red-500">
                        Add Server
                      </option>
                    </select>

                    {/* <br />
                    
                    <div>
                      <label className="italic font-bold textwhite">
                        Please Select Cron Time:{" "}
                      </label>

                      <select
                        className="font-bold text-lg ml-1"
                        value={processValues.cron}
                        onChange={handleCronChange}
                      >
                        <option value="Select Crown">Cron Time</option>
                        <option value="0">1 hour</option>
                      </select>
                    </div> */}
                  </div>
                  <br />
                  <div>
                    <label className="textwhite"> imp : </label>
                    <input
                      type="text"
                      placeholder="id"
                      name="id"
                      className="w-full px-3 py-2 mb-2 border bg-white border-gray-300 rounded-md focus:outline-none"
                    />
                    <input
                      type="text"
                      placeholder="linearity"
                      name="linearity"
                      className="w-full px-3 py-2 mb-2 border bg-white border-gray-300 rounded-md focus:outline-none"
                    />
                    <input
                      type="text"
                      placeholder="minduration"
                      name="minduration"
                      className="w-full px-3 py-2 mb-2 border bg-white border-gray-300 rounded-md focus:outline-none"
                    />
                    <input
                      type="text"
                      placeholder="maxduration"
                      name="maxduration"
                      className="w-full px-3 py-2 mb-2 border bg-white border-gray-300 rounded-md focus:outline-none"
                    />
                    <input
                      type="text"
                      placeholder="protocols"
                      name="protocols"
                      className="w-full px-3 py-2 mb-2 border bg-white border-gray-300 rounded-md focus:outline-none"
                    />
                    <input
                      type="text"
                      placeholder="w"
                      name="w"
                      className="w-full px-3 py-2 mb-2 border bg-white border-gray-300 rounded-md focus:outline-none"
                    />
                    <input
                      type="text"
                      placeholder="h"
                      name="h"
                      className="w-full px-3 py-2 mb-2 border bg-white border-gray-300 rounded-md focus:outline-none"
                    />
                    <input
                      type="text"
                      placeholder="startdelay"
                      name="startdelay"
                      className="w-full px-3 py-2 mb-2 border bg-white border-gray-300 rounded-md focus:outline-none"
                    />
                    <input
                      type="text"
                      placeholder="sequence"
                      name="sequence"
                      className="w-full px-3 py-2 mb-2 border bg-white border-gray-300 rounded-md focus:outline-none"
                    />
                    <input
                      type="text"
                      placeholder="boxingallowed"
                      name="boxingallowed"
                      className="w-full px-3 py-2 mb-2 border bg-white border-gray-300 rounded-md focus:outline-none"
                    />
                    <input
                      type="text"
                      placeholder="api"
                      name="api"
                      className="w-full px-3 py-2 mb-2 border bg-white border-gray-300 rounded-md focus:outline-none"
                    />
                    <input
                      type="text"
                      placeholder="bidfloor"
                      name="bidfloor"
                      className="w-full px-3 py-2 mb-2 border bg-white border-gray-300 rounded-md focus:outline-none"
                    />
                    <input
                      type="text"
                      placeholder="bidfloorcur"
                      name="bidfloorcur"
                      className="w-full px-3 py-2 mb-2 border bg-white border-gray-300 rounded-md focus:outline-none"
                    />
                    <input
                      type="text"
                      placeholder="secure"
                      name="secure"
                      className="w-full px-3 py-2 mb-2 border bg-white border-gray-300 rounded-md focus:outline-none"
                    />

                    <lable className="textwhite">app :</lable>
                    <input
                      type="text"
                      placeholder="id"
                      name="id"
                      className="w-full px-3 py-2 mb-2 border bg-white border-gray-300 rounded-md focus:outline-none"
                    />
                    <input
                      type="text"
                      placeholder="name"
                      name="name"
                      className="w-full px-3 py-2 mb-2 border bg-white border-gray-300 rounded-md focus:outline-none"
                    />
                    <input
                      type="text"
                      placeholder="ver"
                      name="ver"
                      className="w-full px-3 py-2 mb-2 border bg-white border-gray-300 rounded-md focus:outline-none"
                    />
                    <input
                      type="text"
                      placeholder="bundle"
                      name="bundle"
                      className="w-full px-3 py-2 mb-2 border bg-white border-gray-300 rounded-md focus:outline-none"
                    />
                    <input
                      type="text"
                      placeholder="publisher id"
                      name="pid"
                      className="w-full px-3 py-2 mb-2 border bg-white border-gray-300 rounded-md focus:outline-none"
                    />
                    <input
                      type="text"
                      placeholder="storeurl"
                      name="storeurl"
                      className="w-full px-3 py-2 mb-2 border bg-white border-gray-300 rounded-md focus:outline-none"
                    />

                    <lable className="textwhite">device :</lable>
                    <input
                      type="text"
                      placeholder="dnt"
                      name="dnt"
                      className="w-full px-3 py-2 mb-2 border bg-white border-gray-300 rounded-md focus:outline-none"
                    />
                    <input
                      type="text"
                      placeholder="ua"
                      name="ua"
                      className="w-full px-3 py-2 mb-2 border bg-white border-gray-300 rounded-md focus:outline-none"
                    />
                    <input
                      type="text"
                      placeholder="ip"
                      name="ip"
                      className="w-full px-3 py-2 mb-2 border bg-white border-gray-300 rounded-md focus:outline-none"
                    />
                    <input
                      type="text"
                      placeholder="geo country"
                      name="geo country"
                      className="w-full px-3 py-2 mb-2 border bg-white border-gray-300 rounded-md focus:outline-none"
                    />
                    <input
                      type="text"
                      placeholder="geo region"
                      name="geo region"
                      className="w-full px-3 py-2 mb-2 border bg-white border-gray-300 rounded-md focus:outline-none"
                    />
                    <input
                      type="text"
                      placeholder="geo metro"
                      name="geo metro"
                      className="w-full px-3 py-2 mb-2 border bg-white border-gray-300 rounded-md focus:outline-none"
                    />
                    <input
                      type="text"
                      placeholder="geo city"
                      name="geo city"
                      className="w-full px-3 py-2 mb-2 border bg-white border-gray-300 rounded-md focus:outline-none"
                    />
                    <input
                      type="text"
                      placeholder="geo Zip"
                      name="geo Zip"
                      className="w-full px-3 py-2 mb-2 border bg-white border-gray-300 rounded-md focus:outline-none"
                    />
                    <input
                      type="text"
                      placeholder="geo type"
                      name="geo type"
                      className="w-full px-3 py-2 mb-2 border bg-white border-gray-300 rounded-md focus:outline-none"
                    />
                    <input
                      type="text"
                      placeholder="geo accuracy"
                      name="geo accuracy"
                      className="w-full px-3 py-2 mb-2 border bg-white border-gray-300 rounded-md focus:outline-none"
                    />
                    <input
                      type="text"
                      placeholder="geo ipservice"
                      name="geo ipservice"
                      className="w-full px-3 py-2 mb-2 border bg-white border-gray-300 rounded-md focus:outline-none"
                    />
                    <input
                      type="text"
                      placeholder="carrier"
                      name="carrier"
                      className="w-full px-3 py-2 mb-2 border bg-white border-gray-300 rounded-md focus:outline-none"
                    />
                    <input
                      type="text"
                      placeholder="language"
                      name="language"
                      className="w-full px-3 py-2 mb-2 border bg-white border-gray-300 rounded-md focus:outline-none"
                    />
                    <input
                      type="text"
                      placeholder="make"
                      name="make"
                      className="w-full px-3 py-2 mb-2 border bg-white border-gray-300 rounded-md focus:outline-none"
                    />
                    <input
                      type="text"
                      placeholder="model"
                      name="model"
                      className="w-full px-3 py-2 mb-2 border bg-white border-gray-300 rounded-md focus:outline-none"
                    />
                    <input
                      type="text"
                      placeholder="os"
                      name="os"
                      className="w-full px-3 py-2 mb-2 border bg-white border-gray-300 rounded-md focus:outline-none"
                    />
                    <input
                      type="text"
                      placeholder="osv"
                      name="osv"
                      className="w-full px-3 py-2 mb-2 border bg-white border-gray-300 rounded-md focus:outline-none"
                    />
                    <input
                      type="text"
                      placeholder="devicetype"
                      name="devicetype"
                      className="w-full px-3 py-2 mb-2 border bg-white border-gray-300 rounded-md focus:outline-none"
                    />
                    <input
                      type="text"
                      placeholder="ifa"
                      name="ifa"
                      className="w-full px-3 py-2 mb-2 border bg-white border-gray-300 rounded-md focus:outline-none"
                    />
                    <input
                      type="text"
                      placeholder="ext"
                      name="ext"
                      className="w-full px-3 py-2 mb-2 border bg-white border-gray-300 rounded-md focus:outline-none"
                    />
                    {/* <lable className="textwhite"> regs :</lable> */}

                    <input
                      type="text"
                      placeholder="regs coppa"
                      name="coppa"
                      className="w-full px-3 py-2 mb-2 border bg-white border-gray-300 rounded-md focus:outline-none"
                    />
                    <input
                      type="text"
                      placeholder="regs ext"
                      name="ext"
                      className="w-full px-3 py-2 mb-2 border bg-white border-gray-300 rounded-md focus:outline-none"
                    />
                    {/* <label className="textwhite">user :</label> */}
                    <input
                      type="text"
                      placeholder="user id"
                      name="user id"
                      className="w-full px-3 py-2 mb-2 border bg-white border-gray-300 rounded-md focus:outline-none"
                    />
                    <input
                      type="text"
                      placeholder="user ext"
                      name="user ext"
                      className="w-full px-3 py-2 mb-2 border bg-white border-gray-300 rounded-md focus:outline-none"
                    />
                    <input
                      type="text"
                      placeholder="at"
                      name="at"
                      className="w-full px-3 py-2 mb-2 border bg-white border-gray-300 rounded-md focus:outline-none"
                    />
                    <input
                      type="text"
                      placeholder="tmax"
                      name="tmax"
                      className="w-full px-3 py-2 mb-2 border bg-white border-gray-300 rounded-md focus:outline-none"
                    />
                    <input
                      type="text"
                      placeholder="allimps"
                      name="allimps"
                      className="w-full px-3 py-2 mb-2 border bg-white border-gray-300 rounded-md focus:outline-none"
                    />
                    <input
                      type="text"
                      placeholder="cur"
                      name="cur"
                      className="w-full px-3 py-2 mb-2 border bg-white border-gray-300 rounded-md focus:outline-none"
                    />
                    <input
                      type="text"
                      placeholder="bcat"
                      name="bcat"
                      className="w-full px-3 py-2 mb-2 border bg-white border-gray-300 rounded-md focus:outline-none"
                    />
                    <input
                      type="text"
                      placeholder="source complete"
                      name="source complete"
                      className="w-full px-3 py-2 mb-2 border bg-white border-gray-300 rounded-md focus:outline-none"
                    />
                    <input
                      type="text"
                      placeholder="node asi"
                      name="node asi"
                      className="w-full px-3 py-2 mb-2 border bg-white border-gray-300 rounded-md focus:outline-none"
                    />
                    <input
                      type="text"
                      placeholder="node sid"
                      name="node sid"
                      className="w-full px-3 py-2 mb-2 border bg-white border-gray-300 rounded-md focus:outline-none"
                    />
                    <input
                      type="text"
                      placeholder="node rid"
                      name="node rid"
                      className="w-full px-3 py-2 mb-2 border bg-white border-gray-300 rounded-md focus:outline-none"
                    />
                    <input
                      type="text"
                      placeholder="node hp"
                      name="node hp"
                      className="w-full px-3 py-2 mb-2 border bg-white border-gray-300 rounded-md focus:outline-none"
                    />
                    <input
                      type="text"
                      placeholder="ver"
                      name="ver"
                      className="w-full px-3 py-2 mb-2 border bg-white border-gray-300 rounded-md focus:outline-none"
                    />
                    <input
                      type="object"
                      placeholder="ext"
                      name="ext"
                      className="w-full px-3 py-2 mb-2 border bg-white border-gray-300 rounded-md focus:outline-none"
                    />
                  </div>
                  <br />
                  <button
                    className={`btn2 ${isButtonClicked
                      ? "opacity-50 cursor-not-allowed"
                      : "w-full bg-blue-500 border textwhite px-4 py-2 rounded-md focus:outline-none p-3 hover:bg-blue-600"
                      }`}
                    onClick={handleSubmit}
                    disabled={isButtonClicked}
                  >
                    Start Process
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="max-w-4xl w-full px-4">
            <div className="grid grid-cols-1 gap-8">
              <div className="border border-gray-300 graybg rounded-lg p-6">
                <h3 className="textwhite text-lg text-center mb-4">
                  Selected Hardmask
                </h3>
                {hardmaskList.map((selected, index) => (
                  <div key={index} className="mb-4">
                    <div className="bg-gray-200 p-2 mb-2 flex justify-between items-center">
                      <p
                        className="text-black cursor-pointer"
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
                        onClick={() => handleRemoveHardmask(selected.id)}
                        className="bg-red-500 textwhite py-1 px-2 rounded"
                      >
                        Delete
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
                          className="w-full px-3 py-2 mb-2 border bg-white border-gray-300 rounded-md focus:outline-none"
                        />
                        <input
                          type="text"
                          placeholder="App URL"
                          name="appUrl"
                          value={selected.appurl}
                          disabled={true}
                          className="w-full px-3 py-2 mb-2 border bg-white border-gray-300 rounded-md focus:outline-none"
                        />
                        <input
                          type="text"
                          placeholder="OS"
                          name="os"
                          value={selected.os_type}
                          disabled={true}
                          className="w-full px-3 py-2 mb-2 border bg-white border-gray-300 rounded-md focus:outline-none"
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
