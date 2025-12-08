/**
 * Canvas Area Component
 * Main editing canvas using Fabric.js
 */

import React, {useEffect, useRef, useState} from 'react';
import {fabric} from 'fabric';
import {ZoomIn, ZoomOut, Maximize2, RotateCcw, Trash2} from 'lucide-react';
import useCreativeStore from '../store/creativeStore';
import toast from 'react-hot-toast';

const CanvasArea = () => {
    const canvasRef = useRef(null);
    const {
        canvas,
        setCanvas,
        canvasWidth,
        canvasHeight,
        setCanvasSize,
        format,
        backgroundColor,
        updateElement,
        removeElement,
        setSelectedElement,
    } = useCreativeStore();

    const [zoom, setZoom] = useState(1);
    
    // Sync local format with store format
    useEffect(() => {
        // Keep local state in sync with store
    }, [format]);

    // Format presets
    const formats = {
        '1:1': {width: 1080, height: 1080, name: 'Square (1:1)'},
        '9:16': {width: 1080, height: 1920, name: 'Story (9:16)'},
        '1.91:1': {width: 1200, height: 628, name: 'Landscape (1.91:1)'},
        '4:5': {width: 1080, height: 1350, name: 'Portrait (4:5)'},
    };

    // Initialize Fabric.js canvas (only once!)
    useEffect(() => {
        console.log('🎨 Initializing Fabric.js canvas...');
        console.log('  Canvas ref:', canvasRef.current);
        console.log('  Dimensions:', canvasWidth, 'x', canvasHeight);
        
        if (!canvasRef.current) {
            console.error('❌ Canvas ref not ready');
            return;
        }
        
        const fabricCanvas = new fabric.Canvas(canvasRef.current, {
            width: canvasWidth,
            height: canvasHeight,
            backgroundColor: backgroundColor,
            preserveObjectStacking: true,
            renderOnAddRemove: true,
        });

        console.log('✅ Fabric canvas created:', fabricCanvas);
        console.log('  Canvas ID:', fabricCanvas._objects);
        setCanvas(fabricCanvas);
        console.log('✅ Canvas set in store');

        // Event listeners
        fabricCanvas.on('object:modified', (e) => {
            const obj = e.target;
            console.log('Object modified:', obj.type);
            updateElement(obj.id || obj.name, {
                x: obj.left,
                y: obj.top,
                width: obj.width * obj.scaleX,
                height: obj.height * obj.scaleY,
                rotation: obj.angle,
                opacity: obj.opacity,
            });
        });

        fabricCanvas.on('selection:created', (e) => {
            console.log('Selection created:', e.selected);
            setSelectedElement(e.selected[0]);
        });

        fabricCanvas.on('selection:updated', (e) => {
            console.log('Selection updated:', e.selected);
            setSelectedElement(e.selected[0]);
        });

        fabricCanvas.on('selection:cleared', () => {
            console.log('Selection cleared');
            setSelectedElement(null);
        });
        
        fabricCanvas.on('object:added', (e) => {
            console.log('🎉 Object added to canvas:', e.target.type);
            console.log('  Total objects:', fabricCanvas.getObjects().length);
            
            // Debug text objects
            if (e.target.type === 'text' || e.target.type === 'i-text' || e.target.type === 'textbox') {
                console.log('  📝 Text object details:');
                console.log('    Type:', e.target.type);
                console.log('    Editable:', e.target.editable);
                console.log('    Text:', e.target.text);
                
                if (e.target.type === 'text') {
                    console.log('    ⚠️ WARNING: fabric.Text is NOT editable!');
                    console.log('    Use fabric.IText for editable text');
                } else if (e.target.type === 'i-text') {
                    console.log('    ✅ fabric.IText - Double-click to edit');
                }
            }
        });
        
        // Listen for double-click events
        fabricCanvas.on('mouse:dblclick', (e) => {
            console.log('🖱️ DOUBLE-CLICK detected!');
            if (e.target) {
                console.log('  Target type:', e.target.type);
                console.log('  Target editable:', e.target.editable);
                console.log('  Target text:', e.target.text);
                
                if (e.target.type === 'i-text' || e.target.type === 'textbox') {
                    console.log('  ✅ IText/Textbox - Entering edit mode...');
                    e.target.enterEditing();
                    e.target.selectAll();
                } else if (e.target.type === 'text') {
                    console.log('  ❌ ERROR: fabric.Text cannot be edited!');
                    console.log('  Need to use fabric.IText instead');
                    toast.error('This text is not editable. Add new text from Elements tab.');
                }
            } else {
                console.log('  No target (clicked on empty canvas)');
            }
        });
        
        // Listen for text editing events
        fabricCanvas.on('text:editing:entered', (e) => {
            console.log('✅ Text editing STARTED');
            console.log('  Text:', e.target.text);
        });
        
        fabricCanvas.on('text:editing:exited', (e) => {
            console.log('✅ Text editing ENDED');
            console.log('  Final text:', e.target.text);
        });

        return () => {
            console.log('🧹 Cleaning up canvas');
            fabricCanvas.dispose();
        };
    }, []); // Empty dependency array - only run once!

    // Update canvas background color
    useEffect(() => {
        if (canvas) {
            canvas.setBackgroundColor(backgroundColor, canvas.renderAll.bind(canvas));
        }
    }, [backgroundColor, canvas]);

    // Update canvas size when format changes
    useEffect(() => {
        if (canvas) {
            canvas.setDimensions({
                width: canvasWidth,
                height: canvasHeight,
            });
            canvas.renderAll();
        }
    }, [canvasWidth, canvasHeight, canvas]);

    const handleFormatChange = (formatKey) => {
        const formatConfig = formats[formatKey];
        setSelectedFormat(formatKey);
        setCanvasSize(formatConfig.width, formatConfig.height, formatKey);
        toast.success(`Format changed to ${formatConfig.name}`);
    };

    const handleZoomIn = () => {
        if (canvas) {
            const newZoom = Math.min(zoom + 0.1, 3);
            canvas.setZoom(newZoom);
            setZoom(newZoom);
            canvas.renderAll();
        }
    };

    const handleZoomOut = () => {
        if (canvas) {
            const newZoom = Math.max(zoom - 0.1, 0.1);
            canvas.setZoom(newZoom);
            setZoom(newZoom);
            canvas.renderAll();
        }
    };

    const handleResetZoom = () => {
        if (canvas) {
            canvas.setZoom(1);
            setZoom(1);
            canvas.renderAll();
        }
    };

    const handleDeleteSelected = () => {
        if (canvas) {
            const activeObject = canvas.getActiveObject();
            if (activeObject) {
                canvas.remove(activeObject);
                removeElement(activeObject.id || activeObject.name);
                toast.success('Element deleted');
            }
        }
    };

    const handleClearCanvas = () => {
        if (canvas) {
            if (confirm('Clear all elements from canvas?')) {
                canvas.clear();
                canvas.setBackgroundColor(backgroundColor, canvas.renderAll.bind(canvas));
                toast.success('Canvas cleared');
            }
        }
    };

    return (
        <div className="canvas-area">
            {/* Toolbar */}
            <div className="canvas-toolbar">
                {/* Format Selector */}
                <div className="flex gap-sm items-center">
                    <label style={{fontSize: '14px', fontWeight: '500'}}>Format:</label>
                    <select
                        value={format}
                        onChange={(e) => handleFormatChange(e.target.value)}
                        style={{width: '200px'}}
                    >
                        {Object.entries(formats).map(([key, format]) => (
                            <option key={key} value={key}>
                                {format.name} ({format.width}x{format.height})
                            </option>
                        ))}
                    </select>
                </div>

                <div style={{flex: 1}}/>

                {/* Zoom Controls */}
                <div className="flex gap-sm">
                    <button onClick={handleZoomOut} className="btn-text" title="Zoom Out">
                        <ZoomOut size={18}/>
                    </button>

                    <span style={{fontSize: '14px', padding: '0 8px', display: 'flex', alignItems: 'center'}}>
            {Math.round(zoom * 100)}%
          </span>

                    <button onClick={handleZoomIn} className="btn-text" title="Zoom In">
                        <ZoomIn size={18}/>
                    </button>

                    <button onClick={handleResetZoom} className="btn-text" title="Reset Zoom">
                        <Maximize2 size={18}/>
                    </button>
                </div>

                {/* Actions */}
                <div className="flex gap-sm" style={{marginLeft: 'var(--spacing-md)'}}>
                    <button onClick={handleDeleteSelected} className="btn-text" title="Delete Selected">
                        <Trash2 size={18}/>
                    </button>

                    <button onClick={handleClearCanvas} className="btn-text" title="Clear Canvas">
                        <RotateCcw size={18}/>
                    </button>
                </div>
            </div>

            {/* Canvas Container */}
            <div className="canvas-container">
                <div
                    style={{
                        boxShadow: 'var(--shadow-lg)',
                        borderRadius: 'var(--radius-sm)',
                        overflow: 'hidden',
                    }}
                >
                    <canvas ref={canvasRef}/>
                </div>
            </div>
        </div>
    );
};

export default CanvasArea;
