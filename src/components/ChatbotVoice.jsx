import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import Lottie from 'react-lottie-player';
import avatarAnimation from './avatar-animation.json';
import './ChatBot.css';

function ChatbotVoice() {
  const [isListening, setIsListening] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const bottomRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const fileInputRef = useRef(null);

  // 🎙️ Start/Stop recording
  const handleToggleRecording = async () => {
    if (isListening) {
      mediaRecorderRef.current.stop();
      setIsListening(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        chunksRef.current = [];

        mediaRecorder.ondataavailable = (e) => chunksRef.current.push(e.data);
        mediaRecorder.onstop = async () => {
          const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
          const file = new File([blob], 'recording.webm', { type: 'audio/webm' });
          await handleFileUpload(file);
        };

        mediaRecorderRef.current = mediaRecorder;
        mediaRecorder.start();
        setIsListening(true);
      } catch (err) {
        console.error('🎙️ Mic access error:', err);
        setChatHistory((prev) => [...prev, { role: 'bot', content: 'Unable to access microphone.' }]);
      }
    }
  };

  // 📤 File Upload Handler (mic or manual)
  const handleFileUpload = async (file) => {
    console.log("📤 Uploading file:", file.name, file.type, `${(file.size / 1024).toFixed(2)} KB`);
    const formData = new FormData();
    formData.append('file', file);

    try {
      // Step 1: Transcribe audio
      const transcribeRes = await axios.post('http://localhost:8000/transcribe', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 30000,
      });

      const userText = transcribeRes.data.transcription;
      if (!userText) throw new Error("No transcription returned");

      // Step 2: Call /ask to get answer
      const askRes = await axios.post('http://localhost:8000/ask', {
        query: userText
      });

      const botText = askRes.data.answer;

      // Step 3: Get TTS audio
      const ttsRes = await axios.post('http://localhost:8000/tts', {
        query: botText
      }, { responseType: 'blob' });

      const audioBlob = new Blob([ttsRes.data], { type: 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(audioBlob);

      setChatHistory((prev) => [
        ...prev,
        { role: 'user', content: userText },
        { role: 'bot', content: botText },
      ]);

      const audio = new Audio(audioUrl);
      audio.play();

    } catch (err) {
      console.error('❌ Voice chat error:', err);
      if (err.response) {
        console.error("🔁 Response status:", err.response.status);
        console.error("🔁 Response data:", err.response.data);
      }
      setChatHistory((prev) => [...prev, { role: 'bot', content: 'Something went wrong.' }]);
    }
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  return (
    <div className="chat-history">
      <div style={{ textAlign: 'center', marginBottom: 10 }}>
        <Lottie loop play animationData={avatarAnimation} style={{ width: 200, height: 280 }} />
        <button onClick={handleToggleRecording} className="sidebar-button" style={{ marginTop: 10 }}>
          {isListening ? 'Stop Listening' : 'Start Speaking'}
        </button>
        <br />
        <input
          type="file"
          accept="audio/*"
          style={{ marginTop: 10 }}
          ref={fileInputRef}
          onChange={(e) => {
            if (e.target.files.length > 0) {
              handleFileUpload(e.target.files[0]);
            }
          }}
        />
      </div>

      {chatHistory.map((msg, i) => (
        <div key={i} className={msg.role === 'user' ? 'user-msg' : 'bot-msg'}>
          <strong>{msg.role === 'user' ? 'You' : 'Bot'}:</strong> {msg.content}
        </div>
      ))}
      <div ref={bottomRef}></div>
    </div>
  );
}

export default ChatbotVoice;
