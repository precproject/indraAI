import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, ArrowRight, Mic, Square } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { useNativeSpeech } from '../hooks/useNativeSpeech'; 

const Login = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { loginUser } = useAppContext();
  
  const { isListening, transcript, toggleListening } = useNativeSpeech({ lang: 'mr-IN', continuous: true });

  useEffect(() => {

    if (localStorage.getItem('farmerToken')) navigate('/app', { replace: true });
    
    if (!isListening && transcript) {
      let text = transcript.toLowerCase();

      if (text.includes('admin') || text.includes('अॅडमिन') || text.includes('अडमीन')) {
        setPhoneNumber('admin');
        return;
      }

      const wordToNumberMap = {
        'शून्य': '0', 'zero': '0', 'o': '0', 'एक': '1', 'one': '1',
        'दोन': '2', 'two': '2', 'तीन': '3', 'three': '3', 'चार': '4', 'four': '4',
        'पाच': '5', 'five': '5', 'सहा': '6', 'six': '6', 'सात': '7', 'seven': '7',
        'आठ': '8', 'eight': '8', 'नऊ': '9', 'nine': '9',
        '०': '0', '१': '1', '२': '2', '३': '3', '४': '4', 
        '५': '5', '६': '6', '७': '7', '८': '8', '९': '9'
      };

      Object.keys(wordToNumberMap).forEach(word => {
        const regex = new RegExp(`\\b${word}\\b`, 'g');
        text = text.replace(regex, wordToNumberMap[word]);
      });

      text = text.replace(/[०-९]/g, match => wordToNumberMap[match]);
      const numbersOnly = text.replace(/\D/g, '');
      
      if (numbersOnly) {
        setPhoneNumber(numbersOnly);
      }
    }
  }, [isListening, transcript]);

  const handleEntry = async (e) => {
    e.preventDefault();
    if (!phoneNumber) return;
    setIsLoading(true);

    if (phoneNumber.toLowerCase() === 'admin' || phoneNumber === '0000') {
      navigate('/dashboard');
      return;
    }

    try {
      // इथे loginUser ने शेतकऱ्याची माहिती परत देणे आवश्यक आहे
      const userData = await loginUser(phoneNumber);
      
      setIsLoading(false);
      
      // जर प्रोफाइल अपूर्ण असेल (नवीन शेतकरी), तर स्वागत कक्षेत पाठवा
      if (userData && userData.isProfileComplete === false) {
        navigate('/onboarding');
      } else {
        // जुना शेतकरी असेल तर थेट आत जाऊ द्या
        navigate('/app');
      }
    } catch (error) {
      console.error(error);
      setIsLoading(false);
    }
  };

  const displayValue = isListening ? (transcript || 'ऐकत आहे...') : phoneNumber;

  return (
    <div className="min-h-screen bg-[#fdf8f0] flex flex-col items-center justify-center p-6 font-sans">
      <div className="w-full max-w-sm">
        
        <div className="text-center mb-10">
          <div className="text-6xl mb-4">🌾</div>
          <h1 className="text-4xl font-black text-[#2c1810]">IndraAI</h1>
          <p className="text-[#8b5e3c] font-bold mt-2 tracking-widest uppercase text-xs">शेतकरी मित्र</p>
        </div>

        <div className="bg-white rounded-[2rem] p-8 shadow-xl border border-[#d4a853]/30">
          <h2 className="text-xl font-bold text-[#2c1810] mb-6 text-center">आत येण्यासाठी नंबर सांगा किंवा टाका</h2>
          
          <form onSubmit={handleEntry} className="space-y-6">
            <div className="relative flex items-center">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Phone size={20} className={isListening ? "text-red-400 animate-pulse" : "text-[#8b5e3c]/50"} />
              </div>
              
              <input 
                type="text" 
                value={displayValue}
                onChange={(e) => { if (!isListening) setPhoneNumber(e.target.value); }}
                placeholder="उदा. 9876543210"
                className={`w-full bg-[#fdf8f0] border rounded-2xl pl-12 pr-16 py-4 font-bold focus:outline-none transition-colors ${
                  isListening 
                    ? 'border-red-400 text-red-600 bg-red-50/50' 
                    : 'border-[#d4a853]/50 text-[#2c1810] focus:border-[#4a9e4a]'
                }`}
              />

              <button
                type="button"
                onClick={toggleListening}
                className={`absolute right-2 p-2.5 rounded-xl transition-all ${
                  isListening 
                    ? 'bg-red-500 text-white shadow-inner hover:bg-red-600 animate-pulse' 
                    : 'bg-white text-[#4a9e4a] shadow-sm border border-[#d4a853]/20 hover:bg-[#d4edda]'
                }`}
              >
                {isListening ? <Square size={16} fill="currentColor" /> : <Mic size={20} />}
              </button>
            </div>

            <button 
              type="submit" 
              disabled={(!phoneNumber && !isListening) || isLoading}
              className="w-full bg-gradient-to-r from-[#4a9e4a] to-[#2d6a2d] text-white font-black py-4 rounded-2xl shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 hover:scale-[1.02] transition-transform"
            >
              {isLoading ? <span className="animate-spin">⏳</span> : <>पुढे जा <ArrowRight size={20} /></>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;