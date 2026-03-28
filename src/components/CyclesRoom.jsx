import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sprout, MapPin, CheckCircle2, ChevronLeft, MessageSquare, IndianRupee, Activity, ThumbsUp, ThumbsDown, RefreshCw, TrendingDown, TrendingUp, CalendarDays } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { apiService } from '../services/apiService';

const CyclesRoom = () => {
  const { user } = useAppContext(); 
  
  const [liveCycles, setLiveCycles] = useState([]); // Context ऐवजी Local State
  const [selectedCycle, setSelectedCycle] = useState(null);
  
  // Detail View States
  const [timelineData, setTimelineData] = useState([]);
  const [cycleStats, setCycleStats] = useState({ income: 0, expense: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const PHASES = ['तयारी', 'पेरणी', 'वाढ', 'फवारणी', 'काढणी', 'विक्री'];

  // ── स्मार्ट अवस्था कॅल्क्युलेटर ──
  const getCyclePhaseInfo = (startDate) => {
    if (!startDate) return { index: 2, name: 'वाढ', daysActive: 0 };
    const start = new Date(startDate);
    const today = new Date();
    const daysActive = Math.floor((today - start) / (1000 * 60 * 60 * 24));
    
    let index = 0;
    if (daysActive < 10) index = 0;
    else if (daysActive < 25) index = 1;
    else if (daysActive < 60) index = 2;
    else if (daysActive < 90) index = 3;
    else if (daysActive < 110) index = 4;
    else index = 5;
    
    const projectedHarvest = new Date(start);
    projectedHarvest.setDate(projectedHarvest.getDate() + 90);

    return { index, name: PHASES[index], daysActive, projectedHarvest };
  };

  // ── 🔄 १. पिकांची यादी आणणे (List API) ──
  const fetchCyclesList = async (showSpinner = true) => {
    if (showSpinner) setIsLoading(true);
    setIsRefreshing(true);
    try {
      const data = await apiService.getFarmerCycles();
      setLiveCycles(data || []);
    } catch (error) {
      console.error("Failed to load cycles list", error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // कंपोनंट लोड झाल्यावर यादी आणा (म्हणजे नेहमी फ्रेश डेटा दिसेल)
  useEffect(() => {
    fetchCyclesList();
  }, []);

  // ── 📊 २. विशिष्ट पिकाचा डेटा आणणे (Detail API) ──
  useEffect(() => {
    if (selectedCycle) {
      const loadCycleDetails = async () => {
        setIsLoading(true);
        try {
          const data = await apiService.getCycleDetails(selectedCycle.id);
          
          setCycleStats(data.stats); // बॅकएंडवरून आलेली अचूक बेरीज

          // Timeline बनवणे
          const formattedLedger = (data.ledger || []).map(entry => ({
            id: entry.id,
            date: entry.date || entry.createdAt.slice(0, 10),
            type: 'ledger',
            tag: 'हिशोब (Ledger)',
            tagColor: entry.type === 'expense' ? 'bg-red-50 text-red-600 border-red-200' : 'bg-green-50 text-green-700 border-green-200',
            userInput: entry.type === 'expense' 
              ? `खर्चाची नोंद: ₹${entry.amount} (${entry.agri_inputs || entry.category || 'इतर'})` 
              : `उत्पन्नाची नोंद: ₹${entry.amount} (मार्केट: ${entry.market || 'स्थानिक'})`,

            aiResponse: entry.type === 'expense' 
              ? `₹${entry.amount} रुपयांचा खर्च यशस्वीरित्या नोंदवला गेला.` 
              : `₹${entry.amount} रुपयांचे उत्पन्न यशस्वीरित्या जमा झाले.`,
            icon: IndianRupee
          }));

          const formattedChats = (data.chats || []).map(chat => ({
            id: chat.id,
            date: chat.date || new Date().toISOString(),
            type: 'chat',
            tag: 'संवाद (Chat)',
            tagColor: 'bg-blue-50 text-blue-700 border-blue-200',
            userInput: chat.user_input,
            aiResponse: chat.ai_response,
            feedback: chat.feedback,
            icon: MessageSquare
          }));

          const combined = [...formattedLedger, ...formattedChats].sort((a, b) => new Date(b.date) - new Date(a.date));
          setTimelineData(combined);

        } catch (error) {
          console.error("Failed to load cycle details", error);
        } finally {
          setIsLoading(false);
        }
      };

      loadCycleDetails();
    }
  }, [selectedCycle]);

  // ── 🎨 मुख्य यादी (List View) ──
  const renderList = () => {
    if (isLoading && liveCycles.length === 0) {
      return <div className="flex justify-center py-20"><span className="animate-spin text-4xl">⏳</span></div>;
    }

    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-5 pb-8">
        {liveCycles.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-3xl border border-[#d4a853]/30 shadow-sm">
            <Sprout size={48} className="mx-auto text-[#d4a853]/50 mb-3" />
            <p className="text-[#8b5e3c] font-bold">कोणतेही सक्रिय पीक नाही.</p>
            <p className="text-sm text-[#8b5e3c]/70 mt-1">माईक दाबून सांगा "मी आज कांदा लावला".</p>
          </div>
        ) : (
          liveCycles.map((cycle) => {
            const phaseInfo = getCyclePhaseInfo(cycle.startDate);
            // जर बॅकएंडने लिस्टमध्ये income/expense पाठवले असेल तर ते वापरा, अन्यथा 0
            const cycleIncome = cycle.income || 0;
            const cycleExpense = cycle.expense || 0;
            
            return (
              <motion.div 
                key={cycle.id} 
                initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} 
                onClick={() => setSelectedCycle(cycle)} 
                className="bg-white rounded-[2rem] p-6 border border-[#d4a853]/30 shadow-sm hover:shadow-md transition-all cursor-pointer relative overflow-hidden group"
              >
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-[#fdf8f0] rounded-2xl flex items-center justify-center text-3xl shadow-inner border border-[#d4a853]/20">🌾</div>
                      <div>
                        <h3 className="text-xl font-black text-[#2c1810] flex items-center gap-2">
                          {cycle.crop}
                          <span className="bg-[#d4edda] text-[#2d6a2d] px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-widest font-bold border border-[#bbf7d0]">सक्रिय</span>
                        </h3>
                        <p className="text-xs text-[#8b5e3c] font-bold mt-1 flex items-center gap-1">
                          <MapPin size={12} /> {user?.district || 'शेती'} · {cycle.area || 1} एकर
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right flex flex-col items-end gap-1">
                      {cycleIncome > 0 && <p className="text-sm font-black text-[#4a9e4a] flex items-center gap-1"><TrendingUp size={14}/> +₹{(cycleIncome/1000).toFixed(1)}K</p>}
                      {cycleExpense > 0 && <p className="text-sm font-black text-red-500 flex items-center gap-1"><TrendingDown size={14}/> -₹{(cycleExpense/1000).toFixed(1)}K</p>}
                      {(cycleIncome === 0 && cycleExpense === 0) && <p className="text-sm font-bold text-gray-400">नोंद नाही</p>}
                    </div>
                  </div>

                  <div className="bg-[#fdf8f0]/80 rounded-2xl p-5 border border-[#d4a853]/10">
                    <div className="flex justify-between items-center relative">
                      <div className="absolute top-1/2 left-3 right-3 h-1.5 bg-[#d4a853]/20 -translate-y-1/2 rounded-full" />
                      <div className="absolute top-1/2 left-3 h-1.5 bg-[#4a9e4a] -translate-y-1/2 rounded-full transition-all duration-500" style={{ width: `${(Math.max(0, phaseInfo.index) / (PHASES.length - 1)) * 100}%`, maxWidth: 'calc(100% - 1.5rem)' }} />

                      {PHASES.map((phase, i) => {
                        const isCompleted = i < phaseInfo.index;
                        const isCurrent = i === phaseInfo.index;
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
                    <div className="mt-6 text-center">
                      <p className="text-[11px] font-bold text-[#8b5e3c]">अंदाजित काढणी: {phaseInfo.projectedHarvest.toLocaleDateString('mr-IN', { month: 'short', year: 'numeric' })}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </motion.div>
    );
  };

  // ── 🎨 सविस्तर माहिती (Detail View) ──
  const renderDetail = () => {
    const profit = cycleStats.income - cycleStats.expense;
    const phaseInfo = getCyclePhaseInfo(selectedCycle.startDate);

    return (
      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col h-full">
        <div className="bg-gradient-to-br from-[#1a4d1a] to-[#2d6a2d] -mx-4 -mt-4 p-6 pt-8 rounded-b-[2rem] shadow-lg mb-6 text-white shrink-0">
          <button onClick={() => setSelectedCycle(null)} className="flex items-center gap-1 text-white/80 hover:text-white mb-4 transition-colors">
            <ChevronLeft size={20} /> <span className="text-sm font-bold">मागे जा</span>
          </button>
          
          <div className="flex justify-between items-end mb-6">
            <div>
              <h2 className="text-3xl font-black mb-1">{selectedCycle.crop}</h2>
              <p className="text-white/70 text-sm font-bold flex items-center gap-1"><MapPin size={14}/> {user?.district} · {selectedCycle.area || 1} एकर</p>
            </div>
            <div className="text-right">
              <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold border border-white/30 backdrop-blur-sm">
                अवस्था: {phaseInfo.name} ({phaseInfo.daysActive} दिवस)
              </span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white/10 rounded-xl p-3 border border-white/10 backdrop-blur-sm">
              <p className="text-[10px] text-white/60 font-bold uppercase tracking-widest mb-1">एकूण खर्च</p>
              <p className="text-lg font-black text-red-300">₹{cycleStats.expense.toLocaleString('en-IN')}</p>
            </div>
            <div className="bg-white/10 rounded-xl p-3 border border-white/10 backdrop-blur-sm">
              <p className="text-[10px] text-white/60 font-bold uppercase tracking-widest mb-1">एकूण उत्पन्न</p>
              <p className="text-lg font-black text-green-300">₹{cycleStats.income.toLocaleString('en-IN')}</p>
            </div>
            <div className={`rounded-xl p-3 border backdrop-blur-sm ${profit >= 0 ? 'bg-[#4ade80]/20 border-[#4ade80]/30' : 'bg-red-500/20 border-red-500/30'}`}>
              <p className="text-[10px] text-white/80 font-bold uppercase tracking-widest mb-1">निव्वळ नफा</p>
              <p className={`text-lg font-black ${profit >= 0 ? 'text-white' : 'text-red-200'}`}>₹{Math.abs(profit).toLocaleString('en-IN')}</p>
            </div>
          </div>
        </div>

        <div className="flex-1 space-y-4 pb-8">
          <h3 className="text-sm font-black text-[#8b5e3c] uppercase tracking-widest mb-4 flex items-center gap-2">
            पिकाचा इतिहास <span className="flex-1 h-px bg-[#d4a853]/30"></span>
          </h3>

          {isLoading ? (
            <div className="flex justify-center py-10"><span className="animate-spin text-3xl">⏳</span></div>
          ) : timelineData.length === 0 ? (
            <div className="text-center py-10 bg-white rounded-3xl border border-[#d4a853]/30">
              <p className="text-[#8b5e3c] font-bold">कोणतीही नोंद आढळली नाही.</p>
            </div>
          ) : (
            timelineData.map((event, idx) => {
              const Icon = event.icon;
              return (
                <motion.div key={idx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }} className="bg-white rounded-2xl p-4 shadow-sm border border-[#d4a853]/30 relative">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs font-bold text-gray-400 flex items-center gap-1">
                      <CalendarDays size={12}/> {new Date(event.date).toLocaleDateString('mr-IN', { day: 'numeric', month: 'short' })}
                    </span>
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border flex items-center gap-1 ${event.tagColor}`}>
                      <Icon size={10} /> {event.tag}
                    </span>
                  </div>
                  <div className="bg-[#fdf8f0] rounded-xl p-3 mb-3 border border-[#d4a853]/20">
                    <p className="text-sm text-[#5c3317] font-semibold text-right leading-relaxed">"{event.userInput}"</p>
                  </div>
                  <div className="flex gap-3 items-start">
                    <div className="w-8 h-8 rounded-full bg-[#d4edda] flex items-center justify-center shrink-0 border border-[#bbf7d0]">
                      <Sprout size={16} className="text-[#2d6a2d]"/>
                    </div>
                    <div className="flex-1 pt-1">
                      <p className="text-[15px] font-bold text-[#2c1810] leading-snug">{event.aiResponse}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </motion.div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-[#fdf8f0] p-4 pt-2 overflow-y-auto pb-32">
      {!selectedCycle && (
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-black text-[#2c1810] flex items-center gap-2">
              <Sprout className="text-[#4a9e4a]" size={28} /> पीक चक्रे
            </h2>
            <p className="text-sm font-bold text-[#8b5e3c] mt-1 tracking-wide">{liveCycles.length} सक्रिय पिके</p>
          </div>
          <button 
            onClick={() => fetchCyclesList(false)} 
            disabled={isRefreshing} 
            className="p-2 bg-white rounded-full border border-[#d4a853]/30 text-[#8b5e3c] hover:bg-[#d4edda] transition-colors shadow-sm mt-1"
          >
            <RefreshCw size={20} className={isRefreshing ? "animate-spin text-[#4a9e4a]" : ""} />
          </button>
        </div>
      )}

      <AnimatePresence mode="wait">
        {!selectedCycle ? (
          <motion.div key="list" className="h-full">{renderList()}</motion.div>
        ) : (
          <motion.div key="detail" className="h-full">{renderDetail()}</motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CyclesRoom;