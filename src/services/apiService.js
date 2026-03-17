const API_BASE = 'http://localhost:3000/api'; 

// खिशातून (LocalStorage) सिक्युरिटी पास काढण्याची सोय
const getSecurityPass = () => {
  const token = localStorage.getItem('farmerToken');
  return token ? `Bearer ${token}` : '';
};

export const apiService = {
  // १. लॉगिन करताना पास लागत नाही, कारण तो आपल्याला आतून मिळणार असतो
  async loginUser(phone, district) {
    const response = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, district })
    });
    if (!response.ok) throw new Error('लॉगिन अयशस्वी');
    return await response.json();
  },

  // ── नवीन: पेज रिफ्रेश झाल्यावर फाईल आणणे ──
  async getCurrentUser() {
    const response = await fetch(`${API_BASE}/me`, {
      method: 'GET',
      headers: { 
        'Authorization': getSecurityPass() // पास सोबत पाठवणे सक्तीचे आहे
      }
    });
    if (!response.ok) throw new Error('शेतकऱ्याची माहिती मिळाली नाही');
    return await response.json();
  },
  
  // २. बाजारभाव आणणे (इथे पास दाखवणे सक्तीचे आहे)
  async getMarketData(crop, district) {
    const response = await fetch(`${API_BASE}/market?crop=${crop}&district=${district}`, {
      headers: { 'Authorization': getSecurityPass() }
    });
    if (!response.ok) throw new Error('बाजारभाव आणता आले नाहीत');
    return await response.json();
  },

  // ३. व्हॉइस कॅसेट पाठवणे
  async processVoiceCommand(audioBlob, user, activeCrop) {
    const formData = new FormData();
    formData.append('voice', audioBlob, 'recording.webm');
    formData.append('farmerId', user.id);
    formData.append('name', user.name || '');
    formData.append('district', user.district || '');
    formData.append('activeCrop', activeCrop || '');
    formData.append('isProfileComplete', user.isProfileComplete || false); 

    const response = await fetch(`${API_BASE}/chat`, {
      method: 'POST',
      headers: { 
        'Authorization': getSecurityPass() // पास सोबत पाठवा
      },
      body: formData
    });
    
    if (!response.ok) throw new Error('आवाज पाठवता आला नाही');
    return await response.json();
  },

  async processTextCommand(text, imageFile, user, activeCrop, language) {
    const formData = new FormData();
    formData.append('text', text);
    formData.append('farmerId', user.id);
    formData.append('name', user.name || '');
    formData.append('district', user.district || '');
    formData.append('activeCrop', activeCrop || '');
    formData.append('isProfileComplete', user.isProfileComplete || false);
    formData.append('language', language || 'mr-IN'); // शेतकऱ्याची आवडती भाषा

    // जर फोटो असेल तर तोही जोडा
    if (imageFile) {
      formData.append('image', imageFile);
    }

    const response = await fetch(`${API_BASE}/chat`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${localStorage.getItem('farmerToken')}` // सिक्युरिटी पास
      },
      body: formData
    });
    
    if (!response.ok) throw new Error('माहिती पाठवता आली नाही');
    return await response.json();
  },

  // ४. पावती जमा करणे
  async addLedgerEntry(ledgerEntry, updatedUser) {
    const response = await fetch(`${API_BASE}/ledger`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': getSecurityPass() // पास सोबत पाठवा
      },
      body: JSON.stringify({ ledgerEntry, updatedUser })
    });
    if (!response.ok) throw new Error('पावती जमा करता आली नाही');
    return await response.json();
  },

  async getDashboardData() {
    const response = await fetch(`${API_BASE}/dashboard`, {
      headers: { 'Authorization': getSecurityPass() }
    });
    if (!response.ok) throw new Error('डॅशबोर्ड डेटा आणता आला नाही');
    return await response.json();
  },

  async analyzeCompanyQuery(query) {
    const response = await fetch(`${API_BASE}/analyze`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': getSecurityPass() 
      },
      body: JSON.stringify({ query })
    });
    if (!response.ok) throw new Error('Query failed');
    return await response.json();
  },

  async playAudio(fallbackText, base64Audio) {
    try {
      if (base64Audio) {
        const audio = new Audio(`data:audio/webm;base64,${base64Audio}`);
        await audio.play();
      } else if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(fallbackText);
        utterance.lang = 'mr-IN';
        window.speechSynthesis.speak(utterance);
      }
    } catch (error) {
      console.error("Audio playback failed:", error);
    }
  },

  // प्रोफाईल अपडेट करणे
  async updateProfile(userId, profileData) {
    // खऱ्या अ‍ॅपमध्ये हे बॅकएंडला जाईल: fetch(`${API_BASE}/user/${userId}`, { method: 'PUT', ... })
    // सध्या आपण UI चालण्यासाठी तात्पुरते 'Success' पाठवत आहोत
    return new Promise((resolve) => setTimeout(() => resolve({ success: true, data: profileData }), 500));
  },

  // नवीन शेत जोडणे
  async addFarm(userId, farmData) {
    return new Promise((resolve) => setTimeout(() => resolve({ success: true, data: { id: Date.now(), ...farmData } }), 500));
  },

  // पॉईंट्सचा इतिहास आणणे
  async getCreditHistory(userId) {
    return new Promise((resolve) => setTimeout(() => resolve([
      { id: 1, date: new Date().toISOString().slice(0, 10), reason: 'प्रोफाईल पूर्ण केले', points: 50 },
      { id: 2, date: new Date().toISOString().slice(0, 10), reason: 'खताचा हिशोब जोडला', points: 15 },
      { id: 3, date: new Date(Date.now() - 86400000).toISOString().slice(0, 10), reason: 'शेतातील कामाची नोंद', points: 10 }
    ]), 600));
  }
};