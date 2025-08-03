#!/usr/bin/env python3
"""
HTML Generator Script
Generates index.html and map.html with the correct API keys from .env file
"""

import os
from dotenv import load_dotenv

def load_environment():
    """Load environment variables from .env file"""
    load_dotenv()
    return {
        'GOOGLE_MAPS_API_KEY': os.getenv('GOOGLE_MAPS_API_KEY'),
        'LLAMA_API_KEY': os.getenv('LLAMA_API_KEY')
    }

def generate_index_html(google_maps_api_key):
    """Generate index.html with the correct Google Maps API key"""
    
    html_template = f'''<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <link rel="icon" href="%PUBLIC_URL%/favicon.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#000000" />
    <meta
      name="description"
      content="EcoTrip - Sustainable Travel Planning"
    />
    <title>EcoTrip - Sustainable Travel Planning</title>
    
    <!-- Font Awesome -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    
    <!-- Google Maps API -->
    <script
      src="https://maps.googleapis.com/maps/api/js?key={google_maps_api_key or ''}&libraries=maps"
      defer
    ></script>
  </head>
  <body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root"></div>
  </body>
</html>'''
    
    return html_template

def generate_map_html(google_maps_api_key):
    """Generate map.html with the correct Google Maps API key"""
    
    # Use a different approach to avoid conflicts with CSS curly braces
    html_template = f'''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>EcoTrip Map</title>
    <style>
        body {{
            margin: 0;
            padding: 0;
            font-family: Arial, sans-serif;
            background-color: #f5f5f5;
        }}
        
        #map {{
            width: 100%;
            height: 100vh;
            background-color: #e8f5e8;
        }}
        
        .loading {{
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            font-size: 18px;
            color: #059669;
        }}
        
        .error {{
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            height: 100vh;
            padding: 2rem;
            text-align: center;
            background-color: #fef2f2;
            color: #dc2626;
        }}
        
        .error h2 {{
            margin-bottom: 1rem;
        }}
        
        .error p {{
            margin-bottom: 1rem;
            color: #64748b;
        }}
        
        .retry-btn {{
            padding: 0.5rem 1rem;
            background: #059669;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
        }}
        
        .retry-btn:hover {{
            background: #047857;
        }}
    </style>
</head>
<body>
    <div id="map">
        <div class="loading">
            <i class="fas fa-map-marked-alt" style="margin-right: 10px;"></i>
            Loading EcoTrip Map...
        </div>
    </div>

    <script>
        let map;
        let markers = [];
        let bounds;
        
        // Initialize the map
        function initMap() {{
            console.log('🗺️ Initializing Google Maps...');
            
            try {{
                // Create map centered on the United States
                map = new google.maps.Map(document.getElementById('map'), {{
                    center: {{ lat: 39.8283, lng: -98.5795 }},
                    zoom: 4,
                    styles: [
                        {{
                            featureType: 'poi',
                            elementType: 'labels',
                            stylers: [{{ visibility: 'off' }}]
                        }}
                    ]
                }});
                
                bounds = new google.maps.LatLngBounds();
                
                console.log('✅ Google Maps initialized successfully!');
                
            }} catch (error) {{
                console.error('❌ Error initializing map:', error);
                showError('Failed to initialize Google Maps. Please check your API key.');
            }}
        }}
        
        function showError(message) {{
            const mapDiv = document.getElementById('map');
            mapDiv.innerHTML = `
                <div class="error">
                    <h2><i class="fas fa-exclamation-triangle"></i> Map Error</h2>
                    <p>${{message}}</p>
                    <button class="retry-btn" onclick="location.reload()">
                        <i class="fas fa-redo"></i> Retry
                    </button>
                </div>
            `;
        }}
        
        // Update markers when destinations change
        function updateMarkers(destinations) {{
            console.log('🔄 Updating markers with destinations:', destinations);
            
            if (!map || !destinations || destinations.length === 0) {{
                console.log('⚠️ No destinations to display or map not ready');
                return;
            }}
            
            try {{
                // Clear existing markers
                markers.forEach(marker => marker.setMap(null));
                markers = [];
                bounds = new google.maps.LatLngBounds();
                
                console.log('🏷️ Adding', destinations.length, 'markers to map');
                
                destinations.forEach((destination, index) => {{
                    const position = {{
                        lat: parseFloat(destination.latitude),
                        lng: parseFloat(destination.longitude)
                    }};
                    
                    const marker = new google.maps.Marker({{
                        position: position,
                        map: map,
                        title: destination.name,
                        label: {{
                            text: (index + 1).toString(),
                            color: 'white',
                            fontWeight: 'bold'
                        }},
                        icon: {{
                            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                                <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <circle cx="16" cy="16" r="14" fill="#059669" stroke="white" stroke-width="2"/>
                                    <text x="16" y="20" text-anchor="middle" fill="white" font-size="12" font-weight="bold">${{index + 1}}</text>
                                </svg>
                            `),
                            scaledSize: new google.maps.Size(32, 32),
                            anchor: new google.maps.Point(16, 16)
                        }}
                    }});
                    
                    // Add click listener
                    marker.addListener('click', () => {{
                        console.log('📍 Marker clicked:', destination);
                        window.parent.postMessage({{
                            type: 'marker-clicked',
                            destination: destination
                        }}, '*');
                    }});
                    
                    markers.push(marker);
                    bounds.extend(position);
                }});
                
                // Fit map to show all markers
                if (markers.length > 0) {{
                    map.fitBounds(bounds);
                    
                    // If only one marker, zoom in a bit
                    if (markers.length === 1) {{
                        map.setZoom(12);
                    }}
                }}
                
                console.log('✅ Markers updated successfully!');
                
            }} catch (error) {{
                console.error('❌ Error updating markers:', error);
            }}
        }}
        
        // Listen for messages from parent window
        window.addEventListener('message', function(event) {{
            if (event.data.type === 'update-markers') {{
                console.log('📨 Received update-markers message:', event.data.destinations);
                updateMarkers(event.data.destinations);
            }}
        }});
        
        // Initialize map when Google Maps API is loaded
        window.initMap = initMap;
        
        // Check if Google Maps API is already loaded
        if (typeof google !== 'undefined' && google.maps) {{
            initMap();
        }}
    </script>
    
    <!-- Google Maps API -->
    <script
        src="https://maps.googleapis.com/maps/api/js?key={google_maps_api_key or ''}&callback=initMap"
        async
        defer
    ></script>
</body>
</html>'''
    
    return html_template

def main():
    """Main function to generate HTML files"""
    print("🔧 Generating HTML files with API keys...")
    
    # Load environment variables
    env_vars = load_environment()
    
    # Create vacation-chatbot/public directory if it doesn't exist
    import os
    os.makedirs('vacation-chatbot/public', exist_ok=True)
    
    # Check if Google Maps API key is available
    if not env_vars['GOOGLE_MAPS_API_KEY']:
        print("⚠️  Warning: GOOGLE_MAPS_API_KEY not found in .env file")
        print("   The map will not work without a valid API key")
        print("   Please add GOOGLE_MAPS_API_KEY=your_key_here to your .env file")
    
    # Generate index.html
    index_html = generate_index_html(env_vars['GOOGLE_MAPS_API_KEY'])
    
    # Write index.html
    with open('vacation-chatbot/public/index.html', 'w', encoding='utf-8') as f:
        f.write(index_html)
    
    print("✅ Generated public/index.html")
    
    # Generate map.html
    map_html = generate_map_html(env_vars['GOOGLE_MAPS_API_KEY'])
    
    # Write map.html
    with open('vacation-chatbot/public/map.html', 'w', encoding='utf-8') as f:
        f.write(map_html)
    
    print("✅ Generated public/map.html")
    
    # Summary
    print("\n📋 Summary:")
    print(f"   LLAMA_API_KEY: {'✅ Loaded' if env_vars['LLAMA_API_KEY'] else '❌ Not found'}")
    print(f"   GOOGLE_MAPS_API_KEY: {'✅ Loaded' if env_vars['GOOGLE_MAPS_API_KEY'] else '❌ Not found'}")
    
    if env_vars['GOOGLE_MAPS_API_KEY']:
        print(f"   API Key length: {len(env_vars['GOOGLE_MAPS_API_KEY'])} characters")
        print(f"   API Key preview: {env_vars['GOOGLE_MAPS_API_KEY'][:10]}...")
    
    print("\n🚀 HTML files generated successfully!")
    print("   You can now run: python app.py")

if __name__ == '__main__':
    main() 