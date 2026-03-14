import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing'; // Import the new page!
import FarmerApp from './pages/FarmerApp';
import CompanyDashboard from './pages/CompanyDashboard';
import SetupWizard from './pages/SetupWizard';

// Placeholders for the next rooms we build
import { AppProvider } from './context/AppContext';

function App() {
  return (
    <AppProvider>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/app" element={<FarmerApp />} />
        <Route path="/dashboard" element={<CompanyDashboard />} />
        <Route path="/setup" element={<SetupWizard />} />
      </Routes>
    </BrowserRouter>
    </AppProvider>
  );
}

export default App;