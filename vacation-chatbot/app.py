from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import json
import math
import os
import requests
from dotenv import load_dotenv
from datetime import datetime

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# Get API key from environment
LLAMA_API_KEY = os.getenv('LLAMA_API_KEY')
GOOGLE_MAPS_API_KEY = os.getenv('GOOGLE_MAPS_API_KEY')

# Debug logging
print(f"🔍 Environment check:")
print(f"   Current working directory: {os.getcwd()}")
print(f"   .env file exists: {os.path.exists('.env')}")
print(f"   LLAMA_API_KEY loaded: {'Yes' if LLAMA_API_KEY else 'No'}")
print(f"   GOOGLE_MAPS_API_KEY loaded: {'Yes' if GOOGLE_MAPS_API_KEY else 'No'}")
if LLAMA_API_KEY:
    print(f"   API key length: {len(LLAMA_API_KEY)} characters")
    print(f"   API key starts with: {LLAMA_API_KEY[:10]}...")

# Simple carbon footprint calculation factors (kg CO2 per km)
CARBON_FACTORS = {
    'car': 0.21,        # Average car
    'train': 0.041,     # European trains
    'bus': 0.089,       # Long-distance bus
    'flight': 0.255,    # Domestic flights
    'walking': 0.0,     # No emissions
    'bicycle': 0.0      # No emissions
}

def call_llama_api(user_message, trip_context=None):
    """Call Llama API for intelligent chatbot responses"""
    if not LLAMA_API_KEY:
        return None, "API key not configured"
    
    try:
        # Prepare the context for the AI
        system_prompt = """You are an eco-friendly travel assistant. Help users plan sustainable trips with minimal carbon impact. 
        
        Provide helpful, specific advice about:
        - Eco-friendly transportation options
        - Sustainable accommodations
        - Green activities and attractions
        - Carbon footprint reduction tips
        - Local environmental initiatives
        
        Be conversational, friendly, and informative. Suggest specific destinations, routes, and eco-friendly alternatives."""
        
        # Build the conversation context
        messages = [
            {"role": "system", "content": system_prompt}
        ]
        
        # Add trip context if available
        if trip_context:
            context = f"Current trip context: {json.dumps(trip_context, indent=2)}"
            messages.append({"role": "system", "content": context})
        
        # Add user message
        messages.append({"role": "user", "content": user_message})
        
        # Call Llama API (adjust URL and format based on your Llama service)
        headers = {
            "Authorization": f"Bearer {LLAMA_API_KEY}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "model": "llama-3.1-8b-instruct",  # Adjust model name as needed
            "messages": messages,
            "max_tokens": 500,
            "temperature": 0.7
        }
        
        # Try different Llama API endpoints
        api_endpoints = [
            "https://api.llama-api.com/chat/completions",
            "https://api.groq.com/openai/v1/chat/completions",  # Groq supports Llama models
            "https://api.perplexity.ai/chat/completions"  # Perplexity supports Llama models
        ]
        
        for endpoint in api_endpoints:
            try:
                response = requests.post(endpoint, headers=headers, json=payload, timeout=10)
                if response.status_code == 200:
                    result = response.json()
                    if 'choices' in result and len(result['choices']) > 0:
                        return result['choices'][0]['message']['content'], None
                elif response.status_code == 401:
                    continue  # Try next endpoint
            except Exception as e:
                continue  # Try next endpoint
        
        return None, "Unable to connect to Llama API"
        
    except Exception as e:
        return None, f"Error calling Llama API: {str(e)}"

def calculate_distance(lat1, lng1, lat2, lng2):
    """Calculate distance between two points using Haversine formula"""
    R = 6371  # Earth's radius in kilometers
    
    dlat = math.radians(lat2 - lat1)
    dlng = math.radians(lng2 - lng1)
    
    a = (math.sin(dlat/2) * math.sin(dlat/2) + 
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * 
         math.sin(dlng/2) * math.sin(dlng/2))
    
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
    distance = R * c
    
    return distance

@app.route('/')
def index():
    """Serve the main application"""
    return send_from_directory('public', 'index.html')

@app.route('/app')
def app_route():
    """Serve the main application"""
    return send_from_directory('public', 'index.html')

@app.route('/map.html')
def map_route():
    """Serve the standalone map interface"""
    return send_from_directory('public', 'map.html')

@app.route('/api/debug-env', methods=['GET'])
def debug_env():
    """Debug environment variables"""
    return jsonify({
        'current_directory': os.getcwd(),
        'env_file_exists': os.path.exists('.env'),
        'llama_api_key_configured': bool(LLAMA_API_KEY),
        'llama_api_key_length': len(LLAMA_API_KEY) if LLAMA_API_KEY else 0,
        'llama_api_key_preview': LLAMA_API_KEY[:10] + '...' if LLAMA_API_KEY else None,
        'google_maps_api_key_configured': bool(GOOGLE_MAPS_API_KEY),
        'google_maps_api_key_length': len(GOOGLE_MAPS_API_KEY) if GOOGLE_MAPS_API_KEY else 0,
        'google_maps_api_key_preview': GOOGLE_MAPS_API_KEY[:10] + '...' if GOOGLE_MAPS_API_KEY else None
    })

@app.route('/api/test-llama', methods=['GET'])
def test_llama():
    """Test if Llama API is working"""
    try:
        if not LLAMA_API_KEY:
            return jsonify({'error': 'No API key configured'}), 400
        
        # Simple test call
        test_response, error = call_llama_api("Say hello in one sentence")
        
        if error:
            return jsonify({'error': error}), 500
        
        return jsonify({
            'success': True,
            'response': test_response,
            'api_key_configured': bool(LLAMA_API_KEY)
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/chat', methods=['POST'])
def chat():
    """Intelligent chatbot endpoint using Llama API"""
    try:
        data = request.get_json()
        user_message = data.get('message', '')
        trip_context = data.get('trip_context', {})
        
        if not user_message:
            return jsonify({'error': 'Message is required'}), 400
        
        # Call Llama API for intelligent response
        ai_response, error = call_llama_api(user_message, trip_context)
        
        if error:
            # Fallback to simple keyword-based responses
            ai_response = get_fallback_response(user_message, trip_context)
        
        return jsonify({
            'response': ai_response,
            'timestamp': json.dumps(datetime.now().isoformat())
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def get_fallback_response(user_message, trip_context):
    """Fallback response when Llama API is not available"""
    message_lower = user_message.lower()
    
    # Simple keyword-based responses
    if any(word in message_lower for word in ['california', 'san francisco', 'los angeles']):
        return "California is perfect for eco-conscious travelers! 🌱 I recommend taking the train along the coast or using electric vehicle rentals. Would you like me to suggest some sustainable accommodations and activities?"
    
    elif any(word in message_lower for word in ['new york', 'nyc', 'manhattan']):
        return "New York City is fantastic for sustainable travel! 🗽 The subway system is excellent for getting around with minimal carbon impact. Plus, there are many eco-friendly hotels and local food options."
    
    elif any(word in message_lower for word in ['seattle', 'washington']):
        return "Seattle is a leader in sustainability! ♻️ The city has great public transit, bike-sharing programs, and is surrounded by beautiful nature. Perfect for eco-friendly exploration!"
    
    elif any(word in message_lower for word in ['train', 'rail']):
        return "Excellent choice! 🚂 Trains are one of the most eco-friendly ways to travel. They produce up to 75% less CO₂ than flights for similar distances. Which destinations are you considering?"
    
    elif any(word in message_lower for word in ['flight', 'fly']):
        return "I understand flights are sometimes necessary for long distances. 💭 Would you consider train alternatives for part of your journey? I can suggest hybrid itineraries that minimize flying while still reaching your dream destinations."
    
    elif any(word in message_lower for word in ['accommodation', 'hotel', 'stay']):
        return "For eco-friendly accommodations, I recommend looking for: 🏨 Green certifications (LEED, Green Key), hotels with renewable energy, locally-sourced food, and bike rental services. Would you like specific recommendations for your destination?"
    
    elif any(word in message_lower for word in ['carbon', 'co2', 'emission']):
        return "I can help calculate your trip's carbon footprint! ⚡ Based on your transportation choices, accommodation, and activities. Would you like me to compare different travel options for your planned destinations?"
    
    else:
        return "That sounds interesting! 🌍 Could you tell me more about your preferred destinations? I can help you plan an eco-friendly route with sustainable transportation options and green accommodations."

@app.route('/api/calculate-carbon', methods=['POST'])
def calculate_carbon():
    """Calculate carbon footprint for a trip"""
    try:
        data = request.get_json()
        destinations = data.get('destinations', [])
        transport_mode = data.get('transport_mode', 'car').lower()
        
        if len(destinations) < 2:
            return jsonify({'error': 'At least 2 destinations required'}), 400
        
        total_distance = 0
        route_segments = []
        
        # Calculate total distance
        for i in range(len(destinations) - 1):
            start = destinations[i]
            end = destinations[i + 1]
            
            distance = calculate_distance(
                start['lat'], start['lng'],
                end['lat'], end['lng']
            )
            
            total_distance += distance
            route_segments.append({
                'from': start['name'],
                'to': end['name'],
                'distance_km': round(distance, 2)
            })
        
        # Calculate carbon footprint
        carbon_factor = CARBON_FACTORS.get(transport_mode, CARBON_FACTORS['car'])
        total_carbon = total_distance * carbon_factor
        
        # Calculate savings compared to flying
        flight_carbon = total_distance * CARBON_FACTORS['flight']
        savings_percentage = ((flight_carbon - total_carbon) / flight_carbon * 100) if flight_carbon > 0 else 0
        
        result = {
            'total_distance_km': round(total_distance, 2),
            'transport_mode': transport_mode,
            'carbon_footprint_kg': round(total_carbon, 2),
            'carbon_per_km': carbon_factor,
            'route_segments': route_segments,
            'comparison': {
                'flight_carbon_kg': round(flight_carbon, 2),
                'savings_kg': round(flight_carbon - total_carbon, 2),
                'savings_percentage': round(savings_percentage, 1)
            }
        }
        
        return jsonify(result)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/suggestions', methods=['POST'])
def get_suggestions():
    """Get eco-friendly travel suggestions"""
    try:
        data = request.get_json()
        destination = data.get('destination', '').lower()
        preferences = data.get('preferences', [])
        
        # Sample eco-friendly suggestions
        suggestions = {
            'paris': {
                'transport': [
                    'Take the Eurostar from London (90% less CO2 than flying)',
                    'Use the extensive metro and bus system',
                    'Rent Vélib bicycles for short trips'
                ],
                'accommodation': [
                    'Hotel des Grands Boulevards (Green Key certified)',
                    'Le Citizen Hotel (solar panels, local sourcing)',
                    'Mama Shelter (waste reduction programs)'
                ],
                'activities': [
                    'Walking tour of historic neighborhoods',
                    'Visit Jardin du Luxembourg by foot',
                    'Picnic with local market produce'
                ]
            },
            'amsterdam': {
                'transport': [
                    'Take the train from major European cities',
                    'Rent a bicycle - Amsterdam has 400km of bike paths',
                    'Use the electric tram and bus network'
                ],
                'accommodation': [
                    'Conscious Hotel (carbon-neutral, organic breakfast)',
                    'Hotel V Fizeaustraat (Green Key, local partnerships)',
                    'ClinkNOORD (sustainable hostel with solar panels)'
                ],
                'activities': [
                    'Canal tour with electric boats',
                    'Visit Vondelpark by bike',
                    'Explore local farmers markets'
                ]
            }
        }
        
        # Default suggestions if destination not found
        default_suggestions = {
            'transport': [
                'Choose trains over planes when possible',
                'Use public transportation at destination',
                'Consider electric vehicle rentals'
            ],
            'accommodation': [
                'Look for Green Key or LEED certified hotels',
                'Choose accommodations with renewable energy',
                'Stay in locally-owned establishments'
            ],
            'activities': [
                'Explore on foot or by bicycle',
                'Support local businesses and markets',
                'Choose outdoor activities over indoor attractions'
            ]
        }
        
        result = suggestions.get(destination, default_suggestions)
        return jsonify(result)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/optimize-route', methods=['POST'])
def optimize_route():
    """Optimize route for minimal carbon impact"""
    try:
        data = request.get_json()
        destinations = data.get('destinations', [])
        transport_mode = data.get('transport_mode', 'car')
        
        if len(destinations) < 3:
            return jsonify({'optimized_route': destinations})
        
        # Simple optimization: sort by geographic proximity
        # Start with first destination, then find nearest unvisited destination
        optimized = [destinations[0]]
        remaining = destinations[1:]
        
        while remaining:
            current = optimized[-1]
            nearest_index = 0
            min_distance = float('inf')
            
            for i, dest in enumerate(remaining):
                distance = calculate_distance(
                    current['lat'], current['lng'],
                    dest['lat'], dest['lng']
                )
                if distance < min_distance:
                    min_distance = distance
                    nearest_index = i
            
            optimized.append(remaining.pop(nearest_index))
        
        # Calculate carbon savings
        original_carbon = calculate_route_carbon(destinations, transport_mode)
        optimized_carbon = calculate_route_carbon(optimized, transport_mode)
        savings = original_carbon - optimized_carbon
        
        return jsonify({
            'optimized_route': optimized,
            'original_carbon_kg': round(original_carbon, 2),
            'optimized_carbon_kg': round(optimized_carbon, 2),
            'carbon_savings_kg': round(savings, 2),
            'savings_percentage': round((savings / original_carbon * 100), 1) if original_carbon > 0 else 0
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def calculate_route_carbon(destinations, transport_mode):
    """Helper function to calculate total carbon for a route"""
    if len(destinations) < 2:
        return 0
    
    total_distance = 0
    for i in range(len(destinations) - 1):
        distance = calculate_distance(
            destinations[i]['lat'], destinations[i]['lng'],
            destinations[i + 1]['lat'], destinations[i + 1]['lng']
        )
        total_distance += distance
    
    carbon_factor = CARBON_FACTORS.get(transport_mode.lower(), CARBON_FACTORS['car'])
    return total_distance * carbon_factor

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
