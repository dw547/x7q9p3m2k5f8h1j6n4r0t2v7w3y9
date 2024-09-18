import React, { useState } from 'react';
import { FaTimes } from 'react-icons/fa';

function FileUploader({ onFileUpload }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [showDetail,setShowFile]=useState(false);

  const handleFileInput = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'text/plain') {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const jsonData = JSON.parse(event.target.result);
          onFileUpload(jsonData);
        } catch (error) {
          console.error('Error parsing file:', error);
          alert('Invalid file format. Please upload a valid JSON file.');
        }
      };
      reader.readAsText(file);
    } else {
      alert('Please select a valid text file.');
    }
  };

  return (
    <div className="mb-4 flex gap-4">
      <div>
      <button onClick={()=>setShowFile(true)} className='textwhite mt-2 bg-gray-500 font-bold font-serif rounded-full px-2.5'>i </button>

      </div>
      <div>
      <input
        type="file"
        accept=".txt"
        onChange={handleFileInput}
        className="block w-full text-sm text-gray-500
          file:mr-4 file:py-2 file:px-4
          file:rounded-full file:border-0
          file:text-sm file:font-semibold
          file:bg-blue-50 file:text-blue-700
          hover:file:bg-blue-100
        "
      />
      </div>
     { showDetail &&(
      <div className='bg-black bg-opacity-50 flex justify-center items-center inset-0 fixed'>
        <div className='p-4 graybg rounded-lg'>
          <div>
            <button onClick={()=>setShowFile(false)} className='bg-red-600 rounded-md p-1 text-white' >
              <FaTimes/>
            </button>
            <p className='textwhite'> Upload .txt File If You Have Alredy Saved Process Details <br/>
             To Get Process .txt File Save The Process And Then You Can Upload Here 
             </p>

            </div>
          </div>
        </div>
     )}
    </div>
  );
}

export default FileUploader;