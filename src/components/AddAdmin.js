import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaSpinner } from 'react-icons/fa';

const AddAdmin = () => {
  const [isSubmit, setIsSubmit] = useState(false);
  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    password: "",
    confirmPassword: "",
    isAdmin: false,
    processWrite: false,
    processRead: false,
    serverWrite: false,
    serverRead: false,
  });

  const [errors, setErrors] = useState({
    fullname: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const navigate = useNavigate();

  const validateForm = () => {
    let valid = true;
    let newErrors = { fullname: "", email: "", password: "", confirmPassword: "" };

    if (!formData.fullname) {
      newErrors.fullname = "Fullname is required";
      valid = false;
    }
    if (!formData.email) {
      newErrors.email = "Email is required";
      valid = false;
    }
    if (!formData.password) {
      newErrors.password = "Password is required";
      valid = false;
    }
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Confirm Password is required";
      valid = false;
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      return;
    }
    setIsSubmit(true);
    axios
      .post(
        `${process.env.REACT_APP_API_URI}/create-user`,
        {
          fullName: formData.fullname,
          email: formData.email,
          password: formData.password,
          is_admin: formData.isAdmin,
          process_write: formData.processWrite,
          process_read: formData.processRead,
          server_write: formData.serverWrite,
          server_read: formData.serverRead,
        },
        {
          headers: {
            Authorization: JSON.parse(localStorage.getItem("token")),
          },
        }
      )
      .then(function (response) {
        console.log(response);
        if (response.status === 201) {
          setIsSubmit(false);
          alert("Submitted successfully");
          navigate("/admin");
          window.location.reload();
        }
      })
      .catch(function (error) {
        console.log(error);
        if (error.response && error.response.status === 401) {
          setIsSubmit(false);
          navigate("/");
        } else {
          setIsSubmit(false);
          alert("Unable to submit");
        }
      });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: checked,
      ...(name === 'isAdmin' && checked && {
        processWrite: true,
        processRead: true,
        serverWrite: true,
        serverRead: true,
      }),
      ...(name === 'processWrite' && checked && { processRead: true }),
      ...(name === 'serverWrite' && checked && { serverRead: true }),
    }));
  };

  return (
    <div className="flex flex-col h-screen">
      <main className="flex-1 px-6 py-8">
        <div className="graybg rounded-md shadow-md p-6">
          <h2 className="text-2xl textwhite font-bold text-center mb-6">Create New User</h2>

          <form>
            <div className="sm:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="mb-4">
                <label className="block text-gray-700 textwhite font-bold mb-2" htmlFor="fullname">
                  Fullname
                </label>
                <input
                  className={`input ${errors.fullname ? 'border-red-500' : ''}`}
                  id="fullname"
                  name="fullname"
                  type="text"
                  required
                  placeholder="Enter Full Name"
                  onChange={handleInputChange}
                  value={formData.fullname}
                />
                {errors.fullname && <p className="text-red-500 text-xs italic">{errors.fullname}</p>}
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 textwhite font-bold mb-2" htmlFor="email">
                  Email
                </label>
                <input
                  className={`input ${errors.email ? 'border-red-500' : ''}`}
                  id="email"
                  name="email"
                  required
                  type="text"
                  placeholder="user@gmail.com"
                  onChange={handleInputChange}
                  value={formData.email}
                />
                
                {errors.email && <p className="text-red-500 text-xs italic">{errors.email}</p>}
              </div>
            </div>

            <div className="sm:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="mb-4">
                <label className="block text-gray-700 textwhite font-bold mb-2" htmlFor="password">
                  New Password
                </label>
                <input
                  className={`input ${errors.password ? 'border-red-500' : ''}`}
                  id="password"
                  name="password"
                  type="password"
                  required
                  placeholder="Password"
                  onChange={handleInputChange}
                  value={formData.password}
                />
                {errors.password && <p className="text-red-500 text-xs italic">{errors.password}</p>}
              </div>

              <div className="mb-6">
                <label className="block text-gray-700 textwhite font-bold mb-2" htmlFor="confirmPassword">
                  Confirm Password
                </label>
                <input
                  className={`input ${errors.confirmPassword ? 'border-red-500' : ''}`}
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="Confirm Password"
                  onChange={handleInputChange}
                  value={formData.confirmPassword}
                />
                {errors.confirmPassword && <p className="text-red-500 text-xs italic">{errors.confirmPassword}</p>}
              </div>
            </div>
            <div><p className='block text-gray-700 textwhite font-bold mb-2'>Permissions</p></div>
            <div className="sm:col-span-6 grid grid-cols-1 sm:grid-cols-5 gap-4">

              <label className="flex items-center text-sm font-medium leading-6 textwhite">
                <input
                  type="checkbox"
                  name="isAdmin"
                  checked={formData.isAdmin}
                  onChange={handleCheckboxChange}
                  className="form-checkbox h-4 w-4 text-blue-600 transition duration-150 ease-in-out"
                />
                <span className="ml-2">is_admin</span>
              </label>

              <label className="flex items-center text-sm font-medium leading-6 textwhite">
                <input
                  type="checkbox"
                  name="processWrite"
                  checked={formData.processWrite}
                  onChange={handleCheckboxChange}
                  className="form-checkbox h-4 w-4 text-blue-600 transition duration-150 ease-in-out"
                />
                <span className="ml-2">process_write</span>
              </label>

              <label className="flex items-center text-sm font-medium leading-6 textwhite">
                <input
                  type="checkbox"
                  name="processRead"
                  checked={formData.processRead}
                  onChange={handleCheckboxChange}
                  className="form-checkbox h-4 w-4 text-blue-600 transition duration-150 ease-in-out"
                />
                <span className="ml-2">process_read</span>
              </label>

              <label className="flex items-center text-sm font-medium leading-6 textwhite">
                <input
                  type="checkbox"
                  name="serverWrite"
                  checked={formData.serverWrite}
                  onChange={handleCheckboxChange}
                  className="form-checkbox h-4 w-4 text-blue-600 transition duration-150 ease-in-out"
                />
                <span className="ml-2">server_write</span>
              </label>

              <label className="flex items-center text-sm font-medium leading-6 textwhite">
                <input
                  type="checkbox"
                  name="serverRead"
                  checked={formData.serverRead}
                  onChange={handleCheckboxChange}
                  className="form-checkbox h-4 w-4 text-blue-600 transition duration-150 ease-in-out"
                />
                <span className="ml-2">server_read</span>
              </label>
            </div>

            <div className="flex justify-center">
              <button
                onClick={handleSubmit}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 mt-4 w-80 rounded"
                type="button"
              >
                Create User
                {isSubmit && <span className="inline-block ml-2 animate-spin"><FaSpinner /></span>}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default AddAdmin;
