import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, MapPin, Award, ArrowUpRight, ArrowDownRight, RefreshCw, AlertCircle, Building2 } from 'lucide-react';
import { apiService } from '../services/apiService';
import { useAppContext } from '../context/AppContext';

const MarketRoom = () => {
  const { user, cycles } = useAppContext();
  
  const [selectedCrop, setSelectedCrop] = useState('');
  const [marketData, setMarketData] = useState([]); // आता हा कायम Array असेल!
  const [isLoading, setIsLoading] = useState(true);

  // ── १. शेतकऱ्याच्या पिकांवरून टॅब्स ठरवणे ──
  const farmerCrops = cycles && cycles.length > 0 
    ? Array.from(new Set(cycles.map(c => c.crop))) 
    : ['कांदा', 'सोयाबीन', 'कापूस', 'टोमॅटो'];

  // सुरुवातीला पहिले पीक आपोआप निवडणे
  useEffect(() => {
    if (!selectedCrop && farmerCrops.length > 0) {
      setSelectedCrop(farmerCrops[0]);
    }
  }, [cycles, selectedCrop, farmerCrops]);

  // ── २. डेटा आणणे (Real API + Mock Fallback) ──
  const fetchMarketData = async (crop) => {
    if (!crop) return;
    setIsLoading(true);
    
    try {
      const userDistrict = user?.district || 'पुणे';
      
      // 🌐 भविष्यातील Agmarknet API इंटिग्रेशनसाठी येथे बदल करा:
      // const response = await fetch(`https://api.agmarknet.gov.in/prices?crop=${crop}&district=${userDistrict}`);
      // const data = await response.json();
      
      // सध्या आपण आपल्या लोकल बॅकएंडला कॉल करत आहोत
      const data = await apiService.getMarketData(crop, userDistrict);
      
      // जर बॅकएंडने खरा डेटा दिला असेल (Array मध्ये)
      if (Array.isArray(data) && data.length > 0) {
        setMarketData(data);
      } else {
        // डेटा नसेल तर 'Mock Data' वापरा
        loadMockData(crop);
      }
    } catch (error) {
      console.warn("Market API failed, using local mock data...");
      loadMockData(crop); 
    } finally {
      setIsLoading(false);
    }
  };

  // ── ३. नमुना डेटा (Mock Data Fallback) ──
  // हा डेटा हुबेहूब तुमच्या बॅकएंडच्या (Agmarknet च्या) फॉरमॅटमध्ये बनवला आहे
  const loadMockData = (crop) => {
    const allMockData = {
      'कांदा': [
        { market: 'पिंपळगाव', avg: 2200, min: 2000, max: 2700, dist: 'नाशिक', source: 'सरकारी बाजार समिती', trend: 50 },
        { market: 'लासलगाव', avg: 2100, min: 1900, max: 2400, dist: 'नाशिक', source: 'सरकारी बाजार समिती', trend: -100 },
        { market: 'पुणे', avg: 1900, min: 1800, max: 2000, dist: 'पुणे', source: 'स्थानिक शेतकरी', trend: 150 }
      ],
      'सोयाबीन': [
        { market: 'नागपूर', avg: 5400, min: 5100, max: 5800, dist: 'नागपूर', source: 'सरकारी बाजार समिती', trend: 200 },
        { market: 'लातूर', avg: 5200, min: 5050, max: 5550, dist: 'लातूर', source: 'कृषी उत्पन्न बाजार', trend: -50 }
      ],
      'कापूस': [
        { market: 'औरंगाबाद', avg: 6800, min: 6500, max: 7200, dist: 'औरंगाबाद', source: 'सरकारी बाजार समिती', trend: 300 }
      ]
    };

    setMarketData(allMockData[crop] || []);
  };

  // पीक बदलल्यावर किंवा रिफ्रेश केल्यावर डेटा पुन्हा आणा
  useEffect(() => {
    if (selectedCrop) {
      fetchMarketData(selectedCrop);
    }
  }, [selectedCrop]);

  const handleRefresh = () => fetchMarketData(selectedCrop);

  // ── ४. आकडेवारी आणि सॉर्टिंग (Sorting Array) ──
  // आलेल्या Array ला भावानुसार (avg) उतरत्या क्रमाने लावणे
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
          <p className="text-sm font-bold text-[#8b5e3c] mt-1 tracking-wide flex items-center gap-1">
            <MapPin size={12}/> {user?.district || 'महाराष्ट्र'} परिसरातील ताजे भाव
          </p>
        </div>
        <button onClick={handleRefresh} disabled={isLoading} className="p-2 bg-white rounded-full border border-[#d4a853]/30 text-[#8b5e3c] hover:bg-[#d4edda] transition-colors shadow-sm">
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
        <div className="flex justify-center py-8"><span className="animate-spin text-3xl">⏳</span></div>
      ) : sortedMarkets.length === 0 ? (
        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 flex items-start gap-3">
           <AlertCircle className="text-orange-400 shrink-0 mt-0.5" size={20} />
           <p className="text-sm text-orange-800 font-bold">सध्या '{selectedCrop}' चे बाजारभाव उपलब्ध नाहीत. इतर शेतकऱ्यांनी नोंद केल्यावर ते इथे दिसतील.</p>
        </div>
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
                    if (idx === 0) return null; // सर्वोत्तम बाजार आधीच वर दाखवला आहे
                    
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
                            {market.trend && (
                              <p className={`text-[10px] font-bold flex items-center justify-end gap-0.5 mt-1 ${market.trend > 0 ? 'text-[#4a9e4a]' : 'text-red-500'}`}>
                                {market.trend > 0 ? <ArrowUpRight size={12}/> : <ArrowDownRight size={12}/>} ₹{Math.abs(market.trend)}
                              </p>
                            )}
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