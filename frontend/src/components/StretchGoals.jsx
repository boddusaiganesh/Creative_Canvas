/**
 * Stretch Goals Component
 * AI-driven adaptive resizing and campaign set generation
 */

import React, { useState } from 'react';
import { Sparkles, Zap, Grid } from 'lucide-react';
import useCreativeStore from '../store/creativeStore';
import { adaptiveResizeCreative, generateCampaignSet } from '../services/api';
import toast from 'react-hot-toast';
import CampaignModal from './CampaignModal';

const StretchGoals = () => {
  const { getCreativeData, headline, brandColors } = useCreativeStore();
  const [isGenerating, setIsGenerating] = useState(false);
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [campaignData, setCampaignData] = useState(null);

  const handleAdaptiveResize = async (targetFormat) => {
    try {
      setIsGenerating(true);
      toast.loading(`AI adapting to ${targetFormat} format...`, { id: 'resize' });
      
      const creativeData = getCreativeData();
      const result = await adaptiveResizeCreative(creativeData, targetFormat);
      
      if (result.success) {
        toast.success(
          `✨ AI adapted creative to ${targetFormat}!\n${result.reasoning || ''}`,
          { id: 'resize', duration: 5000 }
        );
      } else {
        toast.success(`Adapted to ${targetFormat} using proportional scaling`, { id: 'resize' });
      }
    } catch (error) {
      console.error('Adaptive resize error:', error);
      toast.error('AI adaptation failed', { id: 'resize' });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateCampaignSet = async () => {
    try {
      setIsGenerating(true);
      toast.loading('AI generating campaign set...', { id: 'campaign' });
      
      const result = await generateCampaignSet(
        'Featured Product',
        headline || 'New Product Launch',
        brandColors
      );
      
      if (result.success) {
        toast.success(
          `✨ Generated ${result.variations.length} channel-optimized creatives!`,
          { id: 'campaign' }
        );
        
        // Store campaign data and show modal
        setCampaignData(result);
        setShowCampaignModal(true);
        
        console.log('Campaign Variations:', result.variations);
        console.log('A/B Test Recommendation:', result.ab_test_recommendation);
      }
    } catch (error) {
      console.error('Campaign generation error:', error);
      toast.error('Campaign generation failed', { id: 'campaign' });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      <div className="panel-section" style={{ borderTop: '2px solid var(--primary)' }}>
        <h4 style={{ color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles size={18} />
          AI Stretch Goals
        </h4>

      <div style={{ marginBottom: 'var(--spacing-lg)' }}>
        <h5 style={{ fontSize: '0.875rem', marginBottom: 'var(--spacing-sm)' }}>
          <Zap size={16} style={{ display: 'inline', marginRight: '4px' }} />
          Adaptive Resize (AI)
        </h5>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-sm)' }}>
          Gemini 2.5 Flash intelligently repositions elements
        </p>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-sm)' }}>
          <button
            onClick={() => handleAdaptiveResize('1:1')}
            className="btn-outline"
            disabled={isGenerating}
            style={{ fontSize: '0.75rem', padding: '6px 12px' }}
          >
            1:1
          </button>
          <button
            onClick={() => handleAdaptiveResize('9:16')}
            className="btn-outline"
            disabled={isGenerating}
            style={{ fontSize: '0.75rem', padding: '6px 12px' }}
          >
            9:16
          </button>
          <button
            onClick={() => handleAdaptiveResize('1.91:1')}
            className="btn-outline"
            disabled={isGenerating}
            style={{ fontSize: '0.75rem', padding: '6px 12px' }}
          >
            1.91:1
          </button>
          <button
            onClick={() => handleAdaptiveResize('4:5')}
            className="btn-outline"
            disabled={isGenerating}
            style={{ fontSize: '0.75rem', padding: '6px 12px' }}
          >
            4:5
          </button>
        </div>
      </div>

      <div>
        <h5 style={{ fontSize: '0.875rem', marginBottom: 'var(--spacing-sm)' }}>
          <Grid size={16} style={{ display: 'inline', marginRight: '4px' }} />
          Campaign Set Generator (AI)
        </h5>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-sm)' }}>
          Generate 4 channel-optimized creative variations
        </p>
        
        <button
          onClick={handleGenerateCampaignSet}
          className="btn-primary"
          disabled={isGenerating}
          style={{ width: '100%' }}
        >
          <Sparkles size={16} />
          Generate AI Campaign Set
        </button>
      </div>

      {isGenerating && (
        <div style={{ 
          marginTop: 'var(--spacing-md)', 
          padding: 'var(--spacing-sm)', 
          background: 'var(--bg-secondary)', 
          borderRadius: 'var(--radius-md)',
          textAlign: 'center'
        }}>
          <div className="spinner" style={{ margin: '0 auto' }} />
          <p style={{ fontSize: '0.75rem', marginTop: 'var(--spacing-sm)' }}>
            AI processing...
          </p>
        </div>
      )}
      </div>

      {/* Campaign Modal */}
      <CampaignModal 
        isOpen={showCampaignModal}
        onClose={() => setShowCampaignModal(false)}
        campaignData={campaignData}
      />
    </>
  );
};

export default StretchGoals;
