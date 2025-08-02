import React, { useState, useCallback } from 'react';
import Chatbot from './components/Chatbot';
import Map from './components/Map';
import Header from './components/Header';
import TripSummary from './components/TripSummary';
import ErrorBoundary from './components/ErrorBoundary';
import './App.css';

function App() {
  const [tripData, setTripData] = useState({
    destinations: [],
    route: [],
    carbonImpact: null,
    transportation: 'car',
    duration: null
  });

  const [selectedLocation, setSelectedLocation] = useState(null);

  const handleTripUpdate = useCallback((newTripData) => {
    setTripData(prevData => ({
      ...prevData,
      ...newTripData
    }));
  }, []);

  const handleLocationSelect = useCallback((location) => {
    setSelectedLocation(location);
  }, []);

  return (
    <div className="App">
      <Header />
      <div className="main-content">
        <div className="left-panel">
          <Chatbot 
            onTripUpdate={handleTripUpdate}
            tripData={tripData}
            onLocationSelect={handleLocationSelect}
          />
          {tripData.destinations.length > 0 && (
            <TripSummary tripData={tripData} />
          )}
        </div>
        <div className="right-panel">
          <ErrorBoundary>
            <Map 
              tripData={tripData}
              selectedLocation={selectedLocation}
              onLocationSelect={handleLocationSelect}
            />
          </ErrorBoundary>
        </div>
      </div>
    </div>
  );
}

export default App;
