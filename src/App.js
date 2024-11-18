import React from "react";
import { Routes, Route } from "react-router-dom";
import { useState } from "react";
import Home from "./pages/home";
import Login from "./pages/login";
import Register from "./pages/register";
import Demande from "./pages/demande";
import Infopers from "./pages/infopers";
import Service from "./pages/servicepage";
import InfoEmp from "./pages/InfoEmprunteur";
import InfoPret from "./pages/infoprethisto";
import Bailleur from "./pages/bailleurs";
import Emprunteurstab from "./pages/emp";
import Emprunteursrem from "./pages/rememp";
import Historique from "./pages/historie";
import InfoEmprem from "./pages/inforemempr";
import InfoRem from "./pages/inforemhisto";
import Source from "./pages/source";
import TauxbyBailleur from "./pages/tauxbybailleur";
import RepaymentsPage from "./pages/repaymentspage";
import UserPage from "./pages/UsermanagePage";
import NotFound from './pages/NotFound';


function App() {
  const [currentUser, setCurrentUser] = useState(null);

  return (
    <Routes>
      <Route exact path="/home" element={<Home />} />
      <Route path="/" element={<Login setCurrentUser={setCurrentUser} />} />
      <Route path="/register" element={<Register />} />
      <Route path="/demande/:id" element={<Demande />} />
      <Route path="/info" element={<Infopers />} />
      <Route path="/service" element={<Service />} />
      <Route path="/infoemp/:id" element={<InfoEmp />} />
      <Route path="/bailleurs" element={<Bailleur />} />
      <Route path="/sources" element={<Source />} />
      <Route path="/emprunteurs" element={<Emprunteurstab />} />
      <Route path="/remboursements" element={<Emprunteursrem />} />
      <Route path="/inforemempr/:id" element={<InfoEmprem />} />
      <Route path="/tauxbybailleur/:bailleurId" element={<TauxbyBailleur />} />
      <Route path="/history" element={<Historique />} />
      <Route path="/inforemhisto/:id/:pretId" element={<InfoRem />} />
      <Route path="/infoprethisto/:id" element={<InfoPret />} />
      <Route
        path="/repayments/:clientId/:pretId"
        element={<RepaymentsPage />}
      />
      <Route path="/admin" element={<UserPage />} />
      <Route path="*" element={<NotFound />} /> {/* Add this line */}
    </Routes>
  );
}

export default App;
