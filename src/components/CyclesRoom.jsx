import React from 'react';
import { motion } from 'framer-motion';
import { Sprout, MapPin, CheckCircle2 } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const CyclesRoom = () => {
  const { cycles } = useAppContext();
  const PHASES = ['तयारी', 'पेरणी', 'वाढ', 'फवारणी', 'काढणी', 'विक्री'];

  return (
    <div className="flex flex-col h-full bg-[#fdf8f0] p-4 space-y-6 overflow-y-auto">
      
      <div className="flex justify-between items-center pt-2">
        <div>
          <h2 className="text-2xl font-black text-[#2c1810] flex items-center gap-2">
            <Sprout className="text-[#4a9e4a]" size={28} /> पीक चक्रे
          </h2>
          <p className="text-sm font-bold text-[#8b5e3c] mt-1 tracking-wide">{cycles.length} सक्रिय पिके</p>
        </div>
      </div>

      <div className="space-y-5 pb-8">
        {cycles.map((cycle, idx) => {
          const profit = (cycle.income || 0) - (cycle.expense || 0);
          const phaseIndex = PHASES.indexOf(cycle.currentPhase || 'वाढ');

          return (
            <motion.div key={cycle.id || idx} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-[2rem] p-6 border border-[#d4a853]/30 shadow-md">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-[#fdf8f0] rounded-2xl flex items-center justify-center text-3xl shadow-inner border border-[#d4a853]/20">
                    🌾
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-[#2c1810] flex items-center gap-2">
                      {cycle.crop}
                      <span className="bg-[#d4edda] text-[#2d6a2d] px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-widest font-bold">सक्रिय</span>
                    </h3>
                    <p className="text-xs text-[#8b5e3c] font-bold mt-1 flex items-center gap-1"><MapPin size={12} /> {cycle.land} · {cycle.area} एकर</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-2xl font-black ${profit >= 0 ? 'text-[#4a9e4a]' : 'text-red-500'}`}>
                    {profit >= 0 ? '+' : ''}₹{(profit/1000).toFixed(1)}K
                  </p>
                  <p className="text-[10px] font-bold text-[#8b5e3c] uppercase mt-1 tracking-widest">अंदाजित नफा</p>
                </div>
              </div>

              {/* प्रगती रेषा (Progress Line) */}
              <div className="bg-[#fdf8f0]/80 rounded-2xl p-5 border border-[#d4a853]/10">
                <div className="flex justify-between items-center relative">
                  <div className="absolute top-1/2 left-3 right-3 h-1.5 bg-[#d4a853]/20 -translate-y-1/2 rounded-full" />
                  <div className="absolute top-1/2 left-3 h-1.5 bg-[#4a9e4a] -translate-y-1/2 rounded-full transition-all duration-500" style={{ width: `${(Math.max(0, phaseIndex) / (PHASES.length - 1)) * 100}%`, maxWidth: 'calc(100% - 1.5rem)' }} />

                  {PHASES.map((phase, i) => {
                    const isCompleted = i < phaseIndex;
                    const isCurrent = i === phaseIndex;
                    return (
                      <div key={i} className="relative z-10 flex flex-col items-center gap-2">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center border-[3px] transition-colors ${
                          isCompleted ? 'bg-[#4a9e4a] border-[#4a9e4a] text-white' : 
                          isCurrent ? 'bg-white border-[#4a9e4a] text-[#4a9e4a] shadow-[0_0_0_4px_rgba(74,158,74,0.15)]' : 
                          'bg-white border-[#d4a853]/30 text-[#d4a853]/50'
                        }`}>
                          {isCompleted ? <CheckCircle2 size={14} strokeWidth={4} /> : <span className="text-[10px] font-black">{i + 1}</span>}
                        </div>
                        <span className={`text-[10px] font-bold absolute -bottom-5 whitespace-nowrap ${isCurrent ? 'text-[#2d6a2d]' : 'text-transparent'}`}>{phase}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default CyclesRoom;