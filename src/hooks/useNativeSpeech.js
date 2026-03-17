import { useState, useEffect, useRef } from 'react';

export const useNativeSpeech = (options = { lang: 'mr-IN', continuous: true }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.lang = options.lang || 'mr-IN';
    // 'continuous: true' ensures it doesn't stop when you pause to breathe
    recognition.continuous = options.continuous !== undefined ? options.continuous : true;
    recognition.interimResults = true; 

    recognition.onstart = () => {
      setIsListening(true);
      setTranscript('');
    };

    // Safely combine confirmed words (final) with guessing words (interim)
    recognition.onresult = (event) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = 0; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }
      // Combine them so you don't lose the previous words
      setTranscript(finalTranscript + ' ' + interimTranscript);
    };

    recognition.onerror = (event) => {
      console.error("Speech Recognition Error:", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [options.lang, options.continuous]);

  // Toggle function so the user can click the mic again to manually stop it
  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch (e) {
          console.warn("Mic is already running.");
        }
      } else {
        alert("तुमच्या फोन/ब्राउझरमध्ये व्हॉइस टायपिंग उपलब्ध नाही.");
      }
    }
  };

  return { isListening, transcript, toggleListening };
};