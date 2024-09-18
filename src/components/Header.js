import axios from "axios";
import React, { useEffect, useState } from "react";
import { FaSpinner, FaTimes } from "react-icons/fa";
import HeaderType from "./HeaderType";

const Header = () => {
    const [data, setData] = useState([]);
    const [addHeader, setAddHeader] = useState(false);
    const [submit, setSubmit] = useState(false);
    const [headerName, setHeaderName] = useState("");
    const [newHeader, setNewHeader] = useState({
        click: {
            name: "",
            description: "",
            headers: [{ key: "", value: "", isCustom: false }]
        },
        rust: {
            name: "",
            description: "",
            headers: [{ key: "", value: "", isCustom: false }]
        }
    });

    useEffect(() => {
        fetchHeaders();
    }, []);

    const fetchHeaders = () => {
        axios.get(`${process.env.REACT_APP_API_URI}/get-all-header`, {
            headers: {
                Authorization: JSON.parse(localStorage.getItem("token"))
            }

        }).then((response) => {
            if (response.status === 200) {
                setData(response.data);
                console.log(response.data);
            }
        }).catch((error) => {
            console.log("Error Fetching Header", error);
        });
    };

    const handleAddHeader = () => {
        setSubmit(true);
        const clickHeaderObject = newHeader.click.headers.reduce((acc, header) => {
            acc[header.key] = header.value;
            return acc;
        }, {});
        const rustHeaderObject = newHeader.rust.headers.reduce((acc, header) => {
            acc[header.key] = header.value;
            return acc;
        }, {});

        const payload = {
            aname: headerName,
            name_click: newHeader.click.name,
            description_click: newHeader.click.description,
            header_click: clickHeaderObject,
            name_rust: newHeader.rust.name,
            description_rust: newHeader.rust.description,
            header_rust: rustHeaderObject
        };

        axios.post(`${process.env.REACT_APP_API_URI}/add-new-header`, payload, {
            headers: {
                Authorization: JSON.parse(localStorage.getItem('token'))
            }
        }).then((response) => {
            if (response.status === 200) {
                alert("Headers Added Successfully");
                setSubmit(false);
                setAddHeader(false);
                fetchHeaders();
                resetNewHeader();
            }
        }).catch((error) => {
            alert("Error Adding Headers", error);
            setSubmit(false);
        });
    };

    const handleDelete = (deletedAid) => {
        setData(prevData => prevData.filter(item => item.aid !== deletedAid));
    };

    const resetNewHeader = () => {
        setNewHeader({
            click: { name: "", description: "", headers: [{ key: "", value: "", isCustom: false }] },
            rust: { name: "", description: "", headers: [{ key: "", value: "", isCustom: false }] }
        });
        setHeaderName("");
    };

    const handleInputChange = (type, e, index, field) => {
        const { value } = e.target;
        setNewHeader(prev => {
            const updatedType = { ...prev[type] };
            if (field === 'name' || field === 'description') {
                updatedType[field] = value;
            } else {
                const updatedHeaders = [...updatedType.headers];
                if (field === 'value') {
                    updatedHeaders[index].value = value;
                    updatedHeaders[index].isCustom = value === 'custom' || updatedHeaders[index].isCustom;
                } else {
                    updatedHeaders[index][field] = value;
                }
                updatedType.headers = updatedHeaders;
            }
            return { ...prev, [type]: updatedType };
        });
    };
    const addRow = (type) => {
        setNewHeader(prev => ({
            ...prev,
            [type]: {
                ...prev[type],
                headers: [...prev[type].headers, { key: "", value: "", isCustom: false }]
            }
        }));
    };

    const removeRow = (type, index) => {
        if (newHeader[type].headers.length > 1) {
            setNewHeader(prev => ({
                ...prev,
                [type]: {
                    ...prev[type],
                    headers: prev[type].headers.filter((_, i) => i !== index)
                }
            }));
        }
    };

    const renderForm = (type) => (
        <div className="graybg p-5 rounded-lg w-full max-w-3xl">
            <h2 className="text-xl font-bold mb-4">{type.charAt(0).toUpperCase() + type.slice(1)}</h2>
            <div>
                <label className="textwhite font-bold block">Name</label>
                <input
                    className="input mt-1 w-full"
                    value={newHeader[type].name}
                    onChange={(e) => handleInputChange(type, e, null, 'name')}
                />
            </div>
            <div className="mt-4">
                <label className="textwhite font-bold block">Description</label>
                <textarea
                    className="input mt-1 w-full"
                    value={newHeader[type].description}
                    onChange={(e) => handleInputChange(type, e, null, 'description')}
                />
            </div>
            {newHeader[type].headers.map((header, index) => (
                <div key={index} className="mt-4">
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <label className="textwhite font-bold block">Key</label>
                            <input
                                type="text"
                                className="input mt-1 w-full"
                                value={header.key}
                                onChange={(e) => handleInputChange(type, e, index, 'key')}
                            />
                        </div>
                        <div className="flex-1">
                            <label className="textwhite font-bold block">Value</label>
                            {header.isCustom ? (
                                <input
                                    type="text"
                                    className="input mt-1 w-full"
                                    // value={header.value}
                                    onChange={(e) => handleInputChange(type, e, index, 'value')}
                                    placeholder="Enter custom value"
                                />
                            ) : (
                                <select
                                    className="input mt-1 w-full"
                                    value={header.value}
                                    onChange={(e) => handleInputChange(type, e, index, 'value')}
                                >
                                    <option value="">Select a value</option>
                                    <option value="useragent">useragent</option>
                                    <option value="ip">IP</option>
                                    <option value="appurl">appurl</option>
                                    <option value="custom">Custom</option>
                                </select>
                            )}
                        </div>
                        {newHeader[type].headers.length > 1 && (
                            <button
                                className="mt-6 px-3 py-1 bg-red-500 text-white rounded "
                                onClick={() => removeRow(type, index)}
                            >
                                −
                            </button>
                        )}
                    </div>
                </div>
            ))}
            <button
                className="mt-4 px-3 py-1 bg-green-500 text-white rounded"
                onClick={() => addRow(type)}
            >
                + Add Row
            </button>
        </div>
    );

    return (
        <div>
            <div className="container mx-auto max-w-[1600px] px-4">
                <HeaderType data={data} onDelete={handleDelete} />
            </div>

            <div>
                <button onClick={() => setAddHeader(true)} className="bg-blue-500 hover:bg-blue-700 hover:scale-105 rounded-lg px-2 p-1 text-white">Add New Header</button>
            </div>

            {addHeader && (
                <div className=" inset-0 graybg bg-opacity-50 overflow-y-auto mt-2 h-full w-full flex items-center justify-center">
                    <div className="graybg p-5 rounded-lg  w-full max-w-6xl">
                        <button onClick={() => setAddHeader(false)} className="float-right bg-red-500 p-1 text-white rounded-md"><FaTimes /></button>
                        <div className="mb-4">
                            <label className="textwhite font-bold block">Header Name</label>
                            <input
                                type="text"
                                className="input mt-1 w-full"
                                value={headerName}
                                onChange={(e) => setHeaderName(e.target.value)}
                                placeholder="Enter header name"
                            />
                        </div>
                        <div className="flex textwhite gap-4">
                            {renderForm('rust')}
                            {renderForm('click')}
                        </div>
                        <button
                            onClick={handleAddHeader}
                            className="mt-4 bg-blue-500 rounded-lg px-4 py-2 text-white"
                            disabled={!headerName.trim()}
                        >
                            Add Headers
                            {submit && (<span className="inline-block ml-2 animate-spin"><FaSpinner /></span>)}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Header;