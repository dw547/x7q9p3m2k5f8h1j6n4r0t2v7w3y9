import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Application from "./pages/Application";
import Login from "./pages/Login";
import Dashboard from "./pages/DashBoard";
import DataValueCreater from "./datatable/DataValueCreater";
import Navbar from "./pages/Navbar";
import ProcessDetailFile from "./components/ProcessDetailFile";
import CreateProcessNew from "./pages/CreateProcessNew";
import AddServer from "./pages/AddServer";
import EditProcess from "./pages/EditProcess";
import CpuData from "./pages/CpuData";
import Sidebar from "./pages/Sidebar";
import TestProcess from "./pages/TestProcess";
import { fetchToken, onMessageListener, requestNotificationPermission } from "./firebase";
import { FiX } from "react-icons/fi";
import axios from "axios";
import CopyProcess from './pages/CopyProcess'
import Migration from "./pages/Migration";
import UA from "./pages/UA";
import Incomming from "./pages/Incomming";
import VPN from "./pages/VPN";
import Adminstrator from "./pages/Adminstrator";
import Link from "./pages/Link";
import AddAdmin from "./components/AddAdmin"
import IpList from "./pages/IpList";
import Income from "./pages/Income"
import EditUA from "./components/EditUA";
import Header from "./components/Header";
import User from "./pages/User";
import NewIncoming from "./pages/NewIncoming";
import TestCreateProcess from "./components/TestCreateProces"
import ServerUsage from "./components/ServerUsage";
import ClickLog from "./pages/ClickLog";
import IncomingMain from "./pages/IncomingMain";
import SshLog from "./pages/SshLog";
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("token");
      window.location.replace("/login");
    }
    return Promise.reject(error);
  }
);

const ProtectedRoute = ({ element: Element, requiredPermission, ...rest }) => {
  const isAdmin = localStorage.getItem('admin') === 'true';
  const userPermissions = JSON.parse(localStorage.getItem('userPermissions') || '{}');

  const hasPermission = () => {
    if (isAdmin) return true;
    if (!requiredPermission) return true;   
    return userPermissions[requiredPermission];
  };

  if (!hasPermission()) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Element {...rest} />;
};

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
  const [notification, setNotification] = useState({ title: "", body: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setIsSidebarCollapsed(true);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    const checkTokenExpiration = () => {
      const token = localStorage.getItem("token");
      if (token) {
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
      }
      setIsLoading(false);
    };

    checkTokenExpiration();
  }, []);

  useEffect(() => {
    requestNotificationPermission();
    fetchToken();
  }, []);

  useEffect(() => {
    const storedDarkMode = localStorage.getItem('darkMode');
    if (storedDarkMode !== null) {
      setIsDarkMode(storedDarkMode === 'true');
    }
  }, []);

  onMessageListener().then((payload) => {
    console.log(payload);
    setNotification({
      title: payload.data.title,
      body: payload.data.body,
    });
    const options = {
      body: payload.data.body,
    };
    new Notification(payload.data.title, options);
  });

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem('darkMode', newMode.toString());
  };
  return (
    <BrowserRouter>
      {isLoggedIn && (
        <div className={`flex h-screen ${isDarkMode ? "" : "dark"}`}> 
          <Sidebar
            isSidebarCollapsed={isSidebarCollapsed}
            toggleSidebar={toggleSidebar}
          />
          <div className={`flex-1 overflow-y-auto transition-all duration-300 ease-in-out ${isSidebarCollapsed ? "ml-14" : "ml-64"} ${isDarkMode ? "dark:bg-zinc-800" : "bg-zinc-800"}`}>

            <Navbar isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
            <div className="p-4 md:p-8 bg-gray-200 dark:bg-zinc-800">
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/tabledata" element={<DataValueCreater />} />
                <Route path="/cpudata" element={<CpuData />} />
                <Route path="/migration" element={<Migration />} />
                <Route path="/viewprocess" element={<ProcessDetailFile/>} />
                <Route path="/user" element={<User/>} />
                <Route path="/editprocess" element={<EditProcess/>} />
                <Route path="/copyprocess"  element={<CopyProcess/>} />
                {/* Protected routes */}
                <Route path="/application" element={<ProtectedRoute element={Application} requiredPermission="admin" />} />
                <Route path="/process" element={<ProtectedRoute element={CreateProcessNew} requiredPermission="process_write" />} />
                <Route path="/addserver" element={<ProtectedRoute element={AddServer} requiredPermission="admin" />} />
                <Route path="/testprocess" element={<ProtectedRoute element={TestProcess} requiredPermission="admin" />} />
                <Route path="/ua" element={<ProtectedRoute element={UA} requiredPermission="admin" />} />
                {/* <Route path="/incomming" element={<ProtectedRoute element={Incomming} requiredPermission="admin" />} /> */}
                <Route path="/incomming" element={<ProtectedRoute element={IncomingMain} requiredPermission="admin" />} />
                <Route path="/vpn" element={<ProtectedRoute element={VPN} requiredPermission="admin" />} />
                <Route path="/admin" element={<ProtectedRoute element={Adminstrator} requiredPermission="admin" />} />
                <Route path="/link" element={<ProtectedRoute element={Link} requiredPermission="admin" />} />
                <Route path="/iplist" element={<ProtectedRoute element={IpList} requiredPermission="admin" />} />
                <Route path="/addadmin" element={<ProtectedRoute element={AddAdmin} requiredPermission="admin" />} />
                <Route path="/income" element={<ProtectedRoute element={Income} requiredPermission="admin" />} />
                <Route path="/edit-ua/:id" element={<ProtectedRoute element={EditUA} requiredPermission="admin" />} />
                <Route path="/newincoming" element={<ProtectedRoute element={NewIncoming} requiredPermission="admin" />} />
                 <Route path="/testcreate" element={<ProtectedRoute element={TestCreateProcess} requiredPermission="admin" />} />
                 <Route path="/serverusage" element={<ProtectedRoute element={ServerUsage} requiredPermission="admin" />} />
                 <Route path="/clicklog" element={<ProtectedRoute element={ClickLog} requiredPermission="admin" />} />
                <Route path="/header" element={<ProtectedRoute element={Header} requiredPermission="admin" />} />
                <Route path="/sshlog" element={<ProtectedRoute element={SshLog} requiredPermission="admin" />} />
              </Routes>
            </div>
          </div>
        </div>
      )}
      {!isLoggedIn && (
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      )}
      {notification.title && (
        <div className="fixed bottom-4 right-4 bg-blue-500 text-white p-4 rounded shadow">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold">{notification.title}</h3>
              <p>{notification.body}</p>
            </div>
            <button
              onClick={() => setNotification({ title: "", body: "" })}
              className="textwhite hover:text-gray-300 focus:outline-none"
            >
              <FiX size={20} />
            </button>
          </div>
        </div>
      )}
    </BrowserRouter>
  );
}

export default App;