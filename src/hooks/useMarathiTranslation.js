// hooks/useMarathiTranslation.js

import { useState } from "react";

export const useMarathiTranslation = () => {
  const [loading, setLoading] = useState(false);

  const translateToMarathi = async (text) => {
    if (!text) return text;
    const isEnglish = (text) => /^[A-Za-z\s]+$/.test(text);

    if(!isEnglish){
      return text;
    }
    
    try {
      setLoading(true);

      const res = await fetch(
        `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=mr&dt=t&q=${encodeURIComponent(text)}`
      );

      const data = await res.json();
      return data[0][0][0];

    } catch (error) {
      console.error("Translation failed:", error);
      return text; // fallback
    } finally {
      setLoading(false);
    }
  };

  return { translateToMarathi, loading };
};