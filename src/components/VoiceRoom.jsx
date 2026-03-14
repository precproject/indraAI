import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mic, Send, Square, Sprout, Info } from 'lucide-react';

const VoiceRoom = () => {
  // These are our simple memory switches for the room
  const [isListening, setIsListening] = useState(false);
  const [inputText, setInputText] = useState('');
  const [activeCrop, setActiveCrop] = useState('कांदा'); // Default active crop
  const [messages, setMessages] = useState([
    { id: 1, sender: 'ai', text: 'नमस्कार, राजेशजी! मी तुमचा शेतकरी मित्र आहे. आज आपण काय नोंदवायचे?' }
  ]);
  
  // This helps us automatically scroll to the bottom of the chat, like reading a long receipt
  const chatEndRef = useRef(null);
  const scrollToBottom = () => chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  useEffect(() => scrollToBottom(), [messages]);

  // A list of pre-written notes on the desk
  const quickActions = [
    "💰 आजचा भाव", "📊 नफा किती?", "🌱 फवारणी करू?", "🏆 क्रेडिट", "📝 खत खरेदी", "🌤️ हवामान"
  ];

  // The function that runs when the farmer speaks or types
  const handleSendMessage = (text) => {
    if (!text.trim()) return;
    
    // Add the farmer's message to the conversation
    const newMsg = { id: Date.now(), sender: 'user', text };
    setMessages((prev) => [...prev, newMsg]);
    setInputText('');

    // Simulate the AI thinking and replying after 1 second
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { 
          id: Date.now() + 1, 
          sender: 'ai', 
          text: `मी "${text}" ही नोंद समजून घेतली आहे. तुमचा हिशोब अपडेट केला आहे.`,
          saved: true // Shows the little green checkmark
        }
      ]);
    }, 1000);
  };

  return (
    <div className="flex flex-col h-full bg-wheat-light relative">
      
      {/* ── THE TOP DASHBOARD ── */}
      <div className="bg-gradient-to-br from-leaf-dark to-leaf px-5 py-6 rounded-b-3xl shadow-md relative overflow-hidden shrink-0">
        {/* Decorative background circles */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-xl" />
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/5 rounded-full blur-xl" />
        
        <div className="flex justify-between items-start relative z-10">
          <div>
            <p className="text-white/70 text-xs mb-1">नमस्कार 🙏</p>
            <h2 className="text-white text-xl font-black">राजेश पाटील</h2>
            <p className="text-white/60 text-xs">लासलगाव · नाशिक</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2 text-right border border-white/10">
            <p className="text-white/70 text-[10px] font-bold">🏆 क्रेडिट्स</p>
            <p className="text-white text-xl font-black">340</p>
          </div>
        </div>

        {/* Money Boxes */}
        <div className="grid grid-cols-3 gap-3 mt-5 relative z-10">
          {[
            { label: 'उत्पन्न', val: '₹1.05L', color: 'text-green-200' },
            { label: 'खर्च', val: '₹14K', color: 'text-yellow-200' },
            { label: 'नफा', val: '₹91K', color: 'text-blue-200' }
          ].map((stat, idx) => (
            <div key={idx} className="bg-white/10 backdrop-blur-md rounded-xl p-2 text-center border border-white/5">
              <p className={`text-lg font-black ${stat.color} leading-tight`}>{stat.val}</p>
              <p className="text-white/70 text-[9px] font-bold uppercase tracking-wider">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── ACTIVE CROP FOLDERS ── */}
      <div className="bg-white px-4 py-3 border-b border-wheat/30 shadow-sm shrink-0">
        <p className="text-[10px] font-bold text-mud uppercase tracking-widest mb-2">सक्रिय पीक चक्रे</p>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {['कांदा', 'सोयाबीन'].map((crop) => (
            <button
              key={crop}
              onClick={() => setActiveCrop(crop)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap border-2 transition-colors ${
                activeCrop === crop 
                  ? 'bg-leaf text-white border-leaf' 
                  : 'bg-white text-bark border-wheat hover:border-leaf-light'
              }`}
            >
              {crop} · घरची शेती
            </button>
          ))}
          <button className="px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap bg-wheat-light text-mud border-2 border-dashed border-wheat hover:border-leaf-light">
            + नवीन
          </button>
        </div>
      </div>

      {/* ── THE CONVERSATION TAPE ── */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <motion.div 
            key={msg.id} 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.sender === 'ai' && (
              <div className="w-8 h-8 rounded-full bg-leaf-light flex items-center justify-center mr-2 shrink-0 border border-leaf/20">
                <span className="text-sm">🌾</span>
              </div>
            )}
            <div className={`max-w-[80%] p-3 text-sm font-marathi shadow-sm ${
              msg.sender === 'user' 
                ? 'bg-gradient-to-br from-leaf-dark to-leaf text-white rounded-[18px_18px_4px_18px]' 
                : 'bg-white text-text rounded-[18px_18px_18px_4px] border border-wheat/30'
            }`}>
              {msg.text}
              
              {/* If the AI saved a receipt, show a little green tag */}
              {msg.saved && (
                <div className="mt-2 bg-leaf-light/40 border-l-2 border-leaf-md px-2 py-1.5 rounded text-xs font-bold text-leaf-dark flex items-center gap-1">
                  <span className="text-[10px]">✅</span> नोंद जतन केली (+15 क्रेडिट्स)
                </div>
              )}
            </div>
          </motion.div>
        ))}
        <div ref={chatEndRef} />
      </div>

      {/* ── THE DESK (Microphone & Typing Area) ── */}
      <div className="bg-white/95 backdrop-blur-md border-t border-wheat p-3 pb-safe shrink-0">
        
        {/* Pre-written notes */}
        <div className="flex gap-2 overflow-x-auto pb-3 mb-1 scrollbar-hide">
          {quickActions.map((action, idx) => (
            <button 
              key={idx}
              onClick={() => handleSendMessage(action)}
              className="px-4 py-2 rounded-full text-xs font-bold bg-white border border-wheat text-bark whitespace-nowrap shadow-sm hover:bg-leaf-light hover:text-leaf-dark hover:border-leaf-md transition-colors"
            >
              {action}
            </button>
          ))}
        </div>

        {/* The Microphone and Keyboard tray */}
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <input 
              type="text" 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(inputText)}
              placeholder="येथे मराठीत लिहा..."
              className="w-full bg-wheat-light border border-wheat/60 rounded-full py-3 px-4 text-sm outline-none focus:border-leaf focus:bg-white transition-colors"
            />
            {inputText.trim() && (
              <button 
                onClick={() => handleSendMessage(inputText)}
                className="absolute right-1 top-1 bottom-1 aspect-square bg-leaf text-white rounded-full flex items-center justify-center hover:bg-leaf-dark transition-colors"
              >
                <Send size={16} className="-ml-0.5" />
              </button>
            )}
          </div>

          {/* The Big Microphone Button */}
          {!inputText.trim() && (
            <button 
              onClick={() => setIsListening(!isListening)}
              className={`relative flex items-center justify-center w-12 h-12 rounded-full shadow-lg transition-all ${
                isListening 
                  ? 'bg-red-500 text-white shadow-red-500/40' 
                  : 'bg-gradient-to-br from-leaf-md to-leaf text-white shadow-leaf/40 hover:scale-105'
              }`}
            >
              {isListening ? (
                <>
                  <Square size={20} fill="currentColor" />
                  {/* The pulsing rings when listening */}
                  <span className="absolute inset-0 rounded-full border-2 border-red-400 animate-ping opacity-75"></span>
                </>
              ) : (
                <Mic size={24} />
              )}
            </button>
          )}
        </div>
      </div>

    </div>
  );
};

export default VoiceRoom;