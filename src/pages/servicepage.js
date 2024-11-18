import React from 'react';
import ServiceItem from '../components/service'; // Importez le composant ServiceItem

const ServiceList = () => {
  // Données fictives pour les services
  const services = [
    {
      id: 1,
      title: "Web Design",
      description: "Topic Listing Template based on Bootstrap 5",
      badgeNumber: "14",
      imageSrc: "images/topics/undraw_Remote_design_team_re_urdx.png"
    },
    {
      id: 2,
      title: "Graphic",
      description: "Lorem Ipsum dolor sit amet consectetur",
      badgeNumber: "75",
      imageSrc: "images/topics/undraw_Redesign_feedback_re_jvm0.png"
    },
    {
      id: 3,
      title: "Logo Design",
      description: "Lorem Ipsum dolor sit amet consectetur",
      badgeNumber: "100",
      imageSrc: "images/topics/colleagues-working-cozy-office-medium-shot.png"
    }
  ];

  return (
    <div className="row">
      {services.map(service => (
        <ServiceItem
          key={service.id}
          title={service.title}
          description={service.description}
          badgeNumber={service.badgeNumber}
          imageSrc={service.imageSrc}
        />
      ))}
    </div>
  );
};

export default ServiceList;
