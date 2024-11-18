import React, { useState, useEffect } from "react";
import axios from "axios";
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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import { jwtDecode } from "jwt-decode";
import Alert from "@mui/material/Alert";

const SourceTab = ({ bailleurs }) => {
  const [sources, setSources] = useState([]);
  const [formData, setFormData] = useState({
    bailleur: "",
    date_debut_utilisation: "",
    date_fin_utilisation: "",
  });
  const [selectedSource, setSelectedSource] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [totalPages, setTotalPages] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAdmin, setIsAdmin] = useState(false); // Nouvel état pour suivre si l'utilisateur est admin

  useEffect(() => {
    fetchSources();
    checkIfAdmin(); // Vérifier si l'utilisateur est admin
  }, [page, rowsPerPage, searchTerm, bailleurs, selectedSource]);

  const fetchSources = async () => {
    try {
      const response = await axios.get(
        `http://127.0.0.1:8000/api/sources-courantes/?search=${searchTerm}`
      );
      const updatedSources = response.data.map((source) => ({
        ...source,
        bailleur_nom:
          bailleurs.find((bailleur) => bailleur.id === source.bailleur)?.nom ||
          "Inconnu",
      }));
      const totalCount = updatedSources.length;
      const totalPages = Math.ceil(totalCount / rowsPerPage);
      setSources(updatedSources);
      setTotalPages(totalPages);
    } catch (error) {
      console.error("Erreur lors de la récupération des sources:", error);
    }
  };

  const checkIfAdmin = () => {
    const token = localStorage.getItem("access_token"); // Supposons que le token est stocké dans localStorage
    if (token) {
      const decodedToken = jwtDecode(token);
      setIsAdmin(decodedToken.role === "admin"); // Assurez-vous que le token contient un champ 'role'
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const endpoint = selectedSource
        ? `http://127.0.0.1:8000/api/sources-courantes/${selectedSource.id}/`
        : `http://127.0.0.1:8000/api/sources-courantes/`;
      const method = selectedSource ? "put" : "post";

      const response = await axios[method](endpoint, formData);
      setSources(
        selectedSource
          ? sources.map((source) =>
              source.id === selectedSource.id ? response.data : source
            )
          : [...sources, response.data]
      );
      setFormData({
        bailleur: "",
        date_debut_utilisation: "",
        date_fin_utilisation: "",
      });
      setSelectedSource(null);
      setOpenDialog(false);
      fetchSources(); // Refresh sources list
    } catch (error) {
      console.error(
        "Erreur lors de la création/modification de la source:",
        error
      );
      if (error.response && error.response.data && error.response.data.detail) {
        alert(error.response.data.detail);
      }
    }
  };

  const handleDeleteSource = async (sourceId) => {
    try {
      await axios.delete(
        `http://127.0.0.1:8000/api/sources-courantes/${sourceId}/`
      );
      setSources(sources.filter((source) => source.id !== sourceId));
    } catch (error) {
      console.error("Erreur lors de la suppression de la source:", error);
    }
  };

  const handleUpdateDialogOpen = (source) => {
    setSelectedSource(source);
    setFormData({
      bailleur: source.bailleur,
      date_debut_utilisation: source.date_debut_utilisation,
      date_fin_utilisation: source.date_fin_utilisation,
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedSource(null);
    setFormData({
      bailleur: "",
      date_debut_utilisation: "",
      date_fin_utilisation: "",
    }); // Reset form data
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
    fetchSources();
  };

  const isSourceCurrent = (source) => {
    const startDate = new Date(source.date_debut_utilisation);
    const endDate = new Date(source.date_fin_utilisation);
    return currentDate >= startDate && currentDate <= endDate;
  };

  const currentDate = new Date();

  return (
    <div className="container">
      <h1>Gestion des sources</h1>
      <div className="mb-3">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          {isAdmin && (
            <Button
              color="primary"
              onClick={() => {
                setSelectedSource(null);
                setOpenDialog(true);
              }}
            >
              Ajouter
            </Button>
          )}
          <TextField
            label="Rechercher par bailleur"
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
          />
        </div>
      </div>
      {sources.length === 0 ? (
        <Alert severity="info" className="mt-3">
          Aucun bailleur trouvé.
        </Alert>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Bailleur</TableCell>
                <TableCell>Date début utilisation</TableCell>
                <TableCell>Date fin utilisation</TableCell>
                {isAdmin && <TableCell>Actions</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {sources
                .slice((page - 1) * rowsPerPage, page * rowsPerPage)
                .map((source) => (
                  <TableRow key={source.id}>
                    <TableCell
                      style={{
                        color: isSourceCurrent(source) ? "green" : "black",
                      }}
                    >
                      {source.bailleur_nom}
                    </TableCell>
                    <TableCell>{source.date_debut_utilisation}</TableCell>
                    <TableCell>{source.date_fin_utilisation}</TableCell>
                    {isAdmin && (
                      <TableCell>
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={() => handleUpdateDialogOpen(source)}
                        >
                          Modifier
                        </Button>
                        <Button
                          variant="contained"
                          color="error"
                          onClick={() => handleDeleteSource(source.id)}
                        >
                          Supprimer
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      <Pagination
        count={totalPages}
        page={page}
        onChange={handlePageChange}
        color="primary"
        className="mt-3"
      />
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>
          {selectedSource ? "Modifier la source" : "Ajouter une source"}
        </DialogTitle>
        <DialogContent>
          <form onSubmit={handleSubmit}>
            <FormControl fullWidth margin="normal">
              <InputLabel id="bailleur-label">
                Sélectionnez un bailleur
              </InputLabel>
              <Select
                labelId="bailleur-label"
                id="bailleur"
                name="bailleur"
                value={formData.bailleur}
                onChange={handleChange}
                label="Sélectionnez un bailleur"
              >
                <MenuItem value="">
                  <em>Sélectionnez un bailleur</em>
                </MenuItem>
                {bailleurs.map((bailleur) => (
                  <MenuItem key={bailleur.id} value={bailleur.id}>
                    {bailleur.nom}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              type="date"
              name="date_debut_utilisation"
              value={formData.date_debut_utilisation}
              onChange={handleChange}
              label="Date début utilisation"
              fullWidth
              margin="normal"
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              type="date"
              name="date_fin_utilisation"
              value={formData.date_fin_utilisation}
              onChange={handleChange}
              label="Date fin utilisation"
              fullWidth
              margin="normal"
              InputLabelProps={{ shrink: true }}
            />
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Annuler</Button>
          <Button onClick={handleSubmit}>Enregistrer</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default SourceTab;
