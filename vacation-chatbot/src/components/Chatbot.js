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
          conversation_history: conversationHistory.slice(-10) // Send last 10 messages for context
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error calling chatbot API:', error);
      return null;
    }
  };

  const simulateBotResponse = async (userMessage) => {
    setIsTyping(true);
    
    try {
      // Call the intelligent API
      const apiResponse = await sendMessageToAPI(userMessage);
      
      let botResponse;
      if (apiResponse && apiResponse.response) {
        botResponse = apiResponse.response;
        
        // Check if API returned itinerary data
        if (apiResponse.itinerary) {
          console.log('Received itinerary data:', apiResponse.itinerary);
          
          // Calculate predominant transport mode from eco-friendly selections
          const getPredominantTransport = (segments) => {
            if (!segments || segments.length === 0) return 'car';
            
            const transportCounts = {};
            segments.forEach(segment => {
              if (segment.transport_options && segment.transport_options.length > 0) {
                // Find the most eco-friendly option
                const ecoOption = segment.transport_options.reduce((best, current) => 
                  current.carbon_kg < best.carbon_kg ? current : best
                );
                transportCounts[ecoOption.mode] = (transportCounts[ecoOption.mode] || 0) + 1;
              }
            });
            
            // Return the mode that appears most frequently
            return Object.keys(transportCounts).reduce((a, b) => 
              transportCounts[a] > transportCounts[b] ? a : b, 'car'
            );
          };
          
          // Update trip data with new cities and transport options
          const newTripData = {
            ...tripData,
            destinations: apiResponse.itinerary.cities.map((city, index) => ({
              id: index + 1,
              name: city.name,
              lat: city.lat,
              lng: city.lng
            })),
            segments: apiResponse.itinerary.segments,
            transportation: getPredominantTransport(apiResponse.itinerary.segments)
          };
          
          onTripUpdate(newTripData);
        }
      } else {
        // Fallback to simple responses
        botResponse = "error";
      }

      setIsTyping(false);
      setMessages(prev => [...prev, {
        text: botResponse,
        sender: 'bot',
        timestamp: new Date()
      }]);
      
      // Add bot response to conversation history
      setConversationHistory(prev => [...prev, {
        role: 'assistant',
        content: botResponse,
        timestamp: new Date().toISOString()
      }]);
      
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

  const handleSendMessage = () => {
    if (input.trim()) {
      const newMessage = {
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
