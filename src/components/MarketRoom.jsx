import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, MapPin, Award, ArrowUpRight, ArrowDownRight, RefreshCw, AlertCircle, Building2, Clock } from 'lucide-react';
import { apiService } from '../services/apiService';
import { useAppContext } from '../context/AppContext';

const MarketRoom = () => {
  const { user, cycles } = useAppContext();
  
  const [selectedCrop, setSelectedCrop] = useState('');
  const [marketData, setMarketData] = useState([]); 
  const [isLoading, setIsLoading] = useState(true);
  
  // 🟢 नवीन: शेवटच्या अपडेटची वेळ साठवण्यासाठी
  const [lastUpdated, setLastUpdated] = useState(null);

  // ── १. शेतकऱ्याच्या पिकांवरून टॅब्स ठरवणे ──
  const farmerCrops = cycles && cycles.length > 0 
    ? Array.from(new Set(cycles.map(c => c.crop))) 
    : ['कांदा', 'सोयाबीन', 'कापूस', 'टोमॅटो'];

  useEffect(() => {
    if (!selectedCrop && farmerCrops.length > 0) {
      setSelectedCrop(farmerCrops[0]);
    }
  }, [cycles, selectedCrop, farmerCrops]);

  // ── २. फक्त खरा डेटा आणणे (No Mock Data) ──
  const fetchMarketData = async (crop) => {
    if (!crop) return;
    setIsLoading(true);
    
    try {
      const userDistrict = user?.district || 'पुणे';
      const data = await apiService.getMarketData(crop, userDistrict);
      
      if (Array.isArray(data) && data.length > 0) {
        setMarketData(data);
      } else {
        setMarketData([]); // डेटा नसेल तर रिकामी यादी
      }
      setLastUpdated(new Date()); // वेळ अपडेट करा
    } catch (error) {
      console.warn("Market API failed:", error);
      setMarketData([]); 
      setLastUpdated(new Date());
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedCrop) {
      fetchMarketData(selectedCrop);
    }
  }, [selectedCrop]);

  const handleRefresh = () => fetchMarketData(selectedCrop);

  // वेळेचे स्वरूप (Formatting Time)
  const formatTime = (date) => {
    if (!date) return '';
    return date.toLocaleTimeString('mr-IN', { hour: '2-digit', minute: '2-digit' });
  };

  // ── ३. आकडेवारी आणि सॉर्टिंग ──
  const sortedMarkets = [...marketData].sort((a, b) => b.avg - a.avg);
  const bestMarket = sortedMarkets.length > 0 ? sortedMarkets[0] : null;
  const lowestPrice = sortedMarkets.length > 0 ? Math.min(...sortedMarkets.map(m => m.avg)) : 0;
  const priceRange = bestMarket ? bestMarket.avg - lowestPrice : 0;

  return (
    <div className="flex flex-col h-full bg-[#fdf8f0] p-4 space-y-6 overflow-y-auto pb-32">
      
      {/* ── THE ROOM HEADER ── */}
      <div className="pt-2 flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-black text-[#2c1810] flex items-center gap-2">
            <TrendingUp className="text-[#4a9e4a]" size={28} /> बाजारभाव
          </h2>
          <div className="flex flex-col gap-1 mt-1">
            <p className="text-sm font-bold text-[#8b5e3c] tracking-wide flex items-center gap-1">
              <MapPin size={12}/> {user?.district} परिसरातील ताजे भाव
            </p>
            {/* 🟢 नवीन: Last Updated Time */}
            {lastUpdated && (
              <p className="text-[10px] font-bold text-[#8b5e3c]/60 flex items-center gap-1">
                <Clock size={10} /> शेवटचे अपडेट: आज, {formatTime(lastUpdated)}
              </p>
            )}
          </div>
        </div>
        
        {/* Top Refresh Button */}
        <button onClick={handleRefresh} disabled={isLoading} className="p-2 bg-white rounded-full border border-[#d4a853]/30 text-[#8b5e3c] hover:bg-[#d4edda] transition-colors shadow-sm mt-1">
          <RefreshCw size={20} className={isLoading ? "animate-spin text-[#4a9e4a]" : ""} />
        </button>
      </div>

      {/* ── THE CROP SELECTOR (Tabs) ── */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide shrink-0">
        {farmerCrops.map((crop) => (
          <button
            key={crop}
            onClick={() => setSelectedCrop(crop)}
            className={`px-6 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all shadow-sm ${
              selectedCrop === crop 
                ? 'bg-[#2c1810] text-white shadow-md transform scale-105' 
                : 'bg-white text-[#5c3317] border border-[#d4a853]/30 hover:bg-[#fdf8f0]'
            }`}
          >
            {crop}
          </button>
        ))}
      </div>

      {/* ── CONTENT AREA ── */}
      {isLoading ? (
        <div className="flex justify-center py-12"><span className="animate-spin text-4xl">⏳</span></div>
      ) : sortedMarkets.length === 0 ? (
        
        /* 🟢 नवीन: No Data UI with Big Refresh Button */
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center mt-6 p-8 bg-white border border-[#d4a853]/30 rounded-[2rem] shadow-sm text-center"
        >
          <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mb-4 border border-orange-100">
            <AlertCircle className="text-orange-400" size={32} />
          </div>
          <h3 className="text-lg font-black text-[#2c1810] mb-2">माहिती उपलब्ध नाही</h3>
          <p className="text-sm text-[#8b5e3c] font-bold mb-6 leading-relaxed">
            सध्या <span className="text-[#5c3317] border-b border-[#d4a853] px-1">'{selectedCrop}'</span> चे ताजे बाजारभाव उपलब्ध नाहीत. इतर शेतकऱ्यांनी त्यांच्या विक्रीची नोंद केल्यावर ते इथे दिसतील.
          </p>
          <button
            onClick={handleRefresh}
            className="px-6 py-3 bg-[#fdf8f0] border border-[#d4a853]/50 text-[#5c3317] font-bold rounded-full hover:bg-[#d4edda] transition-colors flex items-center gap-2 shadow-sm active:scale-95"
          >
            <RefreshCw size={18} className={isLoading ? "animate-spin" : ""} />
            पुन्हा तपासा (Refresh)
          </button>
        </motion.div>

      ) : (
        <>
          {/* ── THE GOLDEN TICKET (Best Market) ── */}
          <AnimatePresence mode="wait">
            {bestMarket && (
              <motion.div
                key={`best-${selectedCrop}`}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className="bg-gradient-to-br from-[#1a4d1a] to-[#2d6a2d] rounded-[2rem] p-6 shadow-xl text-white relative overflow-hidden shrink-0"
              >
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
                
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-4">
                    <Award size={20} className="text-[#fef08a]" />
                    <p className="text-xs font-bold text-white/90 uppercase tracking-widest">सर्वोत्तम भाव आज</p>
                  </div>
                  
                  <h3 className="text-3xl font-black mb-1">{bestMarket.market}</h3>
                  <p className="text-3xl font-bold text-[#4ade80] mb-5">
                    ₹{bestMarket.avg.toLocaleString('en-IN')} <span className="text-sm font-normal text-white/70">/ क्विंटल</span>
                  </p>
                  
                  <div className="flex items-center justify-between bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/10">
                    <div>
                      <p className="text-[10px] text-white/60 mb-0.5">किमान ते कमाल</p>
                      <p className="text-sm font-bold">₹{bestMarket.min} - ₹{bestMarket.max}</p>
                    </div>
                    <div className="text-right flex flex-col items-end">
                      <p className="text-sm font-bold text-white flex items-center gap-1">
                        <MapPin size={12} /> {bestMarket.dist}
                      </p>
                      {bestMarket.source && (
                        <p className="text-[9px] text-white/70 mt-1 flex items-center gap-1 font-marathi border border-white/20 px-1.5 py-0.5 rounded">
                          <Building2 size={8} /> {bestMarket.source}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── THE COMPARISON BOARD (Other Markets) ── */}
          {sortedMarkets.length > 1 && (
            <div className="mt-4 flex-1">
              <p className="text-xs font-bold text-[#8b5e3c] uppercase tracking-widest mb-4 flex items-center gap-3">
                इतर बाजार <span className="flex-1 h-px bg-[#d4a853]/30" />
              </p>
              
              <div className="space-y-4">
                <AnimatePresence mode="wait">
                  {sortedMarkets.map((market, idx) => {
                    if (idx === 0) return null; 
                    
                    const fillPercentage = priceRange === 0 ? 100 : ((market.avg - lowestPrice) / priceRange) * 100;

                    return (
                      <motion.div
                        key={`${market.market}-${idx}`}
                        initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.1 }}
                        className="bg-white rounded-[1.5rem] p-5 border border-[#d4a853]/20 shadow-sm flex flex-col gap-3 hover:shadow-md transition-shadow"
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="font-black text-[#2c1810] text-xl">{market.market}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              <p className="text-[10px] font-bold text-[#8b5e3c] flex items-center gap-1 font-marathi">
                                <MapPin size={12} /> {market.dist}
                              </p>
                              {market.source && (
                                <p className="text-[9px] text-[#8b5e3c]/70 bg-[#fdf8f0] px-1.5 py-0.5 rounded border border-[#d4a853]/20 flex items-center gap-1">
                                  <Building2 size={8}/> {market.source}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-black text-xl text-[#5c3317]">₹{market.avg.toLocaleString('en-IN')}</p>
                          </div>
                        </div>

                        <div className="h-1.5 w-full bg-[#fdf8f0] rounded-full overflow-hidden border border-[#d4a853]/10 mt-1">
                          <motion.div 
                            initial={{ width: 0 }} animate={{ width: `${Math.max(5, fillPercentage)}%` }} transition={{ duration: 0.8, delay: idx * 0.1 }}
                            className="h-full bg-gradient-to-r from-[#a8d5b0] to-[#4a9e4a] rounded-full"
                          />
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MarketRoom;