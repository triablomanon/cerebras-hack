import React from 'react';

function TripSummary({ tripData }) {
  if (!tripData.destinations.length) return null;

  const handleDestinationClick = (destination) => {
    // You could add functionality to focus on this destination on the map
    console.log('Clicked destination:', destination);
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

      {tripData.transportation && (
        <div style={{ 
          marginTop: '0.75rem', 
          fontSize: '0.875rem', 
          color: '#64748b',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <i className={`fas fa-${tripData.transportation === 'train' ? 'train' : 'car'}`}></i>
          Recommended: {tripData.transportation === 'train' ? 'Train travel' : 'Car travel'}
        </div>
      )}
    </div>
  );
}

export default TripSummary;
