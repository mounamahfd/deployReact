import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from "@mui/material";
import { Link } from "react-router-dom";
import { Pagination } from "@mui/material";
import Alert from "@mui/material/Alert";

const EmprunteursremPage = () => {
  const [emprunteurs, setEmprunteurs] = useState([]);
  const [formData, setFormData] = useState({
    montant: "",
  });
  const [selectedEmprunteur, setSelectedEmprunteur] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(3);
  const [totalPages, setTotalPages] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
    const [token, setToken] = useState(localStorage.getItem("access_token"));


  useEffect(() => {
    fetchData();
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
      setEmprunteurs(response.data);
      setTotalPages(totalPages);
    } catch (error) {
      console.error("Erreur lors de la récupération des emprunteurs :", error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const endpoint = selectedEmprunteur
        ? `http://127.0.0.1:8000/api/emprunteurs/${selectedEmprunteur.id}/remboursements/`
        : "http://127.0.0.1:8000/api/emprunteurs/remboursements/";
      const method = selectedEmprunteur ? "put" : "post";
      const response = await axios[method](endpoint, formData);
      setEmprunteurs(
        selectedEmprunteur
          ? emprunteurs.map((emprunteur) =>
              emprunteur.id === selectedEmprunteur.id
                ? response.data
                : emprunteur
            )
          : [...emprunteurs, response.data]
      );
      setFormData({ montant: "" });
      setSelectedEmprunteur(null);
      setOpenDialog(false);
    } catch (error) {
      console.error("Error creating/updating remboursement:", error);
    }
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
      <h1>Remboursements</h1>
      <hr className="mt-1 mb-2" />

      <div className="mb-3">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <TextField
            label="Rechercher un client"
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
            style={{ color: "white" }}
          />
        </div>
      </div>
      {emprunteurs.length === 0 ? (
        <Alert severity="info" className="mt-3">
          Aucun client trouvé.
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
              </tr>
            </thead>
            <tbody>
              {emprunteurs.map((emprunteur) => (
                <tr key={emprunteur.id}>
                  <td>
                    <Link
                      className="btn btn-sm btn-info"
                      to={`/inforemempr/${emprunteur.id}`}
                    >
                      Voir
                    </Link>
                  </td>
                  <td>
                    {emprunteur.prenom} {emprunteur.nom}
                  </td>
                  <td>{emprunteur.telephone}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
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

export default EmprunteursremPage;
