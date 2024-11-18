import React from 'react';
import Sidebar from '../components/sidebar';
import Topbar from '../components/topbar';
import UserManagement from '../components/UserManagement';

const UserPage = () => {
 
  return (
    <div id="wrapper">
      <Sidebar />
      <div id="content-wrapper" className="d-flex flex-column">
        <div id="content">
          <Topbar />
          <div className="container-fluid">
            <UserManagement />
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserPage;
