import React, { useEffect } from "react";
import Sidebar from "../components/sidebar";
import Topbar from "../components/topbar";
import Historique from "../components/historique";
import { useNavigate } from "react-router-dom";

const Remboursements = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      navigate("/");
      return;
    }
  }, []);
  return (
    <div id="wrapper">
      <Sidebar />
      <div id="content-wrapper" className="d-flex flex-column">
        <div id="content">
          <Topbar />
          <div className="container-fluid">
            <Historique />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Remboursements;
