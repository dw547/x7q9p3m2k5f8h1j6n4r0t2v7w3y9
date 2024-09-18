import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { addHardmask } from '../reducers/rootSlice';
import { useNavigate } from 'react-router-dom';
import { FiTrash2 } from 'react-icons/fi';

const AutocompleteSearch = ({ onButtonClick, selectedOS, isAllHardmaskSelected }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [multipleHardmasks, setMultipleHardmasks] = useState('');
  const [inputMode, setInputMode] = useState('single');
  const navigate = useNavigate();
  const [suggestions, setSuggestions] = useState([]);
  const [selectedSuggestion, setSelectedSuggestion] = useState(0);
  const [selectedHardmasks, setSelectedHardmasks] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [cooldownTimer, setCooldownTimer] = useState(null);
  const [lastSelectedHardmask, setLastSelectedHardmask] = useState(null);

  const dispatch = useDispatch();

  const toggleDetails = (index) => {
    setSelectedHardmasks((prevSelected) =>
      prevSelected.map((item, i) => {
        if (i === index) {
          return { ...item, showDetails: !item.showDetails };
        }
        return item;
      })
    );
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URI}/hardmask?appname=${searchTerm}&os_type=${selectedOS}`,
          {
            headers: {
              Authorization: JSON.parse(localStorage.getItem("token")),
            },
          }
        );
        const data = response.data;
        console.log(data);
        setSuggestions(data);
      } catch (error) {
        console.error("Error fetching data:", error);
        if (error.response && error.response.status === 401) {
          navigate("/login");
        }
      }
    };

    if (searchTerm && typeof searchTerm === "string" && searchTerm.trim() !== "") {
      fetchData();
    } else {
      setSuggestions([]);
    }
  }, [searchTerm, selectedOS, navigate]);

  const handleAddHardmask = async () => {
    if (inputMode === 'single') {
      if (selectedHardmasks.length === 0) {
        alert('Please select at least one hardmask.');
        return;
      }

      selectedHardmasks.forEach((selected) => {
        const result = dispatch(addHardmask(selected));
        onButtonClick(result.payload);
      });
      setSelectedHardmasks([]);
    } else {
      if (!multipleHardmasks.trim()) {
        alert('Please enter at least one hardmask.');
        return;
      }

      const hardmaskList = multipleHardmasks.split('\n').filter(h => h.trim());
      const notFoundHardmasks = [];
      const addedHardmasks = [];

      for (const hardmaskName of hardmaskList) {
        try {
          const response = await axios.get(
            `${process.env.REACT_APP_API_URI}/hardmask?appname=${hardmaskName.trim()}&os_type=${selectedOS}`,
            {
              headers: {
                Authorization: JSON.parse(localStorage.getItem("token")),
              },
            }
          );
          const hardmaskData = response.data[0];
          if (hardmaskData) {
            const result = dispatch(addHardmask(hardmaskData));
            onButtonClick(result.payload);
            addedHardmasks.push(hardmaskName.trim());
          } else {
            notFoundHardmasks.push(hardmaskName.trim());
          }
        } catch (error) {
          console.error(`Error fetching data for ${hardmaskName}:`, error);
          notFoundHardmasks.push(hardmaskName.trim());
        }
      }

      if (notFoundHardmasks.length > 0) {
        setMultipleHardmasks(notFoundHardmasks.join('\n'));
        alert(`${notFoundHardmasks.length} hardmask not found. ${addedHardmasks.length} hardmask were successfully added.`);
      } else {
        setMultipleHardmasks('');
        alert(`All ${addedHardmasks.length} hardmask(s) were successfully added.`);
      }
    }

    setSearchTerm('');
    setSuggestions([]);
  };

  const handleInputChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleMultipleHardmasksChange = (event) => {
    setMultipleHardmasks(event.target.value);
  };

  const handleSuggestionClick = (suggestion) => {
    if (cooldownTimer && lastSelectedHardmask === suggestion.appname) {
      return;
    }

    setSelectedHardmasks((prevSelected) => [...prevSelected, { ...suggestion, showDetails: false }]);
    setShowPopup(true);
    setLastSelectedHardmask(suggestion.appname);

    if (cooldownTimer) {
      clearTimeout(cooldownTimer);
    }

    const timer = setTimeout(() => {
      setShowPopup(false);
      setCooldownTimer(null);
    }, 500);

    setCooldownTimer(timer);
  };

  const handleDeleteHardmask = (index) => {
    setSelectedHardmasks((prevSelected) => prevSelected.filter((_, i) => i !== index));
  };
  
  const handleKeyDown = (event) => {
    if (event.key === 'ArrowUp') {
      setSelectedSuggestion((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (event.key === 'ArrowDown') {
      setSelectedSuggestion((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (event.key === 'Enter') {
      setSearchTerm('');
      setSuggestions([]);
    }
  };

  return (
    <div className="graybg rounded-md relative">
      {selectedOS !== "Select OS" ? (
        <>
          <label className="block textwhite italic font-bold mb-2">Choose Hardmasks</label>
          <div className="mb-4">
            <label className="inline-flex items-center">
              <input
                type="radio"
                className="form-radio"
                name="inputMode"
                value="single"
                checked={inputMode === 'single'}
                onChange={() => setInputMode('single')}
              />
              <span className="ml-2 textwhite">Single Hardmask</span>
            </label>
            <label className="inline-flex items-center ml-6">
              <input
                type="radio"
                className="form-radio"
                name="inputMode"
                value="multiple"
                checked={inputMode === 'multiple'}
                onChange={() => setInputMode('multiple')}
              />
              <span className="ml-2 textwhite">Multiple Hardmasks</span>
            </label>
          </div>
          {inputMode === 'single' ? (
            <input
              type="text"
              value={searchTerm}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Search hardmask"
              disabled={isAllHardmaskSelected}
              className={`w-full px-3 py-2 mb-4 gray700 border textwhite rounded-md ${isAllHardmaskSelected ? 'opacity-50 cursor-not-allowed' : ''}`}
            />
          ) : (
            <textarea
              value={multipleHardmasks}
              onChange={handleMultipleHardmasksChange}
              placeholder="Enter multiple hardmasks (one per line)"
              className="w-full px-3 py-2 mb-4 gray700 border textwhite rounded-md"
              rows="5"
            />
          )}
        </>
      ) : (
        <p className="textwhite italic mb-4">Please select an OS type to choose hardmasks</p>
      )}

      {selectedOS !== "Select OS" && inputMode === 'single' && (
        <>
          {suggestions.length > 0 || searchTerm === '' ? (
            <ul className="autocomplete-suggestions max-h-40 gray700 textwhite overflow-y-auto mb-4">
              {suggestions.map((suggestion, index) => (
                <li
                  key={index}
                  className={`p-2 cursor-pointer ${index === selectedSuggestion ? 'gray700' : ''}`}
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  {suggestion.appname}
                </li>
              ))}
            </ul>
          ) : (
            <p className="textwhite text-center">Hardmask not available in the database.</p>
          )}
        </>
      )}

      {selectedHardmasks.map((selected, index) => (
        <div key={index} className="mb-4">
          <div className="gray700 p-2 mb-2 flex justify-between items-center">
            <p className="textwhite" onClick={() => toggleDetails(index)}>{selected.appname}</p>
            <button onClick={() => handleDeleteHardmask(index)} className="bg-red-500 textwhite py-1 px-2 rounded">
              <FiTrash2 />
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
                className="input"
              />
              <input
                type="text"
                placeholder="App URL"
                name="appUrl"
                value={selected.appurl}
                disabled={true}
                className="input"
              />
              <input
                type="text"
                placeholder="OS"
                name="os"
                value={selected.os_type}
                disabled={true}
                className="input"
              />
            </div>
          )}
        </div>
      ))}

      {selectedOS !== "Select OS" && (
        <div className="flex">
          <button onClick={handleAddHardmask} className="bg-blue-500 textwhite px-4 py-2 rounded-md focus:outline-none hover:bg-blue-600">
            Add to hardmask list
          </button>
        </div>
      )}

      {showPopup && (
        <div className="absolute bg-slate-300 dark:bg-gray-800 top-0 left-0 right-0 p-0 font-bold textwhite text-center rounded-md">
          Hardmask Selected !
        </div>
      )}
    </div>
  );
};

export default AutocompleteSearch;