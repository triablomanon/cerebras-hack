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

# Carbon calculation using Climatiq API
import os
import requests

CLIMATIQ_API_URL = "https://api.climatiq.io/estimate"
CLIMATIQ_HEADERS = {
    "Authorization": f"Bearer {os.getenv('CLIMATIQ_API_KEY')}",
    "Content-Type": "application/json"
}

def calculate_carbon_with_climatiq(transport_mode, distance_km):
    """Calculate carbon emissions using Climatiq API"""
    payload = {
        "emission_factor": {
            "transport": transport_mode,
            "unit": "km"
        },
        "quantity": distance_km
    }
    
    try:
        response = requests.post(CLIMATIQ_API_URL, 
                               headers=CLIMATIQ_HEADERS,
                               json=payload,
                               timeout=10)
        response.raise_for_status()
        return response.json().get('co2e', 0)
    except Exception as e:
        # Fallback to static factors if API fails
        return CARBON_FACTORS.get(transport_mode, 0.21) * distance_km
def call_llama_api(user_message, trip_context=None):
    """Call Llama API for intelligent chatbot responses"""
    if not LLAMA_API_KEY:
        return None, "API key not configured"
    
    try:
        # Prepare the context for the AI
        system_prompt = """You are an eco-friendly travel assistant that systematically helps users plan complete itineraries with minimal carbon impact.

        YOUR PROCESS:
        1. Ask questions until you gather: list of cities they want to visit, preferred transportation modes, travel dates
        2. If they mention cities without specifying order, tell them you'll optimize the route for minimal emissions
        3. Once you have enough information, provide a complete itinerary with travel options between each city pair

        WHEN PROVIDING ITINERARIES, include for each city-to-city segment:
        - Available transportation modes: car, train, plane
        - Distance for each mode (in km)
        - Estimated travel time for each mode
        - Recommended eco-friendly option

        RESPONSE FORMAT for complete itineraries:
        "Here's your optimized eco-friendly itinerary:

        🗺️ **Route**: [City 1] → [City 2] → [City 3]

        **[City 1] to [City 2]:**
        • Car: [X] km, [Y] hours
        • Train: [X] km, [Y] hours ⭐ (Recommended - lower emissions)
        • Flight: [X] km, [Y] hours

        **[City 2] to [City 3]:**
        [Similar format]

        💡 **Eco Tip**: [Specific advice about the route]"

        IMPORTANT:
        - Always prioritize trains over flights when available
        - Provide realistic distances and times
        - Continue to accept updates and modifications
        - Ask clarifying questions if information is missing
        - Be conversational and helpful"""
        
        # Build the conversation context
        messages = [
            {"role": "system", "content": system_prompt}
        ]
        
        # Add trip context if available
        if trip_context and trip_context.get('destinations'):
            destinations = trip_context.get('destinations', [])
            context = f"""Current trip planning status:
            - {len(destinations)} destinations already identified: {', '.join([d.get('name', 'Unknown') for d in destinations])}
            - Transportation preference: {trip_context.get('transportation', 'Not specified')}
            - Any specific requirements: {trip_context.get('requirements', 'None specified')}
            
            Use this information to build upon the existing plan or help refine it."""
            messages.append({"role": "system", "content": context})
        
        # Add user message
        messages.append({"role": "user", "content": user_message})
        
        # Call Llama API (adjust URL and format based on your Llama service)
        headers = {
            "Authorization": f"Bearer {LLAMA_API_KEY}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "model": "Llama-4-Maverick-17B-128E-Instruct-FP8",
            "messages": messages,
            "max_completion_tokens": 500,
            "temperature": 0.7
        }
        
        # Use the correct Llama API endpoint
        endpoint = "https://api.llama.com/v1/chat/completions"
        
        try:
            response = requests.post(endpoint, headers=headers, json=payload, timeout=10)
            if response.status_code == 200:
                result = response.json()
                return result["completion_message"]["content"]["text"], None
            else:
                return None, f"API request failed with status {response.status_code}: {response.text}"
        except Exception as e:
            return None, f"Error making API request: {str(e)}"
        
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
        test_response, error = call_llama_api("What country is Paris in?")
        
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
    
@app.route('/api/route-options', methods=['POST'])
def route_options():
    try:
        data = request.get_json()
        from_city = data.get('from')
        to_city = data.get('to')
        from_coords = data.get('from_coords')  # dict: {'lat': ..., 'lng': ...}
        to_coords = data.get('to_coords')

        distance = calculate_distance(from_coords['lat'], from_coords['lng'],
                                      to_coords['lat'], to_coords['lng'])

        results = []
        for mode in ['train', 'car', 'flight']:
            duration = round(distance / {
                'car': 80, 'train': 120, 'flight': 700
            }.get(mode, 80), 1)
            emissions = round(distance * CARBON_FACTORS[mode], 2)

            results.append({
                'mode': mode,
                'distance_km': round(distance, 2),
                'duration_hr': duration,
                'carbon_kg': emissions,
                'recommended': (mode == 'train')
            })

        return jsonify({
            'from': from_city,
            'to': to_city,
            'options': results
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500


def get_fallback_response(user_message, trip_context):
    """Fallback response when Llama API is not available"""
    message_lower = user_message.lower()
    
    # Check if user has started planning
    has_destinations = trip_context and trip_context.get('destinations')
    
    # Systematic itinerary gathering responses
    if any(word in message_lower for word in ['plan', 'trip', 'itinerary', 'travel']):
        if not has_destinations:
            return """I'd love to help you plan an eco-friendly trip! 🌱 To create the best sustainable itinerary, I need to know:

1. **Which cities would you like to visit?** (e.g., "New York, Chicago, San Francisco")
2. **Do you have a preferred order, or should I optimize for minimal emissions?**
3. **Any transportation preferences?** (train, car, avoid flights, etc.)
4. **Approximate travel dates?** (optional but helpful)

What destinations are you thinking about?"""
        else:
            return "I see you already have some destinations planned! Would you like me to help optimize your route for minimal emissions, or do you want to add/modify cities in your itinerary?"
    
    elif any(word in message_lower for word in ['cities', 'destinations', 'places']):
        return "Great! Which cities are you interested in visiting? Just list them and I'll help optimize the route for minimal carbon impact. For example: 'I want to visit Boston, Chicago, and Denver.'"
    
    elif any(word in message_lower for word in ['train', 'rail']):
        return "Excellent choice! 🚂 Trains are one of the most eco-friendly ways to travel. Which cities would you like to connect by train? I can provide distances and travel times for rail routes."
    
    elif any(word in message_lower for word in ['flight', 'fly']):
        return "I understand flights are sometimes necessary for long distances. 💭 Which cities are you looking to travel between? I can suggest the most eco-friendly alternatives and compare car/train/flight options with distances."
    
    elif any(word in message_lower for word in ['distance', 'time', 'how far']):
        return "I can help calculate distances and travel times between cities! Which route are you asking about? Just mention the two cities and I'll provide car, train, and flight options with distances."
    
    elif any(word in message_lower for word in ['optimize', 'order', 'route']):
        return "I can optimize your route for minimal emissions! 🔄 What cities do you want to visit? I'll arrange them in the most eco-friendly order and provide travel options between each stop."
    
    else:
        return """Hello! I'm your eco-friendly travel assistant. 🌍 I help plan itineraries that minimize carbon impact.

To get started, tell me:
- **Which cities you'd like to visit**
- I'll optimize the route for minimal emissions
- Provide car/train/flight options with distances for each leg

Try saying: "I want to visit [City A], [City B], and [City C]" or "Plan a trip from [City] to [City]" """

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
