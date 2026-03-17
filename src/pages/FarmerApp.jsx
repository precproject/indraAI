import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, BookText, Sprout, TrendingUp, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import VoiceRoom from '../components/VoiceRoom';
import LedgerRoom from '../components/LedgerRoom';
import CyclesRoom from '../components/CyclesRoom';
import MarketRoom from '../components/MarketRoom';
import ProfileRoom from '../components/ProfileRoom';
import { useAppContext } from '../context/AppContext';

const FarmerApp = () => {
  const { user } = useAppContext();
  const navigate = useNavigate();
  const [currentRoom, setCurrentRoom] = useState('voice');

  // ── सिक्युरिटी गार्ड (Security Guard) ──
  useEffect(() => {
    // फक्त Local Storage मधील पास तपासून त्वरित निर्णय घेणे
    const token = localStorage.getItem('farmerToken');
    
    // जर पास नसेल, तर थेट लॉगिन पेजवर पाठवा (replace: true मुळे ते 'Back' बटणाने पुन्हा या पेजवर येऊ शकणार नाहीत)
    if (!token) {
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  // जोपर्यंत 'AppContext' मधून शेतकऱ्याची माहिती (user) येत नाही, तोपर्यंत स्क्रीन रिकामी (blank) ठेवा.
  // यामुळे कोणताही "Loading..." मेसेज दिसणार नाही आणि अ‍ॅपचा फील एकदम 'Native App' सारखा येईल.
  if (!user) return null;

  const tabs = [
    { id: 'voice', label: 'मुख्यपृष्ठ', icon: Mic },
    { id: 'ledger', label: 'हिशोब', icon: BookText },
    { id: 'cycles', label: 'पीक चक्र', icon: Sprout },
    { id: 'market', label: 'बाजारभाव', icon: TrendingUp },
    { id: 'profile', label: 'प्रोफाइल', icon: User },
  ];

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
    <div className="flex flex-col h-screen bg-[#fdf8f0] overflow-hidden font-sans">
      
      {/* ── Top Area (Where the room content is displayed) ── */}
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

      {/* ── Bottom Navigation (The permanent doors to other rooms) ── */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-[#d4a853]/30 shadow-[0_-4px_20px_rgba(44,24,16,0.05)] z-50 px-2 py-2 pb-safe">
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
                {isActive && (
                  <motion.div
                    layoutId="activeTabIndicator"
                    className="absolute inset-0 bg-[#d4edda]/60 rounded-xl"
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  />
                )}
                
                <Icon 
                  size={24} 
                  className={`relative z-10 transition-colors duration-300 ${isActive ? 'text-[#2d6a2d]' : 'text-[#8b5e3c]/70'}`} 
                  strokeWidth={isActive ? 2.5 : 2}
                />
                <span className={`relative z-10 text-[10px] font-bold mt-1 transition-colors duration-300 ${isActive ? 'text-[#2d6a2d]' : 'text-[#8b5e3c]/70'}`}>
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