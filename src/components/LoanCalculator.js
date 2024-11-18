import React, { useState, useEffect } from "react";
import "../static/css/calculator.css";
import "bulma/css/bulma.min.css";
import { Link, useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";

const Calculator = () => {
  const { id } = useParams();
  const [monthlyPayment, setMonthlyPayment] = useState("");
  const [totalInterest, setTotalInterest] = useState("");
  const [totalPayment, setTotalPayment] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const [months, setMonths] = useState(0);
  const [gracePeriod, setGracePeriod] = useState(0);
  const [currentSource, setCurrentSource] = useState(null);
  const [fetchedInterestRate, setFetchedInterestRate] = useState("");

  useEffect(() => {
    fetchCategories();
    fetchCurrentSource();
  }, [months, gracePeriod]);

  const fetchCategories = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/api/categories/");
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error("Erreur lors de la récupération des catégories :", error);
    }
  };

  const fetchCurrentSource = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/api/sources-courantes/");
      const data = await response.json();
      const currentDate = new Date().toISOString().split("T")[0];
      const sourceCourante = data.find(
        (source) =>
          source.date_debut_utilisation <= currentDate &&
          source.date_fin_utilisation >= currentDate
      );
      setCurrentSource(sourceCourante);
      console.log("Source courante :", sourceCourante);
  
      if (sourceCourante && sourceCourante.bailleur) {
        const bailleurId = sourceCourante.bailleur;
        const bailleurResponse = await fetch(`http://127.0.0.1:8000/api/bailleurs/${bailleurId}/`);
        const bailleurData = await bailleurResponse.json();
  
        if (bailleurData ) {
          const tauxResponse = await fetch(`http://127.0.0.1:8000/api/taux/?bailleur=${bailleurId}`);
          const tauxData = await tauxResponse.json();
  
          // Trouver le taux valide pour la date courante
          const validTaux = tauxData.find(taux => {
            const tauxStartDate = new Date(taux.date_debut).toISOString().split("T")[0];
            const tauxEndDate = new Date(taux.date_fin).toISOString().split("T")[0];
            return tauxStartDate <= currentDate && tauxEndDate >= currentDate;
          });
  
          if (validTaux && validTaux.valeur) {
            setFetchedInterestRate(validTaux.valeur);
            console.log("Taux courant :", validTaux);
          } else {
            setFetchedInterestRate("");
            alert("Aucun taux disponible pour le bailleur et la date actuelle.");
          }
        } else {
          setFetchedInterestRate("");
          alert("Le bailleur n'est pas disponible.");
        }
      }
    } catch (error) {
      console.error("Erreur lors de la récupération de la source courante :", error);
    }
  };
  

  // const computeResultse = () => {
  //   const amount = parseFloat(document.getElementById("amount").value);
  //   const monthsValue = parseFloat(document.getElementById("months").value);
  //   const gracePeriodValue = parseFloat(
  //     document.getElementById("gracePeriod").value
  //   );

  //   const monthlyRate = fetchedInterestRate / 100 / monthsValue;
  //   const numberOfPayments = monthsValue;
  //   const x = Math.pow(1 + monthlyRate, numberOfPayments);
  //   let totalInterest = 0;

  //   if (monthlyRate !== 0) {
  //     totalInterest =
  //       ((amount * x * monthlyRate) / (x - 1)) * numberOfPayments - amount;
  //   }

  //   const monthly =
  //     monthlyRate !== 0
  //       ? (amount * x * monthlyRate) / (x - 1)
  //       : amount / numberOfPayments;

  //   if (isFinite(monthly)) {
  //     setMonthlyPayment(monthly.toFixed(2));
  //     setTotalInterest(totalInterest.toFixed(2));
  //     setTotalPayment((monthly * numberOfPayments).toFixed(2));
  //     setMonths(monthsValue);
  //   } else {
  //     setMonthlyPayment("...");
  //     setTotalInterest("...");
  //     setTotalPayment("...");
  //   }
  // };

  const computeResults = () => {
    const amount = parseFloat(document.getElementById("amount").value) || 0;
    const monthsValue = parseFloat(document.getElementById("months").value) || 0;
    const gracePeriodValue = parseFloat(document.getElementById("gracePeriod").value) || 0;
    
    // Assurer que le nombre de paiements n'est pas négatif ou nul
    const numberOfPayments = Math.max(0, monthsValue - gracePeriodValue);
    
    if (numberOfPayments === 0) {
      // Définir les valeurs à zéro ou une valeur par défaut si le nombre de paiements est nul
      setMonthlyPayment("0.00");
      setTotalInterest("0.00");
      setTotalPayment("0.00");
      return; // Arrêter la fonction ici pour éviter des calculs avec nombre de paiements nul
    }
  
    // Conversion du taux d'intérêt annuel en taux mensuel
    const monthlyRate = (fetchedInterestRate / 100 / 12) || 0;
    const x = Math.pow(1 + monthlyRate, numberOfPayments);
    let totalInterest = 0;
  
    if (monthlyRate !== 0) {
      const monthly = (amount * monthlyRate * x) / (x - 1);
      totalInterest = (monthly * numberOfPayments - amount);
      setMonthlyPayment(monthly.toFixed(2));
      setTotalInterest(totalInterest.toFixed(2));
      setTotalPayment((monthly * numberOfPayments).toFixed(2));
    } else {
      const monthly = amount / numberOfPayments;
      setMonthlyPayment(monthly.toFixed(2));
      setTotalInterest("0.00");
      setTotalPayment((amount).toFixed(2));
    }
  
    setMonths(monthsValue);
  };
  

  const handleNextClick = async (currentSourceData) => {
    if (!selectedCategory) {
      alert("Veuillez sélectionner une catégorie.");
      return;
    }
  
    if (!currentSourceData) {
      alert("Assurez-vous qu'il y a une source courante disponible.");
      return;
    }
  
    const bailleurId = currentSourceData.bailleur;
    const bailleurResponse = await fetch(`http://127.0.0.1:8000/api/bailleurs/${bailleurId}/`);
    const bailleurData = await bailleurResponse.json();
  
    // Récupérer tous les taux du bailleur
    const tauxResponse = await fetch(`http://127.0.0.1:8000/api/taux/?bailleur=${bailleurId}`);
    const tauxData = await tauxResponse.json();
  
    // Trouver le taux valide pour la date courante
    const currentDate = new Date().toISOString().split("T")[0];
    const validTaux = tauxData.find(taux => {
      const tauxStartDate = new Date(taux.date_debut).toISOString().split("T")[0];
      const tauxEndDate = new Date(taux.date_fin).toISOString().split("T")[0];
      return tauxStartDate <= currentDate && tauxEndDate >= currentDate;
    });
  
    if (!validTaux || !validTaux.valeur) {
      alert("La valeur du taux du bailleur pour la date actuelle n'est pas disponible.");
      return;
    }
  
    const amount = parseFloat(document.getElementById("amount").value);
    const monthsValue = parseFloat(document.getElementById("months").value);
    const gracePeriodValue = parseFloat(document.getElementById("gracePeriod").value); // Récupérer la valeur du mois de grâce
  
    const currentDateObject = new Date();
    const firstInstallmentDate = new Date(
      currentDateObject.getFullYear(),
      currentDateObject.getMonth() + gracePeriodValue + 1,
      currentDateObject.getDate()
    );

    const nextRepaymentDate = new Date(
      firstInstallmentDate.getFullYear(),
      firstInstallmentDate.getMonth(),
      firstInstallmentDate.getDate()
    );

    const lastInstallmentDate = new Date(
      firstInstallmentDate.getFullYear(),
      firstInstallmentDate.getMonth() + Math.floor(monthsValue)-1,
      firstInstallmentDate.getDate()
    );
  
    const firstInstallmentISO = firstInstallmentDate.toISOString();
    const lastInstallmentISO = lastInstallmentDate.toISOString();
    const nextRepaymentISO = nextRepaymentDate.toISOString();
  
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        emprunteur: id,
        objet: selectedCategory,
        montant_initial: amount,
        duree: monthsValue,
        taux_interet: validTaux.valeur, // Utiliser le taux valide trouvé
        date_premier_echeance: firstInstallmentISO,
        date_derniere_echeance: lastInstallmentISO,
        date_prochain_remboursement: nextRepaymentISO,
        bailleur: bailleurId,
        mois_grace: gracePeriodValue,
      }),
    };
  
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/emprunteurs/${id}/prets/`,
        requestOptions
      );
  
      if (response.ok) {
        alert("Le prêt a été enregistré avec succès.");
      } else {
        alert("Une erreur s'est produite lors de l'enregistrement du prêt.");
      }
    } catch (error) {
      console.error("Erreur lors de la tentative d'ajout du prêt :", error);
      alert("Une erreur s'est produite lors de l'enregistrement du prêt.");
    }
  };

  return (
    <div>
      <section className="section one" style={{ width: "100%" }}>
        <div className="container1">
          <div className="content has-text-centred">
            <h1>Calculateur de Prêt</h1>
            <h2></h2>
            <p>
              Calculez automatiquement les mensualités, les intérêts totaux et
              le montant total dû sur la durée de vie du prêt
            </p>
          </div>
          <div className="columns">
            <div className="column">
              <div className="card">
                <div className="card-content">
                  <form id="loan-form">
                    <div className="level">
                      <div className="level-left is-marginless">
                        <div className="level-item">
                          <p className="number">1</p>
                          <p className="level-text">Type de prêt</p>
                        </div>
                      </div>
                      <div className="level-right">
                        <div className="level-item">
                          <div className="field">
                            <div className="select is-multiple">
                              <select
                                style={{ width: "200px" }}
                                onChange={(e) => {
                                  setSelectedCategory(e.target.value);
                                }}
                              >
                                <option value="" disabled selected>
                                  Sélectionnez un type
                                </option>
                                {categories.map((categorie) => (
                                  <option
                                    key={categorie.id}
                                    value={categorie.id}
                                  >
                                    {categorie.nom}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="level">
                      <div className="level-left is-marginless">
                        <div className="level-item">
                          <p className="number">2</p>
                          <p className="level-text">Montant</p>
                        </div>
                      </div>
                      <div className="level-right">
                        <div className="level-item">
                          <div className="field">
                            <div className="control has-icons-left">
                              <input
                                className="input"
                                id="amount"
                                type="number"
                                step="0.01"
                                min="0"
                                max="10000000"
                                style={{ width: "200px" }}
                                onChange={computeResults}
                              />
                              <span className="icon is-small is-left">
                                <i className="fa fa-dollar-sign"></i>
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="level">
                      <div className="level-left is-marginless">
                        <div className="level-item">
                          <p className="number">3</p>
                          <p className="level-text">Taux d'intérêt</p>
                          <span className="icon is-small is-right">
                                <i className="fa fa-percent"></i>
                          </span>
                        </div>
                      </div>
                      <div className="level-right">
                        <div className="level-item">
                          <div className="field">
                            <div className="control has-icons-right">
                              <input
                                className="input"
                                id="interest"
                                type="number"
                                step="0.01"
                                min="0"
                                max="10"
                                style={{ width: "200px" }}
                                value={fetchedInterestRate}
                                onChange={(e) => setFetchedInterestRate(e.target.value)}
                                readOnly  
                              />

                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="level">
                      <div className="level-left is-marginless">
                        <div className="level-item">
                          <p className="number">4</p>
                          <p className="level-text">Durée en mois</p>
                        </div>
                      </div>
                      <div className="level-right">
                        <div className="level-item">
                          <div className="field">
                            <div className="control has-icons-left">
                              <input
                                className="input"
                                id="months"
                                type="number"
                                step="1"
                                min="1"
                                max="1200"
                                style={{ width: "200px" }}
                                onChange={computeResults}
                              />
                              <span className="icon is-small is-left">
                                <i className="fa fa-calendar"></i>
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Champ pour les mois de grâce */}
                    <div className="level">
                      <div className="level-left is-marginless">
                        <div className="level-item">
                          <p className="number">5</p>
                          <p className="level-text">Mois de grâce</p>
                        </div>
                      </div>
                      <div className="level-right">
                        <div className="level-item">
                          <div className="field">
                            <div className="control">
                              <div className="select">
                                <select
                                  id="gracePeriod"
                                  style={{ width: "200px" }}
                                  value={gracePeriod}  // Utilisez l'état pour contrôler le composant
                                  onChange={(e) => {
                                    setGracePeriod(e.target.value);  // Mettez à jour l'état lors de la sélection d'une nouvelle valeur
                                    computeResults();  // Recalculez les résultats si nécessaire
                                  }}
                                >
                                  {/* Option par défaut définie sur 0 */}
                                  <option value="0">0</option>
                                  {[...Array(13).keys()].slice(1).map((num) => (
                                    <option key={num} value={num}>
                                      {num}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                  </form>
                </div>
              </div>
            </div>

          </div>
          <div className="content has-text-justified">
            <h1 className="title">Résultats</h1>
          </div>
          <Link
            to="#"
            className="nav-link"
            onClick={(e) => {
              e.preventDefault();
              if (currentSource && currentSource.bailleur) {
                handleNextClick(currentSource);
              } else {
                alert("Assurez-vous qu'il y a une source courante disponible.");
              }
            }}
            style={{ backgroundColor: 'blue', padding: '5px 10px', borderRadius: '5px' }}
          >
            {/* <FontAwesomeIcon
              icon={faPlus}
              className="fas fa-plus fa-sm text-white-50 mr-1"
            /> */}
            <span style={{ color: 'white' }}>Ajouter</span>
          </Link>

          <div>
            <div className="columns is-multiline">
              <div className="column">
                <div className="notification is-primary has-text">
                  <p id="monthlyPayment" className="title is-3">
                    {monthlyPayment}
                  </p>
                  <p className="subtitle is-5">Paiements mensuels</p>
                </div>
              </div>
              <div className="column">
                <div className="notification is-info has-text">
                  <p id="totalInterest" className="title is-3">
                    {totalInterest}
                  </p>
                  <p className="subtitle is-5">Intérêts totaux</p>
                </div>
              </div>
              <div className="column">
                <div className="notification is-link has-text">
                  <p id="totalPayment" className="title is-3">
                    {totalPayment}
                  </p>
                  <p className="subtitle is-5">Montant total</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Calculator;
