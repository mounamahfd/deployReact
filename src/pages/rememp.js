import React from "react";
import Sidebar from "../components/sidebar";
import Topbar from "../components/topbar";
import Emprunteursrem from "../components/remboursemments";

const Remboursements = () => {
  return (
    <div id="wrapper">
      <Sidebar />
      <div id="content-wrapper" className="d-flex flex-column">
        <div id="content">
          <Topbar />
          <div className="container-fluid">
            <Emprunteursrem />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Remboursements;
