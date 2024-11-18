import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom"; // Importez useParams depuis react-router-dom
import Sidebar from "../components/sidebar";
import Topbar from "../components/topbar";
import TauxTab from "../components/tauxtab";
import { useNavigate } from "react-router-dom";

const Bailleur = () => {
  const { bailleurId } = useParams(); // Utilisez useParams pour obtenir les paramètres d'URL
  // bailleurId contiendra la valeur de l'ID du bailleur dans l'URL
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
            <TauxTab bailleurId={bailleurId} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Bailleur;
