import React, { useState, useRef, useEffect } from 'react';

function Chatbot({ onTripUpdate, tripData, onLocationSelect }) {
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
          trip_context: tripData
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.response;
    } catch (error) {
      console.error('Error calling chatbot API:', error);
      return null;
    }
  };

  const simulateBotResponse = async (userMessage) => {
    setIsTyping(true);
    
    try {
      // Call the intelligent API
      const aiResponse = await sendMessageToAPI(userMessage);
      
      // If API call fails, fall back to simple responses
      let botResponse = aiResponse;
      
      if (!aiResponse) {
        botResponse = getFallbackResponse(userMessage);
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
      setMessages(prev => [...prev, {
        text: botResponse,
        sender: 'bot',
        timestamp: new Date()
      }]);

      // Update trip data if destinations were added
      if (newTripData.destinations.length > 0) {
        onTripUpdate(newTripData);
      }
      
    } catch (error) {
      console.error('Error in bot response:', error);
      setIsTyping(false);
      setMessages(prev => [...prev, {
        text: "I'm sorry, I'm having trouble connecting right now. Please try again in a moment.",
        sender: 'bot',
        timestamp: new Date()
      }]);
    }
  };

  const getFallbackResponse = (userMessage) => {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('california') || lowerMessage.includes('san francisco') || lowerMessage.includes('los angeles')) {
      return "California is perfect for eco-conscious travelers! 🌱 I recommend taking the train along the coast or using electric vehicle rentals. Would you like me to suggest some sustainable accommodations and activities?";
    } else if (lowerMessage.includes('new york') || lowerMessage.includes('nyc') || lowerMessage.includes('manhattan')) {
      return "New York City is fantastic for sustainable travel! 🗽 The subway system is excellent for getting around with minimal carbon impact. Plus, there are many eco-friendly hotels and local food options.";
    } else if (lowerMessage.includes('seattle') || lowerMessage.includes('washington')) {
      return "Seattle is a leader in sustainability! ♻️ The city has great public transit, bike-sharing programs, and is surrounded by beautiful nature. Perfect for eco-friendly exploration!";
    } else if (lowerMessage.includes('multi') || lowerMessage.includes('several') || lowerMessage.includes('route') || lowerMessage.includes('cross country')) {
      return "A cross-country US route sounds amazing! 🚂 I suggest: San Francisco → Denver → Chicago → New York. This route has good train connections and many eco-friendly stops. Would you like me to show this route on the map?";
    } else if (lowerMessage.includes('train') || lowerMessage.includes('rail')) {
      return "Excellent choice! 🚂 Trains are one of the most eco-friendly ways to travel. They produce up to 75% less CO₂ than flights for similar distances. Which destinations are you considering?";
    } else if (lowerMessage.includes('flight') || lowerMessage.includes('fly')) {
      return "I understand flights are sometimes necessary for long distances. 💭 Would you consider train alternatives for part of your journey? I can suggest hybrid itineraries that minimize flying while still reaching your dream destinations.";
    } else if (lowerMessage.includes('accommodation') || lowerMessage.includes('hotel') || lowerMessage.includes('stay')) {
      return "For eco-friendly accommodations, I recommend looking for: 🏨 Green certifications (LEED, Green Key), hotels with renewable energy, locally-sourced food, and bike rental services. Would you like specific recommendations for your destination?";
    } else if (lowerMessage.includes('carbon') || lowerMessage.includes('co2') || lowerMessage.includes('emission')) {
      return "I can help calculate your trip's carbon footprint! ⚡ Based on your transportation choices, accommodation, and activities. Would you like me to compare different travel options for your planned destinations?";
    } else {
      return "That sounds interesting! 🌍 Could you tell me more about your preferred destinations? I can help you plan an eco-friendly route with sustainable transportation options and green accommodations.";
    }
  };

  const handleSendMessage = () => {
    if (input.trim()) {
      const newMessage = {
        text: input.trim(),
        sender: 'user',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, newMessage]);
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
