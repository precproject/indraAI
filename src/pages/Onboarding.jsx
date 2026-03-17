import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, User, MapPin } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const Onboarding = () => {
  const { user, updateUserProfile } = useAppContext();
  const navigate = useNavigate();
  
  const [name, setName] = useState('');
  const [district, setDistrict] = useState(user?.district || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleCompleteProfile = async (e) => {
    e.preventDefault();
    if (!name || !district) return;
    setIsSaving(true);

    try {
      // हे अपडेट आपण सध्या Local Context मध्ये करत आहोत. 
      // (Phase 3 मध्ये आपण बॅकएंडला हे सेव्ह करण्यासाठी API जोडू)
      updateUserProfile({ 
        name: name, 
        district: district, 
        isProfileComplete: true 
      });
      
      setIsSaving(false);
      navigate('/app'); // सगळं झाल्यावर मुख्य खोलीत पाठवा
      
    } catch (error) {
      console.error(error);
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fdf8f0] flex flex-col items-center justify-center p-6 font-sans">
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-[2rem] p-8 shadow-xl border border-[#d4a853]/30">
          <h2 className="text-2xl font-black text-[#2c1810] mb-2 text-center">स्वागत आहे! 🎉</h2>
          <p className="text-[#8b5e3c] text-sm text-center mb-8 font-bold">पुढे जाण्याआधी थोडी ओळख करून घेऊया.</p>
          
          <form onSubmit={handleCompleteProfile} className="space-y-5">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <User size={20} className="text-[#8b5e3c]/50" />
              </div>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="तुमचे पूर्ण नाव"
                className="w-full bg-[#fdf8f0] border border-[#d4a853]/50 rounded-2xl pl-12 pr-4 py-4 text-[#2c1810] font-bold focus:outline-none focus:border-[#4a9e4a]"
              />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <MapPin size={20} className="text-[#8b5e3c]/50" />
              </div>
              <input 
                type="text" 
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                placeholder="तुमचा जिल्हा (उदा. नाशिक)"
                className="w-full bg-[#fdf8f0] border border-[#d4a853]/50 rounded-2xl pl-12 pr-4 py-4 text-[#2c1810] font-bold focus:outline-none focus:border-[#4a9e4a]"
              />
            </div>

            <button 
              type="submit" 
              disabled={!name || !district || isSaving}
              className="w-full bg-gradient-to-r from-[#4a9e4a] to-[#2d6a2d] text-white font-black py-4 rounded-2xl shadow-lg flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
            >
              {isSaving ? 'जतन करत आहे...' : <>सुरू करा <ArrowRight size={20} /></>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;