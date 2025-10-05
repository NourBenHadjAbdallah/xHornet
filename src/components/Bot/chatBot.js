import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User } from 'lucide-react';
import './chatbotStyle.css';

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "👋 Bonjour! Je suis votre assistant crypto alimenté par Gemini. Comment puis-je vous aider aujourd'hui?",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => { scrollToBottom(); }, [messages]);
  useEffect(() => { if (isOpen && inputRef.current) inputRef.current.focus(); }, [isOpen]);

  // 🔹 Ask Gemini via preload bridge
  const getBotResponse = async (userMessage) => {
    try {
      const reply = await window.geminiAPI.ask(userMessage);
      return reply;
    } catch (error) {
      console.error('Gemini API Error:', error);
      return "Je n'arrive pas à obtenir une réponse pour le moment 😔.";
    }
  };

  const handleSendMessage = async () => {
    if (inputText.trim() === '') return;

    const userMessage = {
      id: Date.now(),
      text: inputText,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    // Ask Gemini
    const replyText = await getBotResponse(inputText);

    const botResponse = {
      id: Date.now() + 1,
      text: replyText,
      sender: 'bot',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, botResponse]);
    setIsTyping(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickActions = [
    { id: 1, text: "Prix BTC ?", action: "Quel est le prix du Bitcoin ?" },
    { id: 2, text: "État du bot ?", action: "Quel est l'état du bot de trading ?" },
    { id: 3, text: "Aide trading", action: "Comment trader efficacement ?" },
    { id: 4, text: "Meme coins ?", action: "Quelles sont les meilleures meme coins actuelles ?" }
  ];

  const handleQuickAction = (action) => {
    setInputText(action);
    setTimeout(() => handleSendMessage(), 100);
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button className="chatbot-float-btn" onClick={() => setIsOpen(true)} aria-label="Open chat">
          <MessageCircle size={24} />
          <span className="chat-badge">1</span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="chatbot-window">
          {/* Header */}
          <div className="chatbot-header">
            <div className="chatbot-header-content">
              <div className="bot-avatar">
                <Bot size={20} />
              </div>
              <div>
                <h3>Assistant Crypto</h3>
                <p className="bot-status"><span className="status-dot"></span> En ligne</p>
              </div>
            </div>
            <button className="chatbot-close-btn" onClick={() => setIsOpen(false)} aria-label="Close chat">
              <X size={20} />
            </button>
          </div>

          {/* Messages */}
          <div className="chatbot-messages">
            {messages.map((message) => (
              <div key={message.id} className={`message ${message.sender === 'user' ? 'message-user' : 'message-bot'}`}>
                <div className="message-avatar">
                  {message.sender === 'user' ? <User size={16} /> : <Bot size={16} />}
                </div>
                <div className="message-content">
                  <div className="message-text">{message.text}</div>
                  <div className="message-time">
                    {message.timestamp.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="message message-bot">
                <div className="message-avatar"><Bot size={16} /></div>
                <div className="message-content">
                  <div className="typing-indicator"><span></span><span></span><span></span></div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions */}
          {messages.length <= 2 && (
            <div className="chatbot-quick-actions">
              {quickActions.map(action => (
                <button key={action.id} className="quick-action-btn" onClick={() => handleQuickAction(action.action)}>
                  {action.text}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="chatbot-input-container">
            <input
              ref={inputRef}
              type="text"
              className="chatbot-input"
              placeholder="Tapez votre message..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <button className="chatbot-send-btn" onClick={handleSendMessage} disabled={inputText.trim() === ''}>
              <Send size={20} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
