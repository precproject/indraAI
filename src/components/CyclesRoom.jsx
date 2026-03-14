import React from 'react';
import { motion } from 'framer-motion';
import { Sprout, MapPin, Calendar, CheckCircle2, ChevronRight, Plus } from 'lucide-react';

const CyclesRoom = () => {
  // Our master list of the 6 stages of farming
  const PHASES = ['जमीन तयारी', 'पेरणी', 'वाढ', 'फवारणी', 'काढणी', 'विक्री'];

  // The sample whiteboards (crop cycles) currently hanging in the room
  const cycles = [
    { 
      id: 'c1', 
      crop: 'कांदा', 
      emoji: '🧅',
      land: 'घरची शेती', 
      area: 2, 
      season: 'खरीप २०२४', 
      status: 'active', 
      currentPhase: 'विक्री', 
      income: 105000, 
      expense: 12500, 
      sowingDate: '15-Jun-2024' 
    },
    { 
      id: 'c2', 
      crop: 'सोयाबीन', 
      emoji: '🌿',
      land: 'माळरान', 
      area: 1.5, 
      season: 'खरीप २०२४', 
      status: 'active', 
      currentPhase: 'वाढ', 
      income: 0, 
      expense: 4050, 
      sowingDate: '20-Jun-2024' 
    }
  ];

  // Animation rules for hanging the whiteboards on the wall smoothly
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="flex flex-col h-full bg-wheat-light p-4 space-y-5">
      
      {/* ── THE ROOM HEADER ── */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-black text-soil flex items-center gap-2">
            <Sprout className="text-leaf" size={24} />
            पीक चक्रे
          </h2>
          <p className="text-xs font-bold text-mud mt-1">{cycles.length} सक्रिय चक्रे</p>
        </div>
        <button className="bg-gradient-to-r from-leaf-md to-leaf text-white px-4 py-2 rounded-xl text-sm font-bold shadow-md shadow-leaf/30 hover:scale-105 transition-transform flex items-center gap-1">
          <Plus size={18} /> नवीन
        </button>
      </div>

      {/* ── THE WHITEBOARDS (Crop Cycle Cards) ── */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-4 pb-6"
      >
        {cycles.map((cycle) => {
          const profit = cycle.income - cycle.expense;
          const roi = cycle.expense > 0 ? Math.round((profit / cycle.expense) * 100) : 0;
          const phaseIndex = PHASES.indexOf(cycle.currentPhase);

          return (
            <motion.div 
              key={cycle.id}
              variants={cardVariants}
              className="bg-white rounded-3xl p-5 border border-wheat shadow-sm hover:shadow-md transition-shadow relative overflow-hidden"
            >
              {/* Top Row: Crop Name and Profit/Loss */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-leaf-light/50 rounded-2xl flex items-center justify-center text-2xl shadow-inner">
                    {cycle.emoji}
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-soil flex items-center gap-2">
                      {cycle.crop}
                      <span className="bg-leaf-light text-leaf-dark px-2 py-0.5 rounded-full text-[9px] uppercase tracking-wider">सक्रिय</span>
                    </h3>
                    <p className="text-xs text-mud font-bold mt-0.5 flex items-center gap-1">
                      <MapPin size={12} /> {cycle.land} · {cycle.area} एकर
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-xl font-black ${profit >= 0 ? 'text-leaf' : 'text-red-500'}`}>
                    {profit >= 0 ? '+' : ''}₹{(profit/1000).toFixed(1)}K
                  </p>
                  <p className="text-[10px] font-bold text-mud uppercase mt-0.5">ROI: {roi}%</p>
                </div>
              </div>

              {/* Middle Row: The Journey Tracker (Phase Stepper) */}
              <div className="bg-wheat-light/50 rounded-2xl p-4 mb-4 border border-wheat/30">
                <div className="flex justify-between items-center relative">
                  {/* The connecting line behind the dots */}
                  <div className="absolute top-1/2 left-4 right-4 h-1 bg-wheat -translate-y-1/2 rounded-full" />
                  
                  {/* The actual progress line that fills up */}
                  <div 
                    className="absolute top-1/2 left-4 h-1 bg-leaf-md -translate-y-1/2 rounded-full transition-all duration-500"
                    style={{ width: `${(phaseIndex / (PHASES.length - 1)) * 100}%`, maxWidth: 'calc(100% - 2rem)' }}
                  />

                  {PHASES.map((phase, idx) => {
                    const isCompleted = idx < phaseIndex;
                    const isCurrent = idx === phaseIndex;
                    
                    return (
                      <div key={idx} className="relative z-10 flex flex-col items-center gap-2">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-colors ${
                          isCompleted ? 'bg-leaf-md border-leaf-md text-white' : 
                          isCurrent ? 'bg-white border-leaf text-leaf shadow-[0_0_0_4px_rgba(74,158,74,0.15)]' : 
                          'bg-white border-wheat text-wheat'
                        }`}>
                          {isCompleted ? <CheckCircle2 size={12} strokeWidth={4} /> : <span className="text-[10px] font-bold">{idx + 1}</span>}
                        </div>
                        {/* Only show the name of the current phase to keep it clean on small screens */}
                        <span className={`text-[9px] font-bold absolute -bottom-5 whitespace-nowrap ${isCurrent ? 'text-leaf-dark' : 'text-transparent'}`}>
                          {phase}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Bottom Row: Quick Facts */}
              <div className="grid grid-cols-3 gap-2 mt-6">
                <div className="bg-wheat-light/80 rounded-xl p-2 flex flex-col items-center justify-center text-center">
                  <p className="text-[9px] font-bold text-mud uppercase mb-0.5">खर्च</p>
                  <p className="text-sm font-black text-soil">₹{cycle.expense.toLocaleString('en-IN')}</p>
                </div>
                <div className="bg-leaf-light/40 rounded-xl p-2 flex flex-col items-center justify-center text-center border border-leaf/10">
                  <p className="text-[9px] font-bold text-leaf-dark uppercase mb-0.5">उत्पन्न</p>
                  <p className="text-sm font-black text-leaf-dark">₹{cycle.income.toLocaleString('en-IN')}</p>
                </div>
                <div className="bg-wheat-light/80 rounded-xl p-2 flex flex-col items-center justify-center text-center">
                  <p className="text-[9px] font-bold text-mud uppercase mb-0.5 flex items-center gap-1"><Calendar size={10}/> पेरणी</p>
                  <p className="text-xs font-bold text-soil mt-0.5">{cycle.sowingDate}</p>
                </div>
              </div>

            </motion.div>
          );
        })}
      </motion.div>

    </div>
  );
};

export default CyclesRoom;