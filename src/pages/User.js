import React from 'react';
import { safeJsonParse } from '../utils/jsonUtils';

export default function User() {
  const getUserName = () => {
    return localStorage.getItem('userName') || '';
  };

  const getUserEmail = () => {
    return localStorage.getItem('userEmail') || '';
  };

  const isAdmin = () => {
    return localStorage.getItem('admin') === 'true';
  };

  const getUserPermissions = () => {
    return safeJsonParse(localStorage.getItem('userPermissions'), {});
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="main-div shadow-lg rounded-lg p-6 w-96">
        <div className="text-center">
          <h3 className="text-2xl font-bold mb-4 textwhite">User Information</h3>
          <div className="mb-4">
            <p className="textwhite">
              <strong>User Name : &nbsp; {getUserName()} </strong> 
            </p>
          </div>
          <div className="mb-4">
            <p className="textwhite">
              <strong>Email : &nbsp;{getUserEmail()} </strong> 
            </p>
          </div>
          {/* Uncomment if needed
          <div className="mb-4">
            <p className="textwhite">
              <strong>Is Admin : &nbsp;{isAdmin() ? 'Yes' : 'No'} </strong> 
            </p>
          </div>
          <div>
            <p className="text-gray-600 dark:text-gray-400 mb-2">
              <strong>Permissions:</strong>
            </p>
            <ul className="text-left ml-8">
              {Object.entries(getUserPermissions()).map(([key, value]) => (
                <li key={key} className="text-gray-600 dark:text-gray-400">
                  {key}: {value.toString()}
                </li>
              ))}
            </ul>
          </div>
          */}
        </div>
      </div>
    </div>
  );
}