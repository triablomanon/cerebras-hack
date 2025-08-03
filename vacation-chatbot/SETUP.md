# EcoTrip Setup Guide

This guide will help you set up the EcoTrip application with all necessary dependencies and API keys.

## Prerequisites

- **Python 3.8+**: [Download Python](https://www.python.org/downloads/)
- **Node.js 14+**: [Download Node.js](https://nodejs.org/)
- **Git**: [Download Git](https://git-scm.com/)

## Step 1: Clone and Navigate

```bash
cd vacation-chatbot
```

## Step 2: Install Python Dependencies

```bash
pip install -r requirements.txt
```

If you get a "pip not found" error:
1. Make sure Python is installed and added to your PATH
2. Try using `python -m pip install -r requirements.txt`

## Step 3: Install Node.js Dependencies

```bash
npm install
```

## Step 4: Get API Keys

### Llama API Key
You need a Llama API key for the intelligent chatbot. Get one from:

1. **Groq** (Recommended - Fast & Free):
   - Visit [console.groq.com](https://console.groq.com/)
   - Sign up for a free account
   - Create an API key
   - Copy the key (starts with `gsk_...`)

2. **Perplexity**:
   - Visit [www.perplexity.ai](https://www.perplexity.ai/)
   - Sign up and go to API settings
   - Create an API key

3. **Llama API**:
   - Visit [api.llama.com](https://api.llama.com/)
   - Sign up and get your API key

### Google Maps API Key
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable these APIs:
   - Maps JavaScript API
   - Places API
   - Directions API
4. Create credentials (API key)
5. Copy the API key

## Step 5: Create Environment File

Create a `.env` file in the project root:

```env
LLAMA_API_KEY=your_llama_api_key_here
GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
FLASK_ENV=development
```

**Example:**
```env
LLAMA_API_KEY=gsk_abc123def456ghi789jkl012mno345pqr678stu901vwx234yz
GOOGLE_MAPS_API_KEY=AIzaSyB1234567890abcdefghijklmnopqrstuvwxyz
FLASK_ENV=development
```

## Step 6: Generate HTML Files

Run the HTML generator to create the necessary files with your API keys:

```bash
python generate_html.py
```

You should see output like:
```
🔧 Generating HTML files with API keys...
✅ Generated public/index.html
✅ Generated public/map.html

📋 Summary:
   LLAMA_API_KEY: ✅ Loaded
   GOOGLE_MAPS_API_KEY: ✅ Loaded
   API Key length: 47 characters
   API Key preview: gsk_abc123...

🚀 HTML files generated successfully!
   You can now run: python app.py
```

## Step 7: Start the Application

### Option A: Run Both Frontend and Backend (Recommended)

**Terminal 1 - Backend:**
```bash
python app.py
```

**Terminal 2 - Frontend:**
```bash
npm start
```

### Option B: Run Only Backend (Simpler)

```bash
python app.py
```

Then visit: `http://localhost:5000/app`

## Step 8: Verify Everything Works

1. **Check API Status**: Visit `http://localhost:5000/api/debug-env`
2. **Test Llama API**: Visit `http://localhost:5000/api/test-llama`
3. **Access Main App**: Visit `http://localhost:5000/app`

## Troubleshooting

### Common Issues

**"pip not found"**
```bash
# Try these alternatives:
python -m pip install -r requirements.txt
# or
py -m pip install -r requirements.txt
```

**"GOOGLE_MAPS_API_KEY loaded: No"**
- Check your `.env` file format (no spaces around `=`)
- Ensure the key is valid
- Run `python generate_html.py` again

**"LLAMA_API_KEY loaded: No"**
- Verify your API key is correct
- Check that the key starts with the right prefix (e.g., `gsk_` for Groq)

**Map not loading**
- Check browser console for errors
- Verify Google Maps API key is valid
- Ensure you ran `python generate_html.py`

**Chatbot not responding**
- Check Llama API key validity
- Visit debug endpoint: `http://localhost:5000/api/debug-env`

### Debug Commands

```bash
# Check environment variables
python -c "from dotenv import load_dotenv; import os; load_dotenv(); print('LLAMA:', bool(os.getenv('LLAMA_API_KEY'))); print('MAPS:', bool(os.getenv('GOOGLE_MAPS_API_KEY')))"

# Test HTML generation
python generate_html.py

# Check Flask server
python app.py
```

## File Structure After Setup

```
vacation-chatbot/
├── .env                    # Your API keys (create this)
├── public/
│   ├── index.html         # Generated with your API keys
│   └── map.html           # Generated with your API keys
├── src/                   # React components
├── app.py                 # Flask backend
├── generate_html.py       # HTML generator
├── requirements.txt       # Python dependencies
└── package.json          # Node.js dependencies
```

## Next Steps

Once everything is working:

1. **Test the Chatbot**: Try asking about travel plans
2. **Test the Map**: Add destinations and see them on the map
3. **Explore Features**: Try different conversation topics
4. **Customize**: Modify the code to add your own features

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Verify all API keys are correct
3. Ensure all dependencies are installed
4. Check the debug endpoints for error messages 