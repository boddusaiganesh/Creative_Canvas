/**
 * Enhanced Debug component - Check text editing
 */
import React, { useEffect, useState } from 'react';
import useCreativeStore from '../store/creativeStore';

const CanvasDebug = () => {
    const { canvas, uploadedAssets } = useCreativeStore();
    const [objectCount, setObjectCount] = useState(0);
    const [textObjects, setTextObjects] = useState([]);
    
    useEffect(() => {
        if (canvas) {
            const updateDebugInfo = () => {
                const objects = canvas.getObjects();
                setObjectCount(objects.length);
                
                // Find all text objects and check their type
                const texts = objects.filter(obj => 
                    obj.type === 'text' || obj.type === 'i-text' || obj.type === 'textbox'
                ).map(obj => ({
                    type: obj.type,
                    text: obj.text,
                    editable: obj.editable,
                    isEditing: obj.isEditing,
                }));
                setTextObjects(texts);
            };
            
            canvas.on('object:added', updateDebugInfo);
            canvas.on('object:removed', updateDebugInfo);
            canvas.on('object:modified', updateDebugInfo);
            canvas.on('selection:created', updateDebugInfo);
            canvas.on('selection:cleared', updateDebugInfo);
            
            updateDebugInfo();
            
            return () => {
                canvas.off('object:added', updateDebugInfo);
                canvas.off('object:removed', updateDebugInfo);
                canvas.off('object:modified', updateDebugInfo);
                canvas.off('selection:created', updateDebugInfo);
                canvas.off('selection:cleared', updateDebugInfo);
            };
        }
    }, [canvas]);
    
    const testCanvas = () => {
        if (canvas) {
            console.log(' TEST: Adding test text with IText');
            const { fabric } = window;
            const text = new fabric.IText('TEST EDITABLE', {
                left: 100,
                top: 100,
                fontSize: 40,
                fill: '#FF0000',
                fontWeight: 'bold',
                editable: true,
            });
            canvas.add(text);
            canvas.setActiveObject(text);
            canvas.renderAll();
            
            // Try to enter edit mode
            setTimeout(() => {
                text.enterEditing();
                text.selectAll();
                console.log('✅ Entered edit mode');
            }, 100);
        }
    };

    if (!canvas) {
        return (
            <div style={{
                position: 'fixed',
                bottom: '20px',
                left: '20px',
                background: '#1a1a1a',
                color: '#fff',
                padding: '16px',
                borderRadius: '8px',
                fontSize: '12px',
                fontFamily: 'monospace',
                zIndex: 9999,
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                minWidth: '250px',
            }}>
                <div style={{ color: '#4CAF50', marginBottom: '8px', fontWeight: 'bold' }}>🔍 DEBUG PANEL</div>
                <div style={{color: '#ff5252'}}>Canvas: ❌ Not initialized</div>
            </div>
        );
    }

    return (
        <div style={{
            position: 'fixed',
            bottom: '20px',
            left: '20px',
            background: '#1a1a1a',
            color: '#fff',
            padding: '16px',
            borderRadius: '8px',
            fontSize: '12px',
            fontFamily: 'monospace',
            zIndex: 9999,
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            minWidth: '250px',
            maxWidth: '350px',
        }}>
            <div style={{ color: '#4CAF50', marginBottom: '12px', fontWeight: 'bold' }}>🔍 DEBUG PANEL</div>
            
            <div style={{marginBottom: '8px'}}>
                <div style={{color: '#4CAF50'}}>Canvas: ✅ Initialized</div>
                <div>Canvas Size: {canvas.getWidth()}x{canvas.getHeight()}</div>
                <div>Objects on Canvas: {objectCount}</div>
                <div>Assets: {uploadedAssets.length} uploaded</div>
            </div>
            
            {textObjects.length > 0 && (
                <div style={{marginTop: '12px', borderTop: '1px solid #333', paddingTop: '8px'}}>
                    <div style={{color: '#FFC107', marginBottom: '4px', fontWeight: 'bold'}}>
                        📝 Text Objects ({textObjects.length}):
                    </div>
                    {textObjects.map((txt, idx) => (
                        <div key={idx} style={{
                            marginBottom: '8px',
                            padding: '8px',
                            background: '#2a2a2a',
                            borderRadius: '4px',
                            fontSize: '11px'
                        }}>
                            <div style={{color: '#FFD700'}}>Type: {txt.type}</div>
                            <div>Text: "{txt.text}"</div>
                            <div style={{color: txt.editable ? '#4CAF50' : '#ff5252'}}>
                                Editable: {txt.editable ? '✅ YES' : '❌ NO'}
                            </div>
                            <div>Editing: {txt.isEditing ? '✅ YES' : 'No'}</div>
                        </div>
                    ))}
                </div>
            )}
            
            <div style={{marginTop: '12px', fontSize: '10px', color: '#888'}}>
                {uploadedAssets.length > 0 && (
                    <div>Last asset: {uploadedAssets[uploadedAssets.length - 1]?.filename?.substring(0, 30)}...</div>
                )}
                <div style={{marginTop: '4px', color: '#FFC107'}}>
                    Click image in sidebar or "+ Add" button
                </div>
            </div>
            
            <button
                onClick={testCanvas}
                style={{
                    marginTop: '12px',
                    width: '100%',
                    padding: '8px',
                    background: '#FF5722',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontSize: '11px',
                }}
            >
                🧪 Test IText (Red)
            </button>
        </div>
    );
};

export default CanvasDebug;
