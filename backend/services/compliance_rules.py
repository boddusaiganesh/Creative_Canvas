"""
Compliance Rules Engine for Tesco Creative Studio
Implements all 18 validation rules from Appendix B
"""

import re
from typing import Dict, List, Tuple
from PIL import Image
import numpy as np


class ComplianceRule:
    """Base class for compliance rules"""

    def __init__(self, name: str, rule_type: str, strictness: str, description: str):
        self.name = name
        self.rule_type = rule_type
        self.strictness = strictness  # "hard_fail" or "warning"
        self.description = description

    def validate(self, creative_data: dict) -> Tuple[bool, str]:
        """
        Validate the rule against creative data
        Returns: (is_valid, error_message)
        """
        raise NotImplementedError


# ============================================================================
# COPY VALIDATION RULES
# ============================================================================

class NoTCsRule(ComplianceRule):
    """Rule 1: No T&Cs allowed"""

    def __init__(self):
        super().__init__(
            name="No T&Cs",
            rule_type="copy",
            strictness="hard_fail",
            description="No T&Cs or claims allowed in copy"
        )
        self.prohibited_patterns = [
            r'\*',  # Asterisks
            r'terms?\s+(?:and|&)\s+conditions?',
            r't\s*&\s*c',
            r't\.c\.s?',
            r'terms?\s+apply',
            r'subject\s+to',
            r'restrictions?\s+apply',
        ]

    def validate(self, creative_data: dict) -> Tuple[bool, str]:
        text_elements = [
            creative_data.get('headline') or '',
            creative_data.get('subhead') or '',
            creative_data.get('body_text') or '',
        ]

        combined_text = ' '.join(text_elements).lower()

        for pattern in self.prohibited_patterns:
            if re.search(pattern, combined_text, re.IGNORECASE):
                return False, f"Prohibited T&C text detected: '{pattern}'"

        return True, ""


class NoCompetitionsRule(ComplianceRule):
    """Rule 2: No competitions allowed"""

    def __init__(self):
        super().__init__(
            name="No Competitions",
            rule_type="copy",
            strictness="hard_fail",
            description="Competition copy not allowed"
        )
        self.prohibited_words = [
            'competition', 'contest', 'giveaway', 'win', 'prize',
            'draw', 'raffle', 'sweepstakes', 'enter to win',
            'free entry', 'winner'
        ]

    def validate(self, creative_data: dict) -> Tuple[bool, str]:
        text_elements = [
            creative_data.get('headline') or '',
            creative_data.get('subhead') or '',
            creative_data.get('body_text') or '',
        ]

        combined_text = ' '.join(text_elements).lower()

        for word in self.prohibited_words:
            if word in combined_text:
                return False, f"Competition keyword detected: '{word}'"

        return True, ""


class NoSustainabilityClaimsRule(ComplianceRule):
    """Rule 3: No sustainability/green claims"""

    def __init__(self):
        super().__init__(
            name="No Sustainability Claims",
            rule_type="copy",
            strictness="hard_fail",
            description="No green or sustainability claims allowed"
        )
        self.prohibited_words = [
            'sustainable', 'sustainability', 'eco-friendly', 'eco friendly',
            'green', 'environmentally friendly', 'carbon neutral',
            'carbon negative', 'net zero', 'zero waste', 'recyclable',
            'biodegradable', 'compostable', 'organic', 'natural',
            'planet-friendly', 'earth-friendly', 'renewable'
        ]

    def validate(self, creative_data: dict) -> Tuple[bool, str]:
        text_elements = [
            creative_data.get('headline') or '',
            creative_data.get('subhead') or '',
            creative_data.get('body_text') or '',
        ]

        combined_text = ' '.join(text_elements).lower()

        for word in self.prohibited_words:
            if word in combined_text:
                return False, f"Sustainability claim detected: '{word}'"

        return True, ""


class NoCharityPartnershipsRule(ComplianceRule):
    """Rule 4: No charity partnerships"""

    def __init__(self):
        super().__init__(
            name="No Charity Partnerships",
            rule_type="copy",
            strictness="hard_fail",
            description="Charity partnership text not allowed"
        )
        self.prohibited_words = [
            'charity', 'donation', 'donate', 'fundraiser', 'fundraising',
            'proceeds go to', 'supporting', 'in aid of', 'giving back',
            'social cause', 'non-profit', 'nonprofit'
        ]

    def validate(self, creative_data: dict) -> Tuple[bool, str]:
        text_elements = [
            creative_data.get('headline') or '',
            creative_data.get('subhead') or '',
            creative_data.get('body_text') or '',
        ]

        combined_text = ' '.join(text_elements).lower()

        for word in self.prohibited_words:
            if word in combined_text:
                return False, f"Charity partnership text detected: '{word}'"

        return True, ""


class NoPriceCallOutsRule(ComplianceRule):
    """Rule 5: No price call-outs in copy"""

    def __init__(self):
        super().__init__(
            name="No Price Call-Outs",
            rule_type="copy",
            strictness="hard_fail",
            description="No price, discount or deal references in copy"
        )
        self.prohibited_patterns = [
            r'£\d+',
            r'\$\d+',
            r'€\d+',
            r'\d+%\s*off',
            r'percent\s+off',
            r'save\s+\d+',
            r'only\s+£',
            r'just\s+£',
            r'price',
            r'discount',
            r'deal',
            r'offer',
            r'sale',
            r'reduced',
            r'was\s+£',
            r'now\s+£',
            r'rrp',
        ]

    def validate(self, creative_data: dict) -> Tuple[bool, str]:
        # Note: Value tiles can contain prices, but headline/subhead cannot
        text_elements = [
            creative_data.get('headline') or '',
            creative_data.get('subhead') or '',
        ]

        combined_text = ' '.join(text_elements).lower()

        for pattern in self.prohibited_patterns:
            if re.search(pattern, combined_text, re.IGNORECASE):
                return False, f"Price call-out detected in copy: '{pattern}'"

        return True, ""


class NoMoneyBackGuaranteesRule(ComplianceRule):
    """Rule 6: No money-back guarantees"""

    def __init__(self):
        super().__init__(
            name="No Money-Back Guarantees",
            rule_type="copy",
            strictness="hard_fail",
            description="Money-back guarantee text not allowed"
        )
        self.prohibited_words = [
            'money back', 'money-back', 'guarantee', 'guaranteed',
            'refund', 'satisfaction guaranteed', 'risk free',
            'risk-free', 'no questions asked'
        ]

    def validate(self, creative_data: dict) -> Tuple[bool, str]:
        text_elements = [
            creative_data.get('headline') or '',
            creative_data.get('subhead') or '',
            creative_data.get('body_text') or '',
        ]

        combined_text = ' '.join(text_elements).lower()

        for word in self.prohibited_words:
            if word in combined_text:
                return False, f"Money-back guarantee text detected: '{word}'"

        return True, ""


class NoClaimsRule(ComplianceRule):
    """Rule 7: No claims with asterisks or surveys"""

    def __init__(self):
        super().__init__(
            name="No Claims",
            rule_type="copy",
            strictness="hard_fail",
            description="No claims with asterisks or survey references"
        )

    def validate(self, creative_data: dict) -> Tuple[bool, str]:
        text_elements = [
            creative_data.get('headline') or '',
            creative_data.get('subhead') or '',
        ]

        combined_text = ' '.join(text_elements)

        # Check for asterisks (claims)
        if '*' in combined_text:
            return False, "Asterisk detected - claims not allowed"

        # Check for survey references
        survey_patterns = [
            r'survey', r'study', r'research', r'tested',
            r'\d+%\s+of', r'clinical', r'proven', r'scientifically'
        ]

        for pattern in survey_patterns:
            if re.search(pattern, combined_text, re.IGNORECASE):
                return False, f"Survey/claim reference detected: '{pattern}'"

        return True, ""


class TescoTagsRule(ComplianceRule):
    """Rule 8: Only approved Tesco tags"""

    def __init__(self):
        super().__init__(
            name="Tesco Tags",
            rule_type="copy",
            strictness="hard_fail",
            description="Only approved Tesco tag text allowed"
        )
        self.approved_tags = [
            "Only at Tesco",
            "Available at Tesco",
            "Selected stores. While stocks last.",
        ]

    def validate(self, creative_data: dict) -> Tuple[bool, str]:
        tag_text = (creative_data.get('tag_text') or '').strip()

        if not tag_text:
            return True, ""  # Tags are optional per Appendix A

        # Check if tag matches approved text
        if tag_text not in self.approved_tags:
            # Special case: Clubcard tags
            clubcard_pattern = r'Available in selected stores\. Clubcard/app required\. Ends \d{2}/\d{2}'
            if not re.match(clubcard_pattern, tag_text):
                return False, f"Tag text must be one of: {', '.join(self.approved_tags)}"

        # If Clubcard Price tile exists, validate Clubcard tag
        if creative_data.get('value_tile_type') == 'clubcard':
            if 'Clubcard/app required' not in tag_text:
                return False, "Clubcard Price tile requires Clubcard tag with end date"

            # Validate DD/MM format
            if not re.search(r'Ends \d{2}/\d{2}', tag_text):
                return False, "Clubcard tag must include 'Ends DD/MM' format"

        return True, ""


# ============================================================================
# DESIGN VALIDATION RULES
# ============================================================================

class ValueTileRule(ComplianceRule):
    """Rule 9: Value tile validation"""

    def __init__(self):
        super().__init__(
            name="Value Tile",
            rule_type="design",
            strictness="hard_fail",
            description="Value tile must be correct size, position, no overlay"
        )

    def validate(self, creative_data: dict) -> Tuple[bool, str]:
        value_tile = creative_data.get('value_tile')

        if not value_tile:
            return True, ""  # Value tiles are optional

        # Check type
        tile_type = value_tile.get('type')
        if tile_type not in ['new', 'white', 'clubcard']:
            return False, f"Invalid value tile type: {tile_type}"

        # Check position (predefined, cannot be moved)
        position = value_tile.get('position', {})
        expected_position = self._get_expected_position(creative_data.get('format'))

        if position != expected_position:
            return False, "Value tile position cannot be modified"

        # Check for overlays
        elements = creative_data.get('elements', [])
        tile_bounds = self._get_bounds(value_tile)

        for element in elements:
            if element.get('id') == value_tile.get('id'):
                continue

            element_bounds = self._get_bounds(element)
            if self._check_overlap(tile_bounds, element_bounds):
                return False, "Content cannot overlay value tile"

        return True, ""

    def _get_expected_position(self, format_type):
        # Predefined positions per format
        positions = {
            '1:1': {'x': 20, 'y': 20},
            '9:16': {'x': 20, 'y': 250},
            '1.91:1': {'x': 20, 'y': 20},
        }
        return positions.get(format_type, {'x': 20, 'y': 20})

    def _get_bounds(self, element):
        return {
            'x': element.get('x', 0),
            'y': element.get('y', 0),
            'width': element.get('width', 0),
            'height': element.get('height', 0),
        }

    def _check_overlap(self, bounds1, bounds2):
        return not (
                bounds1['x'] + bounds1['width'] < bounds2['x'] or
                bounds2['x'] + bounds2['width'] < bounds1['x'] or
                bounds1['y'] + bounds1['height'] < bounds2['y'] or
                bounds2['y'] + bounds2['height'] < bounds1['y']
        )


class CTARule(ComplianceRule):
    """Rule 10: CTA validation"""

    def __init__(self):
        super().__init__(
            name="CTA",
            rule_type="design",
            strictness="hard_fail",
            description="CTA must be correct size/position, no overlay"
        )

    def validate(self, creative_data: dict) -> Tuple[bool, str]:
        # Per Appendix A: CTA is not used ("No CTA")
        cta = creative_data.get('cta')

        if cta:
            return False, "CTA not allowed per Tesco guidelines"

        return True, ""


class TescoTagPositionRule(ComplianceRule):
    """Rule 11: Tesco tag position validation"""

    def __init__(self):
        super().__init__(
            name="Tesco Tag Position",
            rule_type="design",
            strictness="hard_fail",
            description="Tesco tag must be in correct position, no overlay"
        )

    def validate(self, creative_data: dict) -> Tuple[bool, str]:
        tag = creative_data.get('tag')

        if not tag:
            return True, ""  # Tags are optional per Appendix A

        # Check position
        position = tag.get('position', {})
        canvas_height = creative_data.get('canvas_height', 1080)

        # Tags should be at bottom
        expected_y_min = canvas_height - 100

        if position.get('y', 0) < expected_y_min:
            return False, "Tesco tag must be positioned at bottom of creative"

        # Check for overlays
        elements = creative_data.get('elements', [])
        tag_bounds = {
            'x': position.get('x', 0),
            'y': position.get('y', 0),
            'width': tag.get('width', 0),
            'height': tag.get('height', 0),
        }

        for element in elements:
            if element.get('id') == tag.get('id'):
                continue

            element_bounds = {
                'x': element.get('x', 0),
                'y': element.get('y', 0),
                'width': element.get('width', 0),
                'height': element.get('height', 0),
            }

            if self._check_overlap(tag_bounds, element_bounds):
                return False, "Content cannot overlay Tesco tag"

        return True, ""

    def _check_overlap(self, bounds1, bounds2):
        return not (
                bounds1['x'] + bounds1['width'] < bounds2['x'] or
                bounds2['x'] + bounds2['width'] < bounds1['x'] or
                bounds1['y'] + bounds1['height'] < bounds2['y'] or
                bounds2['y'] + bounds2['height'] < bounds1['y']
        )


# ============================================================================
# FORMAT VALIDATION RULES
# ============================================================================

class SocialSafeZoneRule(ComplianceRule):
    """Rule 12: 9:16 safe zone validation"""

    def __init__(self):
        super().__init__(
            name="Social Safe Zone",
            rule_type="format",
            strictness="hard_fail",
            description="9:16 format must have 200px top and 250px bottom free"
        )

    def validate(self, creative_data: dict) -> Tuple[bool, str]:
        format_type = creative_data.get('format')

        # Only applies to 9:16 (Stories format)
        if format_type != '9:16':
            return True, ""

        canvas_height = creative_data.get('canvas_height', 1920)
        top_safe_zone = 200
        bottom_safe_zone = 250

        elements = creative_data.get('elements', [])

        for element in elements:
            element_type = element.get('type')

            # Check if element violates safe zones
            y = element.get('y', 0)
            height = element.get('height', 0)
            element_bottom = y + height

            # Check top safe zone
            if y < top_safe_zone:
                return False, f"Element '{element.get('id')}' violates top safe zone (200px)"

            # Check bottom safe zone
            if element_bottom > (canvas_height - bottom_safe_zone):
                return False, f"Element '{element.get('id')}' violates bottom safe zone (250px)"

        return True, ""


# ============================================================================
# ACCESSIBILITY VALIDATION RULES
# ============================================================================

class MinimumFontSizeRule(ComplianceRule):
    """Rule 13: Minimum font size validation"""

    def __init__(self):
        super().__init__(
            name="Minimum Font Size",
            rule_type="accessibility",
            strictness="hard_fail",
            description="Text must meet minimum font size requirements"
        )

    def validate(self, creative_data: dict) -> Tuple[bool, str]:
        format_type = creative_data.get('format')

        # Define minimum font sizes per format
        min_sizes = {
            'brand': 20,
            'checkout_double': 20,
            'checkout_single': 10,
            'says': 12,
            'social': 20,  # Facebook/Instagram
        }

        # Default to social (20px) for FB/Instagram formats
        min_font_size = min_sizes.get(format_type, 20)

        elements = creative_data.get('elements', [])

        for element in elements:
            if element.get('type') == 'text':
                font_size = element.get('fontSize', 0)

                if font_size < min_font_size:
                    return False, f"Text element has font size {font_size}px, minimum is {min_font_size}px"

        return True, ""


class ContrastRule(ComplianceRule):
    """Rule 14: WCAG AA contrast validation"""

    def __init__(self):
        super().__init__(
            name="Contrast",
            rule_type="accessibility",
            strictness="hard_fail",
            description="Text and CTA must meet WCAG AA contrast standards"
        )

    def validate(self, creative_data: dict) -> Tuple[bool, str]:
        elements = creative_data.get('elements', [])
        background_color = creative_data.get('background_color', '#FFFFFF')

        for element in elements:
            if element.get('type') in ['text', 'cta']:
                text_color = element.get('fill', '#000000')

                contrast_ratio = self._calculate_contrast(text_color, background_color)

                # WCAG AA requires 4.5:1 for normal text, 3:1 for large text
                font_size = element.get('fontSize', 14)
                required_ratio = 3.0 if font_size >= 18 else 4.5

                if contrast_ratio < required_ratio:
                    return False, f"Text contrast ratio {contrast_ratio:.2f}:1 below required {required_ratio}:1 (WCAG AA)"

        return True, ""

    def _calculate_contrast(self, color1: str, color2: str) -> float:
        """Calculate WCAG contrast ratio between two colors"""

        def hex_to_rgb(hex_color: str) -> tuple:
            hex_color = hex_color.lstrip('#')
            return tuple(int(hex_color[i:i + 2], 16) for i in (0, 2, 4))

        def relative_luminance(rgb: tuple) -> float:
            rgb_norm = [c / 255.0 for c in rgb]
            rgb_lin = [
                c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4
                for c in rgb_norm
            ]
            return 0.2126 * rgb_lin[0] + 0.7152 * rgb_lin[1] + 0.0722 * rgb_lin[2]

        rgb1 = hex_to_rgb(color1)
        rgb2 = hex_to_rgb(color2)

        lum1 = relative_luminance(rgb1)
        lum2 = relative_luminance(rgb2)

        lighter = max(lum1, lum2)
        darker = min(lum1, lum2)

        return (lighter + 0.05) / (darker + 0.05)


# ============================================================================
# MEDIA VALIDATION RULES
# ============================================================================

class PhotographyOfPeopleRule(ComplianceRule):
    """Rule 15: Photography of people warning"""

    def __init__(self):
        super().__init__(
            name="Photography of People",
            rule_type="media",
            strictness="warning",
            description="Detect people in images - requires user confirmation"
        )

    def validate(self, creative_data: dict) -> Tuple[bool, str]:
        # This would require AI-based person detection
        # For now, we'll check if user has confirmed
        has_people = creative_data.get('has_people_in_images', False)
        user_confirmed = creative_data.get('people_confirmed', False)

        if has_people and not user_confirmed:
            return False, "Image contains people. Please confirm they are integral to the campaign."

        return True, ""


# ============================================================================
# ALCOHOL VALIDATION RULES
# ============================================================================

class DrinkawareRule(ComplianceRule):
    """Rule 16: Drinkaware lock-up validation"""

    def __init__(self):
        super().__init__(
            name="Drinkaware",
            rule_type="alcohol",
            strictness="hard_fail",
            description="Alcohol campaigns must include drinkaware lock-up"
        )

    def validate(self, creative_data: dict) -> Tuple[bool, str]:
        is_alcohol = creative_data.get('is_alcohol_campaign', False)

        if not is_alcohol:
            return True, ""

        # Check for drinkaware element
        elements = creative_data.get('elements', [])
        drinkaware_element = None

        for element in elements:
            if element.get('type') == 'drinkaware':
                drinkaware_element = element
                break

        if not drinkaware_element:
            return False, "Alcohol campaigns must include Drinkaware lock-up"

        # Check minimum height (20px standard, 12px for SAYS)
        format_type = creative_data.get('format')
        min_height = 12 if format_type == 'says' else 20

        height = drinkaware_element.get('height', 0)
        if height < min_height:
            return False, f"Drinkaware lock-up must be minimum {min_height}px in height"

        # Check color (black or white only)
        color = drinkaware_element.get('color', '').lower()
        if color not in ['#000000', '#ffffff', 'black', 'white']:
            return False, "Drinkaware lock-up must be all-black or all-white"

        # Check contrast with background
        background_color = creative_data.get('background_color', '#FFFFFF')

        # Simple contrast check
        if (color in ['#000000', 'black'] and background_color in ['#000000', 'black']) or \
                (color in ['#ffffff', 'white'] and background_color in ['#ffffff', 'white']):
            return False, "Drinkaware lock-up must have sufficient contrast from background"

        return True, ""


# ============================================================================
# PACKSHOT VALIDATION RULES
# ============================================================================

class PackshotPositioningRule(ComplianceRule):
    """Rule 17: Packshot positioning validation"""

    def __init__(self):
        super().__init__(
            name="Packshot Positioning",
            rule_type="packshot",
            strictness="hard_fail",
            description="Packshot must be closest element to CTA"
        )

    def validate(self, creative_data: dict) -> Tuple[bool, str]:
        # Per Appendix A: No CTA is used
        # This rule may not apply, but we'll validate packshot exists

        elements = creative_data.get('elements', [])
        if not isinstance(elements, list):
            print(f"⚠️ Elements is not a list: {type(elements)}")
            return True, ""  # Skip validation if elements is malformed

        print(f"🔍 PackshotPositioningRule: Checking {len(elements)} elements")
        for idx, elem in enumerate(elements):
            if isinstance(elem, dict):
                print(f"  Element {idx + 1}: type='{elem.get('type')}'")
            else:
                print(f"  Element {idx + 1}: Invalid type {type(elem)}")

        # Accept both 'packshot' and 'image' types as product images
        packshots = [e for e in elements if isinstance(e, dict) and e.get('type') in ['packshot', 'image']]

        print(f"  Found {len(packshots)} packshots/images")

        # Make packshot optional for empty canvases
        if len(elements) == 0:
            return True, ""  # Empty canvas is valid

        if not packshots and len(elements) > 0:
            return False, "At least one packshot (lead product) is required"

        if len(packshots) > 3:
            return False, "Maximum of 3 packshots allowed"

        print(f"  ✅ Packshot validation passed")
        return True, ""


class PackshotSafeZoneRule(ComplianceRule):
    """Rule 18: Packshot safe zone validation"""

    def __init__(self):
        super().__init__(
            name="Packshot Safe Zone",
            rule_type="packshot",
            strictness="hard_fail",
            description="Minimum gap between packshot and CTA"
        )

    def validate(self, creative_data: dict) -> Tuple[bool, str]:
        # Per Appendix A: No CTA is used
        # This rule may not apply for social media formats

        cta = creative_data.get('cta')
        if not cta:
            return True, ""  # No CTA, rule doesn't apply

        format_type = creative_data.get('format')

        # Define minimum gaps
        min_gaps = {
            'brand': 24,
            'checkout_double': 24,
            'checkout_single': 12,
        }

        min_gap = min_gaps.get(format_type, 24)

        packshots = [e for e in creative_data.get('elements', []) if e.get('type') in ['packshot', 'image']]
        cta_bounds = {
            'x': cta.get('x', 0),
            'y': cta.get('y', 0),
            'width': cta.get('width', 0),
            'height': cta.get('height', 0),
        }

        for packshot in packshots:
            packshot_bounds = {
                'x': packshot.get('x', 0),
                'y': packshot.get('y', 0),
                'width': packshot.get('width', 0),
                'height': packshot.get('height', 0),
            }

            gap = self._calculate_gap(packshot_bounds, cta_bounds)

            if gap < min_gap:
                return False, f"Packshot must have minimum {min_gap}px gap from CTA (current: {gap}px)"

        return True, ""

    def _calculate_gap(self, bounds1, bounds2) -> float:
        """Calculate minimum gap between two rectangles"""

        # Horizontal gap
        if bounds1['x'] + bounds1['width'] <= bounds2['x']:
            h_gap = bounds2['x'] - (bounds1['x'] + bounds1['width'])
        elif bounds2['x'] + bounds2['width'] <= bounds1['x']:
            h_gap = bounds1['x'] - (bounds2['x'] + bounds2['width'])
        else:
            h_gap = 0

        # Vertical gap
        if bounds1['y'] + bounds1['height'] <= bounds2['y']:
            v_gap = bounds2['y'] - (bounds1['y'] + bounds1['height'])
        elif bounds2['y'] + bounds2['height'] <= bounds1['y']:
            v_gap = bounds1['y'] - (bounds2['y'] + bounds2['height'])
        else:
            v_gap = 0

        # Return minimum gap (considering both directions)
        if h_gap > 0 and v_gap > 0:
            return min(h_gap, v_gap)
        else:
            return max(h_gap, v_gap)


# ============================================================================
# COMPLIANCE ENGINE
# ============================================================================

class ComplianceEngine:
    """Main compliance validation engine"""

    def __init__(self):
        self.rules = [
            # Copy rules (1-8)
            NoTCsRule(),
            NoCompetitionsRule(),
            NoSustainabilityClaimsRule(),
            NoCharityPartnershipsRule(),
            NoPriceCallOutsRule(),
            NoMoneyBackGuaranteesRule(),
            NoClaimsRule(),
            TescoTagsRule(),

            # Design rules (9-11)
            ValueTileRule(),
            CTARule(),
            TescoTagPositionRule(),

            # Format rules (12)
            SocialSafeZoneRule(),

            # Accessibility rules (13-14)
            MinimumFontSizeRule(),
            ContrastRule(),

            # Media rules (15)
            PhotographyOfPeopleRule(),

            # Alcohol rules (16)
            DrinkawareRule(),

            # Packshot rules (17-18)
            PackshotPositioningRule(),
            PackshotSafeZoneRule(),
        ]

    def validate_all(self, creative_data: dict) -> Dict[str, any]:
        """
        Validate creative against all rules
        
        Returns:
        {
            'is_compliant': bool,
            'compliance_score': float (0-100),
            'errors': [{'rule': str, 'message': str, 'severity': str}],
            'warnings': [{'rule': str, 'message': str}],
        }
        """

        errors = []
        warnings = []
        total_rules = len(self.rules)
        passed_rules = 0

        for rule in self.rules:
            is_valid, error_message = rule.validate(creative_data)

            if is_valid:
                passed_rules += 1
            else:
                issue = {
                    'rule': rule.name,
                    'message': error_message,
                    'severity': rule.strictness,
                    'type': rule.rule_type,
                }

                if rule.strictness == 'hard_fail':
                    errors.append(issue)
                else:
                    warnings.append(issue)
                    passed_rules += 0.5  # Warnings count as half-pass

        compliance_score = (passed_rules / total_rules) * 100
        is_compliant = len(errors) == 0

        return {
            'is_compliant': is_compliant,
            'compliance_score': round(compliance_score, 1),
            'total_rules': total_rules,
            'passed_rules': int(passed_rules),
            'errors': errors,
            'warnings': warnings,
        }

    def validate_realtime(self, creative_data: dict, rule_types: List[str] = None) -> Dict[str, any]:
        """
        Validate specific rule types for real-time feedback
        
        Args:
            creative_data: Current creative state
            rule_types: List of rule types to validate (e.g., ['copy', 'design'])
        """

        rules_to_check = self.rules

        if rule_types:
            rules_to_check = [r for r in self.rules if r.rule_type in rule_types]

        errors = []
        warnings = []

        for rule in rules_to_check:
            is_valid, error_message = rule.validate(creative_data)

            if not is_valid:
                issue = {
                    'rule': rule.name,
                    'message': error_message,
                    'severity': rule.strictness,
                    'type': rule.rule_type,
                }

                if rule.strictness == 'hard_fail':
                    errors.append(issue)
                else:
                    warnings.append(issue)

        return {
            'errors': errors,
            'warnings': warnings,
        }
