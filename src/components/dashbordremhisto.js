import React, { useState, useEffect } from 'react';
import axios from 'axios';
import photoProfilAvatar from '../static/img/profil-avatar.jpg';
import {faTachometerAlt, faFolder,faMoneyBill,faUsers,faChartLine,faCoins,faReceipt,faHandHoldingDollar,faHistory,faFileDownload} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const DashboardRemhisto = ({ client, pret,categories }) => {
  const [remboursements, setRemboursements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [openDialogp, setOpenDialogp] = useState(false);
  
  const [downloading, setDownloading] = useState(false);

  const handleDownloadPDF = async () => {
    setDownloading(true);
    try {
      // Update the URL to include client_id and pret_id as path parameters
      const url = `http://127.0.0.1:8000/api/remboursements_pdf/${client.id}/${pret.id}/`;
      const response = await axios.get(url, {
        responseType: 'blob' // Specify the response type as blob to handle PDF downloads
      });
      
      // Create a URL object for the blob
      const blobUrl = window.URL.createObjectURL(new Blob([response.data]));
      // Create a link to download the PDF file
      const link = document.createElement('a');
      link.href = blobUrl;
      link.setAttribute('download', 'details_emprunteur_remboursements.pdf'); // Ensure the download attribute is set with the desired filename
      document.body.appendChild(link);
      link.click();
      // Cleanup the URL object
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      // Handle download errors
    } finally {
      setDownloading(false);
    }
  };


  useEffect(() => {
    if (pret && pret.id) {
      fetchRemboursementsForPret(pret.id);
    }
  }, [pret]);

  // const fetchRemboursementsForPret = async (pretId) => {
  //   setLoading(true);
  //   try {
  //     const response = await axios.get(`http://127.0.0.1:8000/api/emprunteurs/${client.id}/prets/${pretId}/remboursements/`);
  //     setRemboursements(response.data);
  //   } catch (error) {
  //     console.error('Error fetching remboursements:', error);
  //     setError(error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const fetchRemboursementsForPret = async (pretId) => {
    setLoading(true);
    try {
      const response = await axios.get(`http://127.0.0.1:8000/api/prets/${pretId}/repayments/`);
      const remboursementsWithCategory = response.data.map(remb => ({
        ...remb,
        categorie_nom: getCategoryName(pret.objet) // Assuming 'pret.objet' is the category ID
      }));
      setRemboursements(remboursementsWithCategory);
    } catch (error) {
      console.error('Error fetching remboursements:', error);
      setError(error);
    } finally {
      setLoading(false);
    }
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return 'N/D';
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? 'N/D' : date.toLocaleDateString('fr-FR', { year: 'numeric', month: '2-digit', day: '2-digit' });
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.nom : 'Unknown';
  };

  
  const handleViewPhoto = (photoUrl) => {
    setSelectedPhoto(photoUrl);
    setOpenDialogp(true);
  };

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(3); // Adjust as needed

  const filteredRemboursements = remboursements.filter(remb =>
    remb.categorie_nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    remb.montant.toString().startsWith(searchTerm) ||
    formatDate(remb.date_remboursement).startsWith(searchTerm)
  );
  
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredRemboursements.slice(indexOfFirstItem, indexOfLastItem);
  
  const handleNextPage = () => {
    const maxPages = Math.ceil(filteredRemboursements.length / itemsPerPage);
    if (currentPage < maxPages) {
      setCurrentPage(currentPage + 1);
    }
  };
  
  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };
  
  return (
    <div className="container">
      <div className="row">
        <div className="col-xl-4 col-md-6 mb-6">
          <div className="card bg-info text-white">
            <div className="card-body">
              <h2>Informations de prêt</h2>
              <hr />
              <p>Prêt : {pret ? pret.montant_initial : 'N/D'}</p>
              <p>Date : {pret ? formatDate(pret.date_octroi) : 'N/D'}</p>
              <p>Catégorie: {pret ? getCategoryName(pret.objet) : 'N/D'}</p>
            </div>
          </div>
        </div>
        <div className="col-xl-4 col-md-6 mb-6">
          <div className="card text-white" style={{ backgroundColor: '#80ced6' }}>
            <div className="card-body">
              <h2>Informations de client</h2>
              <hr />
              <p>Client : {client ? `${client.nom} ${client.prenom}` : 'N/D'}</p>
              <p>Email: {client ? client.email : 'N/D'}</p>
              <p>Téléphone: {client ? client.telephone : 'N/D'}</p>
            </div>
          </div>
        </div>
        <div className="col-xl-4 col-md-6 mb-6">
          <div className="card text-white" style={{ 
            backgroundImage: client.photo_personnel ? `url(${client.photo_personnel})` : `url(${photoProfilAvatar})`,
            backgroundSize: 'cover', 
            backgroundPosition: 'center', 
            minHeight: '185px' 
          }}>
            <div className="card-body d-flex justify-content-center align-items-center">
              {/* <h2>Informations de client</h2>
              <hr />
              <p>Client : {client ? `${client.nom} ${client.prenom}` : 'N/D'}</p>
              <p>Email: {client ? client.email : 'N/D'}</p>
              <p>Téléphone: {client ? client.telephone : 'N/D'}</p> */}
              {client.photo_personnel && (
                <img 
                  src={client.photo_personnel} 
                  alt="Carte d'Identité"
                  className="img-fluid"
                  style={{ display: 'none' }} // Pour cacher l'image réelle
                  onClick={() => handleViewPhoto(client.photo_personnel)}
                />
              )}
            </div>
          </div>
        </div>

      </div>

      <div className="d-flex justify-content-end">
        <div>
          <p>{downloading ? 'Téléchargement en cours...' : 'Télécharger le fiche de remboursement'}</p>
          <button onClick={handleDownloadPDF} disabled={downloading} className="btn btn-primary btn-sm" style={{ width: '280px' }}>
              <FontAwesomeIcon icon={faFileDownload} />
          </button>
        </div>
      </div>
      
      <input
        type="text"
        className="form-control form-control-sm mb-2 mt-2"
        style={{ width: '100%', maxWidth: '300px' }}
        placeholder="Rechercher par Montant ou Durée"
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
      />
      {/* Pagination buttons */}
      
      <div className="mb-2 mt-3">
        <button className="btn btn-primary btn-sm mr-2 ml-3" onClick={handlePrevPage} disabled={currentPage === 1}>   Précédent</button>
        <button className="btn btn-primary btn-sm mr-2" onClick={handleNextPage} disabled={currentPage >= Math.ceil(filteredRemboursements.length / itemsPerPage)}>  Suivant</button>
      </div>

      {/* <br /> */}
      <div className="row justify-content-center mt-4">
        <div className="col-md-12">
          <div className="card card-body">
              <table className="table table-sm">
                <thead>
                  <tr>
                    <th>Montant de remboursement</th>
                    <th>Date de remboursement</th>
                  </tr>
                </thead>
                <tbody>
                {currentItems.map(remb => (
                  <tr key={remb.id}>
                    <td>{remb.montant || 'N/D'}</td>
                    <td>{remb.date_repayment ? formatDate(remb.date_repayment) : 'N/D'}</td>
                  </tr>
                ))}
                {currentItems.length === 0 && (
                  <tr>
                    <td colSpan="2">Aucun remboursement trouvé</td>
                  </tr>
                )}
                </tbody>
              </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardRemhisto;
