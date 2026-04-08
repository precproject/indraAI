import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, User, MapPin, Navigation, Loader2 } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { apiService } from '../services/apiService';
import { useSmartLocation } from '../hooks/useSmartLocation';
import { useMarathiTranslation } from "../hooks/useMarathiTranslation";

const Onboarding = () => {
  const { user, updateUserProfile } = useAppContext();
  const { translateToMarathi } = useMarathiTranslation();
  const [errors, setErrors] = useState({});

  const navigate = useNavigate();
  
  const { locationData, isLocating, error: locationError, fetchLocation } = useSmartLocation();

  const [name, setName] = useState('');
  const [district, setDistrict] = useState(user?.district || '');
  const [village, setVillage] = useState('');
  const [pincode, setPincode] = useState('');
  const [stateName, setStateName] = useState('महाराष्ट्र');
  const [isSaving, setIsSaving] = useState(false);

  const isLocationFound = locationData?.lat && locationData?.lng;

  // ✅ Detect English anywhere in string
  const containsEnglish = (text) => /[A-Za-z]/.test(text);

  const handleTranslateOnBlur = async (value, setter, field) => {
    if (!value) return;

    // ❌ Skip pincode
    if (field === "pincode") return;

    // ❌ Skip if no English
    if (!containsEnglish(value)) return;

    try {
      const translated = await translateToMarathi(value);

      if (translated && translated !== value) {
        setter(translated);
      }
    } catch (err) {
      console.error("Translation failed:", err);
    }
  };

  // 🟢 १. पेज लोड होताच आपोआप लोकेशनची परवानगी मागणे
  useEffect(() => {
    fetchLocation();
  }, []);

  // 🟢 Auto-fill + translate location data
  useEffect(() => {
    const translateLocationFields = async () => {
      if (locationData?.lat) {
        const v = locationData.village || '';
        const d = locationData.district || '';
        const s = locationData.state || 'महाराष्ट्र';

        setPincode(locationData.pincode || '');

        try {
          setVillage(containsEnglish(v) ? await translateToMarathi(v) : v);
          setDistrict(containsEnglish(d) ? await translateToMarathi(d) : d);
          setStateName(containsEnglish(s) ? await translateToMarathi(s) : s);
        } catch (err) {
          console.error("Auto translation failed:", err);
          setVillage(v);
          setDistrict(d);
          setStateName(s);
        }
      }

      if (user?.isProfileComplete && user?.name !== "") {
        navigate('/app');
      }
    };

    translateLocationFields();
  }, [locationData]);

  const handleCompleteProfile = async (e) => {
    e.preventDefault();

    // 🔥 Validate first
    if (!validateFields()) return;

    if (!name || !district) return;
    setIsSaving(true);

    const fullProfileData = {
      name,
      district,
      village,
      state: stateName,
      pincode,
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
      navigate('/app'); 
      
    } catch (error) {
      console.error("Profile saving failed:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const validateFields = () => {
    const newErrors = {};

    // Name
    if (!name.trim()) {
      newErrors.name = "नाव आवश्यक आहे";
    } else if (name.length < 3) {
      newErrors.name = "नाव किमान ३ अक्षरांचे असावे";
    } else if (/\d/.test(name)) {
      newErrors.name = "नावात अंक नसावेत";
    }

    // District
    if (!district.trim()) {
      newErrors.district = "जिल्हा आवश्यक आहे";
    }

    // State
    if (!stateName.trim()) {
      newErrors.state = "राज्य आवश्यक आहे";
    }

    // State
    if (!village.trim()) {
      newErrors.village = "गाव आवश्यक आहे";
    }

    // Pincode
    if (pincode && !/^\d{6}$/.test(pincode)) {
      newErrors.pincode = "पिनकोड ६ अंकी असावा";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
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
                onBlur={() => handleTranslateOnBlur(name, setName)}
                placeholder="तुमचे पूर्ण नाव"
                className="w-full bg-[#fdf8f0] border border-[#d4a853]/50 rounded-2xl pl-12 pr-4 py-3.5 text-[#2c1810] font-bold focus:outline-none focus:border-[#4a9e4a]"
                required
              />
              {errors.name && (
                <p className="text-xs text-red-500 mt-1 font-bold">{errors.name}</p>
              )}
            </div>

            <button
              type="button"
              onClick={fetchLocation}
              disabled={isLocating}
              className="w-full bg-[#d4edda] text-[#2d6a2d] font-bold py-3 rounded-2xl border border-[#bbf7d0] flex items-center justify-center gap-2 hover:bg-[#bbf7d0] transition-colors"
            >
              {isLocating && !locationError ? <Loader2 size={18} className="animate-spin" /> : <Navigation size={18} />}
              {isLocating && !locationError ? 'लोकेशन शोधत आहे...' : !isLocationFound  ? '📍 माझे अचूक लोकेशन घ्या' : '✅ लोकेशन मिळाले!'}
            </button>

            {locationError && <p className="text-xs text-red-500 font-bold text-center">{locationError}</p>}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold text-[#8b5e3c] ml-1 uppercase tracking-widest">गाव / शहर</label>
                <input 
                  type="text" 
                  value={village}
                  onChange={(e) => setVillage(e.target.value)}
                  onBlur={() => handleTranslateOnBlur(village, setVillage)}
                  placeholder="गाव"
                  className="w-full bg-[#fdf8f0] border border-[#d4a853]/50 rounded-xl px-4 py-3 text-[#2c1810] font-bold focus:outline-none focus:border-[#4a9e4a]"
                />
                {errors.village && (
                  <p className="text-xs text-red-500 mt-1 font-bold">{errors.village}</p>
                )}
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
                {errors.pincode && (
                  <p className="text-xs text-red-500 mt-1 font-bold">{errors.pincode}</p>
                )}
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
                onBlur={() => handleTranslateOnBlur(district, setDistrict)}
                placeholder="तुमचा जिल्हा (उदा. नाशिक)"
                className="w-full bg-[#fdf8f0] border border-[#d4a853]/50 rounded-2xl pl-12 pr-4 py-3.5 text-[#2c1810] font-bold focus:outline-none focus:border-[#4a9e4a]"
                required
              />
              {errors.district && (
                <p className="text-xs text-red-500 mt-1 font-bold">{errors.district}</p>
              )}
            </div>

            <div className="relative mt-2">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <MapPin size={20} className="text-[#8b5e3c]/50" />
              </div>
              <input 
                type="text" 
                value={stateName}
                onChange={(e) => setStateName(e.target.value)}
                onBlur={() => handleTranslateOnBlur(stateName, setStateName)}
                placeholder="राज्य (उदा. महाराष्ट्र)"
                className="w-full bg-[#fdf8f0] border border-[#d4a853]/50 rounded-2xl pl-12 pr-4 py-3.5 text-[#2c1810] font-bold focus:outline-none focus:border-[#4a9e4a]"
              />
              {errors.state && (
                <p className="text-xs text-red-500 mt-1 font-bold">{errors.state}</p>
              )}
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