import React, { useState, useEffect } from 'react';
import Sidebar from '../components/sidebar';
import Topbar from '../components/topbar';
import DashboardEmp from '../components/dashboardEmp';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const InfoEmp = () => {
  const { id } = useParams();

  const [clientData, setClientData] = useState(null);
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      navigate('/');
      return;
    }
  }, [navigate]);

  useEffect(() => {
    const fetchClient = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const response = await axios.get(`http://127.0.0.1:8000/api/emprunteurs/${id}/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setClientData(response.data);
      } catch (error) {
        console.error('Error fetching client data:', error.message);
      }
    };

    fetchClient();
  }, [id]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const response = await axios.get(`http://127.0.0.1:8000/api/categories/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCategories(response.data);
      } catch (error) {
        console.error('Error fetching categories:', error.message);
      }
    };

    fetchCategories();
  }, []);

  return (
    <div id="wrapper">
      <Sidebar />
      <div id="content-wrapper" className="d-flex flex-column">
        <div id="content">
          <Topbar />
          <div className="container-fluid">
            {clientData && <DashboardEmp client={clientData} categories={categories} />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InfoEmp;
