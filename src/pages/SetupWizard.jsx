// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { motion, AnimatePresence } from 'framer-motion';
// import { Key, Settings2, Activity, CheckCircle2, ChevronRight, Mic, Cpu } from 'lucide-react';
// import { aiService } from '../services/aiService';

// const SetupWizard = () => {
//   const navigate = useNavigate();
//   const [step, setStep] = useState(1);
//   const [config, setConfig] = useState({
//     anthropicKey: '',
//     sarvamKey: '',
//     speaker: 'anushka',
//     defaultDistrict: 'नाशिक'
//   });
//   const [testResults, setTestResults] = useState({ claude: null, sarvam: null, testing: false });

//   useEffect(() => {
//     const existing = aiService.getConfig();
//     if (existing.anthropicKey) setConfig(existing);
//   }, []);

//   const handleSaveAndTest = async () => {
//     localStorage.setItem('sm_config', JSON.stringify(config));
//     setStep(3);
//     setTestResults({ claude: null, sarvam: null, testing: true });
    
//     const results = await aiService.testConnection();
//     setTestResults({ claude: results.claude, sarvam: results.sarvam, testing: false });
//   };

//   const finishSetup = () => {
//     navigate('/app');
//   };

//   return (
//     <div className="min-h-screen bg-[#fdf8f0] flex flex-col items-center justify-center p-6 font-sans">
//       <div className="w-full max-w-md">
        
//         <div className="text-center mb-8">
//           <div className="text-6xl mb-4">🌾</div>
//           <h1 className="text-3xl font-black text-[#2c1810]">शेतकरी मित्र</h1>
//           <p className="text-[#8b5e3c] font-bold mt-1">Configuration Wizard</p>
//         </div>

//         <div className="flex gap-2 mb-8">
//           {[1, 2, 3, 4].map((i) => (
//             <div key={i} className={`flex-1 h-1.5 rounded-full transition-colors duration-300 ${i <= step ? 'bg-[#4a9e4a]' : 'bg-[#d4a853]/30'}`} />
//           ))}
//         </div>

//         <div className="bg-white rounded-3xl p-6 shadow-xl border border-[#d4a853]/30">
//           <AnimatePresence mode="wait">
            
//             {step === 1 && (
//               <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
//                 <div className="flex items-center gap-3 mb-6">
//                   <div className="bg-[#4a9e4a]/10 p-3 rounded-2xl text-[#4a9e4a]"><Key size={24} /></div>
//                   <h2 className="text-xl font-bold text-[#2c1810]">API Keys</h2>
//                 </div>
                
//                 <div className="space-y-5">
//                   <div>
//                     <label className="block text-sm font-bold text-[#5c3317] mb-2 flex items-center gap-2"><Cpu size={16}/> Anthropic API Key (Claude)</label>
//                     <input type="password" value={config.anthropicKey} onChange={(e) => setConfig({...config, anthropicKey: e.target.value})} placeholder="sk-ant-..." className="w-full bg-[#fdf8f0] border border-[#d4a853]/50 rounded-xl px-4 py-3 text-[#2c1810] focus:outline-none focus:border-[#4a9e4a]" />
//                   </div>
//                   <div>
//                     <label className="block text-sm font-bold text-[#5c3317] mb-2 flex items-center gap-2"><Mic size={16}/> Sarvam AI Key (Marathi Voice)</label>
//                     <input type="password" value={config.sarvamKey} onChange={(e) => setConfig({...config, sarvamKey: e.target.value})} placeholder="sarvam-key-..." className="w-full bg-[#fdf8f0] border border-[#d4a853]/50 rounded-xl px-4 py-3 text-[#2c1810] focus:outline-none focus:border-[#4a9e4a]" />
//                   </div>
//                   <button onClick={() => setStep(2)} disabled={!config.anthropicKey} className="w-full bg-gradient-to-r from-[#4a9e4a] to-[#2d6a2d] text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg disabled:opacity-50">
//                     पुढे जा <ChevronRight size={20} />
//                   </button>
//                 </div>
//               </motion.div>
//             )}

//             {step === 2 && (
//               <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
//                 <div className="flex items-center gap-3 mb-6">
//                   <div className="bg-[#4a9e4a]/10 p-3 rounded-2xl text-[#4a9e4a]"><Settings2 size={24} /></div>
//                   <h2 className="text-xl font-bold text-[#2c1810]">Preferences</h2>
//                 </div>
                
//                 <div className="space-y-5">
//                   <div>
//                     <label className="block text-sm font-bold text-[#5c3317] mb-2">Voice Speaker</label>
//                     <select value={config.speaker} onChange={(e) => setConfig({...config, speaker: e.target.value})} className="w-full bg-[#fdf8f0] border border-[#d4a853]/50 rounded-xl px-4 py-3 text-[#2c1810] focus:outline-none focus:border-[#4a9e4a]">
//                       <option value="anushka">Anushka (Female)</option>
//                       <option value="shubh">Shubh (Male)</option>
//                     </select>
//                   </div>
//                   <div>
//                     <label className="block text-sm font-bold text-[#5c3317] mb-2">Default District</label>
//                     <select value={config.defaultDistrict} onChange={(e) => setConfig({...config, defaultDistrict: e.target.value})} className="w-full bg-[#fdf8f0] border border-[#d4a853]/50 rounded-xl px-4 py-3 text-[#2c1810] focus:outline-none focus:border-[#4a9e4a]">
//                       {['नाशिक', 'पुणे', 'औरंगाबाद', 'लातूर', 'नागपूर'].map(d => <option key={d} value={d}>{d}</option>)}
//                     </select>
//                   </div>
//                   <div className="flex gap-3">
//                     <button onClick={() => setStep(1)} className="px-6 py-4 rounded-xl font-bold text-[#5c3317] border border-[#d4a853]/50 hover:bg-[#fdf8f0]">मागे</button>
//                     <button onClick={handleSaveAndTest} className="flex-1 bg-gradient-to-r from-[#4a9e4a] to-[#2d6a2d] text-white font-bold py-4 rounded-xl shadow-lg">Save & Test</button>
//                   </div>
//                 </div>
//               </motion.div>
//             )}

//             {step === 3 && (
//               <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
//                 <div className="flex items-center gap-3 mb-6">
//                   <div className="bg-[#4a9e4a]/10 p-3 rounded-2xl text-[#4a9e4a]"><Activity size={24} /></div>
//                   <h2 className="text-xl font-bold text-[#2c1810]">Testing Connection</h2>
//                 </div>

//                 <div className="space-y-4 mb-8">
//                   <div className="flex items-center justify-between p-4 bg-[#fdf8f0] rounded-xl border border-[#d4a853]/30">
//                     <div>
//                       <p className="font-bold text-[#2c1810]">Claude AI Engine</p>
//                       <p className="text-xs text-[#8b5e3c]">Anthropic API</p>
//                     </div>
//                     {testResults.testing ? <span className="animate-spin">⏳</span> : (testResults.claude ? <span className="text-green-600 font-bold">✅ OK</span> : <span className="text-red-600 font-bold">❌ Failed</span>)}
//                   </div>
//                   <div className="flex items-center justify-between p-4 bg-[#fdf8f0] rounded-xl border border-[#d4a853]/30">
//                     <div>
//                       <p className="font-bold text-[#2c1810]">Sarvam Voice AI</p>
//                       <p className="text-xs text-[#8b5e3c]">TTS & STT</p>
//                     </div>
//                     {testResults.testing ? <span className="animate-spin">⏳</span> : (testResults.sarvam ? <span className="text-green-600 font-bold">✅ OK</span> : <span className="text-red-600 font-bold">❌ Failed</span>)}
//                   </div>
//                 </div>

//                 <div className="flex gap-3">
//                   <button onClick={() => setStep(1)} className="px-6 py-4 rounded-xl font-bold text-[#5c3317] border border-[#d4a853]/50 hover:bg-[#fdf8f0]">Edit Keys</button>
//                   <button onClick={() => setStep(4)} disabled={testResults.testing || !testResults.claude} className="flex-1 bg-gradient-to-r from-[#4a9e4a] to-[#2d6a2d] text-white font-bold py-4 rounded-xl shadow-lg disabled:opacity-50">Continue</button>
//                 </div>
//               </motion.div>
//             )}

//             {step === 4 && (
//               <motion.div key="step4" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-8">
//                 <CheckCircle2 size={80} className="text-[#4a9e4a] mx-auto mb-6" />
//                 <h2 className="text-2xl font-black text-[#2c1810] mb-2">सिस्टम तयार आहे!</h2>
//                 <p className="text-[#8b5e3c] mb-8 font-marathi">सर्व API जोडले गेले आहेत. आता तुम्ही शेतकरी मित्र वापरू शकता.</p>
//                 <button onClick={finishSetup} className="w-full bg-gradient-to-r from-[#4a9e4a] to-[#2d6a2d] text-white font-bold py-4 rounded-xl shadow-lg text-lg">
//                   शेतकरी मित्र सुरू करा
//                 </button>
//               </motion.div>
//             )}

//           </AnimatePresence>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default SetupWizard;