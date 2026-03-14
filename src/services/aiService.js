// src/services/aiService.js

// This is where we keep the special passcodes to talk to the Sarvam translators.
// If the passcodes are missing while we are building the building, the clerk will use a "demo mode" 
// so the office doesn't stop working.
const getSarvamKey = () => localStorage.getItem('sm_sarvam_key') || '';

export const aiService = {
  
  // ── 1. THE EARS (Listening to the Farmer) ──
  async listenToMarathi(audioBlob) {
    const key = getSarvamKey();
    if (!key) {
      console.log("Passcode missing. Using backup browser microphone.");
      throw new Error("fallback_to_browser"); 
    }

    // We package the voice recording into a neat parcel to send to the translator
    const parcel = new FormData();
    parcel.append('file', audioBlob, 'voice.webm');
    parcel.append('model', 'saaras:v2');
    parcel.append('language_code', 'mr-IN');

    try {
      const response = await fetch('https://api.sarvam.ai/speech-to-text', {
        method: 'POST',
        headers: { 'api-subscription-key': key },
        body: parcel
      });
      
      const reply = await response.json();
      return reply.transcript || '';
    } catch (error) {
      console.log("The translator is busy. Using backup.");
      throw new Error("fallback_to_browser");
    }
  },

  // ── 2. THE MOUTH (Speaking to the Farmer) ──
  async speakMarathi(text) {
    const key = getSarvamKey();
    if (!key || !text) return null;

    try {
      // We send the written words and ask for an audio recording back
      const response = await fetch('https://api.sarvam.ai/text-to-speech', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-subscription-key': key
        },
        body: JSON.stringify({
          inputs: [text],
          target_language_code: 'mr-IN',
          speaker: 'anushka', // The voice of our receptionist
          model: 'bulbul:v1'
        })
      });

      const reply = await response.json();
      // If we get an audio recording back, we play it on the office speakers
      if (reply.audios && reply.audios[0]) {
        const audio = new Audio("data:audio/wav;base64," + reply.audios[0]);
        audio.play();
        return true;
      }
    } catch (error) {
      console.log("The speaker is unplugged. The farmer will just read the screen.");
    }
    return false;
  },

  // ── 3. THE BRAIN (Understanding and Doing the Math) ──
  async askManager(farmerMessage, currentDeskFiles) {
    // We give the manager a strict briefing before they answer.
    const briefingFolder = `
      तू शेतकरी मित्र आहेस. फक्त मराठीत उत्तरे दे.
      शेतकऱ्याचे नाव: ${currentDeskFiles.user?.name || 'शेतकरी'}
      जिल्हा: ${currentDeskFiles.user?.district || 'महाराष्ट्र'}
      
      नेहमी या अचूक नमुन्यात (फॉर्ममध्ये) उत्तर दे:
      {
        "voice_text": "वाचण्यासाठी १-२ सोपी मराठी वाक्ये",
        "display_text": "स्क्रीनवर दाखवण्यासाठी सविस्तर माहिती",
        "intent": "EXPENSE_LOG किंवा INCOME_LOG किंवा GENERAL",
        "chart": { "type": "pie", "data": [{"name": "खत", "value": 1500}] },
        "action": { "type": "ADD_LEDGER", "amount": 1500, "category": "खते" }
      }
    `;

    const key = getSarvamKey();
    
    // If we haven't bought the permanent passcodes yet, the manager uses their 
    // own common sense (Demo Mode) to keep the office running smoothly.
    if (!key) {
      return this.useManagerCommonSense(farmerMessage);
    }

    try {
      // Sending the briefing folder and the farmer's question to the Sarvam Brain
      const response = await fetch('https://api.sarvam.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-subscription-key': key
        },
        body: JSON.stringify({
          model: "sarvam-105b", // The Indian-language expert manager
          messages: [
            { role: "system", content: briefingFolder },
            { role: "user", content: farmerMessage }
          ],
          temperature: 0.3 // Keep the manager focused and strict, not creative
        })
      });

      const reply = await response.json();
      const managerForm = reply.choices[0].message.content;
      
      // We read the form the manager filled out
      return JSON.parse(managerForm);

    } catch (error) {
      console.log("Manager is on a break. Using common sense.");
      return this.useManagerCommonSense(farmerMessage);
    }
  },

  // ── 4. THE BACKUP PLAN (Demo Mode Logic) ──
  // If the internet drops or keys are missing, the office doesn't close. 
  // It handles the most common farmer requests automatically.
  useManagerCommonSense(message) {
    const text = message.toLowerCase();
    
    // Scenario 1: The farmer bought fertilizer
    if (text.includes('खत') || text.includes('युरिया') || text.includes('dap')) {
      return {
        voice_text: "मी खताचा खर्च नोंदवला आहे.",
        display_text: "तुमच्या पिकासाठी खताचा खर्च यशस्वीरित्या नोंदवला गेला आहे.",
        intent: "EXPENSE_LOG",
        saved: true,
        chart: {
          type: "pie",
          data: [
            { name: "खते", value: 1500 },
            { name: "बियाणे", value: 3000 },
            { name: "मजुरी", value: 1000 }
          ]
        },
        action: {
          type: "ADD_LEDGER",
          payload: { type: 'expense', amount: 1500, category: 'खते', title: 'खत खरेदी' }
        }
      };
    }
    
    // Scenario 2: The farmer wants the market price
    if (text.includes('भाव') || text.includes('बाजार') || text.includes('दर')) {
      return {
        voice_text: "आज पिंपळगाव मार्केटमध्ये सर्वात चांगला भाव चालू आहे.",
        display_text: "आज कांद्याला पिंपळगावमध्ये सर्वाधिक ₹२,२०० भाव मिळत आहे.",
        intent: "MARKET_QUERY",
        saved: false,
        chart: { type: "none" },
        action: { type: "NONE" }
      };
    }

    // Default friendly reply
    return {
      voice_text: "माफ करा, मला समजले नाही. पुन्हा सांगाल का?",
      display_text: "मला तुमची नोंद समजली नाही. कृपया पुन्हा प्रयत्न करा.",
      intent: "GENERAL",
      saved: false,
      chart: { type: "none" },
      action: { type: "NONE" }
    };
  }
};