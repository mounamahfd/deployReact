import React from 'react';
import Sidebar from '../components/sidebar';
import Topbar from '../components/topbar';
import Pretstab from '../components/pretstab';

const Prets = () => {
  return (
    <div id="wrapper">
      <Sidebar />
      <div id="content-wrapper" className="d-flex flex-column">
        <div id="content">
          <Topbar />
          <div className="container-fluid">
            <Pretstab />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Bailleur;