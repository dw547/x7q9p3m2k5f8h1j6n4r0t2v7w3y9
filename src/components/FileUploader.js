import axios from 'axios';
import React, { useState } from 'react';
import { FaTimes } from 'react-icons/fa';
import { FaEye, FaUpload } from 'react-icons/fa6';
import { useNavigate } from 'react-router-dom';

function FileUploader() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [showData,setShowData]=useState(false);
  const navigate = useNavigate();

  const handleFileInput = (e) => {
    const file = e.target.files[0];

    if (file && file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
      setSelectedFile(file);
    } else {
      alert('Please select a valid Excel file.');
    }
  };

  const handleUpload = () => {
    if (!selectedFile) {
      console.error('No file selected for upload');
      return;
    }

    const formData = new FormData();
    formData.append('hardmask', selectedFile);

    const apiUrl = `${process.env.REACT_APP_API_URI}/hardmask-upload`;
    axios.post(apiUrl, formData, {
      headers: {
        'Authorization': JSON.parse(localStorage.getItem('token'))
      }
    })
      .then(response => {
        console.log(response.data);
        if (response.status === 200) {
          alert('Uploaded Successfully');
        }
      })
      .catch(error => {
        console.error('Upload failed:', error);
        if (error.response && error.response.status === 401) {
          navigate('/login');
        }
      });
  };

  const toggleShowData = () => {
    setShowData(!showData);
  };


  return (
    <div className="graybg p-8 rounded-lg shadow-xl mt-2">
      <label className="block textwhite text-sm font-bold mb-2" htmlFor="fileInput">
        Choose File
      </label>
      <div className="flex items-center">
        <label htmlFor="fileInput" className="cursor-pointer hover:scale-110 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-4 rounded">
          <FaUpload />
        </label>
        <input
          id="fileInput"
          type="file"
          accept=".xlsx, .xls,.csv"
          className="hidden"
          onChange={handleFileInput}
        />
        <button className="ml-4 bg-indigo-600 hover:bg-indigo-500 text-white hover:scale-110 font-bold py-2 px-4 rounded" onClick={handleUpload}>
          Upload
        </button>
      </div>

      <br />
      <div className='flex justify-between items-center'>
        <p className="textwhite mt-4 md:mt-0">Please upload an Excel file with reference of these columns:</p>
        <button 
          onClick={toggleShowData} 
          className={`p-2 text-white px-4 rounded-lg ${showData ? 'bg-red-500 hover:bg-red-700' : 'bg-blue-500 hover:bg-blue-700'}`}
        >
          {showData ? <FaTimes /> : <FaEye />}
        </button>
      </div>
      { showData &&(
 <div className="overflow-x-auto">
 <table className="w-full md:w-auto mt-4 border-collapse border border-white">
   <thead>
     <tr className="border border-white">
       <th className="border border-white textwhite p-2">appname</th>
       <th className="border border-white textwhite p-2">appbundle</th>
       <th className="border border-white textwhite p-2">appurl</th>
       <th className="border border-white textwhite p-2">os_type</th>
       <th className="border border-white textwhite p-2">type</th>
     </tr>
   </thead>
   <tr className="border border-white">
     <td className="border border-white textwhite p-2">nat geo</td>
     <td className="border border-white textwhite p-2">com.rog</td>
     <td className="border border-white textwhite p-2">url</td>
     <td className="border border-white textwhite p-2">Android</td>
     <td className="border border-white textwhite p-2">android_ctv</td>
   </tr>
   <tr className="border border-white">
     <td className="border border-white textwhite p-2">nat geo</td>
     <td className="border border-white textwhite p-2">com.rog</td>
     <td className="border border-white textwhite p-2">url</td>
     <td className="border border-white textwhite p-2">Android</td>
     <td className="border border-white textwhite p-2">android_inapp</td>
   </tr> <tr className="border border-white">
     <td className="border border-white textwhite p-2">nat geo</td>
     <td className="border border-white textwhite p-2">com.rog</td>
     <td className="border border-white textwhite p-2">url</td>
     <td className="border border-white textwhite p-2">iOS</td>
     <td className="border border-white textwhite p-2">apple_inapp</td>
   </tr> <tr className="border border-white">
     <td className="border border-white textwhite p-2">nat geo</td>
     <td className="border border-white textwhite p-2">com.rog</td>
     <td className="border border-white textwhite p-2">url</td>
     <td className="border border-white textwhite p-2">iOS</td>
     <td className="border border-white textwhite p-2">apple_ctv</td>
   </tr> <tr className="border border-white">
     <td className="border border-white textwhite p-2">nat geo</td>
     <td className="border border-white textwhite p-2">com.rog</td>
     <td className="border border-white textwhite p-2">url</td>
     <td className="border border-white textwhite p-2">Roku</td>
     <td className="border border-white textwhite p-2">roku_al</td>
   </tr> <tr className="border border-white">
     <td className="border border-white textwhite p-2">nat geo</td>
     <td className="border border-white textwhite p-2">com.rog</td>
     <td className="border border-white textwhite p-2">url</td>
     <td className="border border-white textwhite p-2">Roku</td>
     <td className="border border-white textwhite p-2">roku_ctv</td>
   </tr>
   <tr className="border border-white">
     <td className="border border-white textwhite p-2">nat geo</td>
     <td className="border border-white textwhite p-2">com.rog</td>
     <td className="border border-white textwhite p-2">url</td>
     <td className="border border-white textwhite p-2">Fire TV</td>
     <td className="border border-white textwhite p-2">fire_ctv</td>

   </tr>
   <tr className="border border-white">
     <td className="border border-white textwhite p-2">nat geo</td>
     <td className="border border-white textwhite p-2">com.rog</td>
     <td className="border border-white textwhite p-2">url</td>
     <td className="border border-white textwhite p-2">Tizen</td>
     <td className="border border-white textwhite p-2">all_tizen</td>

   </tr>
 </table>
</div>
      )}
     
    </div>
  );
}

export default FileUploader;
