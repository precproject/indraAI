import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, User, MapPin, Navigation, Loader2 } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { apiService } from '../services/apiService';
import { useSmartLocation } from '../hooks/useSmartLocation';

const Onboarding = () => {
  const { user, updateUserProfile } = useAppContext();
  const navigate = useNavigate();
  
  const { locationData, isLocating, error: locationError, fetchLocation } = useSmartLocation();

  const [name, setName] = useState('');
  const [district, setDistrict] = useState(user?.district || '');
  const [village, setVillage] = useState('');
  const [pincode, setPincode] = useState('');
  const [stateName, setStateName] = useState('Maharashtra');
  const [isSaving, setIsSaving] = useState(false);

  // 🟢 १. पेज लोड होताच आपोआप लोकेशनची परवानगी मागणे
  useEffect(() => {
    fetchLocation();
  }, [fetchLocation]);

  // लोकेशन मिळाल्यावर रकाने आपोआप भरणे
  useEffect(() => {
    if (locationData.lat) {
      setVillage(locationData.village || '');
      setDistrict(locationData.district || '');
      setPincode(locationData.pincode || '');
      setStateName(locationData.state || 'Maharashtra');
    }
  }, [locationData]);

  const handleCompleteProfile = async (e) => {
    e.preventDefault();
    if (!name || !district) return;
    setIsSaving(true);

    const fullProfileData = {
      name: name,
      district: district,
      village: village,
      state: stateName,
      pincode: pincode,
      latitude: locationData.lat,
      longitude: locationData.lng,
      isProfileComplete: true
    };

    try {
      // १. Local Context अपडेट करा
      updateUserProfile(fullProfileData);
      
      // २. खरा API कॉल करून डेटाबेसमध्ये कायमस्वरूपी सेव्ह करा
      if (user?.id) {
        await apiService.updateProfile(user.id, fullProfileData);
      }
      
      setIsSaving(false);
      navigate('/app'); 
      
    } catch (error) {
      console.error("Profile saving failed:", error);
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fdf8f0] flex flex-col items-center justify-center p-6 font-sans">
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-[2rem] p-8 shadow-xl border border-[#d4a853]/30">
          <h2 className="text-2xl font-black text-[#2c1810] mb-2 text-center">स्वागत आहे! 🎉</h2>
          <p className="text-[#8b5e3c] text-sm text-center mb-6 font-bold">पुढे जाण्याआधी आपली थोडी ओळख करून घेऊया.</p>
          
          <form onSubmit={handleCompleteProfile} className="space-y-4">
            
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <User size={20} className="text-[#8b5e3c]/50" />
              </div>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="तुमचे पूर्ण नाव"
                className="w-full bg-[#fdf8f0] border border-[#d4a853]/50 rounded-2xl pl-12 pr-4 py-3.5 text-[#2c1810] font-bold focus:outline-none focus:border-[#4a9e4a]"
                required
              />
            </div>

            <button
              type="button"
              onClick={fetchLocation}
              disabled={isLocating}
              className="w-full bg-[#d4edda] text-[#2d6a2d] font-bold py-3 rounded-2xl border border-[#bbf7d0] flex items-center justify-center gap-2 hover:bg-[#bbf7d0] transition-colors"
            >
              {isLocating ? <Loader2 size={18} className="animate-spin" /> : <Navigation size={18} />}
              {isLocating ? 'लोकेशन शोधत आहे...' : '📍 माझे अचूक लोकेशन घ्या'}
            </button>

            {locationError && <p className="text-xs text-red-500 font-bold text-center">{locationError}</p>}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold text-[#8b5e3c] ml-1 uppercase tracking-widest">गाव / शहर</label>
                <input 
                  type="text" 
                  value={village}
                  onChange={(e) => setVillage(e.target.value)}
                  placeholder="गाव"
                  className="w-full bg-[#fdf8f0] border border-[#d4a853]/50 rounded-xl px-4 py-3 text-[#2c1810] font-bold focus:outline-none focus:border-[#4a9e4a]"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-[#8b5e3c] ml-1 uppercase tracking-widest">पिनकोड</label>
                <input 
                  type="text" 
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  placeholder="पिनकोड"
                  maxLength={6}
                  className="w-full bg-[#fdf8f0] border border-[#d4a853]/50 rounded-xl px-4 py-3 text-[#2c1810] font-bold focus:outline-none focus:border-[#4a9e4a]"
                />
              </div>
            </div>

            <div className="relative mt-2">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <MapPin size={20} className="text-[#8b5e3c]/50" />
              </div>
              <input 
                type="text" 
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                placeholder="तुमचा जिल्हा (उदा. नाशिक)"
                className="w-full bg-[#fdf8f0] border border-[#d4a853]/50 rounded-2xl pl-12 pr-4 py-3.5 text-[#2c1810] font-bold focus:outline-none focus:border-[#4a9e4a]"
                required
              />
            </div>

            <button 
              type="submit" 
              disabled={!name || !district || isSaving || isLocating}
              className="w-full bg-gradient-to-r from-[#4a9e4a] to-[#2d6a2d] text-white font-black py-4 rounded-2xl shadow-lg flex items-center justify-center gap-2 mt-6 disabled:opacity-50 hover:scale-[1.02] transition-transform"
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