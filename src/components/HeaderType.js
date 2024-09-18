import axios from 'axios';
import React, { useState } from 'react';
import { FaEdit, FaSpinner, FaTimes, FaPlus, FaMinus } from 'react-icons/fa';

const HeaderType = ({ data, onDelete }) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentEditHeader, setCurrentEditHeader] = useState(null);
  const [submit, setSubmit] = useState(false);
  const [showDelete, setShowDelete] = useState(false)
  const [isDelete, setIsDelete] = useState(false)
  const [headerToDelete, setheaderToDelete] = useState(null);

  const groupedData = Array.isArray(data) ? data.reduce((acc, item) => {
    if (!acc[item.aname]) {
      acc[item.aname] = { rust: null, click: null };
    }
    acc[item.aname][item.type] = item;
    return acc;
  }, {}) : {};

  const convertToHeaderArray = (headerData) => {
    if (typeof headerData === 'string') {
      try {
        return Object.entries(JSON.parse(headerData)).map(([key, value]) => ({ key, value }));
      } catch (e) {
        console.error("Error parsing header data:", e);
        return [];
      }
    }
    if (typeof headerData === 'object' && headerData !== null) {
      return Object.entries(headerData).map(([key, value]) => ({ key, value }));
    }
    return [];
  };

  const editHeader = (headerData) => {
    setCurrentEditHeader({
      id: headerData.id,
      click: {
        name: headerData.name,
        description: headerData.description,
        headers: convertToHeaderArray(headerData.header).map(header => ({
          ...header,
          isCustom: !['useragent', 'ip', 'appurl'].includes(header.value.toLowerCase())
        }))
      },
      rust: {
        name: '',
        description: '',
        headers: []
      }
    });
    setIsEditDialogOpen(true);
  };

  const handleInputChange = (type, field, value) => {
    setCurrentEditHeader(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        [field]: value
      }
    }));
  };

  const handleHeaderChange = (type, index, field, value) => {
    setCurrentEditHeader(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        headers: prev[type].headers.map((header, i) =>
          i === index
            ? {
              ...header,
              [field]: value,
              isCustom: field === 'value'
                ? (value === 'custom' || header.isCustom)
                : header.isCustom,
              value: field === 'value' && value === 'custom' ? '' : value
            }
            : header
        )
      }
    }));
  };

  const addHeaderRow = (type) => {
    setCurrentEditHeader(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        headers: [...prev[type].headers, { key: '', value: '', isCustom: false }]
      }
    }));
  };

  const removeHeaderRow = (type, index) => {
    setCurrentEditHeader(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        headers: prev[type].headers.filter((_, i) => i !== index)
      }
    }));
  };

  const handleUpdateHeader = () => {
    setSubmit(true);
    const clickHeaderObject = currentEditHeader.click.headers.reduce((acc, header) => {
      acc[header.key] = header.value;
      return acc;
    }, {});

    const payload = {
      id: currentEditHeader.id,
      name: currentEditHeader.click.name,
      description: currentEditHeader.click.description,
      header: clickHeaderObject,
    };

    axios.post(`${process.env.REACT_APP_API_URI}/update-header`,
      payload,
      {
        headers: {
          Authorization: JSON.parse(localStorage.getItem('token'))
        }
      }
    ).then((response) => {
      if (response.status === 200) {
        alert("Header Updated Successfully");
        setSubmit(false);
        window.location.reload();
        setIsEditDialogOpen(false);
        // Here you would typically update your local state or refetch the data
      }
    }).catch((error) => {
      alert("Error Updating Header");
      setSubmit(false);
    });
  };

  const confirmDelete = (aid) => {
    setheaderToDelete(aid)
    setShowDelete(true)
  }

  const deleteHeader = () => {
    setIsDelete(true)
    axios.get(`${process.env.REACT_APP_API_URI}/delete-header/${headerToDelete}`, {
      headers: {
        Authorization: JSON.parse(localStorage.getItem('token'))
      }
    }).then((response) => {
      if (response.status === 200) {
        alert("Header Deleted Successfully");
        onDelete(headerToDelete);
        setShowDelete(false);
        setIsDelete(false)

      }
    }).catch((error) => {
      alert("Error Deleting Header");
      setShowDelete(false);
      setIsDelete(false)
    });
  };

  const renderEditForm = () => {
    if (!currentEditHeader) return null;

    return (
      <div className="graybg p-5 rounded-lg w-full max-w-3xl">
        <h2 className="text-xl textwhite font-bold mb-4">Edit Header</h2>
        <div>
          <label className="textwhite font-bold block">Name</label>
          <input
            className="input mt-1 w-full"
            value={currentEditHeader.click.name}
            onChange={(e) => handleInputChange('click', 'name', e.target.value)}
          />
        </div>
        <div className="mt-4">
          <label className="textwhite font-bold block">Description</label>
          <textarea
            className="input mt-1 w-full"
            value={currentEditHeader.click.description}
            onChange={(e) => handleInputChange('click', 'description', e.target.value)}
          />
        </div>
        <div className="mt-4">
          <label className="textwhite font-bold block">Headers</label>
          {currentEditHeader.click.headers.map((header, index) => (
            <div key={index} className="flex gap-4 mt-2 items-center">
              <input
                type="text"
                className="input flex-1"
                value={header.key}
                onChange={(e) => handleHeaderChange('click', index, 'key', e.target.value)}
                placeholder="Key"
              />
              {header.isCustom ? (
                <input
                  type="text"
                  className="input flex-1"
                  value={header.value}
                  onChange={(e) => handleHeaderChange('click', index, 'value', e.target.value)}
                  placeholder="Enter custom value"
                />
              ) : (
                <select
                  className="input flex-1"
                  value={header.value}
                  onChange={(e) => handleHeaderChange('click', index, 'value', e.target.value)}
                >
                  <option value="">Select a value</option>
                  <option value="useragent">User Agent</option>
                  <option value="ip">IP</option>
                  <option value="appurl">appurl</option>
                  <option value="custom">Custom</option>
                </select>
              )}
              <button
                onClick={() => removeHeaderRow('click', index)}
                className="bg-red-500 text-white rounded-full p-2"
                title="Remove Row"
              >
                <FaMinus />
              </button>
            </div>
          ))}
          <button
            onClick={() => addHeaderRow('click')}
            className="mt-2 bg-green-500 text-white rounded-full p-2"
            title="Add Row"
          >
            <FaPlus />
          </button>
        </div>
      </div>
    );
  };

  if (!Array.isArray(data) || data.length === 0) {
    return <div className="text-white text-center">No header data available.</div>;
  }

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6 p-4">
        {Object.entries(groupedData).map(([aname, types]) => {
          const aid = types.rust?.aid || types.click?.aid;
          return (
            <div key={aname} className="graybg rounded-lg shadow-lg overflow-hidden">
              <div className="dark:bg-gray-700 bg-gray-300 px-6 py-4">
                <h2 className="text-2xl font-bold textwhite">{aname}</h2>
              </div>
              <div className="p-6 space-y-6">
                {['rust', 'click'].map(type => (
                  types[type] && (
                    <div key={type} className="dark:bg-gray-900 bg-gray-200 rounded-lg p-5">
                      <div className='flex justify-between'>
                        <h3 className="text-xl font-semibold textwhite mb-3">{types[type].name}</h3>
                        <button
                          title='Edit Header'
                          onClick={() => editHeader(types[type])}
                          className='bg-yellow-500 hover:bg-yellow-600 hover:scale-105 text-white rounded-md px-4 relative'
                        >
                          <FaEdit />
                        </button>
                      </div>
                      <div className="textwhite font-bold text-base mb-3">Type: {type}</div>
                      <div className="mb-4">
                        <h4 className="textwhite font-medium mb-2 text-lg">Description:</h4>
                        <p className="textwhite text-base">{types[type].description}</p>
                      </div>
                      <div>
                        <h4 className="textwhite font-medium mb-3 text-lg">Headers:</h4>
                        <div className="graybg rounded p-4">
                          {convertToHeaderArray(types[type].header).map((header, i) => (
                            <p key={i} className="text-base mb-2">
                              <span className="textwhite font-medium">{header.key}:</span>{' '}
                              <span className="textwhite">{header.value}</span>
                            </p>
                          ))}
                        </div>
                      </div>
                    </div>
                  )
                ))}
              </div>
              <div className='flex justify-center'>
                <button
                  onClick={() => confirmDelete(aid)}
                  className='bg-red-500 hover:bg-red-700 hover:scale-105 px-2 m-2 rounded-lg text-white p-1'
                >
                  Delete Header
                </button>
              </div>
            </div>
          );
        })}
      </div>
      {isEditDialogOpen && (
        <div className="fixed inset-0 bg-gray-700 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
          <div className="graybg p-5 rounded-lg w-full max-w-3xl">
            <button onClick={() => setIsEditDialogOpen(false)} className="float-right bg-red-500 p-1 text-white rounded-md"><FaTimes /></button>
            {renderEditForm()}
            <button
              onClick={handleUpdateHeader}
              className="mt-4 bg-blue-500 rounded-lg px-4 py-2 text-white"
            >
              Update Header
              {submit && (<span className="inline-block ml-2 animate-spin"><FaSpinner /></span>)}
            </button>
          </div>

        </div>
      )}
      {showDelete && (
        <div className='bg-black bg-opacity-50 flex justify-center items-center fixed inset-0'>
          <div className='graybg p-8 rounded-lg '>
            <h2 className='font-bold textwhite text-2xl'>Confirm Delete</h2>
            <h1 className='font-semibold textwhite'>Are You Sure You Want to Delete This Header</h1>
            <div className='flex justify-end gap-4 mt-4'>
              <button className='bg-red-500 rounded-lg px-2 p-1 text-white' onClick={deleteHeader}>Yes
                {isDelete && (<span className='animate-spin ml-2 inline-block'><FaSpinner /></span>)}
              </button>
              <button className='bg-blue-500 rounded-lg px-2 p-1 text-white' onClick={() => setShowDelete(false)}>No</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default HeaderType;