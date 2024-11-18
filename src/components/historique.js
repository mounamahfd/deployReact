import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Pagination, TextField } from '@mui/material';

const HistoriePage = () => {
  const [emprunteurs, setEmprunteurs] = useState([]);
  const [page, setPage] = useState(1);
  // Remove rowsPerPage state since it's not being used
  const [totalPages, setTotalPages] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchData = useCallback(async () => {
    try {
      const response = await axios.get(`http://127.0.0.1:8000/api/emprunteurs/?search=${searchTerm}`);
      setEmprunteurs(response.data);
      setTotalPages(Math.ceil(response.data.length / 3)); // Hardcoded value for rowsPerPage
    } catch (error) {
      console.error('Erreur lors de la récupération des emprunteurs :', error);
    }
  }, [searchTerm]);

  useEffect(() => {
    fetchData();
  }, [fetchData, page]);

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleSearch = () => {
    setPage(1);
    fetchData();
  };

  return (
    <div className="col-md-12">
      <h1>L'historique</h1>
      <hr className="mt-1 mb-2" />
      <div className="mb-3">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <TextField
            label="Rechercher un client"
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            style={{ color: 'white' }}
          />
        </div>
      </div>
      <div className="card card-body" style={{ maxHeight: '360px', overflowY: 'auto' }}>
        <table className="table table-sm">
          <thead>
            <tr>
              <th></th>
              <th>Client</th>
              <th>Email</th>
              <th>Téléphone</th>
            </tr>
          </thead>
          <tbody>
            {emprunteurs.slice((page - 1) * 3, page * 3).map(emprunteur => (
              <tr key={emprunteur.id}>
                <td>
                  <Link className="btn btn-sm btn-info" to={`/infoprethisto/${emprunteur.id}`}>View</Link>
                </td>
                <td>{emprunteur.nom} {emprunteur.prenom}</td>
                <td>{emprunteur.email}</td>
                <td>{emprunteur.telephone}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination
        count={totalPages}
        page={page}
        onChange={handlePageChange}
        variant="outlined"
        shape="rounded"
        color="primary"
        className="mt-3"
      />
    </div>
  );
};

export default HistoriePage;
