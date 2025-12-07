/**
 * Drinkaware Lock-up Component
 * For alcohol campaigns - mandatory compliance element
 */

import React, { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { fabric } from 'fabric';
import useCreativeStore from '../store/creativeStore';
import toast from 'react-hot-toast';

const DrinkwareLockup = () => {
  const { canvas, canvasHeight, format, addElement, isAlcoholCampaign } = useCreativeStore();
  const [lockupColor, setLockupColor] = useState('black');

  const addDrinkwareLockup = () => {
    if (!canvas) {
      toast.error('Canvas not initialized');
      return;
    }

    // Minimum height based on format
    const minHeight = format === 'says' ? 12 : 20;
    const lockupHeight = format === 'says' ? 15 : 25;
    const lockupWidth = lockupHeight * 5; // Approximate aspect ratio

    // Position at bottom-right (safe zone)
    const posX = canvas.getWidth() - lockupWidth - 20;
    const posY = canvasHeight - lockupHeight - 20;

    // For 9:16, ensure we're above 250px bottom safe zone
    let finalPosY = posY;
    if (format === '9:16' && posY > canvasHeight - 250) {
      finalPosY = canvasHeight - 260;
    }

    // Create Drinkaware text (simplified - in production, use actual logo image)
    const drinkwareText = new fabric.Text('drinkaware.co.uk', {
      fontSize: lockupHeight - 4,
      fontFamily: 'Arial',
      fontWeight: 'bold',
      fill: lockupColor === 'black' ? '#000000' : '#FFFFFF',
    });

    // Create background for contrast (if needed)
    let lockupGroup;
    
    if (lockupColor === 'white') {
      // Add dark background for white text
      const background = new fabric.Rect({
        width: lockupWidth,
        height: lockupHeight,
        fill: '#000000',
        opacity: 0.7,
        rx: 2,
        ry: 2,
      });

      const textWithPadding = new fabric.Text('drinkaware.co.uk', {
        fontSize: lockupHeight - 6,
        fontFamily: 'Arial',
        fontWeight: 'bold',
        fill: '#FFFFFF',
        left: 5,
        top: 3,
      });

      lockupGroup = new fabric.Group([background, textWithPadding], {
        left: posX,
        top: finalPosY,
        selectable: true,
        hasControls: true,
        hasBorders: true,
        lockRotation: true,
      });
    } else {
      // Black text, no background
      lockupGroup = new fabric.Group([drinkwareText], {
        left: posX,
        top: finalPosY,
        selectable: true,
        hasControls: true,
        hasBorders: true,
        lockRotation: true,
      });
    }

    // Add custom properties
    lockupGroup.set({
      id: `drinkaware_${Date.now()}`,
      color: lockupColor,
      height: lockupHeight,
    });
    
    // Store as custom properties for serialization
    lockupGroup.drinkaware = true;
    lockupGroup.color = lockupColor;

    canvas.add(lockupGroup);
    canvas.setActiveObject(lockupGroup);
    canvas.renderAll();

    // Add to store
    addElement({
      id: lockupGroup.id,
      type: 'drinkaware',
      x: posX,
      y: finalPosY,
      width: lockupWidth,
      height: lockupHeight,
      color: lockupColor,
      zIndex: canvas.getObjects().length,
    });

    toast.success('Drinkaware lock-up added');
  };

  if (!isAlcoholCampaign) {
    return (
      <div style={{ 
        padding: 'var(--spacing-md)',
        background: 'var(--bg-secondary)',
        borderRadius: 'var(--radius-md)',
        fontSize: '0.75rem',
        color: 'var(--text-secondary)',
        textAlign: 'center'
      }}>
        <AlertCircle size={24} style={{ opacity: 0.3, margin: '0 auto 8px' }} />
        <p>Drinkaware lock-up only required for alcohol campaigns</p>
        <p style={{ marginTop: '8px' }}>
          Enable "This is an alcohol campaign" in the Content tab
        </p>
      </div>
    );
  }

  return (
    <div style={{ marginBottom: 'var(--spacing-lg)' }}>
      <h4 style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '8px',
        marginBottom: 'var(--spacing-sm)',
        color: '#E31837'
      }}>
        <AlertCircle size={18} />
        Drinkaware Lock-up
      </h4>

      <p style={{ 
        fontSize: '0.75rem', 
        color: 'var(--text-secondary)', 
        marginBottom: 'var(--spacing-md)' 
      }}>
        <strong style={{ color: '#E31837' }}>MANDATORY</strong> for all alcohol campaigns
      </p>

      {/* Color Selection */}
      <div style={{ marginBottom: 'var(--spacing-md)' }}>
        <label style={{ 
          display: 'block', 
          marginBottom: 'var(--spacing-xs)',
          fontSize: '0.875rem',
          fontWeight: '500'
        }}>
          Lock-up Color
        </label>
        <select
          value={lockupColor}
          onChange={(e) => setLockupColor(e.target.value)}
          style={{ width: '100%' }}
        >
          <option value="black">All-Black</option>
          <option value="white">All-White (with background)</option>
        </select>
        <small style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
          Must have sufficient contrast from background
        </small>
      </div>

      {/* Preview */}
      <div style={{ 
        marginBottom: 'var(--spacing-md)',
        padding: 'var(--spacing-lg)',
        background: lockupColor === 'white' ? '#333333' : '#F5F5F5',
        borderRadius: 'var(--radius-md)',
        textAlign: 'center'
      }}>
        <div style={{ 
          display: 'inline-block',
          padding: lockupColor === 'white' ? '4px 8px' : '0',
          background: lockupColor === 'white' ? 'rgba(0,0,0,0.7)' : 'transparent',
          borderRadius: '2px'
        }}>
          <span style={{ 
            fontSize: format === 'says' ? '12px' : '18px',
            fontWeight: 'bold',
            color: lockupColor === 'black' ? '#000000' : '#FFFFFF'
          }}>
            drinkaware.co.uk
          </span>
        </div>
        <p style={{ 
          fontSize: '0.7rem', 
          color: lockupColor === 'white' ? '#FFFFFF' : 'var(--text-secondary)', 
          marginTop: '8px' 
        }}>
          Preview (min {format === 'says' ? '12' : '20'}px height)
        </p>
      </div>

      {/* Add Button */}
      <button
        onClick={addDrinkwareLockup}
        className="btn-primary"
        style={{ 
          width: '100%',
          background: '#E31837',
          borderColor: '#E31837'
        }}
      >
        <AlertCircle size={16} />
        Add Drinkaware Lock-up
      </button>

      {/* Warning */}
      <div style={{ 
        marginTop: 'var(--spacing-md)',
        padding: 'var(--spacing-sm)',
        background: '#FFE6E6',
        borderRadius: 'var(--radius-md)',
        fontSize: '0.7rem',
        color: '#C00'
      }}>
        ⚠️ <strong>Required:</strong> All alcohol campaigns must include the Drinkaware lock-up with:
        <ul style={{ margin: '4px 0 0 16px', padding: 0 }}>
          <li>Minimum {format === 'says' ? '12' : '20'}px height</li>
          <li>All-black or all-white color only</li>
          <li>Sufficient contrast from background</li>
        </ul>
      </div>
    </div>
  );
};

export default DrinkwareLockup;
