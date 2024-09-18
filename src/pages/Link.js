import React, { useState } from 'react';

export default function Link() {
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [generatedURL, setGeneratedURL] = useState('');

  const handleGenerate = () => {
    let baseUrl = "http://?";
    selectedOptions.forEach(option => {
      baseUrl += `${option}=[${option}]&`;
    });
    setGeneratedURL(baseUrl.slice(0, -1) + "<");
  };

  const handleFinalize = () => {
    let finalUrl = generatedURL.replace(/\[(.*?)\]/g, (match, p1) => {
      return prompt(`Enter value for ${p1}:`, p1);
    });
    setGeneratedURL(finalUrl);
  };

  const handleCheckboxChange = (event) => {
    const { value, checked } = event.target;
    setSelectedOptions(prevOptions =>
      checked
        ? [...prevOptions, value]
        : prevOptions.filter(option => option !== value)
    );
  };

  const options = [
    "channel", "publisher", "width", "height", "appName", "appBundle", "appURL",
    "ua", "idfa", "adid", "ip", "lat", "lon", "deviceId", "device_model",
    "device", "us_privacy", "dnt", "gdpr", "gdpr_consent", "os", "cb",
    "custom", "app_category", "appUid", "country"
  ];

  return (
    <div className="graybg rounded-xl p-8">
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold textwhite mb-6">Select Link Data</h1>
        <div className="flex gap-6">
          <div className="w-1/3 gray700 textwhite shadow-lg rounded-lg p-6">
            <h2 className="font-semibold text-xl mb-4 textwhite">Available Attributes</h2>
            <div className="flex flex-col h-64 overflow-y-scroll">
              {options.map(option => (
                <label key={option} className="flex items-center mb-2">
                  <input
                    type="checkbox"
                    value={option}
                    onChange={handleCheckboxChange}
                    className="form-checkbox text-blue-500 mr-2"
                  />
                  {option}
                </label>
              ))}
            </div>
          </div>
          <div className="w-1/3 graybg shadow-lg rounded-lg p-6">
            <h2 className="font-semibold text-xl mb-4 textwhite ">Generated URL</h2>
            <textarea
              className="input h-40"
              value={generatedURL}
              onChange={(e) => setGeneratedURL(e.target.value)}
            ></textarea>
          </div>
        </div>
        <div className="flex gap-4 justify-center mt-6">
          <button
            className="px-6 py-2 bg-blue-500 textwhite rounded hover:bg-blue-600 transition duration-300"
            onClick={handleGenerate}
          >
            Generate URL
          </button>
          <button
            className="px-6 py-2 bg-green-500 textwhite rounded hover:bg-green-600 transition duration-300"
            onClick={handleFinalize}
          >
            Create Final URL
          </button>
        </div>
      </div>
    </div>
  );
}
