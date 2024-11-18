import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from "jwt-decode";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarAlt, faMoneyBillWave, faClipboardCheck, faCheckCircle, faFileDownload } from '@fortawesome/free-solid-svg-icons';

const Repayments = ({ clientId, pretId }) => {
  const [repayments, setRepayments] = useState([]);
  const [loan, setLoan] = useState(null);
  const [borrower, setBorrower] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(2);
  const [isAdmin, setIsAdmin] = useState(false); // Nouvel état pour suivre si l'utilisateur est admin

  useEffect(() => {
    fetchLoan();
    fetchBorrower();
    checkIfAdmin(); // Vérifier si l'utilisateur est admin
  }, [clientId, pretId]);

  const fetchLoan = async () => {
    try {
      const response = await axios.get(`http://127.0.0.1:8000/api/emprunteurs/${clientId}/prets/${pretId}/`);
      setLoan(response.data);
      const categorieId = response.data.objet;
      const categorieResponse = await axios.get(`http://127.0.0.1:8000/api/categories/${categorieId}/`);
      setLoan({
        ...response.data,
        categorie_nom: categorieResponse.data.nom // Assurez-vous que la réponse de l'API contient un champ 'nom'
      });
    } catch (error) {
      console.error("Erreur lors de la récupération des informations du prêt:", error);
    }
  };

  const fetchBorrower = async () => {
    try {
      const response = await axios.get(`http://127.0.0.1:8000/api/emprunteurs/${clientId}/`);
      setBorrower(response.data);
    } catch (error) {
      console.error("Erreur lors de la récupération des informations de l'emprunteur:", error);
    }
  };

  useEffect(() => {
    fetchRepayments();
  }, [pretId]);

  const fetchRepayments = async () => {
    try {
      const response = await axios.get(`http://127.0.0.1:8000/api/repayments/?pret=${pretId}`);
      setRepayments(response.data);
    } catch (error) {
      console.error('Erreur lors de la récupération des remboursements:', error);
    }
  };

  const handleRepayment = async (repaymentId) => {
    try {
      await axios.patch(`http://127.0.0.1:8000/api/repayments/${repaymentId}/mark_as_done/`);
      fetchRepayments(); // Re-fetch pour mettre à jour l'affichage
      fetchLoan();
      fetchBorrower(); // Re-fetch pour mettre à jour les informations du prêt et de l'emprunteur
    } catch (error) {
      console.error('Erreur lors de la mise à jour du remboursement:', error);
    }
  };

  const checkIfAdmin = () => {
    const token = localStorage.getItem("access_token"); // Supposons que le token est stocké dans localStorage
    if (token) {
      const decodedToken = jwtDecode(token);
      setIsAdmin(decodedToken.role === "admin"); // Assurez-vous que le token contient un champ 'role'
    }
  };

  const handleDownloadPDF = async () => {
    setDownloading(true);
    try {
      const url = `http://127.0.0.1:8000/api/remboursements_pdf/${clientId}/${pretId}/`;
      const response = await axios.get(url, {
        responseType: 'blob'
      });
      
      const blobUrl = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = blobUrl;
      link.setAttribute('download', 'details_emprunteur_remboursements.pdf');
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Error downloading PDF:', error);
    } finally {
      setDownloading(false);
    }
  };
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const filteredRemboursements = repayments.filter(remb =>
    remb.montant.toString().startsWith(searchTerm) ||
    formatDate(remb.date_repayment).startsWith(searchTerm)
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

  const totalRepayments = loan ? loan.duree : 0;
  const completedRepayments = repayments.filter(r => r.valide).length;
  const monthlyPayment = repayments[0] ? repayments[0].montant : 0;
  const totalAmount = monthlyPayment * totalRepayments;

  return (
    <div>
      <div className="row">
        <div className="col-xl-3 col-md-6 mb-4">
          <div className="card border-left-primary shadow h-100 py-2">
            <div className="card-body">
              <div className="row no-gutters align-items-center">
                <div className="col mr-2">
                  <div className="text-xs font-weight-bold text-primary text-uppercase mb-1">Paiement Mensuel</div>
                  <div className="h5 mb-0 font-weight-bold text-gray-800">{monthlyPayment} MRU</div>
                </div>
                <div className="col-auto">
                  <FontAwesomeIcon icon={faCalendarAlt} className="fas fa-2x text-gray-300" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-md-6 mb-4">
          <div className="card border-left-success shadow h-100 py-2">
            <div className="card-body">
              <div className="row no-gutters align-items-center">
                <div className="col mr-2">
                  <div className="text-xs font-weight-bold text-success text-uppercase mb-1">Montant Total à Payer</div>
                  <div className="h5 mb-0 font-weight-bold text-gray-800">{totalAmount.toFixed(2)} MRU</div>
                </div>
                <div className="col-auto">
                  <FontAwesomeIcon icon={faMoneyBillWave} className="fas fa-2x text-gray-300" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-md-6 mb-4">
          <div className="card border-left-info shadow h-100 py-2">
            <div className="card-body">
              <div className="row no-gutters align-items-center">
                <div className="col mr-2">
                  <div className="text-xs font-weight-bold text-info text-uppercase mb-1">Nombre de Remboursements</div>
                  <div className="h5 mb-0 font-weight-bold text-gray-800">{totalRepayments}</div>
                </div>
                <div className="col-auto">
                  <FontAwesomeIcon icon={faClipboardCheck} className="fas fa-2x text-gray-300" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-md-6 mb-4">
          <div className="card border-left-warning shadow h-100 py-2">
            <div className="card-body">
              <div className="row no-gutters align-items-center">
                <div className="col mr-2">
                  <div className="text-xs font-weight-bold text-warning text-uppercase mb-1">Remboursements Effectués</div>
                  <div className="h5 mb-0 font-weight-bold text-gray-800">{completedRepayments}</div>
                </div>
                <div className="col-auto">
                  <FontAwesomeIcon icon={faCheckCircle} className="fas fa-2x text-gray-300" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card mb-4">
        <div className="card-body">
          <h1 className="card-title text-center">
            Remboursements de prêt de {loan ? `${loan.montant_initial} MRU` : 'Chargement...'} de taux d'intérêt {loan ? `${loan.taux_interet}% ` : 'Chargement...'}
             pour le client {borrower ? `${borrower.nom} ${borrower.prenom}` : 'Chargement...'}
          </h1>
        </div>
      </div>

      <div className="d-flex justify-content-end">
        <div>
          <p>{downloading ? 'Téléchargement en cours...' : 'Télécharger la fiche de remboursement'}</p>
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

      <div className="mb-2 mt-3">
        <button className="btn btn-primary btn-sm mr-2 ml-3" onClick={handlePrevPage} disabled={currentPage === 1}>Précédent</button>
        <button className="btn btn-primary btn-sm mr-2" onClick={handleNextPage} disabled={currentPage >= Math.ceil(filteredRemboursements.length / itemsPerPage)}>Suivant</button>
      </div>

      {repayments.length > 0 ? (
        <table className="table">
          <thead>
            <tr>
              <th>Montant</th>
              <th>Date</th>
              <th>Statut</th>
              {isAdmin && <th>Action</th>}
            </tr>
          </thead>
          <tbody>
            {currentItems.map((repayment) => (
              <tr key={repayment.id}>
                <td>{repayment.montant}</td>
                <td>{new Date(repayment.date_repayment).toLocaleDateString()}</td>
                <td>{repayment.valide ? 'Effectué' : 'En attente'}</td>
                {isAdmin && (
                  <td>
                    {!repayment.valide && (
                      <button 
                        onClick={() => handleRepayment(repayment.id)}
                        className="btn btn-success">
                        Marquer comme effectué
                      </button>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>Aucun remboursement trouvé.</p>
      )}
    </div>
  );
};

export default Repayments;
