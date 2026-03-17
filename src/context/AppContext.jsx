import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiService } from '../services/apiService';
import { locationService } from '../services/locationService';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [cycles, setCycles] = useState([]);
  const [ledger, setLedger] = useState([]);
  // We start loading as true, so the guard waits while we check the pockets
  const [isLoading, setIsLoading] = useState(true); 

  // ── पेज रिफ्रेश झाल्यावर फाईल परत आणणे ──
  useEffect(() => {
    const restoreSession = async () => {
      const token = localStorage.getItem('farmerToken');
      
      if (token) {
        try {
          // जर पास असेल, तर बॅकएंडवरून शेतकऱ्याची पूर्ण फाईल आणा
          const data = await apiService.getCurrentUser();
          setUser(data.user);
          setCycles(data.cycles || []);
          setLedger(data.ledger || []);
        } catch (error) {
          console.error("पास जुना झाला आहे किंवा चुकीचा आहे:", error);
          // पास चालत नसेल, तर तो फाडून टाका (Logout)
          localStorage.removeItem('farmerToken');
          setUser(null);
        }
      }
      setIsLoading(false); // फाईल शोधण्याचे काम संपले
    };

    restoreSession();
  }, []);

// ── नवीन लॉगिन ──
  const loginUser = async (phoneNumber, district) => {
    setIsLoading(true);
    try {
      const data = await apiService.loginUser(phoneNumber, district);
      
      setUser(data.user);
      setCycles(data.cycles || []);
      setLedger(data.ledger || []);

      // मिळालेला पास सुरक्षित ठेवा
      localStorage.setItem('farmerToken', data.token);
      
      return data.user;
    } catch (error) {
      console.error("लॉगिन अयशस्वी:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logoutUser = () => {
    setUser(null);
    setCycles([]);
    setLedger([]);
    localStorage.removeItem('farmerToken'); 
  };

  const updateUserProfile = (newData) => {
    setUser((prev) => ({ ...prev, ...newData }));
  };
  
  const addLedgerEntry = async (newEntry) => {
    if (!user) return; 

    const entryWithDate = {
      ...newEntry,
      farmerId: user.id,
      date: new Date().toISOString().slice(0, 10),
      id: Date.now().toString()
    };
    
    setLedger((prev) => [entryWithDate, ...prev]);
    const updatedUser = { ...user, credits: (user.credits || 0) + 15 };
    setUser(updatedUser);

    try {
      await apiService.addLedgerEntry(entryWithDate, updatedUser);
    } catch (error) {
      console.error("Failed to send receipt to headquarters:", error);
    }
  };

  return (
    <AppContext.Provider value={{ 
      user, cycles, ledger, isLoading, 
      loginUser, logoutUser, updateUserProfile, addLedgerEntry 
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);