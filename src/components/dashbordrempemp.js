import { Link } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField } from '@mui/material';
import photoProfilAvatar from '../static/img/profil-avatar.jpg';

const DashboardRemEmp = ({ client,categories }) => {
  const [remboursements, setRemboursements] = useState([]);
  const [formData, setFormData] = useState({
    montant_rembourse: '',
  });
  const [selectedPret, setSelectedPret] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [prets, setPrets] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(2); // You can set this to any number you prefer
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [openDialogp, setOpenDialogp] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem("access_token"));


  // const handleDownloadPDF = async () => {
  //   setDownloading(true);
  //   try {
  //     // Update the URL to include client_id and pret_id as path parameters
  //     const url = `http://127.0.0.1:8000/api/remboursements_pdf/${client.id}/${pret.id}/`;
  //     const response = await axios.get(url, {
  //       responseType: 'blob' // Specify the response type as blob to handle PDF downloads
  //     });
      
  //     // Create a URL object for the blob
  //     const blobUrl = window.URL.createObjectURL(new Blob([response.data]));
  //     // Create a link to download the PDF file
  //     const link = document.createElement('a');
  //     link.href = blobUrl;
  //     link.setAttribute('download', 'details_emprunteur_remboursements.pdf'); // Ensure the download attribute is set with the desired filename
  //     document.body.appendChild(link);
  //     link.click();
  //     // Cleanup the URL object
  //     window.URL.revokeObjectURL(blobUrl);
  //   } catch (error) {
  //     console.error('Error downloading PDF:', error);
  //     // Handle download errors
  //   } finally {
  //     setDownloading(false);
  //   }
  // };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };
  const filteredRemboursements = remboursements.filter(remboursement =>
    remboursement.categorie_nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    remboursement.montant_initial.toString().startsWith(searchTerm) ||
    formatDate(remboursement.date_octroi).startsWith(searchTerm)
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
  
 
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handleUpdateDialogOpen = (pret) => {
    setSelectedPret(pret);
    setOpenDialog(true);
  };
  
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  
  useEffect(() => {
    fetchRemboursements();
  }, [client.id], [categories]);


  // const fetchRemboursements = async () => {
  //   try {
  //     const response = await axios.get(`http://127.0.0.1:8000/api/emprunteurs/${client.id}/prets/`);
  //     setRemboursements(response.data);
  //   } catch (error) {
  //     console.error('Error fetching remboursements:', error);
  //   }
  // };

  const fetchRemboursements = async () => {
    try {
      const response = await axios.get(`http://127.0.0.1:8000/api/emprunteurs/${client.id}/prets/`
        ,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const updatedPrets = response.data.map(pret => ({
        ...pret,
        categorie_nom: categories.find(category => category.id === pret.objet)?.nom || 'Unknown' // Trouver le nom de la catégorie correspondante à partir des catégories transmises
      }));
      
      setRemboursements(updatedPrets);
    } catch (error) {
      console.error('Error fetching prêts:', error);
    }
  };

    
  const handleViewPhoto = (photoUrl) => {
    setSelectedPhoto(photoUrl);
    setOpenDialogp(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    // Vérifier si le montant remboursé est positif et inférieur ou égal au montant restant
    const montantRembourse = parseFloat(formData.montant_rembourse);
    const resteMontant = selectedPret ? parseFloat(selectedPret.reste_montant_pret) : 0;
  
    if (montantRembourse <= 0) {
      alert('Le montant remboursé doit être positif.');
      return;
    }
  
    if (montantRembourse > resteMontant) {
      alert('Le montant remboursé doit être inférieur ou égal au montant restant.');
      return;
    }
  
    try {
      // Envoyer les données du remboursement à votre API Django
      const response = await axios.post(`http://127.0.0.1:8000/api/repayments/`, {
        montant: montantRembourse,
        date_remboursement: new Date().toISOString(),
        pret: selectedPret.id,
        utilisateur: client.id
      });
  
      const newRemboursement = response.data;
  
      // Mettre à jour les valeurs de reste_montant_pret et montant_deja_rembourse
      const updatedRemboursements = remboursements.map(remboursement => {
        if (remboursement.id === selectedPret.id) {
          const montantDejaRembourse = parseFloat(remboursement.montant_deja_rembourse) + montantRembourse;
  
          return {
            ...remboursement,
            reste_montant_pret: (resteMontant - montantRembourse).toFixed(2),
            montant_deja_rembourse: montantDejaRembourse.toFixed(2)
          };
        }
        return remboursement;
      });
  
      setRemboursements(updatedRemboursements);
  
      setOpenDialog(false);
      setFormData({ montant_rembourse: '' }); // Réinitialiser le formulaire
  
    } catch (error) {
      console.error('Error creating remboursement:', error);
    }
  };

  return (
  <div className="container">
    <div className="row ">
      <div className="col-xl-4 col-md-6">
        <div className="card bg-info text-white">
          <div className="card-body">
            <div className="text-m font-weight-bold text-white text-uppercase mb-1">
              <h2>Informations de client</h2>
            </div>
            <hr/>
            <p>Client : {client.nom} {client.prenom}</p>
            <p>Email: {client.email}</p>
            <p>Téléphone: {client.telephone}</p>
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
    
    <input
      type="text"
      className="form-control form-control-sm mb-2 mt-2"
      style={{ width: '100%', maxWidth: '300px' }}// Added `form-control-sm` for a smaller input field
      placeholder="Rechercher par Catégorie, Montant ou Durée"
      value={searchTerm}
      onChange={e => setSearchTerm(e.target.value)}
    />
      <div className="mb-2 mt-3">
        <button className="btn btn-primary btn-sm mr-2 ml-3" onClick={handlePrevPage} disabled={currentPage === 1}>
          Précédent
        </button>
        <button className="btn btn-primary btn-sm mr-2" onClick={handleNextPage} disabled={currentPage === Math.ceil(filteredRemboursements.length / itemsPerPage)}>
          Suivant
        </button>
      </div>


  <div className="row justify-content-center mt-4">
    <div className="col-md-12">
      <div className="card card-body">
        <table className="table table-sm">
          <thead>
            <tr>
            
              <th></th>
              <th>Catégorie</th>
              <th>Montant du Prêt</th>
              <th>Date Prêt</th>
              <th>Reste Montant du Prêt</th>
              <th>Montant déjà Remboursé</th>
             
            </tr>
          </thead>
          <tbody>
          {currentItems.map(remboursement => (
            <tr key={remboursement.id}>
              {/* <td>
                <Link className="btn btn-sm btn-info" to={`/inforemhisto/${client.id}/${remboursement.id}`}>Détails</Link>
              </td> */}
              <td>
                <td><Link className="btn btn-sm btn-info" to={`/repayments/${client.id}/${remboursement.id}`}>Voir Remboursements</Link></td>
              </td>

              <td>{remboursement.categorie_nom}</td>
              <td>{remboursement.montant_initial}</td>
              <td>{formatDate(remboursement.date_octroi)}</td>
              <td>{parseFloat(remboursement.reste_montant_pret).toFixed(2)}</td>
              <td>{parseFloat(remboursement.montant_deja_rembourse).toFixed(2)}</td>
            </tr>
          ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>

  <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
    <DialogTitle>{selectedPret ? 'Créer le remboursement' : 'Créer un remboursement'}</DialogTitle>
    <DialogContent>
      <form onSubmit={handleSubmit}>
        <TextField
          type='number'
          name="montant_rembourse"
          value={formData.montant_rembourse}
          onChange={handleChange}
          label="Montant du remboursement"
          fullWidth
          margin="normal"
        />
      </form>
    </DialogContent>
    <DialogActions>
      <Button onClick={() => setOpenDialog(false)} color="primary">
        Annuler
      </Button>
      <Button onClick={handleSubmit} color="primary">
        Enregistrer
      </Button>
    </DialogActions>
  </Dialog>
</div>

  );

};

export default DashboardRemEmp;
