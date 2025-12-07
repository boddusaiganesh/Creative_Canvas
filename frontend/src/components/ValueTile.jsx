/**
 * Value Tile Component
 * Tesco-branded value tiles (New, White, Clubcard)
 */

import React, { useState } from 'react';
import { Tag, DollarSign } from 'lucide-react';
import { fabric } from 'fabric';
import useCreativeStore from '../store/creativeStore';
import toast from 'react-hot-toast';

const ValueTile = () => {
  const { canvas, canvasWidth, canvasHeight, format, addElement } = useCreativeStore();
  const [selectedType, setSelectedType] = useState('new');
  const [price, setPrice] = useState('£2.50');
  const [regularPrice, setRegularPrice] = useState('£3.00');

  const valueTileTypes = {
    new: {
      name: 'NEW Tile',
      bgColor: '#E31837', // Tesco Red
      textColor: '#FFFFFF',
      description: 'Highlight new products'
    },
    white: {
      name: 'White Price Tile',
      bgColor: '#FFFFFF',
      textColor: '#00539F', // Tesco Blue
      description: 'Standard price display'
    },
    clubcard: {
      name: 'Clubcard Price Tile',
      bgColor: '#00539F', // Tesco Blue
      textColor: '#FFFFFF',
      description: 'Clubcard member pricing'
    }
  };

  const addValueTileToCanvas = () => {
    if (!canvas) {
      toast.error('Canvas not initialized');
      return;
    }

    const tileSize = 140;
    const config = valueTileTypes[selectedType];

    // Predefined position (top-left, respecting safe zones)
    let posX = 20;
    let posY = 20;

    // For 9:16 format, respect 200px top safe zone
    if (format === '9:16') {
      posY = 210;
    }

    // Create tile background
    const tileGroup = new fabric.Group([], {
      left: posX,
      top: posY,
      selectable: true,
      hasControls: true,
      hasBorders: true,
      lockRotation: true, // Value tiles shouldn't rotate
    });

    // Background rectangle
    const background = new fabric.Rect({
      width: tileSize,
      height: tileSize,
      fill: config.bgColor,
      stroke: selectedType === 'white' ? '#CCCCCC' : null,
      strokeWidth: selectedType === 'white' ? 2 : 0,
    });

    tileGroup.addWithUpdate(background);

    // Add text based on type
    if (selectedType === 'new') {
      const newText = new fabric.Text('NEW', {
        fontSize: 42,
        fontFamily: 'Arial',
        fontWeight: 'bold',
        fill: config.textColor,
        originX: 'center',
        originY: 'center',
        left: tileSize / 2,
        top: tileSize / 2,
      });
      tileGroup.addWithUpdate(newText);

    } else if (selectedType === 'white') {
      const priceText = new fabric.Text(price, {
        fontSize: 38,
        fontFamily: 'Arial',
        fontWeight: 'bold',
        fill: config.textColor,
        originX: 'center',
        originY: 'center',
        left: tileSize / 2,
        top: tileSize / 2,
      });
      tileGroup.addWithUpdate(priceText);

    } else if (selectedType === 'clubcard') {
      // Clubcard label
      const clubcardLabel = new fabric.Text('Clubcard', {
        fontSize: 16,
        fontFamily: 'Arial',
        fontWeight: 'normal',
        fill: config.textColor,
        originX: 'center',
        originY: 'center',
        left: tileSize / 2,
        top: 25,
      });
      tileGroup.addWithUpdate(clubcardLabel);

      // Offer price
      const offerPriceText = new fabric.Text(price, {
        fontSize: 36,
        fontFamily: 'Arial',
        fontWeight: 'bold',
        fill: config.textColor,
        originX: 'center',
        originY: 'center',
        left: tileSize / 2,
        top: 60,
      });
      tileGroup.addWithUpdate(offerPriceText);

      // Regular price
      if (regularPrice) {
        const regularPriceText = new fabric.Text(`RRP: ${regularPrice}`, {
          fontSize: 14,
          fontFamily: 'Arial',
          fontWeight: 'normal',
          fill: config.textColor,
          originX: 'center',
          originY: 'center',
          left: tileSize / 2,
          top: 105,
        });
        tileGroup.addWithUpdate(regularPriceText);
      }
    }

    // Add custom properties for export
    tileGroup.set({
      id: `value_tile_${Date.now()}`,
      tile_type: selectedType,
      price: selectedType !== 'new' ? price : null,
      regular_price: selectedType === 'clubcard' ? regularPrice : null,
    });
    
    // Store as custom properties for serialization
    tileGroup.tile_type = selectedType;
    tileGroup.price = selectedType !== 'new' ? price : null;
    tileGroup.regular_price = selectedType === 'clubcard' ? regularPrice : null;

    canvas.add(tileGroup);
    canvas.setActiveObject(tileGroup);
    canvas.renderAll();

    // Add to store
    addElement({
      id: tileGroup.id,
      type: 'value_tile',
      tile_type: selectedType,
      x: posX,
      y: posY,
      width: tileSize,
      height: tileSize,
      price: selectedType !== 'new' ? price : null,
      regular_price: selectedType === 'clubcard' ? regularPrice : null,
      zIndex: canvas.getObjects().length,
    });

    toast.success(`${config.name} added to canvas`);
  };

  return (
    <div style={{ marginBottom: 'var(--spacing-lg)' }}>
      <h4 style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '8px',
        marginBottom: 'var(--spacing-sm)'
      }}>
        <Tag size={18} style={{ color: 'var(--primary)' }} />
        Tesco Value Tiles
      </h4>

      <p style={{ 
        fontSize: '0.75rem', 
        color: 'var(--text-secondary)', 
        marginBottom: 'var(--spacing-md)' 
      }}>
        Add official Tesco value tiles (position locked per guidelines)
      </p>

      {/* Tile Type Selection */}
      <div style={{ marginBottom: 'var(--spacing-md)' }}>
        <label style={{ 
          display: 'block', 
          marginBottom: 'var(--spacing-xs)',
          fontSize: '0.875rem',
          fontWeight: '500'
        }}>
          Tile Type
        </label>
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          style={{ width: '100%' }}
        >
          {Object.entries(valueTileTypes).map(([key, config]) => (
            <option key={key} value={key}>
              {config.name}
            </option>
          ))}
        </select>
        <small style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
          {valueTileTypes[selectedType].description}
        </small>
      </div>

      {/* Price Input (White and Clubcard only) */}
      {selectedType !== 'new' && (
        <div style={{ marginBottom: 'var(--spacing-md)' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: 'var(--spacing-xs)',
            fontSize: '0.875rem',
            fontWeight: '500'
          }}>
            {selectedType === 'clubcard' ? 'Clubcard Price' : 'Price'}
          </label>
          <input
            type="text"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="£2.50"
            style={{ width: '100%' }}
          />
        </div>
      )}

      {/* Regular Price (Clubcard only) */}
      {selectedType === 'clubcard' && (
        <div style={{ marginBottom: 'var(--spacing-md)' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: 'var(--spacing-xs)',
            fontSize: '0.875rem',
            fontWeight: '500'
          }}>
            Regular Price (RRP)
          </label>
          <input
            type="text"
            value={regularPrice}
            onChange={(e) => setRegularPrice(e.target.value)}
            placeholder="£3.00"
            style={{ width: '100%' }}
          />
        </div>
      )}

      {/* Preview */}
      <div style={{ 
        marginBottom: 'var(--spacing-md)',
        padding: 'var(--spacing-md)',
        background: 'var(--bg-secondary)',
        borderRadius: 'var(--radius-md)',
        textAlign: 'center'
      }}>
        <div style={{ 
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100px',
          height: '100px',
          background: valueTileTypes[selectedType].bgColor,
          color: valueTileTypes[selectedType].textColor,
          borderRadius: '4px',
          fontWeight: 'bold',
          border: selectedType === 'white' ? '2px solid #CCCCCC' : 'none'
        }}>
          {selectedType === 'new' && <span style={{ fontSize: '28px' }}>NEW</span>}
          {selectedType === 'white' && <span style={{ fontSize: '24px' }}>{price}</span>}
          {selectedType === 'clubcard' && (
            <>
              <span style={{ fontSize: '12px', marginBottom: '4px' }}>Clubcard</span>
              <span style={{ fontSize: '22px' }}>{price}</span>
              {regularPrice && <span style={{ fontSize: '10px', marginTop: '4px' }}>RRP: {regularPrice}</span>}
            </>
          )}
        </div>
        <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '8px' }}>
          Preview
        </p>
      </div>

      {/* Add Button */}
      <button
        onClick={addValueTileToCanvas}
        className="btn-primary"
        style={{ width: '100%' }}
      >
        <DollarSign size={16} />
        Add Value Tile
      </button>

      {/* Warning */}
      <div style={{ 
        marginTop: 'var(--spacing-md)',
        padding: 'var(--spacing-sm)',
        background: '#FFF9E6',
        borderRadius: 'var(--radius-md)',
        fontSize: '0.7rem',
        color: '#856404'
      }}>
        ⚠️ Value tiles have predefined positions and cannot overlap with other content
      </div>
    </div>
  );
};

export default ValueTile;
