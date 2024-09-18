import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaSpinner } from "react-icons/fa";

export default function AddServer() {

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [appValue, setAppValue] = useState({
    servername: "",
    serverip: "",
    portnumber: "",
  });
  const navigate = useNavigate();

  const onSubmit = () => {
    setIsSubmitting(true);
    axios
      .post(
        `${process.env.REACT_APP_API_URI}/add-server`,
        {
          server_name: appValue.servername,
          server_ip: appValue.serverip,
          server_port: appValue.portnumber,
        },
        {
          headers: {
            Authorization: JSON.parse(localStorage.getItem("token")),
          },
        }
      )
      .then(function (response) {
        console.log(response);
        if (response.status === 200) {
          setIsSubmitting(false);
          alert("server created successfully");
          navigate("/dashboard");
          window.location.reload();
        }
      })
      .catch(function (error) {
        console.log(error);
        if (error.response && error.response.status === 401) {
          navigate("/login");
        } else {
          alert("Unable to create server");
        }
      });
  };

  return (
    <div className="flex items-center justify-center  zincbg">
      <div className="max-w-4xl w-full p-8  graybg rounded-md mt-10">
        <div className="text-center mb-8">
          <h3 className="textwhite text-lg">Add Server</h3>
        </div>
        <form onSubmit={onSubmit} className="grid gap-4">
          <input
            type="text"
            placeholder="Enter Server Name"
            required
            onChange={(e) =>
              setAppValue({
                ...appValue,
                [e.target.name]: e.target.value,
              })
            }
            name="servername"
            value={appValue.servername}
            className="input"
          />
          <input
            type="text"
            placeholder="Enter IP Address"
            onChange={(e) =>
              setAppValue({
                ...appValue,
                [e.target.name]: e.target.value,
              })
            }
            name="serverip"
            value={appValue.serverip}
            className="input"
            required
          />
          <input
            type="number"
            placeholder="Enter PORT Number"
            required
            onChange={(e) =>
              setAppValue({
                ...appValue,
                [e.target.name]: e.target.value,
              })
            }
            name="portnumber"
            value={appValue.portnumber}
            className="input"
          />
          <div>
            <button
              type="submit"
              className="p-2 bg-blue-500 border border-transparent rounded-md cursor-pointer text-white font-bold text-lg hover:bg-blue-600 transition duration-300 hover:scale-105"
            >
              Submit
              {isSubmitting && (
                <span className="inline-block ml-2 animate-spin"><FaSpinner /></span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}