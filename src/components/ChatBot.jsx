import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './ChatBot.css';

function ChatBot() {
  const [query, setQuery] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const bottomRef = useRef(null);

  const handleAsk = async () => {
    if (!query.trim()) return;

    setChatHistory(prev => [...prev, { role: 'user', content: query }]);

    try {
      const res = await axios.post('http://localhost:8000/ask', { query });
      const botResponse = res.data.answer;
      setChatHistory(prev => [...prev, { role: 'bot', content: botResponse }]);
    } catch (error) {
      console.error('Error:', error);
      setChatHistory(prev => [...prev, { role: 'bot', content: 'Something went wrong.' }]);
    }

    setQuery('');
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  return (
    <>
      <div className="chat-history">
        {chatHistory.map((msg, index) => (
          <div key={index} className={msg.role === 'user' ? 'user-msg' : 'bot-msg'}>
            <span>{msg.content}</span>
          </div>
        ))}
        <div ref={bottomRef}></div>
      </div>

      <div className="input-box">
        <input
          type="text"
          placeholder="Type a message"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
        />
        <button onClick={handleAsk}>Send</button>
      </div>
    </>
  );
}

export default ChatBot;
