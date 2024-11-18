import React from 'react';

const ServiceItem = ({ title, description, badgeNumber, imageSrc }) => {
  return (
    <div className="col-lg-4 col-md-6 col-12 mb-4 mb-lg-0">
      <div className="custom-block bg-white shadow-lg">
        <a href="topics-detail.html">
          <div className="d-flex">
            <div>
              <h5 className="mb-2">{title}</h5>
              <p className="mb-0">{description}</p>
            </div>
            <span className="badge bg-design rounded-pill ms-auto">{badgeNumber}</span>
          </div>
          <img src={imageSrc} className="custom-block-image img-fluid" alt="" />
        </a>
      </div>
    </div>
  );
};

export default ServiceItem;
