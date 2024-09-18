import React, { useEffect, useState } from "react";
import { FaRightFromBracket, FaUser } from "react-icons/fa6";
import { FiSun, FiMoon } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const Navbar = ({ isDarkMode, toggleDarkMode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
const navigate =useNavigate();

  useEffect(() => {
    const storedServer = localStorage.getItem("token");
    if (storedServer) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
  }, []);

  useEffect(() => {
  }, []);

 
  const logOut = () => {
    localStorage.removeItem("token");
    window.location.replace("/");
  };

  const moveUser =()=>{
    navigate('/user')
  }

  return (
    <div className="flex justify-between items-center bg-gray-100 dark:bg-gray-900 text-white h-16">
      <div className="ml-4"></div>
      {isLoggedIn ? (
        <div className="mr-4 flex items-center">
          <div className="relative ml-4 group">
            <button
              onClick={toggleDarkMode}
              className="relative px-4 py-2 m-1 sm:py-3 sm:px-6 bg-label rounded-lg hover:scale-110 bg-blue-600 dark:bg-gray-700 dark:text-white"
            >
              {isDarkMode ? <FiMoon className="relative" /> : <FiSun className="relative z-10" />}
            </button>
            <span className="absolute left-1/2 transform -translate-x-1/2 mt-14 text-sm text-transparent group-hover:textwhite group-hover:dark:text-white">
              {isDarkMode ? 'Dark' : 'Light'}
            </span>
          </div>
          <div className="relative group">
            <button
              onClick={logOut}
              className="relative m-1 px-4 py-2 sm:py-3 sm:px-6 bg-label rounded-lg hover:scale-110 bg-blue-600 dark:bg-gray-700 dark:text-white"
            >
              <FaRightFromBracket className="relative " />
            </button>
            <span className="absolute left-1/2 transform -translate-x-1/2 mt-14 text-sm text-transparent group-hover:textwhite group-hover:dark:text-white">
              Logout
            </span>
          </div>

          <div className="relative group">
          <button
          onClick={moveUser}
          className="relative m-1 px-4 py-2 sm:py-3 sm:px-6 bg-label rounded-lg hover:scale-110 bg-blue-600 dark:bg-gray-700 dark:text-white"
        >
          <FaUser />
        </button>
            <span className="absolute left-1/2 transform -translate-x-1/2 mt-14 text-sm text-transparent group-hover:textwhite group-hover:dark:text-white">
              user
            </span>
          </div>

      
        </div>
      ) : (
        ""
      )}
    </div>
  );
};

export default Navbar;