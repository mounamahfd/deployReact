import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTachometerAlt,
  faUsers,
  faUserCog,
  faChartLine,
  faCoins,
} from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";
import { jwtDecode } from "jwt-decode"; // Fixed import statement

const Sidebar = () => {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    checkIfAdmin();
  }, []);

  const checkIfAdmin = () => {
    const token = localStorage.getItem("access_token");
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        if (decodedToken.role === "admin") {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      } catch (error) {
        console.error("Error decoding token:", error);
        setIsAdmin(false);
      }
    } else {
      setIsAdmin(false);
    }
  };

  return (
    <ul
      className="navbar-nav bg-gradient-primary sidebar sidebar-dark accordion"
      id="accordionSidebar"
    >
      {/* Sidebar - Brand */}
      <Link
        className="sidebar-brand d-flex align-items-center justify-content-center mt-6 mb-3"
        to="/home"
      >
        <div className="sidebar-brand-icon">
          <img
            src="/assets/img/GFEC.png"
            alt="logo GFEC"
            style={{ width: "130px" }}
          />
        </div>
      </Link>
      {/* Divider */}
      <br></br>
      <hr className="sidebar-divider my-0" />
      <br></br>

      {isAdmin && (
        <li className="nav-item active" style={{ marginBottom: "1rem" }}>
          <Link className="nav-link" to="/admin">
            <FontAwesomeIcon icon={faUserCog} />
            <span className="ml-2" >Gestion des utilisateurs</span>
          </Link>
        </li>
      )}

      {/* Nav Item - Dashboard */}
      <li className="nav-item active" style={{ marginBottom: "1rem" }}>
        <Link className="nav-link" to="/home">
          <FontAwesomeIcon icon={faTachometerAlt} />
          <span className="ml-2">Dashboard</span>
        </Link>
      </li>

      {/* Nav Item - Empreunteurs */}
      <li className="nav-item active" style={{ marginBottom: "1rem" }}>
        <Link className="nav-link" to="/emprunteurs">
          <FontAwesomeIcon icon={faUsers} />
          <span className="ml-2">Empreunteurs</span>
        </Link>
      </li>

      {/* Nav Item - Bailleurs */}
      <li className="nav-item active" style={{ marginBottom: "1rem" }}>
        <Link className="nav-link" to="/bailleurs">
          <FontAwesomeIcon icon={faChartLine} />
          <span className="ml-2">Bailleurs</span>
        </Link>
      </li>

      {/* Nav Item - Sources */}
      <li className="nav-item active" style={{ marginBottom: "1rem" }}>
        <Link className="nav-link" to="/sources">
          <FontAwesomeIcon icon={faChartLine} />
          <span className="ml-2">Sources</span>
        </Link>
      </li>

      {/* Nav Item - Remboursements */}
      <li className="nav-item active" style={{ marginBottom: "1rem" }}>
        <Link className="nav-link" to="/remboursements">
          <FontAwesomeIcon icon={faCoins} />
          <span className="ml-2">Remboursement</span>
        </Link>
      </li>
    </ul>
  );
};

export default Sidebar;
