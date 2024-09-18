import axios from 'axios';
import React, { useState } from 'react';
import { FaSpinner } from 'react-icons/fa6';
import Switch from 'react-switch';

export default function NewIncoming() {
    const [isToggle, setIsToggle] = useState(false);
    const [isStart, setIsStart] = useState(false);
    const [showSpin, setShowSpin] = useState(false);
    const [requestNumber, setRequestNumber] = useState("");

    const handleToggleIncoming = async () => {
        try {
            const token = localStorage.getItem("token");
            const action = isToggle ? "stop" : "start";
            const response = await axios.post(
                `${process.env.REACT_APP_API_URI}/control-incomming`,
                { action },
                { headers: { Authorization: JSON.parse(token) } }
            );
            if (response.status === 200) {
                alert("Successful");
                setIsToggle(!isToggle);
            } else {
                console.error("Failed to toggle", response.status, response.statusText);
            }
        } catch (error) {
            alert("Error toggling button");
            console.error("Error toggling button", error);
        }
    };

    const handleStartStop = async () => {
        try {
            setShowSpin(true);
            const token = JSON.parse(localStorage.getItem("token"));
            let response;

            if (!isStart) {
                response = await axios.post(
                    `${process.env.REACT_APP_API_URI}/start-logging`,
                    { request_number: requestNumber },
                    { headers: { Authorization: token } }
                );
                if (response.status === 200) {
                    alert("Logging Started");
                    setIsStart(true);
                }
            } else {
                response = await axios.post(
                    `${process.env.REACT_APP_API_URI}/stop-logging`,
                    { request_number: requestNumber },
                    { headers: { Authorization: token } }
                );
                if (response.status === 200) {
                    alert("Logging Stopped");
                    setIsStart(false);
                }
            }
        } catch (error) {
            alert(`Error ${isStart ? 'stopping' : 'starting'} Logging`);
            console.error(`Error ${isStart ? 'stopping' : 'starting'} Logging`, error);
        } finally {
            setShowSpin(false);
        }
    };

    return (
        <div className="p-8 graybg min-h-screen rounded-lg shadow-lg">
            <div className='flex justify-center items-center'>
                <h2 className="text-center textwhite text-4xl mb-8 font-bold">Incoming Logs</h2>
               
                <div className="ml-4">
                    <Switch
                        checked={isToggle}
                        onChange={handleToggleIncoming}
                        onColor="#86d3ff"
                        onHandleColor="#2693e6"
                        handleDiameter={30}
                        uncheckedIcon={false}
                        checkedIcon={false}
                        boxShadow="0px 1px 5px rgba(0, 0, 0, 0.6)"
                        activeBoxShadow="0px 0px 1px 10px rgba(0, 0, 0, 0.2)"
                        height={20}
                        width={48}
                        className="react-switch mt-2"
                    />
                </div>
            </div>
            <div className='mb-4'>
                    <label className='textwhite font-bold'>Live Log Tracking : </label>
                </div>
            <div className='flex mb-4'>
                <label className='textwhite mt-1 font-bold'>Request Number : </label>
                <input
                    type='text'
                    className='dropdown ml-2'
                    value={requestNumber}
                    onChange={(e) => setRequestNumber(e.target.value)}
                />
            </div>

            <div>
                <button 
                    className={`text-white px-4 py-2 rounded-lg ${isStart ? "bg-red-500" : "bg-green-500"}`}
                    onClick={handleStartStop}
                >
                    {isStart ? "Stop Logging" : "Start Logging"}
                    {showSpin && (
                        <span className='ml-2 inline-block animate-spin'><FaSpinner /></span>
                    )}
                </button>
            </div>
        </div>
    );
}