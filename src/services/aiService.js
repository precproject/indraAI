export const aiService = {
  getConfig() {
    try {
      return JSON.parse(localStorage.getItem('sm_config')) || {};
    } catch {
      return {};
    }
  },

  // ── 1. THE EARS (Sarvam Speech-to-Text) ──
  async sttSarvam(audioBlob) {
    const cfg = this.getConfig();
    if (!cfg.sarvamKey) throw new Error('Sarvam API key is missing');

    const formData = new FormData();
    formData.append('file', audioBlob, 'audio.webm');
    formData.append('model', 'saaras:v2');
    formData.append('language_code', 'mr-IN');
    formData.append('with_timestamps', 'false');
    formData.append('with_disfluencies', 'false');

    const res = await fetch('https://api.sarvam.ai/speech-to-text', {
      method: 'POST',
      headers: { 'api-subscription-key': cfg.sarvamKey },
      body: formData
    });

    if (!res.ok) throw new Error('Sarvam STT failed');
    const data = await res.json();
    return data.transcript || '';
  },

  // ── 2. THE MOUTH (Sarvam Text-to-Speech) ──
  async ttsSarvam(text) {
    const cfg = this.getConfig();
    if (!cfg.sarvamKey) return null;

    const res = await fetch('https://api.sarvam.ai/text-to-speech', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-subscription-key': cfg.sarvamKey
      },
      body: JSON.stringify({
        inputs: [text],
        target_language_code: 'mr-IN',
        speaker: cfg.speaker || 'anushka',
        pitch: 0,
        pace: 0.85,
        loudness: 1.5,
        speech_sample_rate: 22050,
        enable_preprocessing: true,
        model: 'bulbul:v1'
      })
    });

    if (!res.ok) return null;
    const data = await res.json();
    if (data.audios && data.audios[0]) {
      return data.audios[0];
    }
    return null;
  },

  async playAudio(text) {
    if (!text) return;
    try {
      const base64Audio = await this.ttsSarvam(text);
      if (base64Audio) {
        const binary = atob(base64Audio);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
        const blob = new Blob([bytes], { type: 'audio/wav' });
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        await audio.play();
        return;
      }
    } catch (error) {
      console.log('Audio playback failed, falling back to browser voice.');
    }
    
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'mr-IN';
      window.speechSynthesis.speak(utterance);
    }
  },

  // ── 3. THE BRAIN (Sarvam Chat LLM for the Farmer App) ──
  async getChatResponse(userText, userProfile, activeCycles, marketData) {
    const cfg = this.getConfig();
    if (!cfg.sarvamKey) throw new Error('Sarvam API key is missing');

    const cyclesSummary = activeCycles.map(c => ({ id: c.id, crop: c.crop, phase: c.currentPhase }));

    const systemPrompt = `You are "IndraAI" (इंद्र AI), a smart farm manager for Maharashtra. Reply ONLY in Marathi.
Farmer: ${userProfile.name} | District: ${userProfile.district} | Active Crops: ${JSON.stringify(cyclesSummary)}

You MUST reply with a strict JSON format exactly like this, nothing else:
{
  "voice_text": "वाचण्यासाठी १-२ सोपी मराठी वाक्ये",
  "display_text": "स्क्रीनवर दाखवण्यासाठी सविस्तर माहिती",
  "intent": "EXPENSE_LOG|INCOME_LOG|MARKET_QUERY|GENERAL",
  "chart": { "type": "pie|none", "data": [] },
  "action": { "type": "ADD_LEDGER|NONE", "payload": null },
  "tip": "short tip"
}`;

    const res = await fetch('https://api.sarvam.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-subscription-key': cfg.sarvamKey
      },
      body: JSON.stringify({
        model: 'sarvam-105b',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userText }
        ],
        temperature: 0.3
      })
    });

    if (!res.ok) throw new Error('Sarvam Brain error');

    const data = await res.json();
    const rawText = data.choices[0].message.content.trim();
    
    try {
      const cleanJson = rawText.replace(/```json|```/g, '').trim();
      return JSON.parse(cleanJson);
    } catch (e) {
      return {
        voice_text: 'माफ करा, मला समजले नाही.',
        display_text: 'माफ करा, तांत्रिक अडचण आली आहे.',
        intent: 'GENERAL',
        chart: { type: 'none' },
        action: { type: 'NONE' }
      };
    }
  },

  // ── 4. THE LIBRARIAN (Sarvam Data Analyst for Company Dashboard) ──
  async analyzeCompanyQuery(companyQuestion, warehouseDataSummary) {
    const cfg = this.getConfig();
    if (!cfg.sarvamKey) throw new Error('Sarvam API key is missing');

    const systemPrompt = `You are a strict data analyst for an agricultural company. 
I will give you a summary of the real receipts from our warehouse (Firebase) and a manager's question.
Answer the manager's question accurately based ONLY on the data provided. Write the answer clearly and professionally. Do not make up any numbers.

WAREHOUSE DATA SUMMARY:
${JSON.stringify(warehouseDataSummary)}`;

    const res = await fetch('https://api.sarvam.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-subscription-key': cfg.sarvamKey
      },
      body: JSON.stringify({
        model: 'sarvam-105b',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: companyQuestion }
        ],
        temperature: 0.1 // Extremely strict, no making up facts
      })
    });

    if (!res.ok) throw new Error('Sarvam Analyst error');
    const data = await res.json();
    return data.choices[0].message.content.trim();
  },

  async testConnection() {
    const cfg = this.getConfig();
    const results = { claude: true, sarvam: false }; // We bypass Claude test now since it's removed

    if (cfg.sarvamKey) {
      try {
        const res = await fetch('https://api.sarvam.ai/text-to-speech', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'api-subscription-key': cfg.sarvamKey },
          body: JSON.stringify({ inputs: ['test'], target_language_code: 'mr-IN', speaker: 'anushka', model: 'bulbul:v1' })
        });
        results.sarvam = res.ok;
      } catch { results.sarvam = false; }
    }
    return results;
  }
};