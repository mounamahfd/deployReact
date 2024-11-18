import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import loginPhoto from "../static/img/GFEC.png";

const Login = ({ setCurrentUser }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrors(''); // Clear previous errors
    try {
      const response = await axios.post('http://127.0.0.1:8000/user_api/login/', { email, password }, { withCredentials: true });

      const { access_token } = response.data;  // Destructure access_token from response.data
      if (access_token) {
        localStorage.setItem('access_token', access_token);
        document.cookie = `access_token=${access_token}; expires=Thu, 01 Jan 2099 00:00:00 UTC; path=/`;
        setCurrentUser(true);
        navigate(`/home`);
      } else {
        console.error('No access token received');
        setErrors('No access token received');
      }
    } catch (error) {
      if (error.response && error.response.data) {
        setErrors(error.response.data.detail || 'Erreur lors de la connexion. Veuillez réessayer.');
      } else {
        console.error("Erreur lors de la connexion :", error);
        setErrors('Erreur lors de la connexion. Veuillez réessayer.');
      }
    }
  };

  return (
    <div className="container">
      <div className="row justify-content-center align-items-center" style={{ minHeight: "100vh" }}>
        <div className="col-xl-10 col-lg-12 col-md-10">
          <div>
            <div className="card o-hidden border-0 shadow-m my-5" style={{ height: '450px', width:'1100px' }}>
              <div className="card-body p-0">
                <div className="row justify-content-center">
                  <div
                    className="col-lg-6 d-none d-lg-block bg-login-image"
                    style={{
                      backgroundImage: `url(${loginPhoto})`,
                      backgroundSize: 'contain',
                      backgroundRepeat: 'no-repeat',
                    }}
                  ></div>

                  <div className="col-lg-6">
                    <div className="p-5">
                      <div className="text-center">
                        <h1 className="h4 text-gray-900 mb-4">Bienvenue sur la plateforme de gestion des prêts et des remboursements.</h1>
                      </div>
                      {errors && (
                        <div className="alert alert-danger" role="alert">
                          {errors}
                        </div>
                      )}
                      <form className="user" onSubmit={handleLogin}>
                        <div className="form-group">
                          <input
                            className="form-control form-control-user"
                            type="text"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            aria-describedby="emailHelp"
                            placeholder="Entrez votre adresse e-mail..."
                          />
                        </div>
                        <div className="form-group">
                          <input
                            type="password"
                            className="form-control form-control-user"
                            placeholder="Mot de passe"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                          />
                        </div>
                        <button className="btn btn-primary btn-user btn-block">Connexion</button>
                        <hr/>
                      </form>
                      <div className="text-center">
                        {/* <Link className="small" to="/register">Créer un compte !</Link> */}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
