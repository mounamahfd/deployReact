import React, { useState, useEffect } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Pagination,
  Alert,
} from "@mui/material";
import { useLocation } from "react-router-dom";

const TauxTab = ({ bailleurId }) => {
  const [taux, setTaux] = useState([]);
  const [bailleurNom, setBailleurNom] = useState("");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [totalPages, setTotalPages] = useState(0);
  const [newTaux, setNewTaux] = useState({
    valeur: "",
    date_debut: "",
    date_fin: "",
  });
  const [selectedTaux, setSelectedTaux] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [tauxToDelete, setTauxToDelete] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false); // Nouvel état pour suivre si l'utilisateur est admin

  const location = useLocation();

  useEffect(() => {
    fetchBailleurAndTaux();
    fetchBailleurNom();
    checkIfAdmin(); // Vérifier si l'utilisateur est admin
  }, [page, rowsPerPage, bailleurId, location.search]);

  const fetchBailleurAndTaux = async () => {
    try {
      const tauxResponse = await axios.get(
        `http://127.0.0.1:8000/api/taux/?bailleur=${bailleurId}`
      );
      const totalCount = tauxResponse.data.length;
      const totalPages = Math.ceil(totalCount / rowsPerPage);
      setTaux(tauxResponse.data);
      setTotalPages(totalPages);
    } catch (error) {
      console.error("Erreur lors de la récupération des taux:", error);
    }
  };

  const fetchBailleurNom = async () => {
    try {
      const bailleurResponse = await axios.get(
        `http://127.0.0.1:8000/api/bailleurs/${bailleurId}/`
      );
      setBailleurNom(bailleurResponse.data.nom);
    } catch (error) {
      console.error(
        "Erreur lors de la récupération du nom du bailleur:",
        error
      );
    }
  };

  const checkIfAdmin = () => {
    const token = localStorage.getItem("access_token"); // Supposons que le token est stocké dans localStorage
    if (token) {
      const decodedToken = jwtDecode(token);
      setIsAdmin(decodedToken.role === "admin"); // Assurez-vous que le token contient un champ 'role'
    }
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(1);
  };

  const handleAddOrUpdateTaux = async () => {
    try {
      if (selectedTaux) {
        await axios.put(
          `http://127.0.0.1:8000/api/taux/${selectedTaux.id}/`,
          newTaux
        );
      } else {
        await axios.post("http://127.0.0.1:8000/api/taux/", {
          ...newTaux,
          bailleur: bailleurId,
        });
      }
      setNewTaux({ valeur: "", date_debut: "", date_fin: "" });
      fetchBailleurAndTaux();
      setDialogOpen(false);
    } catch (error) {
      if (error.response && error.response.data && error.response.data.detail) {
        alert(error.response.data.detail);
      } else {
        console.error(
          "Erreur lors de la création/modification de la source:",
          error
        );
      }
    }
  };

  const handleDeleteTaux = async () => {
    try {
      await axios.delete(`http://127.0.0.1:8000/api/taux/${tauxToDelete.id}/`);
      fetchBailleurAndTaux();
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error("Erreur lors de la suppression du taux:", error);
    }
  };

  const handleEditTaux = (taux) => {
    setSelectedTaux(taux);
    setNewTaux({
      valeur: taux.valeur,
      date_debut: taux.date_debut,
      date_fin: taux.date_fin,
    });
    setDialogOpen(true); // Ouvrir la boîte de dialogue pour la modification
  };

  const handleOpenDialog = () => {
    setSelectedTaux(null);
    setNewTaux({ valeur: "", date_debut: "", date_fin: "" });
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false); // Fermer la boîte de dialogue
  };

  const handleOpenDeleteDialog = (taux) => {
    setTauxToDelete(taux);
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
  };

  const isCurrentTaux = (taux) => {
    const currentDate = new Date();
    const dateDebut = new Date(taux.date_debut);
    const dateFin = new Date(taux.date_fin);
    return currentDate >= dateDebut && currentDate <= dateFin;
  };

  return (
    <div className="container">
      <h1 style={{ textAlign: "center" }}>
        Taux pour le bailleur{" "}
        <span style={{ color: "blue" }}>{bailleurNom}</span>
      </h1>
      {isAdmin && (
        <div>
          <Button
            variant="contained"
            color="primary"
            onClick={handleOpenDialog}
          >
            Ajouter un taux
          </Button>
        </div>
      )}
      <br />
      {taux.length === 0 ? (
        <Alert severity="info" className="mt-3">
          Aucun taux trouvé.
        </Alert>
      ) : (
        <TableContainer component={Paper} className="table">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell style={{ width: "30%" }}>Valeur</TableCell>
                <TableCell style={{ width: "30%" }}>Date début</TableCell>
                <TableCell style={{ width: "30%" }}>Date fin</TableCell>
                {isAdmin && (
                  <TableCell style={{ width: "10%" }}>Actions</TableCell>
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {taux
                .slice((page - 1) * rowsPerPage, page * rowsPerPage)
                .map((t) => (
                  <TableRow key={t.id}>
                    <TableCell
                      style={{
                        width: "30%",
                        color: isCurrentTaux(t) ? "green" : "black",
                      }}
                    >
                      {t.valeur}
                    </TableCell>
                    <TableCell style={{ width: "30%" }}>
                      {t.date_debut}
                    </TableCell>
                    <TableCell style={{ width: "30%" }}>{t.date_fin}</TableCell>
                    {isAdmin && (
                      <TableCell style={{ width: "10%" }}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-evenly",
                            alignItems: "center",
                          }}
                        >
                          <Button
                            variant="contained"
                            color="primary"
                            onClick={() => handleEditTaux(t)}
                            className="mr-5"
                          >
                            Modifier
                          </Button>
                          <Button
                            variant="contained"
                            color="error"
                            onClick={() => handleOpenDeleteDialog(t)}
                          >
                            Supprimer
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      <br />
      <Pagination
        count={totalPages}
        page={page}
        onChange={handlePageChange}
        rowsPerPage={rowsPerPage}
        onChangeRowsPerPage={handleRowsPerPageChange}
      />
      <Dialog open={dialogOpen} onClose={handleCloseDialog}>
        <DialogTitle>
          {selectedTaux ? "Modifier le taux" : "Ajouter un nouveau taux"}
        </DialogTitle>
        <DialogContent>
          <TextField
            label="Valeur"
            value={newTaux.valeur}
            onChange={(e) => setNewTaux({ ...newTaux, valeur: e.target.value })}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Date début"
            type="date"
            value={newTaux.date_debut}
            onChange={(e) =>
              setNewTaux({ ...newTaux, date_debut: e.target.value })
            }
            InputLabelProps={{ shrink: true }}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Date fin"
            type="date"
            value={newTaux.date_fin}
            onChange={(e) =>
              setNewTaux({ ...newTaux, date_fin: e.target.value })
            }
            InputLabelProps={{ shrink: true }}
            fullWidth
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Annuler</Button>
          <Button onClick={handleAddOrUpdateTaux} color="primary">
            {selectedTaux ? "Modifier" : "Ajouter"}
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
      >
        <DialogTitle>Confirmation de suppression</DialogTitle>
        <DialogContent>
          Êtes-vous sûr de vouloir supprimer ce taux ?
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Annuler</Button>
          <Button onClick={handleDeleteTaux} color="error">
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default TauxTab;
