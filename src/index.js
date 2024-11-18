import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Router, useNavigate } from 'react-router-dom';
import App from './App';


// import setAuthToken from './axiosConfig';

// // Supposons que vous stockez et récupérez le jeton d'accès ici
// const token = localStorage.getItem('access_token');

// setAuthToken(token);
ReactDOM.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>,
  document.getElementById('root')
);
