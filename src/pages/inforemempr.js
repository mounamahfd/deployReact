import React, { useState, useEffect } from "react";
import Sidebar from "../components/sidebar";
import Topbar from "../components/topbar";
import DashboardRemEmp from "../components/dashbordrempemp";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const InfoEmprem = () => {
  const { id } = useParams();
  const [clientData, setClientData] = useState(null);
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      navigate("/");
      return;
    }
  }, [navigate]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const response = await axios.get(
          `http://127.0.0.1:8000/api/categories/`
        );
        setCategories(response.data);
      } catch (error) {
        console.error("Error fetching categories:", error.message);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchClient = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const response = await axios.get(
          `http://127.0.0.1:8000/api/emprunteurs/${id}/`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setClientData(response.data);
      } catch (error) {
        console.error("Error fetching client data:", error.message);
      }
    };

    fetchClient();
  }, [id]);

  return (
    <div id="wrapper">
      <Sidebar />
      <div id="content-wrapper" className="d-flex flex-column">
        <div id="content">
          <Topbar />
          <div className="container-fluid">
            {clientData && categories.length > 0 && (
              <DashboardRemEmp client={clientData} categories={categories} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InfoEmprem;
