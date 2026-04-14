import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Square, CheckCircle2, Info, UserCheck, Sprout, Send, Camera, ThumbsUp, ThumbsDown, Globe, X, Volume2, StopCircle } from 'lucide-react';
import { apiService } from '../services/apiService';
import { useAppContext } from '../context/AppContext';
import { useNativeSpeech } from '../hooks/useNativeSpeech';

const VoiceRoom = () => {
  const { user, cycles, ledger, addLedgerEntry, updateUserProfile, addLocalLedgerEntry, addCredits, chatHistory, setChatHistory } = useAppContext();
  
  const ENABLE_ICEBREAKER = false; 
  const ENABLE_SUGGESTIONS = true; 

  const hasIceBreakerFired = useRef(false); 
  const [suggestions, setSuggestions] = useState([]); 

  const chatEndRef = useRef(null); 

  // 🟢 State: idle | thinking | speaking
  const [radioState, setRadioState] = useState('idle');  
  const [manualText, setManualText] = useState('');
  const [selectedLang, setSelectedLang] = useState('mr-IN');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const { isListening, transcript, toggleListening } = useNativeSpeech({ lang: selectedLang, continuous: true });

  const totalIncome = ledger.filter(e => e.type === 'income').reduce((sum, e) => sum + Number(e.amount || 0), 0);
  const totalExpense = ledger.filter(e => e.type === 'expense').reduce((sum, e) => sum + Number(e.amount || 0), 0);
  const profit = totalIncome - totalExpense;

  const hasUserSpoken = chatHistory.some(msg => msg.sender === 'user');

  useEffect(() => {
    if (user && chatHistory.length === 0 && !hasIceBreakerFired.current) {
      hasIceBreakerFired.current = true; 

      const triggerIceBreaker = async () => {
        setRadioState('thinking');
        try {
          const hiddenMessage = "नमस्कार,";
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
          
          setChatHistory([aiMessage]);
          setRadioState('speaking');

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
        setSuggestions(allPrompts.sort(() => 0.5 - Math.random()).slice(0, 3));
      }
    }
  }, [user, cycles]); 

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, radioState]);

  useEffect(() => {
    if (isListening && transcript) {
      setManualText(transcript);
    }
  }, [transcript, isListening]);

  // 🟢 नवीन: माईक चालू करताना जुना ऑडिओ थांबवा
  const handleMicToggle = (e) => {
    if (e) e.preventDefault();
    apiService.stopAudio(); 
    setRadioState('idle'); 
    toggleListening();
  };

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
    targetMessage.feedback = type;
    setChatHistory(updatedHistory);
    
    if (targetMessage.chatId) {
      try {
        await apiService.sendFeedback(targetMessage.chatId, type);
      } catch (e) {
        console.warn("Feedback save failed");
      }
    }
  };

  const replayAudio = async (audioContent, fallbackText) => {
    setRadioState('speaking');
    await apiService.playAudio(fallbackText, audioContent);
  };

  const stopAudio = () => {
    apiService.stopAudio();
    setRadioState('idle');
  }

  const handleSend = async () => {
    if (!manualText.trim() && !imageFile) return;

    // 🟢 मेसेज सेंड करताना जुना ऑडिओ थांबवा
    apiService.stopAudio();

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
        chatId: result.chatId, 
        feedback: null,
        is_complete: result.is_complete, // 🟢 Needed for UI Form
        extracted_data: result.extracted_data // 🟢 Needed for UI Form
      };
      
      setChatHistory(prev => [...prev, aiMessage]);
      setRadioState('speaking'); 

      if (result.action?.type === 'ADD_LEDGER' && result.action.payload) {
        await addLedgerEntry(result.action.payload);
      } else if (result.action?.type === 'ADD_LEDGER_LOCAL' && result.action.payload) {
        addLocalLedgerEntry(result.action.payload); 
      }

      if (result.action?.type === 'UPDATE_PROFILE' && result.action.payload) {
        updateUserProfile(result.action.payload);
      }

      if (result.creditsAwarded > 0) {
        addCredits(result.creditsAwarded);
      }

      await apiService.playAudio(result.voice_text, result.audioContent);
      
      // टीप: खऱ्या ॲपमध्ये TTS संपल्यावर 'idle' करण्यासाठी Event Listener लागतो.
      // तात्पुरते आपण युजरला 'Stop' बटन दिले आहे.

    } catch (error) {
      console.error("Processing error:", error);

      const errorMsg = selectedLang === 'hi-IN' 
        ? 'माफ़ करना, मुझे ठीक से समझ नहीं आया। कृपया दोबारा कोशिश करें।' 
        : 'माफी असावी, मला नीट समजले नाही. कृपया पुन्हा प्रयत्न करा.';

      setChatHistory(prev => [...prev, { sender: 'ai', text: errorMsg }]);
      setRadioState('idle');

      setManualText(currentText);
      if (currentImageFile) {
        setImageFile(currentImageFile);
        setImagePreview(currentImagePreview);
      }

      setRadioState('speaking');
      await apiService.playAudio(errorMsg, null);
    }
  };

  // 🟢 DYNAMIC SMART FORM COMPONENT
  const renderMissingDataForm = (extractedData) => {
    if (!extractedData) return null;

    // Define all possible fields and their types
    const ALL_FIELDS = [
      { key: 'crop', label: 'पीक', type: 'text', placeholder: 'उदा. गहू' },
      { key: 'variety', label: 'वाण/ब्रँड', type: 'text', placeholder: 'उदा. श्रीराम' },
      { key: 'area', label: 'क्षेत्र (एकर)', type: 'number', placeholder: 'उदा. २' },
      { key: 'category', label: 'प्रकार', type: 'select', options: ['बियाणे', 'खते', 'कीटकनाशक', 'मजुरी', 'यंत्र', 'सिंचन', 'विक्री', 'इतर'] },
      { key: 'amount', label: 'रक्कम (₹)', type: 'number', placeholder: 'उदा. २०००' },
      { key: 'quantity_in_quintal', label: 'क्विंटल', type: 'number', placeholder: 'उदा. १०' },
      { key: 'market', label: 'बाजार', type: 'text', placeholder: 'उदा. लासलगाव' },
      { key: 'event_date', label: 'तारीख', type: 'date' },
      { key: 'agri_inputs', label: 'खत/औषध नाव', type: 'text', placeholder: 'उदा. 10:26:26' },
    ];

    // Filter fields that are strictly NULL (meaning they are missing)
    const missingFields = ALL_FIELDS.filter(f => extractedData[f.key] === null);

    if (missingFields.length === 0) return null;

    const handleSubmitForm = (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const updates = [];
      
      missingFields.forEach(field => {
         const val = formData.get(field.key);
         if(val) updates.push(`${field.label}: ${val}`);
      });
      
      if(updates.length > 0) {
         handleSend(`माहिती: ${updates.join(', ')}`); // Send merged text to AI
      }
    };
    return (
      <form onSubmit={handleSubmitForm} className="mt-4 bg-[#fdf8f0] p-4 rounded-xl border border-[#d4a853]/40">
        <p className="text-xs font-bold text-[#8b5e3c] mb-3 border-b border-[#d4a853]/20 pb-2">✏️ कृपया अपूर्ण माहिती भरा:</p>
        <div className="grid grid-cols-2 gap-3 mb-3">
          {missingFields.map(field => (
            <div key={field.key}>
              <label className="text-[10px] text-gray-500 uppercase font-bold">{field.label}</label>
              {field.type === 'select' ? (
                <select name={field.key} className="w-full text-sm p-2 rounded border border-gray-200 outline-none focus:border-[#4a9e4a] bg-white">
                  <option value="">निवडा...</option>
                  {field.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              ) : (
                <input name={field.key} type={field.type} step={field.type === 'number' ? '0.1' : undefined} placeholder={field.placeholder || ''} className="w-full text-sm p-2 rounded border border-gray-200 outline-none focus:border-[#4a9e4a]" />
              )}
            </div>
          ))}
        </div>
        <button type="submit" className="w-full bg-[#4a9e4a] text-white py-2 rounded-lg text-sm font-bold shadow-sm hover:bg-[#368636]">
          माहिती जतन करा
        </button>
      </form>
    );
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
                
                <p className="text-[15px] font-semibold whitespace-pre-wrap">
                  {typeof msg.text === 'string' ? msg.text : JSON.stringify(msg.text)}
                </p>
                                
                {msg.sender === 'ai' && (
                  <>
                    {/* 🟢 RENDER DYNAMIC FORM if data is missing and it's the last message */}
                    {msg.is_complete === false && msg.extracted_data && idx === chatHistory.length - 1 && (
                       renderMissingDataForm(msg.extracted_data)
                    )}
                    
                    <div className="mt-4 space-y-2">
                      {msg.action?.type.includes('ADD_LEDGER') && <p className="text-xs font-bold text-[#166534] bg-[#f0fdf4] p-2 rounded-lg flex items-center gap-1.5 border border-[#bbf7d0]"><CheckCircle2 size={14}/> हिशोब जतन केला</p>}
                      {msg.action?.type.includes('ADD_ACTIVITY') && <p className="text-xs font-bold text-[#1e3a8a] bg-[#eff6ff] p-2 rounded-lg flex items-center gap-1.5 border border-[#bfdbfe]"><Sprout size={14}/> नोंद जतन केली</p>}
                      {msg.action?.type === 'UPDATE_PROFILE' && <p className="text-xs font-bold text-[#8b5e3c] bg-[#fef08a]/30 p-2 rounded-lg flex items-center gap-1.5 border border-[#d4a853]/50"><UserCheck size={14}/> प्रोफाइल अपडेट केले</p>}
                      
                      {msg.tip && <p className="text-xs font-bold text-[#8b5e3c] bg-[#fdf8f0] p-3 rounded-xl flex items-start gap-2 border border-[#d4a853]/20"><Info size={16} className="shrink-0 mt-0.5"/> {msg.tip}</p>}
                      
                      <div className="flex items-center justify-between pt-3 border-t border-[#fdf8f0] mt-3">
                        {/* 🟢 Play/Stop Buttons Fix */}
                        <div className="flex gap-2">
                          <button onClick={() => replayAudio(msg.audioContent, msg.voice_text)} className="text-[#4a9e4a] flex items-center gap-1 text-[11px] font-bold bg-green-50 px-2 py-1.5 rounded-full hover:bg-green-100 transition-colors border border-green-200">
                            <Volume2 size={14} /> ऐका
                          </button>
                          <button onClick={stopAudio} className="text-red-500 flex items-center gap-1 text-[11px] font-bold bg-red-50 px-2 py-1.5 rounded-full hover:bg-red-100 transition-colors border border-red-200">
                            <StopCircle size={14} /> थांबवा
                          </button>
                        </div>

                        <div className="flex gap-2">
                          <button onClick={() => handleFeedback(idx, 'up')} className={`p-1.5 rounded-full transition-colors border ${msg.feedback === 'up' ? 'bg-[#d4edda] text-green-700 border-green-300' : 'bg-gray-50 text-gray-400 border-transparent hover:bg-gray-100'}`}><ThumbsUp size={14}/></button>
                          <button onClick={() => handleFeedback(idx, 'down')} className={`p-1.5 rounded-full transition-colors border ${msg.feedback === 'down' ? 'bg-red-50 text-red-600 border-red-200' : 'bg-gray-50 text-gray-400 border-transparent hover:bg-gray-100'}`}><ThumbsDown size={14}/></button>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {/* 🟢 विचार करत असताना येणारे अ‍ॅनिमेशन */}
        {radioState === 'thinking' && (
          <div className="flex justify-start mb-4">
            <div className="bg-white border border-[#d4a853]/30 rounded-[1.5rem] rounded-tl-sm p-4 flex items-center gap-3 shadow-sm">
              <span className="animate-spin text-xl">⏳</span>
              <p className="text-sm font-bold text-[#8b5e3c]">इंद्र AI विचार करत आहे...</p>
            </div>
          </div>
        )}

        {/* 🟢 BIG MIC FIX: जर AI विचार करत असेल (thinking) तर हे मोठे बटण लपवा */}
        {radioState !== 'thinking' && (
          <div className={`flex flex-col items-center justify-center opacity-90 transition-all duration-500 ${chatHistory.length === 0 ? 'mt-20' : 'mt-8 mb-4'}`}>
            <button 
              type="button"
              style={{ touchAction: 'manipulation' }}
              onClick={handleMicToggle} 
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
        )}

        <div ref={chatEndRef} />
      </div>

      {/* ── Unified Input Area ── */}
      <div className="sticky bottom-0 z-50 w-full px-4 pb-4 pt-8 bg-gradient-to-t from-[#fdf8f0] via-[#fdf8f0] to-[#fdf8f0]/0 shrink-0">
        
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

        {imagePreview && (
          <div className="relative w-24 h-24 rounded-2xl overflow-hidden border-2 border-[#4a9e4a] mb-2 shadow-xl bg-white max-w-3xl mx-auto">
            <img src={imagePreview} alt="Crop" className="object-cover w-full h-full" />
            <button type="button" onClick={removeImage} className="absolute top-1 right-1 bg-red-500 rounded-full text-white p-1.5 shadow-md">
              <X size={14} />
            </button>
          </div>
        )}

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

          <button 
            type="button"
            style={{ touchAction: 'manipulation' }}
            onClick={handleMicToggle} 
            disabled={radioState === 'thinking'} // Disable bottom mic when thinking
            className={`p-3.5 rounded-full transition-all shrink-0 ${isListening ? 'bg-red-500 text-white shadow-inner animate-pulse' : 'bg-[#fdf8f0] text-[#4a9e4a] hover:bg-[#d4edda] disabled:opacity-50'}`}
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