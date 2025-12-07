/**
 * Layout Suggestions Modal Component
 * Displays AI-generated layout options for the user to select
 */

import React from 'react';
import PropTypes from 'prop-types';
import { X, Check } from 'lucide-react';
import useCreativeStore from '../store/creativeStore';
import toast from 'react-hot-toast';

const LayoutSuggestionsModal = ({ isOpen, onClose }) => {
  const { layoutSuggestions, canvas, setLayoutSuggestions } = useCreativeStore();

  if (!isOpen || layoutSuggestions.length === 0) return null;

  const applyLayout = (layout) => {
    console.log('🎯 ===== APPLY LAYOUT DEBUG START =====');
    console.log('Layout to apply:', layout);
    console.log('Layout name:', layout.name);
    
    if (!canvas) {
      console.error('❌ Canvas not initialized');
      toast.error('Canvas not initialized');
      return;
    }

    console.log('✅ Canvas exists:', canvas);
    console.log('Canvas dimensions:', canvas.getWidth(), 'x', canvas.getHeight());

    try {
      toast.loading('Applying layout...', { id: 'apply-layout' });

      // Get all canvas objects
      const objects = canvas.getObjects();
      console.log('📦 Total objects on canvas:', objects.length);
      console.log('Objects:', objects.map(obj => ({ type: obj.type, customType: obj.customType })));
      
      // Convert elements object to array
      const elementsArray = Array.isArray(layout.elements) 
        ? layout.elements 
        : Object.entries(layout.elements).map(([type, data]) => ({
            type,
            ...data
          }));

      console.log('📋 Layout elements to apply:', elementsArray.length);
      console.log('Elements:', elementsArray);

      let appliedCount = 0;
      let skippedCount = 0;
      
      // Track which text objects have been used to avoid reusing the same one
      const usedTextObjects = new Set();

      // Apply layout to matching elements
      elementsArray.forEach((layoutElement, index) => {
        console.log(`\n🔄 Processing element ${index + 1}:`, layoutElement.type);
        console.log('  Position:', layoutElement.x, layoutElement.y);
        console.log('  Size:', layoutElement.width, 'x', layoutElement.height);
        
        // Find matching object on canvas
        let targetObject = null;
        
        // Match by type
        if (layoutElement.type === 'packshot' || layoutElement.type === 'image') {
          console.log('  👉 Looking for image object...');
          targetObject = objects.find(obj => obj.type === 'image');
          if (targetObject) {
            console.log('  ✅ Found image object:', targetObject);
          } else {
            console.log('  ❌ No image object found on canvas');
          }
        } else if (layoutElement.type === 'text' || layoutElement.type === 'headline' || layoutElement.type === 'subhead') {
          console.log('  👉 Looking for text object...');
          
          // Get all available text objects that haven't been used yet
          const availableTextObjects = objects.filter(obj => 
            (obj.type === 'i-text' || obj.type === 'text' || obj.type === 'textbox') &&
            !usedTextObjects.has(obj)
          );
          
          if (availableTextObjects.length > 0) {
            // Match by priority: headline gets first, subhead gets second, etc.
            if (layoutElement.type === 'headline') {
              targetObject = availableTextObjects[0]; // First text for headline
            } else if (layoutElement.type === 'subhead') {
              targetObject = availableTextObjects[1] || availableTextObjects[0]; // Second text, or first if only one
            } else {
              targetObject = availableTextObjects[0]; // Generic text
            }
            
            if (targetObject) {
              usedTextObjects.add(targetObject); // Mark as used
              console.log('  ✅ Found text object:', targetObject);
              console.log('  📌 Type matched:', layoutElement.type);
            }
          } else {
            console.log('  ❌ No available text objects found on canvas');
          }
        } else if (layoutElement.type === 'logo') {
          console.log('  👉 Looking for logo object...');
          targetObject = objects.find(obj => 
            (obj.type === 'image' || obj.type === 'group') && 
            obj.customType === 'logo'
          );
          if (targetObject) {
            console.log('  ✅ Found logo object:', targetObject);
          } else {
            console.log('  ❌ No logo object found on canvas');
            // Try to find any group as fallback
            targetObject = objects.find(obj => obj.type === 'group');
            if (targetObject) {
              console.log('  ⚠️ Using first group as fallback:', targetObject);
            }
          }
        }

        // Apply position and size if object found
        if (targetObject) {
          console.log('  📍 Applying layout to object...');
          console.log('    Current position:', targetObject.left, targetObject.top);
          console.log('    New position:', layoutElement.x, layoutElement.y);
          
          const newProps = {
            left: layoutElement.x,
            top: layoutElement.y,
          };
          
          // Only apply scale if width/height are provided
          if (layoutElement.width && layoutElement.height && targetObject.width && targetObject.height) {
            // Get the base dimensions (without current scale)
            const baseWidth = targetObject.width;
            const baseHeight = targetObject.height;
            
            // Calculate current actual size
            const currentWidth = baseWidth * (targetObject.scaleX || 1);
            const currentHeight = baseHeight * (targetObject.scaleY || 1);
            
            // Calculate new scale factors relative to base dimensions
            newProps.scaleX = layoutElement.width / baseWidth;
            newProps.scaleY = layoutElement.height / baseHeight;
            
            console.log('    Base size:', baseWidth, 'x', baseHeight);
            console.log('    Current size:', currentWidth, 'x', currentHeight);
            console.log('    New size:', layoutElement.width, 'x', layoutElement.height);
            console.log('    Scale factors:', newProps.scaleX, newProps.scaleY);
          } else {
            console.log('    No size change (keeping current size)');
          }
          
          targetObject.set(newProps);
          targetObject.setCoords();
          appliedCount++;
          console.log('  ✅ Layout applied successfully to', layoutElement.type);
        } else {
          skippedCount++;
          console.log('  ⚠️ Skipped - no matching object on canvas');
        }
      });

      console.log('\n📊 Summary:');
      console.log('  Total elements in layout:', elementsArray.length);
      console.log('  Applied:', appliedCount);
      console.log('  Skipped:', skippedCount);

      canvas.renderAll();
      console.log('✅ Canvas re-rendered');
      
      if (appliedCount > 0) {
        toast.success(`Layout applied! (${appliedCount} elements positioned)`, { id: 'apply-layout' });
      } else {
        toast.error('No elements to arrange. Add images and text first!', { id: 'apply-layout' });
      }
      
      console.log('🎯 ===== APPLY LAYOUT DEBUG END =====\n');
      
      onClose();
      
      // Clear suggestions after applying
      setTimeout(() => setLayoutSuggestions([]), 500);
    } catch (error) {
      console.error('❌ ERROR applying layout:', error);
      console.error('Error stack:', error.stack);
      toast.error('Failed to apply layout: ' + error.message, { id: 'apply-layout' });
    }
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
              AI Layout Suggestions
            </h2>
            <p style={{ 
              margin: '4px 0 0 0', 
              color: 'var(--text-secondary)',
              fontSize: '14px' 
            }}>
              Choose a layout to automatically arrange your elements
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

        {/* Layout Grid */}
        <div style={{
          padding: '24px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '20px',
        }}>
          {layoutSuggestions.map((layout, index) => (
            <div
              key={index}
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
              onClick={() => applyLayout(layout)}
            >
              {/* Layout Preview (Simplified Visualization) */}
              <div style={{
                height: '200px',
                background: 'linear-gradient(135deg, #F3F4F6 0%, #E5E7EB 100%)',
                position: 'relative',
                padding: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                {/* Visual representation of elements */}
                {(() => {
                  // Convert elements object to array for rendering
                  const elementsArray = Array.isArray(layout.elements) 
                    ? layout.elements 
                    : Object.entries(layout.elements).map(([type, data]) => ({
                        type,
                        ...data
                      }));
                  
                  return elementsArray.map((element, elemIndex) => {
                  const scale = 0.15; // Scale down for preview
                  
                  // Determine element appearance
                  const isProduct = element.type === 'packshot' || element.type === 'image';
                  const isText = element.type === 'text' || element.type === 'headline' || element.type === 'subhead';
                  const isLogo = element.type === 'logo';
                  
                  return (
                    <div
                      key={elemIndex}
                      style={{
                        position: 'absolute',
                        left: `${(element.x * scale)}px`,
                        top: `${(element.y * scale)}px`,
                        width: element.width ? `${element.width * scale}px` : isText ? '60px' : '30px',
                        height: element.height ? `${element.height * scale}px` : isText ? '12px' : '15px',
                        background: isProduct
                            ? 'linear-gradient(135deg, #E31837 0%, #B71C1C 100%)'
                            : isText
                            ? '#00539F'
                            : isLogo
                            ? 'linear-gradient(135deg, #00539F 0%, #003D7A 100%)'
                            : '#9CA3AF',
                        borderRadius: isText ? '2px' : isLogo ? '3px' : '4px',
                        opacity: 0.85,
                        boxShadow: isProduct ? '0 2px 8px rgba(227, 24, 55, 0.3)' : 'none',
                        border: isLogo ? '1px solid rgba(255, 255, 255, 0.5)' : 'none',
                      }}
                      title={element.type}
                    />
                  );
                  });
                })()}
              </div>

              {/* Layout Info */}
              <div style={{ padding: '16px' }}>
                <h3 style={{ 
                  margin: '0 0 8px 0', 
                  fontSize: '16px', 
                  fontWeight: '600',
                  color: '#1F2937',
                }}>
                  {layout.name}
                </h3>
                <p style={{ 
                  margin: 0, 
                  fontSize: '13px', 
                  color: 'var(--text-secondary)',
                  lineHeight: '1.4',
                }}>
                  {layout.description}
                </p>
                
                {/* Apply Button */}
                <button
                  style={{
                    marginTop: '12px',
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
                    applyLayout(layout);
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
                  Apply Layout
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

LayoutSuggestionsModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default LayoutSuggestionsModal;
