import axios from 'axios';
import React, { useEffect, useState, useRef } from 'react';
import { FaRectangleXmark } from 'react-icons/fa6';

export default function ViewPopup({ item, onClose }) {
  const [responseData, setResponseData] = useState(null);
  const popupRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URI}/get-single-incomming/${item}`, {
          headers: {
            Authorization: JSON.parse(localStorage.getItem('token'))
          }
        });
        if (response.status === 200) {
          setResponseData(response.data);
          console.log("data received", response.data);
        }
      } catch (error) {
        console.log(error);
      }
    };

    fetchData();
  }, [item]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 ">
      <div className="absolute inset-0 bg-black opacity-50" onClick={onClose}></div>
      <div ref={popupRef} className="graybg textwhite p-8 rounded-lg  shadow-lg z-10 max-h-screen overflow-y-auto">
        <button
          className="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 mb-5"
          onClick={onClose}
        >
          <FaRectangleXmark />
        </button>
        <pre className="whitespace-pre-wrap">
          {responseData ? responseData : "Loading..."}
        </pre>
      </div>
    </div>
  );
}