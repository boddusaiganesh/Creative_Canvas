/**
 * Creative Templates Library
 * Pre-built templates matching Tesco style guidelines
 */

export const creativeTemplates = [
  {
    id: 'brancott-style',
    name: 'Product Hero - Blue',
    description: 'Centered product with brand elements - Brancott Estate style',
    category: 'product-showcase',
    thumbnail: '/templates/brancott-style.png',
    format: '1:1',
    template: {
      background: {
        type: 'gradient',
        gradient: {
          type: 'linear',
          angle: 180,
          stops: [
            { offset: 0, color: '#87CEEB' },
            { offset: 1, color: '#B0E0E6' }
          ]
        }
      },
      elements: [
        {
          type: 'image',
          id: 'product-packshot',
          placeholder: true,
          x: 340,
          y: 150,
          width: 400,
          height: 600,
          zIndex: 2
        },
        {
          type: 'text',
          content: 'NEW LOOK',
          x: 100,
          y: 650,
          fontSize: 48,
          fontWeight: 'bold',
          fill: '#1F2937',
          fontFamily: 'Arial',
          zIndex: 3
        },
        {
          type: 'text',
          content: 'SAME AWARD WINNING TASTE',
          x: 100,
          y: 710,
          fontSize: 24,
          fill: '#374151',
          fontFamily: 'Arial',
          zIndex: 3
        },
        {
          type: 'text',
          content: 'Available at Tesco',
          x: 100,
          y: 950,
          fontSize: 16,
          fill: '#6B7280',
          fontFamily: 'Arial',
          zIndex: 3
        },
        {
          type: 'circle',
          id: 'logo-placeholder',
          placeholder: true,
          x: 150,
          y: 100,
          radius: 60,
          fill: '#FFD700',
          stroke: '#000000',
          strokeWidth: 2,
          zIndex: 2
        }
      ]
    }
  },
  {
    id: 'stories-vertical',
    name: 'Stories Hero',
    description: 'Vertical format for Instagram/Facebook Stories',
    category: 'stories',
    format: '9:16',
    template: {
      background: {
        type: 'gradient',
        gradient: {
          type: 'linear',
          angle: 180,
          stops: [
            { offset: 0, color: '#ADD8E6' },
            { offset: 1, color: '#87CEEB' }
          ]
        }
      },
      elements: [
        {
          type: 'image',
          id: 'product-packshot',
          placeholder: true,
          x: 240,
          y: 500,
          width: 600,
          height: 800,
          zIndex: 2
        },
        {
          type: 'text',
          content: 'NEW ARRIVAL',
          x: 100,
          y: 1400,
          fontSize: 52,
          fontWeight: 'bold',
          fill: '#1F2937',
          fontFamily: 'Arial',
          zIndex: 3
        },
        {
          type: 'text',
          content: 'Available Now',
          x: 100,
          y: 1500,
          fontSize: 32,
          fill: '#374151',
          fontFamily: 'Arial',
          zIndex: 3
        }
      ]
    }
  },
  {
    id: 'landscape-promo',
    name: 'Landscape Promo',
    description: 'Wide format for Facebook feed',
    category: 'promotional',
    format: '1.91:1',
    template: {
      background: {
        type: 'gradient',
        gradient: {
          type: 'linear',
          angle: 90,
          stops: [
            { offset: 0, color: '#E0F2FE' },
            { offset: 1, color: '#BAE6FD' }
          ]
        }
      },
      elements: [
        {
          type: 'image',
          id: 'product-packshot',
          placeholder: true,
          x: 50,
          y: 114,
          width: 400,
          height: 400,
          zIndex: 2
        },
        {
          type: 'text',
          content: 'SPECIAL OFFER',
          x: 550,
          y: 200,
          fontSize: 48,
          fontWeight: 'bold',
          fill: '#00539F',
          fontFamily: 'Arial',
          zIndex: 3
        },
        {
          type: 'text',
          content: 'Limited Time Only',
          x: 550,
          y: 280,
          fontSize: 28,
          fill: '#374151',
          fontFamily: 'Arial',
          zIndex: 3
        },
        {
          type: 'text',
          content: 'Available at Tesco',
          x: 550,
          y: 350,
          fontSize: 20,
          fill: '#6B7280',
          fontFamily: 'Arial',
          zIndex: 3
        }
      ]
    }
  },
  {
    id: 'clean-minimal',
    name: 'Clean Minimal',
    description: 'Minimalist white background with product focus',
    category: 'minimal',
    format: '1:1',
    template: {
      background: {
        type: 'solid',
        color: '#FFFFFF'
      },
      elements: [
        {
          type: 'image',
          id: 'product-packshot',
          placeholder: true,
          x: 290,
          y: 190,
          width: 500,
          height: 500,
          zIndex: 2
        },
        {
          type: 'text',
          content: 'Premium Quality',
          x: 540,
          y: 800,
          fontSize: 42,
          fontWeight: 'bold',
          fill: '#1F2937',
          fontFamily: 'Arial',
          textAlign: 'center',
          zIndex: 3
        },
        {
          type: 'text',
          content: 'Available Now',
          x: 540,
          y: 860,
          fontSize: 24,
          fill: '#6B7280',
          fontFamily: 'Arial',
          textAlign: 'center',
          zIndex: 3
        }
      ]
    }
  },
  {
    id: 'bold-typography',
    name: 'Bold Typography',
    description: 'Large text with dramatic impact',
    category: 'promotional',
    format: '4:5',
    template: {
      background: {
        type: 'gradient',
        gradient: {
          type: 'linear',
          angle: 135,
          stops: [
            { offset: 0, color: '#00539F' },
            { offset: 1, color: '#003D7A' }
          ]
        }
      },
      elements: [
        {
          type: 'text',
          content: 'NEW',
          x: 100,
          y: 100,
          fontSize: 120,
          fontWeight: 'bold',
          fill: '#FFFFFF',
          fontFamily: 'Arial',
          shadow: {
            color: 'rgba(0,0,0,0.3)',
            blur: 10,
            offsetX: 4,
            offsetY: 4
          },
          zIndex: 3
        },
        {
          type: 'image',
          id: 'product-packshot',
          placeholder: true,
          x: 190,
          y: 350,
          width: 700,
          height: 700,
          zIndex: 2
        },
        {
          type: 'text',
          content: 'Available at Tesco',
          x: 100,
          y: 1200,
          fontSize: 32,
          fill: '#FFFFFF',
          fontFamily: 'Arial',
          zIndex: 3
        }
      ]
    }
  },
  {
    id: 'split-design',
    name: 'Split Design',
    description: 'Two-column layout with color split',
    category: 'modern',
    format: '1:1',
    template: {
      background: {
        type: 'solid',
        color: '#FFFFFF'
      },
      elements: [
        {
          type: 'rect',
          x: 0,
          y: 0,
          width: 540,
          height: 1080,
          fill: '#00539F',
          zIndex: 1
        },
        {
          type: 'image',
          id: 'product-packshot',
          placeholder: true,
          x: 600,
          y: 290,
          width: 400,
          height: 500,
          zIndex: 2
        },
        {
          type: 'text',
          content: 'DISCOVER',
          x: 50,
          y: 400,
          fontSize: 56,
          fontWeight: 'bold',
          fill: '#FFFFFF',
          fontFamily: 'Arial',
          zIndex: 3
        },
        {
          type: 'text',
          content: 'THE NEW RANGE',
          x: 50,
          y: 480,
          fontSize: 32,
          fill: '#E5E7EB',
          fontFamily: 'Arial',
          zIndex: 3
        }
      ]
    }
  },
  {
    id: 'festive-seasonal',
    name: 'Festive Seasonal',
    description: 'Warm colors for seasonal campaigns',
    category: 'seasonal',
    format: '1:1',
    template: {
      background: {
        type: 'gradient',
        gradient: {
          type: 'radial',
          stops: [
            { offset: 0, color: '#FEF3C7' },
            { offset: 1, color: '#FDE68A' }
          ]
        }
      },
      elements: [
        {
          type: 'image',
          id: 'product-packshot',
          placeholder: true,
          x: 340,
          y: 240,
          width: 400,
          height: 400,
          zIndex: 2
        },
        {
          type: 'text',
          content: 'SEASONAL SPECIAL',
          x: 540,
          y: 750,
          fontSize: 44,
          fontWeight: 'bold',
          fill: '#92400E',
          fontFamily: 'Arial',
          textAlign: 'center',
          zIndex: 3
        },
        {
          type: 'text',
          content: 'Limited Edition',
          x: 540,
          y: 820,
          fontSize: 28,
          fill: '#B45309',
          fontFamily: 'Arial',
          textAlign: 'center',
          zIndex: 3
        }
      ]
    }
  },
  {
    id: 'tesco-classic',
    name: 'Tesco Classic',
    description: 'Official Tesco brand colors and style',
    category: 'brand',
    format: '1:1',
    template: {
      background: {
        type: 'solid',
        color: '#FFFFFF'
      },
      elements: [
        {
          type: 'rect',
          x: 0,
          y: 0,
          width: 1080,
          height: 200,
          fill: '#00539F',
          zIndex: 1
        },
        {
          type: 'image',
          id: 'product-packshot',
          placeholder: true,
          x: 290,
          y: 300,
          width: 500,
          height: 500,
          zIndex: 2
        },
        {
          type: 'text',
          content: 'Quality Products',
          x: 540,
          y: 100,
          fontSize: 48,
          fontWeight: 'bold',
          fill: '#FFFFFF',
          fontFamily: 'Arial',
          textAlign: 'center',
          zIndex: 3
        },
        {
          type: 'text',
          content: 'Available at Tesco',
          x: 540,
          y: 900,
          fontSize: 32,
          fill: '#00539F',
          fontFamily: 'Arial',
          textAlign: 'center',
          zIndex: 3
        }
      ]
    }
  }
];

export const templateCategories = [
  { id: 'all', name: 'All Templates', icon: '📑' },
  { id: 'product-showcase', name: 'Product Showcase', icon: '📦' },
  { id: 'promotional', name: 'Promotional', icon: '🎯' },
  { id: 'stories', name: 'Stories', icon: '📱' },
  { id: 'minimal', name: 'Minimal', icon: '✨' },
  { id: 'modern', name: 'Modern', icon: '🎨' },
  { id: 'seasonal', name: 'Seasonal', icon: '🎄' },
  { id: 'brand', name: 'Tesco Brand', icon: '🏪' }
];
