"""
AI Services for Tesco Creative Studio
- Background removal (rembg)
- Text compliance checking (OpenAI)
- Layout suggestions (rule-based + AI)
"""

import os
import sys
import io
from typing import List, Dict, Optional
from PIL import Image
import numpy as np
from rembg import remove
import google.generativeai as genai

# Add parent directory to path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from config import get_settings

settings = get_settings()
if settings.gemini_api_key:
    genai.configure(api_key=settings.gemini_api_key)


class AIService:
    """AI service for background removal and creative suggestions"""

    @staticmethod
    async def remove_background(image_path: str, output_path: str) -> dict:
        """
        Remove background from image using rembg (U-2-Net)
        
        Args:
            image_path: Path to input image
            output_path: Path to save output image
            
        Returns:
            dict with success status and output path
        """
        try:
            # Load image
            input_image = Image.open(image_path)

            # Remove background
            output_image = remove(input_image)

            # Save output
            output_image.save(output_path)

            return {
                'success': True,
                'output_path': output_path,
                'message': 'Background removed successfully'
            }

        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'message': 'Failed to remove background'
            }

    @staticmethod
    async def check_text_compliance(text: str) -> dict:
        """
        Check text for prohibited content using Google Gemini
        
        Args:
            text: Text to check
            
        Returns:
            dict with compliance status and detected issues
        """

        if not settings.gemini_api_key:
            # Fallback to rule-based checking if no API key
            return AIService._fallback_text_check(text)

        try:
            prompt = f"""You are a compliance checker for retail media advertising.

Check the following text for these prohibited elements:
1. T&Cs, terms and conditions, asterisks, claims
2. Competition or contest language
3. Sustainability or environmental claims (eco-friendly, green, sustainable, etc.)
4. Charity partnerships
5. Price call-outs or discounts in copy
6. Money-back guarantees
7. Survey or study references

Text to check:
"{text}"

Respond in JSON format:
{{
    "is_compliant": true/false,
    "violations": ["list of specific violations found"],
    "severity": "high/medium/low"
}}
"""

            model = genai.GenerativeModel('gemini-2.5-flash')
            response = model.generate_content(prompt)

            # Parse JSON response
            import json
            compliance_data = json.loads(response.text)

            return {
                'success': True,
                'is_compliant': compliance_data.get('is_compliant', True),
                'violations': compliance_data.get('violations', []),
                'severity': compliance_data.get('severity', 'low')
            }

        except Exception as e:
            # Fallback on error
            return AIService._fallback_text_check(text)

    @staticmethod
    def _fallback_text_check(text: str) -> dict:
        """Fallback rule-based text compliance checking"""

        import re

        violations = []
        text_lower = text.lower()

        # Check for prohibited patterns
        prohibited_patterns = {
            'T&Cs/Claims': [r'\*', r't&c', r'terms apply', r'terms and conditions'],
            'Competitions': ['competition', 'contest', 'win', 'prize', 'giveaway'],
            'Sustainability': ['sustainable', 'eco-friendly', 'green', 'carbon neutral'],
            'Charity': ['charity', 'donation', 'donate', 'fundraiser'],
            'Price': [r'£\d+', r'\d+%\s*off', 'discount', 'save', 'deal'],
            'Money-back': ['money back', 'guarantee', 'refund'],
            'Claims': ['survey', 'study', 'proven', 'tested']
        }

        for category, patterns in prohibited_patterns.items():
            for pattern in patterns:
                if isinstance(pattern, str):
                    if pattern in text_lower:
                        violations.append(f"{category}: '{pattern}' detected")
                else:
                    if re.search(pattern, text_lower):
                        violations.append(f"{category}: pattern '{pattern}' detected")

        return {
            'success': True,
            'is_compliant': len(violations) == 0,
            'violations': violations,
            'severity': 'high' if violations else 'low'
        }

    @staticmethod
    def suggest_layouts(creative_data: dict) -> List[dict]:
        """
        Generate layout suggestions based on creative content
        
        Returns list of layout variations with element positions
        """

        canvas_width = creative_data.get('canvas_width', 1080)
        canvas_height = creative_data.get('canvas_height', 1080)
        format_type = creative_data.get('format', '1:1')

        packshots = creative_data.get('packshots', [])
        has_logo = creative_data.get('has_logo', False)
        has_headline = creative_data.get('has_headline', False)

        layouts = []

        # Layout 1: Centered Product (Hero)
        layouts.append({
            'name': 'Hero Center',
            'description': 'Product centered with text overlay',
            'elements': {
                'packshot': {
                    'x': canvas_width * 0.25,
                    'y': canvas_height * 0.25,
                    'width': canvas_width * 0.5,
                    'height': canvas_height * 0.5,
                },
                'headline': {
                    'x': canvas_width * 0.1,
                    'y': canvas_height * 0.75,
                    'fontSize': 48,
                    'align': 'center'
                },
                'logo': {
                    'x': canvas_width * 0.1,
                    'y': canvas_height * 0.05,
                    'width': 120,
                    'height': 60,
                }
            }
        })

        # Layout 2: Left-Right Split
        layouts.append({
            'name': 'Split View',
            'description': 'Product left, text right',
            'elements': {
                'packshot': {
                    'x': canvas_width * 0.05,
                    'y': canvas_height * 0.2,
                    'width': canvas_width * 0.4,
                    'height': canvas_height * 0.6,
                },
                'headline': {
                    'x': canvas_width * 0.55,
                    'y': canvas_height * 0.3,
                    'fontSize': 42,
                    'align': 'left'
                },
                'subhead': {
                    'x': canvas_width * 0.55,
                    'y': canvas_height * 0.45,
                    'fontSize': 24,
                    'align': 'left'
                },
                'logo': {
                    'x': canvas_width * 0.55,
                    'y': canvas_height * 0.8,
                    'width': 100,
                    'height': 50,
                }
            }
        })

        # Layout 3: Top-Bottom Stack
        layouts.append({
            'name': 'Stacked',
            'description': 'Product top, text bottom',
            'elements': {
                'packshot': {
                    'x': canvas_width * 0.2,
                    'y': canvas_height * 0.1,
                    'width': canvas_width * 0.6,
                    'height': canvas_height * 0.5,
                },
                'headline': {
                    'x': canvas_width * 0.1,
                    'y': canvas_height * 0.65,
                    'fontSize': 44,
                    'align': 'center'
                },
                'subhead': {
                    'x': canvas_width * 0.1,
                    'y': canvas_height * 0.75,
                    'fontSize': 28,
                    'align': 'center'
                },
                'logo': {
                    'x': canvas_width * 0.85,
                    'y': canvas_height * 0.05,
                    'width': 80,
                    'height': 40,
                }
            }
        })

        # Layout 4: Diagonal Dynamic
        layouts.append({
            'name': 'Dynamic Diagonal',
            'description': 'Angled product with flowing text',
            'elements': {
                'packshot': {
                    'x': canvas_width * 0.35,
                    'y': canvas_height * 0.15,
                    'width': canvas_width * 0.5,
                    'height': canvas_height * 0.5,
                    'rotation': -15,
                },
                'headline': {
                    'x': canvas_width * 0.1,
                    'y': canvas_height * 0.7,
                    'fontSize': 46,
                    'align': 'left'
                },
                'logo': {
                    'x': canvas_width * 0.1,
                    'y': canvas_height * 0.05,
                    'width': 100,
                    'height': 50,
                }
            }
        })

        # Layout 5: Minimalist Corner
        layouts.append({
            'name': 'Minimalist',
            'description': 'Clean corner placement',
            'elements': {
                'packshot': {
                    'x': canvas_width * 0.5,
                    'y': canvas_height * 0.1,
                    'width': canvas_width * 0.45,
                    'height': canvas_height * 0.45,
                },
                'headline': {
                    'x': canvas_width * 0.05,
                    'y': canvas_height * 0.3,
                    'fontSize': 52,
                    'align': 'left'
                },
                'subhead': {
                    'x': canvas_width * 0.05,
                    'y': canvas_height * 0.45,
                    'fontSize': 26,
                    'align': 'left'
                },
                'logo': {
                    'x': canvas_width * 0.05,
                    'y': canvas_height * 0.85,
                    'width': 90,
                    'height': 45,
                }
            }
        })

        # Adjust layouts for 9:16 (Stories) format
        if format_type == '9:16':
            # Apply safe zone constraints
            for layout in layouts:
                for element_key, element in layout['elements'].items():
                    # Ensure elements respect 200px top and 250px bottom safe zones
                    if element['y'] < 200:
                        element['y'] = 200
                    if element['y'] + element.get('height', 100) > canvas_height - 250:
                        element['y'] = canvas_height - 250 - element.get('height', 100)

        return layouts


class CreativeSuggestionService:
    """Service for AI-powered creative suggestions"""

    @staticmethod
    def suggest_color_palettes(brand_colors: List[str] = None) -> List[dict]:
        """
        Suggest color palettes based on brand colors or trending combinations
        """

        # Pre-defined professional color palettes
        palettes = [
            {
                'name': 'Tesco Classic',
                'colors': ['#00539F', '#FFFFFF', '#E31837', '#F2F2F2'],
                'description': 'Official Tesco brand colors'
            },
            {
                'name': 'Fresh & Clean',
                'colors': ['#4CAF50', '#FFFFFF', '#FFC107', '#F5F5F5'],
                'description': 'Bright and fresh for food products'
            },
            {
                'name': 'Premium Dark',
                'colors': ['#212121', '#FFD700', '#FFFFFF', '#424242'],
                'description': 'Sophisticated and premium feel'
            },
            {
                'name': 'Vibrant Energy',
                'colors': ['#FF5722', '#FFC107', '#FFFFFF', '#F44336'],
                'description': 'High energy and attention-grabbing'
            },
            {
                'name': 'Cool Blue',
                'colors': ['#2196F3', '#FFFFFF', '#03A9F4', '#E3F2FD'],
                'description': 'Trustworthy and professional'
            },
            {
                'name': 'Warm Sunset',
                'colors': ['#FF6B6B', '#FFE66D', '#FFFFFF', '#FFA07A'],
                'description': 'Warm and inviting'
            }
        ]

        return palettes

    @staticmethod
    def optimize_image_for_export(image: Image.Image, max_size_kb: int = 500) -> Image.Image:
        """
        Optimize image to be under max file size while maintaining quality
        """

        # Start with quality 95
        quality = 95
        output = io.BytesIO()

        while quality > 20:
            output.seek(0)
            output.truncate()

            image.save(output, format='JPEG', quality=quality, optimize=True)
            size_kb = output.tell() / 1024

            if size_kb <= max_size_kb:
                break

            quality -= 5

        output.seek(0)
        return Image.open(output)

    @staticmethod
    async def adaptive_resize_creative(creative_data: dict, target_format: str) -> dict:
        """
        AI-driven adaptive resizing and reformatting of creatives across formats
        Uses Gemini 2.5 Flash to intelligently reposition elements
        
        Args:
            creative_data: Original creative data
            target_format: Target format (1:1, 9:16, 1.91:1, 4:5)
        
        Returns:
            Adapted creative data with repositioned elements
        """

        if not settings.gemini_api_key:
            # Fallback to proportional resizing
            return CreativeSuggestionService._proportional_resize(creative_data, target_format)

        try:
            # Format dimensions
            formats = {
                '1:1': (1080, 1080),
                '9:16': (1080, 1920),
                '1.91:1': (1200, 628),
                '4:5': (1080, 1350)
            }

            target_width, target_height = formats.get(target_format, (1080, 1080))
            source_format = creative_data.get('format', '1:1')

            prompt = f"""You are an expert creative designer. Adapt the following creative layout from {source_format} format to {target_format} format.

Source creative:
- Format: {source_format}
- Canvas: {creative_data.get('canvas_width')}x{creative_data.get('canvas_height')}
- Elements: {len(creative_data.get('elements', []))}
- Headline: "{creative_data.get('headline', '')}"
- Subhead: "{creative_data.get('subhead', '')}"

Target format: {target_format} ({target_width}x{target_height}px)

Rules for {target_format}:
{"- Safe zones: 200px top, 250px bottom (no text/logos)" if target_format == '9:16' else "- Standard layout"}
- Maintain visual hierarchy
- Keep elements proportionally sized
- Ensure readability

Provide optimal element positions in JSON:
{{
    "elements": [
        {{"type": "packshot", "x": 0, "y": 0, "width": 0, "height": 0}},
        {{"type": "headline", "x": 0, "y": 0, "fontSize": 0}},
        {{"type": "logo", "x": 0, "y": 0, "width": 0, "height": 0}}
    ],
    "reasoning": "Brief explanation of layout decisions"
}}
"""

            model = genai.GenerativeModel('gemini-2.5-flash')
            response = model.generate_content(prompt)

            import json
            adapted_layout = json.loads(response.text)

            # Update creative data with new positions
            adapted_creative = creative_data.copy()
            adapted_creative['canvas_width'] = target_width
            adapted_creative['canvas_height'] = target_height
            adapted_creative['format'] = target_format
            adapted_creative['elements'] = adapted_layout.get('elements', [])
            adapted_creative['ai_reasoning'] = adapted_layout.get('reasoning', '')

            return {
                'success': True,
                'creative_data': adapted_creative,
                'reasoning': adapted_layout.get('reasoning', ''),
                'message': f'Creative adapted to {target_format} using AI'
            }

        except Exception as e:
            # Fallback to proportional resize
            return CreativeSuggestionService._proportional_resize(creative_data, target_format)

    @staticmethod
    def _proportional_resize(creative_data: dict, target_format: str) -> dict:
        """Fallback proportional resizing without AI"""

        formats = {
            '1:1': (1080, 1080),
            '9:16': (1080, 1920),
            '1.91:1': (1200, 628),
            '4:5': (1080, 1350)
        }

        target_width, target_height = formats.get(target_format, (1080, 1080))
        source_width = creative_data.get('canvas_width', 1080)
        source_height = creative_data.get('canvas_height', 1080)

        scale_x = target_width / source_width
        scale_y = target_height / source_height
        scale = min(scale_x, scale_y)

        adapted_creative = creative_data.copy()
        adapted_creative['canvas_width'] = target_width
        adapted_creative['canvas_height'] = target_height
        adapted_creative['format'] = target_format

        # Scale all elements
        adapted_elements = []
        for element in creative_data.get('elements', []):
            adapted_element = element.copy()
            adapted_element['x'] = element.get('x', 0) * scale
            adapted_element['y'] = element.get('y', 0) * scale
            adapted_element['width'] = element.get('width', 100) * scale
            adapted_element['height'] = element.get('height', 100) * scale
            if 'fontSize' in element:
                adapted_element['fontSize'] = int(element['fontSize'] * scale)
            adapted_elements.append(adapted_element)

        adapted_creative['elements'] = adapted_elements

        return {
            'success': True,
            'creative_data': adapted_creative,
            'message': f'Creative adapted to {target_format} using proportional scaling'
        }

    @staticmethod
    async def generate_campaign_set(product_name: str, headline: str, brand_colors: List[str] = None) -> dict:
        """
        Auto-generate campaign-ready creative sets optimized per channel
        Uses Gemini 2.5 Flash to create variations optimized for each platform
        
        Args:
            product_name: Name of the product
            headline: Main headline
            brand_colors: List of brand color hex codes
        
        Returns:
            Set of creative variations optimized for different channels
        """

        if not settings.gemini_api_key:
            # Fallback to basic template variations
            return CreativeSuggestionService._template_campaign_set(product_name, headline, brand_colors)

        try:
            colors_str = ', '.join(brand_colors) if brand_colors else '#00539F, #E31837, #FFFFFF'

            prompt = f"""You are a retail media campaign expert. Generate a campaign-ready creative set for:

Product: {product_name}
Headline: {headline}
Brand Colors: {colors_str}

Create 4 creative variations optimized for different channels:

1. Facebook Feed (1:1) - General engagement
2. Instagram Stories (9:16) - Mobile-first, vertical
3. Facebook Landscape (1.91:1) - Desktop feed
4. Instagram Portrait (4:5) - Profile feed

For each, provide:
- Optimal background color (from brand colors or complementary)
- Text positioning strategy
- Visual hierarchy approach
- Channel-specific optimization tips

Respond in JSON:
{{
    "variations": [
        {{
            "format": "1:1",
            "channel": "Facebook Feed",
            "strategy": "engagement-focused",
            "background_color": "#00539F",
            "headline_position": {{"x": 100, "y": 400, "fontSize": 48}},
            "subhead": "Perfect for everyday use",
            "product_position": {{"x": 270, "y": 200, "width": 540, "height": 540}},
            "optimization_tips": ["Center product", "Bold headline"],
            "expected_performance": "High engagement"
        }}
    ],
    "campaign_theme": "Overall campaign theme",
    "ab_test_recommendation": "A/B test suggestion"
}}
"""

            model = genai.GenerativeModel('gemini-2.5-flash')
            response = model.generate_content(prompt)

            import json
            campaign_data = json.loads(response.text)

            return {
                'success': True,
                'variations': campaign_data.get('variations', []),
                'campaign_theme': campaign_data.get('campaign_theme', ''),
                'ab_test_recommendation': campaign_data.get('ab_test_recommendation', ''),
                'message': 'Campaign set generated using AI'
            }

        except Exception as e:
            return CreativeSuggestionService._template_campaign_set(product_name, headline, brand_colors)

    @staticmethod
    def _template_campaign_set(product_name: str, headline: str, brand_colors: List[str] = None) -> dict:
        """Fallback template-based campaign set generation"""

        primary_color = brand_colors[0] if brand_colors else '#00539F'

        variations = [
            {
                'format': '1:1',
                'channel': 'Facebook Feed',
                'strategy': 'Engagement-focused',
                'background_color': primary_color,
                'headline_position': {'x': 100, 'y': 750, 'fontSize': 48},
                'subhead': f'{product_name} - Perfect for you',
                'product_position': {'x': 270, 'y': 200, 'width': 540, 'height': 400},
                'optimization_tips': ['Center product', 'Bold headline below'],
                'expected_performance': 'High engagement'
            },
            {
                'format': '9:16',
                'channel': 'Instagram Stories',
                'strategy': 'Mobile-first vertical',
                'background_color': '#FFFFFF',
                'headline_position': {'x': 100, 'y': 1400, 'fontSize': 52},
                'subhead': f'Get {product_name} now',
                'product_position': {'x': 200, 'y': 500, 'width': 680, 'height': 680},
                'optimization_tips': ['Safe zones enforced', 'Large product visual'],
                'expected_performance': 'High reach'
            },
            {
                'format': '1.91:1',
                'channel': 'Facebook Landscape',
                'strategy': 'Desktop-optimized',
                'background_color': primary_color,
                'headline_position': {'x': 650, 'y': 200, 'fontSize': 44},
                'subhead': f'Discover {product_name}',
                'product_position': {'x': 50, 'y': 100, 'width': 500, 'height': 400},
                'optimization_tips': ['Left product, right text', 'Wide format usage'],
                'expected_performance': 'Good conversion'
            },
            {
                'format': '4:5',
                'channel': 'Instagram Portrait',
                'strategy': 'Feed-optimized',
                'background_color': '#FFFFFF',
                'headline_position': {'x': 100, 'y': 1000, 'fontSize': 46},
                'subhead': f'{product_name} available now',
                'product_position': {'x': 200, 'y': 300, 'width': 680, 'height': 600},
                'optimization_tips': ['Vertical emphasis', 'Product hero'],
                'expected_performance': 'Good engagement'
            }
        ]

        return {
            'success': True,
            'variations': variations,
            'campaign_theme': f'{product_name} Multi-Channel Campaign',
            'ab_test_recommendation': 'Test different backgrounds: brand color vs white',
            'message': 'Campaign set generated using templates'
        }
