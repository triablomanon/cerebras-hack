import React, { useState, useRef, useEffect } from 'react';

function Chatbot({ onTripUpdate, tripData, onLocationSelect, hasItinerary }) {
  const [messages, setMessages] = useState([
    {
      text: "Hello! I'm your eco-friendly travel assistant. 🌱 I can help you plan a trip with minimal carbon impact. Where would you like to go?",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  
  // Store conversation history for API context
  const [conversationHistory, setConversationHistory] = useState([]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const sendMessageToAPI = async (userMessage) => {
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          trip_context: tripData,
          has_itinerary: hasItinerary,
          conversation_history: conversationHistory.slice(-10) // Send last 10 messages for context
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        // Return error message from API
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      return { success: true, response: data.response };
    } catch (error) {
      console.error('Error calling chatbot API:', error);
      return { success: false, error: error.message };
    }
  };

  const simulateBotResponse = async (userMessage) => {
    setIsTyping(true);
    
    try {
      // Call the intelligent API
      const apiResult = await sendMessageToAPI(userMessage);
      
      let botResponse;
      if (apiResult.success) {
        botResponse = apiResult.response;
      } else {
        // Show API error to user
        botResponse = `I'm sorry, I'm having trouble connecting to my AI service right now. Error: ${apiResult.error}. Please try again in a moment.`;
      }

      // Check if the response contains destination information
      let newTripData = { ...tripData };
      
      // Simple destination detection (you can enhance this)
      const lowerMessage = userMessage.toLowerCase();
      if (lowerMessage.includes('california') || lowerMessage.includes('san francisco') || lowerMessage.includes('los angeles')) {
        newTripData.destinations = [
          { name: 'San Francisco, CA', lat: 37.7749, lng: -122.4194, id: 1 }
        ];
      } else if (lowerMessage.includes('new york') || lowerMessage.includes('nyc') || lowerMessage.includes('manhattan')) {
        newTripData.destinations = [
          { name: 'New York City, NY', lat: 40.7128, lng: -74.0060, id: 1 }
        ];
      } else if (lowerMessage.includes('seattle') || lowerMessage.includes('washington')) {
        newTripData.destinations = [
          { name: 'Seattle, WA', lat: 47.6062, lng: -122.3321, id: 1 }
        ];
      } else if (lowerMessage.includes('multi') || lowerMessage.includes('several') || lowerMessage.includes('route') || lowerMessage.includes('cross country')) {
        newTripData.destinations = [
          { name: 'San Francisco, CA', lat: 37.7749, lng: -122.4194, id: 1 },
          { name: 'Denver, CO', lat: 39.7392, lng: -104.9903, id: 2 },
          { name: 'Chicago, IL', lat: 41.8781, lng: -87.6298, id: 3 },
          { name: 'New York City, NY', lat: 40.7128, lng: -74.0060, id: 4 }
        ];
        newTripData.transportation = 'train';
        newTripData.carbonImpact = { value: 68, unit: 'kg CO₂', savings: '60% less than flying' };
      }

      setIsTyping(false);
      
      const botMessage = {
        text: botResponse,
        sender: 'bot',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botMessage]);
      
      // Add bot response to conversation history
      setConversationHistory(prev => [...prev, {
        role: 'assistant',
        content: botResponse,
        timestamp: new Date().toISOString()
      }]);

      // Update trip data if destinations were added
      if (newTripData.destinations.length > 0) {
        onTripUpdate(newTripData);
      }
      
    } catch (error) {
      console.error('Error in bot response:', error);
      setIsTyping(false);
      setMessages(prev => [...prev, {
        text: `I'm sorry, there was an unexpected error: ${error.message}. Please try again in a moment.`,
        sender: 'bot',
        timestamp: new Date()
      }]);
    }
  };

  const handleSendMessage = () => {
    if (input.trim()) {
      const userMessage = {
        text: input.trim(),
        sender: 'user',
        timestamp: new Date()
      };

      // Add to conversation history for API context
      setConversationHistory(prev => [...prev, {
        role: 'user',
        content: input.trim(),
        timestamp: new Date().toISOString()
      }]);

      setMessages(prev => [...prev, userMessage]);
      simulateBotResponse(input.trim());
      setInput('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickSuggestions = [
    "Plan a cross-country US route",
    "Show me eco-friendly hotels",
    "Calculate carbon footprint",
    "Suggest green activities"
  ];

  const handleQuickSuggestion = (suggestion) => {
    setInput(suggestion);
  };

  return (
    <div className="chatbot">
      <div className="chatbot-header">
        <h2 className="chatbot-title">
          <i className="fas fa-robot"></i>
          EcoTrip Assistant
        </h2>
        <p className="chatbot-subtitle">
          Get personalized eco-friendly travel recommendations
        </p>
      </div>

      <div className="chat-messages">
        {messages.map((message, index) => (
          <div key={index} className={`message ${message.sender} fade-in`}>
            <div className="message-avatar">
              {message.sender === 'user' ? (
                <i className="fas fa-user"></i>
              ) : (
                <i className="fas fa-leaf"></i>
              )}
            </div>
            <div className="message-content">
              {message.text}
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="message bot fade-in">
            <div className="message-avatar">
              <i className="fas fa-leaf"></i>
            </div>
            <div className="typing-indicator">
              <span>EcoBot is typing</span>
              <div className="typing-dots">
                <div className="typing-dot"></div>
                <div className="typing-dot"></div>
                <div className="typing-dot"></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {messages.length === 1 && (
        <div className="quick-suggestions" style={{ marginBottom: '1rem' }}>
          <div style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.5rem' }}>
            Quick suggestions:
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {quickSuggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleQuickSuggestion(suggestion)}
                style={{
                  padding: '0.5rem 0.75rem',
                  background: '#f1f5f9',
                  border: '1px solid #e2e8f0',
                  borderRadius: '20px',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => {
                  e.target.style.background = '#e2e8f0';
                }}
                onMouseOut={(e) => {
                  e.target.style.background = '#f1f5f9';
                }}
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="chat-input">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask about eco-friendly travel options..."
          disabled={isTyping}
        />
        <button 
          onClick={handleSendMessage} 
          disabled={!input.trim() || isTyping}
        >
          <i className="fas fa-paper-plane"></i>
          Send
        </button>
      </div>
    </div>
  );
}

export default Chatbot;
