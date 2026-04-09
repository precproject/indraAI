import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, Map, TrendingUp, Search, Bell, LogOut, Building2, AlertTriangle, CheckCircle2, Menu, X, BarChart2, PieChart as PieChartIcon, LineChart as LineChartIcon  } from 'lucide-react';
import { BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, AreaChart, Area, Legend } from 'recharts';
import { Link } from 'react-router-dom';
import { apiService } from '../services/apiService';

// Colors for AI generated Pie Charts
const COLORS = ['#4ade80', '#3b82f6', '#fbbf24', '#f87171', '#a78bfa', '#34d399'];

const CompanyDashboard = () => {
  const [activeScreen, setActiveScreen] = useState('overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const [isLiveData, setIsLiveData] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  
  // AI Query Builder States
  const [searchQuery, setSearchQuery] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [aiResponseData, setAiResponseData] = useState(null); 

  // MOCK DATA (Fallback if DB is empty)
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

  useEffect(() => {
    const fetchDashboard = async () => {
      setIsLoading(true);
      try {
        const data = await apiService.getDashboardData();
        if (data && data.heatmapData && data.heatmapData.length > 0) {
          setDashboardData(data);
          setIsLiveData(true);
        } else {
          setDashboardData(mockData);
          setIsLiveData(false);
        }
      } catch (error) {
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
    { id: 'query', label: 'Natural Query (AI)', icon: Search },
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#0d1f12] border border-[#4a9e4a]/30 p-3 rounded-xl shadow-xl z-50">
          <p className="text-[#4ade80] font-bold mb-2">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color || entry.payload.fill }} className="text-sm font-bold">
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // ── AI NLP Query Handler ──
  const handleQuerySearch = async () => {
    if (!searchQuery) return;
    setIsSearching(true);
    setShowResult(false);
    
    try {
      const aiAnswer = await apiService.analyzeCompanyQuery(searchQuery);
      setAiResponseData(aiAnswer);
      setShowResult(true);
    } catch (error) {
      console.error("Query Error:", error);
      // Fallback for Demo
      setAiResponseData({
        text_summary: "[DEMO] आमच्या डेटानुसार सर्वात जास्त खर्च नाशिक जिल्ह्यात खतांवर झाला आहे.",
        chart_type: "bar",
        chart_data: [
          { name: "नाशिक", value: 150000 },
          { name: "पुणे", value: 120000 }
        ]
      });
      setShowResult(true);
    } finally {
      setIsSearching(false);
    }
  };

  // 🟢 Dynamic Chart Renderer Based on AI Response
  const renderDynamicChart = () => {
    if (!aiResponseData || !aiResponseData.chart_data || aiResponseData.chart_data.length === 0 || aiResponseData.chart_type === 'none') {
      return null;
    }

    const data = aiResponseData.chart_data;

    return (
      <div className="h-64 md:h-80 w-full mt-6 bg-[#0a1a0e]/50 rounded-xl p-4 border border-[#4a9e4a]/20">
        <ResponsiveContainer width="100%" height="100%">
          {aiResponseData.chart_type === 'bar' && (
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" tick={{fill: '#a3a3a3', fontSize: 12}} />
              <YAxis stroke="rgba(255,255,255,0.3)" tick={{fill: '#a3a3a3', fontSize: 12}} width={80} />
              <RechartsTooltip content={<CustomTooltip />} />
              <Bar dataKey="value" name="Value" fill="#4ade80" radius={[4, 4, 0, 0]} maxBarSize={60} />
            </BarChart>
          )}

          {aiResponseData.chart_type === 'pie' && (
            <PieChart>
              <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value" nameKey="name" label={({name})=>name}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <RechartsTooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
            </PieChart>
          )}

          {/* 🟢 NEW: Time Series Line Chart */}
          {aiResponseData.chart_type === 'line' && (
            <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" tick={{fill: '#a3a3a3', fontSize: 12}} />
              <YAxis stroke="rgba(255,255,255,0.3)" tick={{fill: '#a3a3a3', fontSize: 12}} width={80} />
              <RechartsTooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="value" name="Trend" stroke="#3b82f6" strokeWidth={3} dot={{ r: 5, fill: "#4ade80", stroke: "#0a1a0e", strokeWidth: 2 }} />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
    );
  };

  if (isLoading) {
    return <div className="h-screen w-screen bg-[#0a1a0e] flex items-center justify-center text-[#4ade80] text-xl font-bold">Loading Enterprise Portal...</div>;
  }

  return (
    <div className="flex h-screen bg-[#0a1a0e] text-green-50 font-sans overflow-hidden relative">
      
      {/* ── MOBILE OVERLAY ── */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      {/* ── SIDEBAR (Responsive) ── */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#0d1f12] border-r border-[#4a9e4a]/20 flex flex-col transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 transition-transform duration-300 ease-in-out`}>
        <div className="p-6 border-b border-[#4a9e4a]/20 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🌾</span>
            <div>
              <h1 className="font-bold text-white leading-tight">IndraAI</h1>
              <p className="text-[10px] text-[#4ade80]/70 uppercase tracking-widest">Enterprise</p>
            </div>
          </div>
          <button className="md:hidden text-white/50 hover:text-white" onClick={() => setIsMobileMenuOpen(false)}>
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeScreen === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { setActiveScreen(item.id); setIsMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive ? 'bg-[#4a9e4a]/20 text-[#4ade80] border border-[#4a9e4a]/30' : 'text-white/60 hover:bg-white/5 border border-transparent'
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
      <div className="flex-1 flex flex-col overflow-hidden w-full relative">
        
        {/* HEADER */}
        <header className="h-16 bg-[#0a1a0e]/90 backdrop-blur-md border-b border-[#4a9e4a]/20 flex items-center justify-between px-4 md:px-8 shrink-0 z-10">
          <div className="flex items-center gap-4">
            <button className="md:hidden text-[#4ade80] p-1" onClick={() => setIsMobileMenuOpen(true)}>
              <Menu size={24} />
            </button>
            
            {isLiveData ? (
              <div className="hidden sm:flex items-center gap-2 bg-[#4a9e4a]/10 border border-[#4a9e4a]/30 px-3 py-1 rounded-full">
                <span className="flex h-2 w-2 relative"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#4ade80] opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-[#4ade80]"></span></span>
                <span className="text-[10px] font-bold text-[#4ade80] tracking-wider uppercase">Live Data</span>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2 bg-orange-500/10 border border-orange-500/30 px-3 py-1 rounded-full">
                <AlertTriangle size={12} className="text-orange-400" />
                <span className="text-[10px] font-bold text-orange-400 tracking-wider uppercase">Demo Mode</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            <button className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/70 relative">
              <Bell size={16} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <div className="hidden sm:flex items-center gap-2 border-l border-white/10 pl-4">
              <Building2 size={16} className="text-white/50"/> 
              <p className="text-sm font-semibold text-white/80">AgriCorp India</p>
            </div>
          </div>
        </header>

        {/* CONTENT */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <AnimatePresence mode="wait">
            
            {/* ── 1. OVERVIEW ── */}
            {activeScreen === 'overview' && dashboardData && (
              <motion.div key="overview" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-white mb-2">Dashboard Overview</h2>
                  <p className="text-white/50 text-sm">Real-time Maharashtra Agri Intelligence</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8">
                  {dashboardData.kpis.map((kpi, idx) => (
                    <div key={idx} className="bg-white/5 border border-[#4a9e4a]/20 rounded-xl md:rounded-2xl p-4 md:p-6 relative overflow-hidden group hover:border-[#4a9e4a]/40 transition-colors">
                      <div className="absolute -right-6 -top-6 w-24 h-24 bg-white/5 rounded-full blur-xl group-hover:bg-white/10 transition-colors" />
                      <p className={`text-2xl md:text-3xl font-black ${kpi.color} mb-2 relative z-10`}>{kpi.val}</p>
                      <p className="text-xs md:text-sm text-white/60 font-semibold mb-3 relative z-10">{kpi.label}</p>
                      <span className="inline-block bg-[#4a9e4a]/20 text-[#4ade80] px-2 py-1 rounded text-[10px] font-bold tracking-wider relative z-10">{kpi.change}</span>
                    </div>
                  ))}
                </div>

                <div className="bg-white/5 border border-[#4a9e4a]/20 rounded-2xl p-4 md:p-6">
                  <p className="text-xs font-bold text-[#4ade80] uppercase tracking-widest mb-6">Crop Lifecycle Activity (Hectares)</p>
                  <div className="h-64 md:h-72 w-full">
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
                        <YAxis stroke="rgba(255,255,255,0.3)" tick={{fill: 'rgba(255,255,255,0.5)', fontSize: 12}} width={40} />
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

                <div className="bg-white/5 border border-[#4a9e4a]/20 rounded-2xl p-4 md:p-6 mb-8">
                  <p className="text-xs font-bold text-[#4ade80] uppercase tracking-widest mb-6">Input Demand by Category (Stack)</p>
                  <div className="h-64 md:h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={dashboardData.heatmapData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                        <XAxis dataKey="district" stroke="rgba(255,255,255,0.3)" tick={{fill: 'rgba(255,255,255,0.5)', fontSize: 12}} />
                        <YAxis stroke="rgba(255,255,255,0.3)" tick={{fill: 'rgba(255,255,255,0.5)', fontSize: 12}} width={40} />
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

                <div className="bg-white/5 border border-[#4a9e4a]/20 rounded-2xl p-4 md:p-6">
                  <p className="text-xs font-bold text-[#4ade80] uppercase tracking-widest mb-6">Onion Market Comparison (₹ / Quintal)</p>
                  <div className="h-64 md:h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={dashboardData.priceData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                        <XAxis dataKey="market" stroke="rgba(255,255,255,0.3)" tick={{fill: 'rgba(255,255,255,0.5)', fontSize: 12}} />
                        <YAxis stroke="rgba(255,255,255,0.3)" domain={[1500, 'dataMax + 200']} tick={{fill: 'rgba(255,255,255,0.5)', fontSize: 12}} width={40} />
                        <RechartsTooltip content={<CustomTooltip />} />
                        <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                        <Bar dataKey="farmerPrice" name="Farmer Price (Actual)" fill="#4ade80" radius={[4, 4, 0, 0]} barSize={30} />
                        <Bar dataKey="govtMSP" name="Government MSP" fill="#60a5fa" radius={[4, 4, 0, 0]} barSize={30} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── 4. NATURAL LANGUAGE QUERY (AI) ── */}
            {activeScreen === 'query' && (
              <motion.div key="query" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <div className="mb-6 md:mb-8">
                  <h2 className="text-xl md:text-2xl font-bold text-white mb-1 md:mb-2">Natural Language Query</h2>
                  <p className="text-white/50 text-xs md:text-sm">Ask natural language questions to generate dynamic charts and analysis.</p>
                </div>

                {/* Search Box */}
                <div className="bg-white/5 border border-[#4a9e4a]/20 rounded-2xl p-4 md:p-6 mb-6 shadow-lg">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input 
                      type="text" 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleQuerySearch()}
                      placeholder="उदा. जिल्ह्यानुसार एकूण खर्च दाखवा..."
                      className="flex-1 bg-[#0a1a0e] border border-[#4a9e4a]/50 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#4ade80] transition-colors"
                    />
                    <button 
                      onClick={handleQuerySearch}
                      disabled={isSearching || !searchQuery.trim()}
                      className="bg-[#4a9e4a] hover:bg-[#368636] text-white px-6 py-3 rounded-xl font-bold transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isSearching ? <span className="animate-spin">⏳</span> : <Search size={18} />} 
                      <span className="hidden sm:inline">{isSearching ? 'Processing...' : 'Search'}</span>
                    </button>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mt-4">
                    {['सर्वात जास्त लागवड कोणती पिके आहेत?', 'जिल्ह्यानुसार खर्चाची तुलना करा', 'सध्या बाजारात कांद्याला काय भाव मिळत आहे?'].map((suggestion, idx) => (
                      <button 
                        key={idx}
                        onClick={() => { setSearchQuery(suggestion); setShowResult(false); }}
                        className="bg-white/5 border border-white/10 hover:border-[#4a9e4a]/50 text-white/70 hover:text-[#4ade80] px-3 py-1.5 rounded-full text-[10px] md:text-xs font-semibold transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 🟢 AI RESPONSE (TEXT + DYNAMIC CHART) */}
                {showResult && aiResponseData && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }} 
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-[#0d1f12] border border-[#4a9e4a]/30 rounded-2xl p-5 md:p-8 shadow-2xl relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#4ade80]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
                    
                    <div className="relative z-10">
                      <div className="flex items-center gap-2 mb-4 pb-4 border-b border-white/5">
                        <span className="bg-[#4a9e4a]/20 p-2 rounded-lg">
                          {aiResponseData.chart_type === 'pie' ? <PieChartIcon size={16} className="text-[#4ade80]"/> : 
                          aiResponseData.chart_type === 'line' ? <LineChartIcon size={16} className="text-[#4ade80]"/> :
                           aiResponseData.chart_type === 'bar' ? <BarChart2 size={16} className="text-[#4ade80]"/> :
                           <CheckCircle2 size={16} className="text-[#4ade80]"/>}
                        </span>
                        <h3 className="font-bold text-white text-sm md:text-base">AI Analysis Result</h3>
                      </div>
                      
                      {/* ALWAYS SHOW TEXT SUMMARY */}
                      <p className="text-sm md:text-base text-white/90 leading-relaxed font-marathi whitespace-pre-wrap">
                        {aiResponseData.text_summary}
                      </p>

                      {/* CONDITIONAL CHART RENDERING */}
                      {aiResponseData.chart_type !== 'none' && renderDynamicChart()}

                      <div className="flex flex-wrap gap-3 mt-6 pt-4 border-t border-white/10">
                        {isLiveData ? (
                           <span className="bg-green-500/10 text-green-400 border border-green-500/20 px-3 py-1.5 rounded-lg text-[10px] font-bold flex items-center gap-1.5"><CheckCircle2 size={12}/> Live Database Active</span>
                        ) : (
                           <span className="bg-orange-500/10 text-orange-400 border border-orange-500/20 px-3 py-1.5 rounded-lg text-[10px] font-bold flex items-center gap-1.5"><AlertTriangle size={12}/> Demo Mode Dataset</span>
                        )}
                        <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-3 py-1.5 rounded-lg text-[10px] font-bold">Powered by IndraAI Analytics</span>
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