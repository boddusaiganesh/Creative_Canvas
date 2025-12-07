"""
Pydantic models for API requests/responses
"""

from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


# ============================================================================
# CREATIVE MODELS
# ============================================================================

class ElementBase(BaseModel):
    """Base element model"""
    id: str
    type: str  # image, text, shape, packshot, logo, value_tile, tag
    x: float = 0
    y: float = 0
    width: float = 100
    height: float = 100
    rotation: float = 0
    opacity: float = 1.0
    zIndex: int = 0


class ImageElement(ElementBase):
    """Image/Packshot element"""
    type: str = "image"
    src: str
    filters: Optional[Dict[str, Any]] = None


class TextElement(ElementBase):
    """Text element"""
    type: str = "text"
    text: str
    fontSize: int = 24
    fontFamily: str = "Arial"
    fill: str = "#000000"
    align: str = "left"
    fontWeight: str = "normal"


class ValueTileElement(ElementBase):
    """Tesco value tile"""
    type: str = "value_tile"
    tile_type: str  # new, white, clubcard
    price: Optional[str] = None
    regular_price: Optional[str] = None


class TagElement(ElementBase):
    """Tesco tag"""
    type: str = "tag"
    text: str


class CreativeData(BaseModel):
    """Complete creative data"""
    canvas_width: int = 1080
    canvas_height: int = 1080
    format: str = "1:1"  # 1:1, 9:16, 1.91:1, 4:5
    background_color: str = "#FFFFFF"
    background_image: Optional[str] = None

    # Content flags
    is_alcohol_campaign: bool = False
    has_people_in_images: bool = False
    people_confirmed: bool = False

    # Text content
    headline: Optional[str] = None
    subhead: Optional[str] = None
    body_text: Optional[str] = None
    tag_text: Optional[str] = None

    # Elements
    elements: List[Dict[str, Any]] = []

    # Value tile
    value_tile: Optional[Dict[str, Any]] = None
    value_tile_type: Optional[str] = None

    # CTA (not used per Tesco guidelines)
    cta: Optional[Dict[str, Any]] = None

    # Tag
    tag: Optional[Dict[str, Any]] = None


# ============================================================================
# REQUEST MODELS
# ============================================================================

class BackgroundRemovalRequest(BaseModel):
    """Request to remove background from image"""
    image_path: str


class ComplianceCheckRequest(BaseModel):
    """Request for compliance validation"""
    creative_data: CreativeData
    rule_types: Optional[List[str]] = None  # Specific rule types to check


class TextComplianceRequest(BaseModel):
    """Request for text compliance check"""
    text: str


class LayoutSuggestionRequest(BaseModel):
    """Request for layout suggestions"""
    canvas_width: int = 1080
    canvas_height: int = 1080
    format: str = "1:1"
    has_packshots: bool = True
    has_logo: bool = True
    has_headline: bool = True


class ExportRequest(BaseModel):
    """Request to export creative"""
    creative_data: CreativeData
    format_type: str = "1:1"
    file_format: str = "JPEG"  # JPEG or PNG
    filename: str = "creative"


class MultiFormatExportRequest(BaseModel):
    """Request to export in multiple formats"""
    creative_data: CreativeData
    filename: str = "creative"


# ============================================================================
# RESPONSE MODELS
# ============================================================================

class BackgroundRemovalResponse(BaseModel):
    """Response from background removal"""
    success: bool
    output_path: Optional[str] = None
    message: str
    error: Optional[str] = None


class ComplianceIssue(BaseModel):
    """Single compliance issue"""
    rule: str
    message: str
    severity: str  # hard_fail or warning
    type: str  # copy, design, format, accessibility, media, alcohol, packshot


class ComplianceCheckResponse(BaseModel):
    """Response from compliance check"""
    is_compliant: bool
    compliance_score: float
    total_rules: int
    passed_rules: int
    errors: List[ComplianceIssue]
    warnings: List[ComplianceIssue]


class TextComplianceResponse(BaseModel):
    """Response from text compliance check"""
    success: bool
    is_compliant: bool
    violations: List[str]
    severity: str
    message: Optional[str] = None
    error: Optional[str] = None


class LayoutSuggestion(BaseModel):
    """Single layout suggestion"""
    name: str
    description: str
    elements: Dict[str, Any]


class LayoutSuggestionsResponse(BaseModel):
    """Response with layout suggestions"""
    success: bool
    layouts: List[LayoutSuggestion]


class ColorPalette(BaseModel):
    """Color palette"""
    name: str
    colors: List[str]
    description: str


class ColorPalettesResponse(BaseModel):
    """Response with color palettes"""
    success: bool
    palettes: List[ColorPalette]


class ExportResult(BaseModel):
    """Export result for single format"""
    success: bool
    output_path: Optional[str] = None
    file_size_kb: Optional[float] = None
    format: Optional[str] = None
    dimensions: Optional[str] = None
    message: str
    error: Optional[str] = None


class MultiFormatExportResponse(BaseModel):
    """Response from multi-format export"""
    success: bool
    formats: Dict[str, ExportResult]
    message: str


# ============================================================================
# USER MODELS
# ============================================================================

class UserBrandSettings(BaseModel):
    """User's brand settings"""
    brand_name: str
    brand_colors: List[str] = []
    logo_url: Optional[str] = None
    font_family: Optional[str] = None


class SavedCreative(BaseModel):
    """Saved creative project"""
    id: str
    name: str
    creative_data: CreativeData
    created_at: str
    updated_at: str


# ============================================================================
# UPLOAD MODELS
# ============================================================================

class UploadResponse(BaseModel):
    """Response from file upload"""
    success: bool
    file_path: str
    filename: str
    file_size: int
    message: str
