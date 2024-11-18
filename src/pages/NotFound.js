// src/pages/NotFound.js
import React from 'react';

const NotFound = () => {
  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    textAlign: 'center',
  };

  const contentStyle = {
    flex: 1,
  };

  const h1Style = {
    fontSize: '8rem',
    margin: 0,
  };

  const h2Style = {
    fontSize: '2rem',
    margin: 0,
  };

  const pStyle = {
    fontSize: '1rem',
    margin: '0.5rem 0',
  };

  const footerStyle = {
    backgroundColor: '#f0f0f0',
    padding: '1rem',
    width: '100%',
    textAlign: 'center',
    fontSize: '0.8rem',
  };

  return (
    <div style={containerStyle}>
      <div style={contentStyle}>
        <h1 style={h1Style}>404</h1>
        <h2 style={h2Style}>Not Found</h2>
        <p style={pStyle}>The resource requested could not be found on this server!</p>
      </div>
      <footer style={footerStyle}>
        <p>Proudly powered by LiteSpeed Web Server</p>
        <p>
          Please be advised that LiteSpeed Technologies Inc. is not a web hosting company and, as such, has no control over content found on this site.
        </p>
      </footer>
    </div>
  );
};

export default NotFound;
