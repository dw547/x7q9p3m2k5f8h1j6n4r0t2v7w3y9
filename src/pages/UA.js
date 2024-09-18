import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaPlus, FaTrash, FaEdit, FaEye, FaSpinner, FaCheck, FaTimes, FaMinus, FaDownload } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import pako from 'pako';

export default function UA() {
  const [processValues, setProcessValues] = useState({
    id: "",
    list: "",
    server: [],
  });

  const [newOS, setNewOS] = useState("");
  const [dataList, setDataList] = useState([]);
  const [newUA, setNewUA] = useState("");
  const [uaData, setUaData] = useState([]);
  const [selectedOS, setSelectedOS] = useState(null);
  const navigate = useNavigate();
  const [isSubmit, setIsSubmit] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoding, setIsLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [editingUA, setEditingUA] = useState(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [uaToDelete, setUaToDelete] = useState(null);
  const [showOSDeleteConfirmation, setShowOSDeleteConfirmation] = useState(false);
  const [osToDelete, setOsToDelete] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [osUaDownload, setosUaDownload] = useState('')
  const [uploadedFile, setUploadedFile] = useState(null);
  const [inputData, setInputData] = useState({
    device_model: "",
    device_make: "",
    list: [""],
    sizes: [{ height: "", width: "" }]
  });
  const [editingOS, setEditingOS] = useState(null);
  const [editedOSName, setEditedOSName] = useState("");

  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_API_URI}/get-all-ua`, {
        headers: {
          Authorization: JSON.parse(localStorage.getItem("token")),
        },
      })
      .then((response) => {
        setUaData(response.data);
        console.log(response.data)
      })
      .catch((error) => {
        console.log(error);
      });

    axios
      .get(`${process.env.REACT_APP_API_URI}/get-all-os`, {
        headers: {
          Authorization: JSON.parse(localStorage.getItem("token")),
        },
      })
      .then((response) => {
        setDataList(response.data);
      })
      .catch((error) => {
        console.log(error);
      });
  }, [navigate]);

  const handleOSChange = (e) => {
    setProcessValues({
      ...processValues,
      id: e.target.value,
    });
    setSelectedOS(dataList.filter((item) => item.name === e.target.value)[0].id)
  };

  const handleInputChange = (field, value) => {
    setInputData({ ...inputData, [field]: value });
  };

  const handleDimensionChange = (index, field, value) => {
    const newsizes = [...inputData.sizes];
    newsizes[index][field] = value;
    setInputData({ ...inputData, sizes: newsizes });
  };

  const addDimension = () => {
    setInputData({
      ...inputData,
      sizes: [...inputData.sizes, { height: "", width: "" }]
    });
  };

  const removeDimension = (index) => {
    if (inputData.sizes.length > 1) {
      const newsizes = inputData.sizes.filter((_, i) => i !== index);
      setInputData({ ...inputData, sizes: newsizes });
    }
  };
  const handleUANameChange = (e) => {
    const value = e.target.value.replace(/\s/g, '');
    setNewUA(value);
  };

  const handleEditOS = (item) => {
    setEditingOS(item.id);
    setEditedOSName(item.name);
  };

  const handleCancelEdit = () => {
    setEditingOS(null);
    setEditedOSName("");
  };

  const handleSaveEdit = (item) => {
    axios
      .post(
        `${process.env.REACT_APP_API_URI}/edit-os/${editingOS}`,
        {
          name: editedOSName,
        },
        {
          headers: {
            Authorization: JSON.parse(localStorage.getItem("token")),
          },
        }
      )
      .then((response) => {
        const updatedDataList = dataList.map((os) =>
          os.id === item.id ? { ...os, name: editedOSName } : os
        );
        setDataList(updatedDataList);
        setEditingOS(null);
        setEditedOSName("");
        alert("OS updated successfully");
      })
      .catch((error) => {
        console.error("There was an error updating the OS!", error);
        alert("Error updating OS");
      });
  };

  const handleDeleteOS = (item) => {
    setOsToDelete(item.id);
    setShowOSDeleteConfirmation(true);
  };

  const confirmDeleteOS = () => {
    setIsLoading(true);
    axios
      .get(
        `${process.env.REACT_APP_API_URI}/delete-os/${osToDelete}`,
        {
          headers: {
            Authorization: JSON.parse(localStorage.getItem("token")),
          },
        }
      )
      .then((response) => {
        if (response.status === 200) {
          alert("OS deleted Successfully");
          setIsLoading(false);
          setDataList(dataList.filter(os => os.id !== osToDelete));
        }
      })
      .catch((error) => {
        alert("Error Deleting OS");
        console.error("There was an error deleting the OS!", error);
        setIsLoading(false);
      })
      .finally(() => {
        setShowOSDeleteConfirmation(false);
        setOsToDelete(null);
      });
  };

  const handleAddOS = () => {
    axios
      .post(
        `${process.env.REACT_APP_API_URI}/create-os`,
        {
          name: newOS,
        },
        {
          headers: {
            Authorization: JSON.parse(localStorage.getItem("token")),
          },
        }
      )
      .then((response) => {
        console.log("OS creation successful:", response);
        alert("OS created successfully");
        setDataList([...dataList, { name: newOS, id: response.data.id }]);
        setNewOS("");
        window.location.reload();
      })
      .catch((error) => {
        console.error("Error adding the OS:", error);
        if (error.response) {
          console.error("Response data:", error.response.data);
          console.error("Response status:", error.response.status);
        }
        alert("Error creating OS: " + (error.response ? error.response.data : error.message));
      });
  };

  const formatUAData = (data) => {
    try {
      const parsedData = JSON.parse(data);
      let formattedContent = '';

      parsedData.forEach((entry, index) => {
        formattedContent += `Entry ${index + 1}:\n`;
        formattedContent += `Height: ${entry.height}\n`;
        formattedContent += `Width: ${entry.width}\n`;
        formattedContent += `Device Model: ${entry.device_model}\n`;
        formattedContent += `Device Make: ${entry.device_make}\n`;
        formattedContent += `List:\n${entry.list}\n\n`;
      });

      return formattedContent.trim();
    } catch (error) {
      console.error('Error parsing UA data:', error);
      return 'Error: Unable to parse UA data';
    }
  };

  const handleDownloadUA = (item) => {
    const filename = `${item.name}_ua_list.txt`;
    const formattedContent = formatUAData(item.list);

    const blob = new Blob([formattedContent], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const displayUAData = (data) => {
    return formatUAData(data);
  };

  // const handleFileUpload = (event) => {
  //   const file = event.target.files[0];
  //   if (file) {
  //     const reader = new FileReader();
  //     reader.onload = (e) => {
  //       const content = e.target.result;
  //       setUploadedFile(content);
  //       parseUploadedFile(content);
  //     };
  //     reader.readAsText(file);
  //   }
  // };

  // const parseUploadedFile = (content) => {
  //   const lines = content.split('\n').filter(line => line.trim() !== '');
  //   if (lines.length > 0) {
  //     setNewUA(lines[0].trim());
  //     const newInputRows = lines.slice(1).map(line => {
  //       const [height, width, device_model, device_make, ...listParts] = line.split(',').map(item => item.trim());
  //       return {
  //         height,
  //         width,
  //         device_model,
  //         device_make,
  //         list: listParts.join(',')
  //       };
  //     });
  //     setInputRows(newInputRows);
  //   }
  // };


  const handleAddUA = async (e) => {
    e.preventDefault();

    if (/\s/.test(newUA)) {
      alert("UA name cannot contain spaces");
      return;
    }

    setIsSubmitting(true);

    try {
      const uaData = {
        name: newUA,
        osId: selectedOS,
        data: {
          ...inputData,
          list: inputData.list.split('\n').filter(line => line.trim() !== ""),
          sizes: inputData.sizes
        }
      };
      console.log(uaData)
      const jsonData = JSON.stringify(uaData);

      const compressedData = pako.deflate(jsonData);

      const blob = new Blob([compressedData], { type: 'application/octet-stream' });

      const formData = new FormData();
      formData.append("compressedData", blob, "uaData.gz");

      const response = await axios.post(
        `${process.env.REACT_APP_API_URI}/create-ua`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: JSON.parse(localStorage.getItem("token")),
          },
        }
      );

      if (response.status === 201) {
        alert("UA Added Successfully");
        setIsSubmitting(false);
        window.location.reload()
        setNewUA("");
        setInputData({
          device_model: "",
          device_make: "",
          list: "",
          sizes: [{ height: "", width: "" }]
        });
        setUaData([...uaData, response.data]);
      }
    } catch (error) {
      setIsSubmitting(false);
      console.log(error);
      // alert("Error adding UA");
    }
  };

  const handleDeleteUA = (id) => {
    setUaToDelete(id);
    setShowDeleteConfirmation(true);
  };

  const confirmDeleteUA = () => {
    setIsSubmit(true);
    axios
      .get(
        `${process.env.REACT_APP_API_URI}/delete-ua/${uaToDelete}`,
        {
          headers: {
            Authorization: JSON.parse(localStorage.getItem("token")),
          },
        }
      )
      .then((response) => {
        if (response.status === 200) {
          alert("UA Deleted Successfully");
          setIsSubmit(false);
          window.location.reload();
        }
      })
      .catch((error) => {
        alert("Error Deleting UA")
        setIsSubmit(false);
        console.log(error);
      })
      .finally(() => {
        setShowDeleteConfirmation(false);
        setUaToDelete(null);
      });
  };

  const handleUpdateUAServer = () => {
    axios.get(`${process.env.REACT_APP_API_URI}/update-ua-to-all-server`,
      {
        headers: {
          Authorization: JSON.parse(localStorage.getItem("token"))
        }
      }
    )
      .then((response) => {
        if (response.status === 200) {
          alert("Updated Successfully")
        }
      })
      .catch((error) => {
        alert("Error Updating", error)
      })
  }

  const handleViewUA = (item) => {
    setEditingUA({
      id: item.id,
      name: item.name,
      list: item.list.split(',').join(',\n'),
    });
    setShowPopup(true);
  };

  const DownloadAllOsUaList = () => {
    if (!osUaDownload) {
      alert("Please Select OS")
      return;
    }
    setIsDownloading(true)
    axios.get(`${process.env.REACT_APP_API_URI}/downloadua/${osUaDownload}`, {
      headers: {
        Authorization: JSON.parse(localStorage.getItem('token'))
      },
      responseType: 'blob'
    }).then((response) => {
      const blob = new Blob([response.data], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `UA_List_${osUaDownload}.txt`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
      setIsDownloading(false);
      alert("All UA Downloaded Successfully");
    }).catch((error) => {
      alert("Error Downloading UA", error);
      setIsDownloading(false);
    });
  };



  return (
    <div className="p-4">
      <div className="p-4 rounded-lg graybg mb-6">
        <h2 className="text-2xl textwhite font-bold mb-4">Operating System</h2>
        <div className="mt-4">
          <label className="lable">Add New Operating System</label>
          <input
            className="input"
            value={newOS}
            onChange={(e) => setNewOS(e.target.value)}
          />
        </div>
        <div className="mt-4 flex justify-center">
          <button
            onClick={handleAddOS}
            className="mr-2 bg-blue-500 hover:bg-blue-700 hover:scale-110 text-white font-bold py-2 px-4 rounded"
            title="Add OS"
          >
            Add OS
          </button>
        </div>
        <div>
          <table className="w-full mt-4">
            <thead>
              <tr className="bg-blue-700">
                <th className="px-4 py-2 text-left text-white">OS Name</th>
                <th className="px-4 py-2 text-right text-white">Action</th>
              </tr>
            </thead>
            <tbody>
              {dataList.map((item) => (
                <tr key={item.id} className="border-b border-gray-600 hover:bg-gray-300 dark:hover:bg-gray-700">
                  <td className="px-4 py-2 textwhite">
                    {editingOS === item.id ? (
                      <input
                        type="text"
                        value={editedOSName}
                        onChange={(e) => setEditedOSName(e.target.value)}
                        className="w-full px-2 py-1 text-black"
                      />
                    ) : (
                      item.name
                    )}
                  </td>
                  <td className="px-4 py-2 text-right">
                    {editingOS === item.id ? (
                      <>
                        <button
                          onClick={() => handleSaveEdit(item)}
                          className="mr-2 bg-green-500 hover:bg-green-700 hover:scale-110 text-white font-bold py-1 px-2 rounded"
                          title="Save"
                        >
                          <FaCheck />
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="bg-gray-500 hover:bg-gray-700 hover:scale-110 text-white font-bold py-1 px-2 rounded"
                          title="Cancel"
                        >
                          <FaTimes />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleEditOS(item)}
                          className="mr-2 bg-yellow-500 hover:bg-yellow-700 hover:scale-110 text-white font-bold py-1 px-2 rounded"
                          title="Edit OS"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDeleteOS(item)}
                          className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded transition duration-300 ease-in-out relative"
                          title="Delete OS" >
                          <FaTrash />
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="p-4 rounded-lg graybg">
        <h2 className="text-2xl font-bold textwhite mb-4">User Agent</h2>
        <form onSubmit={handleAddUA}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block mb-2 textwhite font-bold">OS Type</label>
              <select
                id="id"
                name="id"
                value={processValues.id}
                onChange={handleOSChange}
                className="input w-full"
                required
              >
                <option value="">Select OS</option>
                {dataList.map((os, index) => (
                  <option key={index} value={os._id}>
                    {os.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block mb-2 textwhite font-bold">Add New User Agent</label>
              <input
                className="input w-full"
                value={newUA}
                onChange={handleUANameChange}
                required
                placeholder="Enter UA name (no spaces allowed)"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="lable" htmlFor="device_model">
                Device Model
              </label>
              <input
                type="text"
                id="device_model"
                name="device_model"
                value={inputData.device_model}
                onChange={(e) => handleInputChange('device_model', e.target.value)}
                className="input w-full"
              />
            </div>
            <div>
              <label className="lable" htmlFor="device_make">
                Device Make
              </label>
              <input
                type="text"
                id="device_make"
                name="device_make"
                value={inputData.device_make}
                onChange={(e) => handleInputChange('device_make', e.target.value)}
                className="input w-full"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="lable" htmlFor="data">Data</label>
            <textarea
              id="data"
              className="input h-28 w-full"
              value={inputData.list}
              onChange={(e) => handleInputChange('list', e.target.value)}
              required
            />
          </div>

          {inputData.sizes.map((dimension, index) => (
            <div key={index} className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="lable" htmlFor={`height-${index}`}>
                  Height
                </label>
                <input
                  type="text"
                  id={`height-${index}`}
                  name={`height-${index}`}
                  value={dimension.height}
                  onChange={(e) => handleDimensionChange(index, 'height', e.target.value)}
                  className="input w-full"
                />
              </div>
              <div>
                <label className="lable" htmlFor={`width-${index}`}>
                  Width
                </label>
                <input
                  type="text"
                  id={`width-${index}`}
                  name={`width-${index}`}
                  value={dimension.width}
                  onChange={(e) => handleDimensionChange(index, 'width', e.target.value)}
                  className="input w-full"
                />
              </div>
            </div>
          ))}

          <div className="mt-4 flex items-center">
            <button
              type="button"
              className="bg-blue-500 hover:bg-blue-700 hover:scale-110 text-white font-bold py-2 px-4 rounded mr-2"
              title="Add Dimension"
              onClick={addDimension}
            >
              <FaPlus />
            </button>
            {inputData.sizes.length > 1 && (
              <button
                type="button"
                className="bg-red-500 text-white hover:bg-red-700 hover:scale-110 textw-hite font-bold py-2 px-4 rounded"
                title="Remove Dimension"
                onClick={() => removeDimension(inputData.sizes.length - 1)}
              >
                <FaMinus />
              </button>
            )}
          </div>

          <div className="mt-6 flex justify-center">
            <button
              type="submit"
              className="mr-2 bg-blue-500 hover:bg-blue-700 hover:scale-110 text-white font-bold py-2 px-4 rounded"
              title="Add UA"
            >
              Add New UA
              {isSubmitting && (
                <span className="inline-block ml-2 animate-spin"><FaSpinner /></span>
              )}
            </button>
          </div>
        </form>
      </div>

      <div className="flex justify-between my-4">
        {/* <div className='flex justify-between border pt-2 px-2 rounded-lg graybg'>
          <div><p className='textwhite font-semibold' >Download All : &nbsp; <br /> UserAgent</p></div>
          <div className=''>
            <select
              id="id"
              name="id"
              value={osUaDownload}
              onChange={(e) => setosUaDownload(e.target.value)}
              className="input w-full"
              required
            >
              <option value="">Select OS</option>
              {dataList.map((os, index) => (
                <option key={index} value={os._id}>
                  {os.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <button title="Download UA List" onClick={DownloadAllOsUaList}
              className="ml-2 bg-blue-500 hover:bg-blue-600 hover:scale-110 text-white font-bold py-2 px-2 rounded"
            >
              <FaDownload />
              {isDownloading && (<span className='inline-block  animate-spin'>
                <FaSpinner />
              </span>)}
            </button>
          </div>
        </div> */}
        <button
          onClick={handleUpdateUAServer}
          className="bg-blue-500 p-2 rounded-lg text-white hover:bg-blue-600"
        >
          Update UA To Server
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl">
        <table className="min-w-full divide-y divide-gray-200 graybg rounded-lg shadow-lg">
          <thead className="bg-blue-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                OS Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                UA Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                Updated At
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                UA List
              </th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-white uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="graybg divide-y divide-gray-600">
            {uaData.map((item, index) => {
              const os = dataList.find((os) => os.id === item.osId);
              const osName = os ? os.name : 'Unknown';

              return (
                <tr key={index} className=" boredr-b hover:bg-gray-300 dark:hover:bg-gray-700 border-gray-600">
                  <td className=" textwhite border-gray-600 text-sm p-4">{osName}</td>
                  <td className=" textwhite border-gray-600 text-sm p-4">{item.name}</td>
                  <td className=" textwhite border-gray-600 text-sm p-4">{item.updatedAt}</td>
                  <td className=" textwhite border-gray-600 text-sm p-4">

                    <button
                      onClick={() => handleViewUA(item)}
                      className="mr-2 bg-blue-500 hover:bg-blue-700 hover:scale-110 text-white font-bold py-2 px-4 rounded"
                      title="View UA"
                    >
                      <FaEye />
                    </button>
                  </td>
                  <td className=" textwhite flex justify-end  text-sm p-4 text-right">
                    <button
                      onClick={() => handleDownloadUA(item)}
                      title="Download UA List"
                      className="mr-2 bg-blue-500 hover:bg-blue-600 hover:scale-110 text-white font-bold py-1 px-2 rounded"
                    >
                      <FaDownload />
                    </button>
                    <button
                      onClick={() => navigate(`/edit-ua/${item.id}`)}
                      className="mr-2 bg-yellow-500 hover:bg-yellow-700 hover:scale-110 text-white font-bold py-1 px-2 rounded"
                      title="Edit UA"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDeleteUA(item.id)}
                      className="bg-red-500 hover:bg-red-700 hover:scale-110 text-white font-bold py-1 px-2 rounded "
                      title="Delete UA"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              );
            })}

          </tbody>
        </table>
      </div>

      {showPopup && (
        <div className="fixed inset-0 bg-gray-700 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
          <div className="graybg p-5 rounded-lg w-full max-w-3xl">
            <h2 className="text-xl font-bold textwhite mb-4"> User Agent Data</h2>
            <div className="mb-4">
              <label className="block textwhite text-sm font-bold mb-2" htmlFor="ua-name">
                UA Name
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 input leading-tight focus:outline-none focus:shadow-outline"
                id="ua-name"
                type="text"
                value={editingUA.name}
                onChange={(e) => setEditingUA({ ...editingUA, name: e.target.value })}
              />
            </div>
            <div className="mb-4">
              <label className="block textwhite text-sm font-bold mb-2" htmlFor="ua-list">
                UA List
              </label>
              <textarea
                className="shadow appearance-none border rounded w-full py-2 px-3 input leading-tight focus:outline-none focus:shadow-outline"
                id="ua-list"
                rows="10"
                readOnly
                value={editingUA.list}
                onChange={(e) => setEditingUA({ ...editingUA, list: e.target.value })}
              ></textarea>
            </div>
            <div className="flex items-center justify-between">

              <button
                className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                type="button"
                onClick={() => setShowPopup(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteConfirmation && (
        <div className="fixed inset-0 bg-gray-700 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
          <div className="bg-white p-5 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Confirm Deletion</h2>
            <p className="mb-4">Are you sure you want to delete this User Agent?</p>
            <div className="flex justify-end">
              <button
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded mr-2"
                onClick={confirmDeleteUA}
              >
                Yes
                {isSubmit && (
                  <span className="inline-block ml-2 animate-spin"><FaSpinner /></span>
                )}
              </button>
              <button
                className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                onClick={() => setShowDeleteConfirmation(false)}
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}

      {showOSDeleteConfirmation && (
        <div className="fixed inset-0 bg-gray-700 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
          <div className="bg-white p-5 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Confirm OS Deletion</h2>
            <p className="mb-4">Are you sure you want to delete the Operating System "{osToDelete?.name}"?</p>
            <div className="flex justify-end">
              <button
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded mr-2"
                onClick={confirmDeleteOS}
              >
                Yes
                {isLoding && (
                  <span className="inline-block ml-2 animate-spin"><FaSpinner /></span>
                )}
              </button>
              <button
                className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                onClick={() => setShowOSDeleteConfirmation(false)}
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