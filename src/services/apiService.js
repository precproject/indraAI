// const API_BASE = 'http://localhost:3000/api'; 
const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

const API_BASE = isLocalhost 
  ? 'http://localhost:3000/api' 
  : 'https://indraai-backend.vercel.app/api';

// खिशातून (LocalStorage) सिक्युरिटी पास काढण्याची सोय
const getSecurityPass = () => {
  const token = localStorage.getItem('farmerToken');
  return token ? `Bearer ${token}` : '';
};

export const apiService = {
  // १. लॉगिन करताना पास लागत नाही
  async loginUser(phone, district) {
    const response = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, district })
    });
    if (!response.ok) throw new Error('लॉगिन अयशस्वी');
    return await response.json();
  },

  // ── पेज रिफ्रेश झाल्यावर फाईल आणणे ──
  async getCurrentUser() {
    const response = await fetch(`${API_BASE}/me`, {
      method: 'GET',
      headers: { 
        'Authorization': getSecurityPass() 
      }
    });
    if (!response.ok) throw new Error('शेतकऱ्याची माहिती मिळाली नाही');
    return await response.json();
  },
  
  // २. बाजारभाव आणणे
  async getMarketData(crop, district) {
    const response = await fetch(`${API_BASE}/market?crop=${crop}&district=${district}`, {
      headers: { 'Authorization': getSecurityPass() }
    });
    if (!response.ok) throw new Error('बाजारभाव आणता आले नाहीत');
    return await response.json();
  },

  // ३. व्हॉइस कॅसेट पाठवणे (Updated for Crop Stage & Area)
  async processVoiceCommand(audioBlob, language) {
    const formData = new FormData();
    formData.append('voice', audioBlob, 'recording.webm');
    formData.append('language', language || 'mr-IN');

    const response = await fetch(`${API_BASE}/chat`, {
      method: 'POST',
      headers: { 'Authorization': getSecurityPass() },
      body: formData
    });
    
    if (!response.ok) throw new Error('आवाज पाठवता आला नाही');
    return await response.json();
  },

  // ४. मजकूर आणि फोटो पाठवणे (Updated for Crop Stage & Area)
  async processTextCommand(text, imageFile, language) {
    const formData = new FormData();
    formData.append('text', text);
    formData.append('language', language || 'mr-IN'); 

    if (imageFile) {
      formData.append('image', imageFile);
    }

    const response = await fetch(`${API_BASE}/chat`, {
      method: 'POST',
      headers: { 'Authorization': getSecurityPass() },
      body: formData
    });
    
    if (!response.ok) throw new Error('माहिती पाठवता आली नाही');
    return await response.json();
  },

  // ५. पावती जमा करणे
  async addLedgerEntry(ledgerEntry, updatedUser) {
    const response = await fetch(`${API_BASE}/ledger`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': getSecurityPass() 
      },
      body: JSON.stringify({ ledgerEntry, updatedUser })
    });
    if (!response.ok) throw new Error('पावती जमा करता आली नाही');
    return await response.json();
  },

  // ── नवीन: फीडबॅक सेव्ह करणे (Feedback API) ──
  async sendFeedback(chatId, feedbackType) {
    const response = await fetch(`${API_BASE}/feedback`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': getSecurityPass() 
      },
      body: JSON.stringify({ chatId, feedbackType })
    });
    // जरी एरर आली तरी आपण UI थांबवणार नाही, म्हणून फक्त रिझल्ट परत पाठवू
    if (!response.ok) return { success: false };
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
        const voices = speechSynthesis.getVoices();

        const voice =
          voices.find(v => v.lang === "mr-IN") ||
          voices.find(v => v.lang === "hi-IN");

        if (voice) {
          utterance.voice = voice;
        } else {
          utterance.lang = "mr-IN";
        }
        window.speechSynthesis.speak(utterance);
      }
    } catch (error) {
      console.error("Audio playback failed:", error);
    }
  },

  // प्रोफाईल अपडेट करणे
// प्रोफाईल अपडेट करणे (खरा API कॉल)
  async updateProfile(userId, profileData) {
    const response = await fetch(`${API_BASE}/user/profile`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': getSecurityPass() 
      },
      body: JSON.stringify({ userId, ...profileData })
    });
    
    if (!response.ok) throw new Error('प्रोफाईल सेव्ह करता आले नाही');
    return await response.json();
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
  },

  // 🟢 Cycle Room साठी विशिष्ट पिकाचा हिशोब आणि संवाद आणणे
  async getCropTimeline(cropName) {
    const response = await fetch(`${API_BASE}/cycles/timeline?crop=${cropName}`, {
      headers: { 'Authorization': getSecurityPass() }
    });
    if (!response.ok) return { ledger: [], chats: [] };
    return await response.json();
  },
};