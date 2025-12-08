/**
 * Text Effects Component
 * Add shadows, outlines, and effects to text elements
 */

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Type, Sparkles } from 'lucide-react';
import useCreativeStore from '../store/creativeStore';
import toast from 'react-hot-toast';

const TextEffects = () => {
  const { canvas } = useCreativeStore();
  const [selectedText, setSelectedText] = useState(null);
  const [shadowColor, setShadowColor] = useState('#000000');
  const [shadowBlur, setShadowBlur] = useState(10);
  const [shadowOffsetX, setShadowOffsetX] = useState(4);
  const [shadowOffsetY, setShadowOffsetY] = useState(4);
  const [outlineColor, setOutlineColor] = useState('#FFFFFF');
  const [outlineWidth, setOutlineWidth] = useState(2);

  useEffect(() => {
    if (!canvas) return;

    const handleSelection = () => {
      const activeObject = canvas.getActiveObject();
      if (activeObject && (activeObject.type === 'i-text' || activeObject.type === 'text' || activeObject.type === 'textbox')) {
        setSelectedText(activeObject);
      } else {
        setSelectedText(null);
      }
    };

    canvas.on('selection:created', handleSelection);
    canvas.on('selection:updated', handleSelection);
    canvas.on('selection:cleared', () => setSelectedText(null));

    return () => {
      canvas.off('selection:created', handleSelection);
      canvas.off('selection:updated', handleSelection);
      canvas.off('selection:cleared');
    };
  }, [canvas]);

  const applyTextShadow = () => {
    if (!selectedText) {
      toast.error('Please select a text element first');
      return;
    }

    // Use fabric.Shadow object
    selectedText.set('shadow', new fabric.Shadow({
      color: shadowColor,
      blur: shadowBlur,
      offsetX: shadowOffsetX,
      offsetY: shadowOffsetY,
    }));

    canvas.renderAll();
    toast.success('Text shadow applied!');
  };

  const removeTextShadow = () => {
    if (!selectedText) {
      toast.error('Please select a text element first');
      return;
    }

    selectedText.set('shadow', null);
    canvas.renderAll();
    toast.success('Text shadow removed!');
  };

  const applyTextOutline = () => {
    if (!selectedText) {
      toast.error('Please select a text element first');
      return;
    }

    selectedText.set({
      stroke: outlineColor,
      strokeWidth: outlineWidth,
    });

    canvas.renderAll();
    toast.success('Text outline applied!');
  };

  const removeTextOutline = () => {
    if (!selectedText) {
      toast.error('Please select a text element first');
      return;
    }

    selectedText.set({
      stroke: null,
      strokeWidth: 0,
    });

    canvas.renderAll();
    toast.success('Text outline removed!');
  };

  return (
    <div style={{
      marginTop: 'var(--spacing-lg)',
      paddingTop: 'var(--spacing-lg)',
      borderTop: '1px solid var(--border)'
    }}>
      <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--spacing-md)' }}>
        <Sparkles size={18} />
        Text Effects
      </h3>

      {!selectedText && (
        <div style={{
          padding: 'var(--spacing-md)',
          background: '#FEF3C7',
          borderRadius: '8px',
          border: '1px solid #FDE68A',
          marginBottom: 'var(--spacing-md)'
        }}>
          <p style={{ fontSize: '0.75rem', color: '#92400E', margin: 0 }}>
            <Type size={14} style={{ display: 'inline', marginRight: '4px' }} />
            Select a text element to apply effects
          </p>
        </div>
      )}

      {/* Text Shadow Section */}
      <div style={{ marginBottom: 'var(--spacing-lg)' }}>
        <h4 style={{ fontSize: '0.875rem', marginBottom: 'var(--spacing-sm)', color: '#374151' }}>
          Text Shadow
        </h4>

        <div style={{ marginBottom: 'var(--spacing-sm)' }}>
          <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
            Shadow Color
          </label>
          <input
            type="color"
            value={shadowColor}
            onChange={(e) => setShadowColor(e.target.value)}
            style={{ width: '100%', height: '36px', cursor: 'pointer', borderRadius: '4px' }}
          />
        </div>

        <div style={{ marginBottom: 'var(--spacing-sm)' }}>
          <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
            Blur: {shadowBlur}px
          </label>
          <input
            type="range"
            min="0"
            max="50"
            value={shadowBlur}
            onChange={(e) => setShadowBlur(parseInt(e.target.value))}
            style={{ width: '100%' }}
          />
        </div>

        <div style={{ display: 'flex', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-sm)' }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
              Offset X: {shadowOffsetX}px
            </label>
            <input
              type="range"
              min="-50"
              max="50"
              value={shadowOffsetX}
              onChange={(e) => setShadowOffsetX(parseInt(e.target.value))}
              style={{ width: '100%' }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
              Offset Y: {shadowOffsetY}px
            </label>
            <input
              type="range"
              min="-50"
              max="50"
              value={shadowOffsetY}
              onChange={(e) => setShadowOffsetY(parseInt(e.target.value))}
              style={{ width: '100%' }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
          <button
            onClick={applyTextShadow}
            className="btn-primary"
            style={{ flex: 1, fontSize: '0.75rem', padding: '8px' }}
            disabled={!selectedText}
          >
            Apply Shadow
          </button>
          <button
            onClick={removeTextShadow}
            className="btn-outline"
            style={{ flex: 1, fontSize: '0.75rem', padding: '8px' }}
            disabled={!selectedText}
          >
            Remove
          </button>
        </div>
      </div>

      {/* Text Outline Section */}
      <div>
        <h4 style={{ fontSize: '0.875rem', marginBottom: 'var(--spacing-sm)', color: '#374151' }}>
          Text Outline
        </h4>

        <div style={{ marginBottom: 'var(--spacing-sm)' }}>
          <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
            Outline Color
          </label>
          <input
            type="color"
            value={outlineColor}
            onChange={(e) => setOutlineColor(e.target.value)}
            style={{ width: '100%', height: '36px', cursor: 'pointer', borderRadius: '4px' }}
          />
        </div>

        <div style={{ marginBottom: 'var(--spacing-sm)' }}>
          <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
            Outline Width: {outlineWidth}px
          </label>
          <input
            type="range"
            min="0"
            max="20"
            value={outlineWidth}
            onChange={(e) => setOutlineWidth(parseInt(e.target.value))}
            style={{ width: '100%' }}
          />
        </div>

        <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
          <button
            onClick={applyTextOutline}
            className="btn-primary"
            style={{ flex: 1, fontSize: '0.75rem', padding: '8px' }}
            disabled={!selectedText}
          >
            Apply Outline
          </button>
          <button
            onClick={removeTextOutline}
            className="btn-outline"
            style={{ flex: 1, fontSize: '0.75rem', padding: '8px' }}
            disabled={!selectedText}
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  );
};

TextEffects.propTypes = {};

export default TextEffects;
