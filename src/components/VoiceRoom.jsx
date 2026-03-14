import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Square, CheckCircle2, TrendingUp, TrendingDown, Info } from 'lucide-react';
import { aiService } from '../services/aiService';
import { useAppContext } from '../context/AppContext';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const VoiceRoom = () => {
  const { user, cycles, ledger, addLedgerEntry } = useAppContext();
  
  // The radio states: idle, listening, thinking, showing_result
  const [radioState, setRadioState] = useState('idle');
  const [liveText, setLiveText] = useState('');
  const [aiResult, setAiResult] = useState(null);
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // The math for the top dashboard
  const totalIncome = ledger.filter(e => e.type === 'income').reduce((sum, e) => sum + e.amount, 0);
  const totalExpense = ledger.filter(e => e.type === 'expense').reduce((sum, e) => sum + e.amount, 0);
  const profit = totalIncome - totalExpense;

  const startListening = async () => {
    setAiResult(null);
    setRadioState('listening');
    setLiveText('ऐकत आहे... बोला');

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4';
      const recorder = new MediaRecorder(stream, { mimeType });
      
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach(track => track.stop());
        setRadioState('thinking');
        setLiveText('इंद्र AI विचार करत आहे...');

        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        
        try {
          // 1. Send recording to the translator
          const spokenText = await aiService.sttSarvam(audioBlob);
          setLiveText(`"${spokenText}"`);

          // 2. Send the translated text to our Smart Manager
          const result = await aiService.getChatResponse(spokenText, user, cycles, {});
          
          // 3. If the manager wrote a receipt, put it in the filing cabinet
          if (result.action?.type === 'ADD_LEDGER' && result.action.payload) {
            await addLedgerEntry(result.action.payload);
          }

          // 4. Show the answer card and read it out loud
          setAiResult(result);
          setRadioState('showing_result');
          await aiService.playAudio(result.voice_text);
          
        } catch (error) {
          console.error("Error processing voice:", error);
          setLiveText('काहीतरी चूक झाली. कृपया पुन्हा प्रयत्न करा.');
          setRadioState('idle');
        }
      };

      recorder.start();
    } catch (error) {
      console.error("Microphone access denied", error);
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
    <div className="flex flex-col h-full bg-wheat-light relative">
      
      {/* ── TOP DASHBOARD ── */}
      <div className="bg-gradient-to-br from-leaf-dark to-leaf px-5 py-6 rounded-b-3xl shadow-md shrink-0 z-10">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-white/70 text-xs mb-1">नमस्कार 🙏</p>
            <h2 className="text-white text-xl font-black">{user?.name || 'शेतकरी'}</h2>
            <p className="text-white/60 text-xs font-bold mt-1">इंद्र AI - तुमचा स्मार्ट सहकारी</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2 text-right border border-white/10">
            <p className="text-white/70 text-[10px] font-bold">🏆 क्रेडिट्स</p>
            <p className="text-white text-xl font-black">{user?.credits || 0}</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mt-5">
          <div className="bg-white/10 rounded-xl p-2 text-center border border-white/5">
            <p className="text-lg font-black text-green-200 leading-tight">₹{(totalIncome/1000).toFixed(1)}K</p>
            <p className="text-white/70 text-[9px] font-bold uppercase tracking-wider">उत्पन्न</p>
          </div>
          <div className="bg-white/10 rounded-xl p-2 text-center border border-white/5">
            <p className="text-lg font-black text-yellow-200 leading-tight">₹{(totalExpense/1000).toFixed(1)}K</p>
            <p className="text-white/70 text-[9px] font-bold uppercase tracking-wider">खर्च</p>
          </div>
          <div className="bg-white/10 rounded-xl p-2 text-center border border-white/5">
            <p className={`text-lg font-black leading-tight ${profit >= 0 ? 'text-blue-200' : 'text-red-300'}`}>₹{(profit/1000).toFixed(1)}K</p>
            <p className="text-white/70 text-[9px] font-bold uppercase tracking-wider">नफा</p>
          </div>
        </div>
      </div>

      {/* ── THE CENTER STAGE (Radio & Answer Card) ── */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 relative">
        
        {/* If we have an answer card from IndraAI, we show it here */}
        <AnimatePresence>
          {aiResult && radioState === 'showing_result' && (
            <motion.div 
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className="w-full bg-white rounded-3xl p-6 shadow-xl border border-wheat/50 mb-8"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-leaf-light rounded-full flex items-center justify-center text-leaf-dark">
                  <span className="text-xl">🌾</span>
                </div>
                <h3 className="font-black text-soil text-lg">इंद्र AI</h3>
              </div>
              
              <p className="text-bark font-marathi text-lg leading-relaxed mb-4">
                {aiResult.display_text}
              </p>

              {aiResult.action?.type === 'ADD_LEDGER' && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex items-center gap-2 mb-4">
                  <CheckCircle2 className="text-green-600" size={20} />
                  <p className="text-sm font-bold text-green-800">नोंद जतन केली (+15 क्रेडिट्स)</p>
                </div>
              )}

              {aiResult.chart?.type === 'pie' && aiResult.chart.data && (
                <div className="h-40 w-full mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={aiResult.chart.data} cx="50%" cy="50%" innerRadius={40} outerRadius={60} paddingAngle={5} dataKey="value" stroke="none">
                        {aiResult.chart.data.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}

              {aiResult.tip && (
                <div className="bg-wheat-light rounded-xl p-3 flex items-start gap-2 mt-4">
                  <Info className="text-mud shrink-0 mt-0.5" size={16} />
                  <p className="text-xs text-mud font-bold font-marathi">{aiResult.tip}</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── THE GIANT MICROPHONE ── */}
        <div className="flex flex-col items-center mt-auto pb-10">
          <p className="text-mud font-bold mb-6 h-6 text-center font-marathi">{liveText}</p>
          
          <button 
            onMouseDown={startListening}
            onMouseUp={stopListening}
            onTouchStart={startListening}
            onTouchEnd={stopListening}
            className={`relative flex items-center justify-center w-28 h-28 rounded-full shadow-2xl transition-all duration-300 ${
              radioState === 'listening' 
                ? 'bg-red-500 scale-110 shadow-red-500/40' 
                : radioState === 'thinking'
                ? 'bg-yellow-500 shadow-yellow-500/40 cursor-wait'
                : 'bg-gradient-to-br from-leaf-md to-leaf shadow-leaf/40 hover:scale-105'
            }`}
          >
            {radioState === 'listening' ? (
              <>
                <Square size={36} className="text-white" fill="currentColor" />
                <span className="absolute inset-0 rounded-full border-4 border-red-400 animate-ping opacity-75"></span>
                <span className="absolute -inset-4 rounded-full border-2 border-red-300 animate-ping opacity-50" style={{ animationDelay: '0.2s' }}></span>
              </>
            ) : radioState === 'thinking' ? (
              <span className="text-4xl animate-spin">⏳</span>
            ) : (
              <Mic size={48} className="text-white" />
            )}
          </button>
          
          {radioState === 'idle' && (
            <p className="text-sm font-bold text-soil mt-6 bg-white px-6 py-2 rounded-full shadow-sm border border-wheat">
              दाबा आणि बोला (Press & Speak)
            </p>
          )}
        </div>

      </div>
    </div>
  );
};

export default VoiceRoom;