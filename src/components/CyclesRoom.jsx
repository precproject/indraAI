import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sprout, MapPin, CheckCircle2, ChevronLeft, MessageSquare, IndianRupee, Activity, ThumbsUp, ThumbsDown } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const CyclesRoom = () => {
  const { cycles, ledger } = useAppContext();
  const [selectedCycle, setSelectedCycle] = useState(null);
  const [timelineData, setTimelineData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const PHASES = ['तयारी', 'पेरणी', 'वाढ', 'फवारणी', 'काढणी', 'विक्री'];

  // जेव्हा शेतकरी एखाद्या पिकावर क्लिक करतो, तेव्हा त्याचा इतिहास लोड करणे
  useEffect(() => {
    if (selectedCycle) {
      setIsLoading(true);
      
      // 📝 येथे आपण खऱ्या अ‍ॅपमध्ये बॅकएंडवरून `chat_history` आणू. 
      // सध्या UI/UX पाहण्यासाठी आपण Ledger मधील माहिती आणि काही प्रातिनिधिक संवाद (Mock Chat) वापरून एक 'टाइमलाईन' बनवत आहोत.
      setTimeout(() => {
        const cropLedger = ledger.filter(l => l.crop === selectedCycle.crop);
        
        // Ledger च्या नोंदींना टाइमलाईन फॉरमॅटमध्ये बदलणे
        const formattedLedger = cropLedger.map(entry => ({
          id: entry.id,
          date: entry.date || entry.createdAt.slice(0, 10),
          type: 'ledger',
          tag: 'हिशोब (Ledger)',
          tagColor: 'bg-green-100 text-green-700 border-green-200',
          userInput: entry.type === 'expense' ? `मी ${entry.amount} रुपयांचे ${entry.category} आणले.` : `मी ${entry.amount} रुपयांचे पीक विकले.`,
          aiResponse: entry.type === 'expense' ? `नोंद केली! ${entry.amount} रुपये खर्चात टाकले आहेत.` : `अभिनंदन! ${entry.amount} रुपये उत्पन्नात जमा केले आहेत.`,
          feedback: 'up', // शेतकऱ्याने दिलेला जुना अभिप्राय
          icon: IndianRupee
        }));

        // प्रातिनिधिक जुना संवाद (जेव्हा आपण खऱ्या API शी जोडू, तेव्हा हे डेटाबेस मधून येईल)
        const mockChats = [
          {
            id: 'chat_1',
            date: selectedCycle.startDate || '2026-03-01',
            type: 'chat',
            tag: 'शेतकाम (Activity)',
            tagColor: 'bg-blue-100 text-blue-700 border-blue-200',
            userInput: `मी आज ${selectedCycle.crop} ची लागवड सुरू केली आहे.`,
            aiResponse: `उत्तम! तुमच्या ${selectedCycle.crop} पिकाच्या लागवडीची नोंद मी डायरीत केली आहे. योग्य वेळी पाणी देण्यास विसरू नका.`,
            feedback: 'up',
            icon: Activity
          },
          {
            id: 'chat_2',
            date: '2026-03-10',
            type: 'chat',
            tag: 'सामान्य संवाद (General)',
            tagColor: 'bg-orange-100 text-orange-700 border-orange-200',
            userInput: `माझ्या पिकावर थोडे पिवळे डाग दिसत आहेत.`,
            aiResponse: `सध्या ढगाळ वातावरणामुळे बुरशीचा प्रादुर्भाव होऊ शकतो. कृपया पिकाचा फोटो पाठवा म्हणजे मी अचूक औषध सांगेन.`,
            feedback: null,
            icon: MessageSquare
          }
        ];

        // सर्व नोंदी एकत्र करून तारखेनुसार लावणे (नवीन आधी)
        const combinedTimeline = [...formattedLedger, ...mockChats].sort((a, b) => new Date(b.date) - new Date(a.date));
        
        setTimelineData(combinedTimeline);
        setIsLoading(false);
      }, 600); // लोडिंग इफेक्टसाठी थोडा वेळ
    }
  }, [selectedCycle, ledger]);

  // ── १. मुख्य यादी (List View) ──
  const renderList = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-5 pb-8">
      {cycles.map((cycle, idx) => {
        const profit = (cycle.income || 0) - (cycle.expense || 0);
        const phaseIndex = PHASES.indexOf(cycle.currentPhase || 'वाढ');

        return (
          <motion.div 
            key={cycle.id || idx} 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            onClick={() => setSelectedCycle(cycle)} // क्लिक केल्यावर आत जा
            className="bg-white rounded-[2rem] p-6 border border-[#d4a853]/30 shadow-sm hover:shadow-md transition-all cursor-pointer relative overflow-hidden group"
          >
            {/* Hover Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#fdf8f0] opacity-0 group-hover:opacity-100 transition-opacity" />

            <div className="relative z-10">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-[#fdf8f0] rounded-2xl flex items-center justify-center text-3xl shadow-inner border border-[#d4a853]/20">
                    🌾
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-[#2c1810] flex items-center gap-2">
                      {cycle.crop}
                      <span className="bg-[#d4edda] text-[#2d6a2d] px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-widest font-bold border border-[#bbf7d0]">सक्रिय</span>
                    </h3>
                    <p className="text-xs text-[#8b5e3c] font-bold mt-1 flex items-center gap-1"><MapPin size={12} /> {cycle.land || 'शेती'} · {cycle.area || 1} एकर</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-2xl font-black ${profit >= 0 ? 'text-[#4a9e4a]' : 'text-red-500'}`}>
                    {profit >= 0 ? '+' : ''}₹{Math.abs(profit/1000).toFixed(1)}K
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
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );

  // ── २. सविस्तर माहिती (Detail / Timeline View) ──
  const renderDetail = () => {
    const profit = (selectedCycle.income || 0) - (selectedCycle.expense || 0);

    return (
      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col h-full">
        
        {/* Detail Header */}
        <div className="bg-gradient-to-br from-[#1a4d1a] to-[#2d6a2d] -mx-4 -mt-4 p-6 pt-8 rounded-b-[2rem] shadow-lg mb-6 text-white shrink-0">
          <button onClick={() => setSelectedCycle(null)} className="flex items-center gap-1 text-white/80 hover:text-white mb-4 transition-colors">
            <ChevronLeft size={20} /> <span className="text-sm font-bold">मागे जा</span>
          </button>
          <div className="flex justify-between items-end">
            <div>
              <h2 className="text-3xl font-black mb-1">{selectedCycle.crop}</h2>
              <p className="text-white/70 text-sm font-bold flex items-center gap-1"><MapPin size={14}/> {selectedCycle.district || 'नाशिक'} · {selectedCycle.area || 1} एकर</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-black text-[#4ade80]">₹{Math.abs(profit).toLocaleString('en-IN')}</p>
              <p className="text-[10px] text-white/60 font-bold uppercase tracking-widest mt-0.5">सध्याचा नफा</p>
            </div>
          </div>
        </div>

        {/* Timeline List */}
        <div className="flex-1 space-y-4 pb-8">
          <h3 className="text-sm font-black text-[#8b5e3c] uppercase tracking-widest mb-4 flex items-center gap-2">
            पिकाचा इतिहास <span className="flex-1 h-px bg-[#d4a853]/30"></span>
          </h3>

          {isLoading ? (
            <div className="flex justify-center py-10"><span className="animate-spin text-3xl">⏳</span></div>
          ) : timelineData.length === 0 ? (
            <p className="text-center text-[#8b5e3c] font-bold py-10">या पिकाबद्दल अजून कोणतीही नोंद किंवा संवाद झालेला नाही.</p>
          ) : (
            timelineData.map((event, idx) => {
              const Icon = event.icon;
              return (
                <motion.div key={idx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }} className="bg-white rounded-2xl p-4 shadow-sm border border-[#d4a853]/30 relative">
                  
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs font-bold text-gray-400">{new Date(event.date).toLocaleDateString('mr-IN', { day: 'numeric', month: 'short' })}</span>
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border flex items-center gap-1 ${event.tagColor}`}>
                      <Icon size={10} /> {event.tag}
                    </span>
                  </div>

                  {/* शेतकऱ्याने काय विचारले/सांगितले */}
                  <div className="bg-[#fdf8f0] rounded-xl p-3 mb-3 border border-[#d4a853]/20">
                    <p className="text-sm text-[#5c3317] font-semibold text-right leading-relaxed">"{event.userInput}"</p>
                  </div>

                  {/* AI ने काय उत्तर दिले */}
                  <div className="flex gap-3 items-start">
                    <div className="w-8 h-8 rounded-full bg-[#d4edda] flex items-center justify-center shrink-0 border border-[#bbf7d0]">
                      <Sprout size={16} className="text-[#2d6a2d]"/>
                    </div>
                    <div className="flex-1 pt-1">
                      <p className="text-[15px] font-bold text-[#2c1810] leading-snug">{event.aiResponse}</p>
                      
                      {/* जुना अभिप्राय (Feedback) */}
                      {event.feedback && (
                        <div className="mt-2 flex items-center gap-1 text-[10px] font-bold text-gray-400">
                          {event.feedback === 'up' ? <ThumbsUp size={12} className="text-green-500"/> : <ThumbsDown size={12} className="text-red-500" />}
                          तुम्ही हा सल्ला उपयुक्त मानला होता.
                        </div>
                      )}
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
      <AnimatePresence mode="wait">
        {!selectedCycle ? (
          <motion.div key="list" className="h-full">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-black text-[#2c1810] flex items-center gap-2">
                  <Sprout className="text-[#4a9e4a]" size={28} /> पीक चक्रे
                </h2>
                <p className="text-sm font-bold text-[#8b5e3c] mt-1 tracking-wide">{cycles.length} सक्रिय पिके</p>
              </div>
            </div>
            {renderList()}
          </motion.div>
        ) : (
          <motion.div key="detail" className="h-full">
            {renderDetail()}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CyclesRoom;