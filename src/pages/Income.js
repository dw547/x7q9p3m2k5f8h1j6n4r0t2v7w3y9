import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { FaDownload, FaEye, FaTrash } from 'react-icons/fa6';

const dummyData = [
  ['data1', 'data2', 'data3', 'data4', 'data5'],
  ['data6', 'data7', 'data8', 'data9', 'data10'],
  ['data11', 'data12', 'data13', 'data14', 'data15'],
  ['data16', 'data17', 'data18', 'data19', 'data20'],
  ['data21', 'data22', 'data23', 'data24', 'data25'],
];

export default function Incomming() {
  const [url, setUrl] = useState('');
  const [copyMessage, setCopyMessage] = useState('');
  const [selectedLayer, setSelectedLayer] = useState(null);

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_URI}/get-incomming`, {
      headers: {
        Authorization: JSON.parse(localStorage.getItem("token")),
      },
    })
      .then(Response => {
        if (Response.data === 200) {
          console.log("data received");
        }
      })
      .catch(Error => {
        console.log(Error);
      });
  }, []);

  const handleUrlChange = (e) => {
    setUrl(e.target.value);
  };

  const handleCopyClick = () => {
    navigator.clipboard.writeText(url).then(() => {
      setCopyMessage('Copied to clipboard!');
      setTimeout(() => {
        setCopyMessage('');
      }, 2000);
    });
  };

  const handleLayerClick = (layer) => {
    setSelectedLayer(layer === selectedLayer ? null : layer);
  };

  return (
    <div className="p-8 graybg min-h-screen rounded-lg shadow-lg">
      <h2 className="text-center italic textwhite text-4xl mb-8 font-bold">URL</h2>
      <div className="flex items-center justify-center mb-8">
        <input
          className="w-96 px-4 py-2 gray700 textwhite border-2 border-gray-400 dark:border-0 rounded-l-lg text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          type="text"
          onChange={handleUrlChange}
          value={url}
          placeholder="Enter URL"
        />
        <button
          onClick={handleCopyClick}
          className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 textwhite font-bold py-2 px-6 rounded-r-lg ml-2 transition duration-300"
        >
          Copy
        </button>
      </div>
      {copyMessage && <p className="text-center text-green-500 mb-8 text-lg">{copyMessage}</p>}

      <div className='overflow-x-auto rounded-xl shadow-lg'>
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gradient-to-r from-blue-700 to-blue-800 text-white">
              <th className="border-b text-lg font-bold p-4 text-left">
                <button
                  onClick={() => handleLayerClick(1)}
                  className="focus:outline-none hover:text-blue-200 transition duration-300"
                >
                  Layer 1
                </button>
              </th>
              <th className="border-b text-lg font-bold p-4 text-left">
                <button
                  onClick={() => handleLayerClick(2)}
                  className="focus:outline-none hover:text-blue-200 transition duration-300"
                >
                  Layer 2
                </button>
              </th>
              <th className="border-b text-lg font-bold p-4 text-left">
                <button
                  onClick={() => handleLayerClick(3)}
                  className="focus:outline-none hover:text-blue-200 transition duration-300"
                >
                  Layer 3
                </button>
              </th>
              <th className="border-b text-lg font-bold p-4 text-left">
                <button
                  onClick={() => handleLayerClick(4)}
                  className="focus:outline-none hover:text-blue-200 transition duration-300"
                >
                  Layer 4
                </button>
              </th>
              <th className="border-b text-lg font-bold p-4 text-left">
                <button
                  onClick={() => handleLayerClick(5)}
                  className="focus:outline-none hover:text-blue-200 transition duration-300"
                >
                  Layer 5
                </button>
              </th>
              <th className="border-b text-lg font-bold p-4 text-left">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              {dummyData.map((row, rowIndex) => (
                <td key={rowIndex} className="textwhite  text-lg p-4">
                  {selectedLayer === rowIndex + 1 && (
                    <div className="space-y-2">
                      {row.map((cell, cellIndex) => (
                        <div key={cellIndex} className="gray700 rounded-lg p-2 shadow-md">
                          {cell}
                        </div>
                      ))}
                    </div>
                  )}
                </td>
              ))}
              <td className="border-b border-gray-600 text-sm p-4 text-right">
                <div className="flex justify-center space-x-2">
                  <button
                    className="relative px-4 py-2 hover:scale-110 bg-blue-500 hover:bg-blue-600 textwhite font-bold rounded text-sm"
                    // onClick={() => handleView()}
                    title="View Process"
                  >
                    <FaEye className="fa-lg" />
                  </button>
                  <button
                    className="bg-red-500 hover:bg-red-600 hover:scale-110 relative text-white font-bold py-2 px-4 rounded flex items-center"
                    // onClick={() => handleDelete()}
                    title="Delete Process"
                  >
                    <FaTrash className="fa-lg" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="flex justify-center mt-12">
        <button
          className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 textwhite font-bold py-3 px-6 rounded-full shadow-lg transition duration-300 relative"
          title='Download Log'
        >
          <FaDownload size={24} />
        </button>
      </div>
    </div>
  );
}