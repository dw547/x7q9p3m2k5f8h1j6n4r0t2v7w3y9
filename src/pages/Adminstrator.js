import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaEye, FaEyeSlash, FaSpinner } from 'react-icons/fa';

export default function Administrator() {
  const [currentItem, setCurrentItem] = useState({
    username: "",
    fullName: "",
    email: "",
    id: null,
    new_password: "",
    isAdmin: false,
    processWrite: false,
    processRead: false,
    serverWrite: false,
    serverRead: false,
  });
  const navigate = useNavigate();
  const [administrators, setAdministrators] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [updatingUserId, setUpdatingUserId] = useState(null);
  const [deleteUserId, setDeleteUserId] = useState(null);
  const [deleteUserName, setDeleteUserName] = useState('');
  const [isSubmit, setIsSubmit] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [showPermissionUserId, setShowPermissionUserId] = useState(null);
  const[showPassword,setShowPassword]= useState({})

  useEffect(() => {
    fetchAdministrators();
  }, []);

  useEffect(() => {
    if (currentItem.id) {
      handleUpdate();
    }
  }, [currentItem]);

  const fetchAdministrators = () => {
    axios
      .get(`${process.env.REACT_APP_API_URI}/get-all-user`, {
        headers: {
          Authorization: JSON.parse(localStorage.getItem("token")),
        },
      })
      .then((response) => {
        const updatedAdministrators = response.data.map((admin) => ({
          ...admin,
          isAdmin: admin.is_admin,
          processWrite: admin.process_write,
          processRead: admin.process_read,
          serverWrite: admin.server_write,
          serverRead: admin.server_read,
        }));
        setAdministrators(updatedAdministrators);
        console.log(response);
      })
      .catch((error) => {
        console.log(error);
        if (error.response && error.response.status === 401) {
          navigate("/");
        }
        if (error.response && error.response.status === 403) {
          setPermissionDenied(true);
        }
      });
  };

  const addAdmin = () => {
    navigate('/addadmin');
  };

  const handleUpdate = () => {
    setIsSubmitting(true);
    axios
      .post(
        `${process.env.REACT_APP_API_URI}/update-user`,
        {
          id: currentItem.id,
          fullName: currentItem.fullName,
          email: currentItem.email,
          new_password: currentItem.new_password,
          is_admin: currentItem.isAdmin,
          process_write: currentItem.processWrite,
          process_read: currentItem.processRead,
          server_write: currentItem.serverWrite,
          server_read: currentItem.serverRead,
        },
        {
          headers: {
            Authorization: JSON.parse(localStorage.getItem("token")),
          },
        }
      )
      .then((response) => {
        console.log(response);
        if (response.status === 201) {
          alert("User Data Updated Successfully");
          setIsSubmitting(false);
          setUpdatingUserId(null);
          fetchAdministrators();
        }
      })
      .catch((error) => {
        console.log(error);
        alert("Unable To Update");
        setIsSubmitting(false);
        setUpdatingUserId(null);
        if (error.response && error.response.status === 401) {
          navigate("/");
        }
      });
  };

  const handleDelete = (id) => {
    setIsSubmit(true);
    axios
      .get(`${process.env.REACT_APP_API_URI}/delete-user/${id}`, {
        headers: {
          Authorization: JSON.parse(localStorage.getItem('token')),
        },
      })
      .then((response) => {
        console.log(response);
        if (response.status === 201) {
          setIsSubmit(false);
          alert('User Deleted Successfully');
          setDeleteUserId(null);
          setDeleteUserName('');
          fetchAdministrators();
        }
      })
      .catch((error) => {
        console.log(error);
        setIsSubmit(false);
        alert('Unable To Delete');
        setDeleteUserId(null);
        setDeleteUserName('');
        if (error.response && error.response.status === 401) {
          navigate('/');
        }
      });
  };

  const openDeleteConfirmation = (userId, fullName) => {
    setDeleteUserId(userId);
    setDeleteUserName(fullName);
  };

  const closeDeleteConfirmation = () => {
    setDeleteUserId(null);
    setDeleteUserName('');
  };

  const handleInputChange = (e, index) => {
    const { name, value } = e.target;
    setAdministrators((prevAdministrators) => {
      const updatedAdministrators = [...prevAdministrators];
      updatedAdministrators[index] = {
        ...updatedAdministrators[index],
        [name]: value,
      };
      return updatedAdministrators;
    });
  };

  const handleCheckboxChange = (e, index) => {
    const { name, checked } = e.target;
    setAdministrators((prevAdministrators) => {
      const updatedAdministrators = [...prevAdministrators];
      updatedAdministrators[index] = {
        ...updatedAdministrators[index],
        [name]: checked,
        ...(name === 'isAdmin' && checked && {
          processWrite: true,
          processRead: true,
          serverWrite: true,
          serverRead: true,
        }),
        ...(name === 'processWrite' && checked && { processRead: true }),
        ...(name === 'serverWrite' && checked && { serverRead: true }),
      };
      return updatedAdministrators;
    });
  };

  const handleEditClick = (admin) => {
    setCurrentItem(admin);
    setUpdatingUserId(admin.id);
  };

  const togglePermissionVisibility = (userId) => {
    setShowPermissionUserId(prevId => prevId === userId ? null : userId);
  };

  const handleShowPassword = (userId) => {
    setShowPassword(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));
  }

  return (
    <div className="textwhite">
      {permissionDenied ? (
        <div className="flex justify-center items-center h-screen">
          <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4 text-red-500">Permission Denied</h2>
            <p className="text-gray-600 dark:text-gray-400">You don't have the necessary permissions to access this page.</p>
          </div>
        </div>
      ) : (
        <>
          <div className="flex justify-between p-2 rounded-xl graybg items-center mb-4">
            <h2 className="text-xl textwhite font-bold">Administrator</h2>
            <button
              onClick={addAdmin}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center"
            >
              <FontAwesomeIcon icon={faPlus} className="mr-2" />
              Add User
            </button>
          </div>
          <div className="graybg text-blue-500 rounded-lg shadow-md">
            <div className="overflow-x-auto rounded-xl">
              <table className="min-w-full divide-y divide-gray-200 graybg rounded-lg shadow-lg">
                <thead>
                  <tr className="bg-blue-700 text-white">
                    <th className="px-4 py-2">Fullname</th>
                    <th className="px-4 py-2">Email</th>
                    <th className="px-4 py-2">New Password</th>
                    <th className='px-4 py-2'>Permissions</th>
                    <th className="px-4 py-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {administrators.map((admin, index) => (
                    <tr
                      key={admin.id}
                      className="border-b hover:bg-gray-300 dark:hover:bg-gray-700 border-gray-600"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium textwhite">
                        <input
                          type="text"
                          name="fullName"
                          value={admin.fullName}
                          onChange={(e) => handleInputChange(e, index)}
                          className="input mb-0"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium textwhite">
                        <input
                          type="text"
                          name="email"
                          value={admin.email}
                          onChange={(e) => handleInputChange(e, index)}
                          className="input mb-0"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium textwhite">
                      <div className='relative'>
                    <input
                      type={showPassword[admin.id] ? "text" : "password"}
                      name="new_password"
                      value={admin.new_password}
                      onChange={(e) => handleInputChange(e, index)}
                      className="input mb-0"
                    />
                    <button 
                      onClick={() => handleShowPassword(admin.id)}  
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400"
                    >
                      {showPassword[admin.id] ? <FaEyeSlash/> : <FaEye/> }
                    </button>
                  </div>
                        
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium textwhite">
                        <button
                          className='bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded mr-2'
                          onClick={() => togglePermissionVisibility(admin.id)}
                        >
                          {showPermissionUserId === admin.id ? <FaEyeSlash /> : <FaEye />}
                        </button>

                        {showPermissionUserId === admin.id && (
                          <div className="grid items-center">
                            <label className="flex items-center text-sm font-medium leading-6 textwhite mr-4">
                              <input
                                type="checkbox"
                                name="isAdmin"
                                checked={admin.isAdmin}
                                onChange={(e) => handleCheckboxChange(e, index)}
                                className="form-checkbox h-4 w-4 text-blue-600 transition duration-150 ease-in-out"
                              />
                              <span className="ml-2">Admin</span>
                            </label>
                            <label className="flex items-center text-sm font-medium leading-6 textwhite mr-4">
                              <input
                                type="checkbox"
                                name="processWrite"
                                checked={admin.processWrite}
                                onChange={(e) => handleCheckboxChange(e, index)}
                                className="form-checkbox h-4 w-4 text-blue-600 transition duration-150 ease-in-out"
                              />
                              <span className="ml-2">Process Write</span>
                            </label>
                            <label className="flex items-center text-sm font-medium leading-6 textwhite mr-4">
                              <input
                                type="checkbox"
                                name="processRead"
                                checked={admin.processRead}
                                onChange={(e) => handleCheckboxChange(e, index)}
                                className="form-checkbox h-4 w-4 text-blue-600 transition duration-150 ease-in-out"
                              />
                              <span className="ml-2">Process Read</span>
                            </label>
                            <label className="flex items-center text-sm font-medium leading-6 textwhite mr-4">
                              <input
                                type="checkbox"
                                name="serverWrite"
                                checked={admin.serverWrite}
                                onChange={(e) => handleCheckboxChange(e, index)}
                                className="form-checkbox h-4 w-4 text-blue-600 transition duration-150 ease-in-out"
                              />
                              <span className="ml-2">Server Write</span>
                            </label>
                            <label className="flex items-center text-sm font-medium leading-6 textwhite">
                              <input
                                type="checkbox"
                                name="serverRead"
                                checked={admin.serverRead}
                                onChange={(e) => handleCheckboxChange(e, index)}
                                className="form-checkbox h-4 w-4 text-blue-600 transition duration-150 ease-in-out"
                              />
                              <span className="ml-2">Server Read</span>
                            </label>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap flex text-sm font-medium textwhite">
                        <button
                          onClick={() => handleEditClick(admin)}
                          className="bg-blue-500 m-1 hover:bg-blue-600 hover:scale-110 relative text-white font-bold py-2 px-4 rounded flex items-center"
                        >
                          <FontAwesomeIcon icon={faEdit} />
                          {updatingUserId === admin.id && (
                            <span className="inline-block ml-2 animate-spin"><FaSpinner /></span>
                          )}
                        </button>
                        <button
                          onClick={() => openDeleteConfirmation(admin.id, admin.fullName)}
                          className="bg-red-500 hover:bg-red-600 hover:scale-110 relative text-white font-bold py-2 px-4 rounded flex m-1 items-center"
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {deleteUserId && (
            <div className="fixed inset-0 flex items-center justify-center z-50">
              <div className="absolute inset-0 bg-gray-900 opacity-50"></div>
              <div className="graybg rounded-lg p-6 z-10">
                <h2 className="text-xl font-bold mb-4">Confirm Delete</h2>
                <p className="mb-4 ">
                  Are you sure you want to delete the user<strong > "{deleteUserName}" </strong> ?
                </p>
                <div className="flex justify-end">
                  <button
                    onClick={() => {
                      handleDelete(deleteUserId);
                      closeDeleteConfirmation();
                    }}
                    className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded mr-2"
                  >
                    Yes
                    {isSubmit && <span className="inline-block ml-2 animate-spin"><FaSpinner /></span>}
                  </button>
                  <button
                    onClick={closeDeleteConfirmation}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-2 px-4 rounded "
                  >
                    No
                  </button>

                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}