import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../components/sidebar';
import Topbar from '../components/topbar';
import SourceTab from '../components/sourcetab';

const Source = () => {
  const [bailleurs, setBailleurs] = useState([]);

  useEffect(() => {
    fetchBailleursData();
  }, []);

  const fetchBailleursData = async () => {
    try {
      const response = await axios.get(`http://127.0.0.1:8000/api/bailleurs/`);
      setBailleurs(response.data);
    } catch (error) {
      console.error('Erreur lors de la récupération des données des bailleurs:', error);
    }
  };

  return (
    <div id="wrapper">
      <Sidebar />
      <div id="content-wrapper" className="d-flex flex-column">
        <div id="content">
          <Topbar />
          <div className="container-fluid">
            <SourceTab bailleurs={bailleurs} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Source;
