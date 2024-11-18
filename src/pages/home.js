import React, { useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/sidebar";
import Topbar from "../components/topbar";
import DashboardContent from "../components/dashboard";

const Home = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    console.log("Token from localStorage:", token); // Log the token

    if (!token) {
      navigate("/");
      return;
    }

    // // Set the token as a cookie with a single name
    // console.log("Cookie set:", document.cookie); // Log the cookies

    // const validateToken = async () => {
    //   try {
    //     const response = await axios.get(
    //       "http://127.0.0.1:8000/user_api/validate-token/",
    //       {
    //         withCredentials: true, // Ensure cookies are included
    //       }
    //     );
    //     console.log("Validation response:", response.data); // Log the response
    //     if (response.data.valid !== true) {
    //       navigate("/");
    //     }
    //   } catch (error) {
    //     console.error(
    //       "Validation error:",
    //       error.response ? error.response.data : error.message
    //     ); // Log the error
    //     navigate("/");
    //   }
    // };

    // validateToken();
  }, [navigate]);

  return (
    <div id="wrapper">
      <Sidebar />
      <div id="content-wrapper" className="d-flex flex-column">
        <div id="content">
          <Topbar />
          <div className="container-fluid">
            {/* Contenu de la page */}
            <DashboardContent />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
