/**
 * Loading Overlay Component
 * Professional loading states for async operations
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Loader2 } from 'lucide-react';

const LoadingOverlay = ({ isLoading, message = 'Loading...', progress = null }) => {
  if (!isLoading) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.7)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
    }}>
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '32px 48px',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
        textAlign: 'center',
        minWidth: '300px',
      }}>
        <Loader2 
          size={48} 
          style={{ 
            color: '#00539F',
            animation: 'spin 1s linear infinite',
            marginBottom: '16px'
          }} 
        />
        
        <h3 style={{
          margin: '0 0 8px 0',
          fontSize: '18px',
          fontWeight: '600',
          color: '#1F2937'
        }}>
          {message}
        </h3>
        
        {progress !== null && (
          <>
            <div style={{
              width: '100%',
              height: '8px',
              background: '#E5E7EB',
              borderRadius: '4px',
              overflow: 'hidden',
              marginTop: '16px'
            }}>
              <div style={{
                height: '100%',
                background: 'linear-gradient(90deg, #00539F 0%, #E31837 100%)',
                width: `${progress}%`,
                transition: 'width 0.3s ease',
                borderRadius: '4px'
              }} />
            </div>
            <p style={{
              margin: '8px 0 0 0',
              fontSize: '14px',
              color: '#6B7280'
            }}>
              {progress}% complete
            </p>
          </>
        )}
        
        <p style={{
          margin: '8px 0 0 0',
          fontSize: '12px',
          color: '#9CA3AF'
        }}>
          Please wait...
        </p>
      </div>
      
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

LoadingOverlay.propTypes = {
  isLoading: PropTypes.bool.isRequired,
  message: PropTypes.string,
  progress: PropTypes.number,
};

LoadingOverlay.defaultProps = {
  message: 'Loading...',
  progress: null,
};

export default LoadingOverlay;
