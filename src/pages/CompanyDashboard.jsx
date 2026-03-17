import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, Map, TrendingUp, Search, Bell, LogOut, Building2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, AreaChart, Area, Legend } from 'recharts';
import { Link } from 'react-router-dom';
import { apiService } from '../services/apiService'; // Using apiService instead of dbService!

const CompanyDashboard = () => {
  const [activeScreen, setActiveScreen] = useState('overview');
  
  // Data States
  const [isLiveData, setIsLiveData] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  
  // AI Query Builder States
  const [searchQuery, setSearchQuery] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResultText, setSearchResultText] = useState('');

  // ── MOCK DATA (Fallback if backend is empty or offline) ──
  const mockData = {
    kpis: [
      { label: 'Active Farmers', val: '12,847', change: '+8.3%', color: 'text-green-400' },
      { label: 'Districts Covered', val: '36', change: '100%', color: 'text-blue-400' },
      { label: 'Data Value (est.)', val: '₹2.4Cr', change: '+₹18L', color: 'text-yellow-400' },
      { label: 'Total Entries', val: '94,231', change: '+2,847 today', color: 'text-purple-400' },
    ],
    heatmapData: [
      { district: 'नाशिक', fertilizer: 890, seeds: 450, pesticides: 230, total: 1570 },
      { district: 'पुणे', fertilizer: 720, seeds: 380, pesticides: 195, total: 1295 },
      { district: 'औरंगाबाद', fertilizer: 650, seeds: 310, pesticides: 180, total: 1140 },
      { district: 'अमरावती', fertilizer: 580, seeds: 290, pesticides: 160, total: 1030 },
      { district: 'लातूर', fertilizer: 540, seeds: 260, pesticides: 140, total: 940 },
    ],
    cropTrendData: [
      { month: 'मे', onion: 800, soybean: 400, cotton: 500 },
      { month: 'जून', onion: 3200, soybean: 2400, cotton: 1200 },
      { month: 'जुलै', onion: 6800, soybean: 5800, cotton: 2400 },
      { month: 'ऑगस्ट', onion: 9200, soybean: 8900, cotton: 3600 },
      { month: 'सप्टें', onion: 11200, soybean: 9800, cotton: 4200 },
    ],
    priceData: [
      { market: 'लासलगाव', farmerPrice: 2100, govtMSP: 1950 },
      { market: 'पिंपळगाव', farmerPrice: 2200, govtMSP: 2000 },
      { market: 'येवला', farmerPrice: 2050, govtMSP: 1900 },
      { market: 'नाशिक', farmerPrice: 1950, govtMSP: 1800 },
    ]
  };

  // ── Fetch Initial Dashboard Data from Backend ──
  useEffect(() => {
    const fetchDashboard = async () => {
      setIsLoading(true);
      try {
        // We ask the backend for the real analytics data
        const data = await apiService.getDashboardData();
        
        // If the backend returns valid data, we use it and turn on the "Live" badge
        if (data && data.heatmapData && data.heatmapData.length > 0) {
          setDashboardData(data);
          setIsLiveData(true);
        } else {
          // If the backend is running but the database is empty, fallback to mock data
          setDashboardData(mockData);
          setIsLiveData(false);
        }
      } catch (error) {
        console.warn("Backend unavailable or returned error. Defaulting to DEMO mode.", error);
        setDashboardData(mockData);
        setIsLiveData(false);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'heatmap', label: 'Demand Heatmap', icon: Map },
    { id: 'prices', label: 'Price Intelligence', icon: TrendingUp },
    { id: 'query', label: 'Query Builder (AI)', icon: Search },
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#0d1f12] border border-[#4a9e4a]/30 p-3 rounded-xl shadow-xl">
          <p className="text-[#4ade80] font-bold mb-2">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }} className="text-sm font-bold">
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // ── AI Query Builder (Sending the question to the backend) ──
  const handleQuerySearch = async () => {
    if (!searchQuery) return;
    setIsSearching(true);
    setShowResult(false);
    
    try {
      // The frontend no longer touches Firebase. It just sends the text query to the backend API.
      // Make sure you add `analyzeCompanyQuery` to your `apiService.js`!
      const aiAnswer = await apiService.analyzeCompanyQuery(searchQuery);
      setSearchResultText(aiAnswer.answer || aiAnswer);
      setShowResult(true);
    } catch (error) {
      console.error("Query Error:", error);
      // Fallback response if API fails
      setSearchResultText("[DEMO MODE] विदर्भात या आठवड्यात कापसावरील कीटकनाशकांची मागणी १८% ने वाढली आहे. (Demand for cotton pesticides in Vidarbha has increased by 18% this week).");
      setShowResult(true);
    } finally {
      setIsSearching(false);
    }
  };

  if (isLoading) {
    return <div className="h-screen w-screen bg-[#0a1a0e] flex items-center justify-center text-[#4ade80] text-xl font-bold">Loading Enterprise Portal...</div>;
  }

  return (
    <div className="flex h-screen bg-[#0a1a0e] text-green-50 font-sans overflow-hidden">
      
      {/* ── SIDEBAR ── */}
      <div className="w-64 bg-[#0d1f12] border-r border-[#4a9e4a]/20 flex flex-col shrink-0 hidden md:flex">
        <div className="p-6 border-b border-[#4a9e4a]/20">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🌾</span>
            <div>
              <h1 className="font-bold text-white leading-tight">IndraAI</h1>
              <p className="text-[10px] text-[#4ade80]/70 uppercase tracking-widest">Enterprise Portal</p>
            </div>
          </div>
        </div>

        <div className="flex-1 py-6 px-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeScreen === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveScreen(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive 
                    ? 'bg-[#4a9e4a]/20 text-[#4ade80] border border-[#4a9e4a]/30' 
                    : 'text-white/60 hover:bg-white/5 hover:text-white border border-transparent'
                }`}
              >
                <Icon size={20} className={isActive ? 'text-[#4ade80]' : 'text-white/40'} />
                <span className="font-semibold text-sm">{item.label}</span>
              </button>
            );
          })}
        </div>

        <div className="p-4 border-t border-[#4a9e4a]/20">
          <Link to="/" className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-400/10 transition-colors">
            <LogOut size={20} />
            <span className="font-semibold text-sm">Logout</span>
          </Link>
        </div>
      </div>

      {/* ── MAIN AREA ── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* TOP HEADER WITH DYNAMIC STATUS BADGE */}
        <header className="h-16 bg-[#0a1a0e]/90 backdrop-blur-md border-b border-[#4a9e4a]/20 flex items-center justify-between px-8 shrink-0">
          
          {/* Status Indicator */}
          {isLiveData ? (
            <div className="flex items-center gap-3 bg-[#4a9e4a]/10 border border-[#4a9e4a]/30 px-4 py-1.5 rounded-full">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#4ade80] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#4ade80]"></span>
              </span>
              <span className="text-xs font-bold text-[#4ade80] tracking-wider uppercase">Live Data Active</span>
            </div>
          ) : (
            <div className="flex items-center gap-3 bg-orange-500/10 border border-orange-500/30 px-4 py-1.5 rounded-full">
              <AlertTriangle size={14} className="text-orange-400" />
              <span className="text-xs font-bold text-orange-400 tracking-wider uppercase">Demo Data Mode</span>
            </div>
          )}

          <div className="flex items-center gap-4">
            <button className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors relative">
              <Bell size={18} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <div className="h-8 w-px bg-white/10"></div>
            <p className="text-sm font-semibold text-white/80 flex items-center gap-2">
              <Building2 size={16}/> AgriCorp India
            </p>
          </div>
        </header>

        {/* ── DYNAMIC CONTENT AREA ── */}
        <main className="flex-1 overflow-y-auto p-8">
          <AnimatePresence mode="wait">
            
            {/* ── 1. OVERVIEW ── */}
            {activeScreen === 'overview' && dashboardData && (
              <motion.div key="overview" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-white mb-2">Dashboard Overview</h2>
                  <p className="text-white/50 text-sm">Real-time Maharashtra Agri Intelligence</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                  {dashboardData.kpis.map((kpi, idx) => (
                    <div key={idx} className="bg-white/5 border border-[#4a9e4a]/20 rounded-2xl p-6 relative overflow-hidden group hover:border-[#4a9e4a]/40 transition-colors">
                      <div className="absolute -right-6 -top-6 w-24 h-24 bg-white/5 rounded-full blur-xl group-hover:bg-white/10 transition-colors" />
                      <p className={`text-3xl font-black ${kpi.color} mb-2 relative z-10`}>{kpi.val}</p>
                      <p className="text-sm text-white/60 font-semibold mb-3 relative z-10">{kpi.label}</p>
                      <span className="inline-block bg-[#4a9e4a]/20 text-[#4ade80] px-2 py-1 rounded text-[10px] font-bold tracking-wider relative z-10">{kpi.change}</span>
                    </div>
                  ))}
                </div>

                <div className="bg-white/5 border border-[#4a9e4a]/20 rounded-2xl p-6">
                  <p className="text-xs font-bold text-[#4ade80] uppercase tracking-widest mb-6">Crop Lifecycle Activity (Hectares)</p>
                  <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={dashboardData.cropTrendData}>
                        <defs>
                          <linearGradient id="colorOnion" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#4ade80" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#4ade80" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorSoy" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#fbbf24" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                        <XAxis dataKey="month" stroke="rgba(255,255,255,0.3)" tick={{fill: 'rgba(255,255,255,0.5)', fontSize: 12}} />
                        <YAxis stroke="rgba(255,255,255,0.3)" tick={{fill: 'rgba(255,255,255,0.5)', fontSize: 12}} />
                        <RechartsTooltip content={<CustomTooltip />} />
                        <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                        <Area type="monotone" dataKey="onion" name="कांदा (Onion)" stroke="#4ade80" strokeWidth={3} fillOpacity={1} fill="url(#colorOnion)" />
                        <Area type="monotone" dataKey="soybean" name="सोयाबीन (Soybean)" stroke="#fbbf24" strokeWidth={3} fillOpacity={1} fill="url(#colorSoy)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── 2. HEATMAP ── */}
            {activeScreen === 'heatmap' && dashboardData && (
              <motion.div key="heatmap" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-white mb-2">Regional Demand Heatmap</h2>
                  <p className="text-white/50 text-sm">Live tracking of agri-input purchases across districts</p>
                </div>

                <div className="bg-white/5 border border-[#4a9e4a]/20 rounded-2xl p-6 mb-8">
                  <p className="text-xs font-bold text-[#4ade80] uppercase tracking-widest mb-6">Input Demand by Category (Stack)</p>
                  <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={dashboardData.heatmapData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                        <XAxis dataKey="district" stroke="rgba(255,255,255,0.3)" tick={{fill: 'rgba(255,255,255,0.5)', fontSize: 12}} />
                        <YAxis stroke="rgba(255,255,255,0.3)" tick={{fill: 'rgba(255,255,255,0.5)', fontSize: 12}} />
                        <RechartsTooltip content={<CustomTooltip />} />
                        <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                        <Bar dataKey="fertilizer" name="Fertilizer (खते)" stackId="a" fill="#4a9e4a" radius={[0, 0, 4, 4]} />
                        <Bar dataKey="seeds" name="Seeds (बियाणे)" stackId="a" fill="#d4a853" />
                        <Bar dataKey="pesticides" name="Pesticides (कीटकनाशके)" stackId="a" fill="#3b82c4" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── 3. PRICE INTELLIGENCE ── */}
            {activeScreen === 'prices' && dashboardData && (
              <motion.div key="prices" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-white mb-2">Price Intelligence</h2>
                  <p className="text-white/50 text-sm">Actual farmer sale prices vs Government MSP</p>
                </div>

                <div className="bg-white/5 border border-[#4a9e4a]/20 rounded-2xl p-6">
                  <p className="text-xs font-bold text-[#4ade80] uppercase tracking-widest mb-6">Onion Market Comparison (₹ / Quintal)</p>
                  <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={dashboardData.priceData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                        <XAxis dataKey="market" stroke="rgba(255,255,255,0.3)" tick={{fill: 'rgba(255,255,255,0.5)', fontSize: 12}} />
                        <YAxis stroke="rgba(255,255,255,0.3)" domain={[1500, 'dataMax + 200']} tick={{fill: 'rgba(255,255,255,0.5)', fontSize: 12}} />
                        <RechartsTooltip content={<CustomTooltip />} />
                        <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                        <Bar dataKey="farmerPrice" name="Farmer Price (Actual)" fill="#4ade80" radius={[4, 4, 0, 0]} barSize={40} />
                        <Bar dataKey="govtMSP" name="Government MSP" fill="#60a5fa" radius={[4, 4, 0, 0]} barSize={40} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── 4. QUERY BUILDER (AI INTEGRATION) ── */}
            {activeScreen === 'query' && (
              <motion.div key="query" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-white mb-2">Natural Language Query</h2>
                  <p className="text-white/50 text-sm">Ask IndraAI questions about the real anonymized farmer database.</p>
                </div>

                <div className="bg-white/5 border border-[#4a9e4a]/20 rounded-2xl p-6 mb-6 shadow-lg">
                  <div className="flex gap-4">
                    <input 
                      type="text" 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleQuerySearch()}
                      placeholder="e.g. Which district bought the most fertilizer this week?"
                      className="flex-1 bg-[#0a1a0e] border border-[#4a9e4a]/50 rounded-xl px-5 py-4 text-white placeholder-white/30 focus:outline-none focus:border-[#4ade80] transition-colors"
                    />
                    <button 
                      onClick={handleQuerySearch}
                      disabled={isSearching}
                      className="bg-[#4a9e4a] hover:bg-[#368636] text-white px-8 py-4 rounded-xl font-bold transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                      {isSearching ? <span className="animate-spin">⏳</span> : <Search size={20} />} 
                      {isSearching ? 'Searching Data...' : 'Search AI'}
                    </button>
                  </div>
                  
                  {/* Suggestion Chips */}
                  <div className="flex flex-wrap gap-3 mt-5">
                    {['Pest issues in Vidarbha?', 'Districts with highest fertilizer demand?', 'Soybean harvest progress?'].map((suggestion, idx) => (
                      <button 
                        key={idx}
                        onClick={() => {
                          setSearchQuery(suggestion);
                          setShowResult(false);
                        }}
                        className="bg-white/5 border border-white/10 hover:border-[#4a9e4a]/50 text-white/70 hover:text-[#4ade80] px-4 py-2 rounded-full text-xs font-semibold transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>

                {/* AI Librarian's Answer */}
                {showResult && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-[#4a9e4a]/10 border border-[#4a9e4a]/30 rounded-2xl p-6 shadow-xl relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#4ade80]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
                    
                    <div className="relative z-10">
                      <p className="text-xs font-bold text-[#4ade80] uppercase tracking-widest mb-4 flex items-center gap-2">
                        {isLiveData ? <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span> : <AlertTriangle size={12} className="text-orange-400" />}
                        IndraAI Query Result {isLiveData ? '(Live)' : '(Demo)'}
                      </p>
                      
                      <p className="text-lg text-white/90 leading-relaxed font-marathi whitespace-pre-wrap">
                        {searchResultText}
                      </p>
                      
                      <div className="flex gap-3 mt-6 pt-4 border-t border-white/10">
                        {isLiveData ? (
                           <span className="bg-green-500/20 text-green-300 border border-green-500/30 px-3 py-1.5 rounded-lg text-[10px] font-bold flex items-center gap-1"><CheckCircle2 size={12}/> Real-time Firebase Data</span>
                        ) : (
                           <span className="bg-orange-500/20 text-orange-300 border border-orange-500/30 px-3 py-1.5 rounded-lg text-[10px] font-bold flex items-center gap-1"><AlertTriangle size={12}/> Mock Dataset</span>
                        )}
                        <span className="bg-blue-500/20 text-blue-300 border border-blue-500/30 px-3 py-1.5 rounded-lg text-[10px] font-bold">Processed by Sarvam AI</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}

          </AnimatePresence>
        </main>
      </div>

    </div>
  );
};

export default CompanyDashboard;