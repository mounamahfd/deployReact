import React, { useState, useEffect } from 'react';
import Sidebar from '../components/sidebar';
import Topbar from '../components/topbar';
import DashboardRemhisto from '../components/dashbordremhisto';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const InfoRem = () => {
  const { id, pretId } = useParams();
  const [clientData, setClientData] = useState(null);
  const [pretData, setPretData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    // Fonction asynchrone pour récupérer les catégories depuis l'API
    const fetchCategories = async () => {
        try {
            const response = await axios.get(`http://127.0.0.1:8000/api/categories/`);
            setCategories(response.data); // Met à jour l'état des catégories avec les données récupérées
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    fetchCategories(); // Appel de la fonction pour charger les catégories
}, []);

  useEffect(() => {
    const fetchClientAndPretData = async () => {
      try {
        setLoading(true);
        const clientResponse = await axios.get(`http://127.0.0.1:8000/api/emprunteurs/${id}/`);
        console.log('Client data:', clientResponse.data);
        setClientData(clientResponse.data);

        const pretResponse = await axios.get(`http://127.0.0.1:8000/api/emprunteurs/${id}/prets/${pretId}/`);
        console.log('Pret data:', pretResponse.data);
        setPretData(pretResponse.data);

        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(error);
        setLoading(false);
      }
    };

    if (id && pretId) {
      fetchClientAndPretData();
    }
  }, [id, pretId]);

  return (
    <div id="wrapper">
      <Sidebar />
      <div id="content-wrapper" className="d-flex flex-column">
        <div id="content">
          <Topbar />
          <div className="container-fluid">
            {clientData && pretData && (
              <DashboardRemhisto client={clientData} pret={pretData} categories={categories}/>
            )}
          </div>
         
        </div>
      </div>
    </div>
  );
};

export default InfoRem;
