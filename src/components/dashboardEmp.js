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
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import Alert from "@mui/material/Alert";

const DashboardEmp = ({ client, categories }) => {
  const [prets, setPrets] = useState([]);
  const [formData, setFormData] = useState({
    objet: "",
    montant_initial: "",
    duree: "",
  });
  const [selectedPret, setSelectedPret] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(2);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAdmin, setIsAdmin] = useState(false); // Nouvel état pour suivre si l'utilisateur est admin
  const navigate = useNavigate();
  const [token, setToken] = useState(localStorage.getItem("access_token"));


  useEffect(() => {
    fetchPrets();
    checkIfAdmin(); // Vérifier si l'utilisateur est admin
  }, [categories]);

  const fetchPrets = async () => {
    try {
      const response = await axios.get(
        `http://127.0.0.1:8000/api/emprunteurs/${client.id}/prets/`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const updatedPrets = response.data.map((pret) => ({
        ...pret,
        categorie_nom:
          categories.find((category) => category.id === pret.objet)?.nom ||
          "Unknown",
      }));
      setPrets(updatedPrets);
    } catch (error) {
      console.error("Error fetching prêts:", error);
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
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const endpoint = selectedPret
        ? `http://127.0.0.1:8000/api/emprunteurs/${client.id}/prets/${selectedPret.id}/`
        : `http://127.0.0.1:8000/api/emprunteurs/${client.id}/prets/`;
      const method = selectedPret ? "put" : "post";
      const response = await axios[method](endpoint, formData);

      const categorieNom =
        categories.find((category) => category.id === formData.objet)?.nom ||
        "Unknown";

      if (selectedPret) {
        setPrets(
          prets.map((pret) =>
            pret.id === selectedPret.id
              ? { ...response.data, categorie_nom: categorieNom }
              : pret
          )
        );
      } else {
        setPrets([...prets, { ...response.data, categorie_nom: categorieNom }]);
      }

      setFormData({ objet: "", montant_initial: "", date_octroi: "" });
      setSelectedPret(null);
      setOpenDialog(false);
    } catch (error) {
      console.error("Error creating/updating prêt:", error);
    }
  };

  const handleDeletePret = async (pretId) => {
    try {
      await axios.delete(
        `http://127.0.0.1:8000/api/emprunteurs/${client.id}/prets/${pretId}/`
      );
      setPrets(prets.filter((pret) => pret.id !== pretId));
    } catch (error) {
      console.error("Error deleting prêt:", error);
    }
  };

  const handleUpdateDialogOpen = (pret) => {
    setSelectedPret(pret);
    setFormData(pret);
    setOpenDialog(true);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const handleDownloadPDF = async (pretId) => {
    try {
      const response = await axios.get(
        `http://127.0.0.1:8000/api/prets/${pretId}/pdf/`,
        {
          responseType: "blob",
        }
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `pret_${pretId}_detail.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Error downloading PDF:", error);
    }
  };

  const handleLoanClick = (e) => {
    const token = localStorage.getItem("access_token"); // Supposons que le token est stocké dans localStorage
    if (token) {
      const decodedToken = jwtDecode(token);
      if (decodedToken.role !== "admin") {
        e.preventDefault();
        alert("Vous n'êtes pas autorisé à prendre un prêt.");
      } else {
        navigate(`/demande/${client.id}`);
      }
    } else {
      e.preventDefault();
      alert("Vous devez être connecté pour prendre un prêt.");
    }
  };

  const filteredPrets = prets.filter(
    (pret) =>
      pret.categorie_nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pret.montant_initial.toString().startsWith(searchTerm) ||
      pret.duree.toString().startsWith(searchTerm)
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredPrets.slice(indexOfFirstItem, indexOfLastItem);

  const handleNextPage = () => {
    const maxPages = Math.ceil(filteredPrets.length / itemsPerPage);
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

  return (
    <div>
      <div className="row">
        <div className="col-xl-4 col-md-6 mb-6">
          <div className="card bg-primary text-white">
            <div className="card-body">
              <h5>
                Client : {client.nom} {client.prenom}
              </h5>
              <hr />
              <button
                onClick={handleLoanClick}
                className="btn btn-outline-white btn-sm btn-block btn-outline-light"
                style={{ padding: "12px" }}
              >
                Prendre un prêt
              </button>
            </div>
          </div>
        </div>

        <div className="col-xl-4 col-md-6 mb-6">
          <div className="card bg-info text-white">
            <div className="card-body">
              <div className="text-m font-weight-bold text-white text-uppercase mb-1">
                <h2>Informations de contact</h2>
              </div>
              <hr />
              <p>Email: {client.email}</p>
              <p>Téléphone: {client.telephone}</p>
            </div>
          </div>
        </div>

        <div className="col-xl-4 col-md-6 mb-6">
          <div
            className="card text-white"
            style={{ backgroundColor: "#80ced6" }}
          >
            <div className="card-body">
              <div className="text-m font-weight-bold text-white text-uppercase mb-1">
                <h2>Total Prêts</h2>
              </div>
              <hr />
              <h1
                style={{
                  textAlign: "center",
                  padding: "10px",
                  fontSize: "20px",
                }}
              >
                {prets.length}
              </h1>
            </div>
          </div>
        </div>
      </div>
      <input
        type="text"
        className="form-control form-control-sm mb-3"
        style={{ width: "100%", maxWidth: "300px" }}
        placeholder="Rechercher par Catégorie, Montant ou Durée"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <div className="mb-2 mt-3">
        <button
          className="btn btn-primary btn-sm mr-2 ml-3"
          onClick={handlePrevPage}
          disabled={currentPage === 1}
        >
          Précédent
        </button>
        <button
          className="btn btn-primary btn-sm mr-2"
          onClick={handleNextPage}
          disabled={
            currentPage === Math.ceil(filteredPrets.length / itemsPerPage)
          }
        >
          Suivant
        </button>
      </div>
      <div className="row">
        <div className="col-md">
          {prets.length === 0 ? (
            <Alert severity="info" className="mt-3">
              Aucun prêt n'a été pris.
            </Alert>
          ) : (
            <div className="card card-body">
              <table className="table table-sm">
                <thead>
                  <tr>
                    <th></th>
                    <th>Catégorie</th>
                    <th>Montant</th>
                    <th>Date Prêt</th>
                    <th>Durée (mois)</th>
                    {isAdmin && <th>Modifier</th>}
                    {isAdmin && <th>Supprimer</th>}
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.map((pret) => (
                    <tr key={pret.id}>
                      <td>
                        <Link
                          className="btn btn-sm btn-info"
                          to={`/repayments/${client.id}/${pret.id}`}
                        >
                          Voir Remboursements
                        </Link>
                      </td>
                      <td>{pret.categorie_nom}</td>
                      <td>{pret.montant_initial}</td>
                      <td>{formatDate(pret.date_octroi)}</td>
                      <td>{pret.duree}</td>
                      {isAdmin && (
                        <td>
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => handleUpdateDialogOpen(pret)}
                          >
                            Modifier
                          </button>
                        </td>
                      )}
                      {isAdmin && (
                        <td>
                          <button
                            onClick={() => handleDeletePret(pret.id)}
                            className="btn btn-danger btn-sm"
                          >
                            Supprimer
                          </button>
                        </td>
                      )}
                      <td>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleDownloadPDF(pret.id)}
                        >
                          Télécharger PDF
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
          <DialogTitle>
            {selectedPret ? "Modifier le prêt" : "Créer un prêt"}
          </DialogTitle>
          <DialogContent>
            <form onSubmit={handleSubmit}>
              <TextField
                name="objet"
                value={formData.objet}
                onChange={handleChange}
                label="Objet"
                fullWidth
                margin="normal"
              />
              <TextField
                name="montant_initial"
                value={formData.montant_initial}
                onChange={handleChange}
                label="Montant initial"
                fullWidth
                margin="normal"
              />
              <TextField
                type="number"
                name="duree"
                value={formData.duree}
                onChange={handleChange}
                label="Durée (mois)"
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
      </div>
    </div>
  );
};

export default DashboardEmp;

// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import { jwtDecode } from "jwt-decode";
// import {
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   Button,
//   TextField,
// } from "@mui/material";
// import { Link } from "react-router-dom";

// const DashboardEmp = ({ client, categories }) => {
//   const [prets, setPrets] = useState([]);
//   const [formData, setFormData] = useState({
//     objet: "",
//     montant_initial: "",
//     duree: "",
//   });
//   const [selectedPret, setSelectedPret] = useState(null);
//   const [openDialog, setOpenDialog] = useState(false);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [itemsPerPage, setItemsPerPage] = useState(2);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [isAdmin, setIsAdmin] = useState(false); // Nouvel état pour suivre si l'utilisateur est admin

//   useEffect(() => {
//     fetchPrets();
//     checkIfAdmin(); // Vérifier si l'utilisateur est admin
//   }, [categories]);

//   const fetchPrets = async () => {
//     try {
//       const response = await axios.get(
//         `http://127.0.0.1:8000/api/emprunteurs/${client.id}/prets/`
//       );
//       const updatedPrets = response.data.map((pret) => ({
//         ...pret,
//         categorie_nom:
//           categories.find((category) => category.id === pret.objet)?.nom ||
//           "Unknown",
//       }));
//       setPrets(updatedPrets);
//     } catch (error) {
//       console.error("Error fetching prêts:", error);
//     }
//   };

//   const checkIfAdmin = () => {
//     const token = localStorage.getItem("access_token"); // Supposons que le token est stocké dans localStorage
//     if (token) {
//       const decodedToken = jwtDecode(token);
//       setIsAdmin(decodedToken.role === "admin"); // Assurez-vous que le token contient un champ 'role'
//     }
//   };

//   const handleChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       const endpoint = selectedPret
//         ? `http://127.0.0.1:8000/api/emprunteurs/${client.id}/prets/${selectedPret.id}/`
//         : `http://127.0.0.1:8000/api/emprunteurs/${client.id}/prets/`;
//       const method = selectedPret ? "put" : "post";
//       const response = await axios[method](endpoint, formData);

//       const categorieNom =
//         categories.find((category) => category.id === formData.objet)?.nom ||
//         "Unknown";

//       if (selectedPret) {
//         setPrets(
//           prets.map((pret) =>
//             pret.id === selectedPret.id
//               ? { ...response.data, categorie_nom: categorieNom }
//               : pret
//           )
//         );
//       } else {
//         setPrets([...prets, { ...response.data, categorie_nom: categorieNom }]);
//       }

//       setFormData({ objet: "", montant_initial: "", date_octroi: "" });
//       setSelectedPret(null);
//       setOpenDialog(false);
//     } catch (error) {
//       console.error("Error creating/updating prêt:", error);
//     }
//   };

//   const handleDeletePret = async (pretId) => {
//     try {
//       await axios.delete(
//         `http://127.0.0.1:8000/api/emprunteurs/${client.id}/prets/${pretId}/`
//       );
//       setPrets(prets.filter((pret) => pret.id !== pretId));
//     } catch (error) {
//       console.error("Error deleting prêt:", error);
//     }
//   };

//   const handleUpdateDialogOpen = (pret) => {
//     setSelectedPret(pret);
//     setFormData(pret);
//     setOpenDialog(true);
//   };

//   const formatDate = (dateString) => {
//     const date = new Date(dateString);
//     return date.toLocaleDateString();
//   };

//   const handleDownloadPDF = async (pretId) => {
//     try {
//       const response = await axios.get(
//         `http://127.0.0.1:8000/api/prets/${pretId}/pdf/`,
//         {
//           responseType: "blob",
//         }
//       );
//       const url = window.URL.createObjectURL(new Blob([response.data]));
//       const link = document.createElement("a");
//       link.href = url;
//       link.setAttribute("download", `pret_${pretId}_detail.pdf`);
//       document.body.appendChild(link);
//       link.click();
//       link.remove();
//     } catch (error) {
//       console.error("Error downloading PDF:", error);
//     }
//   };

//   const filteredPrets = prets.filter(
//     (pret) =>
//       pret.categorie_nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       pret.montant_initial.toString().startsWith(searchTerm) ||
//       pret.duree.toString().startsWith(searchTerm)
//   );

//   const indexOfLastItem = currentPage * itemsPerPage;
//   const indexOfFirstItem = indexOfLastItem - itemsPerPage;
//   const currentItems = filteredPrets.slice(indexOfFirstItem, indexOfLastItem);

//   const handleNextPage = () => {
//     const maxPages = Math.ceil(filteredPrets.length / itemsPerPage);
//     if (currentPage < maxPages) {
//       setCurrentPage(currentPage + 1);
//     }
//   };

//   const handlePrevPage = () => {
//     if (currentPage > 1) {
//       setCurrentPage(currentPage - 1);
//     }
//   };

//   useEffect(() => {
//     setCurrentPage(1);
//   }, [searchTerm]);

//   return (
//     <div>
//       <div className="row">
//         <div className="col-xl-4 col-md-6 mb-6">
//           <div className="card bg-primary text-white">
//             <div className="card-body">
//               <h5>
//                 Client : {client.nom} {client.prenom}
//               </h5>
//               <hr />
//               <Link
//                 to={`/demande/${client.id}`}
//                 className="btn btn-outline-white btn-sm btn-block btn-outline-light"
//                 style={{ padding: "12px" }}
//               >
//                 Prendre un prêt
//               </Link>
//             </div>
//           </div>
//         </div>

//         <div className="col-xl-4 col-md-6 mb-6">
//           <div className="card bg-info text-white">
//             <div className="card-body">
//               <div className="text-m font-weight-bold text-white text-uppercase mb-1">
//                 <h2>Informations de contact</h2>
//               </div>
//               <hr />
//               <p>Email: {client.email}</p>
//               <p>Téléphone: {client.telephone}</p>
//             </div>
//           </div>
//         </div>

//         <div className="col-xl-4 col-md-6 mb-6">
//           <div
//             className="card text-white"
//             style={{ backgroundColor: "#80ced6" }}
//           >
//             <div className="card-body">
//               <div className="text-m font-weight-bold text-white text-uppercase mb-1">
//                 <h2>Total Prêts</h2>
//               </div>
//               <hr />
//               <h1
//                 style={{
//                   textAlign: "center",
//                   padding: "10px",
//                   fontSize: "20px",
//                 }}
//               >
//                 {prets.length}
//               </h1>
//             </div>
//           </div>
//         </div>
//       </div>
//       <input
//         type="text"
//         className="form-control form-control-sm mb-3"
//         style={{ width: "100%", maxWidth: "300px" }}
//         placeholder="Rechercher par Catégorie, Montant ou Durée"
//         value={searchTerm}
//         onChange={(e) => setSearchTerm(e.target.value)}
//       />

//       <div className="mb-2 mt-3">
//         <button
//           className="btn btn-primary btn-sm mr-2 ml-3"
//           onClick={handlePrevPage}
//           disabled={currentPage === 1}
//         >
//           Précédent
//         </button>
//         <button
//           className="btn btn-primary btn-sm mr-2"
//           onClick={handleNextPage}
//           disabled={
//             currentPage === Math.ceil(filteredPrets.length / itemsPerPage)
//           }
//         >
//           Suivant
//         </button>
//       </div>
//       <div className="row">
//         <div className="col-md">
//           <div className="card card-body">
//             <table className="table table-sm">
//               <thead>
//                 <tr>
//                   <th></th>
//                   <th>Catégorie</th>
//                   <th>Montant</th>
//                   <th>Date Prêt</th>
//                   <th>Durée (mois)</th>
//                   {isAdmin && <th>Modifier</th>}
//                   {isAdmin && <th>Supprimer</th>}
//                   <th></th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {currentItems.map((pret) => (
//                   <tr key={pret.id}>
//                     <td>
//                       <Link
//                         className="btn btn-sm btn-info"
//                         to={`/repayments/${client.id}/${pret.id}`}
//                       >
//                         Voir Remboursements
//                       </Link>
//                     </td>
//                     <td>{pret.categorie_nom}</td>
//                     <td>{pret.montant_initial}</td>
//                     <td>{formatDate(pret.date_octroi)}</td>
//                     <td>{pret.duree}</td>
//                     {isAdmin && (
//                       <td>
//                         <button
//                           className="btn btn-primary btn-sm"
//                           onClick={() => handleUpdateDialogOpen(pret)}
//                         >
//                           Modifier
//                         </button>
//                       </td>
//                     )}
//                     {isAdmin && (
//                       <td>
//                         <button
//                           onClick={() => handleDeletePret(pret.id)}
//                           className="btn btn-danger btn-sm"
//                         >
//                           Supprimer
//                         </button>
//                       </td>
//                     )}
//                     <td>
//                       <button
//                         className="btn btn-secondary btn-sm"
//                         onClick={() => handleDownloadPDF(pret.id)}
//                       >
//                         Télécharger PDF
//                       </button>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </div>

//         <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
//           <DialogTitle>
//             {selectedPret ? "Modifier le prêt" : "Créer un prêt"}
//           </DialogTitle>
//           <DialogContent>
//             <form onSubmit={handleSubmit}>
//               <TextField
//                 name="objet"
//                 value={formData.objet}
//                 onChange={handleChange}
//                 label="Objet"
//                 fullWidth
//                 margin="normal"
//               />
//               <TextField
//                 name="montant_initial"
//                 value={formData.montant_initial}
//                 onChange={handleChange}
//                 label="Montant initial"
//                 fullWidth
//                 margin="normal"
//               />
//               <TextField
//                 type="number"
//                 name="duree"
//                 value={formData.duree}
//                 onChange={handleChange}
//                 label="Durée (mois)"
//                 fullWidth
//                 margin="normal"
//               />
//             </form>
//           </DialogContent>
//           <DialogActions>
//             <Button onClick={() => setOpenDialog(false)} color="error">
//               Annuler
//             </Button>
//             <Button onClick={handleSubmit} color="primary">
//               Enregistrer
//             </Button>
//           </DialogActions>
//         </Dialog>
//       </div>
//     </div>
//   );
// };

// export default DashboardEmp;
