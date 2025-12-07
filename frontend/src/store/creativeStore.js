/**
 * Zustand Store for Creative Studio
 * Manages application state
 */

import {create} from 'zustand';

const useCreativeStore = create((set, get) => ({
    // Canvas state
    canvas: null,
    canvasWidth: 1080,
    canvasHeight: 1080,
    format: '1:1',
    backgroundColor: '#FFFFFF',
    backgroundImage: null,

    // Elements
    elements: [],
    selectedElement: null,

    // Creative data
    headline: '',
    subhead: '',
    bodyText: '',
    tagText: '',

    // Flags
    isAlcoholCampaign: false,
    hasPeopleInImages: false,
    peopleConfirmed: false,

    // Assets
    uploadedAssets: [],
    brandColors: ['#00539F', '#E31837', '#FFFFFF'],

    // Compliance
    complianceResult: null,
    isValidating: false,

    // Layout suggestions
    layoutSuggestions: [],

    // Actions
    setCanvas: (canvas) => set({canvas}),

    setCanvasSize: (width, height, format) => set({
        canvasWidth: width,
        canvasHeight: height,
        format,
    }),

    setBackgroundColor: (color) => set({backgroundColor: color}),

    setBackgroundImage: (imagePath) => set({backgroundImage: imagePath}),

    addElement: (element) => set((state) => ({
        elements: [...state.elements, element],
    })),

    updateElement: (id, updates) => set((state) => ({
        elements: state.elements.map((el) =>
            el.id === id ? {...el, ...updates} : el
        ),
    })),

    removeElement: (id) => set((state) => ({
        elements: state.elements.filter((el) => el.id !== id),
    })),

    setSelectedElement: (element) => set({selectedElement: element}),

    setHeadline: (text) => set({headline: text}),
    setSubhead: (text) => set({subhead: text}),
    setBodyText: (text) => set({bodyText: text}),
    setTagText: (text) => set({tagText: text}),

    setIsAlcoholCampaign: (value) => set({isAlcoholCampaign: value}),
    setHasPeopleInImages: (value) => set({hasPeopleInImages: value}),
    setPeopleConfirmed: (value) => set({peopleConfirmed: value}),

    addUploadedAsset: (asset) => set((state) => ({
        uploadedAssets: [...state.uploadedAssets, asset],
    })),

    addBrandColor: (color) => set((state) => ({
        brandColors: [...state.brandColors, color],
    })),

    removeBrandColor: (color) => set((state) => ({
        brandColors: state.brandColors.filter((c) => c !== color),
    })),

    setComplianceResult: (result) => set({complianceResult: result}),

    setIsValidating: (value) => set({isValidating: value}),

    setLayoutSuggestions: (layouts) => set({layoutSuggestions: layouts}),

    // Get creative data for export/validation
    getCreativeData: () => {
        const state = get();
        
        // Get elements from canvas if available
        let elements = state.elements;
        if (state.canvas) {
            try {
                const canvasObjects = state.canvas.getObjects();
                
                // Convert Fabric.js objects to serializable data
                elements = canvasObjects.map(obj => {
                    const data = {
                        type: obj.type,
                        left: obj.left,
                        top: obj.top,
                        width: obj.width * (obj.scaleX || 1),
                        height: obj.height * (obj.scaleY || 1),
                        angle: obj.angle,
                        opacity: obj.opacity,
                        zIndex: obj.zIndex || 0,
                    };
                    
                    // Handle groups (value tiles, tags, etc.)
                    if (obj.type === 'group') {
                        // Check custom properties
                        if (obj.tile_type) {
                            data.type = 'value_tile';
                            data.tile_type = obj.tile_type;
                            data.price = obj.price;
                            data.regular_price = obj.regular_price;
                        } else if (obj.tag_text || (obj._objects && obj._objects.some(o => o.text && o.text.includes('Tesco')))) {
                            data.type = 'tag';
                            data.text = obj.tag_text || obj.text || 'Available at Tesco';
                        } else if (obj.drinkaware || (obj._objects && obj._objects.some(o => o.text && o.text.includes('drinkaware')))) {
                            data.type = 'drinkaware';
                            data.color = obj.color || 'black';
                        }
                    }
                    // Add type-specific properties
                    else if (obj.type === 'image') {
                        data.src = obj._element?.src || obj.src;
                    } else if (obj.type === 'text' || obj.type === 'i-text' || obj.type === 'textbox') {
                        data.type = 'text';
                        data.text = obj.text;
                        data.fontSize = obj.fontSize;
                        data.fontFamily = obj.fontFamily;
                        data.fill = obj.fill;
                    } else if (obj.type === 'rect' || obj.type === 'circle') {
                        data.type = 'shape';
                        data.shape = obj.type === 'rect' ? 'rectangle' : 'circle';
                        data.fill = obj.fill;
                        data.stroke = obj.stroke;
                        data.strokeWidth = obj.strokeWidth;
                    }
                    
                    return data;
                });
                
            } catch (e) {
                console.error('Error getting canvas objects:', e);
            }
        }
        
        return {
            canvas_width: state.canvasWidth,
            canvas_height: state.canvasHeight,
            format: state.format,
            background_color: state.backgroundColor,
            background_image: state.backgroundImage,
            is_alcohol_campaign: state.isAlcoholCampaign,
            has_people_in_images: state.hasPeopleInImages,
            people_confirmed: state.peopleConfirmed,
            headline: state.headline,
            subhead: state.subhead,
            body_text: state.bodyText,
            tag_text: state.tagText,
            elements: elements,
        };
    },

    // Clear all
    clearCanvas: () => set({
        elements: [],
        selectedElement: null,
        headline: '',
        subhead: '',
        bodyText: '',
        tagText: '',
        complianceResult: null,
    }),
}));

export default useCreativeStore;
