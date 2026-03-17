import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Square, CheckCircle2, Info, UserCheck, Sprout, Send, Camera, ThumbsUp, ThumbsDown, Globe, X, Volume2 } from 'lucide-react';
import { apiService } from '../services/apiService';
import { useAppContext } from '../context/AppContext';
import { useNativeSpeech } from '../hooks/useNativeSpeech';

const VoiceRoom = () => {
  const { user, cycles, ledger, addLedgerEntry, updateUserProfile } = useAppContext();
  
  // ── 1. संवादाची सलग नोंद (Session Chat History) ──
  const [chatHistory, setChatHistory] = useState([]); 
  const chatEndRef = useRef(null); // ऑटो स्क्रोलसाठी

  const [radioState, setRadioState] = useState('idle');
  const [manualText, setManualText] = useState('');
  const [selectedLang, setSelectedLang] = useState('mr-IN');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const { isListening, transcript, toggleListening } = useNativeSpeech({ lang: selectedLang, continuous: true });

  // पैशांचा हिशोब
  const totalIncome = ledger.filter(e => e.type === 'income').reduce((sum, e) => sum + e.amount, 0);
  const totalExpense = ledger.filter(e => e.type === 'expense').reduce((sum, e) => sum + e.amount, 0);
  const profit = totalIncome - totalExpense;

  // नवीन मेसेज आल्यावर सर्वात खाली आपोआप स्क्रोल करा
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, radioState]);

  // माईकमधून आलेले शब्द पाटीवर लिहिणे
  useEffect(() => {
    if (isListening && transcript) {
      setManualText(transcript);
    }
  }, [transcript, isListening]);

  // फोटो जोडणे
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  // फीडबॅक सेव्ह करणे
  const handleFeedback = (messageIndex, type) => {
    const updatedHistory = [...chatHistory];
    updatedHistory[messageIndex].feedback = type;
    setChatHistory(updatedHistory);
    
    // (भविष्यात आपण हे apiService.sendFeedback(type) करून बॅकएंडला पाठवू शकतो)
    console.log(`Feedback saved: ${type} for AI response at index ${messageIndex}.`);
  };

  // पुन्हा आवाज ऐकणे
  const replayAudio = async (audioContent, fallbackText) => {
    await apiService.playAudio(fallbackText, audioContent);
  };

  // फायनल मेसेज मॅनेजरला पाठवणे
  const handleSend = async () => {
    if (!manualText.trim() && !imageFile) return;

    if (isListening) toggleListening(); // माईक चालू असल्यास बंद करा

    // 1. शेतकऱ्याचा प्रश्न हिस्ट्रीमध्ये टाका
    const userMessage = { 
      sender: 'user', 
      text: manualText, 
      image: imagePreview 
    };
    setChatHistory(prev => [...prev, userMessage]);
    
    setRadioState('thinking');
    const currentText = manualText; // सेव्ह करून ठेवा
    setManualText(''); // पाटी पुसून टाका
    removeImage(); // फोटो काढून टाका

    try {
      const activeCrop = cycles.length > 0 ? cycles[0].crop : 'माहित नाही';
      
      const result = await apiService.processTextCommand(currentText, imageFile, user, activeCrop, selectedLang);

      // 2. AI चे उत्तर हिस्ट्रीमध्ये टाका
      const aiMessage = {
        sender: 'ai',
        text: result.display_text,
        action: result.action,
        tip: result.tip,
        audioContent: result.audioContent,
        voice_text: result.voice_text,
        feedback: null
      };
      
      setChatHistory(prev => [...prev, aiMessage]);
      setRadioState('idle');

      // 3. एक्शन्स पूर्ण करणे
      if (result.action?.type === 'ADD_LEDGER' && result.action.payload) {
        await addLedgerEntry(result.action.payload);
      }
      if (result.action?.type === 'UPDATE_PROFILE' && result.action.payload) {
        updateUserProfile(result.action.payload);
      }

      // 4. उत्तर बोलून दाखवा
      await apiService.playAudio(result.voice_text, result.audioContent);

    } catch (error) {
      console.error("Processing error:", error);
      setChatHistory(prev => [...prev, { sender: 'ai', text: 'माफी असावी, तांत्रिक अडचण आली आहे. कृपया पुन्हा प्रयत्न करा.' }]);
      setRadioState('idle');
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#fdf8f0] relative">
      
      {/* ── Dashboard Header ── */}
      <div className="bg-gradient-to-br from-[#1a4d1a] to-[#2d6a2d] px-5 py-6 rounded-b-[2rem] shadow-lg shrink-0 z-10">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-white/70 text-xs mb-1">नमस्कार 🙏</p>
            <h2 className="text-white text-2xl font-black">{user?.name || 'नवीन शेतकरी'}</h2>
          </div>
          
          <div className="flex flex-col items-end gap-2">
            {/* 🌐 नवीन भाषा निवडण्याची सोय */}
            <div className="flex items-center gap-1 bg-white/10 rounded-full px-3 py-1 border border-white/20">
              <Globe size={12} className="text-white/80" />
              <select 
                value={selectedLang} 
                onChange={(e) => setSelectedLang(e.target.value)}
                className="bg-transparent text-white font-bold text-xs outline-none cursor-pointer appearance-none"
              >
                <option value="mr-IN" className="text-black">मराठी</option>
                <option value="hi-IN" className="text-black">हिंदी</option>
                <option value="en-US" className="text-black">English</option>
              </select>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl px-4 py-1 text-right border border-white/20">
              <p className="text-[#d4a853] text-xl font-black drop-shadow-sm">{user?.credits || 0} <span className="text-white/80 text-[10px] uppercase">Pts</span></p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mt-6">
          <div className="bg-white/10 rounded-2xl p-3 text-center border border-white/10">
            <p className="text-xl font-black text-[#4ade80] leading-tight">₹{(totalIncome/1000).toFixed(1)}K</p>
            <p className="text-white/70 text-[10px] font-bold uppercase mt-1">उत्पन्न</p>
          </div>
          <div className="bg-white/10 rounded-2xl p-3 text-center border border-white/10">
            <p className="text-xl font-black text-[#fef08a] leading-tight">₹{(totalExpense/1000).toFixed(1)}K</p>
            <p className="text-white/70 text-[10px] font-bold uppercase mt-1">खर्च</p>
          </div>
          <div className="bg-white/10 rounded-2xl p-3 text-center border border-white/10">
            <p className={`text-xl font-black leading-tight ${profit >= 0 ? 'text-[#bfdbfe]' : 'text-[#fca5a5]'}`}>₹{(profit/1000).toFixed(1)}K</p>
            <p className="text-white/70 text-[10px] font-bold uppercase mt-1">नफा</p>
          </div>
        </div>
      </div>

      {/* ── Chat History Area ── */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-40">
        
        {/* सुरुवातीचा मोठा माईक (जर हिस्ट्री रिकामी असेल तरच दाखवा) */}
        {chatHistory.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full opacity-80 mt-10">
            <button 
              onClick={toggleListening}
              className={`w-32 h-32 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 ${
                isListening ? 'bg-red-500 scale-110 animate-pulse' : 'bg-gradient-to-br from-[#4a9e4a] to-[#2d6a2d] hover:scale-105'
              }`}
            >
              {isListening ? <Square size={40} className="text-white" fill="currentColor" /> : <Mic size={56} className="text-white" />}
            </button>
            <p className="mt-6 text-[#8b5e3c] font-bold text-center text-lg">
              {isListening ? "ऐकत आहे..." : "खालील बटण दाबा आणि बोला"}
            </p>
            <p className="text-sm text-[#8b5e3c]/70 mt-2">किंवा पाटीवर टाईप करा</p>
          </div>
        )}

        {/* संवादाची यादी */}
        <AnimatePresence>
          {chatHistory.map((msg, idx) => (
            <motion.div 
              key={idx} 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[85%] rounded-[1.5rem] p-4 shadow-sm ${
                msg.sender === 'user' ? 'bg-[#d4edda] text-[#2c1810] rounded-tr-sm' : 'bg-white border border-[#d4a853]/30 text-[#5c3317] rounded-tl-sm'
              }`}>
                
                {/* जर शेतकऱ्याने फोटो पाठवला असेल */}
                {msg.image && <img src={msg.image} alt="Crop" className="w-full h-32 object-cover rounded-xl mb-3 border border-white/50" />}
                
                <p className="text-[15px] font-semibold whitespace-pre-wrap">{msg.text}</p>
                
                {/* AI चे अ‍ॅक्शन्स आणि टिप्स */}
                {msg.sender === 'ai' && (
                  <div className="mt-4 space-y-2">
                    {msg.action?.type === 'ADD_LEDGER' && <p className="text-xs font-bold text-[#166534] bg-[#f0fdf4] p-2 rounded-lg flex items-center gap-1.5 border border-[#bbf7d0]"><CheckCircle2 size={14}/> हिशोब जतन केला</p>}
                    {msg.action?.type === 'ADD_ACTIVITY' && <p className="text-xs font-bold text-[#1e3a8a] bg-[#eff6ff] p-2 rounded-lg flex items-center gap-1.5 border border-[#bfdbfe]"><Sprout size={14}/> नोंद जतन केली</p>}
                    {msg.action?.type === 'UPDATE_PROFILE' && <p className="text-xs font-bold text-[#8b5e3c] bg-[#fef08a]/30 p-2 rounded-lg flex items-center gap-1.5 border border-[#d4a853]/50"><UserCheck size={14}/> प्रोफाइल अपडेट केले</p>}
                    
                    {msg.tip && <p className="text-xs font-bold text-[#8b5e3c] bg-[#fdf8f0] p-3 rounded-xl flex items-start gap-2 border border-[#d4a853]/20"><Info size={16} className="shrink-0 mt-0.5"/> {msg.tip}</p>}
                    
                    {/* Replay आणि Feedback बटणे */}
                    <div className="flex items-center justify-between pt-3 border-t border-[#fdf8f0] mt-3">
                      <button onClick={() => replayAudio(msg.audioContent, msg.voice_text)} className="text-[#4a9e4a] flex items-center gap-1.5 text-[11px] font-bold bg-green-50 px-3 py-1.5 rounded-full hover:bg-green-100 transition-colors border border-green-200">
                        <Volume2 size={14} /> पुन्हा ऐका
                      </button>
                      <div className="flex gap-2">
                        <button onClick={() => handleFeedback(idx, 'up')} className={`p-1.5 rounded-full transition-colors border ${msg.feedback === 'up' ? 'bg-[#d4edda] text-green-700 border-green-300' : 'bg-gray-50 text-gray-400 border-transparent hover:bg-gray-100'}`}><ThumbsUp size={14}/></button>
                        <button onClick={() => handleFeedback(idx, 'down')} className={`p-1.5 rounded-full transition-colors border ${msg.feedback === 'down' ? 'bg-red-50 text-red-600 border-red-200' : 'bg-gray-50 text-gray-400 border-transparent hover:bg-gray-100'}`}><ThumbsDown size={14}/></button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {radioState === 'thinking' && (
          <div className="flex justify-start">
            <div className="bg-white border border-[#d4a853]/30 rounded-[1.5rem] rounded-tl-sm p-4 flex items-center gap-3 shadow-sm">
              <span className="animate-spin text-xl">⏳</span>
              <p className="text-sm font-bold text-[#8b5e3c]">इंद्र AI विचार करत आहे...</p>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* ── Unified Input Area (The New Control Dashboard) ── */}
      <div className="absolute bottom-4 left-4 right-4 z-20">
        
        {/* इमेज प्रिव्ह्यू */}
        {imagePreview && (
          <div className="relative w-24 h-24 rounded-2xl overflow-hidden border-2 border-[#4a9e4a] mb-2 shadow-xl bg-white">
            <img src={imagePreview} alt="Crop" className="object-cover w-full h-full" />
            <button onClick={removeImage} className="absolute top-1 right-1 bg-red-500 rounded-full text-white p-1.5 shadow-md">
              <X size={14} />
            </button>
          </div>
        )}

        <div className="flex items-end gap-2 bg-white/95 backdrop-blur-md rounded-[2rem] p-2 pr-2 shadow-[0_-5px_25px_rgba(0,0,0,0.05)] border border-[#d4a853]/40">
          
          {/* कॅमेरा बटण */}
          <label className="p-3.5 bg-[#fdf8f0] text-[#8b5e3c] rounded-full cursor-pointer hover:bg-[#d4edda] transition-colors shrink-0">
            <Camera size={22} />
            <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleImageChange} />
          </label>

          {/* पाटी (Text Box) */}
          <textarea
            value={manualText}
            onChange={(e) => setManualText(e.target.value)}
            placeholder={isListening ? "ऐकत आहे..." : "येथे लिहा किंवा बोला..."}
            className={`flex-1 bg-transparent border-none focus:outline-none resize-none text-[#2c1810] font-bold py-3.5 min-h-[50px] max-h-[120px] ${isListening ? 'animate-pulse text-[#4a9e4a]' : ''}`}
            rows="1"
          />

          {/* मोफत माईक बटण */}
          <button 
            onClick={toggleListening} 
            className={`p-3.5 rounded-full transition-all shrink-0 ${isListening ? 'bg-red-500 text-white shadow-inner animate-pulse' : 'bg-[#fdf8f0] text-[#4a9e4a] hover:bg-[#d4edda]'}`}
          >
            {isListening ? <Square size={22} fill="currentColor"/> : <Mic size={22} />}
          </button>

          {/* सेंड बटण */}
          <button 
            onClick={handleSend} 
            disabled={radioState === 'thinking' || (!manualText.trim() && !imageFile)} 
            className="p-3.5 bg-gradient-to-r from-[#4a9e4a] to-[#2d6a2d] text-white rounded-full disabled:opacity-50 shrink-0 hover:scale-105 transition-transform shadow-md"
          >
            <Send size={22} className={radioState === 'thinking' ? "opacity-50" : ""} />
          </button>
        </div>
      </div>

    </div>
  );
};

export default VoiceRoom;