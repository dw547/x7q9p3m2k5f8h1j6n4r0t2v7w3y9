import React, { useState, useRef } from 'react';

const DataValueCreater = () => {
  const [tableData, setTableData] = useState([
    { id: 1, name: 'channel', isChecked: false, selectedOption: '', Value: '' },
    { id: 2, name: 'publisher', isChecked: false, selectedOption: '', Value: '' },
    { id: 3, name: 'width', isChecked: false, selectedOption: '', Value: '' },
    { id: 4, name: 'height', isChecked: false, selectedOption: '', Value: '' },
    { id: 5, name: 'appName', isChecked: false, selectedOption: '', Value: '' },
    { id: 6, name: 'appBundle', isChecked: false, selectedOption: '', Value: '' },
    { id: 7, name: 'appURL', isChecked: false, selectedOption: '', Value: '' },
    { id: 8, name: 'ua', isChecked: false, selectedOption: '', Value: '' },
    { id: 9, name: 'idfa', isChecked: false, selectedOption: '', Value: '' },
    { id: 10, name: 'adid', isChecked: false, selectedOption: '', Value: '' },
    { id: 11, name: 'ip', isChecked: false, selectedOption: '', Value: '' },
    { id: 12, name: 'lat', isChecked: false, selectedOption: '', Value: '' },
    { id: 13, name: 'lon', isChecked: false, selectedOption: '', Value: '' },
    { id: 14, name: 'deviceId', isChecked: false, selectedOption: '', Value: '' },
    { id: 15, name: 'device_model', isChecked: false, selectedOption: '', Value: '' },
    { id: 16, name: 'device', isChecked: false, selectedOption: '', Value: '' },
    { id: 17, name: 'us_privacy', isChecked: false, selectedOption: '', Value: '' },
    { id: 18, name: 'dnt', isChecked: false, selectedOption: '', Value: '' },
    { id: 19, name: 'gdpr', isChecked: false, selectedOption: '', Value: '' },
    { id: 20, name: 'gdpr_consent', isChecked: false, selectedOption: '', Value: '' },
    { id: 21, name: 'os', isChecked: false, selectedOption: '', Value: '' },
    { id: 22, name: 'cb', isChecked: false, selectedOption: '', Value: '' },
    { id: 23, name: 'Custom', isChecked: false, selectedOption: '', Value: '' },
    { id: 24, name: 'app_category', isChecked: false, selectedOption: '', Value: '' },
    { id: 25, name: 'appUid', isChecked: false, selectedOption: '', Value: '' },
    { id: 26, name: 'country', isChecked: false, selectedOption: '', Value: '' },


  ]);
  const [generatedUrls, setGeneratedUrls] = useState([]);
  const generatedUrlRef = useRef(null);
  const urlRef = useRef(null);

  const dropdownOptions = ['channel', 'publisher', 'width', 'height', 'appName', 'appBundle', 'appURL', 'ua', 'idfa', 'adid', 'ip', 'lat', 'lon', 'device id', 'device model', 'device', 'us privacy', 'dnt', 'gdpr', 'gdpr consent', 'os', 'cd', 'Custom'];

  const addTableRow = () => {
    const newId = tableData.length + 1;
    const newRow = {
      id: newId,
      name: '',
      isChecked: false,
      selectedOption: '',
      Value: '',
    };

    setTableData((prevData) => [...prevData, newRow]);
  };

  const handleCheckboxChange = (id) => {
    setTableData((prevData) =>
      prevData.map((item) =>
        item.id === id ? { ...item, isChecked: !item.isChecked } : item
      )
    );
  };

  const handlenameChange = (id, name) => {
    setTableData((prevData) =>
      prevData.map((item) =>
        item.id === id ? { ...item, name } : item
      )
    );
  };
  const handleDropdownChange = (id, selectedOption) => {
    setTableData((prevData) =>
      prevData.map((item) =>
        item.id === id ? { ...item, selectedOption } : item
      )
    );
  };

  const handleTextboxChange = (id, Value) => {
    setTableData((prevData) =>
      prevData.map((item) =>
        item.id === id ? { ...item, Value } : item
      )
    );
  };
  const handleBaseURLChange = () => {
    const baseUrl = urlRef.current?.value || '';
    const urlParams = new URLSearchParams(baseUrl);

    console.log('Keys in urlParams:', Array.from(urlParams.keys()));

    const updatedTableData = tableData.map((item) => {
      const paramName = item.name.trim();
      const isParamPresent = Array.from(urlParams.keys())
        .some((key) => key.trim().toLowerCase().includes(paramName.toLowerCase()));

      console.log(`Item: ${paramName}, isChecked: ${isParamPresent}`);

      return {
        ...item,
        isChecked: isParamPresent,
        Value: isParamPresent ? urlParams.get(paramName) : '',
      };
    });

    setTableData(updatedTableData);
  };

  const handleGenerateUrl = () => {
    const selectedRows = tableData.filter((item) => item.isChecked);
    generatedUrlRef.current.value = generatedUrls;
    if (selectedRows.length === 0) {
      alert('Please select at least one row before generating the URL.');
      return;
    }

    const urlParams = selectedRows
      .map((item) => {
        const optionValue = item.selectedOption ? `[${item.selectedOption}]` : '';
        return `${item.name}=${optionValue || encodeURIComponent(item.Value)}`;
      })
      .join('&');



    const generatedUrl = `http://?${urlParams}&`;
    setGeneratedUrls((prevUrls) => [...prevUrls, generatedUrl]);
    copyToClipboard(generatedUrl);
    console.log(`Generated URL: ${generatedUrl}`);

  };
  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      alert('URL copied to clipboard');
    } catch (err) {
      console.error('Unable to copy URL to clipboard', err);
    }
  };

  return (
    <div className="container rounded mx-auto">
      <div className='graybg p-1 rounded-xl'>
        <h1 className="text-center italic textwhite text-4xl">DATA TABLE</h1>
        <div className="flex justify-center items-center my-4">
          <label className="flex justify-center items-center textwhite">
            Base URL:
            <input
              ref={urlRef}
              className="dropdown"
              type="text"
              onChange={handleBaseURLChange}
            />
          </label>
        </div>
      </div>
      <br />
      <div className="overflow-x-auto rounded-xl ">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-blue-700 text-white">
              <th className="border-b text-sm font-medium p-4 text-left">ID</th>
              <th className="border-b text-sm font-medium p-4 text-left">Check</th>
              <th className="border-b text-sm font-medium p-4 text-left">Key</th>
              <th className="border-b text-sm font-medium p-4 text-left">Actual Name</th>
              <th className="border-b text-sm font-medium p-4 text-left">Value</th>
            </tr>
          </thead>

          <tbody>
            {tableData.map((item) => (
              <tr
                key={item.id}
                className={`hover:bg-gray-300 dark:hover:bg-gray-700 graybg `}
              >                <td className="border-b  textwhite border-gray-600 text-sm p-4">{item.id}
                </td>
                <td className="border-b  textwhite mr-3 border-gray-600 text-sm p-4">
                  <input
                    type="checkbox"
                    checked={item.isChecked}
                    onChange={() => handleCheckboxChange(item.id)}
                  />
                </td>
                <td className="border-b  textwhite border-gray-600 text-sm p-4">
                  <input
                    className='dropdown p-1'
                    type="text"
                    value={item.name}
                    onChange={(e) => handlenameChange(item.id, e.target.value)}
                  />
                </td>
                <td className="border-b  textwhite border-gray-600 text-sm p-4">
                  <select
                    className='dropdown'
                    value={item.selectedOption}
                    onChange={(e) => handleDropdownChange(item.id, e.target.value)}
                  >
                    <option value="" disabled>Select an option</option>
                    {dropdownOptions.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </td>
                <td className="border-b  textwhite border-gray-600 text-sm p-4">
                  <input
                    className='dropdown'
                    type="text"
                    value={item.value}
                    onChange={(e) => handleTextboxChange(item.id, e.target.value)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex justify-center my-4">
        <button
          className="px-4 py-2 bg-red-500 text-white rounded-md text-lg"
          onClick={addTableRow}
        >
          Add Row
        </button>
      </div>
      <div className="flex justify-center">
        <button
          style={{ padding: '10px', fontSize: '16px', border: '1px solid', borderRadius: '7px' }}
          className="generateButton bg-blue-500"
          onClick={handleGenerateUrl}
        >
          Generate URL
        </button>
      </div>
      <div className="text-center mt-4">
        <h3 className="text-xl  font-semibold text-white">Generated URLs:</h3>
        <ul className="generatedUrlList">
          {generatedUrls.map((url, index) => (
            <li key={index} className="text-blue-600 gray700 m-2 p-2">{url}</li>
          ))}
        </ul>
      </div>
      <input
        ref={generatedUrlRef}
        type="text"
        value={generatedUrls[generatedUrls.length - 1] || ''}
        readOnly
        style={{ display: 'none' }}
      />
    </div>
  );
};

export default DataValueCreater;