import React, { useState } from "react";

const TimeDropdown = () => {
  const [selectedTime, setSelectedTime] = useState(10);

  const handleTimeChange = (e) => {
    setSelectedTime(parseInt(e.target.value, 10));
  };

  const renderTimeOptions = () => {
    const options = [];
    for (let i = 10; i <= 420; i += 10) {
      const hours = Math.floor(i / 60);
      const minutes = i % 60;
      const label = `${hours} hours ${minutes} minutes`;
      options.push(
        <option key={i} value={i}>
          {label}
        </option>
      );
    }
    return options;
  };

  return (
    <div>
      <label
        style={{ color: "red", fontWeight: "bold" }}
        htmlFor="timeDropdown"
      >
        Select Cron Time :{" "}
      </label>
      <select
        style={{ fontSize: "1rem", fontWeight: "bold", height: "2rem" }}
        id="timeDropdown"
        onChange={handleTimeChange}
        value={selectedTime}
      >
        {renderTimeOptions()}
      </select>

      <p style={{ color: "red", fontWeight: "bold" }}>
        Selected Cron Time: {Math.floor(selectedTime / 60)} hours{" "}
        {selectedTime % 60} minutes
      </p>
    </div>
  );
};

export default TimeDropdown;
