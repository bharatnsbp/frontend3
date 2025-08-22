import React, { useState, Suspense } from 'react';
import ChatBot from './components/ChatBot';
import ChatbotVoice from './components/ChatbotVoice';
import './components/ChatBot.css';
import Logo from './components/Logo.jpg'; // Ensure this exists in src/

function App() {
  const [mode, setMode] = useState('');

  return (
    <div className="chatbot-wrapper">
      {/* Sidebar shown always */}
      <div className="sidebar">
        <img src={Logo} alt="Unilever Logo" className="avatar" />
        <button className="sidebar-button" onClick={() => setMode('text')}>
          Text Chat
        </button>
        <button className="sidebar-button" onClick={() => setMode('voice')}>
          Video Chat
        </button>
      </div>

      {/* Chat area shows content */}
      <div className="chat-area">
        <Suspense fallback={<div className="loading">Loading assistant...</div>}>
          {mode === 'text' && <ChatBot />}
          {mode === 'voice' && <ChatbotVoice />}
          {!mode && (
            <div className="chat-placeholder">
              <h2>Welcome to the <span style={{ color: '#00c4cc' }}>AI Logistics Training Assistant</span></h2>
              <p>Please choose a mode from the left panel to get started.</p>
            </div>
          )}
        </Suspense>
      </div>
    </div>
  );
}

export default App;
