/**
 * Premium Sidebar Component - World Class UI
 * Left panel with asset library and creative controls
 */

import React, {useRef, useState} from 'react';
import {Upload, Image, Type, Square, Palette, Sparkles} from 'lucide-react';
import {fabric} from 'fabric';
import useCreativeStore from '../store/creativeStore';
import {uploadFile, removeBackground, getLayoutSuggestions} from '../services/api';
import toast from 'react-hot-toast';
import ValueTile from './ValueTile';
import TescoTag from './TescoTag';
import DrinkwareLockup from './DrinkwareLockup';
import LayoutSuggestionsModal from './LayoutSuggestionsModal';

const Sidebar = () => {
    const {
        uploadedAssets,
        addUploadedAsset,
        brandColors,
        addBrandColor,
        setBackgroundColor,
        backgroundColor,
        canvasWidth,
        canvasHeight,
        format,
        setLayoutSuggestions,
        canvas,
        addElement,
    } = useCreativeStore();

    const fileInputRef = useRef(null);
    const [activeTab, setActiveTab] = useState('assets');
    const [showLayoutModal, setShowLayoutModal] = useState(false);

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        try {
            toast.loading('Uploading...', {id: 'upload'});
            const result = await uploadFile(file);

            if (result.success) {
                addUploadedAsset({
                    id: Date.now(),
                    filename: result.filename,
                    path: result.file_path,
                    type: file.type.startsWith('image/') ? 'image' : 'file',
                });
                toast.success('File uploaded!', {id: 'upload'});
            }
        } catch (error) {
            console.error('Upload error:', error);
            toast.error('Upload failed', {id: 'upload'});
        }
    };

    const handleRemoveBackground = async (asset) => {
        try {
            console.log('🔬 DEBUG: handleRemoveBackground called');
            console.log('  Asset:', asset);
            console.log('  Asset path:', asset.path);
            
            toast.loading('Removing background...', {id: 'rembg'});
            
            console.log('📡 Calling removeBackground API...');
            const result = await removeBackground(asset.path);
            
            console.log('📬 API Response:', result);

            if (result.success) {
                console.log('✅ Background removed successfully');
                console.log('  Output path:', result.output_path);
                
                addUploadedAsset({
                    id: Date.now(),
                    filename: `no_bg_${asset.filename}`,
                    path: result.output_path,
                    type: 'image',
                });
                toast.success('Background removed!', {id: 'rembg'});
                console.log('✅ New asset added to library');
            } else {
                console.error('❌ Background removal failed:', result.message);
                toast.error(result.message || 'Background removal failed', {id: 'rembg'});
            }
        } catch (error) {
            console.error('❌ Background removal error:', error);
            console.error('  Error details:', error.message);
            toast.error('Background removal failed: ' + error.message, {id: 'rembg'});
        }
    };

    const handleGetLayoutSuggestions = async () => {
        try {
            toast.loading('Generating layouts...', {id: 'layouts'});
            const result = await getLayoutSuggestions(canvasWidth, canvasHeight, format);

            if (result.success && result.layouts && result.layouts.length > 0) {
                setLayoutSuggestions(result.layouts);
                toast.success(`${result.layouts.length} layouts generated!`, {id: 'layouts'});
                // Open the modal to show layouts
                setShowLayoutModal(true);
            } else {
                toast.error('No layouts generated', {id: 'layouts'});
            }
        } catch (error) {
            console.error('Layout generation error:', error);
            toast.error('Failed to generate layouts: ' + error.message, {id: 'layouts'});
        }
    };

    const handleAddToCanvas = (asset) => {
        console.log('🔍 DEBUG: handleAddToCanvas called');
        console.log('  Asset:', asset);
        console.log('  Canvas object:', canvas);
        console.log('  Canvas exists:', !!canvas);
        
        if (!canvas) {
            toast.error('Canvas not initialized. Please wait...');
            console.error('❌ Canvas is null or undefined');
            return;
        }

        console.log('✅ Canvas is initialized');
        console.log('  Canvas width:', canvas.getWidth());
        console.log('  Canvas height:', canvas.getHeight());
        console.log('  Current objects on canvas:', canvas.getObjects().length);

        const loadingToastId = 'add-canvas-' + Date.now();
        toast.loading('Loading image...', {id: loadingToastId});

        // Full URL for the image - fix path separators and ensure proper format
        let imagePath = asset.path.replace(/\\/g, '/'); // Replace backslashes with forward slashes
        if (imagePath.startsWith('./')) {
            imagePath = imagePath.substring(2); // Remove './' prefix
        }
        if (!imagePath.startsWith('/')) {
            imagePath = '/' + imagePath; // Ensure starts with /
        }
        const imageUrl = `http://localhost:8000${imagePath}`;
        console.log('📷 Loading image from:', imageUrl);

        // Add image to canvas using Fabric.js
        fabric.Image.fromURL(imageUrl, (img, isError) => {
            console.log('🎨 Fabric.Image.fromURL callback fired');
            console.log('  Image object:', img);
            console.log('  Is error:', isError);
            
            if (isError || !img) {
                console.error('❌ Failed to load image');
                console.error('Image URL was:', imageUrl);
                console.error('Error details:', isError);
                toast.error('Failed to load image. Check console for details.', {id: loadingToastId});
                return;
            }

            console.log('✅ Image loaded via Fabric');
            console.log('  Image dimensions:', img.width, 'x', img.height);

            // Scale to fit canvas
            const maxWidth = canvasWidth * 0.6;
            const maxHeight = canvasHeight * 0.6;
            const scale = Math.min(maxWidth / img.width, maxHeight / img.height, 1);

            console.log('📏 Scaling image:');
            console.log('  Original size:', img.width, 'x', img.height);
            console.log('  Scale factor:', scale);
            console.log('  Canvas size:', canvasWidth, 'x', canvasHeight);

            // Add slight offset for multiple images so they don't stack exactly on top of each other
            const existingImages = canvas.getObjects().filter(obj => obj.type === 'image');
            const offset = existingImages.length * 30; // 30px offset for each additional image
            
            const left = canvasWidth / 2 - (img.width * scale) / 2 + offset;
            const top = canvasHeight / 2 - (img.height * scale) / 2 + offset;

            img.set({
                left: left,
                top: top,
                scaleX: scale,
                scaleY: scale,
                selectable: true,
                hasControls: true,
                hasBorders: true,
            });

            console.log('📍 Image position:', left, top);
            console.log('🎯 Adding image to canvas...');

            canvas.add(img);
            console.log('✅ Image added to canvas');
            
            // Bring to front so it's visible on top of other objects
            canvas.bringToFront(img);
            console.log('✅ Image brought to front');
            
            canvas.setActiveObject(img);
            console.log('✅ Image set as active');
            
            canvas.renderAll();
            console.log('✅ Canvas rendered');
            console.log('📊 Total objects on canvas:', canvas.getObjects().length);

            // Add to store
            addElement({
                id: img.id || Date.now().toString(),
                type: 'image',
                src: asset.path,
                x: img.left,
                y: img.top,
                width: img.width * img.scaleX,
                height: img.height * img.scaleY,
                rotation: img.angle || 0,
                opacity: img.opacity || 1,
                zIndex: canvas.getObjects().length,
            });

            toast.success('✅ Added to canvas!', {id: loadingToastId});
            console.log('🎉 SUCCESS: Image added successfully to canvas');
            console.log('   Image is now at position:', left, ',', top);
            console.log('   Image size on canvas:', img.width * scale, 'x', img.height * scale);
        }, {crossOrigin: 'anonymous'});
    };

    const handleAddText = () => {
        if (!canvas) {
            toast.error('Canvas not initialized');
            return;
        }

        console.log('📝 Adding editable text to canvas...');

        // Use IText for editable text (not Text!)
        const text = new fabric.IText('Edit Text', {
            left: canvasWidth / 2 - 100,
            top: canvasHeight / 2 - 20,
            fontSize: 32,
            fill: '#000000',
            fontFamily: 'Arial',
            fontWeight: 'bold',
            editable: true,
            selectable: true,
            hasControls: true,
            hasBorders: true,
        });

        console.log('✅ IText object created (editable)');

        canvas.add(text);
        canvas.setActiveObject(text);
        canvas.renderAll();

        // Automatically enter edit mode and select all text
        setTimeout(() => {
            text.enterEditing();
            text.selectAll();
        }, 100);

        console.log('✅ Text added to canvas in edit mode');

        addElement({
            id: text.id || Date.now().toString(),
            type: 'text',
            text: text.text,
            x: text.left,
            y: text.top,
            fontSize: text.fontSize,
            fill: text.fill,
            fontFamily: text.fontFamily,
            zIndex: canvas.getObjects().length,
        });

        toast.success('Text added - Double-click to edit');
        console.log('✅ Text element added to store');
    };

    const handleAddShape = (shapeType) => {
        if (!canvas) {
            toast.error('Canvas not initialized');
            return;
        }

        let shape;
        const options = {
            left: canvasWidth / 2 - 50,
            top: canvasHeight / 2 - 50,
            fill: backgroundColor === '#FFFFFF' ? '#E0E0E0' : '#FFFFFF',
            stroke: '#000000',
            strokeWidth: 2,
        };

        if (shapeType === 'rectangle') {
            shape = new fabric.Rect({
                ...options,
                width: 100,
                height: 100,
            });
        } else if (shapeType === 'circle') {
            shape = new fabric.Circle({
                ...options,
                radius: 50,
            });
        }

        canvas.add(shape);
        canvas.setActiveObject(shape);
        canvas.renderAll();

        toast.success('Shape added');
    };

    return (
        <aside className="sidebar">
            {/* Tabs */}
            <div className="flex" style={{borderBottom: '1px solid var(--border)'}}>
                <button
                    className={`flex-1 py-3 ${activeTab === 'assets' ? 'border-b-2 border-blue-500' : ''}`}
                    onClick={() => setActiveTab('assets')}
                    style={{border: 'none', background: activeTab === 'assets' ? 'var(--bg-secondary)' : 'transparent'}}
                >
                    <Image size={18} style={{display: 'inline-block', marginRight: '4px'}}/>
                    Assets
                </button>
                <button
                    className={`flex-1 py-3 ${activeTab === 'elements' ? 'border-b-2 border-blue-500' : ''}`}
                    onClick={() => setActiveTab('elements')}
                    style={{
                        border: 'none',
                        background: activeTab === 'elements' ? 'var(--bg-secondary)' : 'transparent'
                    }}
                >
                    <Square size={18} style={{display: 'inline-block', marginRight: '4px'}}/>
                    Elements
                </button>
                <button
                    className={`flex-1 py-3 ${activeTab === 'colors' ? 'border-b-2 border-blue-500' : ''}`}
                    onClick={() => setActiveTab('colors')}
                    style={{border: 'none', background: activeTab === 'colors' ? 'var(--bg-secondary)' : 'transparent'}}
                >
                    <Palette size={18} style={{display: 'inline-block', marginRight: '4px'}}/>
                    Colors
                </button>
            </div>

            {/* Assets Tab */}
            {activeTab === 'assets' && (
                <div className="sidebar-section">
                    <h3>Asset Library</h3>

                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/png,image/jpeg,image/jpg,image/webp,image/gif,image/svg+xml"
                        onChange={handleFileUpload}
                        style={{display: 'none'}}
                    />

                    <button
                        onClick={() => fileInputRef.current.click()}
                        className="btn-outline"
                        style={{width: '100%', marginBottom: 'var(--spacing-md)'}}
                        title="Supported: PNG, JPEG, JPG, WEBP, GIF, SVG, BMP, TIFF"
                    >
                        <Upload size={18}/>
                        Upload Image
                    </button>
                    <small style={{display: 'block', color: 'var(--text-secondary)', fontSize: '0.75rem', marginTop: '-8px', marginBottom: '12px', textAlign: 'center'}}>
                        PNG, JPEG, WEBP, GIF, SVG, BMP, TIFF
                    </small>

                    <div className="asset-grid">
                        {uploadedAssets.map((asset) => {
                            // Fix path for display
                            let displayPath = asset.path.replace(/\\/g, '/');
                            if (displayPath.startsWith('./')) {
                                displayPath = displayPath.substring(2);
                            }
                            if (!displayPath.startsWith('/')) {
                                displayPath = '/' + displayPath;
                            }
                            const imageUrl = `http://localhost:8000${displayPath}`;
                            
                            return (
                            <div key={asset.id} className="asset-item" style={{position: 'relative'}}>
                                <img
                                    src={imageUrl}
                                    alt={asset.filename}
                                    onClick={() => {
                                        console.log('🖱️ Image clicked!', asset.filename);
                                        handleAddToCanvas(asset);
                                    }}
                                    onContextMenu={(e) => {
                                        e.preventDefault();
                                        handleRemoveBackground(asset);
                                    }}
                                    title="Click to add to canvas, right-click to remove background"
                                    style={{cursor: 'pointer'}}
                                />
                                <button
                                    onClick={() => handleAddToCanvas(asset)}
                                    style={{
                                        position: 'absolute',
                                        bottom: '8px',
                                        right: '8px',
                                        background: 'rgba(0, 83, 159, 0.9)',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        padding: '4px 8px',
                                        fontSize: '11px',
                                        cursor: 'pointer',
                                        fontWeight: '600'
                                    }}
                                    title="Add to canvas"
                                >
                                    + Add
                                </button>
                            </div>
                            );
                        })}
                    </div>

                    {uploadedAssets.length === 0 && (
                        <p className="text-center text-secondary" style={{marginTop: 'var(--spacing-lg)'}}>
                            Upload images to get started
                        </p>
                    )}
                </div>
            )}

            {/* Elements Tab */}
            {activeTab === 'elements' && (
                <div className="sidebar-section">
                    <h3>Add Elements</h3>

                    <div className="flex flex-col gap-sm">
                        <button onClick={handleAddText} className="btn-outline" style={{width: '100%'}}>
                            <Type size={18}/>
                            Add Text
                        </button>

                        <button onClick={() => handleAddShape('rectangle')} className="btn-outline"
                                style={{width: '100%'}}>
                            <Square size={18}/>
                            Add Rectangle
                        </button>

                        <button onClick={() => handleAddShape('circle')} className="btn-outline"
                                style={{width: '100%'}}>
                            <Square size={18}/>
                            Add Circle
                        </button>
                    </div>

                    <div style={{marginTop: 'var(--spacing-xl)', paddingTop: 'var(--spacing-xl)', borderTop: '1px solid var(--border)'}}>
                        <ValueTile />
                    </div>

                    <div style={{marginTop: 'var(--spacing-lg)', paddingTop: 'var(--spacing-lg)', borderTop: '1px solid var(--border)'}}>
                        <TescoTag />
                    </div>

                    <div style={{marginTop: 'var(--spacing-lg)', paddingTop: 'var(--spacing-lg)', borderTop: '1px solid var(--border)'}}>
                        <DrinkwareLockup />
                    </div>

                    <div style={{marginTop: 'var(--spacing-xl)', paddingTop: 'var(--spacing-xl)', borderTop: '2px solid var(--primary)'}}>
                        <h3>AI Layout Suggestions</h3>
                        <button onClick={handleGetLayoutSuggestions} className="btn-primary" style={{width: '100%'}}>
                            <Sparkles size={18}/>
                            Generate Layouts
                        </button>
                    </div>
                </div>
            )}

            {/* Colors Tab */}
            {activeTab === 'colors' && (
                <div className="sidebar-section">
                    <h3>Background Color</h3>

                    <div className="color-palette">
                        {brandColors.map((color) => (
                            <div
                                key={color}
                                className={`color-swatch ${backgroundColor === color ? 'selected' : ''}`}
                                style={{backgroundColor: color}}
                                onClick={() => setBackgroundColor(color)}
                                title={color}
                            />
                        ))}
                    </div>

                    <div style={{marginTop: 'var(--spacing-md)'}}>
                        <input
                            type="color"
                            value={backgroundColor}
                            onChange={(e) => setBackgroundColor(e.target.value)}
                            style={{width: '100%', height: '40px', cursor: 'pointer'}}
                        />
                    </div>

                    <div style={{marginTop: 'var(--spacing-lg)'}}>
                        <h3>Brand Colors</h3>
                        <div className="color-palette">
                            {brandColors.map((color) => (
                                <div
                                    key={color}
                                    className="color-swatch"
                                    style={{backgroundColor: color}}
                                    title={color}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Layout Suggestions Modal */}
            <LayoutSuggestionsModal 
                isOpen={showLayoutModal} 
                onClose={() => setShowLayoutModal(false)} 
            />
        </aside>
    );
};

export default Sidebar;
