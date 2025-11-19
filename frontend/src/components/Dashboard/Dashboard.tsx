import React from 'react';
import DashboardLayout from './DashboardLayout';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  return (
    <DashboardLayout>
      <div className="dashboard-page">
        <h2>Welcome to LendStream AI</h2>
        <p>Your lead pipeline dashboard is ready.</p>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
