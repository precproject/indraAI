import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiService } from '../services/apiService';
import { locationService } from '../services/locationService'; // जर लोकेशन सर्व्हिस वापरणार असाल तर ठेवा

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [cycles, setCycles] = useState([]);
  const [ledger, setLedger] = useState([]);
  const [isLoading, setIsLoading] = useState(true); 

  const [chatHistory, setChatHistory] = useState([]);

  // ── १. पेज रिफ्रेश झाल्यावर फाईल परत आणणे ──
  useEffect(() => {
    const restoreSession = async () => {
      const token = localStorage.getItem('farmerToken');
      
      if (token) {
        try {
          const data = await apiService.getCurrentUser();
          setUser(data.user);
          setCycles(data.cycles || []);
          setLedger(data.ledger || []);
        } catch (error) {
          console.error("पास जुना झाला आहे किंवा चुकीचा आहे:", error);
          localStorage.removeItem('farmerToken');
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    restoreSession();
  }, []);

  // ── २. नवीन लॉगिन ──
  const loginUser = async (phoneNumber, district) => {
    setIsLoading(true);
    try {
      const data = await apiService.loginUser(phoneNumber, district);
      
      setUser(data.user);
      setCycles(data.cycles || []);
      setLedger(data.ledger || []);
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
  
  // ── ३. हाताने भरलेली नोंद (Manual Entry API) ──
  // हे फंक्शन तेव्हाच वापरायचे जेव्हा शेतकरी हाताने फॉर्म भरून हिशोब टाकेल
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

  // ── 🚀 ४. नवीन: लोकल अपडेट्स (Smart AI साठी) ──
  // जेव्हा बॅकएंड स्वतः DB मध्ये नोंद करतो, तेव्हा UI अपडेट करण्यासाठी फक्त हे फंक्शन्स वापरायचे

  const addLocalLedgerEntry = (entry) => {
    setLedger((prev) => [entry, ...prev]);
  };

  const addLocalCycle = (cycle) => {
    setCycles((prev) => [cycle, ...prev]);
  };

  const addCredits = (points) => {
    if (!points) return;
    setUser((prev) => ({ ...prev, credits: (prev?.credits || 0) + points }));
  };

  return (
    <AppContext.Provider value={{ 
      user, cycles, ledger, isLoading, chatHistory, setChatHistory,
      loginUser, logoutUser, updateUserProfile, addLedgerEntry,
      addLocalLedgerEntry, addLocalCycle, addCredits // नवीन फंक्शन्स बाहेर पाठवली
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);