import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Login from './pages/Login';
import FarmerApp from './pages/FarmerApp';
import CompanyDashboard from './pages/CompanyDashboard';
//import SetupWizard from './pages/SetupWizard';
import { AppProvider } from './context/AppContext';
import Onboarding from './pages/Onboarding';

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          {/*<Route path="/setup" element={<SetupWizard />} />*/}
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/app" element={<FarmerApp />} />
          <Route path="/dashboard" element={<CompanyDashboard />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;