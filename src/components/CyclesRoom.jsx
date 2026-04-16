import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sprout, MapPin, CheckCircle2, ChevronLeft, MessageSquare, IndianRupee, Activity, ThumbsUp, ThumbsDown, RefreshCw, TrendingDown, TrendingUp, CalendarDays, AlertCircle, Save, X, Info, Edit3, CalendarSearch } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { apiService } from '../services/apiService';

const CyclesRoom = () => {
  const { user, updateLocalCycle } = useAppContext(); 
  
  const [liveCycles, setLiveCycles] = useState([]); 
  const [selectedCycle, setSelectedCycle] = useState(null);
  
  // 🟢 General Chat View State (ChatGPT Style Pagination)
  const [showGeneralChats, setShowGeneralChats] = useState(false);
  const [flatGeneralChats, setFlatGeneralChats] = useState([]); // Flat array for pagination
  const [groupedGeneralChats, setGroupedGeneralChats] = useState({});
  const [chatPage, setChatPage] = useState(1);
  const [hasMoreChats, setHasMoreChats] = useState(true);
  const [selectedChatDate, setSelectedChatDate] = useState(''); // Date Filter
  const [isLoadingMoreChats, setIsLoadingMoreChats] = useState(false);
  const chatContainerRef = useRef(null);

  // Detail View States
  const [activeTab, setActiveTab] = useState('timeline'); 
  const [timelineData, setTimelineData] = useState([]);
  const [chatData, setChatData] = useState([]); 
  const [cycleStats, setCycleStats] = useState({ income: 0, expense: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // 🟢 Edit/Missing Info Modal States
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [cycleToEdit, setCycleToEdit] = useState(null);
  const [editFormData, setEditFormData] = useState({});

  const PHASES = ['तयारी', 'पेरणी', 'वाढ', 'फवारणी', 'काढणी', 'विक्री'];

  const getCyclePhaseInfo = (startDate, duration) => {
    if (!startDate) return { index: 2, name: 'वाढ', daysActive: 0, projectedHarvest: new Date() };
    const start = new Date(startDate);
    const today = new Date();
    const daysActive = Math.floor((today - start) / (1000 * 60 * 60 * 24));
    const totalDays = duration || 90;
    
    let index = 0;
    const progress = daysActive / totalDays;
    if (progress < 0.1) index = 0;
    else if (progress < 0.3) index = 1;
    else if (progress < 0.6) index = 2;
    else if (progress < 0.8) index = 3;
    else if (progress < 1.0) index = 4;
    else index = 5;
    
    const projectedHarvest = new Date(start);
    projectedHarvest.setDate(projectedHarvest.getDate() + totalDays);

    return { index: Math.min(index, 5), name: PHASES[Math.min(index, 5)], daysActive, projectedHarvest };
  };

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

  useEffect(() => { fetchCyclesList(); }, []);

  const formatTime = (isoString) => {
    try {
      return new Date(isoString).toLocaleTimeString('mr-IN', { hour: '2-digit', minute: '2-digit' });
    } catch(e) { return ''; }
  };

  // ── 🟢 Fetch General Chats (Pagination & Date Filter) ──
  const fetchChats = async (pageToFetch = 1, specificDate = selectedChatDate) => {
    if (pageToFetch === 1) setIsLoading(true);
    else setIsLoadingMoreChats(true);

    try {
      const response = await apiService.getChatHistory(pageToFetch, 30, specificDate || null); 
      
      const newChats = response.generalChats ? response.generalChats : (Array.isArray(response) ? response : []);
      const moreAvailable = response.hasMore !== undefined ? response.hasMore : false;

      setHasMoreChats(moreAvailable);
      
      const currentFlatChats = pageToFetch === 1 ? newChats : [...flatGeneralChats, ...newChats];
      setFlatGeneralChats(currentFlatChats);
      
      const grouped = {};
      currentFlatChats.forEach(chat => {
        const dateKey = new Date(chat.date).toLocaleDateString('mr-IN', { day: 'numeric', month: 'long', year: 'numeric' });
        if (!grouped[dateKey]) grouped[dateKey] = [];
        grouped[dateKey].push(chat);
      });
      
      setGroupedGeneralChats(grouped);
      setChatPage(pageToFetch);

    } catch (error) {
      console.error("Failed to load general chats", error);
    } finally {
      setIsLoading(false);
      setIsLoadingMoreChats(false);
    }
  };

  const openGeneralChats = () => {
    setShowGeneralChats(true);
    fetchChats(1, '');
  };

  // Infinite Scroll Handler
  const handleChatScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    // flex-col-reverse scrolling top means Math.abs(scrollTop) approaches max scroll
    if (Math.abs(scrollTop) + clientHeight >= scrollHeight - 50) {
      if (hasMoreChats && !isLoadingMoreChats) {
        fetchChats(chatPage + 1, selectedChatDate);
      }
    }
  };

  const handleDateFilterChange = (e) => {
    const newDate = e.target.value;
    setSelectedChatDate(newDate);
    fetchChats(1, newDate);
  };

  const handleChatFeedback = async (chatId, type) => {
    try { await apiService.sendFeedback(chatId, type); } catch(e) {}
  };

  useEffect(() => {
    if (selectedCycle) {
      const loadCycleDetails = async () => {
        setIsLoading(true);
        try {
          const data = await apiService.getCycleDetails(selectedCycle.id);
          setCycleStats(data.stats); 

          const formattedLedger = (data.ledger || []).map(entry => ({
            id: entry.id,
            date: entry.date || entry.createdAt.slice(0, 10),
            type: entry.type === 'expense' ? 'खर्च' : entry.type === 'income' ? 'उत्पन्न' : 'काम',
            tagColor: entry.type === 'expense' ? 'bg-red-50 text-red-600 border-red-200' : entry.type === 'income' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-blue-50 text-blue-700 border-blue-200',
            userInput: entry.type === 'expense' ? `खर्चाची नोंद: ₹${entry.amount} (${entry.category || 'इतर'})` : entry.type === 'income' ? `उत्पन्नाची नोंद: ₹${entry.amount} (${entry.quantity || '?'} क्विंटल)` : `नोंद: ${entry.activityType}`,
            aiResponse: entry.type === 'expense' ? `₹${entry.amount} रुपयांचा खर्च यशस्वीरित्या नोंदवला गेला.` : entry.type === 'income' ? `₹${entry.amount} रुपयांचे उत्पन्न यशस्वीरित्या जमा झाले.` : `काम जतन केले.`,
            icon: entry.type === 'income' ? TrendingUp : entry.type === 'expense' ? TrendingDown : Activity
          }));
          setTimelineData(formattedLedger.sort((a, b) => new Date(b.date) - new Date(a.date)));

          const formattedChats = (data.chats || []).map(chat => ({
            id: chat.id,
            date: chat.date || new Date().toISOString(),
            userInput: chat.user_input,
            aiResponse: chat.ai_response,
          }));
          setChatData(formattedChats.sort((a, b) => new Date(b.date) - new Date(a.date)));

        } catch (error) {
          console.error("Failed to load cycle details", error);
        } finally {
          setIsLoading(false);
        }
      };
      loadCycleDetails();
    }
  }, [selectedCycle]);

  // ── 🟢 Edit / Missing Info Logic ──
  const openEditModal = (e, cycle) => {
    e.stopPropagation(); 
    setCycleToEdit(cycle);
    setEditFormData({
      variety: cycle.variety || '',
      area: cycle.area || '',
      status: cycle.status || 'active',
      startDate: cycle.startDate ? cycle.startDate.slice(0, 10) : '',
      projectedHarvestDate: cycle.projectedHarvestDate ? cycle.projectedHarvestDate.slice(0, 10) : ''
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!cycleToEdit) return;

    const updates = {
      variety: editFormData.variety,
      area: Number(editFormData.area),
      status: editFormData.status,
      startDate: editFormData.startDate || null,
      projectedHarvestDate: editFormData.projectedHarvestDate || null
    };

    try {
      await apiService.updateCycle(cycleToEdit.id, updates);
      
      setLiveCycles(prev => prev.map(c => c.id === cycleToEdit.id ? { ...c, ...updates } : c));
      updateLocalCycle(cycleToEdit.id, updates); 

      if (selectedCycle && selectedCycle.id === cycleToEdit.id) {
        setSelectedCycle({ ...selectedCycle, ...updates });
      }

      setIsEditModalOpen(false);
    } catch (error) {
      console.error("Failed to update cycle", error);
      alert("माहिती जतन करताना त्रुटी आली.");
    }
  };

  const renderList = () => {
    if (isLoading && liveCycles.length === 0) return <div className="flex justify-center py-20"><span className="animate-spin text-4xl">⏳</span></div>;

    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-5 pb-8">
        
        <div 
           onClick={openGeneralChats}
           className="bg-[#e8f4fd] rounded-2xl p-4 border border-[#b8daff] shadow-sm flex items-center justify-between cursor-pointer hover:bg-[#d5ebff] transition-colors mx-1"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600"><MessageSquare size={20}/></div>
            <div>
              <p className="font-black text-[#1e3a8a] text-sm">इतर संवाद (General History)</p>
              <p className="text-[10px] font-bold text-blue-500 mt-0.5">माहिती, हवामान आणि कृषी सल्ला</p>
            </div>
          </div>
          <ChevronLeft size={16} className="text-blue-400 rotate-180"/>
        </div>

        {liveCycles.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-3xl border border-[#d4a853]/30 shadow-sm mx-1">
            <Sprout size={48} className="mx-auto text-[#d4a853]/50 mb-3" />
            <p className="text-[#8b5e3c] font-bold">कोणतेही सक्रिय पीक नाही.</p>
          </div>
        ) : (
          liveCycles.map((cycle) => {
            const phaseInfo = getCyclePhaseInfo(cycle.startDate, cycle.totalDurationDays);
            const cycleIncome = cycle.income || 0;
            const cycleExpense = cycle.expense || 0;
            const isMissingInfo = !cycle.variety || !cycle.area || !cycle.startDate;
            
            return (
              <motion.div 
                key={cycle.id} 
                initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} 
                onClick={() => setSelectedCycle(cycle)} 
                className="bg-white rounded-2xl p-4 border border-[#d4a853]/40 shadow-sm hover:shadow-md transition-all cursor-pointer relative overflow-hidden group mx-1"
              >
                {/* 🟢 Action Buttons (Edit / Warning) */}
                <div className="absolute top-3 right-3 flex items-center gap-2 z-20">
                  {isMissingInfo ? (
                    <button onClick={(e) => openEditModal(e, cycle)} className="bg-red-50 text-red-600 px-2 py-1.5 rounded-lg border border-red-200 hover:bg-red-100 transition-all flex items-center gap-1 shadow-sm">
                      <AlertCircle size={12} strokeWidth={3} />
                      <span className="text-[9px] font-black uppercase tracking-wider">माहिती अपूर्ण</span>
                    </button>
                  ) : (
                    <button onClick={(e) => openEditModal(e, cycle)} className="bg-gray-50 text-gray-500 p-1.5 rounded-full border border-gray-200 hover:bg-gray-100 transition-all shadow-sm opacity-0 group-hover:opacity-100">
                      <Edit3 size={14} />
                    </button>
                  )}
                </div>

                <div className="relative z-10">
                  <div className="flex items-start gap-3 mb-4 pr-24">
                    <div className="w-12 h-12 bg-[#fdf8f0] rounded-xl flex items-center justify-center text-2xl shadow-inner border border-[#d4a853]/20 shrink-0">🌾</div>
                    <div>
                      <h3 className="text-lg font-black text-[#2c1810] flex items-center gap-2">
                        {cycle.crop}
                      </h3>
                      <p className="text-[10px] text-[#8b5e3c] font-bold mt-0.5 flex items-center gap-1">
                        <MapPin size={10} /> {user?.district || 'शेती'} · {cycle.area || '?'} एकर {cycle.variety && `(${cycle.variety})`}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-100 flex justify-between items-center">
                        <div>
                          <p className="text-[9px] uppercase font-bold text-gray-500">लागवड दिनांक</p>
                          <p className="text-[11px] font-black text-[#2c1810] mt-0.5">
                            {cycle.startDate ? new Date(cycle.startDate).toLocaleDateString('mr-IN', { day: 'numeric', month: 'short', year: '2-digit' }) : '---'}
                          </p>
                        </div>
                        <CalendarDays size={14} className="text-gray-300"/>
                    </div>
                    <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-100 flex justify-between items-center">
                        <div>
                          <p className="text-[9px] uppercase font-bold text-gray-500">{cycle.status === 'completed' ? 'काढणी दिनांक' : 'अंदाजित काढणी'}</p>
                          <p className="text-[11px] font-black text-[#2c1810] mt-0.5">
                             {cycle.projectedHarvestDate ? new Date(cycle.projectedHarvestDate).toLocaleDateString('mr-IN', { day: 'numeric', month: 'short', year: '2-digit' }) : '---'}
                          </p>
                        </div>
                        <CheckCircle2 size={14} className="text-[#d4a853]/50"/>
                    </div>
                  </div>

                  <div className="mb-4 relative h-1.5 bg-[#d4a853]/20 rounded-full mx-1">
                      <div className="absolute top-0 left-0 h-full bg-[#4a9e4a] rounded-full transition-all duration-500" style={{ width: `${(Math.max(0, phaseInfo.index) / (PHASES.length - 1)) * 100}%` }} />
                      <p className="absolute -bottom-4 right-0 text-[9px] font-bold text-[#4a9e4a]">{cycle.status === 'completed' ? 'काढणी पूर्ण' : phaseInfo.name}</p>
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                      <p className="text-[10px] font-bold text-gray-500">खर्च: <span className="text-red-500">₹{(cycleExpense/1000).toFixed(1)}K</span></p>
                      <p className="text-[10px] font-bold text-gray-500">उत्पन्न: <span className="text-[#4a9e4a]">₹{(cycleIncome/1000).toFixed(1)}K</span></p>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </motion.div>
    );
  };

  // ── 🟢 Reverse Infinite Scroll Chat View ──
  const renderGeneralChats = () => {
    // Sort dates oldest to newest (Since we reverse the flex container, newest will be at bottom)
    const sortedDates = Object.keys(groupedGeneralChats).sort((a, b) => new Date(b) - new Date(a));

    return (
      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col h-full bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100">
        
        <div className="flex justify-between items-center p-3 bg-white border-b border-gray-100 shrink-0 z-10 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
          <div className="flex items-center gap-3">
            <button onClick={() => setShowGeneralChats(false)} className="text-gray-500 hover:text-black bg-gray-50 p-2 rounded-full">
              <ChevronLeft size={20} />
            </button>
            <div>
              <h2 className="text-lg font-black text-[#1e3a8a]">इतर संवाद</h2>
              <p className="text-[9px] font-bold text-gray-400">माहिती आणि कृषी सल्ला</p>
            </div>
          </div>
          
          {/* 🟢 Jump To Date Filter */}
          <div className="relative">
            <div className="flex items-center bg-blue-50 border border-blue-100 rounded-lg px-2 py-1">
              <CalendarSearch size={14} className="text-blue-500 mr-2"/>
              <input 
                type="date" 
                value={selectedChatDate}
                onChange={handleDateFilterChange}
                className="text-[11px] font-bold text-blue-700 bg-transparent outline-none w-24"
              />
            </div>
            {selectedChatDate && (
               <button onClick={() => { setSelectedChatDate(''); fetchChats(1, null); }} className="absolute -top-1 -right-1 bg-red-100 text-red-500 rounded-full p-0.5">
                 <X size={10}/>
               </button>
            )}
          </div>
        </div>

        <div 
          className="flex-1 overflow-y-auto p-4 bg-gray-50/50 flex flex-col-reverse" 
          onScroll={handleChatScroll}
          ref={chatContainerRef}
        >
          {isLoading && chatPage === 1 ? (
             <div className="flex justify-center py-10 my-auto"><span className="animate-spin text-3xl">⏳</span></div>
          ) : Object.keys(groupedGeneralChats).length === 0 ? (
             <div className="text-center py-10 my-auto"><p className="text-gray-400 font-bold">कोणताही संवाद आढळला नाही.</p></div>
          ) : (
            <>
              {/* DOM Order: Newest Dates First -> Renders at Visually Bottom */}
              {sortedDates.map((dateKey, index) => (
                <React.Fragment key={index}>
                  {/* Messages for this Date (Newest first in array -> Renders visually at bottom of group) */}
                  <div className="space-y-4 mb-4">
                    {groupedGeneralChats[dateKey].sort((a, b) => new Date(b.date) - new Date(a.date)).map((chat, idx) => (
                      <div key={idx} className="space-y-2">
                        <div className="flex justify-end">
                          <div className="max-w-[85%] bg-[#d4edda] text-[#2c1810] p-3 rounded-[1.2rem] rounded-tr-sm shadow-sm border border-[#bbf7d0]/50 relative group">
                             <p className="text-[14px] font-semibold leading-snug">"{chat.user_input || chat.userInput}"</p>
                             <span className="text-[9px] font-bold text-green-700/50 absolute -bottom-4 right-1 opacity-0 group-hover:opacity-100 transition-opacity">{formatTime(chat.date)}</span>
                          </div>
                        </div>

                        <div className="flex justify-start">
                          <div className="max-w-[90%] bg-white text-gray-800 p-4 rounded-[1.2rem] rounded-tl-sm shadow-sm border border-gray-200 mt-2 relative group">
                             <div className="flex gap-3 items-start">
                               <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center shrink-0 border border-blue-200">
                                 <Sprout size={12} className="text-blue-600"/>
                               </div>
                               <div className="flex-1 space-y-2">
                                 <p className="text-[14px] font-medium leading-relaxed">{chat.ai_response || chat.aiResponse}</p>
                                 
                                 {chat.tip && (
                                   <div className="bg-blue-50/50 p-2.5 rounded-lg border border-blue-100 flex items-start gap-2 mt-2">
                                     <Info size={14} className="text-blue-500 shrink-0 mt-0.5"/>
                                     <p className="text-[11px] font-semibold text-blue-800 leading-snug">{chat.tip}</p>
                                   </div>
                                 )}

                                 <div className="flex items-center justify-between pt-2 border-t border-gray-50 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                   <span className="text-[9px] font-bold text-gray-400">{formatTime(chat.date)}</span>
                                   <div className="flex gap-1.5">
                                     <button onClick={() => handleChatFeedback(chat.id, 'up')} className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-green-600 transition-colors"><ThumbsUp size={12}/></button>
                                     <button onClick={() => handleChatFeedback(chat.id, 'down')} className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-red-500 transition-colors"><ThumbsDown size={12}/></button>
                                   </div>
                                 </div>
                               </div>
                             </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* 🟢 Date Divider (Last in DOM for this group -> Renders visually at the TOP of this group) */}
                  <div className="flex justify-center mb-4 mt-6">
                    <span className="bg-white px-4 py-1.5 rounded-full text-[10px] font-black text-gray-500 border border-gray-200 shadow-sm uppercase tracking-wider">
                      {dateKey}
                    </span>
                  </div>
                </React.Fragment>
              ))}
              
              {isLoadingMoreChats && (
                 <div className="flex justify-center py-4"><span className="animate-spin text-xl text-gray-400">⏳</span></div>
              )}
            </>
          )}
        </div>
      </motion.div>
    );
  };

  const renderDetail = () => {
    const profit = cycleStats.income - cycleStats.expense;
    const phaseInfo = getCyclePhaseInfo(selectedCycle.startDate, selectedCycle.totalDurationDays);

    return (
      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col h-full relative">
        
        {/* Detail Header */}
        <div className="bg-gradient-to-br from-[#1a4d1a] to-[#2d6a2d] -mx-4 -mt-4 p-6 pt-8 rounded-b-[2rem] shadow-lg mb-6 text-white shrink-0 relative">
          <button onClick={() => setSelectedCycle(null)} className="flex items-center gap-1 text-white/80 hover:text-white mb-4 transition-colors">
            <ChevronLeft size={20} /> <span className="text-sm font-bold">मागे जा</span>
          </button>

          <button onClick={(e) => openEditModal(e, selectedCycle)} className="absolute top-8 right-6 bg-white/20 p-2.5 rounded-full hover:bg-white/30 transition-colors backdrop-blur-sm border border-white/20">
             <Edit3 size={16} />
          </button>
          
          <div className="flex justify-between items-end mb-6">
            <div>
              <h2 className="text-3xl font-black mb-1">{selectedCycle.crop}</h2>
              <p className="text-white/70 text-sm font-bold flex items-center gap-1"><MapPin size={14}/> {user?.district} · {selectedCycle.area || '?'} एकर {selectedCycle.variety && `(${selectedCycle.variety})`}</p>
            </div>
            <div className="text-right">
              <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold border border-white/30 backdrop-blur-sm">
                 {selectedCycle.status === 'completed' ? 'काढणी पूर्ण' : phaseInfo.name}
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

        <div className="flex bg-gray-200/50 rounded-xl p-1 mb-5 mx-1 shrink-0">
          <button onClick={() => setActiveTab('timeline')} className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-colors ${activeTab === 'timeline' ? 'bg-white text-[#2d6a2d] shadow-sm border border-gray-100' : 'text-gray-500 hover:text-gray-700'}`}>
            हिशोब व इतिहास
          </button>
          <button onClick={() => setActiveTab('chats')} className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-colors ${activeTab === 'chats' ? 'bg-[#e8f4fd] text-blue-600 shadow-sm border border-blue-100' : 'text-gray-500 hover:text-gray-700'}`}>
            AI संवाद
          </button>
        </div>

        <div className="flex-1 space-y-4 pb-8 overflow-y-auto px-1">
          {isLoading ? (
            <div className="flex justify-center py-10"><span className="animate-spin text-3xl">⏳</span></div>
          ) : activeTab === 'timeline' ? (
            timelineData.length === 0 ? (
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
            )
          ) : (
             chatData.length === 0 ? (
                <div className="text-center py-10 bg-white rounded-3xl border border-[#d4a853]/30">
                  <p className="text-[#8b5e3c] font-bold">या पिकाशी संबंधित कोणताही संवाद नाही.</p>
                </div>
             ) : (
               chatData.map((chat, idx) => (
                 <div key={idx} className="bg-blue-50/30 rounded-2xl p-4 border border-blue-100 mb-3 shadow-sm">
                    <p className="text-xs font-bold text-gray-400 mb-2 flex justify-between">
                      <span>तुम्ही:</span><span>{new Date(chat.date).toLocaleDateString('mr-IN', { day: 'numeric', month: 'short' })}</span>
                    </p>
                    <p className="text-[15px] font-bold text-[#2c1810] mb-3 bg-white p-3 rounded-xl shadow-sm border border-blue-50">"{chat.userInput}"</p>
                    <div className="flex gap-3 items-start mt-4">
                      <Sprout size={16} className="text-blue-500 mt-0.5 shrink-0"/>
                      <p className="text-sm font-medium text-gray-800 leading-snug">{chat.aiResponse}</p>
                    </div>
                 </div>
               ))
             )
          )}
        </div>
      </motion.div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-[#fdf8f0] p-4 pt-2 overflow-hidden pb-32 relative">
      
      {/* 🟢 ADVANCED EDIT MODAL (Dates + Status + Area + Variety) */}
      <AnimatePresence>
        {isEditModalOpen && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="bg-white rounded-[2rem] w-full max-w-sm p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
              <button onClick={() => setIsEditModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 bg-gray-100 p-1.5 rounded-full"><X size={18}/></button>
              
              <div className="mb-5 pr-8">
                <h3 className="text-xl font-black text-[#2c1810] flex items-center gap-2">
                  <Edit3 className="text-blue-500" size={24}/> पिकाची माहिती 
                </h3>
                <p className="text-xs font-bold text-gray-500 mt-1">तुमच्या <b>{cycleToEdit?.crop}</b> पिकाची नोंद तपासा आणि आवश्यक बदल करा.</p>
              </div>

              <form onSubmit={handleEditSubmit} className="space-y-4">
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-[#8b5e3c] mb-1 block uppercase">लागवड दिनांक {!editFormData.startDate && <span className="text-red-500 ml-1">*</span>}</label>
                    <input 
                      type="date" 
                      value={editFormData.startDate} 
                      onChange={e => setEditFormData({...editFormData, startDate: e.target.value})} 
                      className={`w-full bg-[#fdf8f0] border rounded-xl p-3 text-[#2c1810] font-bold focus:outline-none text-xs ${!editFormData.startDate ? 'border-red-300 focus:border-red-500' : 'border-[#d4a853]/30 focus:border-[#4a9e4a]'}`} 
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-[#8b5e3c] mb-1 block uppercase">{editFormData.status === 'completed' ? 'काढणी दिनांक' : 'अंदाजित काढणी'}</label>
                    <input 
                      type="date" 
                      value={editFormData.projectedHarvestDate} 
                      onChange={e => setEditFormData({...editFormData, projectedHarvestDate: e.target.value})} 
                      className="w-full bg-[#fdf8f0] border border-[#d4a853]/30 rounded-xl p-3 text-[#2c1810] font-bold focus:outline-none focus:border-[#4a9e4a] text-xs" 
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-[#8b5e3c] mb-1 block uppercase">
                    वाण / ब्रँड (Variety) {!editFormData.variety && <span className="text-red-500 ml-1">* आवश्यक</span>}
                  </label>
                  <input 
                    type="text" 
                    value={editFormData.variety} 
                    onChange={e => setEditFormData({...editFormData, variety: e.target.value})} 
                    placeholder="उदा. विशाल, श्रीराम" 
                    className={`w-full bg-[#fdf8f0] border rounded-xl p-3 text-[#2c1810] font-bold focus:outline-none ${!editFormData.variety ? 'border-red-300 focus:border-red-500' : 'border-[#d4a853]/30 focus:border-[#4a9e4a]'}`} 
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-[#8b5e3c] mb-1 block uppercase">
                      क्षेत्र (एकर) {!editFormData.area && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    <input 
                      type="number" step="0.1" 
                      value={editFormData.area} 
                      onChange={e => setEditFormData({...editFormData, area: e.target.value})} 
                      placeholder="उदा. २.५" 
                      className={`w-full bg-[#fdf8f0] border rounded-xl p-3 text-[#2c1810] font-bold focus:outline-none ${!editFormData.area ? 'border-red-300 focus:border-red-500' : 'border-[#d4a853]/30 focus:border-[#4a9e4a]'}`} 
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-[#8b5e3c] mb-1 block uppercase">अवस्था (Status)</label>
                    <select 
                      value={editFormData.status} 
                      onChange={e => setEditFormData({...editFormData, status: e.target.value})} 
                      className="w-full bg-[#fdf8f0] border border-[#d4a853]/30 rounded-xl p-3 text-[#2c1810] font-bold focus:outline-none focus:border-[#4a9e4a]"
                    >
                      <option value="active">सक्रिय (Active)</option>
                      <option value="completed">काढणी झाली</option>
                    </select>
                  </div>
                </div>

                <button type="submit" className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-black py-3 rounded-xl mt-4 flex items-center justify-center gap-2 hover:shadow-lg transition-all">
                  <Save size={18}/> माहिती जतन करा
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {!selectedCycle && !showGeneralChats && (
        <div className="flex justify-between items-start mb-4 shrink-0 mx-1">
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
        {showGeneralChats ? (
           <motion.div key="general" className="h-full flex flex-col">{renderGeneralChats()}</motion.div>
        ) : !selectedCycle ? (
          <motion.div key="list" className="h-full overflow-y-auto">{renderList()}</motion.div>
        ) : (
          <motion.div key="detail" className="h-full flex flex-col">{renderDetail()}</motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CyclesRoom;