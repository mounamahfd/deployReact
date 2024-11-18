import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGoogle, faFacebookF } from '@fortawesome/free-brands-svg-icons';

const RegisterForm = () => {
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [id]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('http://127.0.0.1:8000/user_api/register/', {
        email: formData.email,
        username: formData.username,
        password: formData.password,
      });

      console.log('Registration successful:', response.data);
      // Rediriger l'utilisateur vers la page de connexion
      navigate('/');
    } catch (error) {
      console.error('Error during registration:', error);
      alert('Registration failed. Please try again.');
    }
  };

  return (
<div className="container">
    <div>
        <div className="card-body p-0">
            <div className="row justify-content-center align-items-center" style={{ minHeight: "100vh" }}> {/* Added classes and style for vertical centering */}
                <div className="col-lg-6"> {/* Adjusted column size and removed offset */}
                    <div className="p-5">
                        <div className="text-center">
                            <h1 className="h4 text-gray-900 mb-4">Create an Account!</h1>
                        </div>
                        <form className="user" onSubmit={handleSubmit}>
                            <div className="form-group">
                                <input
                                    type="email"
                                    className="form-control form-control-user"
                                    id="email"
                                    placeholder="Email Address"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <input
                                    type="text"
                                    className="form-control form-control-user"
                                    id="username"
                                    placeholder="Username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <input
                                    type="password"
                                    className="form-control form-control-user"
                                    id="password"
                                    placeholder="Password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <button type="submit" className="btn btn-primary btn-user btn-block">
                                Register Account
                            </button>
                            <hr />
                        </form>
                        <hr/>
                        <div className="text-center">
                            <Link className="small" to="/">Already have an account? Login!</Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

  );
};

export default RegisterForm;
