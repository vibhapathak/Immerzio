import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

function CompleteTranslateVideoCall() {
  // State variables
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [translationOutput, setTranslationOutput] = useState('Translations will appear here...');
  const [isCallActive, setIsCallActive] = useState(false);
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [lastTranscript, setLastTranscript] = useState('');
  
  // Refs
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const socketRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const recognitionRef = useRef(null);
  const localStreamRef = useRef(null);
  const outputBoxRef = useRef(null);
  
  // Languages for floating words
  const languages = [
    "Hello", "Hallo", "こんにちは", "नमस्ते", "Bonjour", "Hola", "你好", "Привет", "مرحبا", "Ciao",
    "Olá", "สวัสดี", "안녕하세요", "Hej", "Salam", "Shalom", "Sawubona", "Halo", "Yassas", "Zdravo",
    "Merhaba", "Selamat", "Xin chào", "Kamusta", "Aloha", "Habari", "Tere", "Jambo", "Sveiki"
  ];
  
  const colors = ["pink", "lavender", "purple"];
  
  // WebRTC configuration
  const config = {
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
  };
  
  // Generate floating words
  const floatingWords = [];
  for (let i = 0; i < 50; i++) {
    const left = `${Math.random() * 100}%`;
    const animationDelay = `${Math.random() * 20}s`;
    const colorClass = colors[i % colors.length];
    const word = languages[i % languages.length];
    
    floatingWords.push(
      <span 
        key={i}
        className={`floating-word ${colorClass}`}
        style={{
          left: left,
          top: `${Math.random() * 100}vh`,
          animationDelay: animationDelay
        }}
      >
        {word}
      </span>
    );
  }
  
  // Translation function
  const translateText = async (text, targetLang) => {
    try {
      const res = await fetch(
        `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`
      );
      const data = await res.json();
      return data[0][0][0];
    } catch (error) {
      console.error('Translation error:', error);
      return text;
    }
  };
  
  // Text-to-speech function
  const speakText = (text, langCode) => {
    if (!window.speechSynthesis) return;
    
    const synth = window.speechSynthesis;
    const voices = synth.getVoices();
    
    if (!voices.length) {
      speechSynthesis.onvoiceschanged = () => speakText(text, langCode);
      return;
    }
    
    const utterance = new SpeechSynthesisUtterance(text);
    const selectedVoice = voices.find(v => v.lang.startsWith(langCode));
    if (selectedVoice) utterance.voice = selectedVoice;
    utterance.lang = langCode;
    synth.speak(utterance);
  };
  
  // Initialize speech recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser');
      return;
    }
    
    const recognition = new SpeechRecognition();
    recognition.interimResults = false;
    recognition.continuous = true;
    recognitionRef.current = recognition;
    
    // Initial voice system setup
    if (window.speechSynthesis) {
      speechSynthesis.onvoiceschanged = () => {
        speakText("Hi, voice system ready!", "en-US");
      };
    }
    
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (error) {
          console.error('Error stopping recognition:', error);
        }
      }
    };
  }, []);
  
  // Setup recognition event handlers
  useEffect(() => {
    if (!recognitionRef.current) return;
    
    const handleRecognitionResult = async (event) => {
      const transcript = Array.from(event.results)
        .map(result => result[0].transcript)
        .join("")
        .trim();
      
      if (!transcript || transcript === lastTranscript) return;
      setLastTranscript(transcript);
      
      const targetLang = selectedLanguage;
      if (!targetLang) return;
      
      const translatedText = await translateText(transcript, targetLang);
      
      setTranslationOutput(prev => {
        const newOutput = `${prev}
          <p><strong>You:</strong> ${transcript}</p>
          <p><strong>Translated:</strong> ${translatedText}</p>
        `;
        return newOutput;
      });
      
      // Scroll to bottom
      if (outputBoxRef.current) {
        outputBoxRef.current.scrollTop = outputBoxRef.current.scrollHeight;
      }
      
      speakText(translatedText, targetLang);
      
      if (socketRef.current) {
        socketRef.current.emit("translated-text", translatedText);
      }
    };
    
    const handleRecognitionStart = () => {
      console.log("🎤 Listening...");
      setIsRecognizing(true);
    };
    
    const handleRecognitionEnd = () => {
      console.log("🛑 Recognition ended.");
      setIsRecognizing(false);
      
      // Restart if still meant to be continuous
      if (recognitionRef.current && recognitionRef.current.continuous) {
        startRecognitionSafely();
      }
    };
    
    const handleRecognitionError = (event) => {
      console.error("❌ Recognition error:", event.error);
      if (event.error === "no-speech" && !isRecognizing) {
        setTimeout(() => startRecognitionSafely(), 1000);
      }
    };
    
    recognitionRef.current.onresult = handleRecognitionResult;
    recognitionRef.current.onstart = handleRecognitionStart;
    recognitionRef.current.onend = handleRecognitionEnd;
    recognitionRef.current.onerror = handleRecognitionError;
    
  }, [selectedLanguage, lastTranscript, isRecognizing]);
  
  // Clean up on component unmount
  useEffect(() => {
    return () => {
      // Stop all media tracks
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
      }
      
      // Close peer connection
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }
      
      // Disconnect socket
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
      
      // Stop speech recognition
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (error) {
          console.error('Error stopping recognition:', error);
        }
      }
    };
  }, []);
  
  // Start speech recognition safely
  const startRecognitionSafely = () => {
    if (!recognitionRef.current || isRecognizing) return;
    
    try {
      recognitionRef.current.lang = selectedLanguage;
      recognitionRef.current.start();
    } catch (error) {
      console.error('Error starting recognition:', error);
      setTimeout(() => startRecognitionSafely(), 1000);
    }
  };
  
  // Handle starting the call
  const handleStartCall = async () => {
    if (!selectedLanguage || !selectedCountry) {
      alert('Please select both language and country');
      return;
    }
    
    try {
      // Setup socket connection
      socketRef.current = io("http://localhost:6000");
      
      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localStreamRef.current = stream;
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      
      // Setup WebRTC peer connection
      const peerConnection = new RTCPeerConnection(config);
      peerConnectionRef.current = peerConnection;
      
      // Add local tracks to peer connection
      stream.getTracks().forEach(track => peerConnection.addTrack(track, stream));
      
      // Handle incoming tracks (remote video)
      peerConnection.ontrack = (event) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
        }
      };
      
      // Handle ICE candidates
      peerConnection.onicecandidate = (event) => {
        if (event.candidate && socketRef.current) {
          socketRef.current.emit("ice-candidate", event.candidate);
        }
      };
      
      // Socket event handlers
      socketRef.current.on("offer", async (offer) => {
        if (peerConnection.signalingState === "stable") {
          await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
          const answer = await peerConnection.createAnswer();
          await peerConnection.setLocalDescription(answer);
          socketRef.current.emit("answer", answer);
        }
      });
      
      socketRef.current.on("answer", async (answer) => {
        if (peerConnection.signalingState === "have-local-offer") {
          await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
        }
      });
      
      socketRef.current.on("ice-candidate", async (candidate) => {
        try {
          await peerConnection.addIceCandidate(candidate);
        } catch (err) {
          console.error("❌ ICE error:", err);
        }
      });
      
      socketRef.current.on("translated-text", (text) => {
        setTranslationOutput(prev => {
          const newOutput = `${prev}<p><strong>Peer:</strong> ${text}</p>`;
          return newOutput;
        });
        
        // Scroll to bottom
        if (outputBoxRef.current) {
          outputBoxRef.current.scrollTop = outputBoxRef.current.scrollHeight;
        }
        
        speakText(text, selectedLanguage);
      });
      
      // Create and send offer
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);
      socketRef.current.emit("offer", offer);
      
      // Start speech recognition
      startRecognitionSafely();
      
      setIsCallActive(true);
      
    } catch (error) {
      console.error('Error starting call:', error);
      alert('Failed to start call: ' + error.message);
    }
  };
  
  // Handle stopping listening
  const handleStopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (error) {
        console.error('Error stopping recognition:', error);
      }
    }
  };
  
  // Handle retry
  const handleRetry = () => {
    startRecognitionSafely();
  };

  return (
    <div>
      {/* Floating Words Background */}
      {floatingWords}
      
      {/* Main Container */}
      <div className="container">
        <h1>Live Translate Video Call</h1>
        
        {/* Video Panels */}
        <div className="video-container">
          <div className="video-wrapper">
            <video ref={localVideoRef} autoPlay muted></video>
            <div className="video-label">You</div>
          </div>
          <div className="video-wrapper">
            <video ref={remoteVideoRef} autoPlay></video>
            <div className="video-label">Remote User</div>
          </div>
        </div>
        
        {/* Language & Country Dropdowns */}
        <div className="dropdown-container">
          <div className="select-wrapper">
            <select
              id="language"
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              disabled={isCallActive}
            >
              <option value="" disabled>Select Language</option>
              <option value="en-US">English</option>
              <option value="hi-IN">Hindi</option>
              <option value="de-DE">German</option>
              <option value="ja-JP">Japanese</option>
              <option value="fr-FR">French</option>
              <option value="es-ES">Spanish</option>
              <option value="ru-RU">Russian</option>
              <option value="zh-CN">Chinese</option>
              <option value="ar-SA">Arabic</option>
              <option value="ko-KR">Korean</option>
              <option value="it-IT">Italian</option>
            </select>
          </div>
          
          <div className="select-wrapper">
            <select
              id="country"
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              disabled={isCallActive}
            >
              <option value="" disabled>Select Country</option>
              <option value="us">United States</option>
              <option value="in">India</option>
              <option value="de">Germany</option>
              <option value="jp">Japan</option>
              <option value="fr">France</option>
              <option value="es">Spain</option>
              <option value="ru">Russia</option>
              <option value="cn">China</option>
              <option value="sa">Saudi Arabia</option>
              <option value="kr">South Korea</option>
              <option value="it">Italy</option>
            </select>
          </div>
        </div>
        
        {/* Call Controls */}
        <div className="controls">
          <div className="button-group">
            <button 
              id="startBtn" 
              onClick={handleStartCall}
              disabled={isCallActive}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="5 3 19 12 5 21 5 3"></polygon>
              </svg>
              Start Call
            </button>
            
            <button 
              id="stopBtn" 
              onClick={handleStopListening}
              disabled={!isRecognizing}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="4" y="4" width="16" height="16" rx="2"></rect>
              </svg>
              Stop Listening
            </button>
            
            <button 
              id="retryBtn" 
              onClick={handleRetry}
              disabled={isRecognizing || !isCallActive}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"></path>
              </svg>
              Retry
            </button>
            
            <span 
              id="micIndicator" 
              className={isRecognizing ? 'mic-active' : ''}
            >
              🎤
            </span>
          </div>
          
          <div 
            id="translationOutput" 
            ref={outputBoxRef}
            dangerouslySetInnerHTML={{ __html: translationOutput }}
          ></div>
        </div>
      </div>
      
      {/* Integrated CSS */}
      <style jsx>{`
        /* Root variables */
        :root {
          --primary: #7e68c1;
          --primary-light: #a594d8;
          --primary-lighter: #e4d8ff;
          --bg-color: #fbf9ff;
          --bg-secondary: #f6f0ff;
          --text-dark: #4a4a4a;
          --shadow-color: rgba(126, 104, 193, 0.15);
        }
        
        /* Global styles */
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        /* Floating words animation */
        .floating-word {
          position: absolute;
          font-size: 24px;
          font-weight: bold;
          opacity: 0.22;
          animation: floatUp 25s linear infinite;
          white-space: nowrap;
          z-index: 0;
          pointer-events: none;
        }
        
        .floating-word.purple { color: #433878; }
        .floating-word.lavender { color: #E4B1F0; }
        .floating-word.pink { color: #FFE1FF; }
        
        @keyframes floatUp {
          0% { transform: translateY(100vh) scale(1); }
          100% { transform: translateY(-120vh) scale(1.2); }
        }
        
        /* Container styles */
      .container {
            width: 90%;
            max-width: 1200px;
            margin: 0 auto;
            padding: 60px 20px; /* Increased top padding to accommodate back button */
            font-family: 'Segoe UI', 'Roboto', sans-serif;
            color: var(--text-dark);
            min-height: 100vh;
            position: relative;
            z-index: 5;
          }
        
          h1 {
            font-size: 3.5rem;
            font-weight: 700;
            color: var(--primary);
            text-align: center;
            margin-bottom: 40px;
            letter-spacing: -0.5px;
            margin-top: -10px; /* Add top margin to prevent overlap with back button */
          }

        /* Video container styles */
        .video-container {
          display: flex;
          justify-content: center;
          gap: 30px;
          margin-bottom: 30px;
          flex-wrap: wrap;
        }
        
        .video-wrapper {
          position: relative;
        }
        
       video {
          width: 450px;
          height: 320px;
          border-radius: 12px;
          background-color: #f0ebff;
          box-shadow: 0 8px 20px var(--shadow-color);
          transition: transform 0.3s ease;
          border: 1px solid var(--primary-light);
}
        video:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 25px var(--shadow-color);
        }
        
        .video-label {
          position: absolute;
          bottom: -12px;
          left: 50%;
          transform: translateX(-50%);
          background-color: var(--primary);
          color: white;
          padding: 5px 15px;
          border-radius: 20px;
          font-size: 14px;
          font-weight: 500;
          box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
        }
        
        /* Dropdown styles */
        .dropdown-container {
          display: flex;
          justify-content: center;
          gap: 20px;
          margin-bottom: 30px;
          flex-wrap: wrap;
        }
        
        .select-wrapper {
          position: relative;
          width: 250px;
        }
        
        select {
          width: 100%;
          padding: 12px 20px;
          font-size: 15px;
          background-color: var(--bg-secondary);
          color: var(--primary);
          border: 1px solid var(--primary-light);
          border-radius: 8px;
          cursor: pointer;
          appearance: none;
          padding-right: 40px;
          box-shadow: 0 3px 8px var(--shadow-color);
        }
        
        .select-wrapper::after {
          content: "▼";
          position: absolute;
          right: 15px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--primary);
          pointer-events: none;
          font-size: 12px;
        }
        
        select:focus {
          outline: none;
          border-color: var(--primary);
          box-shadow: 0 0 0 3px rgba(126, 104, 193, 0.2);
        }
        
        /* Controls styles */
        .controls {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 20px;
          margin-top: 20px;
        }
        
        .button-group {
          display: flex;
          gap: 15px;
          flex-wrap: wrap;
          justify-content: center;
        }
        
        button {
          padding: 10px 20px;
          font-size: 15px;
          font-weight: 500;
          background-color: var(--bg-secondary);
          color: var(--primary);
          border: 1px solid var(--primary-light);
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          gap: 8px;
          box-shadow: 0 3px 8px var(--shadow-color);
        }
        
        button:hover {
          background-color: var(--primary);
          color: white;
          transform: translateY(-2px);
          box-shadow: 0 5px 12px var(--shadow-color);
        }
        
        button:active {
          transform: translateY(0);
          box-shadow: 0 2px 5px var(--shadow-color);
        }
        
        button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }
        
        #startBtn {
          background-color: var(--primary);
          color: white;
          border-color: var(--primary);
        }
        
        #startBtn:hover {
          background-color: #6a57a5;
        }
        
        #micIndicator {
          display: inline-flex;
          justify-content: center;
          align-items: center;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background-color: var(--bg-secondary);
          color: var(--primary);
          font-size: 18px;
          border: 1px solid var(--primary-light);
          box-shadow: 0 3px 8px var(--shadow-color);
        }
        
        .mic-active {
          animation: pulse 1.2s infinite;
          background-color: var(--primary-light) !important;
          color: white !important;
        }
        
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }
        
        #translationOutput {
          width: 100%;
          max-width: 800px;
          min-height: 100px;
          max-height: 300px;
          overflow-y: auto;
          padding: 20px;
          background-color: white;
          border-radius: 10px;
          box-shadow: 0 5px 15px var(--shadow-color);
          line-height: 1.6;
          font-size: 16px;
          border-left: 4px solid var(--primary);
          position: relative;
          z-index: 10;
        }
        
        /* Media queries */
      @media (max-width: 768px) {
  h1 {
    font-size: 2.3rem;
    margin-top: 10px;
  }
  
  .video-container {
    flex-direction: column;
    align-items: center;
  }
  
  video {
    width: 100%;
    max-width: 400px;
    height: auto;
    aspect-ratio: 4/3;
  }
  
  .select-wrapper {
    width: 100%;
  }
  
  .container {
    padding-top: 70px;
  }
}
      `}</style>
    </div>
  );
}

export default CompleteTranslateVideoCall;