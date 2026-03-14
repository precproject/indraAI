import React, { createContext, useContext, useState, useEffect } from 'react';
import { dbService } from '../services/firebase';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [cycles, setCycles] = useState([]);
  const [ledger, setLedger] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // When the app opens, the manager fetches the files from the cloud safe
  useEffect(() => {
    const fetchRealFiles = async () => {
      try {
        // We look for our primary farmer. If they don't exist, we create a starting profile.
        let userData = await dbService.getDocumentById('users', 'primary_farmer');
        
        if (!userData) {
          userData = {
            id: 'primary_farmer',
            name: 'राजेश पाटील',
            phone: '+91 98765 43210',
            village: 'लासलगाव',
            taluka: 'निफाड',
            district: 'नाशिक',
            credits: 340,
            nextMilestone: 500
          };
          await dbService.saveDocument('users', userData);
        }
        setUser(userData);

        // Fetch their specific crop cycles and receipts
        const userCycles = await dbService.getDocumentsByField('cycles', 'farmerId', userData.id);
        const userLedger = await dbService.getDocumentsByField('ledger', 'farmerId', userData.id);
        
        // If they have no cycles, give them a starting one so the app isn't empty
        if (userCycles.length === 0) {
          const newCycle = {
            id: 'c1', farmerId: userData.id, crop: 'कांदा', land: 'घरची शेती', area: 2, season: 'खरीप २०२४', status: 'active', currentPhase: 'वाढ', income: 0, expense: 0, sowingDate: new Date().toISOString().slice(0,10)
          };
          await dbService.saveDocument('cycles', newCycle);
          setCycles([newCycle]);
        } else {
          setCycles(userCycles);
        }

        setLedger(userLedger.sort((a, b) => new Date(b.date) - new Date(a.date)));
      } catch (error) {
        console.error("Failed to open the filing cabinet:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRealFiles();
  }, []);

  // The action to add a real receipt to the cloud safe
  const addLedgerEntry = async (newEntry) => {
    // 1. Put it on the desk instantly so the farmer sees it immediately
    const entryWithDate = {
      ...newEntry,
      farmerId: user.id,
      date: new Date().toISOString().slice(0, 10),
      id: Date.now().toString()
    };
    
    setLedger((prev) => [entryWithDate, ...prev]);

    // 2. Add reward points for being a good record keeper
    const updatedUser = { ...user, credits: user.credits + 15 };
    setUser(updatedUser);

    // 3. Quietly file everything in the permanent cloud safe
    await dbService.saveDocument('ledger', entryWithDate);
    await dbService.saveDocument('users', updatedUser);
  };

  return (
    <AppContext.Provider value={{ user, cycles, ledger, isLoading, addLedgerEntry }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);