import React, { useState, useEffect } from 'react';

function TripSummary({ tripData }) {
  // Track user's selected transport options for each segment
  const [selectedTransports, setSelectedTransports] = useState({});

  // Initialize selected transports with eco-friendly defaults when segments change
  useEffect(() => {
    if (tripData.segments && tripData.segments.length > 0) {
      const defaults = {};
      tripData.segments.forEach((segment, index) => {
        if (segment.transport_options && segment.transport_options.length > 0) {
          // Find the most eco-friendly option as default
          const ecoOption = segment.transport_options.reduce((best, current) => 
            current.carbon_kg < best.carbon_kg ? current : best
          );
          defaults[index] = ecoOption.mode;
        }
      });
      setSelectedTransports(defaults);
    }
  }, [tripData.segments]);

  // Early return after hooks are declared
  if (!tripData.destinations.length) return null;

  const handleDestinationClick = (destination) => {
    // You could add functionality to focus on this destination on the map
    console.log('Clicked destination:', destination);
  };

  const handleTransportChange = (segmentIndex, newMode) => {
    setSelectedTransports(prev => ({
      ...prev,
      [segmentIndex]: newMode
    }));
  };

  // Calculate trip totals based on user selections
  const calculateTripTotals = () => {
    if (!tripData.segments || tripData.segments.length === 0) {
      return { totalTime: 0, totalEmissions: 0, hasData: false, selectedOptions: [] };
    }

    let totalTime = 0;
    let totalEmissions = 0;
    const selectedOptions = [];

    tripData.segments.forEach((segment, index) => {
      if (segment.transport_options && segment.transport_options.length > 0) {
        const selectedMode = selectedTransports[index];
        const selectedOption = segment.transport_options.find(option => option.mode === selectedMode);
        
        if (selectedOption) {
          totalTime += selectedOption.duration_hours;
          totalEmissions += selectedOption.carbon_kg;
          
          selectedOptions.push({
            from: segment.from,
            to: segment.to,
            mode: selectedOption.mode,
            duration: selectedOption.duration_hours,
            emissions: selectedOption.carbon_kg,
            distance: selectedOption.distance_km,
            allOptions: segment.transport_options
          });
        }
      }
    });

    return { 
      totalTime: Math.round(totalTime * 10) / 10, 
      totalEmissions: Math.round(totalEmissions * 10) / 10, 
      hasData: true,
      selectedOptions
    };
  };

  const { totalTime, totalEmissions, hasData, selectedOptions } = calculateTripTotals();

  const formatDuration = (hours) => {
    if (hours < 1) {
      return `${Math.round(hours * 60)}min`;
    } else if (hours < 24) {
      const h = Math.floor(hours);
      const m = Math.round((hours - h) * 60);
      return m > 0 ? `${h}h ${m}min` : `${h}h`;
    } else {
      const days = Math.floor(hours / 24);
      const remainingHours = Math.round(hours % 24);
      return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days}d`;
    }
  };

  const getTransportIcon = (mode) => {
    const icons = {
      car: 'car',
      train: 'train',
      plane: 'plane',
      flight: 'plane',
      bus: 'bus'
    };
    return icons[mode] || 'car';
  };

  const getTransportName = (mode) => {
    const names = {
      car: 'Car',
      train: 'Train', 
      plane: 'Flight',
      flight: 'Flight',
      bus: 'Bus'
    };
    return names[mode] || 'Car';
  };



  return (
    <div className="trip-summary">
      <div className="trip-summary-header">
        <i className="fas fa-route"></i>
        <h3 className="trip-summary-title">Trip Summary</h3>
      </div>

      <div className="trip-destinations">
        {tripData.destinations.map((destination, index) => (
          <div
            key={destination.id}
            className="destination-item"
            onClick={() => handleDestinationClick(destination)}
          >
            <div className="destination-number">
              {index + 1}
            </div>
            <div className="destination-name">
              {destination.name}
            </div>
          </div>
        ))}
      </div>

      {/* Trip Metrics - Travel Time and Emissions */}
      {hasData && (
        <div className="trip-metrics">
          <div className="metric-card">
            <div className="metric-icon">
              <i className="fas fa-clock"></i>
            </div>
            <div className="metric-content">
              <div className="metric-value">{formatDuration(totalTime)}</div>
              <div className="metric-label">Travel Time</div>
            </div>
          </div>
          
          <div className="metric-card">
            <div className="metric-icon">
              <i className="fas fa-leaf"></i>
            </div>
            <div className="metric-content">
              <div className="metric-value">{totalEmissions} kg</div>
              <div className="metric-label">CO₂ Emissions</div>
            </div>
          </div>
        </div>
      )}

      {/* Transport Selection and Breakdown */}
      {hasData && selectedOptions.length > 0 && (
        <div className="transport-breakdown">
          <h4 className="breakdown-title">
            <i className="fas fa-route"></i>
            Compare Transport Options
          </h4>
          <div className="segment-list">
            {selectedOptions.map((option, index) => (
              <div key={index} className="segment-item">
                <div className="segment-route">
                  <span className="route-text">{option.from} → {option.to}</span>
                </div>
                
                {/* Transport mode selector */}
                <div className="transport-selector">
                  <div className="selector-label">Choose your transport:</div>
                  <div className="transport-options">
                    {option.allOptions.map((transportOption) => (
                      <button
                        key={transportOption.mode}
                        className={`transport-option ${selectedTransports[index] === transportOption.mode ? 'selected' : ''}`}
                        onClick={() => handleTransportChange(index, transportOption.mode)}
                      >
                        <div className="option-header">
                          <i className={`fas fa-${getTransportIcon(transportOption.mode)}`}></i>
                          <span className="option-name">{getTransportName(transportOption.mode)}</span>
                        </div>
                        <div className="option-stats">
                          <span className="stat">{formatDuration(transportOption.duration_hours)}</span>
                          <span className="stat">{transportOption.carbon_kg} kg CO₂</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>


              </div>
            ))}
          </div>
          <div className="breakdown-note">
            * Click any transport option to compare emissions and time
          </div>
        </div>
      )}

      {tripData.carbonImpact && (
        <div className="carbon-impact">
          <i className="fas fa-leaf" style={{ color: '#059669' }}></i>
          <div>
            <div className="carbon-value">
              {tripData.carbonImpact.value} {tripData.carbonImpact.unit}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#047857' }}>
              {tripData.carbonImpact.savings}
            </div>
          </div>
        </div>
      )}



    </div>
  );
}

export default TripSummary;
