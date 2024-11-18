import React, { useState, useEffect } from 'react';
import Sidebar from '../components/sidebar';
import Topbar from '../components/topbar';
import DashboardPret from '../components/dashboardprehisto';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const InfoPret = () => {
    const { id } = useParams();
    const [clientData, setClientData] = useState(null);
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
        const fetchClient = async () => {
            try {
                const response = await axios.get(`http://127.0.0.1:8000/api/emprunteurs/${id}/`);
                setClientData(response.data);
            } catch (error) {
                console.error('Error fetching client data:', error);
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
                        {clientData && categories.length > 0 && <DashboardPret client={clientData} categories={categories} />}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InfoPret;
