import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const DashboardPret = ({ client, categories }) => {
  const [prets, setPrets] = useState([]);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    fetchPrets();
  }, [client.id, page, rowsPerPage]);

  const fetchPrets = async () => {
    try {
      const response = await axios.get(`http://127.0.0.1:8000/api/emprunteurs/${client.id}/prets/`);
      const updatedPrets = response.data.map(pret => ({
        ...pret,
        categorie_nom: categories.find(category => category.id === pret.objet)?.nom || 'Unknown'
      }));
      setPrets(updatedPrets);
    } catch (error) {
      console.error('Error fetching prêts:', error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(1);
  };

  return (
    <div>
      <div className="row">
        <div className="col-xl-4 col-md-6 mb-6">
          <div className="card bg-info text-white">
            <div className="card-body">
              <div className="text-m font-weight-bold text-white text-uppercase mb-1">
                <h2>Informations de client</h2>
              </div>
              <hr />
              <p>Client : {client.nom} {client.prenom}</p>
              <p>Email: {client.email}</p>
              <p>Téléphone: {client.telephone}</p>
            </div>
          </div>
        </div>
        <div className="col-xl-4 col-md-6 mb-6">
          <div className="card text-white" style={{ backgroundColor: '#80ced6' }}>
            <div className="card-body">
              <div className="text-m font-weight-bold text-white text-uppercase mb-1">
                <h2>Total Prêts</h2>
              </div>
              <hr />
              <h1 style={{ textAlign: 'center', padding: '10px', fontSize: '20px' }}>{prets.length}</h1>
            </div>
          </div>
        </div>
      </div>
      <br />
      <div className="row">
        <div className="col-md">
          <div className="card card-body">
            <table className="table table-sm">
              <thead>
                <tr>
                  <th></th>
                  <th>Catégorie</th>
                  <th>Montant</th>
                  <th>Date Prêt</th>
                  <th>Durée (mois)</th>
                </tr>
              </thead>
              <tbody>
                {prets.slice((page - 1) * rowsPerPage, page * rowsPerPage).map(pret => (
                  <tr key={pret.id}>
                    <td><Link className="btn btn-sm btn-info" to={`/inforemhisto/${client.id}/${pret.id}`}>View</Link></td>
                    <td>{pret.categorie_nom}</td>
                    <td>{pret.montant_initial}</td>
                    <td>{formatDate(pret.date_octroi)}</td>
                    <td>{pret.duree}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPret;
