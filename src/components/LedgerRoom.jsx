import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, TrendingDown, Wallet, Search, Plus, Edit3, X, Save, AlertCircle, RefreshCw } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useAppContext } from '../context/AppContext';
import { apiService } from '../services/apiService';

const LedgerRoom = () => {
  const { ledger, cycles, addLedgerEntry, updateLocalLedgerEntry } = useAppContext();
  const [filter, setFilter] = useState('all');

  // 🟢 Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); 
  const [entryToEdit, setEntryToEdit] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Expanded Form Data to handle 'Missing Info' like brand names and quantity
  const [formData, setFormData] = useState({
    type: 'expense',
    amount: '',
    category: '',
    date: new Date().toISOString().slice(0, 10),
    cycleId: 'general',
    crop: 'इतर',
    quantity: '',
    agri_inputs: ''
  });

  const EXPENSE_CATEGORIES = ['बियाणे', 'खते', 'कीटकनाशक', 'मजुरी', 'यंत्र', 'सिंचन', 'इतर'];
  const INCOME_CATEGORIES = ['विक्री (Sales)', 'इतर उत्पन्न'];

  // ── Stats Calculation ──
  const totalIncome = ledger.filter(e => e.type === 'income').reduce((sum, e) => sum + Number(e.amount || 0), 0);
  const totalExpense = ledger.filter(e => e.type === 'expense').reduce((sum, e) => sum + Number(e.amount || 0), 0);
  const profit = totalIncome - totalExpense;

  const expenseCategories = ledger.filter(e => e.type === 'expense').reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + Number(e.amount || 0);
    return acc;
  }, {});
  
  const chartData = Object.keys(expenseCategories).map(key => ({ name: key, value: expenseCategories[key] }));
  const COLORS = ['#4a9e4a', '#d4a853', '#3b82c4', '#c17f3a', '#e11d48', '#8b5cf6', '#14b8a6'];

  const filteredEntries = ledger.filter(e => filter === 'all' || e.type === filter).sort((a, b) => new Date(b.date) - new Date(a.date));

  // ── Modal Logic ──
  const openAddModal = () => {
    setModalMode('add');
    setFormData({
      type: 'expense', amount: '', category: EXPENSE_CATEGORIES[0], 
      date: new Date().toISOString().slice(0, 10), cycleId: 'general', crop: 'इतर',
      quantity: '', agri_inputs: ''
    });
    setIsModalOpen(true);
  };

  const openEditModal = (entry) => {
    setModalMode('edit');
    setEntryToEdit(entry);
    setFormData({
      type: entry.type || 'expense',
      amount: entry.amount || '',
      category: entry.category || '',
      date: entry.date || new Date().toISOString().slice(0, 10),
      cycleId: entry.cycleId || 'general',
      crop: entry.crop || 'इतर',
      quantity: entry.quantity || '',
      agri_inputs: entry.agri_inputs || ''
    });
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let selectedCropName = 'इतर';
      if (formData.cycleId !== 'general') {
        const selectedCycle = cycles.find(c => c.id === formData.cycleId);
        if (selectedCycle) selectedCropName = selectedCycle.crop;
      }

      const finalData = {
        ...formData,
        amount: Number(formData.amount),
        quantity: formData.quantity ? Number(formData.quantity) : null,
        agri_inputs: formData.agri_inputs || null,
        crop: selectedCropName
      };

      if (modalMode === 'add') {
        await addLedgerEntry(finalData);
      } else {
        await apiService.updateLedger(entryToEdit.id, finalData);
        updateLocalLedgerEntry(entryToEdit.id, finalData);
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error("Ledger save failed", error);
      alert("माहिती जतन करताना त्रुटी आली.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#fdf8f0] p-4 space-y-5 pb-24 overflow-hidden relative">
      
      {/* ── Header & Add Button ── */}
      <div className="flex justify-between items-center shrink-0">
        <h2 className="text-2xl font-black text-[#2c1810] flex items-center gap-2">
          <Wallet className="text-[#4a9e4a]" size={28} /> माझा हिशोब
        </h2>
        <button onClick={openAddModal} className="bg-gradient-to-r from-[#4a9e4a] to-[#2d6a2d] text-white px-4 py-2 rounded-full text-xs font-bold shadow-md flex items-center gap-1 hover:scale-105 transition-all">
          <Plus size={16} /> नवीन नोंद
        </button>
      </div>

      {/* ── Stats Grid ── */}
      <div className="grid grid-cols-3 gap-3 shrink-0">
        <div className="bg-[#d4edda]/60 border border-[#4a9e4a]/30 rounded-3xl p-3 flex flex-col items-center justify-center text-center shadow-sm">
          <TrendingUp size={20} className="text-[#2d6a2d] mb-1.5" />
          <p className="text-[9px] font-bold text-[#2d6a2d] uppercase tracking-widest mb-0.5">उत्पन्न</p>
          <p className="text-lg font-black text-[#2d6a2d]">₹{(totalIncome/1000).toFixed(1)}K</p>
        </div>
        
        <div className="bg-[#fef2f2] border border-[#fca5a5]/50 rounded-3xl p-3 flex flex-col items-center justify-center text-center shadow-sm">
          <TrendingDown size={20} className="text-red-600 mb-1.5" />
          <p className="text-[9px] font-bold text-red-600 uppercase tracking-widest mb-0.5">खर्च</p>
          <p className="text-lg font-black text-red-600">₹{(totalExpense/1000).toFixed(1)}K</p>
        </div>
        
        <div className={`border rounded-3xl p-3 flex flex-col items-center justify-center text-center shadow-sm ${profit >= 0 ? 'bg-white border-[#4a9e4a]/30' : 'bg-[#fef2f2] border-red-200'}`}>
          <Wallet size={20} className={profit >= 0 ? 'text-[#4a9e4a]' : 'text-red-500'} />
          <p className={`text-[9px] font-bold uppercase tracking-widest mb-0.5 ${profit >= 0 ? 'text-[#8b5e3c]' : 'text-red-600'}`}>नफा</p>
          <p className={`text-lg font-black ${profit >= 0 ? 'text-[#2c1810]' : 'text-red-600'}`}>₹{(profit/1000).toFixed(1)}K</p>
        </div>
      </div>

      {/* ── Filters ── */}
      <div className="flex gap-2 bg-white p-1.5 rounded-full border border-[#d4a853]/20 shadow-sm shrink-0 mx-1">
        {['all', 'income', 'expense'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`flex-1 py-2 rounded-full text-sm font-bold transition-all ${
              filter === f ? 'bg-[#2c1810] text-white shadow-md' : 'text-[#8b5e3c] hover:bg-[#fdf8f0]'
            }`}
          >
            {f === 'all' ? 'सर्व नोंदी' : f === 'income' ? 'उत्पन्न' : 'खर्च'}
          </button>
        ))}
      </div>

      {/* ── Entries List (Modern Compact UI) ── */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex-1 flex flex-col mx-1">
        <div className="overflow-y-auto flex-1 p-2">
          <AnimatePresence>
            {filteredEntries.map((entry, idx) => {
              
              // 🟢 Identify Missing Info for "Fill Incomplete" Button
              const needsInputs = ['बियाणे', 'खते', 'कीटकनाशक'].includes(entry.category);
              const isMissingInfo = 
                (entry.type === 'income' && !entry.quantity) || 
                (entry.type === 'expense' && needsInputs && !entry.agri_inputs);

              return (
                <motion.div 
                  key={entry.id || idx}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                  className="flex items-center justify-between p-3 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors group rounded-xl"
                >
                  <div className="flex items-center gap-3 flex-1 overflow-hidden">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg shadow-inner border shrink-0 ${
                      entry.type === 'income' ? 'bg-green-50 border-green-100' : 'bg-orange-50 border-orange-100'
                    }`}>
                      {entry.type === 'income' ? '💰' : '💸'}
                    </div>
                    <div className="flex-1 truncate">
                      <p className="font-bold text-[#2c1810] text-[15px] truncate">
                        {entry.category} {entry.agri_inputs && <span className="text-gray-500 font-medium text-xs ml-1">({entry.agri_inputs})</span>}
                      </p>
                      <p className="text-[11px] text-gray-500 font-semibold mt-0.5 flex items-center gap-1">
                        {new Date(entry.date).toLocaleDateString('mr-IN', { day: 'numeric', month: 'short' })} 
                        <span className="w-1 h-1 bg-gray-300 rounded-full"></span> 
                        <span className="text-[#8b5e3c] truncate">🌾 {entry.commodity || entry.crop || 'इतर'}</span>
                        {entry.quantity && <><span className="w-1 h-1 bg-gray-300 rounded-full"></span> <span>{entry.quantity} क्विंटल</span></>}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-1.5 shrink-0 pl-3">
                    <p className={`font-black text-[15px] ${entry.type === 'income' ? 'text-[#4a9e4a]' : 'text-[#d946ef]'}`}>
                      {entry.type === 'income' ? '+' : '-'}₹{Number(entry.amount).toLocaleString('en-IN')}
                    </p>
                    
                    {/* 🟢 Smart Edit / Fill Incomplete Button - Aligned beautifully under price */}
                    {isMissingInfo ? (
                      <button 
                        onClick={() => openEditModal(entry)} 
                        className="bg-red-50 text-red-600 px-2 py-0.5 rounded border border-red-200 hover:bg-red-100 transition-colors flex items-center gap-1 shadow-sm"
                      >
                        <AlertCircle size={10} strokeWidth={3} />
                        <span className="text-[9px] font-black uppercase tracking-wider">अपूर्ण माहिती</span>
                      </button>
                    ) : (
                      <button 
                        onClick={() => openEditModal(entry)} 
                        className="p-1 text-gray-300 hover:text-blue-500 transition-colors opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                      >
                        <Edit3 size={14}/>
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
          
          {filteredEntries.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
              <Search size={40} className="mb-3 opacity-30" />
              <p className="text-sm font-bold">कोणतीही नोंद सापडली नाही</p>
            </div>
          )}
        </div>
      </div>

      {/* ── 🟢 ADVANCED ADD / EDIT MODAL ── */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="bg-white rounded-[2rem] w-full max-w-sm p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
              <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 bg-gray-100 p-1.5 rounded-full"><X size={18}/></button>
              
              <div className="mb-5 pr-8">
                <h3 className="text-xl font-black text-[#2c1810] flex items-center gap-2">
                  {modalMode === 'add' ? <Plus className="text-[#4a9e4a]" size={24}/> : <Edit3 className="text-blue-500" size={24}/>} 
                  {modalMode === 'add' ? 'नवीन नोंद करा' : 'नोंद सुधारा'}
                </h3>
              </div>

              <form onSubmit={handleFormSubmit} className="space-y-4">
                
                {/* Type Selection */}
                <div className="flex bg-gray-100 p-1 rounded-xl">
                  <button type="button" onClick={() => setFormData({...formData, type: 'expense', category: EXPENSE_CATEGORIES[0]})} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${formData.type === 'expense' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-500'}`}>खर्च (Expense)</button>
                  <button type="button" onClick={() => setFormData({...formData, type: 'income', category: INCOME_CATEGORIES[0]})} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${formData.type === 'income' ? 'bg-white text-[#4a9e4a] shadow-sm' : 'text-gray-500'}`}>उत्पन्न (Income)</button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-[#8b5e3c] mb-1 block uppercase">रक्कम (₹) <span className="text-red-500">*</span></label>
                    <input 
                      type="number" required
                      value={formData.amount} 
                      onChange={e => setFormData({...formData, amount: e.target.value})} 
                      placeholder="उदा. २०००" 
                      className="w-full bg-[#fdf8f0] border border-[#d4a853]/30 rounded-xl p-3 text-[#2c1810] font-bold focus:outline-none focus:border-[#4a9e4a]" 
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-[#8b5e3c] mb-1 block uppercase">तारीख <span className="text-red-500">*</span></label>
                    <input 
                      type="date" required
                      value={formData.date} 
                      onChange={e => setFormData({...formData, date: e.target.value})} 
                      className="w-full bg-[#fdf8f0] border border-[#d4a853]/30 rounded-xl p-3 text-[#2c1810] font-bold focus:outline-none focus:border-[#4a9e4a] text-xs" 
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-[#8b5e3c] mb-1 block uppercase">वर्गवारी (Category)</label>
                  <select 
                    value={formData.category} 
                    onChange={e => setFormData({...formData, category: e.target.value})} 
                    className="w-full bg-[#fdf8f0] border border-[#d4a853]/30 rounded-xl p-3 text-[#2c1810] font-bold focus:outline-none focus:border-[#4a9e4a]"
                  >
                    {(formData.type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES).map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                {/* 🟢 Dynamic Fields based on Category/Type */}
                {formData.type === 'income' && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                    <label className="text-[10px] font-bold text-[#8b5e3c] mb-1 block uppercase">किती विक्री केली? (क्विंटल) {!formData.quantity && <span className="text-red-500">*</span>}</label>
                    <input 
                      type="number" step="0.1"
                      value={formData.quantity} 
                      onChange={e => setFormData({...formData, quantity: e.target.value})} 
                      placeholder="उदा. ५०" 
                      className={`w-full bg-[#fdf8f0] border rounded-xl p-3 text-[#2c1810] font-bold focus:outline-none ${!formData.quantity && modalMode === 'edit' ? 'border-red-300 focus:border-red-500' : 'border-[#d4a853]/30 focus:border-[#4a9e4a]'}`} 
                    />
                  </motion.div>
                )}

                {formData.type === 'expense' && ['बियाणे', 'खते', 'कीटकनाशक'].includes(formData.category) && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                    <label className="text-[10px] font-bold text-[#8b5e3c] mb-1 block uppercase">ब्रँड / खताचे नाव {!formData.agri_inputs && <span className="text-red-500">*</span>}</label>
                    <input 
                      type="text" 
                      value={formData.agri_inputs} 
                      onChange={e => setFormData({...formData, agri_inputs: e.target.value})} 
                      placeholder="उदा. महाधन 10:26:26" 
                      className={`w-full bg-[#fdf8f0] border rounded-xl p-3 text-[#2c1810] font-bold focus:outline-none ${!formData.agri_inputs && modalMode === 'edit' ? 'border-red-300 focus:border-red-500' : 'border-[#d4a853]/30 focus:border-[#4a9e4a]'}`} 
                    />
                  </motion.div>
                )}

                {/* Crop Linking Logic */}
                <div>
                  <label className="text-[10px] font-bold text-[#8b5e3c] mb-1 block uppercase">कोणत्या पिकासाठी? (Link to Crop)</label>
                  <select 
                    value={formData.cycleId} 
                    onChange={e => setFormData({...formData, cycleId: e.target.value})} 
                    className="w-full bg-[#fdf8f0] border border-[#d4a853]/30 rounded-xl p-3 text-[#2c1810] font-bold focus:outline-none focus:border-[#4a9e4a]"
                  >
                    <option value="general">कोणत्याही विशिष्ट पिकासाठी नाही</option>
                    {cycles.map(cycle => (
                      <option key={cycle.id} value={cycle.id}>{cycle.crop} ({cycle.area} एकर)</option>
                    ))}
                  </select>
                </div>

                <button type="submit" disabled={isLoading} className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-black py-3.5 rounded-xl mt-4 flex items-center justify-center gap-2 hover:shadow-lg transition-all disabled:opacity-50">
                  {isLoading ? <RefreshCw className="animate-spin" size={18}/> : <Save size={18}/>}
                  {modalMode === 'add' ? 'नोंद जतन करा' : 'बदल सेव्ह करा'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default LedgerRoom;