import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Modal,
  TextField,
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Pagination,
  Alert,
} from "@mui/material";
import { debounce } from "lodash";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [token, setToken] = useState(localStorage.getItem("access_token"));
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [errors, setErrors] = useState({});

  const [newUser, setNewUser] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(3);
  const [totalPages, setTotalPages] = useState(0);

  const navigate = useNavigate();

  useEffect(() => {
    checkIfAdmin();
  }, []);

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin, page, rowsPerPage, searchTerm]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `http://127.0.0.1:8000/user_api/users/?search=${searchTerm}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const nonAdminUsers = response.data.filter(
        (user) => user.role !== "admin"
      );

      const totalCount = nonAdminUsers.length;
      const totalPages = Math.ceil(totalCount / rowsPerPage);

      setUsers(nonAdminUsers.slice((page - 1) * rowsPerPage, page * rowsPerPage));
      setTotalPages(totalPages);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching users:", error);
      setLoading(false);
    }
  };

  const toggleUserActivation = async (userId) => {
    try {
      const response = await axios.post(
        `http://127.0.0.1:8000/user_api/activate-deactivate-user/${userId}/`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUsers(
        users.map((user) =>
          user.user_id === userId
            ? { ...user, is_active: response.data.is_active }
            : user
        )
      );
    } catch (error) {
      console.error("Error toggling user activation:", error);
    }
  };

  const checkIfAdmin = () => {
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        if (decodedToken.role === "admin") {
          setIsAdmin(true);
        } else {
          navigate("/home");
        }
      } catch (error) {
        console.error("Error decoding token:", error);
        navigate("/home");
      }
    } else {
      navigate("/");
    }
  };

  const handleShowModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddUser = async () => {
    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/user_api/register/",
        newUser,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setUsers((prev) => [...prev, response.data]);
      setNewUser({ username: "", email: "", password: "" });
      handleCloseModal();
      fetchUsers();
    } catch (error) {
      if (error.response && error.response.data) {
        setErrors(error.response.data);
      } else {
        console.error("Erreur lors de l'ajout de l'utilisateur :", error);
      }
    }
  };


  const debouncedFetchUsers = useCallback(
    debounce(() => {
      setPage(1);
      fetchUsers();
    }, 300),
    [searchTerm]
  );

  const handleSearchTermChange = (e) => {
    setSearchTerm(e.target.value);
    debouncedFetchUsers();
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(1);
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="col-md-12">
      <h1>Gestion des utilisateurs</h1>
      <hr className="mt-1 mb-2" />
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
              variant="contained"
              color="primary"
              onClick={handleShowModal}
              className="mb-3"
            >
              Ajouter un utilisateur
            </Button>
          )}
          <TextField
            label="Rechercher un utilisateur"
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={handleSearchTermChange}
            style={{ margin: "10px" }}
          />
        </div>
      </div>
      <div className="card card-body" style={{ maxHeight: "360px", overflowY: "auto" }}>
        {users.length === 0 ? (
          <Alert severity="info">Aucun utilisateur.</Alert>
        ) : (
          <table className="table table-sm">
            <thead>
              <tr>
                <th>Username</th>
                <th>Email</th>
                <th>Active</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.user_id}>
                  <td>{user.username}</td>
                  <td>{user.email}</td>
                  <td>{user.is_active ? "Active" : "Inactive"}</td>
                  <td>
                    <Button
                      onClick={() => toggleUserActivation(user.user_id)}
                      variant="contained"
                      color={user.is_active ? "error" : "primary"}
                    >
                      {user.is_active ? "Desactiver" : "Activer"}
                    </Button>
                  </td>

                  
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal open={showModal} onClose={handleCloseModal}>
  <Box
    sx={{
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      width: 400,
      bgcolor: "background.paper",
      boxShadow: 24,
      p: 4,
      outline: "none",
      borderRadius: "1%",
    }}
  >
    <Typography variant="h6" component="h2">
      Ajouter un utilisateur
    </Typography>
    <form>
    <TextField
  fullWidth
  margin="normal"
  id="username"
  name="username"
  label="Nom d'utilisateur"
  value={newUser.username}
  onChange={handleInputChange}
  error={!!errors.username}
  helperText={errors.username}
/>
<TextField
  fullWidth
  margin="normal"
  id="email"
  name="email"
  label="Email"
  type="email"
  value={newUser.email}
  onChange={handleInputChange}
  error={!!errors.email}
  helperText={errors.email}
/>
<TextField
  fullWidth
  margin="normal"
  id="password"
  name="password"
  label="Mot de passe"
  type="password"
  value={newUser.password}
  onChange={handleInputChange}
  error={!!errors.password}
  helperText={errors.password}
/>
    </form>
    <Box mt={2} display="flex" justifyContent="flex-end">
      <Button onClick={handleCloseModal} color="error">
        Annuler
      </Button>
      <Button onClick={handleAddUser} color="primary" sx={{ ml: 2 }}>
        Enregistrer
      </Button>
    </Box>
  </Box>
</Modal>



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

export default UserManagement;
