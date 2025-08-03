import React, { useState, useCallback, useRef } from 'react';
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
  const [chatbotHeight, setChatbotHeight] = useState(60); // Percentage of left panel
  const [isResizing, setIsResizing] = useState(false);
  const leftPanelRef = useRef(null);

  const handleTripUpdate = useCallback((newTripData) => {
    setTripData(prevData => ({
      ...prevData,
      ...newTripData
    }));
  }, []);

  const handleLocationSelect = useCallback((location) => {
    setSelectedLocation(location);
  }, []);

  const handleResizerMouseDown = useCallback((e) => {
    setIsResizing(true);
    e.preventDefault();
  }, []);

  const handleMouseMove = useCallback((e) => {
    if (!isResizing || !leftPanelRef.current) return;
    
    const panelRect = leftPanelRef.current.getBoundingClientRect();
    const newHeight = ((e.clientY - panelRect.top) / panelRect.height) * 100;
    
    // Keep heights between 30% and 80% to prevent panels from becoming too small
    if (newHeight >= 30 && newHeight <= 80) {
      setChatbotHeight(newHeight);
    }
  }, [isResizing]);

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
  }, []);

  // Add mouse event listeners when resizing
  React.useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'row-resize';
      document.body.style.userSelect = 'none';
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      };
    }
  }, [isResizing, handleMouseMove, handleMouseUp]);

  return (
    <div className="App">
      <Header />
      <div className="main-content">
        <div className="left-panel" ref={leftPanelRef}>
          <div 
            className="chatbot-container"
            style={{ height: `${chatbotHeight}%` }}
          >
            <Chatbot 
              onTripUpdate={handleTripUpdate}
              tripData={tripData}
              onLocationSelect={handleLocationSelect}
            />
          </div>
          
          {tripData.destinations.length > 0 && (
            <>
              <div 
                className="vertical-resizer"
                onMouseDown={handleResizerMouseDown}
              >
                <div className="resizer-line"></div>
              </div>
              
              <div 
                className="trip-summary-container"
                style={{ height: `${100 - chatbotHeight}%` }}
              >
                <TripSummary tripData={tripData} />
              </div>
            </>
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
