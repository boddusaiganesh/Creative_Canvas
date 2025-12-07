/**
 * Canvas debugging utilities
 */

export const debugCanvas = (canvas) => {
    if (!canvas) {
        console.error('❌ Canvas is null or undefined');
        return;
    }
    
    console.log('🎨 Canvas Debug Info:');
    console.log('  Canvas initialized:', !!canvas);
    console.log('  Canvas width:', canvas.getWidth());
    console.log('  Canvas height:', canvas.getHeight());
    console.log('  Background color:', canvas.backgroundColor);
    console.log('  Objects on canvas:', canvas.getObjects().length);
    console.log('  Zoom level:', canvas.getZoom());
    
    const objects = canvas.getObjects();
    if (objects.length > 0) {
        console.log('  📦 Objects details:');
        objects.forEach((obj, index) => {
            console.log(`    ${index + 1}. Type: ${obj.type}`);
            console.log(`       Position: (${obj.left}, ${obj.top})`);
            console.log(`       Size: ${obj.width}x${obj.height}`);
            console.log(`       Scale: ${obj.scaleX}x${obj.scaleY}`);
            console.log(`       Visible: ${obj.visible}`);
            console.log(`       Opacity: ${obj.opacity}`);
        });
    } else {
        console.log('  ⚠️ No objects on canvas');
    }
    
    return {
        initialized: !!canvas,
        objectCount: objects.length,
        canvasSize: {width: canvas.getWidth(), height: canvas.getHeight()}
    };
};

export const testImageLoad = (imageUrl) => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            console.log('✅ Image loaded successfully:', imageUrl);
            console.log('   Dimensions:', img.width, 'x', img.height);
            resolve(true);
        };
        img.onerror = (error) => {
            console.error('❌ Image failed to load:', imageUrl);
            console.error('   Error:', error);
            reject(false);
        };
        img.crossOrigin = 'anonymous';
        img.src = imageUrl;
    });
};
