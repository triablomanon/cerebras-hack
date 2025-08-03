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
  const [chatbotHeight, setChatbotHeight] = useState(35); // Percentage of left panel
  const [leftPanelWidth, setLeftPanelWidth] = useState(55); // Percentage of main content
  const [isResizing, setIsResizing] = useState(false);
  const [isResizingMap, setIsResizingMap] = useState(false);
  const leftPanelRef = useRef(null);
  const mainContentRef = useRef(null);

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

  const handleMapResizerMouseDown = useCallback((e) => {
    setIsResizingMap(true);
    e.preventDefault();
  }, []);

  const handleMouseMove = useCallback((e) => {
    if (isResizing && leftPanelRef.current) {
      const panelRect = leftPanelRef.current.getBoundingClientRect();
      const newHeight = ((e.clientY - panelRect.top) / panelRect.height) * 100;
      
      // Keep heights between 30% and 80% to prevent panels from becoming too small
      if (newHeight >= 30 && newHeight <= 80) {
        setChatbotHeight(newHeight);
      }
    }
    
    if (isResizingMap && mainContentRef.current) {
      const containerRect = mainContentRef.current.getBoundingClientRect();
      const newLeftWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;
      
      // Keep widths between 25% and 75% to prevent panels from becoming too small
      if (newLeftWidth >= 25 && newLeftWidth <= 75) {
        setLeftPanelWidth(newLeftWidth);
      }
    }
  }, [isResizing, isResizingMap]);

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
    setIsResizingMap(false);
  }, []);

  // Add mouse event listeners when resizing
  React.useEffect(() => {
    if (isResizing || isResizingMap) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = isResizing ? 'row-resize' : 'col-resize';
      document.body.style.userSelect = 'none';
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      };
    }
  }, [isResizing, isResizingMap, handleMouseMove, handleMouseUp]);

  return (
    <div className="App">
      <Header />
      <div className="main-content" ref={mainContentRef}>
        <div 
          className="left-panel" 
          ref={leftPanelRef}
          style={{ width: `${leftPanelWidth}%` }}
        >
          <div 
            className="chatbot-container"
            style={{ 
              height: tripData.destinations.length > 0 ? `${chatbotHeight}%` : '100%'
            }}
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
        
        <div 
          className="horizontal-resizer"
          onMouseDown={handleMapResizerMouseDown}
        >
          <div className="resizer-handle"></div>
        </div>
        
        <div 
          className="right-panel"
          style={{ width: `${100 - leftPanelWidth}%` }}
        >
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
