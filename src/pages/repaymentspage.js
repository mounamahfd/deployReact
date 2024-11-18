import React, { useState, useEffect } from 'react';
import Sidebar from '../components/sidebar';
import Topbar from '../components/topbar';
import Repayments from '../components/repayments';  // Assurez-vous que le chemin est correct
import { useParams } from 'react-router-dom';
import axios from 'axios';


const RepaymentsPage = () => {
    const { clientId,pretId } = useParams(); // Récupération de l'ID du prêt depuis l'URL
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

    return (
        <div id="wrapper">
            <Sidebar />
            <div id="content-wrapper" className="d-flex flex-column">
                <div id="content">
                    <Topbar />
                    <div className="container-fluid">
                        {/* Passer pretId comme prop au composant Repayments */}
                        <Repayments clientId= {clientId} pretId={pretId} categories={categories}/>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RepaymentsPage;
