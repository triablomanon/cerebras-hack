# EcoTrip Planner - Intelligent Chatbot Setup

## 🚀 Quick Setup

### 1. Install Python Dependencies
```bash
# Install Python if not already installed
# Download from: https://www.python.org/downloads/

# Install dependencies
pip install flask flask-cors python-dotenv requests
```

### 2. Set Up Environment Variables
Create a `.env` file in the `vacation-chatbot` directory:

```env
LLAMA_API_KEY=your_llama_api_key_here
FLASK_ENV=development
```

### 3. Get Your Llama API Key
You can get a Llama API key from one of these services:

- **Groq** (recommended): https://console.groq.com/
  - Free tier available
  - Supports Llama models
  - Fast response times

- **Perplexity**: https://www.perplexity.ai/
  - Free tier available
  - Good for travel recommendations

- **Llama API**: https://llama-api.com/
  - Direct Llama API access

### 4. Start the Backend
```bash
# Start the Flask backend
python app.py
```

### 5. Start the Frontend
In a new terminal:
```bash
# Start the React frontend
npm start
```

## 🎯 How It Works

### Intelligent Chatbot Features:
- **Real AI Responses**: Uses Llama API for natural conversations
- **Trip Context Awareness**: Remembers your current trip plan
- **Eco-Friendly Focus**: Specialized in sustainable travel advice
- **Fallback System**: Works even if API is unavailable

### API Endpoints:
- `POST /api/chat` - Intelligent chatbot responses
- `POST /api/calculate-carbon` - Carbon footprint calculations
- `POST /api/suggestions` - Eco-friendly travel suggestions
- `POST /api/optimize-route` - Route optimization

### Conversation Examples:
- "I want to plan a trip to California"
- "What's the most eco-friendly way to get there?"
- "Suggest some green hotels in San Francisco"
- "Calculate the carbon footprint of my trip"
- "What activities can I do that are good for the environment?"

## 🔧 Troubleshooting

### If you get "pip not found":
1. Install Python from https://www.python.org/downloads/
2. Make sure to check "Add Python to PATH" during installation
3. Restart your terminal/command prompt

### If the chatbot doesn't respond intelligently:
1. Check that your `.env` file has the correct API key
2. Verify the API key is valid and has credits
3. Check the browser console for error messages
4. The system will fall back to simple responses if the API fails

### If the map doesn't load:
1. Check that the Google Maps API key is valid
2. Ensure the map.html file is in the public directory
3. Check browser console for any errors

## 🌱 Features

- **Real-time AI Chat**: Natural conversations about eco-friendly travel
- **Interactive Map**: Visual trip planning with Google Maps
- **Carbon Calculations**: Track your environmental impact
- **Route Optimization**: Find the most efficient paths
- **Sustainable Suggestions**: Get eco-friendly recommendations

Enjoy planning your eco-friendly adventures! 🌍✈️ 