import React, { useState, useEffect } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendar,
  faDollarSign,
  faClipboardList,
  faComments,
} from "@fortawesome/free-solid-svg-icons";
import EmpTable from "./EmpTable";

const DashboardContent = () => {
  const [loanStats, setLoanStats] = useState({
    total_monthly_loans: 0,
    repayment_rate: 0,

    missed_payments_count: 0,
    loans_by_category: {},
  });

  useEffect(() => {
    fetchLoanStatistics();
  }, []);

  const fetchLoanStatistics = async () => {
    try {
      const response = await axios.get(
        "http://127.0.0.1:8000/api/loan_statistics/"
      );
      setLoanStats(response.data);
    } catch (error) {
      console.error("Failed to fetch loan statistics", error);
    }
  };

  return (
    <div className="container-fluid">
      <div className="row">
        {/* Loans by Category */}
        <div className="col-xl-3 col-md-6 mb-4">
          <div className="card border-left-primary shadow h-100 py-2">
            <div className="card-body">
              <div className="row no-gutters align-items-center">
                <div className="col">
                  <div className="text-xs font-weight-bold text-primary text-uppercase mb-1">
                    Prêts par Catégorie
                  </div>
                  <ul className="list-unstyled mb-0">
                    {Object.entries(loanStats.loans_by_category).map(
                      ([category, count]) => (
                        <li key={category}>
                          {category}: {count}
                        </li>
                      )
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Total Monthly Loans */}
        <div className="col-xl-3 col-md-6 mb-4">
          <div className="card border-left-info shadow h-100 py-2">
            <div className="card-body">
              <div className="row no-gutters align-items-center">
                <div className="col mr-2">
                  <div className="text-xs font-weight-bold text-info text-uppercase mb-1">
                    Total des Prêts/mois courant{" "}
                  </div>
                  <div className="h5 mb-0 font-weight-bold text-gray-800">
                    {loanStats.total_monthly_loans}MRU
                  </div>
                </div>
                <div className="col-auto">
                  <FontAwesomeIcon
                    icon={faCalendar}
                    className="fas fa-2x text-gray-300"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Repayment Rate */}
        <div className="col-xl-3 col-md-6 mb-4">
          <div className="card border-left-success shadow h-100 py-2">
            <div className="card-body">
              <div className="row no-gutters align-items-center">
                <div className="col mr-2">
                  <div className="text-xs font-weight-bold text-success text-uppercase mb-1">
                    Taux de Remboursement
                  </div>
                  <div className="h5 mb-0 font-weight-bold text-gray-800">
                    {loanStats.repayment_rate.toFixed(2)}%
                  </div>
                </div>
                <div className="col-auto">
                  <FontAwesomeIcon
                    icon={faClipboardList}
                    className="fas fa-2x text-gray-300"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Missed Payment Rate */}
        <div className="col-xl-3 col-md-6 mb-4">
          <div className="card border-left-warning shadow h-100 py-2">
            <div className="card-body">
              <div className="row no-gutters align-items-center">
                <div className="col mr-2">
                  <div className="text-xs font-weight-bold text-warning text-uppercase mb-1">
                    Nombre de Paiements Manqués
                  </div>
                  <div className="h5 mb-0 font-weight-bold text-gray-800">
                    {loanStats.missed_payments_count}
                  </div>
                </div>
                <div className="col-auto">
                  <FontAwesomeIcon
                    icon={faComments}
                    className="fas fa-2x text-gray-300"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <EmpTable />
    </div>
  );
};

export default DashboardContent;
