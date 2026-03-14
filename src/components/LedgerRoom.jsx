import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, TrendingUp, TrendingDown, Wallet, Search } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const LedgerRoom = () => {
  // A simple switch to flip between looking at "All", "Income", or "Expense"
  const [filter, setFilter] = useState('all');

  // Our sample ledger notebook entries
  const entries = [
    { id: 1, type: 'income', title: 'कांदा विक्री', date: '25-Sep-2024', amount: 105000, category: 'विक्री', crop: 'कांदा' },
    { id: 2, type: 'expense', title: 'युरिया खत', date: '01-Jul-2024', amount: 1500, category: 'खते', crop: 'कांदा' },
    { id: 3, type: 'expense', title: 'लाल कांदा बियाणे', date: '15-Jun-2024', amount: 3200, category: 'बियाणे', crop: 'कांदा' },
    { id: 4, type: 'expense', title: 'ट्रॅक्टर नांगरणी', date: '20-May-2024', amount: 3000, category: 'नांगरणी', crop: 'कांदा' },
    { id: 5, type: 'expense', title: 'DAP खत', date: '05-Jul-2024', amount: 4050, category: 'खते', crop: 'सोयाबीन' },
  ];

  // The Calculator: Instantly figuring out the totals
  const totalIncome = entries.filter(e => e.type === 'income').reduce((sum, e) => sum + e.amount, 0);
  const totalExpense = entries.filter(e => e.type === 'expense').reduce((sum, e) => sum + e.amount, 0);
  const profit = totalIncome - totalExpense;

  // Preparing the numbers for our resident artist (the Pie Chart)
  const expenseCategories = entries.filter(e => e.type === 'expense').reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount;
    return acc;
  }, {});
  
  const chartData = Object.keys(expenseCategories).map(key => ({
    name: key,
    value: expenseCategories[key]
  }));

  // The paint colors for our pie chart slices
  const COLORS = ['#4a9e4a', '#d4a853', '#3b82c4', '#c17f3a'];

  // Sorting our notebook pages based on what the farmer wants to see
  const filteredEntries = entries.filter(e => filter === 'all' || e.type === filter);

  return (
    <div className="flex flex-col h-full bg-wheat-light p-4 space-y-4">
      
      {/* ── THE TOP DASHBOARD (The Math Desk) ── */}
      <div className="grid grid-cols-3 gap-3">
        {/* Income Box */}
        <div className="bg-leaf-light/40 border border-leaf/20 rounded-2xl p-3 flex flex-col items-center justify-center text-center shadow-sm">
          <TrendingUp size={20} className="text-leaf-dark mb-1" />
          <p className="text-[10px] font-bold text-leaf-dark uppercase tracking-wider mb-0.5">उत्पन्न</p>
          <p className="text-lg font-black text-leaf-dark">₹{(totalIncome/1000).toFixed(1)}K</p>
        </div>
        
        {/* Expense Box */}
        <div className="bg-red-50 border border-red-100 rounded-2xl p-3 flex flex-col items-center justify-center text-center shadow-sm">
          <TrendingDown size={20} className="text-red-600 mb-1" />
          <p className="text-[10px] font-bold text-red-600 uppercase tracking-wider mb-0.5">खर्च</p>
          <p className="text-lg font-black text-red-600">₹{(totalExpense/1000).toFixed(1)}K</p>
        </div>
        
        {/* Profit Box */}
        <div className={`border rounded-2xl p-3 flex flex-col items-center justify-center text-center shadow-sm ${profit >= 0 ? 'bg-white border-leaf/30' : 'bg-red-50 border-red-200'}`}>
          <Wallet size={20} className={profit >= 0 ? 'text-leaf' : 'text-red-500'} />
          <p className={`text-[10px] font-bold uppercase tracking-wider mb-0.5 ${profit >= 0 ? 'text-mud' : 'text-red-600'}`}>नफा</p>
          <p className={`text-lg font-black ${profit >= 0 ? 'text-soil' : 'text-red-600'}`}>
            ₹{(profit/1000).toFixed(1)}K
          </p>
        </div>
      </div>

      {/* ── THE ARTIST'S CANVAS (The Pie Chart) ── */}
      {filter !== 'income' && chartData.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl p-4 border border-wheat shadow-sm"
        >
          <p className="text-xs font-bold text-mud uppercase tracking-widest text-center mb-2">खर्चाचे वितरण</p>
          <div className="h-40 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => `₹${value}`}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}

      {/* ── THE FILING CABINET (Filters & Add Button) ── */}
      <div className="flex justify-between items-center pt-2">
        <div className="flex gap-2">
          {['all', 'income', 'expense'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                filter === f 
                  ? 'bg-leaf text-white shadow-md' 
                  : 'bg-white text-bark border border-wheat hover:bg-wheat-light'
              }`}
            >
              {f === 'all' ? 'सर्व' : f === 'income' ? 'उत्पन्न' : 'खर्च'}
            </button>
          ))}
        </div>
        <button className="bg-soil text-white p-2 rounded-xl shadow-md hover:bg-bark transition-colors">
          <Plus size={20} />
        </button>
      </div>

      {/* ── THE NOTEBOOK PAGES (The List of Transactions) ── */}
      <div className="bg-white rounded-3xl border border-wheat shadow-sm overflow-hidden mb-6">
        <AnimatePresence>
          {filteredEntries.map((entry, idx) => (
            <motion.div 
              key={entry.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ delay: idx * 0.05 }}
              className={`flex items-center justify-between p-4 border-b border-wheat/30 last:border-0`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                  entry.type === 'income' ? 'bg-leaf-light/50 text-leaf-dark' : 'bg-orange-50 text-orange-600'
                }`}>
                  {entry.category === 'विक्री' ? '💰' : entry.category === 'खते' ? '🧪' : entry.category === 'बियाणे' ? '🌱' : '🚜'}
                </div>
                <div>
                  <p className="font-bold text-soil text-sm">{entry.title}</p>
                  <p className="text-[10px] text-mud mt-0.5">{entry.category} · {entry.date} · 🌾 {entry.crop}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`font-black text-sm ${entry.type === 'income' ? 'text-leaf' : 'text-red-600'}`}>
                  {entry.type === 'income' ? '+' : '-'}₹{entry.amount.toLocaleString('en-IN')}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {filteredEntries.length === 0 && (
          <div className="p-8 text-center text-mud">
            <Search size={32} className="mx-auto mb-2 opacity-50" />
            <p className="text-sm font-bold">कोणतीही नोंद सापडली नाही</p>
          </div>
        )}
      </div>

    </div>
  );
};

export default LedgerRoom;