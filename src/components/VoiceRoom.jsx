import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Square, CheckCircle2, Info } from 'lucide-react';
import { aiService } from '../services/aiService';
import { useAppContext } from '../context/AppContext';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const VoiceRoom = () => {
  const { user, cycles, ledger, addLedgerEntry } = useAppContext();
  
  // रेडिओची अवस्था: शांत (idle), ऐकत आहे (listening), विचार करत आहे (thinking), उत्तर दाखवत आहे (showing_result)
  const [radioState, setRadioState] = useState('idle');
  const [liveText, setLiveText] = useState('');
  const [aiResult, setAiResult] = useState(null);
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // पैशांचा हिशोब (वरच्या पाटीसाठी)
  const totalIncome = ledger.filter(e => e.type === 'income').reduce((sum, e) => sum + e.amount, 0);
  const totalExpense = ledger.filter(e => e.type === 'expense').reduce((sum, e) => sum + e.amount, 0);
  const profit = totalIncome - totalExpense;

  const startListening = async () => {
    setAiResult(null);
    setRadioState('listening');
    setLiveText('ऐकत आहे... बोला');

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach(track => track.stop());
        setRadioState('thinking');
        setLiveText('इंद्र AI विचार करत आहे...');

        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        
        try {
          // आपला संदेशवाहक (aiService) मुख्य कार्यालयाला निरोप घेऊन जातो
          const activeCrop = cycles.length > 0 ? cycles[0].crop : 'कांदा';
          const result = await aiService.processVoiceCommand(audioBlob, user, activeCrop);
          
          setLiveText(`"${result.transcript}"`);

          // जर हिशोब लिहायचा असेल, तर तो थेट वहीत (Ledger) लिहिला जातो
          if (result.action?.type === 'ADD_LEDGER' && result.action.payload) {
            await addLedgerEntry(result.action.payload);
          }

          setAiResult(result);
          setRadioState('showing_result');
          await aiService.playAudio(result.voice_text, result.audioContent);
          
        } catch (error) {
          setLiveText('काहीतरी चूक झाली. कृपया पुन्हा प्रयत्न करा.');
          setRadioState('idle');
        }
      };

      recorder.start();
    } catch (error) {
      setLiveText('मायक्रोफोन चालू करा.');
      setRadioState('idle');
    }
  };

  const stopListening = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  };

  const COLORS = ['#4a9e4a', '#d4a853', '#3b82c4', '#c17f3a'];

  return (
    <div className="flex flex-col h-full bg-[#fdf8f0] relative">
      
      {/* ── वरची पाटी (Dashboard) ── */}
      <div className="bg-gradient-to-br from-[#1a4d1a] to-[#2d6a2d] px-5 py-6 rounded-b-[2rem] shadow-lg shrink-0 z-10">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-white/70 text-xs mb-1">नमस्कार 🙏</p>
            <h2 className="text-white text-2xl font-black">{user?.name || 'शेतकरी'}</h2>
            <p className="text-white/60 text-xs font-bold mt-1 tracking-wider">इंद्र AI - तुमचा स्मार्ट सहकारी</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-2xl px-4 py-2 text-right border border-white/20">
            <p className="text-white/80 text-[10px] font-bold uppercase">🏆 क्रेडिट्स</p>
            <p className="text-[#d4a853] text-2xl font-black drop-shadow-sm">{user?.credits || 0}</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mt-6">
          <div className="bg-white/10 rounded-2xl p-3 text-center border border-white/10">
            <p className="text-xl font-black text-[#4ade80] leading-tight drop-shadow-md">₹{(totalIncome/1000).toFixed(1)}K</p>
            <p className="text-white/70 text-[10px] font-bold uppercase mt-1 tracking-widest">उत्पन्न</p>
          </div>
          <div className="bg-white/10 rounded-2xl p-3 text-center border border-white/10">
            <p className="text-xl font-black text-[#fef08a] leading-tight drop-shadow-md">₹{(totalExpense/1000).toFixed(1)}K</p>
            <p className="text-white/70 text-[10px] font-bold uppercase mt-1 tracking-widest">खर्च</p>
          </div>
          <div className="bg-white/10 rounded-2xl p-3 text-center border border-white/10">
            <p className={`text-xl font-black leading-tight drop-shadow-md ${profit >= 0 ? 'text-[#bfdbfe]' : 'text-[#fca5a5]'}`}>₹{(profit/1000).toFixed(1)}K</p>
            <p className="text-white/70 text-[10px] font-bold uppercase mt-1 tracking-widest">नफा</p>
          </div>
        </div>
      </div>

      {/* ── मध्यभाग (उत्तर दाखवण्याची जागा आणि वॉक-टॉकी) ── */}
      <div className="flex-1 flex flex-col p-6 relative overflow-y-auto">
        
        {/* जेव्हा AI उत्तर देते, तेव्हा हे कार्ड दिसते */}
        <AnimatePresence>
          {aiResult && radioState === 'showing_result' && (
            <motion.div 
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className="w-full bg-white rounded-[2rem] p-6 shadow-xl border border-[#d4a853]/30 mb-8"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-[#d4edda] rounded-full flex items-center justify-center text-[#2d6a2d] border border-[#a8d5b0]">
                  <span className="text-2xl">🌾</span>
                </div>
                <h3 className="font-black text-[#2c1810] text-xl">इंद्र AI</h3>
              </div>
              
              <p className="text-[#5c3317] font-marathi text-lg leading-relaxed mb-5">
                {aiResult.display_text}
              </p>

              {aiResult.action?.type === 'ADD_LEDGER' && (
                <div className="bg-[#f0fdf4] border border-[#86efac] rounded-2xl p-4 flex items-center gap-3 mb-5 shadow-sm">
                  <CheckCircle2 className="text-[#166534] shrink-0" size={24} />
                  <p className="text-sm font-bold text-[#166534]">नोंद जतन केली (+१५ क्रेडिट्स मिळाले)</p>
                </div>
              )}

              {aiResult.chart?.type === 'pie' && aiResult.chart.data && (
                <div className="h-40 w-full mt-4 bg-[#fdf8f0] rounded-2xl p-2 border border-[#d4a853]/20">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={aiResult.chart.data} cx="50%" cy="50%" innerRadius={45} outerRadius={65} paddingAngle={5} dataKey="value" stroke="none">
                        {aiResult.chart.data.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}

              {aiResult.tip && (
                <div className="bg-[#fdf8f0] border border-[#d4a853]/30 rounded-2xl p-4 flex items-start gap-3 mt-5">
                  <Info className="text-[#8b5e3c] shrink-0 mt-0.5" size={20} />
                  <p className="text-sm text-[#5c3317] font-bold font-marathi leading-snug">{aiResult.tip}</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── सर्वात मोठा माईक (The Walkie-Talkie Button) ── */}
        <div className="mt-auto pt-6 flex flex-col items-center justify-center pb-4">
          <p className="text-[#8b5e3c] font-bold mb-8 h-6 text-center font-marathi text-lg">{liveText}</p>
          
          <button 
            onMouseDown={startListening}
            onMouseUp={stopListening}
            onTouchStart={startListening}
            onTouchEnd={stopListening}
            className={`relative flex items-center justify-center w-32 h-32 rounded-full shadow-2xl transition-all duration-300 ${
              radioState === 'listening' 
                ? 'bg-red-500 scale-110 shadow-[0_0_60px_rgba(239,68,68,0.6)]' 
                : radioState === 'thinking'
                ? 'bg-[#d4a853] shadow-[0_0_40px_rgba(212,168,83,0.5)] cursor-wait'
                : 'bg-gradient-to-br from-[#4a9e4a] to-[#2d6a2d] shadow-[0_20px_40px_rgba(45,106,45,0.4)] hover:scale-105 active:scale-95'
            }`}
          >
            {radioState === 'listening' ? (
              <>
                <Square size={40} className="text-white relative z-10" fill="currentColor" />
                {/* लाल रंगाचे स्पंदन (Pulse effect) */}
                <span className="absolute inset-0 rounded-full border-[6px] border-red-400 animate-ping opacity-75"></span>
                <span className="absolute -inset-6 rounded-full border-4 border-red-300 animate-ping opacity-40" style={{ animationDelay: '0.2s' }}></span>
              </>
            ) : radioState === 'thinking' ? (
              <span className="text-5xl animate-spin relative z-10">⏳</span>
            ) : (
              <Mic size={56} className="text-white relative z-10 drop-shadow-md" />
            )}
          </button>
          
          {radioState === 'idle' && (
            <p className="text-sm font-bold text-[#5c3317] mt-8 bg-white px-8 py-3 rounded-full shadow-md border border-[#d4a853]/20 tracking-wide">
              दाबा आणि बोला (Press & Speak)
            </p>
          )}
        </div>

      </div>
    </div>
  );
};

export default VoiceRoom;