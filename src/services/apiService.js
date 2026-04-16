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

let currentAudioPlayer = null; // ग्लोबल ऑडिओ रेफरन्स

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

  // ३. व्हॉइस कॅसेट पाठवणे
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

  // ४. मजकूर आणि फोटो पाठवणे
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

  // ── फीडबॅक सेव्ह करणे (Feedback API) ──
  async sendFeedback(chatId, feedbackType) {
    const response = await fetch(`${API_BASE}/feedback`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': getSecurityPass() 
      },
      body: JSON.stringify({ chatId, feedbackType })
    });
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
    this.stopAudio();

    try {
      if (base64Audio) {
        const audio = new Audio(`data:audio/webm;base64,${base64Audio}`);
        currentAudioPlayer = audio;
        await audio.play();
        return;
      } else if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(fallbackText);
        const voices = speechSynthesis.getVoices();
        currentAudioPlayer = utterance; 

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

  // 🟢 चालू असलेला ऑडिओ थांबवणे
  stopAudio() {
    if (currentAudioPlayer instanceof Audio) {
      currentAudioPlayer.pause();
      currentAudioPlayer.currentTime = 0;
    }
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }
    currentAudioPlayer = null;
  },

  // ── 🟢 UPDATED: प्रोफाईल अपडेट करणे (Matched with backend route) ──
  async updateProfile(profileData) {
    const response = await fetch(`${API_BASE}/farmer/profile`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': getSecurityPass() 
      },
      // Note: Backend extracts farmerId from token, so no need to pass userId in body
      body: JSON.stringify(profileData) 
    });
    
    if (!response.ok) throw new Error('प्रोफाईल सेव्ह करता आले नाही');
    return await response.json();
  },

  // नवीन शेत जोडणे
  async addFarm(userId, farmData) {
    return new Promise((resolve) => setTimeout(() => resolve({ success: true, data: { id: Date.now(), ...farmData } }), 500));
  },

  // ── 🟢 UPDATED: पॉईंट्सचा इतिहास आणणे ──
  async getCreditHistory() {
    const response = await fetch(`${API_BASE}/credits/history`, {
      headers: { 'Authorization': getSecurityPass() }
    });
    if (!response.ok) return []; // Return empty array on failure, not object
    return await response.json();
  },

  // ── 🟢 UPDATED: चॅट हिस्ट्री आणणे (Pagination सह) ──
  async getChatHistory(page = 1, limit = 30, date = null) {
    let url = `${API_BASE}/chats?page=${page}&limit=${limit}`;
    if (date) url += `&date=${date}`; // जर तारीख असेल तर URL मध्ये जोडा

    const response = await fetch(url, {
      headers: { 'Authorization': getSecurityPass() }
    });
    if (!response.ok) throw new Error('Failed to fetch chat history');
    return await response.json();
  },

  // 🟢 पिकाची सविस्तर माहिती आणणे
  async getCycleDetails(cycleId) {
    const response = await fetch(`${API_BASE}/cycles/${cycleId}`, {
      headers: { 'Authorization': getSecurityPass() }
    });
    if (!response.ok) throw new Error('Failed to fetch cycle details');
    return await response.json();
  },

  // 🟢 सर्व पिके आणणे (List)
  async getFarmerCycles() {
    const response = await fetch(`${API_BASE}/cycles`, {
      headers: { 'Authorization': getSecurityPass() }
    });
    if (!response.ok) throw new Error('Failed to fetch cycles');
    return await response.json();
  },

  // 🟢 पिकाची अपूर्ण माहिती भरणे (Missing Info Update)
  async updateCycle(cycleId, updates) {
    const response = await fetch(`${API_BASE}/farmer/cycle/${cycleId}`, {
      method: 'PUT',
      headers: { 
        'Authorization': getSecurityPass(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updates)
    });
    if (!response.ok) throw new Error('Update failed');
    return await response.json();
  },
  
  // 🟢 (Optional) हिशोब अपडेट करणे
  async updateLedger(ledgerId, updates) {
    const response = await fetch(`${API_BASE}/farmer/ledger/${ledgerId}`, {
      method: 'PUT',
      headers: { 
        'Authorization': getSecurityPass(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updates)
    });
    if (!response.ok) throw new Error('Ledger update failed');
    return await response.json();
  }
};