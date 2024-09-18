import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaSpinner } from "react-icons/fa";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      window.location.replace("/dashboard");
    }
  }, []);

  const appHandle = () => {
    setIsSubmitting(true);
    axios
      .post(`${process.env.REACT_APP_API_URI}/login`, {
        email,
        password,
      })
      .then(function (response) {
        console.log('API Response:', response.data);
        if (response.data.token) {
          localStorage.setItem("token", JSON.stringify(response.data.token));
          localStorage.setItem("userName", response.data.user.name);
          localStorage.setItem("userEmail", response.data.user.email);
          localStorage.setItem("admin", response.data.user.admin);
          
          const userPermissions = {
            process_read: response.data.user.process_read,
            process_write: response.data.user.process_write,
            server_read: response.data.user.server_read,
            server_write: response.data.user.server_write
          };
          localStorage.setItem("userPermissions", JSON.stringify(userPermissions));
  
          window.location.replace("/dashboard");
          setIsSubmitting(false);
        } else {
          setError("Invalid credentials, Please try again.");
          setIsSubmitting(false);
        }
      })
      .catch(function (error) {
        console.log(error);
        setError("Invalid User, Please try again");
        setIsSubmitting(false);
      });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="flex justify-center bg-gray-700 items-center h-screen zincbg">
      <div className="rounded-sm border bg-gray-700 border-stroke graybg shadow-default dark:border-strokedark dark:bg-boxdark w-full max-w-md p-8">
        <h1 className="text-3xl font-bold text-white dark:textwhite mb-8 text-center">
          Sign In to Your Account
        </h1>

        <form>
          <div className="mb-6">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2"
            >
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className="input w-full"
              placeholder="Enter your email address"
              onChange={(e) => setEmail(e.target.value)}
              value={email}
            />
          </div>

          <div className="mb-6 relative">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2"
            >
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                className="input w-full pr-10"
                placeholder="Enter your password"
                onChange={(e) => setPassword(e.target.value)}
                value={password}
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute inset-y-0 right-0 pr-3 mb-4 flex items-center"
              >
                <FontAwesomeIcon
                  icon={showPassword ? faEyeSlash : faEye}
                  className="text-gray-400"
                />
              </button>
            </div>
          </div>

          <div className="mb-6 flex justify-between items-center">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="remember"
                name="remember"
                className="h-4 w-4 bg-indigo-500 focus:ring-indigo-400 border-gray-300 rounded"
              />
              <label
                htmlFor="remember"
                className="ml-2 block text-sm text-white dark:text-gray-400"
              >
                Remember me
              </label>
            </div>
          </div>

          {error && (
            <p className="text-red-500 mt-2 text-sm text-center">{error}</p>
          )}
          <br />
          <button
            type="button"
            onClick={appHandle}
            className="w-full bg-indigo-600 textwhite py-2 rounded-md focus:ring-2 text-white focus:ring-indigo-400 focus:ring-opacity-75"
          >
            Sign In
            {isSubmitting && (
              <span className="inline-block ml-2 animate-spin">
                <FaSpinner />
              </span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;