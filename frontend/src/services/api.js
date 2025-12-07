/**
 * API Service for Tesco Creative Studio
 * Handles all backend communication
 */

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// ============================================================================
// FILE UPLOAD
// ============================================================================

export const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/api/upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });

    return response.data;
};

// ============================================================================
// AI SERVICES
// ============================================================================

export const removeBackground = async (imagePath) => {
    const response = await api.post('/api/ai/remove-background', {
        image_path: imagePath,
    });

    return response.data;
};

export const checkTextCompliance = async (text) => {
    const response = await api.post('/api/ai/check-text-compliance', {
        text,
    });

    return response.data;
};

export const getLayoutSuggestions = async (canvasWidth, canvasHeight, format) => {
    const response = await api.post('/api/ai/suggest-layouts', {
        canvas_width: canvasWidth,
        canvas_height: canvasHeight,
        format,
        has_packshots: true,
        has_logo: true,
        has_headline: true,
    });

    return response.data;
};

export const getColorPalettes = async () => {
  const response = await api.get('/api/ai/color-palettes');
  return response.data;
};

// ============================================================================
// STRETCH GOALS - AI ADAPTIVE FEATURES
// ============================================================================

export const adaptiveResizeCreative = async (creativeData, targetFormat) => {
  const response = await api.post('/api/ai/adaptive-resize', {
    creative_data: creativeData,
    target_format: targetFormat,
  });

  return response.data;
};

export const generateCampaignSet = async (productName, headline, brandColors) => {
  const response = await api.post('/api/ai/generate-campaign-set', {
    product_name: productName,
    headline: headline,
    brand_colors: brandColors,
  });

  return response.data;
};

// ============================================================================
// COMPLIANCE VALIDATION
// ============================================================================

export const validateCompliance = async (creativeData, ruleTypes = null) => {
    const response = await api.post('/api/compliance/validate', {
        creative_data: creativeData,
        rule_types: ruleTypes,
    });

    return response.data;
};

export const getComplianceRules = async () => {
    const response = await api.get('/api/compliance/rules');
    return response.data;
};

// ============================================================================
// EXPORT
// ============================================================================

export const exportCreative = async (creativeData, formatType, fileFormat, filename) => {
    const response = await api.post('/api/export/single', {
        creative_data: creativeData,
        format_type: formatType,
        file_format: fileFormat,
        filename,
    });

    return response.data;
};

export const exportMultipleFormats = async (creativeData, filename) => {
    const response = await api.post('/api/export/multi-format', {
        creative_data: creativeData,
        filename,
    });

    return response.data;
};

export const downloadExport = (filename) => {
    window.open(`${API_BASE_URL}/api/export/download/${filename}`, '_blank');
};

// ============================================================================
// FORMATS
// ============================================================================

export const getSupportedFormats = async () => {
    const response = await api.get('/api/formats');
    return response.data;
};

// ============================================================================
// HEALTH CHECK
// ============================================================================

export const checkHealth = async () => {
    const response = await api.get('/health');
    return response.data;
};

export default api;
