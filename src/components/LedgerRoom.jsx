import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, TrendingDown, Wallet, Search, Filter } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useAppContext } from '../context/AppContext';

const LedgerRoom = () => {
  const { ledger } = useAppContext();
  
  const [typeFilter, setTypeFilter] = useState('all'); // all, income, expense
  const [selectedCrop, setSelectedCrop] = useState('all');

  const safeLedger = ledger || [];

  // ── १. अत्यंत स्मार्ट टायपिंग चेकर (AI ने काहीही स्पेलिंग दिले तरी ओळखेल) ──
  const getEntryType = (type) => {
    const t = String(type || '').toLowerCase().trim();
    // जर income, earn, उत्पन्न असेल तर income माना
    if (t === 'income' || t === 'earn' || t === 'credit') return 'income';
    // बाकी सर्व (expense, spend, खर्च, रिकामे) expense माना
    return 'expense'; 
  };

  // ── २. शेतकऱ्याची सर्व पिके शोधून काढणे ──
  const availableCrops = useMemo(() => {
    const crops = safeLedger.map(e => (e.crop || e.commodity || '').trim()).filter(c => c && c !== 'माहित नाही');
    return Array.from(new Set(crops));
  }, [safeLedger]);

  // ── ३. पिकावर आधारित डेटा फिल्टर करणे ──
  const cropFilteredLedger = useMemo(() => {
    if (selectedCrop === 'all') return safeLedger;
    return safeLedger.filter(e => {
      const cropName = (e.crop || e.commodity || '').trim();
      return cropName === selectedCrop;
    });
  }, [safeLedger, selectedCrop]);

  // ── ४. अचूक आकडेमोड (स्मार्ट टायपिंग चेकर वापरून) ──
  const totalIncome = cropFilteredLedger.filter(e => getEntryType(e.type) === 'income').reduce((sum, e) => sum + Number(e.amount || 0), 0);
  const totalExpense = cropFilteredLedger.filter(e => getEntryType(e.type) === 'expense').reduce((sum, e) => sum + Number(e.amount || 0), 0);
  const profit = totalIncome - totalExpense;

  // खर्चाचे वितरण
  const expenseCategories = cropFilteredLedger.filter(e => getEntryType(e.type) === 'expense').reduce((acc, e) => {
    const category = e.category || 'इतर खर्च';
    acc[category] = (acc[category] || 0) + Number(e.amount || 0);
    return acc;
  }, {});
  
  const chartData = Object.keys(expenseCategories).map(key => ({ name: key, value: expenseCategories[key] }));
  const COLORS = ['#4a9e4a', '#d4a853', '#3b82c4', '#c17f3a', '#eab308', '#f97316'];

  // ── ५. अंतिम यादी (Final Filter) ──
  const finalFilteredEntries = cropFilteredLedger.filter(e => typeFilter === 'all' || getEntryType(e.type) === typeFilter);

  return (
    <div className="flex flex-col h-full bg-[#fdf8f0] p-4 space-y-5 overflow-y-auto pb-32">
      
      {/* ── THE ROOM HEADER & CROP TABS ── */}
      <div className="pt-2 shrink-0">
        <h2 className="text-2xl font-black text-[#2c1810] flex items-center gap-2 mb-4">
          <Wallet className="text-[#4a9e4a]" size={28} /> माझी हिशोब वही
        </h2>
        
        {availableCrops.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <button
              onClick={() => setSelectedCrop('all')}
              className={`px-5 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all shadow-sm flex items-center gap-1.5 ${
                selectedCrop === 'all' 
                  ? 'bg-[#2c1810] text-white shadow-md' 
                  : 'bg-white text-[#5c3317] border border-[#d4a853]/30 hover:bg-[#fdf8f0]'
              }`}
            >
              <Filter size={14} /> सर्व पिके
            </button>
            {availableCrops.map((crop) => (
              <button
                key={crop}
                onClick={() => setSelectedCrop(crop)}
                className={`px-5 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all shadow-sm ${
                  selectedCrop === crop 
                    ? 'bg-[#4a9e4a] text-white shadow-md' 
                    : 'bg-white text-[#5c3317] border border-[#d4a853]/30 hover:bg-[#fdf8f0]'
                }`}
              >
                🌾 {crop}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Summary Cards ── */}
      <div className="grid grid-cols-3 gap-3 shrink-0">
        <div className="bg-[#d4edda]/60 border border-[#4a9e4a]/30 rounded-3xl p-4 flex flex-col items-center justify-center text-center shadow-sm">
          <TrendingUp size={24} className="text-[#2d6a2d] mb-2" />
          <p className="text-[10px] font-bold text-[#2d6a2d] uppercase tracking-widest mb-1">उत्पन्न</p>
          <p className="text-xl font-black text-[#2d6a2d]">₹{(totalIncome/1000).toFixed(1)}K</p>
        </div>
        
        <div className="bg-[#fef2f2] border border-[#fca5a5]/50 rounded-3xl p-4 flex flex-col items-center justify-center text-center shadow-sm">
          <TrendingDown size={24} className="text-red-600 mb-2" />
          <p className="text-[10px] font-bold text-red-600 uppercase tracking-widest mb-1">खर्च</p>
          <p className="text-xl font-black text-red-600">₹{(totalExpense/1000).toFixed(1)}K</p>
        </div>
        
        <div className={`border rounded-3xl p-4 flex flex-col items-center justify-center text-center shadow-sm ${profit >= 0 ? 'bg-white border-[#4a9e4a]/30' : 'bg-[#fef2f2] border-red-200'}`}>
          <Wallet size={24} className={profit >= 0 ? 'text-[#4a9e4a]' : 'text-red-500'} />
          <p className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${profit >= 0 ? 'text-[#8b5e3c]' : 'text-red-600'}`}>नफा</p>
          <p className={`text-xl font-black ${profit >= 0 ? 'text-[#2c1810]' : 'text-red-600'}`}>
            {profit < 0 ? '-' : ''}₹{(Math.abs(profit)/1000).toFixed(1)}K
          </p>
        </div>
      </div>

      {/* ── Expense Distribution Chart ── */}
      {typeFilter !== 'income' && chartData.length > 0 && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-[2rem] p-5 border border-[#d4a853]/20 shadow-sm shrink-0">
          <p className="text-xs font-bold text-[#8b5e3c] uppercase tracking-widest text-center mb-2">खर्चाचे वितरण {selectedCrop !== 'all' && `(${selectedCrop})`}</p>
          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={chartData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none">
                  {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(value) => `₹${value.toLocaleString('en-IN')}`} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}

      {/* ── Type Filters (बटणांवर इंग्रजी अर्थही दिला आहे) ── */}
      <div className="flex gap-2 bg-white p-1.5 rounded-full border border-[#d4a853]/20 shadow-sm shrink-0">
        {[
          { id: 'all', label: 'सर्व नोंदी (All)' },
          { id: 'income', label: 'उत्पन्न (Income)' },
          { id: 'expense', label: 'खर्च (Spend)' }
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setTypeFilter(f.id)}
            className={`flex-1 py-2.5 rounded-full text-xs font-bold transition-all ${
              typeFilter === f.id ? 'bg-[#2c1810] text-white shadow-md' : 'text-[#8b5e3c] hover:bg-[#fdf8f0]'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* ── Entries List ── */}
      <div className="bg-white rounded-[2rem] border border-[#d4a853]/20 shadow-sm overflow-hidden flex-1 shrink-0 mb-4">
        <div>
          <AnimatePresence>
            {finalFilteredEntries.map((entry, idx) => {
              const isIncome = getEntryType(entry.type) === 'income';
              return (
                <motion.div 
                  key={entry.id || idx}
                  initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                  className="flex items-center justify-between p-5 border-b border-[#fdf8f0] last:border-0 hover:bg-[#fdf8f0]/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-sm shrink-0 ${
                      isIncome ? 'bg-[#d4edda] text-[#2d6a2d]' : 'bg-[#fff7ed] text-[#ea580c]'
                    }`}>
                      {isIncome ? '💰' : '📝'}
                    </div>
                    <div>
                      <p className="font-bold text-[#2c1810] text-base">{entry.category || 'नोंद'}</p>
                      <p className="text-xs text-[#8b5e3c] mt-1 font-marathi">
                        {entry.date} {(entry.crop && entry.crop !== 'माहित नाही') ? ` · 🌾 ${entry.crop}` : ''}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`font-black text-lg ${isIncome ? 'text-[#4a9e4a]' : 'text-red-600'}`}>
                      {isIncome ? '+' : '-'}₹{Number(entry.amount || 0).toLocaleString('en-IN')}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
          
          {finalFilteredEntries.length === 0 && (
            <div className="p-10 text-center text-[#8b5e3c]">
              <Search size={40} className="mx-auto mb-3 opacity-30" />
              <p className="text-base font-bold">कोणतीही नोंद सापडली नाही</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LedgerRoom;