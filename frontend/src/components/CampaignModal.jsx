/**
 * Campaign Variations Modal Component
 * Displays AI-generated campaign variations for different channels
 */

import React from 'react';
import PropTypes from 'prop-types';
import { X, Download, TrendingUp } from 'lucide-react';
import useCreativeStore from '../store/creativeStore';
import toast from 'react-hot-toast';

const CampaignModal = ({ isOpen, onClose, campaignData }) => {
  const { canvas, setFormat, setBackgroundColor } = useCreativeStore();
  
  if (!isOpen || !campaignData) return null;

  const { variations, campaign_theme, ab_test_recommendation } = campaignData;

  const downloadVariation = (variation) => {
    console.log('🎯 Applying campaign variation:', variation);
    if (!canvas) {
      toast.error('Canvas not initialized');
      return;
    }
    try {
      // 1. Format
      setFormat(variation.format);

      // 2. Background
      if (variation.background_color) {
        setBackgroundColor(variation.background_color);
        canvas.backgroundColor = variation.background_color;
      }

      // 3. Gather current objects (image, text, etc.)
      const objects = canvas.getObjects();
      let foundImage = null;
      let foundHeadline = null;
      let foundText = null;
      
      for (const obj of objects) {
        if (!foundImage && obj.type === 'image') foundImage = obj;
        if (!foundHeadline && (obj.type === 'textbox' || obj.type === 'i-text' || obj.type === 'text')) foundHeadline = obj;
        // for subhead logic, consider using another text if present
      }
      
      // 4. Apply product/image position
      if (foundImage && variation.product_position) {
        foundImage.set({
          left: variation.product_position.x,
          top: variation.product_position.y,
          scaleX: variation.product_position.width / foundImage.width,
          scaleY: variation.product_position.height / foundImage.height,
        });
        foundImage.setCoords();
        console.log('✅ Product/image positioned.');
      } else {
        console.log('ℹ️ No image found or product_position missing.');
      }
      
      // 5. Apply headline position & font size
      if (foundHeadline && variation.headline_position) {
        foundHeadline.set({
          left: variation.headline_position.x,
          top: variation.headline_position.y,
          fontSize: variation.headline_position.fontSize || foundHeadline.fontSize,
        });
        foundHeadline.setCoords();
        if (variation.subhead && typeof variation.subhead === 'string') {
          foundHeadline.set({ text: variation.subhead });
        }
        console.log('✅ Headline positioned and updated');
      } else {
        console.log('ℹ️ No text object or headline_position missing.');
      }
      // 6. Render all
      canvas.renderAll();
      // 7. Success
      toast.success(`✅ Applied ${variation.channel} variation! (${variation.format})`);
      onClose();
    } catch (error) {
      console.error('❌ Error applying variation:', error);
      toast.error('Failed to apply variation');
    }
  };

  const getFormatIcon = (format) => {
    const icons = {
      '1:1': '⬜',
      '9:16': '📱',
      '1.91:1': '🖥️',
      '4:5': '📲'
    };
    return icons[format] || '📐';
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000,
      padding: '20px',
    }}>
      <div style={{
        background: 'white',
        borderRadius: '16px',
        maxWidth: '1200px',
        width: '100%',
        maxHeight: '90vh',
        overflow: 'auto',
        boxShadow: '0 25px 50px rgba(0, 0, 0, 0.3)',
      }}>
        {/* Header */}
        <div style={{
          padding: '24px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          background: 'white',
          zIndex: 1,
        }}>
          <div>
            <h2 style={{ 
              margin: 0, 
              fontSize: '24px', 
              fontWeight: '700',
              background: 'linear-gradient(135deg, #00539F 0%, #E31837 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              AI Campaign Set
            </h2>
            <p style={{ 
              margin: '4px 0 0 0', 
              color: 'var(--text-secondary)',
              fontSize: '14px' 
            }}>
              {campaign_theme}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'var(--bg-secondary)',
              border: 'none',
              borderRadius: '8px',
              padding: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => e.target.style.background = '#E5E7EB'}
            onMouseLeave={(e) => e.target.style.background = 'var(--bg-secondary)'}
          >
            <X size={24} />
          </button>
        </div>

        {/* A/B Test Recommendation */}
        {ab_test_recommendation && (
          <div style={{
            margin: '24px',
            padding: '16px',
            background: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)',
            borderRadius: '12px',
            borderLeft: '4px solid #F59E0B',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <TrendingUp size={18} style={{ color: '#D97706' }} />
              <strong style={{ color: '#92400E', fontSize: '14px' }}>A/B Testing Tip</strong>
            </div>
            <p style={{ margin: 0, color: '#78350F', fontSize: '13px' }}>
              {ab_test_recommendation}
            </p>
          </div>
        )}

        {/* Campaign Variations Grid */}
        <div style={{
          padding: '24px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '20px',
        }}>
          {variations && variations.map((variation, index) => (
            <div
              key={index}
              style={{
                border: '2px solid var(--border)',
                borderRadius: '12px',
                overflow: 'hidden',
                transition: 'all 0.3s',
                background: 'white',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#00539F';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 83, 159, 0.15)';
                e.currentTarget.style.transform = 'translateY(-4px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border)';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              {/* Channel Header */}
              <div style={{
                padding: '16px',
                background: 'linear-gradient(135deg, #F3F4F6 0%, #E5E7EB 100%)',
                borderBottom: '1px solid var(--border)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span style={{ fontSize: '24px' }}>{getFormatIcon(variation.format)}</span>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#1F2937' }}>
                      {variation.channel}
                    </h3>
                    <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)' }}>
                      {variation.format} • {variation.strategy}
                    </p>
                  </div>
                </div>
              </div>

              {/* Variation Details */}
              <div style={{ padding: '16px' }}>
                {/* Background Color */}
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Background
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                    <div style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '6px',
                      background: variation.background_color,
                      border: '2px solid var(--border)',
                    }} />
                    <span style={{ fontSize: '13px', color: '#374151', fontFamily: 'monospace' }}>
                      {variation.background_color}
                    </span>
                  </div>
                </div>

                {/* Subhead */}
                {variation.subhead && (
                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Subhead
                    </label>
                    <p style={{ 
                      margin: '4px 0 0 0', 
                      fontSize: '13px', 
                      color: '#374151',
                      fontStyle: 'italic',
                      lineHeight: '1.4',
                    }}>
                      "{variation.subhead}"
                    </p>
                  </div>
                )}

                {/* Optimization Tips */}
                {variation.optimization_tips && variation.optimization_tips.length > 0 && (
                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px', display: 'block' }}>
                      Optimization Tips
                    </label>
                    <ul style={{ 
                      margin: 0, 
                      paddingLeft: '20px',
                      fontSize: '12px',
                      color: '#6B7280',
                      lineHeight: '1.6',
                    }}>
                      {variation.optimization_tips.map((tip, tipIndex) => (
                        <li key={tipIndex}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Expected Performance */}
                {variation.expected_performance && (
                  <div style={{
                    marginTop: '12px',
                    padding: '10px',
                    background: '#F0FDF4',
                    borderRadius: '6px',
                    border: '1px solid #BBF7D0',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <TrendingUp size={14} style={{ color: '#16A34A' }} />
                      <span style={{ fontSize: '12px', fontWeight: '600', color: '#15803D' }}>
                        {variation.expected_performance}
                      </span>
                    </div>
                  </div>
                )}

                {/* Download Button */}
                <button
                  style={{
                    marginTop: '16px',
                    width: '100%',
                    padding: '10px',
                    background: 'linear-gradient(135deg, #00539F 0%, #003D7A 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    transition: 'all 0.2s',
                  }}
                  onClick={() => downloadVariation(variation)}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'scale(1.02)';
                    e.target.style.boxShadow = '0 4px 12px rgba(0, 83, 159, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'scale(1)';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  <Download size={16} />
                  Use This Variation
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

CampaignModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  campaignData: PropTypes.shape({
    variations: PropTypes.arrayOf(PropTypes.shape({
      format: PropTypes.string.isRequired,
      channel: PropTypes.string.isRequired,
      strategy: PropTypes.string,
      background_color: PropTypes.string,
      subhead: PropTypes.string,
      optimization_tips: PropTypes.arrayOf(PropTypes.string),
      expected_performance: PropTypes.string,
    })),
    campaign_theme: PropTypes.string,
    ab_test_recommendation: PropTypes.string,
  }),
};

export default CampaignModal;
