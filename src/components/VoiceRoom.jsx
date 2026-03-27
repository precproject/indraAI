import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Square, CheckCircle2, Info, UserCheck, Sprout, Send, Camera, ThumbsUp, ThumbsDown, Globe, X, Volume2 } from 'lucide-react';
import { apiService } from '../services/apiService';
import { useAppContext } from '../context/AppContext';
import { useNativeSpeech } from '../hooks/useNativeSpeech';

const VoiceRoom = () => {
  // 🟢 दुरुस्ती: addLocalLedgerEntry आणि addCredits इथे घेतले आहेत!
  const { user, cycles, ledger, addLedgerEntry, updateUserProfile, addLocalLedgerEntry, addCredits, chatHistory, setChatHistory } = useAppContext();
  
  // 🟢 Feature Toggles (सेटिंग्ज)
  const ENABLE_ICEBREAKER = false; // Icebreaker बंद करण्यासाठी false करा
  const ENABLE_SUGGESTIONS = true; // स्मार्ट प्रश्न बंद करण्यासाठी false करा

  const hasIceBreakerFired = useRef(false); // 🟢 IceBreaker ला रोखण्यासाठी
  const [suggestions, setSuggestions] = useState([]); // 🟢 स्मार्ट प्रश्नांसाठी

  // ── 1. संवादाची सलग नोंद (Session Chat History) ──
  //const [chatHistory, setChatHistory] = useState([]); 
  const chatEndRef = useRef(null); 

  const [radioState, setRadioState] = useState('idle');
  const [manualText, setManualText] = useState('');
  const [selectedLang, setSelectedLang] = useState('mr-IN');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const { isListening, transcript, toggleListening } = useNativeSpeech({ lang: selectedLang, continuous: true });

  const totalIncome = ledger.filter(e => e.type === 'income').reduce((sum, e) => sum + Number(e.amount || 0), 0);
  const totalExpense = ledger.filter(e => e.type === 'expense').reduce((sum, e) => sum + Number(e.amount || 0), 0);
  const profit = totalIncome - totalExpense;

  // Smart Suggestions for New User
  const hasUserSpoken = chatHistory.some(msg => msg.sender === 'user');

  // 🟢 नवीन: Ice Breaker (अ‍ॅप उघडताच आपोआप संवाद सुरू करणे)
  useEffect(() => {
    // जर चॅट हिस्ट्री रिकामी असेल आणि युजर लोड झाला असेल
    if (user && chatHistory.length === 0 && !hasIceBreakerFired.current) {
      hasIceBreakerFired.current = true; // एका सेकंदात लॉक करा म्हणजे दोनदा कॉल जाणार नाही!

      const triggerIceBreaker = async () => {
        setRadioState('thinking');
        try {
          // आपण AI ला एक छुपा संदेश पाठवत आहोत
          const hiddenMessage = "नमस्कार,";
          
          const activeCycle = cycles.length > 0 ? cycles[0] : null;
          const result = await apiService.processTextCommand(hiddenMessage, null, selectedLang);

          const aiMessage = {
            sender: 'ai',
            text: result.display_text,
            action: result.action,
            tip: result.tip,
            audioContent: result.audioContent,
            voice_text: result.voice_text,
            chatId: result.chatId,
            feedback: null
          };
          
          // इथे आपण युजरचा 'hiddenMessage' हिस्ट्रीमध्ये टाकत नाही आहोत, 
          // फक्त AI चे उत्तर टाकत आहोत!
          setChatHistory([aiMessage]);
          setRadioState('idle');

          await apiService.playAudio(result.voice_text, result.audioContent);
        } catch (error) {
          console.error("Icebreaker failed", error);
          setRadioState('idle');
        }
      };

      if(ENABLE_ICEBREAKER){
        triggerIceBreaker();
      }

      if(ENABLE_SUGGESTIONS){
        // 🟢 १. Ice Breaker आणि Smart Suggestions जनरेट करणे
        // --- स्मार्ट प्रश्न तयार करणे ---
        const month = new Date().getMonth() + 1;
        const season = month >= 6 && month <= 10 ? "खरीप" : (month >= 11 || month <= 3 ? "रब्बी" : "उन्हाळी");
        const dist = user.district || 'तुमच्या';
        
        const allPrompts = [
          `${dist} मध्ये आज हवामान कसे राहील?`,
          `या ${season} हंगामात कोणते पीक घेणे फायदेशीर ठरेल?`,
          `सध्या बाजारात कांद्याला काय भाव मिळत आहे?`,
          `माती परीक्षणासाठी मातीचा नमुना कसा घ्यावा?`,
          `माझ्या शेताचा हिशोब कसा ठेवायचा?`
        ];
        // कोणतेही ३ रँडम प्रश्न निवडा
        setSuggestions(allPrompts.sort(() => 0.5 - Math.random()).slice(0, 3));
      }
    }
  }, [user, cycles]); // जेव्हा user डेटा उपलब्ध होईल तेव्हाच हे चालेल

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, radioState]);

  useEffect(() => {
    if (isListening && transcript) {
      setManualText(transcript);
    }
  }, [transcript, isListening]);

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

  const handleFeedback = async (messageIndex, type) => {
    const updatedHistory = [...chatHistory];
    const targetMessage = updatedHistory[messageIndex];
    // updatedHistory[messageIndex].feedback = type;
    targetMessage.feedback = type;
    setChatHistory(updatedHistory);
    
    // 🟢 खरा chatId बॅकएंडला पाठवा
    if (targetMessage.chatId) {
      try {
        await apiService.sendFeedback(targetMessage.chatId, type);
        console.log(`Feedback saved: ${targetMessage.chatId}`);
      } catch (e) {
        console.warn("Feedback save failed");
      }
    }
  };

  const replayAudio = async (audioContent, fallbackText) => {
    await apiService.playAudio(fallbackText, audioContent);
  };

  const handleSend = async () => {
    if (!manualText.trim() && !imageFile) return;

    if (isListening) toggleListening(); 

    const userMessage = { 
      sender: 'user', 
      text: manualText, 
      image: imagePreview 
    };
    setChatHistory(prev => [...prev, userMessage]);
    
    setRadioState('thinking');
    const currentText = manualText; 
    const currentImageFile = imageFile;
    const currentImagePreview = imagePreview;
    
    setManualText(''); 
    removeImage(); 

    try {
      const result = await apiService.processTextCommand(currentText, imageFile, selectedLang);

      const aiMessage = {
        sender: 'ai',
        text: result.display_text,
        action: result.action,
        tip: result.tip,
        audioContent: result.audioContent,
        voice_text: result.voice_text,
        chatId: result.chatId, // 🟢 बॅकएंडकडून आलेला ID सेव्ह करा
        feedback: null
      };
      
      setChatHistory(prev => [...prev, aiMessage]);
      setRadioState('idle');

      // 🟢 अ‍ॅक्शन्सची तपासणी 
      if (result.action?.type === 'ADD_LEDGER' && result.action.payload) {
        await addLedgerEntry(result.action.payload);
      } else if (result.action?.type === 'ADD_LEDGER_LOCAL' && result.action.payload) {
        addLocalLedgerEntry(result.action.payload); // दुहेरी नोंद टाळण्यासाठी
        console.log("Ledger saved natively by backend.");
      }

      if (result.action?.type === 'UPDATE_PROFILE' && result.action.payload) {
        updateUserProfile(result.action.payload);
      }

      // 🟢 स्मार्ट क्रेडिट्स जोडणे
      if (result.creditsAwarded > 0) {
        addCredits(result.creditsAwarded);
      }

      await apiService.playAudio(result.voice_text, result.audioContent);

    } catch (error) {
      console.error("Processing error:", error);

      // 🟢 २. एरर मेसेज तयार करणे (भाषेनुसार)
      const errorMsg = selectedLang === 'hi-IN' 
        ? 'माफ़ करना, मुझे ठीक से समझ नहीं आया। कृपया दोबारा कोशिश करें।' 
        : 'माफी असावी, मला नीट समजले नाही. कृपया पुन्हा प्रयत्न करा.';

      setChatHistory(prev => [...prev, { sender: 'ai', text: errorMsg }]);

      setRadioState('idle');

      // 🟢 ३. शेतकऱ्याने दिलेला डेटा परत पाटीवर (Input Box) आणणे
      setManualText(currentText);
      if (currentImageFile) {
        setImageFile(currentImageFile);
        setImagePreview(currentImagePreview);
      }

      // 🟢 ४. एरर मेसेज 'बोलून' दाखवणे (Fallback TTS चा वापर करून)
      await apiService.playAudio(errorMsg, null);
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
            <p className={`text-xl font-black leading-tight ${profit >= 0 ? 'text-[#bfdbfe]' : 'text-[#fca5a5]'}`}>₹{(Math.abs(profit)/1000).toFixed(1)}K</p>
            <p className="text-white/70 text-[10px] font-bold uppercase mt-1">नफा</p>
          </div>
        </div>
      </div>

      {/* ── Chat History Area ── */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-40">
        
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
                
                {msg.image && <img src={msg.image} alt="Crop" className="w-full h-32 object-cover rounded-xl mb-3 border border-white/50" />}
                
                <p className="text-[15px] font-semibold whitespace-pre-wrap">{msg.text}</p>
                
                {msg.sender === 'ai' && (
                  <div className="mt-4 space-y-2">
                    {msg.action?.type.includes('ADD_LEDGER') && <p className="text-xs font-bold text-[#166534] bg-[#f0fdf4] p-2 rounded-lg flex items-center gap-1.5 border border-[#bbf7d0]"><CheckCircle2 size={14}/> हिशोब जतन केला</p>}
                    {msg.action?.type.includes('ADD_ACTIVITY') && <p className="text-xs font-bold text-[#1e3a8a] bg-[#eff6ff] p-2 rounded-lg flex items-center gap-1.5 border border-[#bfdbfe]"><Sprout size={14}/> नोंद जतन केली</p>}
                    {msg.action?.type === 'UPDATE_PROFILE' && <p className="text-xs font-bold text-[#8b5e3c] bg-[#fef08a]/30 p-2 rounded-lg flex items-center gap-1.5 border border-[#d4a853]/50"><UserCheck size={14}/> प्रोफाइल अपडेट केले</p>}
                    
                    {msg.tip && <p className="text-xs font-bold text-[#8b5e3c] bg-[#fdf8f0] p-3 rounded-xl flex items-start gap-2 border border-[#d4a853]/20"><Info size={16} className="shrink-0 mt-0.5"/> {msg.tip}</p>}
                    
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
          <div className="flex justify-start mb-4">
            <div className="bg-white border border-[#d4a853]/30 rounded-[1.5rem] rounded-tl-sm p-4 flex items-center gap-3 shadow-sm">
              <span className="animate-spin text-xl">⏳</span>
              <p className="text-sm font-bold text-[#8b5e3c]">इंद्र AI विचार करत आहे...</p>
            </div>
          </div>
        )}

        <div className={`flex flex-col items-center justify-center opacity-90 transition-all duration-500 ${chatHistory.length === 0 ? 'mt-20' : 'mt-8 mb-4'}`}>
          <button 
            type="button"
            style={{ touchAction: 'manipulation' }} // 🟢 मोबाईलवर टच लगेच नोंदवण्यासाठी
            onClick={(e) => {
              e.preventDefault(); // डबल टॅप/झूम रोखण्यासाठी
              toggleListening();
            }}
            className={`w-28 h-28 rounded-full flex items-center justify-center shadow-xl transition-all duration-300 ${
              isListening ? 'bg-red-500 scale-110 animate-pulse shadow-[0_0_40px_rgba(239,68,68,0.5)]' : 'bg-gradient-to-br from-[#4a9e4a] to-[#2d6a2d] hover:scale-105 shadow-[0_10px_25px_rgba(45,106,45,0.4)]'
            }`}
          >
            {isListening ? <Square size={36} className="text-white" fill="currentColor" /> : <Mic size={48} className="text-white drop-shadow-md" />}
          </button>
          <p className="mt-4 text-[#8b5e3c] font-bold text-center text-sm">
            {isListening ? "ऐकत आहे..." : chatHistory.length === 0 ? "खालील बटण दाबा आणि बोला" : "पुन्हा बोलण्यासाठी दाबा"}
          </p>
        </div>

        <div ref={chatEndRef} />
      </div>

      {/* ── Unified Input Area (Mobile Keyboard Fix) ── ── */}
      <div className="sticky bottom-0 z-50 w-full px-4 pb-4 pt-8 bg-gradient-to-t from-[#fdf8f0] via-[#fdf8f0] to-[#fdf8f0]/0 shrink-0">
        
        {/* 🟢 १. Smart Suggestions (फक्त नवीन चॅटसाठी) */}
        {ENABLE_SUGGESTIONS && !hasUserSpoken && suggestions.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-hide mb-1 max-w-3xl mx-auto">
            {suggestions.map((sugg, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setManualText(sugg)}
                className="whitespace-nowrap bg-white border border-[#4a9e4a]/40 text-[#2d6a2d] text-xs font-bold px-4 py-2 rounded-full shadow-sm hover:bg-[#d4edda] transition-colors"
              >
                {sugg}
              </button>
            ))}
          </div>
        )}

        {/* 🟢 २. Image Preview (जर फोटो निवडला असेल तर) */}
        {imagePreview && (
          <div className="relative w-24 h-24 rounded-2xl overflow-hidden border-2 border-[#4a9e4a] mb-2 shadow-xl bg-white max-w-3xl mx-auto">
            <img src={imagePreview} alt="Crop" className="object-cover w-full h-full" />
            <button type="button" onClick={removeImage} className="absolute top-1 right-1 bg-red-500 rounded-full text-white p-1.5 shadow-md">
              <X size={14} />
            </button>
          </div>
        )}

        {/* 🟢 ३. Main Input Box */}
        <div className="flex items-end gap-2 bg-white/95 backdrop-blur-md rounded-[2rem] p-2 pr-2 shadow-[0_-5px_25px_rgba(0,0,0,0.1)] border border-[#d4a853]/40 max-w-3xl mx-auto">
          <label className="p-3.5 bg-[#fdf8f0] text-[#8b5e3c] rounded-full cursor-pointer hover:bg-[#d4edda] transition-colors shrink-0">
            <Camera size={22} />
            <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleImageChange} />
          </label>

          <textarea
            value={manualText}
            onChange={(e) => setManualText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (manualText.trim() || imageFile) handleSend();
              }
            }}
            placeholder={isListening ? "ऐकत आहे..." : "येथे लिहा किंवा बोला..."}
            className={`flex-1 bg-transparent border-none focus:outline-none resize-none text-[#2c1810] font-bold py-3.5 min-h-[50px] max-h-[120px] ${isListening ? 'animate-pulse text-[#4a9e4a]' : ''}`}
            rows="1"
          />

          {/* मोबाईलसाठी टच-फ्रेंडली माईक */}
          <button 
            type="button"
            style={{ touchAction: 'manipulation' }}
            onClick={(e) => {
              e.preventDefault();
              toggleListening();
            }} 
            className={`p-3.5 rounded-full transition-all shrink-0 ${isListening ? 'bg-red-500 text-white shadow-inner animate-pulse' : 'bg-[#fdf8f0] text-[#4a9e4a] hover:bg-[#d4edda]'}`}
          >
            {isListening ? <Square size={22} fill="currentColor"/> : <Mic size={22} />}
          </button>

          <button 
            type="button"
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