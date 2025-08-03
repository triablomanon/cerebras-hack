# EcoTrip Planner

A web application for planning trips with minimal carbon impact. Features an intelligent chatbot for travel planning and an interactive Google Maps interface to visualize your eco-friendly route.

## Features

- 🤖 **AI-Powered Chatbot**: Get personalized eco-friendly travel recommendations using Llama API
- 🗺️ **Interactive Maps**: Visualize your trip route with Google Maps integration
- 🌱 **Carbon Footprint Calculator**: Track and minimize your travel emissions
- 🚂 **Sustainable Transportation**: Get suggestions for trains, public transit, and other low-carbon options
- 📊 **Trip Optimization**: Automatically optimize your route for minimal environmental impact

## Prerequisites

- Node.js (v14 or higher)
- Python 3.8 or higher
- Google Maps API key
- Llama API key (from Groq, Perplexity, or Llama API)

## Setup Instructions

### 1. Clone and Navigate
```bash
cd vacation-chatbot
```

### 2. Environment Configuration
Create a `.env` file in the project root with your API keys:

```env
LLAMA_API_KEY=your_llama_api_key_here
GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
FLASK_ENV=development
```

**API Key Sources:**
- **Llama API**: Get from [Groq](https://console.groq.com/), [Perplexity](https://www.perplexity.ai/), or [Llama API](https://api.llama.com/)
- **Google Maps API**: Get from [Google Cloud Console](https://console.cloud.google.com/)

### 3. Generate HTML Files
Run the HTML generator script to create the necessary HTML files with your API keys:

```bash
python generate_html.py
```

This script will:
- Read your API keys from the `.env` file
- Generate `public/index.html` with the correct Google Maps API key
- Generate `public/map.html` with the correct Google Maps API key
- Show a summary of loaded API keys

### 4. Frontend Setup (React)
```bash
# Install dependencies
npm install

# Start the development server
npm start
```

The frontend will be available at `http://localhost:3000`

### 5. Backend Setup (Python Flask)
```bash
# Install Python dependencies
pip install -r requirements.txt

# Start the Flask server
python app.py
```

The backend API will be available at `http://localhost:5000`

### 6. Access the Application
- **Main App**: Visit `http://localhost:5000/app` (served by Flask)
- **API Debug**: Visit `http://localhost:5000/api/debug-env` to check API key status

## Usage

1. **Start a Conversation**: Use the chatbot to describe your travel plans
2. **Get AI Recommendations**: Receive intelligent, eco-friendly suggestions for transportation, accommodations, and activities
3. **View Your Route**: See your trip visualized on the interactive map
4. **Optimize Your Trip**: Let the system suggest route optimizations to reduce carbon footprint
5. **Track Impact**: Monitor your trip's environmental impact with real-time carbon calculations

## Example Conversations

- "I want to visit Paris, Amsterdam, and Berlin"
- "Show me eco-friendly hotels in London"
- "What's the carbon footprint of flying vs taking the train?"
- "Plan a sustainable European route"
- "Tell me about sustainable travel options in Japan"

## API Endpoints

- `POST /api/chat` - Chat with the AI-powered travel assistant
- `GET /api/debug-env` - Check environment variables and API key status
- `GET /api/test-llama` - Test Llama API connectivity
- `GET /app` - Serve the main React application
- `GET /map.html` - Serve the standalone map interface

## Project Structure

```
vacation-chatbot/
├── public/
│   ├── index.html          # Main HTML file (generated with API keys)
│   └── map.html            # Standalone map interface (generated with API keys)
├── src/
│   ├── components/
│   │   ├── Chatbot.js      # AI-powered chatbot component
│   │   ├── Map.js          # Map component (iframe-based)
│   │   ├── Header.js       # App header with branding
│   │   ├── TripSummary.js  # Trip overview and carbon impact
│   │   └── ErrorBoundary.js # Error handling component
│   ├── App.js              # Main React component
│   ├── App.css             # Styling for the entire app
│   └── index.js            # React entry point
├── app.py                  # Flask backend server with AI integration
├── generate_html.py        # HTML generator script
├── requirements.txt        # Python dependencies
├── package.json           # Node.js dependencies
├── .env                   # Environment variables (create this)
└── .gitignore            # Git ignore rules
```

## Technologies Used

- **Frontend**: React, Google Maps JavaScript API (iframe isolation)
- **Backend**: Python Flask, python-dotenv, requests
- **AI**: Llama API integration (Groq/Perplexity/Llama API)
- **Styling**: Custom CSS with responsive design
- **Icons**: Font Awesome

## Troubleshooting

### Common Issues

1. **"GOOGLE_MAPS_API_KEY loaded: No"**
   - Ensure your `.env` file contains `GOOGLE_MAPS_API_KEY=your_key_here`
   - Run `python generate_html.py` again after updating `.env`

2. **"LLAMA_API_KEY loaded: No"**
   - Ensure your `.env` file contains `LLAMA_API_KEY=your_key_here`
   - Check that your API key is valid

3. **Map not loading**
   - Verify your Google Maps API key is valid
   - Check browser console for API errors
   - Ensure you've run `python generate_html.py`

4. **Chatbot not responding**
   - Check that your Llama API key is valid
   - Visit `http://localhost:5000/api/debug-env` to verify API status

### Debug Endpoints

- `http://localhost:5000/api/debug-env` - Check all environment variables
- `http://localhost:5000/api/test-llama` - Test Llama API connectivity

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the MIT License.
