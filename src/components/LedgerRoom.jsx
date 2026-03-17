import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, TrendingDown, Wallet, Search } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useAppContext } from '../context/AppContext';

const LedgerRoom = () => {
  const { ledger } = useAppContext();
  const [filter, setFilter] = useState('all');

  const totalIncome = ledger.filter(e => e.type === 'income').reduce((sum, e) => sum + e.amount, 0);
  const totalExpense = ledger.filter(e => e.type === 'expense').reduce((sum, e) => sum + e.amount, 0);
  const profit = totalIncome - totalExpense;

  const expenseCategories = ledger.filter(e => e.type === 'expense').reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount;
    return acc;
  }, {});
  
  const chartData = Object.keys(expenseCategories).map(key => ({ name: key, value: expenseCategories[key] }));
  const COLORS = ['#4a9e4a', '#d4a853', '#3b82c4', '#c17f3a'];

  const filteredEntries = ledger.filter(e => filter === 'all' || e.type === filter);

  return (
    <div className="flex flex-col h-full bg-[#fdf8f0] p-4 space-y-5">
      
      <div className="grid grid-cols-3 gap-3">
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
          <p className={`text-xl font-black ${profit >= 0 ? 'text-[#2c1810]' : 'text-red-600'}`}>₹{(profit/1000).toFixed(1)}K</p>
        </div>
      </div>

      {filter !== 'income' && chartData.length > 0 && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-[2rem] p-5 border border-[#d4a853]/20 shadow-sm">
          <p className="text-xs font-bold text-[#8b5e3c] uppercase tracking-widest text-center mb-2">खर्चाचे वितरण</p>
          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={chartData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none">
                  {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(value) => `₹${value}`} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}

      <div className="flex gap-2 bg-white p-1.5 rounded-full border border-[#d4a853]/20 shadow-sm">
        {['all', 'income', 'expense'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`flex-1 py-2.5 rounded-full text-sm font-bold transition-all ${
              filter === f ? 'bg-[#2c1810] text-white shadow-md' : 'text-[#8b5e3c] hover:bg-[#fdf8f0]'
            }`}
          >
            {f === 'all' ? 'सर्व नोंदी' : f === 'income' ? 'उत्पन्न' : 'खर्च'}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-[2rem] border border-[#d4a853]/20 shadow-sm overflow-hidden mb-6 flex-1">
        <div className="overflow-y-auto max-h-[400px]">
          <AnimatePresence>
            {filteredEntries.map((entry, idx) => (
              <motion.div 
                key={entry.id || idx}
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                className={`flex items-center justify-between p-5 border-b border-[#fdf8f0] last:border-0 hover:bg-[#fdf8f0]/50 transition-colors`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-sm ${
                    entry.type === 'income' ? 'bg-[#d4edda] text-[#2d6a2d]' : 'bg-[#fff7ed] text-[#ea580c]'
                  }`}>
                    {entry.type === 'income' ? '💰' : '📝'}
                  </div>
                  <div>
                    <p className="font-bold text-[#2c1810] text-base">{entry.category}</p>
                    <p className="text-xs text-[#8b5e3c] mt-1 font-marathi">{entry.date} · 🌾 {entry.commodity || entry.crop}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-black text-lg ${entry.type === 'income' ? 'text-[#4a9e4a]' : 'text-red-600'}`}>
                    {entry.type === 'income' ? '+' : '-'}₹{entry.amount.toLocaleString('en-IN')}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {filteredEntries.length === 0 && (
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