/**
 * Error Boundary Component
 * Catches React errors and displays user-friendly message
 */

import React from 'react';
import PropTypes from 'prop-types';
import { AlertTriangle, RefreshCw } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '20px'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '48px',
            maxWidth: '600px',
            width: '100%',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
            textAlign: 'center'
          }}>
            <AlertTriangle 
              size={64} 
              style={{ 
                color: '#E31837',
                marginBottom: '24px'
              }} 
            />
            
            <h1 style={{
              margin: '0 0 16px 0',
              fontSize: '32px',
              fontWeight: '700',
              color: '#1F2937'
            }}>
              Oops! Something went wrong
            </h1>
            
            <p style={{
              margin: '0 0 24px 0',
              fontSize: '16px',
              color: '#6B7280',
              lineHeight: '1.6'
            }}>
              The application encountered an unexpected error. This has been logged and we'll look into it.
            </p>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details style={{
                marginBottom: '24px',
                padding: '16px',
                background: '#F9FAFB',
                borderRadius: '8px',
                textAlign: 'left',
                fontSize: '12px',
                fontFamily: 'monospace',
                color: '#DC2626'
              }}>
                <summary style={{ cursor: 'pointer', fontWeight: '600', marginBottom: '8px' }}>
                  Error Details (Development Only)
                </summary>
                <p style={{ margin: '8px 0' }}>
                  <strong>Error:</strong> {this.state.error.toString()}
                </p>
                <pre style={{ 
                  overflow: 'auto', 
                  maxHeight: '200px',
                  background: 'white',
                  padding: '12px',
                  borderRadius: '4px',
                  fontSize: '11px'
                }}>
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}
            
            <button
              onClick={this.handleReset}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 32px',
                background: '#00539F',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.background = '#003d7a'}
              onMouseLeave={(e) => e.target.style.background = '#00539F'}
            >
              <RefreshCw size={20} />
              Reload Application
            </button>
            
            <p style={{
              margin: '24px 0 0 0',
              fontSize: '14px',
              color: '#9CA3AF'
            }}>
              If the problem persists, please contact support
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ErrorBoundary;
