import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBars,
  faCircle,
  faSearch,
  faBell,
  faChartLine,
  faEnvelope,
  faSignOutAlt,
} from "@fortawesome/free-solid-svg-icons";
import profile from "../static/img/undraw_profile.svg";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Topbar.css"; // Assurez-vous d'importer le fichier CSS

const Topbar = () => {
  const [currentSource, setCurrentSource] = useState(null);
  const [bailleurNom, setBailleurNom] = useState(null);
  const [username, setUsername] = useState("");
  const [missedRepayments, setMissedRepayments] = useState([]);
  const [isAlertDropdownOpen, setIsAlertDropdownOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    fetchCurrentSource();
    fetchMissedRepayments();
  }, []);

  const handleLogout = async () => {
    try {
      console.log(document.cookie);
      const response = await axios.get(
        "http://127.0.0.1:8000/user_api/logout/",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );

      localStorage.removeItem("access_token");
      console.log(response.data);
      navigate("/");
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
    }
  };

  useEffect(() => {
    async function fetchUserInfo() {
      try {
        console.log("access token : ", localStorage.getItem("access_token"));
        const response = await axios.get(
          "http://127.0.0.1:8000/user_api/user/",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            },
          }
        );

        console.log("User info response:", response.data);
        setUsername(response.data.username);
      } catch (error) {
        console.error("Error fetching user info:", error);
      }
    }

    fetchUserInfo();
  }, []);

  const fetchCurrentSource = async () => {
    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/sources-courantes/"
      );
      const data = await response.json();
      const currentDate = new Date().toISOString().split("T")[0];
      const sourceCourante = data.find(
        (source) =>
          source.date_debut_utilisation <= currentDate &&
          source.date_fin_utilisation >= currentDate
      );
      setCurrentSource(sourceCourante);

      if (sourceCourante) {
        fetchBailleurDetails(sourceCourante.bailleur);
      }
    } catch (error) {
      console.error(
        "Erreur lors de la récupération de la source courante :",
        error
      );
    }
  };

  const fetchBailleurDetails = async (bailleurId) => {
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/bailleurs/${bailleurId}/`
      );
      const data = await response.json();
      setBailleurNom(data.nom);
    } catch (error) {
      console.error("Erreur lors de la récupération du bailleur :", error);
    }
  };

  const fetchMissedRepayments = async () => {
    try {
      const response = await axios.get(
        "http://127.0.0.1:8000/api/missed-repayments/"
      );
      const data = response.data;
      setMissedRepayments(data);
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des remboursements manqués :",
        error
      );
    }
  };

  const toggleAlertDropdown = () => {
    setIsAlertDropdownOpen((prev) => !prev);
  };

  const toggleUserDropdown = () => {
    setIsUserDropdownOpen((prev) => !prev);
  };

  return (
    <nav className="navbar navbar-expand navbar-light bg-white topbar mb-4 static-top shadow">
      <button
        id="sidebarToggleTop"
        className="btn btn-link d-md-none rounded-circle mr-3"
        onClick={() => console.log("Toggle Sidebar")}
      >
        <FontAwesomeIcon icon={faBars} />
      </button>

      <div className="input-group">
        {bailleurNom && (
          <div className="d-flex justify-content-center">
            <button className="d-none d-sm-inline-block btn btn-sm btn-primary shadow-sm align-items-center mr-3 my-2 my-md-0">
              <FontAwesomeIcon
                icon={faChartLine}
                className="fa-sm text-white-50"
              />
              <span className="ml-1">Source Courante: {bailleurNom}</span>
            </button>
          </div>
        )}
      </div>

      <ul className="navbar-nav ml-auto">
        <li className="nav-item dropdown no-arrow mx-1">
          <a
            className="nav-link dropdown-toggle"
            href="#"
            role="button"
            onClick={toggleAlertDropdown}
            aria-haspopup="true"
            aria-expanded={isAlertDropdownOpen}
          >
            <FontAwesomeIcon icon={faBell} />
            {missedRepayments.length > 0 && (
              <span className="badge badge-danger badge-counter">
                {missedRepayments.length}
              </span>
            )}
          </a>
          {isAlertDropdownOpen && (
            <div className="dropdown-list dropdown-menu dropdown-menu-right shadow animated--grow-in show">
              <h6 className="dropdown-header">Remboursements manqués</h6>

              {missedRepayments.length > 0 ? (
                missedRepayments.map((repayment) => (
                  <a
                    key={repayment.id}
                    className="dropdown-item d-flex align-items-center"
                    href="#"
                  >
                    <div className="icon-circle bg-primary">
                      <FontAwesomeIcon icon={faBell} />
                    </div>
                    <div>
                      <div className="small red-glow">
                        {new Date(
                          repayment.repayement_date
                        ).toLocaleDateString()}
                      </div>
                      <span className="font-weight-bold">
                        {repayment.prenom} {repayment.nom} a manqué un
                        remboursement !
                      </span>
                    </div>
                  </a>
                ))
              ) : (
                <a
                  className="dropdown-item text-center small text-gray-500"
                  href="#"
                >
                  Aucun remboursement manqué
                </a>
              )}
            </div>
          )}
        </li>
        <li className="nav-item dropdown no-arrow mx-1">
          <a
            className="nav-link dropdown-toggle"
            href="#"
            onClick={handleLogout}
            role="button"
            aria-haspopup="true"
            aria-expanded={isAlertDropdownOpen}
          >
            <FontAwesomeIcon icon={faSignOutAlt} />
            <span className="badge badge-danger badge-counter"></span>
          </a>
        </li>

        <div className="topbar-divider d-none d-sm-block"></div>

        <li className="nav-item dropdown no-arrow">
          <a
            className="nav-link dropdown-toggle mr-5"
            href="#"
            role="button"
            onClick={toggleUserDropdown}
            aria-haspopup="true"
            aria-expanded={isUserDropdownOpen}
          >
            {username ? (
              <span className="mr-2">Bienvenue, {username} </span>
            ) : (
              <span>Bienvenue...</span>
            )}
            <img
              className="img-profile rounded-circle"
              src={profile}
              alt="Profile"
            />
          </a>
          {isUserDropdownOpen && (
            <div className="dropdown-menu dropdown-menu-right shadow animated--grow-in show">
              <a className="dropdown-item" href="#">
                <FontAwesomeIcon icon={faEnvelope} />
                Profile
              </a>
              <div className="dropdown-divider"></div>
              <a className="dropdown-item" href="#" onClick={handleLogout}>
                <FontAwesomeIcon icon={faSignOutAlt} />
                Logout
              </a>
            </div>
          )}
        </li>
      </ul>
    </nav>
  );
};

export default Topbar;
