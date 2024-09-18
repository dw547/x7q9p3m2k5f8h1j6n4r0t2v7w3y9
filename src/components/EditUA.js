import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { FaPlus, FaMinus, FaSpinner } from 'react-icons/fa';
import pako from 'pako';

export default function EditUA() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isSubmit, setIsSubmit] = useState(false);
  const [uaData, setUaData] = useState({
    name: '',
    osId: '',
    device_model: '',
    device_make: '',
    list: '',
    sizes: []
  });
  const [osList, setOsList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    axios.get(`${process.env.REACT_APP_API_URI}/get-ua/${id}`, {
      headers: {
        Authorization: JSON.parse(localStorage.getItem("token")),
      },
    })
    .then(response => {
      const data = response.data;
      console.log('Raw data received:', data);
      
      let parsedList;
      try {
        parsedList = JSON.parse(data.list);
      } catch (error) {
        console.error("Error parsing data.list:", error);
        parsedList = {};
      }

      setUaData({
        name: data.name,
        osId: data.osId,
        device_model: parsedList.device_model || '',
        device_make: parsedList.device_make || '',
        list: Array.isArray(parsedList.list) ? parsedList.list.join('\n') : '',
        sizes: Array.isArray(parsedList.sizes) ? parsedList.sizes : []
      });
      
      setIsLoading(false);
    })
    .catch(error => {
      console.error("Error fetching UA data:", error);
      setIsLoading(false);
    });

    axios.get(`${process.env.REACT_APP_API_URI}/get-all-os`, {
      headers: {
        Authorization: JSON.parse(localStorage.getItem("token")),
      },
    })
    .then(response => {
      setOsList(response.data);
    })
    .catch(error => {
      console.error("Error fetching OS list:", error);
    });
  }, [id]);

  const handleInputChange = (field, value) => {
    setUaData(prevData => ({
      ...prevData,
      [field]: value
    }));
  };

  const handleSizeChange = (index, field, value) => {
    const newSizes = [...uaData.sizes];
    newSizes[index] = { ...newSizes[index], [field]: value };
    setUaData(prevData => ({
      ...prevData,
      sizes: newSizes
    }));
  };

  const addSize = () => {
    setUaData(prevData => ({
      ...prevData,
      sizes: [...prevData.sizes, { height: '', width: '' }]
    }));
  };

  const removeSize = (index) => {
    setUaData(prevData => ({
      ...prevData,
      sizes: prevData.sizes.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmit(true);
    console.log('Submitting data:', uaData);
    
    const dataToSubmit = {
      id: parseInt(id, 10),
      name: uaData.name,
      osId: parseInt(uaData.osId, 10),
      list: JSON.stringify({
        device_model: uaData.device_model,
        device_make: uaData.device_make,
        list: uaData.list.split('\n'),
        sizes: uaData.sizes
      })
    };
    
    const jsonData = JSON.stringify(dataToSubmit);
    const compressedData = pako.deflate(jsonData);
    const blob = new Blob([compressedData], { type: 'application/octet-stream' });
    const formData = new FormData();
    formData.append("compressedData", blob, "uaData.gz");
  
    axios.post(`${process.env.REACT_APP_API_URI}/update-ua`, formData, {
      headers: {
        Authorization: JSON.parse(localStorage.getItem("token")),
        'Content-Type': 'multipart/form-data'
      },
    })
    .then(response => {
      console.log('Server response:', response);
      if (response.status === 201) {
        alert("UA Updated Successfully");
        setIsSubmit(false);
        navigate('/ua');
      } else {
        alert("Unexpected response from server");
      }
    })
    .catch(error => {
      console.error("Error updating UA:", error);
      setIsSubmit(false);
      alert("Error updating UA: " + (error.response ? JSON.stringify(error.response.data) : error.message));
    });
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-4 graybg rounded-lg">
      <h2 className="text-2xl font-bold textwhite mb-4">Edit User Agent</h2>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-4">
          <div>
            <label className="block mb-2 textwhite font-bold">OS Type</label>
            <select
              value={uaData.osId}
              onChange={(e) => handleInputChange('osId', e.target.value)}
              className="input w-full"
              required
            >
              <option value="">Select OS</option>
              {osList.map((os) => (
                <option key={os.id} value={os.id}>
                  {os.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block mb-2 textwhite font-bold">User Agent Name</label>
            <input
              className="input w-full"
              placeholder="Enter UA name (no spaces allowed)"
              required
              value={uaData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block textwhite font-bold">Device Model</label>
            <input
              type="text"
              value={uaData.device_model}
              onChange={(e) => handleInputChange('device_model', e.target.value)}
              className="input w-full"
            />
          </div>
          <div>
            <label className="block textwhite font-bold">Device Make</label>
            <input
              type="text"
              value={uaData.device_make}
              onChange={(e) => handleInputChange('device_make', e.target.value)}
              className="input w-full"
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="block textwhite font-bold">Data List</label>
          <textarea
            value={uaData.list}
            onChange={(e) => handleInputChange('list', e.target.value)}
            className="input w-full h-32"
            placeholder="Enter data, press Enter for new line"
          />
        </div>

        <div className="mt-4">
          <label className="block textwhite font-bold">Sizes</label>
          {uaData.sizes.map((size, index) => (
            <div key={index} className="flex space-x-2 mt-2">
              <input
                type="text"
                value={size.height}
                onChange={(e) => handleSizeChange(index, 'height', e.target.value)}
                className="input w-1/2"
                placeholder="Height"
              />
              <input
                type="text"
                value={size.width}
                onChange={(e) => handleSizeChange(index, 'width', e.target.value)}
                className="input w-1/2"
                placeholder="Width"
              />
              <button
                type="button"
                onClick={() => removeSize(index)}
                className="bg-red-500 hover:bg-red-700 hover:scale-110 text-white font-bold py-1 px-2 rounded"
                title="Remove This Size"
              >
                <FaMinus />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addSize}
            className="bg-blue-500 hover:bg-blue-700 hover:scale-110 text-white font-bold py-2 px-4 rounded mt-2"
            title="Add Size"
          >
            <FaPlus />
          </button>
        </div>

        <div className="mt-6 flex justify-center">
          <button
            type="submit"
            className="mr-2 bg-blue-500 hover:bg-blue-700 hover:scale-110 text-white font-bold py-2 px-4 rounded"
          >
            Update UA
            {isSubmit && (
              <span className='inline-block animate-spin ml-2'>
                <FaSpinner/>
              </span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}