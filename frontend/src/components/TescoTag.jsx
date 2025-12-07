/**
 * Tesco Tag Component
 * Official Tesco tags with predefined text options
 */

import React, { useState } from 'react';
import { Tag as TagIcon } from 'lucide-react';
import { fabric } from 'fabric';
import useCreativeStore from '../store/creativeStore';
import toast from 'react-hot-toast';

const TescoTag = () => {
  const { canvas, canvasHeight, format, addElement, tagText, setTagText } = useCreativeStore();
  const [endDate, setEndDate] = useState('');

  const approvedTags = [
    'Only at Tesco',
    'Available at Tesco',
    'Selected stores. While stocks last.',
  ];

  const addTagToCanvas = () => {
    if (!canvas) {
      toast.error('Canvas not initialized');
      return;
    }

    if (!tagText) {
      toast.error('Please select a tag text');
      return;
    }

    // Check if clubcard tag requires end date
    if (tagText.includes('Clubcard') && !endDate) {
      toast.error('Clubcard tags require an end date (DD/MM)');
      return;
    }

    // Validate DD/MM format for clubcard
    if (endDate && !/^\d{2}\/\d{2}$/.test(endDate)) {
      toast.error('End date must be in DD/MM format (e.g., 23/06)');
      return;
    }

    // Build final tag text
    let finalTagText = tagText;
    if (tagText.includes('Clubcard') && endDate) {
      finalTagText = `Available in selected stores. Clubcard/app required. Ends ${endDate}`;
    }

    // Position at bottom of canvas
    const posY = canvasHeight - 80; // 80px from bottom
    const posX = 20; // 20px from left

    // Create tag background
    const tagWidth = finalTagText.length * 7 + 40; // Approximate width
    const tagHeight = 40;

    const tagBackground = new fabric.Rect({
      width: tagWidth,
      height: tagHeight,
      fill: '#00539F', // Tesco Blue
      rx: 4,
      ry: 4,
    });

    // Create tag text
    const tagTextObj = new fabric.Text(finalTagText, {
      fontSize: 14,
      fontFamily: 'Arial',
      fontWeight: '500',
      fill: '#FFFFFF',
      left: 20,
      top: 12,
    });

    // Group them together
    const tagGroup = new fabric.Group([tagBackground, tagTextObj], {
      left: posX,
      top: posY,
      selectable: true,
      hasControls: true,
      hasBorders: true,
      lockRotation: true,
    });

    // Add custom properties
    tagGroup.set({
      id: `tesco_tag_${Date.now()}`,
      text: finalTagText,
    });
    
    // Store as custom properties for serialization
    tagGroup.tag_text = finalTagText;
    tagGroup.text = finalTagText;

    canvas.add(tagGroup);
    canvas.setActiveObject(tagGroup);
    canvas.renderAll();

    // Add to store
    addElement({
      id: tagGroup.id,
      type: 'tag',
      text: finalTagText,
      x: posX,
      y: posY,
      width: tagWidth,
      height: tagHeight,
      zIndex: canvas.getObjects().length,
    });

    toast.success('Tesco tag added to canvas');
  };

  return (
    <div style={{ marginBottom: 'var(--spacing-lg)' }}>
      <h4 style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '8px',
        marginBottom: 'var(--spacing-sm)'
      }}>
        <TagIcon size={18} style={{ color: 'var(--primary)' }} />
        Tesco Tags
      </h4>

      <p style={{ 
        fontSize: '0.75rem', 
        color: 'var(--text-secondary)', 
        marginBottom: 'var(--spacing-md)' 
      }}>
        Add official Tesco tags (positioned at bottom)
      </p>

      {/* Tag Selection */}
      <div style={{ marginBottom: 'var(--spacing-md)' }}>
        <label style={{ 
          display: 'block', 
          marginBottom: 'var(--spacing-xs)',
          fontSize: '0.875rem',
          fontWeight: '500'
        }}>
          Tag Text
        </label>
        <select
          value={tagText}
          onChange={(e) => setTagText(e.target.value)}
          style={{ width: '100%' }}
        >
          <option value="">Select tag...</option>
          {approvedTags.map((tag) => (
            <option key={tag} value={tag}>
              {tag}
            </option>
          ))}
          <option value="clubcard">
            Clubcard Tag (with end date)
          </option>
        </select>
      </div>

      {/* End Date (for Clubcard tags) */}
      {(tagText === 'clubcard' || tagText.includes('Clubcard')) && (
        <div style={{ marginBottom: 'var(--spacing-md)' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: 'var(--spacing-xs)',
            fontSize: '0.875rem',
            fontWeight: '500'
          }}>
            End Date (DD/MM)
          </label>
          <input
            type="text"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            placeholder="23/06"
            maxLength={5}
            style={{ width: '100%' }}
          />
          <small style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
            Format: DD/MM (e.g., 23/06 for June 23rd)
          </small>
        </div>
      )}

      {/* Preview */}
      {tagText && (
        <div style={{ 
          marginBottom: 'var(--spacing-md)',
          padding: 'var(--spacing-md)',
          background: 'var(--bg-secondary)',
          borderRadius: 'var(--radius-md)'
        }}>
          <div style={{ 
            display: 'inline-block',
            padding: '10px 20px',
            background: '#00539F',
            color: '#FFFFFF',
            borderRadius: '4px',
            fontSize: '14px',
            fontWeight: '500'
          }}>
            {tagText === 'clubcard' 
              ? `Available in selected stores. Clubcard/app required. Ends ${endDate || 'DD/MM'}`
              : tagText
            }
          </div>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '8px' }}>
            Preview
          </p>
        </div>
      )}

      {/* Add Button */}
      <button
        onClick={addTagToCanvas}
        className="btn-primary"
        style={{ width: '100%' }}
        disabled={!tagText}
      >
        <TagIcon size={16} />
        Add Tag to Canvas
      </button>

      {/* Info */}
      <div style={{ 
        marginTop: 'var(--spacing-md)',
        padding: 'var(--spacing-sm)',
        background: '#E8F4FF',
        borderRadius: 'var(--radius-md)',
        fontSize: '0.7rem',
        color: '#004085'
      }}>
        ℹ️ Tags must use approved text only. Positioned at bottom of creative.
      </div>
    </div>
  );
};

export default TescoTag;
