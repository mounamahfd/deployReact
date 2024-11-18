import React, { useState, useEffect } from "react";
import axios from "axios";
import { Modal, Button } from "react-bootstrap"; // Importer Modal et Button de react-bootstrap

const TablesContent = () => {
  const [emprunteurs, setEmprunteurs] = useState([]);
  const [selectedEmprunteur, setSelectedEmprunteur] = useState(null);
  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [telephone, setTelephone] = useState("");
  const [showModal, setShowModal] = useState(false); // State pour afficher ou masquer le modal

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await axios.get(
        "http://127.0.0.1:8000/api/emprunteurs/"
      );
      setEmprunteurs(response.data);
    } catch (error) {
      console.error("Erreur lors de la récupération des emprunteurs :", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://127.0.0.1:8000/api/emprunteurs/${id}/`);
      // Rafraîchir les données après la suppression
      fetchData();
    } catch (error) {
      console.error("Erreur lors de la suppression de l'emprunteur :", error);
    }
  };

  const handleEditModal = (emprunteur) => {
    setSelectedEmprunteur(emprunteur);
    setNom(emprunteur.nom);
    setEmail(emprunteur.email);
    setTelephone(emprunteur.telephone);
    setShowModal(true); // Afficher le modal
  };

  const handleEditSubmit = async () => {
    try {
      await axios.put(
        `http://127.0.0.1:8000/api/emprunteurs/${selectedEmprunteur.id}/`,
        {
          nom: nom,
          email: email,
          telephone: telephone,
        }
      );
      // Fermer le modal après la modification
      setShowModal(false);
      // Rafraîchir les données après la modification
      fetchData();
    } catch (error) {
      console.error("Erreur lors de la modification de l'emprunteur :", error);
    }
  };

  return (
    <div className="container-fluid">
      <h1 className="h3 mb-2 text-gray-800">Emprunteurs</h1>
      <p className="mb-4">Liste des emprunteurs enregistrés.</p>

      <div className="card shadow mb-4">
        <div className="card-header py-3">
          <h6 className="m-0 font-weight-bold text-primary">
            Tableau des Emprunteurs
          </h6>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table
              className="table table-bordered"
              id="dataTable"
              width="100%"
              cellspacing="0"
            >
              <thead>
                <tr>
                  {/* <th>ID</th> */}
                  <th>Nom</th>
                  <th>Email</th>
                  <th>Téléphone</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {emprunteurs.map((emprunteur) => (
                  <tr key={emprunteur.id}>
                    {/* <td>{emprunteur.id}</td> */}
                    <td>{emprunteur.nom}</td>
                    <td>{emprunteur.email}</td>
                    <td>{emprunteur.telephone}</td>
                    <td>
                      <button
                        onClick={() => handleEditModal(emprunteur)}
                        className="btn btn-info btn-sm mr-2"
                      >
                        Modifier
                      </button>
                      <button
                        onClick={() => handleDelete(emprunteur.id)}
                        className="btn btn-danger btn-sm"
                      >
                        Supprimer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal de Modification */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Modifier l'emprunteur</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="form-group">
            <label htmlFor="nom">Nom</label>
            <input
              type="text"
              className="form-control"
              id="nom"
              value={nom}
              onChange={(e) => setNom(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              className="form-control"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="telephone">Téléphone</label>
            <input
              type="tel"
              className="form-control"
              id="telephone"
              value={telephone}
              onChange={(e) => setTelephone(e.target.value)}
            />
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Fermer
          </Button>
          <Button variant="primary" onClick={handleEditSubmit}>
            Enregistrer les modifications
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default TablesContent;
