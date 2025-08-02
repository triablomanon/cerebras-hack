import React, { useEffect, useRef } from 'react';

function Map({ tripData, selectedLocation, onLocationSelect }) {
  const iframeRef = useRef(null);

  // Send trip data to the iframe when it changes
  useEffect(() => {
    if (iframeRef.current && iframeRef.current.contentWindow && tripData?.destinations) {
      console.log('🔄 Sending destinations to iframe map:', tripData.destinations);
      iframeRef.current.contentWindow.postMessage({
        type: 'update-markers',
        destinations: tripData.destinations
      }, '*');
    }
  }, [tripData?.destinations]);

  // Listen for messages from the iframe
  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data.type === 'marker-clicked' && onLocationSelect) {
        console.log('📍 Marker clicked in iframe:', event.data.destination);
        onLocationSelect(event.data.destination);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onLocationSelect]);

  return (
    <div className="map-container">
      <iframe
        ref={iframeRef}
        src="/map.html"
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
          display: 'block'
        }}
        title="EcoTrip Map"
      />
    </div>
  );
}

export default Map;
