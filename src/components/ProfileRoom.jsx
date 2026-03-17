import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, MapPin, Phone, Award, Sprout, BookText, LogOut, ChevronRight, Map, Edit3, Plus, X, History, Settings } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts';
import { useAppContext } from '../context/AppContext';
import { apiService } from '../services/apiService';

const ProfileRoom = () => {
  const { user, cycles, ledger, logoutUser, updateUserProfile } = useAppContext();

  // ── States for Modals (पॉप-अप खिडक्या) ──
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isFarmModalOpen, setIsFarmModalOpen] = useState(false);
  const [isCreditModalOpen, setIsCreditModalOpen] = useState(false);

  // ── States for Form Data ──
  const [editData, setEditData] = useState({ name: user?.name || '', district: user?.district || '' });
  const [farmData, setFarmData] = useState({ name: '', area: '', soil: 'काळी माती', irrigation: 'ठिबक' });
  const [creditHistory, setCreditHistory] = useState([]);
  const [farmlands, setFarmlands] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // २. खऱ्या नोंदींमधून आकडे मोजणे
  const activeCropsCount = cycles ? cycles.filter(c => c.status !== 'completed').length : 0;
  const totalEntriesCount = ledger ? ledger.length : 0;

  // ३. शेतांची यादी बनवणे (Cycles वरून)
  useEffect(() => {
    if (cycles && cycles.length > 0) {
      const farms = Array.from(new Set(cycles.map(c => c.land || 'शेती'))).map((landName, idx) => {
        const cycle = cycles.find(c => c.land === landName || (!c.land && landName === 'शेती'));
        return { id: idx + 1, name: landName, area: cycle?.area || 1, soil: 'स्थानिक माती', irrigation: 'ठिबक/पाऊस' };
      });
      setFarmlands(farms);
    } else {
      setFarmlands([{ id: 1, name: 'माझे शेत', area: 2, soil: 'काळी माती', irrigation: 'ठिबक' }]);
    }
  }, [cycles]);

  // ४. API Actions 
  const handleProfileSave = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await apiService.updateProfile(user.id, editData);
      updateUserProfile(editData);
      setIsEditProfileOpen(false);
    } catch (error) {
      console.error("Failed to update profile", error);
    }
    setIsLoading(false);
  };

  const handleFarmSave = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const newFarm = await apiService.addFarm(user.id, farmData);
      setFarmlands([...farmlands, newFarm.data]);
      setIsFarmModalOpen(false);
      setFarmData({ name: '', area: '', soil: 'काळी माती', irrigation: 'ठिबक' });
    } catch (error) {
      console.error("Failed to add farm", error);
    }
    setIsLoading(false);
  };

  const fetchCreditHistory = async () => {
    setIsCreditModalOpen(true);
    setIsLoading(true);
    try {
      const history = await apiService.getCreditHistory(user.id);
      setCreditHistory(history);
    } catch (error) {
      console.error("Failed to fetch credits", error);
    }
    setIsLoading(false);
  };

  // ५. स्मार्ट क्रेडिट्स आणि ग्राफ
  const safeCredits = user?.credits || 0;
  const safeMilestone = user?.nextMilestone || 500;
  const creditPercentage = Math.min(100, (safeCredits / safeMilestone) * 100);

  const activityData = [
    { month: 'मे', level: 20 }, { month: 'जून', level: 50 },
    { month: 'जुलै', level: 80 }, { month: 'ऑग', level: 60 }, { month: 'सप्टें', level: 100 },
  ];

  return (
    <div className="flex flex-col h-full bg-[#fdf8f0] p-4 space-y-4 pb-24 overflow-y-auto">
      
      {/* ── THE ROOM HEADER ── */}
      <div>
        <h2 className="text-xl font-black text-[#2c1810] flex items-center gap-2 pt-2">
          <User className="text-[#4a9e4a]" size={24} />
          माझे प्रोफाइल
        </h2>
      </div>

      {/* ── THE MAIN ID CARD ── */}
      <div className="bg-white rounded-3xl p-5 border border-[#d4a853]/30 shadow-sm relative overflow-hidden shrink-0">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#d4edda]/50 rounded-full blur-2xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
        
        <div className="flex items-center justify-between mb-5 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-[#4a9e4a] to-[#2d6a2d] rounded-full flex items-center justify-center text-white text-2xl shadow-lg border-2 border-white shrink-0">
              👨‍🌾
            </div>
            <div>
              <h3 className="text-xl font-black text-[#2c1810] leading-tight">{user?.name || 'शेतकरी'}</h3>
              <p className="text-xs font-bold text-[#8b5e3c] flex items-center gap-1 mt-1">
                <Phone size={12} /> {user?.phone || 'नोंद नाही'}
              </p>
              <p className="text-[11px] text-[#5c3317] flex items-center gap-1 mt-0.5 font-marathi">
                <MapPin size={12} /> {user?.district || 'महाराष्ट्र'}
              </p>
            </div>
          </div>
        </div>

        <button onClick={() => setIsEditProfileOpen(true)} className="w-full bg-[#fdf8f0] text-[#5c3317] font-bold py-2.5 rounded-xl border border-[#d4a853]/30 hover:bg-[#d4edda] transition-colors text-sm flex items-center justify-center gap-2">
          <Edit3 size={16} /> प्रोफाइल सुधारा (Edit)
        </button>
      </div>

      {/* ── THE REWARDS PASSBOOK ── */}
      <div onClick={fetchCreditHistory} className="bg-gradient-to-br from-[#1a4d1a] to-[#4a9e4a] rounded-3xl p-5 text-white shadow-md cursor-pointer hover:scale-[1.02] transition-transform shrink-0">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-1.5">
            <Award size={18} className="text-yellow-300" />
            <p className="font-bold uppercase tracking-wider text-xs text-white/90">स्मार्ट क्रेडिट्स</p>
          </div>
          <p className="text-2xl font-black flex items-center gap-2">
            {safeCredits} <ChevronRight size={16} className="opacity-50" />
          </p>
        </div>
        
        <div className="h-2 w-full bg-black/20 rounded-full overflow-hidden mb-2">
          <motion.div initial={{ width: 0 }} animate={{ width: `${creditPercentage}%` }} transition={{ duration: 1 }} className="h-full bg-gradient-to-r from-yellow-300 to-yellow-400 rounded-full" />
        </div>
        <p className="text-[10px] text-white/80 font-bold font-marathi">
          पुढील बक्षिसासाठी {safeMilestone - safeCredits > 0 ? safeMilestone - safeCredits : 0} क्रेडिट्स आवश्यक
        </p>
      </div>

      {/* ── THE QUICK SUMMARY (Stats Grid & Chart) ── */}
      <div className="bg-white rounded-3xl p-5 border border-[#d4a853]/30 shadow-sm shrink-0">
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            { icon: <Sprout size={20}/>, val: activeCropsCount, label: 'सक्रिय पिके', color: 'text-[#4a9e4a]' },
            { icon: <BookText size={20}/>, val: totalEntriesCount, label: 'एकूण नोंदी', color: 'text-blue-500' },
            { icon: <Map size={20}/>, val: farmlands.length, label: 'शेते', color: 'text-orange-500' }
          ].map((stat, idx) => (
            <div key={idx} className="flex flex-col items-center justify-center text-center">
              <div className={`mb-1 ${stat.color}`}>{stat.icon}</div>
              <p className="text-lg font-black text-[#2c1810] leading-none">{stat.val}</p>
              <p className="text-[10px] font-bold text-[#8b5e3c] uppercase mt-1 tracking-widest">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="h-24 w-full border-t border-[#fdf8f0] pt-3">
          <p className="text-[9px] font-bold text-[#8b5e3c] uppercase mb-1 tracking-widest">अ‍ॅपचा वापर (मासिक)</p>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={activityData}>
              <defs>
                <linearGradient id="colorLevel" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4a9e4a" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#4a9e4a" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="level" stroke="#4a9e4a" strokeWidth={3} fillOpacity={1} fill="url(#colorLevel)" />
              <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', fontSize: '12px' }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── THE PROPERTY DEEDS (Farmlands List) ── */}
      <div>
        <div className="flex justify-between items-center mb-3 px-1">
          <p className="font-bold text-[#2c1810] flex items-center gap-1.5">
            <Map size={18} className="text-[#4a9e4a]" /> माझी शेते
          </p>
          <button onClick={() => setIsFarmModalOpen(true)} className="text-xs font-bold text-[#4a9e4a] bg-[#d4edda] px-3 py-1.5 rounded-full hover:bg-[#4a9e4a] hover:text-white transition-colors shadow-sm flex items-center gap-1">
            <Plus size={14} /> जोडा
          </button>
        </div>
        
        <div className="space-y-3">
          {farmlands.map((land) => (
            <div key={land.id} className="bg-white rounded-2xl p-4 border border-[#d4a853]/30 shadow-sm flex justify-between items-center hover:border-[#4a9e4a]/30 transition-colors">
              <div>
                <h4 className="font-black text-[#2c1810] text-sm">{land.name}</h4>
                <p className="text-[10px] font-bold text-[#8b5e3c] mt-0.5 font-marathi">{land.soil} · {land.irrigation}</p>
              </div>
              <div className="bg-[#fdf8f0] px-3 py-1.5 rounded-lg border border-[#d4a853]/20 text-center">
                <p className="text-sm font-black text-[#2d6a2d]">{land.area}</p>
                <p className="text-[9px] font-bold text-[#8b5e3c] uppercase tracking-widest">एकर</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── THE EXIT DOORS ── */}
      <div className="pt-2 flex flex-col gap-3">
        <button className="w-full bg-white text-[#5c3317] font-bold py-3.5 px-4 rounded-2xl border border-[#d4a853]/30 shadow-sm flex items-center justify-between hover:bg-[#fdf8f0] transition-colors">
          <span className="flex items-center gap-2"><Settings size={18} className="text-[#8b5e3c]" /> सेटिंग्स (Settings)</span>
          <ChevronRight size={18} className="text-[#8b5e3c]" />
        </button>
        <button onClick={() => { logoutUser(); window.location.href = '/login';  }} className="w-full bg-red-50 text-red-600 font-bold py-3.5 px-4 rounded-2xl border border-red-100 shadow-sm flex items-center justify-center gap-2 hover:bg-red-100 transition-colors">
          <LogOut size={18} /> लॉगआउट करा (Logout)
        </button>
      </div>

      {/* ── MODALS (पॉप-अप खिडक्या) ── */}
      <AnimatePresence>
        
        {/* १. Edit Profile Modal */}
        {isEditProfileOpen && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="bg-white rounded-[2rem] w-full max-w-sm p-6 shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black text-[#2c1810]">प्रोफाईल सुधारा</h3>
                <button onClick={() => setIsEditProfileOpen(false)} className="text-gray-400 hover:text-gray-700"><X size={24}/></button>
              </div>
              <form onSubmit={handleProfileSave} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-[#8b5e3c] mb-1 block">पूर्ण नाव</label>
                  <input type="text" value={editData.name} onChange={e => setEditData({...editData, name: e.target.value})} className="w-full bg-[#fdf8f0] border border-[#d4a853]/30 rounded-xl p-3 text-[#2c1810] font-bold focus:outline-none focus:border-[#4a9e4a]" required />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#8b5e3c] mb-1 block">जिल्हा</label>
                  <input type="text" value={editData.district} onChange={e => setEditData({...editData, district: e.target.value})} className="w-full bg-[#fdf8f0] border border-[#d4a853]/30 rounded-xl p-3 text-[#2c1810] font-bold focus:outline-none focus:border-[#4a9e4a]" required />
                </div>
                <button type="submit" disabled={isLoading} className="w-full bg-[#4a9e4a] text-white font-black py-3 rounded-xl mt-4">
                  {isLoading ? 'सेव्ह करत आहे...' : 'माहिती सेव्ह करा'}
                </button>
              </form>
            </motion.div>
          </div>
        )}

        {/* २. Add Farm Modal */}
        {isFarmModalOpen && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="bg-white rounded-[2rem] w-full max-w-sm p-6 shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black text-[#2c1810]">नवीन शेत जोडा</h3>
                <button onClick={() => setIsFarmModalOpen(false)} className="text-gray-400 hover:text-gray-700"><X size={24}/></button>
              </div>
              <form onSubmit={handleFarmSave} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-[#8b5e3c] mb-1 block">शेताचे नाव (उदा. माळरान)</label>
                  <input type="text" value={farmData.name} onChange={e => setFarmData({...farmData, name: e.target.value})} className="w-full bg-[#fdf8f0] border border-[#d4a853]/30 rounded-xl p-3 text-[#2c1810] font-bold focus:outline-none focus:border-[#4a9e4a]" required />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-[#8b5e3c] mb-1 block">क्षेत्र (एकर)</label>
                    <input type="number" step="0.1" value={farmData.area} onChange={e => setFarmData({...farmData, area: e.target.value})} className="w-full bg-[#fdf8f0] border border-[#d4a853]/30 rounded-xl p-3 text-[#2c1810] font-bold focus:outline-none focus:border-[#4a9e4a]" required />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-[#8b5e3c] mb-1 block">सिंचन</label>
                    <select value={farmData.irrigation} onChange={e => setFarmData({...farmData, irrigation: e.target.value})} className="w-full bg-[#fdf8f0] border border-[#d4a853]/30 rounded-xl p-3 text-[#2c1810] font-bold focus:outline-none focus:border-[#4a9e4a]">
                      <option>ठिबक</option><option>पाटपाणी</option><option>पाऊस (जिरायत)</option>
                    </select>
                  </div>
                </div>
                <button type="submit" disabled={isLoading} className="w-full bg-[#4a9e4a] text-white font-black py-3 rounded-xl mt-4 hover:bg-[#2d6a2d] transition-colors">
                  {isLoading ? 'जोडत आहे...' : 'शेत जोडा'}
                </button>
              </form>
            </motion.div>
          </div>
        )}

        {/* ३. Credit History Modal */}
        {isCreditModalOpen && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center sm:p-4">
            <motion.div initial={{ opacity: 0, y: 100 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 100 }} className="bg-white rounded-t-[2rem] sm:rounded-[2rem] w-full max-w-md p-6 shadow-2xl h-[70vh] flex flex-col">
              <div className="flex justify-between items-center mb-4 shrink-0">
                <h3 className="text-xl font-black text-[#2c1810] flex items-center gap-2"><History className="text-[#d4a853]" size={20}/> पॉईंट्स इतिहास</h3>
                <button onClick={() => setIsCreditModalOpen(false)} className="bg-[#fdf8f0] p-2 rounded-full text-[#8b5e3c] hover:bg-[#d4edda]"><X size={20}/></button>
              </div>
              
              <div className="flex-1 overflow-y-auto space-y-3 pb-4">
                {isLoading ? (
                  <div className="flex justify-center py-10"><span className="animate-spin text-3xl">⏳</span></div>
                ) : creditHistory.length === 0 ? (
                  <p className="text-center text-[#8b5e3c] font-bold py-10">कोणताही इतिहास सापडला नाही.</p>
                ) : (
                  creditHistory.map((item) => (
                    <div key={item.id} className="flex justify-between items-center bg-[#fdf8f0] p-4 rounded-2xl border border-[#d4a853]/20">
                      <div>
                        <p className="font-bold text-[#2c1810] text-sm">{item.reason}</p>
                        <p className="text-[10px] font-bold text-[#8b5e3c] mt-0.5">{item.date}</p>
                      </div>
                      <span className="bg-[#d4edda] text-[#2d6a2d] font-black px-3 py-1.5 rounded-lg border border-[#bbf7d0] shadow-sm">+{item.points}</span>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        )}

      </AnimatePresence>
    </div>
  );
};

export default ProfileRoom;