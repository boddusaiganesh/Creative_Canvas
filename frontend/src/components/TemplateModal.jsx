/**
 * Template Library Modal Component
 * Browse and apply pre-built creative templates
 */

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { X, Check, Sparkles } from 'lucide-react';
import { creativeTemplates, templateCategories } from '../data/templates';
import toast from 'react-hot-toast';

const TemplateModal = ({ isOpen, onClose, onApplyTemplate, currentFormat }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');

  if (!isOpen) return null;

  const filteredTemplates = selectedCategory === 'all'
    ? creativeTemplates
    : creativeTemplates.filter(t => t.category === selectedCategory);

  const handleApplyTemplate = (template) => {
    onApplyTemplate(template);
    toast.success(`Template "${template.name}" applied!`);
    onClose();
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
        maxWidth: '1400px',
        width: '100%',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 25px 50px rgba(0, 0, 0, 0.3)',
      }}>
        {/* Header */}
        <div style={{
          padding: '24px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div>
            <h2 style={{ 
              margin: 0, 
              fontSize: '24px', 
              fontWeight: '700',
              background: 'linear-gradient(135deg, #00539F 0%, #E31837 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}>
              <Sparkles size={28} />
              Creative Templates
            </h2>
            <p style={{ 
              margin: '4px 0 0 0', 
              color: 'var(--text-secondary)',
              fontSize: '14px' 
            }}>
              Choose a professional template to get started quickly
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

        {/* Category Filter */}
        <div style={{
          padding: '16px 24px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          gap: '12px',
          overflowX: 'auto',
          flexWrap: 'wrap',
        }}>
          {templateCategories.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              style={{
                padding: '8px 16px',
                borderRadius: '20px',
                border: selectedCategory === category.id ? '2px solid #00539F' : '2px solid var(--border)',
                background: selectedCategory === category.id ? '#EFF6FF' : 'white',
                color: selectedCategory === category.id ? '#00539F' : '#6B7280',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <span>{category.icon}</span>
              {category.name}
            </button>
          ))}
        </div>

        {/* Templates Grid */}
        <div style={{
          padding: '24px',
          overflow: 'auto',
          flex: 1,
        }}>
          {filteredTemplates.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-secondary)' }}>
              <p style={{ fontSize: '16px' }}>No templates in this category yet</p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '20px',
            }}>
              {filteredTemplates.map((template) => (
                <div
                  key={template.id}
                  style={{
                    border: '2px solid var(--border)',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    transition: 'all 0.3s',
                    cursor: 'pointer',
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
                  onClick={() => handleApplyTemplate(template)}
                >
                  {/* Template Preview */}
                  <div style={{
                    height: '200px',
                    background: template.template.background.type === 'gradient'
                      ? `linear-gradient(${template.template.background.gradient.angle}deg, ${template.template.background.gradient.stops[0].color}, ${template.template.background.gradient.stops[1].color})`
                      : template.template.background.color,
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '20px',
                  }}>
                    {/* Simple visualization */}
                    <div style={{
                      width: '80%',
                      height: '80%',
                      border: '2px dashed rgba(0,0,0,0.2)',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      color: 'rgba(0,0,0,0.4)',
                      fontWeight: '600',
                    }}>
                      {template.format}
                    </div>
                    
                    {/* Format badge */}
                    <div style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                      background: 'rgba(0, 83, 159, 0.9)',
                      color: 'white',
                      padding: '4px 8px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: '600',
                    }}>
                      {template.format}
                    </div>
                  </div>

                  {/* Template Info */}
                  <div style={{ padding: '16px' }}>
                    <h3 style={{ 
                      margin: '0 0 8px 0', 
                      fontSize: '16px', 
                      fontWeight: '600',
                      color: '#1F2937',
                    }}>
                      {template.name}
                    </h3>
                    <p style={{ 
                      margin: '0 0 12px 0', 
                      fontSize: '13px', 
                      color: 'var(--text-secondary)',
                      lineHeight: '1.4',
                    }}>
                      {template.description}
                    </p>

                    {/* Apply Button */}
                    <button
                      style={{
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
                      onClick={(e) => {
                        e.stopPropagation();
                        handleApplyTemplate(template);
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.transform = 'scale(1.02)';
                        e.target.style.boxShadow = '0 4px 12px rgba(0, 83, 159, 0.3)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = 'scale(1)';
                        e.target.style.boxShadow = 'none';
                      }}
                    >
                      <Check size={16} />
                      Use Template
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

TemplateModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onApplyTemplate: PropTypes.func.isRequired,
  currentFormat: PropTypes.string,
};

export default TemplateModal;
