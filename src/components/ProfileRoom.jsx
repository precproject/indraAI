import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, MapPin, Phone, Award, Sprout, BookText, LogOut, ChevronRight, Map, Edit3, Plus, X, History, Settings, Droplet, Trees, Activity, Navigation, Loader2 } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts';
import { useAppContext } from '../context/AppContext';
import { apiService } from '../services/apiService';
import { useMarathiTranslation } from "../hooks/useMarathiTranslation";

// 🟢 FIX 1: चार्टचा डेटा कंपोनंटच्या बाहेर ठेवा जेणेकरून Recharts Infinite Loop मध्ये अडकणार नाही.
const ACTIVITY_DATA = [
  { month: 'मे', level: 20 }, { month: 'जून', level: 50 },
  { month: 'जुलै', level: 80 }, { month: 'ऑग', level: 60 }, { month: 'सप्टें', level: 100 },
];

const ProfileRoom = () => {
  const { user, cycles, ledger, logoutUser, updateUserProfile } = useAppContext();
  
  // ── Custom Hooks ──
  const { translateToMarathi } = useMarathiTranslation();

  // ── States for Modals ──
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isFarmModalOpen, setIsFarmModalOpen] = useState(false);
  const [isCreditModalOpen, setIsCreditModalOpen] = useState(false);

  // ── 🟢 GPS Location States ──
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState(null);

  // ── Expanded Form Data ──
  const [editData, setEditData] = useState({ 
    name: user?.name || '', 
    district: user?.district || '',
    village: user?.village || '',
    taluka: user?.taluka || '',
    state: user?.state || 'महाराष्ट्र',
    pincode: user?.pincode || '',
    latitude: user?.latitude || null,
    longitude: user?.longitude || null
  });

  const [farmData, setFarmData] = useState({ name: '', area: '', soil: 'काळी माती', irrigation: 'ठिबक' });
  const [creditHistory, setCreditHistory] = useState([]);
  const [farmlands, setFarmlands] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const activeCropsCount = cycles ? cycles.filter(c => c.status !== 'completed').length : 0;
  const totalEntriesCount = ledger ? ledger.length : 0;

  // ── शेतांची यादी बनवणे ──
  useEffect(() => {
    if (cycles && cycles.length > 0) {
      const farms = Array.from(new Set(cycles.map(c => c.land || 'मुख्य शेती'))).map((landName, idx) => {
        const cycle = cycles.find(c => c.land === landName || (!c.land && landName === 'मुख्य शेती'));
        return { id: idx + 1, name: landName, area: cycle?.area || 1, soil: 'स्थानिक माती', irrigation: 'ठिबक / पाटपाणी' };
      });
      setFarmlands(farms);
    } else {
      setFarmlands([{ id: 1, name: 'माझे शेत', area: 2, soil: 'काळी माती', irrigation: 'ठिबक' }]);
    }
  }, [cycles]);

  // ── 🟢 Auto-Translate Logic (OnBlur) ──
  const containsEnglish = (text) => /[A-Za-z]/.test(text);

  const handleTranslateOnBlur = async (value, fieldKey) => {
    if (!value) return;
    if (fieldKey === "pincode" || fieldKey === "latitude" || fieldKey === "longitude") return;
    if (!containsEnglish(value)) return;

    try {
      const translated = await translateToMarathi(value);
      if (translated && translated !== value) {
        setEditData(prev => ({ ...prev, [fieldKey]: translated }));
      }
    } catch (err) {
      console.error("Translation failed:", err);
    }
  };

  // ── 🟢 FIX 2: Secure & Direct GPS Fetch (No useEffect Loops) ──
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("तुमचा फोन लोकेशनला सपोर्ट करत नाही.");
      return;
    }

    setIsLocating(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        
        try {
          // OpenStreetMap Reverse Geocoding
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`);
          const data = await response.json();
          
          if (data && data.address) {
            const rawVillage = data.address.village || data.address.suburb || data.address.neighbourhood || '';
            const rawTaluka = data.address.county || '';
            const rawDistrict = data.address.state_district?.replace(' District', '') || '';
            const rawState = data.address.state || 'महाराष्ट्र';
            const newPincode = data.address.postcode || editData.pincode;

            // Translate fields immediately
            const transVillage = containsEnglish(rawVillage) ? await translateToMarathi(rawVillage) : rawVillage;
            const transTaluka = containsEnglish(rawTaluka) ? await translateToMarathi(rawTaluka) : rawTaluka;
            const transDistrict = containsEnglish(rawDistrict) ? await translateToMarathi(rawDistrict) : rawDistrict;
            const transState = containsEnglish(rawState) ? await translateToMarathi(rawState) : rawState;

            // Single unified state update (Prevents infinite loops)
            setEditData(prev => ({
              ...prev,
              latitude: lat,
              longitude: lon,
              pincode: newPincode,
              village: transVillage || prev.village,
              taluka: transTaluka || prev.taluka,
              district: transDistrict || prev.district,
              state: transState || prev.state
            }));
          } else {
             setEditData(prev => ({...prev, latitude: lat, longitude: lon}));
          }
        } catch (error) {
          console.error("Error fetching address:", error);
          setLocationError("पत्ता शोधताना त्रुटी आली.");
          setEditData(prev => ({...prev, latitude: lat, longitude: lon}));
        } finally {
          setIsLocating(false);
        }
      },
      (error) => {
        console.error("GPS Error:", error);
        setLocationError("लोकेशन घेताना त्रुटी आली. फोनचे GPS चालू असल्याची खात्री करा.");
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 } // Robust GPS options
    );
  };

  // ── API Actions ──
  const handleProfileSave = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await apiService.updateProfile(editData);
      updateUserProfile(editData);
      setIsEditProfileOpen(false);
    } catch (error) {
      console.error("Failed to update profile", error);
      alert("प्रोफाईल अपडेट करण्यात त्रुटी आली.");
    } finally {
      setIsLoading(false);
    }
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
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCreditHistory = async () => {
    setIsCreditModalOpen(true);
    setIsLoading(true);
    try {
      const history = await apiService.getCreditHistory();
      setCreditHistory(history || []);
    } catch (error) {
      console.error("Failed to fetch credits", error);
    } finally {
      setIsLoading(false);
    }
  };

  const safeCredits = user?.credits || 0;
  const safeMilestone = user?.nextMilestone || 500;
  const creditPercentage = Math.min(100, (safeCredits / safeMilestone) * 100);

  return (
    <div className="flex flex-col h-full bg-[#fdf8f0] p-4 space-y-5 pb-24 overflow-y-auto">
      
      {/* ── THE ROOM HEADER ── */}
      <div className="flex justify-between items-center pt-2">
        <h2 className="text-2xl font-black text-[#2c1810] flex items-center gap-2">
          <User className="text-[#4a9e4a]" size={28} /> माझे प्रोफाइल
        </h2>
        <button onClick={() => setIsEditProfileOpen(true)} className="p-2 bg-white rounded-full border border-[#d4a853]/30 text-[#8b5e3c] hover:bg-[#d4edda] hover:text-[#4a9e4a] transition-colors shadow-sm">
          <Edit3 size={18} />
        </button>
      </div>

      {/* ── THE MAIN ID CARD ── */}
      <div className="bg-gradient-to-br from-white to-[#fdf8f0] rounded-[2rem] p-6 border border-[#d4a853]/30 shadow-md relative overflow-hidden shrink-0">
        <div className="absolute top-0 right-0 w-40 h-40 bg-[#4a9e4a]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
        
        <div className="flex items-center gap-5 relative z-10">
          <div className="w-20 h-20 bg-gradient-to-br from-[#4a9e4a] to-[#2d6a2d] rounded-[1.2rem] flex items-center justify-center text-white text-3xl shadow-lg border-2 border-white shrink-0">
            👨‍🌾
          </div>
          <div className="flex-1">
            <h3 className="text-2xl font-black text-[#2c1810] leading-tight mb-1">{user?.name || 'शेतकरी'}</h3>
            <div className="space-y-1">
              <p className="text-xs font-bold text-[#8b5e3c] flex items-center gap-1.5 bg-white/50 w-fit pr-3 py-0.5 rounded-full border border-white">
                <Phone size={12} className="text-[#4a9e4a]" /> {user?.phone || 'नोंद नाही'}
              </p>
              <p className="text-[11px] text-[#8b5e3c] font-bold flex items-center gap-1.5 bg-white/50 w-fit pr-3 py-0.5 rounded-full border border-white max-w-[200px] truncate">
                <MapPin size={12} className="text-[#4a9e4a] shrink-0" /> 
                <span className="truncate">{user?.village ? `${user.village}, ` : ''}{user?.district || 'महाराष्ट्र'} {user?.pincode ? `- ${user.pincode}` : ''}</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── THE REWARDS PASSBOOK ── */}
      <div onClick={fetchCreditHistory} className="bg-gradient-to-r from-[#1a4d1a] to-[#2d6a2d] rounded-[2rem] p-6 text-white shadow-lg cursor-pointer hover:shadow-xl transition-all relative overflow-hidden shrink-0 group">
        <div className="absolute right-0 top-0 w-32 h-full bg-gradient-to-l from-white/10 to-transparent transform translate-x-full group-hover:translate-x-0 transition-transform duration-700" />
        
        <div className="flex justify-between items-center mb-4 relative z-10">
          <div className="flex items-center gap-2">
            <div className="bg-yellow-400/20 p-2 rounded-xl border border-yellow-400/30">
              <Award size={20} className="text-yellow-400" />
            </div>
            <p className="font-bold uppercase tracking-widest text-[11px] text-white/90">स्मार्ट क्रेडिट्स</p>
          </div>
          <div className="flex items-center gap-1 bg-white/10 px-3 py-1 rounded-full border border-white/20 backdrop-blur-sm">
             <span className="text-2xl font-black text-yellow-400">{safeCredits}</span>
             <ChevronRight size={16} className="text-white/60" />
          </div>
        </div>
        
        <div className="h-2.5 w-full bg-black/30 rounded-full overflow-hidden mb-2 relative z-10 border border-white/10">
          <motion.div initial={{ width: 0 }} animate={{ width: `${creditPercentage}%` }} transition={{ duration: 1, ease: 'easeOut' }} className="h-full bg-gradient-to-r from-yellow-300 to-yellow-500 rounded-full relative">
             <div className="absolute top-0 right-0 bottom-0 left-0 bg-white/20 animate-pulse" />
          </motion.div>
        </div>
        <p className="text-[10px] text-white/70 font-bold flex justify-between relative z-10">
          <span>प्रगती (Progress)</span>
          <span>पुढील टप्पा: {safeMilestone} Pts</span>
        </p>
      </div>

      {/* ── THE QUICK SUMMARY ── */}
      <div className="bg-white rounded-[2rem] p-5 border border-[#d4a853]/20 shadow-sm shrink-0">
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            { icon: <Sprout size={20}/>, val: activeCropsCount, label: 'सक्रिय पिके', bg: 'bg-green-50', color: 'text-green-600' },
            { icon: <BookText size={20}/>, val: totalEntriesCount, label: 'एकूण नोंदी', bg: 'bg-blue-50', color: 'text-blue-600' },
            { icon: <Map size={20}/>, val: farmlands.length, label: 'नोंदणीकृत शेते', bg: 'bg-orange-50', color: 'text-orange-600' }
          ].map((stat, idx) => (
            <div key={idx} className={`${stat.bg} rounded-2xl p-3 flex flex-col items-center justify-center text-center border border-white shadow-inner`}>
              <div className={`mb-1.5 ${stat.color}`}>{stat.icon}</div>
              <p className="text-xl font-black text-[#2c1810] leading-none">{stat.val}</p>
              <p className="text-[9px] font-bold text-gray-500 uppercase mt-1.5 tracking-widest">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="h-28 w-full border-t border-gray-100 pt-4">
          <p className="text-[10px] font-bold text-[#8b5e3c] uppercase mb-2 tracking-widest flex items-center gap-1"><Activity size={12}/> अ‍ॅपचा वापर</p>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={ACTIVITY_DATA}>
              <defs>
                <linearGradient id="colorLevel" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4a9e4a" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#4a9e4a" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="level" stroke="#4a9e4a" strokeWidth={3} fillOpacity={1} fill="url(#colorLevel)" />
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── THE PROPERTY DEEDS ── */}
      <div>
        <div className="flex justify-between items-center mb-4 px-2">
          <p className="font-black text-[#2c1810] flex items-center gap-2">
            <Map size={20} className="text-[#4a9e4a]" /> माझी शेती
          </p>
          <button onClick={() => setIsFarmModalOpen(true)} className="text-xs font-bold text-[#4a9e4a] bg-[#d4edda] px-3 py-1.5 rounded-full hover:bg-[#4a9e4a] hover:text-white transition-colors shadow-sm flex items-center gap-1 border border-[#bbf7d0]">
            <Plus size={14} /> जोडा
          </button>
        </div>
        
        <div className="space-y-3">
          {farmlands.map((land) => (
            <div key={land.id} className="bg-white rounded-2xl p-4 border border-[#d4a853]/20 shadow-sm flex justify-between items-center hover:border-[#4a9e4a]/40 transition-colors group">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-[#fdf8f0] rounded-full flex items-center justify-center text-[#8b5e3c] border border-[#d4a853]/30">
                    <Trees size={18}/>
                 </div>
                 <div>
                  <h4 className="font-black text-[#2c1810] text-[15px]">{land.name}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-bold text-gray-500 bg-gray-50 px-2 py-0.5 rounded-md border border-gray-100 flex items-center gap-1"><Droplet size={10} className="text-blue-400"/> {land.irrigation}</span>
                  </div>
                 </div>
              </div>
              <div className="bg-[#e8f4fd] px-3 py-2 rounded-xl border border-blue-100 text-center shadow-inner">
                <p className="text-[15px] font-black text-blue-700 leading-none">{land.area}</p>
                <p className="text-[9px] font-bold text-blue-500 uppercase tracking-widest mt-0.5">एकर</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── THE EXIT DOORS ── */}
      <div className="pt-4 flex flex-col gap-3">
        <button className="w-full bg-white text-[#2c1810] font-bold py-4 px-5 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between hover:bg-gray-50 transition-colors group">
          <span className="flex items-center gap-3"><Settings size={20} className="text-gray-400 group-hover:text-gray-600 transition-colors" /> सेटिंग्स (Settings)</span>
          <ChevronRight size={18} className="text-gray-400" />
        </button>
        <button onClick={() => { logoutUser(); window.location.href = '/login';  }} className="w-full bg-[#fff1f2] text-red-600 font-bold py-4 px-5 rounded-2xl border border-red-100 shadow-sm flex items-center justify-center gap-2 hover:bg-red-100 transition-colors">
          <LogOut size={20} /> लॉगआउट करा (Logout)
        </button>
      </div>

      {/* ── MODALS ── */}
      <AnimatePresence>
        
        {/* 🟢 Expanded Edit Profile Modal (With Direct GPS Logic) */}
        {isEditProfileOpen && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-[2rem] w-full max-w-md p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
              <button onClick={() => setIsEditProfileOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 bg-gray-100 p-1.5 rounded-full"><X size={18}/></button>
              
              <div className="mb-6 pr-8">
                <h3 className="text-2xl font-black text-[#2c1810] flex items-center gap-2"><User className="text-[#4a9e4a]"/> प्रोफाईल</h3>
                <p className="text-xs font-bold text-gray-500 mt-1">तुमची वैयक्तिक माहिती अद्ययावित करा.</p>
              </div>

              <form onSubmit={handleProfileSave} className="space-y-4">
                <div>
                  <label className="text-[11px] font-bold text-[#8b5e3c] mb-1 block uppercase tracking-wider">पूर्ण नाव</label>
                  <input 
                    type="text" 
                    value={editData.name} 
                    onChange={e => setEditData({...editData, name: e.target.value})} 
                    onBlur={() => handleTranslateOnBlur(editData.name, 'name')}
                    className="w-full bg-[#fdf8f0] border border-[#d4a853]/30 rounded-xl p-3.5 text-[#2c1810] font-bold focus:outline-none focus:border-[#4a9e4a]" 
                    required 
                  />
                </div>

                {/* 🟢 Safe GPS Location Button */}
                <button 
                  type="button" 
                  onClick={handleGetLocation}
                  disabled={isLocating}
                  className="w-full bg-blue-50 text-blue-600 font-bold py-2.5 rounded-xl border border-blue-200 shadow-sm flex items-center justify-center gap-2 hover:bg-blue-100 transition-colors"
                >
                  {isLocating ? <Loader2 size={16} className="animate-spin"/> : <Navigation size={16}/>}
                  {isLocating ? 'लोकेशन शोधत आहे...' : '📍 GPS वरून पत्ता घ्या (Auto-Fill)'}
                </button>
                {locationError && <p className="text-xs text-red-500 font-bold text-center mt-1">{locationError}</p>}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-[#8b5e3c] mb-1 block uppercase tracking-wider">गाव / वस्ती</label>
                    <input 
                      type="text" 
                      value={editData.village} 
                      onChange={e => setEditData({...editData, village: e.target.value})} 
                      onBlur={() => handleTranslateOnBlur(editData.village, 'village')}
                      className="w-full bg-[#fdf8f0] border border-[#d4a853]/30 rounded-xl p-3.5 text-[#2c1810] font-bold focus:outline-none focus:border-[#4a9e4a]" 
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-[#8b5e3c] mb-1 block uppercase tracking-wider">तालुका</label>
                    <input 
                      type="text" 
                      value={editData.taluka} 
                      onChange={e => setEditData({...editData, taluka: e.target.value})} 
                      onBlur={() => handleTranslateOnBlur(editData.taluka, 'taluka')}
                      className="w-full bg-[#fdf8f0] border border-[#d4a853]/30 rounded-xl p-3.5 text-[#2c1810] font-bold focus:outline-none focus:border-[#4a9e4a]" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-[#8b5e3c] mb-1 block uppercase tracking-wider">जिल्हा</label>
                    <input 
                      type="text" 
                      value={editData.district} 
                      onChange={e => setEditData({...editData, district: e.target.value})} 
                      onBlur={() => handleTranslateOnBlur(editData.district, 'district')}
                      className="w-full bg-[#fdf8f0] border border-[#d4a853]/30 rounded-xl p-3.5 text-[#2c1810] font-bold focus:outline-none focus:border-[#4a9e4a]" 
                      required 
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-[#8b5e3c] mb-1 block uppercase tracking-wider">पिनकोड</label>
                    <input 
                      type="number" 
                      value={editData.pincode} 
                      onChange={e => setEditData({...editData, pincode: e.target.value})} 
                      className="w-full bg-[#fdf8f0] border border-[#d4a853]/30 rounded-xl p-3.5 text-[#2c1810] font-bold focus:outline-none focus:border-[#4a9e4a]" 
                    />
                  </div>
                </div>

                <button type="submit" disabled={isLoading || isLocating} className="w-full bg-gradient-to-r from-[#4a9e4a] to-[#2d6a2d] text-white font-black py-3.5 rounded-xl mt-6 shadow-lg hover:shadow-xl transition-all disabled:opacity-50">
                  {isLoading ? 'सेव्ह करत आहे...' : 'माहिती सेव्ह करा'}
                </button>
              </form>
            </motion.div>
          </div>
        )}

        {/* २. Add Farm Modal */}
        {isFarmModalOpen && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-[2rem] w-full max-w-sm p-6 shadow-2xl relative">
              <button onClick={() => setIsFarmModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 bg-gray-100 p-1.5 rounded-full"><X size={18}/></button>
              
              <div className="mb-6 pr-8">
                <h3 className="text-2xl font-black text-[#2c1810] flex items-center gap-2"><Map className="text-orange-500"/> नवीन शेत</h3>
                <p className="text-xs font-bold text-gray-500 mt-1">तुमच्या शेतीची नोंद करा.</p>
              </div>

              <form onSubmit={handleFarmSave} className="space-y-4">
                <div>
                  <label className="text-[11px] font-bold text-[#8b5e3c] mb-1 block uppercase tracking-wider">शेताचे नाव (उदा. माळरान)</label>
                  <input type="text" value={farmData.name} onChange={e => setFarmData({...farmData, name: e.target.value})} className="w-full bg-[#fdf8f0] border border-[#d4a853]/30 rounded-xl p-3 text-[#2c1810] font-bold focus:outline-none focus:border-[#4a9e4a]" required />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-[#8b5e3c] mb-1 block uppercase tracking-wider">क्षेत्र (एकर)</label>
                    <input type="number" step="0.1" value={farmData.area} onChange={e => setFarmData({...farmData, area: e.target.value})} className="w-full bg-[#fdf8f0] border border-[#d4a853]/30 rounded-xl p-3 text-[#2c1810] font-bold focus:outline-none focus:border-[#4a9e4a]" required />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-[#8b5e3c] mb-1 block uppercase tracking-wider">सिंचन</label>
                    <select value={farmData.irrigation} onChange={e => setFarmData({...farmData, irrigation: e.target.value})} className="w-full bg-[#fdf8f0] border border-[#d4a853]/30 rounded-xl p-3 text-[#2c1810] font-bold focus:outline-none focus:border-[#4a9e4a]">
                      <option>ठिबक</option><option>पाटपाणी</option><option>पाऊस (जिरायत)</option>
                    </select>
                  </div>
                </div>
                <button type="submit" disabled={isLoading} className="w-full bg-gradient-to-r from-orange-400 to-orange-500 text-white font-black py-3.5 rounded-xl mt-4 hover:shadow-lg transition-all disabled:opacity-50">
                  {isLoading ? 'जोडत आहे...' : 'शेत जोडा'}
                </button>
              </form>
            </motion.div>
          </div>
        )}

        {/* ३. Credit History Modal */}
        {isCreditModalOpen && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center sm:p-4 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, y: 100 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 100 }} className="bg-white rounded-t-[2rem] sm:rounded-[2rem] w-full max-w-md p-6 shadow-2xl h-[75vh] flex flex-col">
              
              <div className="flex justify-between items-center mb-6 shrink-0 border-b border-gray-100 pb-4">
                <div>
                  <h3 className="text-2xl font-black text-[#2c1810] flex items-center gap-2"><History className="text-yellow-500" size={24}/> पॉईंट्स इतिहास</h3>
                  <p className="text-xs font-bold text-gray-500 mt-1 flex items-center gap-1">एकूण पॉईंट्स: <span className="text-yellow-500 font-black">{safeCredits}</span></p>
                </div>
                <button onClick={() => setIsCreditModalOpen(false)} className="bg-gray-100 p-2 rounded-full text-gray-500 hover:bg-gray-200 transition-colors"><X size={20}/></button>
              </div>
              
              <div className="flex-1 overflow-y-auto space-y-3 pb-4 pr-1">
                {isLoading ? (
                  <div className="flex justify-center py-10"><span className="animate-spin text-3xl text-gray-300">⏳</span></div>
                ) : creditHistory.length === 0 ? (
                  <div className="text-center py-10">
                     <Award size={40} className="mx-auto text-gray-200 mb-3"/>
                     <p className="text-gray-400 font-bold">कोणताही इतिहास सापडला नाही.</p>
                  </div>
                ) : (
                  creditHistory.map((item) => (
                    <div key={item.id} className="flex justify-between items-center bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:bg-gray-50 transition-colors">
                      <div className="flex gap-3 items-center">
                        <div className="w-10 h-10 rounded-full bg-yellow-50 flex items-center justify-center border border-yellow-100 shrink-0">
                          <Award size={18} className="text-yellow-500"/>
                        </div>
                        <div>
                          <p className="font-bold text-[#2c1810] text-[15px] leading-tight">{item.reason}</p>
                          <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-wider">
                            {new Date(item.date).toLocaleDateString('mr-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </p>
                        </div>
                      </div>
                      <span className="bg-[#d4edda] text-[#2d6a2d] font-black px-3 py-1.5 rounded-lg border border-[#bbf7d0] shadow-sm shrink-0">+{item.points}</span>
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