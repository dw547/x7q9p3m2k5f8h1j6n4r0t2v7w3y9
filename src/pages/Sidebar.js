import React, { useEffect, useState } from "react";
import { AiFillDashboard } from "react-icons/ai";
import { FaBlogger, FaBookOpen, FaEdit,  FaHandPointRight,  FaHeadSideVirus,  FaMagnet, FaPlusCircle, FaServer, FaUser } from "react-icons/fa";
import {  FaComputer, FaFileImport,  FaJetFighterUp, FaLink, FaPlaneCircleCheck, FaRectangleList, FaRightToBracket, FaShareFromSquare } from "react-icons/fa6";
import { FiMenu, FiToggleLeft } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { safeJsonParse } from "../utils/jsonUtils";

const Sidebar = ({ isSidebarCollapsed, toggleSidebar }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [hoveredTitle, setHoveredTitle] = useState("");
  const [userPermissions, setUserPermissions] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedPermissions = localStorage.getItem("userPermissions");
    
    if (storedToken) {
      setIsLoggedIn(true);
      setUserPermissions(safeJsonParse(storedPermissions, {}));
    } else {
      setIsLoggedIn(false);
    }
  }, []);

  const handleLinkClick = (path) => {
    navigate(path);
    if (!isSidebarCollapsed) {
      toggleSidebar();
    }
  };

  if (!isLoggedIn) {
    return null;
  }

  const hasPermission = (permission) => {
    return userPermissions[permission];
  };

  const isAdmin = () => {
    return localStorage.getItem('admin') === 'true';
  };

  return (
    <>
      <div
        className={`bg-gray-100 dark:bg-gray-900 textwhite fixed top-0 left-0 h-screen z-10 transition-all duration-300 ease-in-out ${isSidebarCollapsed ? "w-14" : "w-64"
          }`}
      >
        <div className="flex items-center justify-between h-16 bg-gray-100 dark:bg-gray-900 px-4">
          <button className="textwhite" onClick={toggleSidebar}>
            {isSidebarCollapsed ? (
              <FiMenu size={24} />
            ) : (
              <FiToggleLeft size={24} />
            )}
          </button>
          {!isSidebarCollapsed && (
            <div className="text-xl font-semibold">Ad Server</div>
          )}
        </div>
        <nav className="mt-2 overflow-hidden">
          <ul className="space-y-2 overflow-y-auto pr-2 h-[calc(100vh-4rem)] scrollbar-hide">
            <li className="px-4 py-2 text-gray-900 dark:text-gray-100 dark:hover:graybg hover:bg-gray-300 rounded-md">
              <button
                className="flex items-center"
                title="Dashboard"
                onMouseEnter={() => setHoveredTitle("Dashboard")}
                onMouseLeave={() => setHoveredTitle("")}
                onClick={() => handleLinkClick("/dashboard")}
              >
                <AiFillDashboard size={24} />
                {!isSidebarCollapsed && <span className="ml-2">Dashboard</span>}
              </button>
            </li>
            {hasPermission("process_write") && (
              <li className="px-4 py-2 text-gray-900 dark:text-gray-100 dark:hover:graybg hover:bg-gray-300 rounded-md">
                <button
                  className="flex items-center"
                  title="Create New Process"
                  onMouseEnter={() => setHoveredTitle("Create New Process")}
                  onMouseLeave={() => setHoveredTitle("")}
                  onClick={() => handleLinkClick("/process")}
                >
                  <FaPlusCircle size={24} />
                  {!isSidebarCollapsed && (
                    <span className="ml-2">Create New Process</span>
                  )}
                </button>
              </li>
            )}
            {isAdmin() && (
              <li className="px-4 py-2 text-gray-900 dark:text-gray-100 dark:hover:graybg hover:bg-gray-300 rounded-md">
                <button
                  className="flex items-center"
                  title="Add/Update Hardmask"
                  onMouseEnter={() => setHoveredTitle("Add/Update Hardmask")}
                  onMouseLeave={() => setHoveredTitle("")}
                  onClick={() => handleLinkClick("/application")}
                >
                  <FaEdit size={24} />
                  {!isSidebarCollapsed && (
                    <span className="ml-2">Add/Update Hardmask</span>
                  )}
                </button>
              </li>)}
            <li className="px-4 py-2 text-gray-900 dark:text-gray-100 dark:hover:graybg hover:bg-gray-300 rounded-md">
              <button
                className="flex items-center"
                title="Process Migration"
                onMouseEnter={() => setHoveredTitle("Process Migration")}
                onMouseLeave={() => setHoveredTitle("")}
                onClick={() => handleLinkClick("/migration")}
              >
                <FaShareFromSquare size={24} />
                {!isSidebarCollapsed && (
                  <span className="ml-2">Process Migration</span>
                )}
              </button>
            </li>
            <li className="px-4 py-2 text-gray-900 dark:text-gray-100 dark:hover:graybg hover:bg-gray-300 rounded-md">
              <button
                className="flex items-center"
                title="URL Data"
                onMouseEnter={() => setHoveredTitle("URL Data")}
                onMouseLeave={() => setHoveredTitle("")}
                onClick={() => handleLinkClick("/tabledata")}
              >
                <FaBookOpen size={24} />
                {!isSidebarCollapsed && <span className="ml-2">URL Data</span>}
              </button>
            </li> 
            {hasPermission("server_write") && hasPermission("server_read") &&(
            <li className="px-4 py-2 text-gray-900 dark:text-gray-100 dark:hover:graybg hover:bg-gray-300 rounded-md">
              <button
                className="flex items-center"
                title="CPU Usage"
                onMouseEnter={() => setHoveredTitle("CPU Usage")}
                onMouseLeave={() => setHoveredTitle("")}
                onClick={() => handleLinkClick("/cpudata")}
              >
                <FaComputer size={24} />
                {!isSidebarCollapsed && <span className="ml-2">CPU Usage</span>}
              </button>
            </li> )}
            {isAdmin() && (
              <li className="px-4 py-2 text-gray-900 dark:text-gray-100 dark:hover:graybg hover:bg-gray-300 rounded-md">
                <button
                  className="flex items-center"
                  title="Interface Log"
                  onMouseEnter={() => setHoveredTitle("Interface Log")}
                  onMouseLeave={() => setHoveredTitle("")}
                  onClick={() => handleLinkClick("/iplist")}
                >
                  <FaRectangleList size={24} />
                  {!isSidebarCollapsed && (
                    <span className="ml-2">Interface Log</span>
                  )}
                </button>
              </li>)}
            {isAdmin() && (
              <li className="px-4 py-2 text-gray-900 dark:text-gray-100 dark:hover:graybg hover:bg-gray-300 rounded-md">
                <button
                  className="flex items-center"
                  title="User Agent"
                  onMouseEnter={() => setHoveredTitle("User Agent")}
                  onMouseLeave={() => setHoveredTitle("")}
                  onClick={() => handleLinkClick("/ua")}
                >
                  <FaMagnet size={24} />
                  {!isSidebarCollapsed && <span className="ml-2">UA</span>}
                </button>
              </li>)}

            <li className="px-4 py-2 text-gray-900 dark:text-gray-100 dark:hover:graybg hover:bg-gray-300 rounded-md">
              <button
                className="flex items-center"
                title="New Incoming"
                onMouseEnter={() => setHoveredTitle("New Incomimg")}
                onMouseLeave={() => setHoveredTitle("")}
                onClick={() => handleLinkClick("/newincoming")}
              >
                <FaRightToBracket size={24} />
                {!isSidebarCollapsed && <span className="ml-2">New Incoming</span>}
              </button>
            </li>

            {isAdmin() && (
              <li className="px-4 py-2 text-gray-900 dark:text-gray-100 dark:hover:graybg hover:bg-gray-300 rounded-md">
                <button
                  className="flex items-center"
                  title="Incomming"
                  onMouseEnter={() => setHoveredTitle("Incomming")}
                  onMouseLeave={() => setHoveredTitle("")}
                  onClick={() => handleLinkClick("/incomming")}>
                  <FaFileImport size={24} />
                  {!isSidebarCollapsed && <span className="ml-2">Incomming</span>}
                </button>
              </li>)}

              {isAdmin() && (
              <li className="px-4 py-2 text-gray-900 dark:text-gray-100 dark:hover:graybg hover:bg-gray-300 rounded-md">
                <button
                  className="flex items-center"
                  title="Click Server log"
                  onMouseEnter={() => setHoveredTitle("Click Server Log")}
                  onMouseLeave={() => setHoveredTitle("")}
                  onClick={() => handleLinkClick("/clicklog")}>
                  <FaHandPointRight size={24} />
                  {!isSidebarCollapsed && <span className="ml-2">Click Server Log</span>}
                </button>
              </li>)}
     
     
            {isAdmin() && (
              <li className="px-4 py-2 text-gray-900 dark:text-gray-100 dark:hover:graybg hover:bg-gray-300 rounded-md">
                <button
                  className="flex items-center"
                  title="Add Server"
                  onMouseEnter={() => setHoveredTitle("Add Server")}
                  onMouseLeave={() => setHoveredTitle("")}
                  onClick={() => handleLinkClick("/addserver")} >
                  <FaServer size={24} />
                  {!isSidebarCollapsed && <span className="ml-2">Add Server</span>}
                </button>
              </li>)}
            {isAdmin() && (
              <li className="px-4 py-2 text-gray-900 dark:text-gray-100 dark:hover:graybg hover:bg-gray-300 rounded-md">
                <button
                  className="flex items-center"
                  title="VPN"
                  onMouseEnter={() => setHoveredTitle("VPN")}
                  onMouseLeave={() => setHoveredTitle("")}
                  onClick={() => handleLinkClick("/vpn")} >
                  <FaJetFighterUp size={24} />
                  {!isSidebarCollapsed && <span className="ml-2">VPN</span>}
                </button>
              </li>
            )}
           {isAdmin() && (   <li className="px-4 py-2 text-gray-900 dark:text-gray-100 dark:hover:graybg hover:bg-gray-300 rounded-md">
                <button
                  className="flex items-center"
                  title="Header"
                  onMouseEnter={() => setHoveredTitle("Header")}
                  onMouseLeave={() => setHoveredTitle("")}
                  onClick={() => handleLinkClick("/header")} >
                  <FaHeadSideVirus size={24} />
                  {!isSidebarCollapsed && <span className="ml-2">Header</span>}
                </button>
              </li> )}
              {isAdmin() && (
              <li className="px-4 py-2 text-gray-900 dark:text-gray-100 dark:hover:graybg hover:bg-gray-300 rounded-md">
                <button
                  className="flex items-center"
                  title="SSH Log"
                  onMouseEnter={() => setHoveredTitle("SSH Log")}
                  onMouseLeave={() => setHoveredTitle("")}
                  onClick={() => handleLinkClick("/sshlog")}
                >
                  <FaBlogger size={24} />
                  {!isSidebarCollapsed && (
                    <span className="ml-2">SSH Log</span>
                  )}
                </button>
              </li>
            )}
            {isAdmin() && (
              <li className="px-4 py-2 text-gray-900 dark:text-gray-100 dark:hover:graybg hover:bg-gray-300 rounded-md">
                <button
                  className="flex items-center"
                  title="Administrator"
                  onMouseEnter={() => setHoveredTitle("Administrator")}
                  onMouseLeave={() => setHoveredTitle("")}
                  onClick={() => handleLinkClick("/admin")}
                >
                  <FaUser size={24} />
                  {!isSidebarCollapsed && (
                    <span className="ml-2">Administrator</span>
                  )}
                </button>
              </li>
            )}
          </ul>
        </nav>
      </div>
      {isSidebarCollapsed && hoveredTitle && (
        <div className="fixed left-16 mt-1 px-2 py-1 bg-gray-800 text-white text-sm rounded shadow-md z-20">
          {hoveredTitle}
        </div>
      )}
    </>
  );
};

export default Sidebar;