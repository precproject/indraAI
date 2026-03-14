import React, { createContext, useContext, useState, useEffect } from 'react';

// We are building the physical desk
const AppContext = createContext();

// This is the manager sitting at the desk, holding all the files
export const AppProvider = ({ children }) => {
  // The files sitting on the desk:
  const [user, setUser] = useState(null);
  const [cycles, setCycles] = useState([]);
  const [ledger, setLedger] = useState([]);
  const [marketData, setMarketData] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  // When the app opens, the manager fetches the files.
  // Right now, we are putting our demo files on the desk so the app works immediately.
  useEffect(() => {
    // We pretend to fetch from the Cloud Safe (Firebase)
    const loadDemoFiles = () => {
      setUser({
        id: 'demo_farmer',
        name: 'राजेश पाटील',
        phone: '+91 98765 43210',
        village: 'लासलगाव',
        taluka: 'निफाड',
        district: 'नाशिक',
        credits: 340,
        nextMilestone: 500
      });

      setCycles([
        { id: 'c1', crop: 'कांदा', land: 'घरची शेती', area: 2, season: 'खरीप २०२४', status: 'active', currentPhase: 'विक्री', income: 105000, expense: 12500, sowingDate: '15-Jun-2024' },
        { id: 'c2', crop: 'सोयाबीन', land: 'माळरान', area: 1.5, season: 'खरीप २०२४', status: 'active', currentPhase: 'वाढ', income: 0, expense: 4050, sowingDate: '20-Jun-2024' }
      ]);

      setLedger([
        { id: 1, cropCycleId: 'c1', type: 'income', title: 'कांदा विक्री', date: '25-Sep-2024', amount: 105000, category: 'विक्री', crop: 'कांदा' },
        { id: 2, cropCycleId: 'c1', type: 'expense', title: 'युरिया खत', date: '01-Jul-2024', amount: 1500, category: 'खते', crop: 'कांदा' },
        { id: 3, cropCycleId: 'c2', type: 'expense', title: 'DAP खत', date: '05-Jul-2024', amount: 4050, category: 'खते', crop: 'सोयाबीन' },
      ]);

      setIsLoading(false);
    };

    loadDemoFiles();
  }, []);

  // An action the manager can perform: Adding a new receipt to the diary
  const addLedgerEntry = (newEntry) => {
    // 1. Put it on the desk instantly (Lightning fast for the user)
    setLedger((prevLedger) => [newEntry, ...prevLedger]);
    
    // 2. Add reward points instantly
    setUser((prevUser) => ({ ...prevUser, credits: prevUser.credits + 15 }));

    // 3. (In the future, we will send a copy to Firebase here in the background)
    // await addDoc(collection(db, "ledger"), newEntry);
  };

  // Provide the files and the actions to all the rooms in the building
  return (
    <AppContext.Provider value={{ 
      user, 
      cycles, 
      ledger, 
      marketData, 
      isLoading,
      addLedgerEntry
    }}>
      {children}
    </AppContext.Provider>
  );
};

// A quick shortcut for rooms to ask the manager for files
export const useAppContext = () => useContext(AppContext);