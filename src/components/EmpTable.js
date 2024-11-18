import React, { useState, useEffect } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode"; // Make sure to import jwt-decode correctly
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from "@mui/material";
import { Link } from "react-router-dom";
import Pagination from "@mui/material/Pagination";
import Alert from "@mui/material/Alert";

const EmprunteursPage = () => {
  const [emprunteurs, setEmprunteurs] = useState([]);
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    email: "",
    telephone: "",
    nni: "",
    date_naissance: "",
    carte_identite: null,
    photo_personnel: null,
  });
  const [selectedEmprunteur, setSelectedEmprunteur] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("access_token"));

  const [openDialog, setOpenDialog] = useState(false);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(3);
  const [totalPages, setTotalPages] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [selectedCarte, setSelectedCarte] = useState(null);
  const [openDialogp, setOpenDialogp] = useState(false);
  const [openDialogc, setOpenDialogc] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [emprunteurToDelete, setEmprunteurToDelete] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false); // Nouvel état pour suivre si l'utilisateur est admin

  useEffect(() => {
    fetchData();
    checkIfAdmin(); // Vérifier si l'utilisateur est admin
  }, [page, rowsPerPage, searchTerm]);

  const fetchData = async () => {
    try {
      const response = await axios.get(
        `http://127.0.0.1:8000/api/emprunteurs/?search=${searchTerm}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const totalCount = response.data.length;
      const totalPages = Math.ceil(totalCount / rowsPerPage);
      setEmprunteurs(
        response.data.slice((page - 1) * rowsPerPage, page * rowsPerPage)
      );
      setTotalPages(totalPages);
    } catch (error) {
      console.error("Erreur lors de la récupération des emprunteurs :", error);
    }
  };

  const checkIfAdmin = () => {
    const token = localStorage.getItem("access_token"); // Supposons que le token est stocké dans localStorage
    if (token) {
      const decodedToken = jwtDecode(token);
      setIsAdmin(decodedToken.role === "admin"); // Assurez-vous que le token contient un champ 'role'
    }
  };

  const handleViewPhoto = (photoUrl) => {
    setSelectedPhoto(photoUrl);
    setOpenDialogp(true);
  };

  const handleViewCarte = (carteUrl) => {
    setSelectedCarte(carteUrl);
    setOpenDialogc(true);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    Object.keys(formData).forEach((key) => {
      if (formData[key] !== null && formData[key] !== "") {
        data.append(key, formData[key]);
      } else if (
        selectedEmprunteur &&
        selectedEmprunteur[key] !== null &&
        selectedEmprunteur[key] !== ""
      ) {
        data.append(key, selectedEmprunteur[key]);
      }
    });

    try {
      const endpoint = selectedEmprunteur
        ? `http://127.0.0.1:8000/api/emprunteurs/${selectedEmprunteur.id}/`
        : "http://127.0.0.1:8000/api/emprunteurs/";
      const method = selectedEmprunteur ? "put" : "post";
      const response = await axios({
        method: method,
        url: endpoint,
        data: data,
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (selectedEmprunteur) {
        setEmprunteurs(
          emprunteurs.map((emprunteur) =>
            emprunteur.id === selectedEmprunteur.id ? response.data : emprunteur
          )
        );
      } else {
        setEmprunteurs([...emprunteurs, response.data]);
      }
      setFormData({
        nom: "",
        prenom: "",
        email: "",
        telephone: "",
        nni: "",
        date_naissance: "",
        carte_identite: null,
        photo_personnel: null,
      });
      setSelectedEmprunteur(null);
      setOpenDialog(false);
    } catch (error) {
      console.error("Error creating/updating emprunteur:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://127.0.0.1:8000/api/emprunteurs/${id}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchData();
      setEmprunteurs(emprunteurs.filter((emprunteur) => emprunteur.id !== id));
      setOpenDeleteDialog(false);
    } catch (error) {
      console.error("Error deleting emprunteur:", error);
    }
  };

  const handleDeleteDialogOpen = (id) => {
    setEmprunteurToDelete(id);
    setOpenDeleteDialog(true);
  };

  const handleDeleteDialogClose = () => {
    setOpenDeleteDialog(false);
    setEmprunteurToDelete(null);
  };

  const handleUpdateDialogOpen = (emprunteur) => {
    setSelectedEmprunteur(emprunteur);
    setFormData(emprunteur);
    setOpenDialog(true);
  };

  const handleAddDialogOpen = () => {
    setSelectedEmprunteur(null);
    setFormData({
      nom: "",
      prenom: "",
      email: "",
      telephone: "",
      nni: "",
      date_naissance: "",
      carte_identite: null,
      photo_personnel: null,
    });
    setOpenDialog(true);
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(1);
  };

  const handleSearch = () => {
    setPage(1);
    fetchData();
  };

  return (
    <div className="col-md-12">
      <h1>Gestion des emprunteurs</h1>
      <hr className="mt-1 mb-2" />
      <div className="mb-3">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          {isAdmin && ( // Afficher le bouton "Créer un emprunteur" seulement pour les administrateurs
            <Button
              variant="contained"
              color="primary"
              onClick={handleAddDialogOpen}
            >
              Créer un emprunteur
            </Button>
          )}
          <TextField
            label="Rechercher un client"
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
            style={{ margin: "10px" }}
          />
        </div>
      </div>
      {emprunteurs.length === 0 ? (
        <Alert severity="info" className="mt-3">
          Aucun emprunteur trouvé.
        </Alert>
      ) : (
        <div
          className="card card-body"
          style={{ maxHeight: "360px", overflowY: "auto" }}
        >
          <table className="table table-sm">
            <thead>
              <tr>
                <th></th>
                <th>Client</th>
                <th>Téléphone</th>
                <th>nni</th>
                <th>carte d'identite</th>
                <th>photo personnel</th>
                {isAdmin && <th style={{ width: "400px" }}>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {emprunteurs.map((emprunteur) => (
                <tr key={emprunteur.id}>
                  <td>
                    <Link
                      className="btn btn-sm btn-info"
                      to={`/infoemp/${emprunteur.id}`}
                    >
                      Voir
                    </Link>
                  </td>
                  <td>
                    {emprunteur.prenom} {emprunteur.nom}
                  </td>
                  <td>{emprunteur.telephone}</td>
                  <td>{emprunteur.nni}</td>
                  <td>
                    {emprunteur.carte_identite && (
                      <img
                        src={emprunteur.carte_identite}
                        srcSet={`${emprunteur.carte_identite} 2x`}
                        alt="Carte d'Identité"
                        style={{
                          width: "50px",
                          height: "40px",
                          borderRadius: "50%",
                          cursor: "pointer",
                        }}
                        onClick={() =>
                          handleViewCarte(emprunteur.carte_identite)
                        }
                      />
                    )}
                  </td>
                  <td>
                    {emprunteur.photo_personnel && (
                      <img
                        src={emprunteur.photo_personnel}
                        srcSet={`${emprunteur.photo_personnel} 2x`}
                        alt="Photo Personnel"
                        style={{
                          width: "50px",
                          height: "40px",
                          borderRadius: "50%",
                          cursor: "pointer",
                        }}
                        onClick={() =>
                          handleViewPhoto(emprunteur.photo_personnel)
                        }
                      />
                    )}
                  </td>

                  {isAdmin && (
                    <td>
                      <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        onClick={() => handleUpdateDialogOpen(emprunteur)}
                      >
                        Modifier
                      </Button>
                      <Button
                        variant="contained"
                        color="error"
                        size="small"
                        onClick={() => handleDeleteDialogOpen(emprunteur.id)}
                        style={{ marginLeft: "10px" }}
                      >
                        Supprimer
                      </Button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={openDialogp} onClose={() => setOpenDialogp(false)}>
        <DialogContent>
          {selectedPhoto && (
            <img
              src={selectedPhoto}
              alt="Photo agrandie"
              style={{ maxWidth: "100%", height: "auto" }}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialogp(false)} color="primary">
            Fermer
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openDialogc} onClose={() => setOpenDialogc(false)}>
        <DialogContent>
          {selectedCarte && (
            <img
              src={selectedCarte}
              alt="Carte d'identité agrandie"
              style={{ maxWidth: "100%", height: "auto" }}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialogc(false)} color="primary">
            Fermer
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>
          {selectedEmprunteur ? "Mettre à jour" : "Créer un client"}
        </DialogTitle>
        <DialogContent>
          <form onSubmit={handleSubmit}>
            <TextField
              name="prenom"
              value={formData.prenom}
              onChange={handleChange}
              label="Prénom"
              fullWidth
              margin="normal"
            />
            <TextField
              name="nom"
              value={formData.nom}
              onChange={handleChange}
              label="Nom"
              fullWidth
              margin="normal"
            />
            <TextField
              name="email"
              value={formData.email}
              onChange={handleChange}
              label="Email"
              fullWidth
              margin="normal"
            />
            <TextField
              name="telephone"
              value={formData.telephone}
              onChange={handleChange}
              label="Téléphone"
              fullWidth
              margin="normal"
            />
            <TextField
              name="nni"
              value={formData.nni}
              onChange={handleChange}
              label="NNI"
              fullWidth
              margin="normal"
            />
            <TextField
              name="date_naissance"
              type="date"
              value={formData.date_naissance}
              onChange={handleChange}
              label="Date de Naissance"
              fullWidth
              margin="normal"
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              name="carte_identite"
              type="file"
              onChange={handleFileChange}
              label="Carte d'Identité"
              fullWidth
              margin="normal"
            />
            <TextField
              name="photo_personnel"
              type="file"
              onChange={handleFileChange}
              label="Photo Personnel"
              fullWidth
              margin="normal"
            />
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} color="error">
            Annuler
          </Button>
          <Button onClick={handleSubmit} color="primary">
            Enregistrer
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openDeleteDialog} onClose={handleDeleteDialogClose}>
        <DialogTitle>Confirmation de suppression</DialogTitle>
        <DialogContent>
          Êtes-vous sûr de vouloir supprimer cet emprunteur ?
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteDialogClose} color="primary">
            Annuler
          </Button>
          <Button
            onClick={() => handleDelete(emprunteurToDelete)}
            color="error"
          >
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>

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

export default EmprunteursPage;
