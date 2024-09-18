import React, { useState, useEffect } from 'react';
import { FaDownload, FaEye, FaTrash, FaRectangleXmark } from 'react-icons/fa6';
import LogCard from './LogCard';
import axios from 'axios';
import { FaSpinner } from 'react-icons/fa';

const LogPopup = ({ onClose, serverId, processId }) => {
    const [data, setData] = useState([]);
    const [showPopup, setShowPopup] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [isSubmit, setIsSubmit] = useState(false);
    const [isSubmitings, setIsSubmitings] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [loadingStates, setLoadingStates] = useState({});

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.post(
                    `${process.env.REACT_APP_API_URI}/get-process-log`,
                    {
                        serverId,
                        process_id: processId,
                    },
                    {
                        headers: {
                            Authorization: JSON.parse(localStorage.getItem('token')),
                        },
                    }
                );

                if (response.status === 200) {
                    console.log('Data updated:', response.data);

                    setData(response.data);
                } else {
                    console.log('Error fetching process log data');
                }
            } catch (error) {
                console.log(error);
            }
        };

        fetchData();

        const interval = setInterval(fetchData, 1000);

        return () => {
            clearInterval(interval);
        };
    }, [serverId, processId]);

    const handleDownload = async () => {
        setIsSubmit(true);
        try {
            const token = localStorage.getItem("token");
            const response = await axios.post(`${process.env.REACT_APP_API_URI}/download-process-log-file`, {
                serverId,
                process_id: processId,
            }, {
                headers: { Authorization: JSON.parse(token) },
                responseType: 'blob',
            });

            if (response.status === 200) {
                const url = window.URL.createObjectURL(new Blob([response.data]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', `${processId}_logs.zip`);
                document.body.appendChild(link);
                link.click();
                link.remove();
                setIsSubmit(false);
                alert("All Process_logs downloaded successfully");
            }
        } catch (error) {
            setIsSubmit(false);
            alert("Error downloading logs", error);
            console.error("Error downloading logs", error);
        }
    };

    const handleLogDownload = async (item) => {
        setLoadingStates((prevStates) => ({ ...prevStates, [item]: true }));

        try {
            const response = await axios.post(
                `${process.env.REACT_APP_API_URI}/get-process-log-file`,
                {
                    process_id: processId,
                    serverId,
                    file: item,
                },
                {
                    headers: {
                        Authorization: JSON.parse(localStorage.getItem('token')),
                    },
                    responseType: 'blob',
                }
            );

            if (response.status === 200) {
                setLoadingStates((prevStates) => ({ ...prevStates, [item]: false }));
                const url = window.URL.createObjectURL(new Blob([response.data]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', `${item}_log.txt`);
                document.body.appendChild(link);
                link.click();
                link.remove();
                window.URL.revokeObjectURL(url);
                console.log("File downloaded successfully");
            }
        } catch (error) {
            setLoadingStates((prevStates) => ({ ...prevStates, [item]: false }));
            alert("Faield To Download Log")
            console.log(error);
        }
    };

    const handleDelete = () => {
        setShowConfirmation(true);
    };

    const confirmDelete = () => {
        setIsSubmitings(true);
        axios
            .post(`${process.env.REACT_APP_API_URI}/delete-process-log`,
                {
                    serverId,
                    process_id: processId,
                }, {
                headers: {
                    Authorization: JSON.parse(localStorage.getItem('token')),
                }
            },
            )
            .then((response) => {
                if (response.status === 200) {
                    setIsSubmitings(false);
                    alert("Delete Successful")
                    console.log('Deleted All Logs Successfully');
                }
            })
            .catch((error) => {
                setIsSubmitings(false);
                alert("Failed To Delete All Logs");
                console.log(error);
            });
        setShowConfirmation(false);
    };

    const cancelDelete = () => {
        setShowConfirmation(false);
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 p-4 z-50">
            <div className="graybg p-6 border-2 border-gray-300 rounded-lg w-full max-w-4xl shadow-md h-full max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-center mb-4">Process Log</h2>
                    <button
                        className="p-2 bg-red-500 text-white rounded hover:bg-red-600"
                        onClick={onClose}
                    >
                        <FaRectangleXmark />
                    </button>
                </div>
                <div className="flex justify-between items-center mb-4 mt-8">

                    <button
                        className="bg-blue-500 hover:bg-blue-600 hover:scale-110 text-white font-bold py-2 px-4 rounded flex items-center relative"
                        onClick={handleDownload}
                        title="Download All Logs"
                    >
                        <FaDownload className="fa-lg" />
                        {isSubmit && (
                            <span className="inline-block ml-2 animate-spin"><FaSpinner /></span>
                        )}
                    </button>

                    <button
                        className="bg-red-500 hover:bg-red-600 hover:scale-110 text-white font-bold py-2 px-4 rounded flex items-center relative"
                        onClick={handleDelete}
                        title="Delete All Logs"
                    >
                        <FaTrash className="fa-lg" />

                    </button>

                </div>

                <div className="overflow-x-auto rounded-xl shadow-lg">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-blue-800 text-white">
                                <th className="py-3 px-4 text-left">Sr No</th>
                                <th className="py-3 px-4 text-left">Response Data</th>
                                <th className="py-3 px-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((item, index) => (
                                <tr
                                    key={index}
                                    className="border-b border-gray-300 dark:hover:bg-gray-700 hover:bg-gray-300 transition duration-300"
                                >
                                    <td className="py-3 px-4">{index + 1}</td>
                                    <td className="py-3 px-4">{item}</td>
                                    <td className="py-3 px-4 flex justify-end space-x-2 text-right">
                                        <button
                                            className="p-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded transition duration-300 relative w-10 h-10 flex items-center justify-center"
                                            onClick={() => handleLogDownload(item)}
                                            title="Download Log">
                                            {loadingStates[item] ? (
                                                <span className="spinner absolute inset-0 flex items-center justify-center">
                                                    <span className="border-4 border-t-4 border-blue-500 rounded-full w-6 h-6 animate-spin"></span>
                                                </span>
                                            ) : (
                                                <FaDownload className="fa-lg" />
                                            )}
                                        </button>
                                        <button
                                            className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded transition duration-300 relative w-10 h-10 flex items-center justify-center"
                                            title="View log"
                                            onClick={() => {
                                                setSelectedItem(item);
                                                setShowPopup(true);
                                            }}>
                                            <FaEye />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {showPopup && (
                    <LogCard
                        item={selectedItem}
                        onClose={() => setShowPopup(false)}
                        processId={processId}
                        serverId={serverId}/>
                )}
                {showConfirmation && (
                    <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
                        <div className="graybg p-6 rounded shadow-lg w-1/3">
                            <h2 className="text-xl font-bold mb-4">Confirm Action</h2>
                            <p className="mb-6 textwhite">Are You Sure You Want To Delete All Logs?</p>
                            <div className="flex justify-end">
                                <button
                                    className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded mr-2"
                                    onClick={confirmDelete}
                                >
                                    Yes
                                    {isSubmitings && (
                                        <span className="inline-block ml-2 animate-spin"><FaSpinner /></span>
                                    )}
                                </button>
                                <button
                                    className="bg-gray-300 hover:bg-gray-400 text-black font-bold py-2 px-4 rounded"
                                    onClick={cancelDelete}
                                >
                                    No
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LogPopup;
