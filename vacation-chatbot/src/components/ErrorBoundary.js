import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to console
    console.error('🚨 Error Boundary caught an error:', error, errorInfo);
    
    // Update state with error details
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          padding: '2rem', 
          textAlign: 'center',
          backgroundColor: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '8px',
          margin: '1rem'
        }}>
          <div style={{ color: '#dc2626', marginBottom: '1rem' }}>
            <i className="fas fa-exclamation-triangle" style={{ fontSize: '2rem' }}></i>
          </div>
          <h3 style={{ color: '#dc2626', marginBottom: '0.5rem' }}>
            Something went wrong
          </h3>
          <p style={{ color: '#64748b', marginBottom: '1rem' }}>
            The map component encountered an error. This might be due to a temporary issue with Google Maps.
          </p>
          
          <button 
            onClick={this.handleRetry}
            style={{
              padding: '0.5rem 1rem',
              background: '#059669',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              marginBottom: '1rem'
            }}
          >
            🔄 Try Again
          </button>
          
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <details style={{ textAlign: 'left', maxWidth: '500px', margin: '0 auto' }}>
              <summary style={{ cursor: 'pointer', color: '#64748b' }}>
                Show error details (development only)
              </summary>
              <pre style={{ 
                background: '#f1f5f9', 
                padding: '1rem', 
                borderRadius: '8px', 
                fontSize: '0.75rem',
                overflow: 'auto',
                marginTop: '0.5rem'
              }}>
                {this.state.error && this.state.error.toString()}
                {this.state.errorInfo && this.state.errorInfo.componentStack}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 