import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, MapPin, Award, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const MarketRoom = () => {
  const { ledger } = useAppContext();
  const [selectedCrop, setSelectedCrop] = useState('कांदा');
  const [marketData, setMarketData] = useState({});

  // ── १. खऱ्या नोंदींमधून (Firebase/Ledger) बाजारभाव तयार करणे ──
  useEffect(() => {
    if (!ledger) return;

    // फक्त उत्पन्नाच्या (income) नोंदी घ्या ज्यामध्ये पिकाचे नाव आहे
    const sales = ledger.filter(e => e.type === 'income' && (e.crop || e.commodity));

    const data = {};
    sales.forEach(sale => {
      const cropName = sale.crop || sale.commodity;
      if (!data[cropName]) data[cropName] = {};

      // मार्केट किंवा जिल्ह्यानुसार गट (Group) करा
      const marketName = sale.market || sale.district || 'स्थानिक बाजार';

      if (!data[cropName][marketName]) {
        data[cropName][marketName] = {
          market: marketName,
          dist: sale.district || 'स्थानिक',
          prices: [],
          trend: 0 // सध्या ट्रेंड मोजत नाही, भविष्यात जुन्या नोंदींशी तुलना करता येईल
        };
      }
      // विक्रीची रक्कम नोंदवा
      data[cropName][marketName].prices.push(sale.amount);
    });

    // प्रत्येक मार्केटसाठी सरासरी (Average), किमान (Min) आणि कमाल (Max) भाव काढा
    const finalData = {};
    for (const crop in data) {
      finalData[crop] = Object.values(data[crop]).map((marketObj, index) => {
        const avg = Math.round(marketObj.prices.reduce((a, b) => a + b, 0) / marketObj.prices.length);
        const min = Math.min(...marketObj.prices);
        const max = Math.max(...marketObj.prices);
        return {
          id: `${crop}-${index}`,
          market: marketObj.market,
          avg: avg,
          min: min,
          max: max,
          trend: marketObj.trend,
          dist: marketObj.dist
        };
      });
    }

    // जर खऱ्या नोंदी नसतील (किंवा खूप कमी असतील), तर सुंदर नमुना (Fallback Mock Data) दाखवा
    if (Object.keys(finalData).length === 0) {
      setMarketData({
        'कांदा': [
          { id: 1, market: 'पिंपळगाव', avg: 2200, min: 2000, max: 2700, trend: 50, dist: 'नाशिक' },
          { id: 2, market: 'लासलगाव', avg: 2100, min: 1900, max: 2400, trend: 200, dist: 'नाशिक' },
          { id: 3, market: 'येवला', avg: 2050, min: 1850, max: 2300, trend: -100, dist: 'नाशिक' },
          { id: 4, market: 'नाशिक', avg: 1950, min: 1700, max: 2200, trend: -50, dist: 'नाशिक' }
        ],
        'सोयाबीन': [
          { id: 5, market: 'नागपूर', avg: 5400, min: 5100, max: 5800, trend: 400, dist: 'नागपूर' },
          { id: 6, market: 'लातूर', avg: 5200, min: 5050, max: 5550, trend: 200, dist: 'लातूर' },
          { id: 7, market: 'वाशिम', avg: 5100, min: 4900, max: 5500, trend: 300, dist: 'वाशिम' }
        ],
        'कापूस': [
          { id: 8, market: 'औरंगाबाद', avg: 6800, min: 6500, max: 7200, trend: 500, dist: 'औरंगाबाद' },
          { id: 9, market: 'अकोला', avg: 6700, min: 6400, max: 7100, trend: 400, dist: 'अकोला' }
        ]
      });
    } else {
      setMarketData(finalData);
      // जर निवडलेले पीक यादीत नसेल, तर पहिले पीक निवडा
      if (!finalData[selectedCrop] && Object.keys(finalData).length > 0) {
        setSelectedCrop(Object.keys(finalData)[0]);
      }
    }
  }, [ledger, selectedCrop]);

  const crops = Object.keys(marketData);
  
  // ── २. भाव क्रमाने लावणे आणि सर्वोत्तम भाव शोधणे ──
  const currentMarkets = marketData[selectedCrop] ? [...marketData[selectedCrop]].sort((a, b) => b.avg - a.avg) : [];
  const bestMarket = currentMarkets[0];
  
  // इतर बाजारांचा आलेख काढण्यासाठी गणिते
  const lowestPrice = currentMarkets.length > 0 ? Math.min(...currentMarkets.map(m => m.avg)) : 0;
  const priceRange = bestMarket ? bestMarket.avg - lowestPrice : 0;

  return (
    // 'overflow-y-auto' आणि 'pb-32' जोडले आहे, ज्यामुळे खालचा भाग नेव्हिगेशनच्या मागे लपणार नाही!
    <div className="flex flex-col h-full bg-[#fdf8f0] p-4 space-y-6 overflow-y-auto pb-32">
      
      {/* ── THE ROOM HEADER ── */}
      <div className="pt-2">
        <h2 className="text-2xl font-black text-[#2c1810] flex items-center gap-2">
          <TrendingUp className="text-[#4a9e4a]" size={28} /> बाजारभाव
        </h2>
        <p className="text-sm font-bold text-[#8b5e3c] mt-1 tracking-wide">इतर शेतकऱ्यांनी दिलेली ताजी माहिती</p>
      </div>

      {/* ── THE CROP SELECTOR (Quick Buttons) ── */}
      {crops.length > 0 ? (
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide shrink-0">
          {crops.map((crop) => (
            <button
              key={crop}
              onClick={() => setSelectedCrop(crop)}
              className={`px-6 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all shadow-sm ${
                selectedCrop === crop 
                  ? 'bg-[#2c1810] text-white shadow-md' 
                  : 'bg-white text-[#5c3317] border border-[#d4a853]/30 hover:bg-[#fdf8f0]'
              }`}
            >
              {crop}
            </button>
          ))}
        </div>
      ) : (
        <p className="text-sm text-[#8b5e3c] font-marathi">सध्या कोणतेही बाजारभाव उपलब्ध नाहीत.</p>
      )}

      {/* ── THE GOLDEN TICKET (Best Market Highlight) ── */}
      <AnimatePresence mode="wait">
        {bestMarket && (
          <motion.div
            key={`best-${selectedCrop}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-gradient-to-br from-[#1a4d1a] to-[#2d6a2d] rounded-[2rem] p-6 shadow-xl text-white relative overflow-hidden shrink-0"
          >
            {/* Decorative shine */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
            
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <Award size={20} className="text-[#fef08a]" />
                <p className="text-xs font-bold text-white/90 uppercase tracking-widest">सर्वोत्तम भाव आज</p>
              </div>
              
              <h3 className="text-3xl font-black mb-1">
                {bestMarket.market}
              </h3>
              <p className="text-3xl font-bold text-[#4ade80] mb-5">
                ₹{bestMarket.avg.toLocaleString('en-IN')} <span className="text-sm font-normal text-white/70">/ क्विंटल</span>
              </p>
              
              <div className="flex items-center justify-between bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/10">
                <div>
                  <p className="text-[10px] text-white/60 mb-0.5">किमान ते कमाल</p>
                  <p className="text-sm font-bold">₹{bestMarket.min || bestMarket.avg} - ₹{bestMarket.max || bestMarket.avg}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-white/60 mb-0.5">जिल्हा</p>
                  <p className="text-sm font-bold text-white flex items-center gap-1 justify-end">
                    <MapPin size={12} /> {bestMarket.dist}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── THE COMPARISON BOARD (Other Markets) ── */}
      {currentMarkets.length > 1 && (
        <div className="mt-4 flex-1">
          <p className="text-xs font-bold text-[#8b5e3c] uppercase tracking-widest mb-4 flex items-center gap-3">
            इतर बाजार <span className="flex-1 h-px bg-[#d4a853]/30" />
          </p>
          
          <div className="space-y-4">
            <AnimatePresence mode="wait">
              {currentMarkets.map((market, idx) => {
                // सर्वोत्तम बाजार वगळा (तो आधीच वर दाखवला आहे)
                if (idx === 0) return null;
                
                // आलेखाची टक्केवारी (Progress Bar percentage)
                const fillPercentage = priceRange === 0 ? 100 : ((market.avg - lowestPrice) / priceRange) * 100;

                return (
                  <motion.div
                    key={market.id || idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="bg-white rounded-[1.5rem] p-5 border border-[#d4a853]/20 shadow-sm flex flex-col gap-3 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-black text-[#2c1810] text-xl">{market.market}</h4>
                        <p className="text-[10px] font-bold text-[#8b5e3c] flex items-center gap-1 mt-1 font-marathi">
                          <MapPin size={12} /> {market.dist} · स्थानिक नोंद
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-xl text-[#5c3317]">₹{market.avg.toLocaleString('en-IN')}</p>
                        {market.trend ? (
                          <p className={`text-[10px] font-bold flex items-center justify-end gap-0.5 mt-1 ${market.trend > 0 ? 'text-[#4a9e4a]' : 'text-red-500'}`}>
                            {market.trend > 0 ? <ArrowUpRight size={12}/> : <ArrowDownRight size={12}/>} ₹{Math.abs(market.trend)}
                          </p>
                        ) : null}
                      </div>
                    </div>

                    {/* दृश्य तुलना आलेख (Visual Price Comparison Bar) */}
                    <div className="h-1.5 w-full bg-[#fdf8f0] rounded-full overflow-hidden border border-[#d4a853]/10 mt-1">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.max(5, fillPercentage)}%` }}
                        transition={{ duration: 0.8, delay: idx * 0.1 }}
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

    </div>
  );
};

export default MarketRoom;