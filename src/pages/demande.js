import React , { useEffect } from 'react';
import Sidebar from '../components/sidebar';
import Topbar from '../components/topbar';
import LoanCalculator from '../components/LoanCalculator';
import { useParams,useNavigate } from 'react-router-dom';


const DemandePage = () => {
  
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      navigate("/");
      return;
    };
  }, []);
  return (
    <div id="wrapper">
      <Sidebar />
      <div id="content-wrapper" className="d-flex flex-column">
        <div id="content">
          <Topbar />
          <div className="container-fluid">
            <LoanCalculator />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DemandePage;
