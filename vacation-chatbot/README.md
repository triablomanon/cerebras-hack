# EcoTrip Planner

A web application for planning trips with minimal carbon impact. Features an intelligent chatbot for travel planning and an interactive Google Maps interface to visualize your eco-friendly route.

## Features

- 🤖 **AI-Powered Chatbot**: Get personalized eco-friendly travel recommendations
- 🗺️ **Interactive Maps**: Visualize your trip route with Google Maps integration
- 🌱 **Carbon Footprint Calculator**: Track and minimize your travel emissions
- 🚂 **Sustainable Transportation**: Get suggestions for trains, public transit, and other low-carbon options
- 📊 **Trip Optimization**: Automatically optimize your route for minimal environmental impact

## Prerequisites

- Node.js (v14 or higher)
- Python 3.8 or higher
- Google Maps API key

## Setup Instructions

### 1. Clone and Navigate
```bash
cd vacation-chatbot
```

### 2. Frontend Setup (React)
```bash
# Install dependencies
npm install

# Start the development server
npm start
```

The frontend will be available at `http://localhost:3000`

### 3. Backend Setup (Python Flask)
```bash
# Install Python dependencies
pip install -r requirements.txt

# Start the Flask server
python app.py
```

The backend API will be available at `http://localhost:5000`

### 4. Google Maps Configuration

1. Get a Google Maps API key from the [Google Cloud Console](https://console.cloud.google.com/)
2. Enable the following APIs:
   - Maps JavaScript API
   - Places API
   - Directions API
3. Replace `YOUR_API_KEY` in `public/index.html` with your actual API key

## Usage

1. **Start a Conversation**: Use the chatbot to describe your travel plans
2. **Get Recommendations**: Receive eco-friendly suggestions for transportation, accommodations, and activities
3. **View Your Route**: See your trip visualized on the interactive map
4. **Optimize Your Trip**: Let the system suggest route optimizations to reduce carbon footprint
5. **Track Impact**: Monitor your trip's environmental impact with real-time carbon calculations

## Example Conversations

- "I want to visit Paris, Amsterdam, and Berlin"
- "Show me eco-friendly hotels in London"
- "What's the carbon footprint of flying vs taking the train?"
- "Plan a sustainable European route"

## API Endpoints

- `POST /api/calculate-carbon` - Calculate carbon footprint for a trip
- `POST /api/suggestions` - Get eco-friendly travel suggestions
- `POST /api/optimize-route` - Optimize route for minimal carbon impact

## Project Structure

```
vacation-chatbot/
├── public/
│   └── index.html          # Main HTML file with Google Maps API
├── src/
│   ├── components/
│   │   ├── Chatbot.js      # Main chatbot component
│   │   ├── Map.js          # Google Maps integration
│   │   ├── Header.js       # App header with branding
│   │   └── TripSummary.js  # Trip overview and carbon impact
│   ├── App.js              # Main React component
│   ├── App.css             # Styling for the entire app
│   └── index.js            # React entry point
├── app.py                  # Flask backend server
├── requirements.txt        # Python dependencies
└── package.json           # Node.js dependencies
```

## Technologies Used

- **Frontend**: React, Google Maps JavaScript API
- **Backend**: Python Flask, Flask-CORS
- **Styling**: Custom CSS with responsive design
- **Icons**: Font Awesome

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the MIT License.
