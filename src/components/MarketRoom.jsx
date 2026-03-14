import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, MapPin, Award, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const MarketRoom = () => {
  // A simple switch to remember which crop the farmer is currently looking up
  const [selectedCrop, setSelectedCrop] = useState('कांदा');

  // Our daily market prices (The Chalkboard Data)
  const marketData = {
    'कांदा': [
      { id: 1, market: 'पिंपळगाव', avg: 2200, min: 2000, max: 2700, trend: 50, dist: 'नाशिक' },
      { id: 2, market: 'लासलगाव', avg: 2100, min: 1900, max: 2400, trend: 200, dist: 'नाशिक' },
      { id: 3, market: 'येवला', avg: 2050, min: 1850, max: 2300, trend: -100, dist: 'नाशिक' },
      { id: 4, market: 'नाशिक', avg: 1950, min: 1700, max: 2200, trend: -50, dist: 'नाशिक' }
    ],
    'सोयाबीन': [
      { id: 5, market: 'नागपूर', avg: 5400, min: 5100, max: 5800, trend: 400, dist: 'नागपूर' },
      { id: 6, market: 'लातूर', avg: 5200, min: 5050, max: 5550, trend: 200, dist: 'लातूर' },
      { id: 7, market: 'लासलगाव', avg: 5100, min: 4900, max: 5500, trend: 300, dist: 'नाशिक' },
      { id: 8, market: 'धुळे', avg: 5250, min: 5000, max: 5600, trend: 150, dist: 'धुळे' }
    ],
    'कापूस': [
      { id: 9, market: 'औरंगाबाद', avg: 6800, min: 6500, max: 7200, trend: 500, dist: 'औरंगाबाद' },
      { id: 10, market: 'अकोला', avg: 6700, min: 6400, max: 7100, trend: 400, dist: 'अकोला' }
    ]
  };

  const crops = Object.keys(marketData);
  
  // To find the best price, we just sort the list and take the top one
  const currentMarkets = marketData[selectedCrop].sort((a, b) => b.avg - a.avg);
  const bestMarket = currentMarkets[0];
  const lowestPrice = Math.min(...currentMarkets.map(m => m.avg));
  const priceRange = bestMarket.avg - lowestPrice;

  return (
    <div className="flex flex-col h-full bg-wheat-light p-4 space-y-4">
      
      {/* ── THE ROOM HEADER ── */}
      <div>
        <h2 className="text-xl font-black text-soil flex items-center gap-2">
          <TrendingUp className="text-leaf" size={24} />
          बाजारभाव
        </h2>
        <p className="text-xs font-bold text-mud mt-1">APMC · आजचे ताजे दर</p>
      </div>

      {/* ── THE CROP SELECTOR (Quick Buttons) ── */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {crops.map((crop) => (
          <button
            key={crop}
            onClick={() => setSelectedCrop(crop)}
            className={`px-5 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all shadow-sm ${
              selectedCrop === crop 
                ? 'bg-leaf text-white shadow-leaf/30' 
                : 'bg-white text-bark border border-wheat hover:bg-wheat-light'
            }`}
          >
            {crop}
          </button>
        ))}
      </div>

      {/* ── THE GOLDEN TICKET (Best Market Highlight) ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`best-${selectedCrop}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="bg-gradient-to-br from-leaf-dark to-leaf rounded-3xl p-5 shadow-lg shadow-leaf/20 text-white relative overflow-hidden"
        >
          {/* Decorative shine in the background */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/4" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-1.5 mb-3">
              <Award size={16} className="text-yellow-300" />
              <p className="text-[11px] font-bold text-white/90 uppercase tracking-wider">सर्वोत्तम भाव आज</p>
            </div>
            
            <h3 className="text-3xl font-black mb-1">
              {bestMarket.market} APMC
            </h3>
            <p className="text-2xl font-bold text-green-200 mb-4">
              ₹{bestMarket.avg.toLocaleString('en-IN')} <span className="text-sm font-normal text-white/70">/ क्विंटल</span>
            </p>
            
            <div className="flex items-center justify-between bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/10">
              <div>
                <p className="text-[10px] text-white/60 mb-0.5">किमान ते कमाल</p>
                <p className="text-xs font-bold">₹{bestMarket.min} - ₹{bestMarket.max}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-white/60 mb-0.5">बदल</p>
                <p className={`text-xs font-bold flex items-center gap-0.5 justify-end ${bestMarket.trend > 0 ? 'text-green-300' : 'text-red-300'}`}>
                  {bestMarket.trend > 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                  ₹{Math.abs(bestMarket.trend)}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* ── THE COMPARISON BOARD (Other Markets) ── */}
      <div className="mt-2">
        <p className="text-[11px] font-bold text-mud uppercase tracking-widest mb-3 flex items-center gap-2">
          इतर बाजार <span className="flex-1 h-px bg-wheat/50" />
        </p>
        
        <div className="space-y-3 pb-6">
          <AnimatePresence mode="wait">
            {currentMarkets.map((market, idx) => {
              // The best market is already at the top, so we skip it here
              if (idx === 0) return null;
              
              // Calculate how full the visual price bar should be
              const fillPercentage = priceRange === 0 ? 100 : ((market.avg - lowestPrice) / priceRange) * 100;

              return (
                <motion.div
                  key={market.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-white rounded-2xl p-4 border border-wheat shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-center mb-3">
                    <div>
                      <h4 className="font-black text-soil text-lg">{market.market}</h4>
                      <p className="text-[10px] font-bold text-mud flex items-center gap-1 mt-0.5">
                        <MapPin size={10} /> {market.dist}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-lg text-text">₹{market.avg.toLocaleString('en-IN')}</p>
                      <p className={`text-[10px] font-bold flex items-center justify-end gap-0.5 mt-0.5 ${market.trend > 0 ? 'text-leaf' : 'text-red-500'}`}>
                        {market.trend > 0 ? '+' : '-'}₹{Math.abs(market.trend)}
                      </p>
                    </div>
                  </div>

                  {/* The visual price comparison bar */}
                  <div className="h-1.5 w-full bg-wheat-light rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.max(5, fillPercentage)}%` }}
                      transition={{ duration: 0.8, delay: idx * 0.1 }}
                      className="h-full bg-wheat rounded-full"
                    />
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

    </div>
  );
};

export default MarketRoom;