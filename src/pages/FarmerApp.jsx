import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, BookText, Sprout, TrendingUp, User } from 'lucide-react';
import VoiceRoom from '../components/VoiceRoom';
import LedgerRoom from '../components/LedgerRoom';
import CyclesRoom from '../components/CyclesRoom';
import MarketRoom from '../components/MarketRoom';
import ProfileRoom from '../components/ProfileRoom';

// // These are our temporary empty rooms. 
// // We will bring in the actual furniture (charts, microphones, lists) for these rooms next.
// const VoiceRoom = () => (
//   <div className="flex flex-col items-center justify-center h-full text-center px-6">
//     <div className="w-24 h-24 bg-leaf-light rounded-full flex items-center justify-center mb-6 shadow-inner">
//       <Mic size={48} className="text-leaf-dark" />
//     </div>
//     <h2 className="text-2xl font-black text-soil mb-2">तुमचा स्मार्ट असिस्टंट</h2>
//     <p className="text-bark font-marathi">मायक्रोफोन दाबा आणि मराठीत बोला. मी तुमचा हिशोब ठेवेन आणि बाजारभाव सांगेन.</p>
//   </div>
// );

// const LedgerRoom = () => <div className="p-6"><h2 className="text-xl font-bold text-soil">हिशोब (Ledger)</h2></div>;
// const CyclesRoom = () => <div className="p-6"><h2 className="text-xl font-bold text-soil">पीक चक्रे (Crop Cycles)</h2></div>;
// const MarketRoom = () => <div className="p-6"><h2 className="text-xl font-bold text-soil">बाजारभाव (Market)</h2></div>;
// const ProfileRoom = () => <div className="p-6"><h2 className="text-xl font-bold text-soil">प्रोफाइल (Profile)</h2></div>;

const FarmerApp = () => {
  // This switch remembers which room the farmer is currently standing in.
  const [currentRoom, setCurrentRoom] = useState('voice');

  // The list of doors in our bottom hallway
  const tabs = [
    { id: 'voice', label: 'मुख्यपृष्ठ', icon: Mic },
    { id: 'ledger', label: 'हिशोब', icon: BookText },
    { id: 'cycles', label: 'पीक चक्र', icon: Sprout },
    { id: 'market', label: 'बाजारभाव', icon: TrendingUp },
    { id: 'profile', label: 'प्रोफाइल', icon: User },
  ];

  // This helper decides which room's furniture to show based on the switch above
  const renderRoom = () => {
    switch (currentRoom) {
      case 'voice': return <VoiceRoom />;
      case 'ledger': return <LedgerRoom />;
      case 'cycles': return <CyclesRoom />;
      case 'market': return <MarketRoom />;
      case 'profile': return <ProfileRoom />;
      default: return <VoiceRoom />;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-wheat-light overflow-hidden font-sans">
      
      {/* ── THE ACTIVE ROOM AREA ── */}
      {/* This area takes up all the space above the bottom hallway. 
          When the farmer changes rooms, the old room fades out and the new one fades in smoothly. */}
      <div className="flex-1 overflow-y-auto pb-20">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentRoom}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            {renderRoom()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── THE BOTTOM HALLWAY (Navigation Bar) ── */}
      {/* This row of doors is permanently glued to the bottom of the screen. */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-wheat shadow-[0_-4px_20px_rgba(44,24,16,0.05)] z-50 px-2 py-2 pb-safe">
        <div className="max-w-md mx-auto flex justify-between items-center">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentRoom === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => setCurrentRoom(tab.id)}
                className="relative flex flex-col items-center justify-center w-16 h-14 rounded-xl transition-all duration-300"
              >
                {/* The little sliding green bubble that sits behind the active icon */}
                {isActive && (
                  <motion.div
                    layoutId="activeTabIndicator"
                    className="absolute inset-0 bg-leaf-light/50 rounded-xl"
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  />
                )}
                
                <Icon 
                  size={24} 
                  className={`relative z-10 transition-colors duration-300 ${isActive ? 'text-leaf-dark' : 'text-mud/70'}`} 
                  strokeWidth={isActive ? 2.5 : 2}
                />
                <span className={`relative z-10 text-[10px] font-bold mt-1 transition-colors duration-300 ${isActive ? 'text-leaf-dark' : 'text-mud/70'}`}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

    </div>
  );
};

export default FarmerApp;