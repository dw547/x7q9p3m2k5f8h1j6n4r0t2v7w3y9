import React, { useState } from 'react';
import Incoming from './Incomming';
import IncomingTable from './IncomingTableView';

export default function IncomingMain() {
  const [showTableView, setShowTableView] = useState(false);

  const toggleView = () => {
    setShowTableView(!showTableView);
  };

  return (
    <div className="">
      <button 
        onClick={toggleView}
        className="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
      >
        {showTableView ? "Text View" : "Table View"}
      </button>
      
      {showTableView ? <IncomingTable /> : <Incoming />}
    </div>
  );
}