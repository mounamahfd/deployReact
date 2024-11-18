import React, { useState, useEffect } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Pagination,
} from "@mui/material";
import { Link } from "react-router-dom";

const Bailleurtab = () => {
  const [bailleurs, setBailleurs] = useState([]);
  const [formData, setFormData] = useState({ nom: "" });
  const [selectedBailleur, setSelectedBailleur] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [bailleurToDelete, setBailleurToDelete] = useState(null);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [totalPages, setTotalPages] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [isNewBailleur, setIsNewBailleur] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    fetchBailleurs();
    checkIfAdmin();
  }, [page, rowsPerPage, searchTerm]);

  const fetchBailleurs = async () => {
    try {
      const response = await axios.get(
        `http://127.0.0.1:8000/api/bailleurs/?search=${searchTerm}`
      );
      const totalCount = response.data.length;
      const totalPages = Math.ceil(totalCount / rowsPerPage);
      setBailleurs(response.data);
      setTotalPages(totalPages);
    } catch (error) {
      console.error("Erreur lors de la récupération des bailleurs:", error);
    }
  };

  const checkIfAdmin = () => {
    const token = localStorage.getItem("access_token");
    if (token) {
      const decodedToken = jwtDecode(token);
      console.log(decodedToken);
      setIsAdmin(decodedToken.role === "admin");
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const endpoint = selectedBailleur
        ? `http://127.0.0.1:8000/api/bailleurs/${selectedBailleur.id}/`
        : `http://127.0.0.1:8000/api/bailleurs/`;
      const method = selectedBailleur ? "put" : "post";
      const response = await axios[method](endpoint, formData);
      setBailleurs(
        selectedBailleur
          ? bailleurs.map((bailleur) =>
              bailleur.id === selectedBailleur.id ? response.data : bailleur
            )
          : [...bailleurs, response.data]
      );
      setFormData({ nom: "" });
      setSelectedBailleur(null);
      setOpenDialog(false);
    } catch (error) {
      console.error(
        "Erreur lors de la création/modification du bailleur:",
        error
      );
    }
  };

  const handleDeleteBailleur = async () => {
    try {
      await axios.delete(
        `http://127.0.0.1:8000/api/bailleurs/${bailleurToDelete.id}/`
      );
      setBailleurs(
        bailleurs.filter((bailleur) => bailleur.id !== bailleurToDelete.id)
      );
      setOpenDeleteDialog(false);
      setBailleurToDelete(null);
    } catch (error) {
      console.error("Erreur lors de la suppression du bailleur:", error);
    }
  };

  const handleUpdateDialogOpen = (bailleur) => {
    setSelectedBailleur(bailleur);
    setFormData(bailleur);
    setIsNewBailleur(false);
    setOpenDialog(true);
  };

  const handleOpenDialog = () => {
    setSelectedBailleur(null);
    setFormData({ nom: "" });
    setIsNewBailleur(true);
    setOpenDialog(true);
  };

  const handleOpenDeleteDialog = (bailleur) => {
    setBailleurToDelete(bailleur);
    setOpenDeleteDialog(true);
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
    fetchBailleurs();
  };

  return (
    <div className="container">
      <h1>Gestion des bailleurs</h1>
      <div className="mb-3">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          {isAdmin && (
            <Button color="primary" onClick={handleOpenDialog}>
              Ajouter
            </Button>
          )}
          <TextField
            label="Rechercher par nom"
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
            style={{ color: "white" }}
          />
        </div>
      </div>
      <TableContainer component={Paper} className="table">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell style={{ width: "30%" }}>Nom</TableCell>
              {isAdmin && (
                <TableCell style={{ width: "30%" }}>Actions</TableCell>
              )}
              <TableCell style={{ width: "30%" }}></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {bailleurs
              .slice((page - 1) * rowsPerPage, page * rowsPerPage)
              .map((bailleur) => (
                <TableRow key={bailleur.id}>
                  <TableCell style={{ width: "30%" }}>{bailleur.nom}</TableCell>
                  {isAdmin && (
                    <TableCell style={{ width: "30%" }}>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => handleUpdateDialogOpen(bailleur)}
                      >
                        Modifier
                      </Button>
                      <Button
                        variant="contained"
                        className="ml-2"
                        color="error"
                        onClick={() => handleOpenDeleteDialog(bailleur)}
                      >
                        Supprimer
                      </Button>
                    </TableCell>
                  )}
                  <TableCell style={{ width: "30%" }}>
                    <Link
                      className="btn btn-sm btn-info"
                      to={`/tauxbybailleur/${bailleur.id}`}
                    >
                      taux-par-bailleur
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
      <br />
      <Pagination
        count={totalPages}
        page={page}
        onChange={handlePageChange}
        rowsPerPage={rowsPerPage}
        onChangeRowsPerPage={handleRowsPerPageChange}
      />
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>
          {isNewBailleur ? "Ajouter un bailleur" : "Modifier le bailleur"}
        </DialogTitle>
        <DialogContent>
          <form onSubmit={handleSubmit}>
            <TextField
              name="nom"
              value={formData.nom}
              onChange={handleChange}
              label="Nom"
              fullWidth
              margin="normal"
            />
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Annuler</Button>
          <Button onClick={handleSubmit}>Enregistrer</Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
      >
        <DialogTitle>Confirmation de suppression</DialogTitle>
        <DialogContent>
          Êtes-vous sûr de vouloir supprimer ce bailleur ?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Annuler</Button>
          <Button onClick={handleDeleteBailleur} color="error">
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Bailleurtab;
