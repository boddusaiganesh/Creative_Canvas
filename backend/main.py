"""
Tesco Creative Studio - FastAPI Backend
Main application with all API routes
"""

import os
import uuid
from datetime import datetime
from pathlib import Path
from typing import List

from fastapi import FastAPI, UploadFile, File, HTTPException, Form, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from config import get_settings
from models.schemas import (
    BackgroundRemovalRequest, BackgroundRemovalResponse,
    ComplianceCheckRequest, ComplianceCheckResponse,
    TextComplianceRequest, TextComplianceResponse,
    LayoutSuggestionRequest, LayoutSuggestionsResponse,
    ColorPalettesResponse,
    ExportRequest, ExportResult,
    MultiFormatExportRequest, MultiFormatExportResponse,
    UploadResponse
)
from services.compliance_rules import ComplianceEngine
from services.ai_service import AIService, CreativeSuggestionService
from services.export_service import ExportService

# Initialize app
settings = get_settings()

# Initialize rate limiter
limiter = Limiter(key_func=get_remote_address)

app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="AI-Powered Retail Media Creative Tool for Tesco"
)

# Add rate limit exception handler
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create directories
Path(settings.upload_dir).mkdir(parents=True, exist_ok=True)
Path(settings.export_dir).mkdir(parents=True, exist_ok=True)

# Mount static files
app.mount("/uploads", StaticFiles(directory=settings.upload_dir), name="uploads")
app.mount("/exports", StaticFiles(directory=settings.export_dir), name="exports")

# Initialize services
compliance_engine = ComplianceEngine()
ai_service = AIService()


# ============================================================================
# HEALTH CHECK
# ============================================================================

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "app": settings.app_name,
        "version": settings.app_version,
        "status": "running",
        "message": "Tesco Creative Studio API is running"
    }


@app.get("/health")
async def health_check():
    """Detailed health check"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "services": {
            "api": "running",
            "compliance_engine": "active",
            "ai_service": "active"
        }
    }


# ============================================================================
# FILE UPLOAD
# ============================================================================

@app.post("/api/upload", response_model=UploadResponse)
async def upload_file(file: UploadFile = File(...)):
    """
    Upload image file (packshot, logo, background)
    """
    try:
        # Validate file type
        file_ext = file.filename.split('.')[-1].lower()
        if file_ext not in settings.allowed_extensions_list:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid file type. Allowed: {', '.join(settings.allowed_extensions_list)}"
            )

        # Generate unique filename
        unique_filename = f"{uuid.uuid4().hex}_{file.filename}"
        file_path = os.path.join(settings.upload_dir, unique_filename)

        # Save file
        with open(file_path, "wb") as buffer:
            content = await file.read()

            # Check file size
            if len(content) > settings.max_file_size:
                raise HTTPException(
                    status_code=400,
                    detail=f"File too large. Max size: {settings.max_file_size / 1024 / 1024}MB"
                )

            buffer.write(content)

        return UploadResponse(
            success=True,
            file_path=file_path,
            filename=unique_filename,
            file_size=len(content),
            message="File uploaded successfully"
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================================
# AI SERVICES
# ============================================================================

@app.post("/api/ai/remove-background", response_model=BackgroundRemovalResponse)
async def remove_background(request: BackgroundRemovalRequest):
    """
    Remove background from image using AI
    """
    try:
        if not os.path.exists(request.image_path):
            raise HTTPException(status_code=404, detail="Image file not found")

        # Generate output filename
        input_filename = os.path.basename(request.image_path)
        output_filename = f"no_bg_{input_filename}".replace(
            input_filename.split('.')[-1], 'png'
        )
        output_path = os.path.join(settings.upload_dir, output_filename)

        # Remove background
        result = await ai_service.remove_background(request.image_path, output_path)

        if result['success']:
            return BackgroundRemovalResponse(
                success=True,
                output_path=output_path,
                message=result['message']
            )
        else:
            return BackgroundRemovalResponse(
                success=False,
                message=result['message'],
                error=result.get('error')
            )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/ai/check-text-compliance", response_model=TextComplianceResponse)
async def check_text_compliance(request: TextComplianceRequest):
    """
    Check text for compliance issues using AI
    """
    try:
        result = await ai_service.check_text_compliance(request.text)

        return TextComplianceResponse(
            success=result.get('success', True),
            is_compliant=result.get('is_compliant', True),
            violations=result.get('violations', []),
            severity=result.get('severity', 'low'),
            error=result.get('error')
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/ai/suggest-layouts", response_model=LayoutSuggestionsResponse)
async def suggest_layouts(request: LayoutSuggestionRequest):
    """
    Get AI-powered layout suggestions
    """
    try:
        creative_data = {
            'canvas_width': request.canvas_width,
            'canvas_height': request.canvas_height,
            'format': request.format,
            'has_packshots': request.has_packshots,
            'has_logo': request.has_logo,
            'has_headline': request.has_headline,
        }

        layouts = ai_service.suggest_layouts(creative_data)

        return LayoutSuggestionsResponse(
            success=True,
            layouts=layouts
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/ai/color-palettes", response_model=ColorPalettesResponse)
async def get_color_palettes():
    """
    Get suggested color palettes
    """
    try:
        palettes = CreativeSuggestionService.suggest_color_palettes()

        return ColorPalettesResponse(
            success=True,
            palettes=palettes
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/ai/adaptive-resize")
async def adaptive_resize(request: dict):
    """
    AI-driven adaptive resizing of creative across formats (Stretch Goal #1)
    Uses Gemini 2.5 Flash for intelligent element repositioning
    """
    try:
        creative_data = request.get('creative_data', {})
        target_format = request.get('target_format', '1:1')

        result = await CreativeSuggestionService.adaptive_resize_creative(
            creative_data,
            target_format
        )

        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/ai/generate-campaign-set")
async def generate_campaign_set(request: dict):
    """
    Auto-generate campaign-ready creative sets optimized per channel (Stretch Goal #2)
    Uses Gemini 2.5 Flash to create channel-optimized variations
    """
    try:
        product_name = request.get('product_name', 'Product')
        headline = request.get('headline', 'New Product')
        brand_colors = request.get('brand_colors', ['#00539F', '#E31837'])

        result = await CreativeSuggestionService.generate_campaign_set(
            product_name,
            headline,
            brand_colors
        )

        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================================
# COMPLIANCE VALIDATION
# ============================================================================

@app.post("/api/compliance/validate", response_model=ComplianceCheckResponse)
@limiter.limit("20/minute")  # Max 20 validation requests per minute per IP
async def validate_compliance(http_request: Request, request: ComplianceCheckRequest):
    """
    Validate creative against all Tesco compliance rules
    Rate Limited: 20 requests per minute per IP address
    """
    try:
        print(f"\n🔍 Compliance validation request received")
        creative_data = request.creative_data.dict()
        print(f"  Elements count: {len(creative_data.get('elements', []))}")
        print(f"  Headline: {creative_data.get('headline')}")
        print(f"  Rule types filter: {request.rule_types}")

        if request.rule_types:
            # Validate specific rule types (for real-time checking)
            result = compliance_engine.validate_realtime(
                creative_data,
                request.rule_types
            )

            return ComplianceCheckResponse(
                is_compliant=len(result['errors']) == 0,
                compliance_score=100.0 if len(result['errors']) == 0 else 50.0,
                total_rules=len(result['errors']) + len(result['warnings']),
                passed_rules=len(result['warnings']),
                errors=result['errors'],
                warnings=result['warnings']
            )
        else:
            # Full validation
            result = compliance_engine.validate_all(creative_data)

            print(f"\n✅ Compliance check complete:")
            print(f"  Score: {result['compliance_score']}%")
            print(f"  Passed: {result['passed_rules']}/{result['total_rules']}")
            print(f"  Errors: {len(result['errors'])}")
            print(f"  Warnings: {len(result['warnings'])}")

            if result['errors']:
                print(f"\n❌ Errors found:")
                for error in result['errors']:
                    print(f"  - {error['rule']}: {error['message']}")

            return ComplianceCheckResponse(
                is_compliant=result['is_compliant'],
                compliance_score=result['compliance_score'],
                total_rules=result['total_rules'],
                passed_rules=result['passed_rules'],
                errors=result['errors'],
                warnings=result['warnings']
            )

    except Exception as e:
        print(f"\n❌ Compliance check error: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/compliance/rules")
async def get_compliance_rules():
    """
    Get list of all compliance rules
    """
    try:
        rules_info = []

        for rule in compliance_engine.rules:
            rules_info.append({
                'name': rule.name,
                'type': rule.rule_type,
                'strictness': rule.strictness,
                'description': rule.description
            })

        return {
            'success': True,
            'total_rules': len(rules_info),
            'rules': rules_info
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================================
# EXPORT
# ============================================================================

@app.post("/api/export/single", response_model=ExportResult)
async def export_creative(request: ExportRequest):
    """
    Export creative in specified format
    """
    try:
        print(f"🔽 Export request received:")
        print(f"  Format: {request.format_type}")
        print(f"  File format: {request.file_format}")
        print(f"  Filename: {request.filename}")

        creative_data = request.creative_data.dict()
        print(f"  Creative data keys: {list(creative_data.keys())}")

        # Generate output filename
        output_filename = f"{request.filename}_{request.format_type.replace(':', '-')}.{request.file_format.lower()}"
        output_path = os.path.join(settings.export_dir, output_filename)

        print(f"  Output path: {output_path}")

        # Export
        result = ExportService.export_creative(
            creative_data,
            request.format_type,
            output_path,
            request.file_format
        )

        print(f"  Export result: {result['success']}")

        if result['success']:
            # Return relative path for frontend
            relative_path = f"/exports/{output_filename}"
            print(f"  ✅ Success! Relative path: {relative_path}")

            return ExportResult(
                success=True,
                output_path=relative_path,
                file_size_kb=result.get('file_size_kb'),
                format=result.get('format'),
                dimensions=result.get('dimensions'),
                message=result['message']
            )
        else:
            print(f"  ❌ Export failed: {result.get('message')}")
            return ExportResult(
                success=False,
                message=result['message'],
                error=result.get('error')
            )

    except Exception as e:
        print(f"❌ Export error: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/export/multi-format", response_model=MultiFormatExportResponse)
async def export_multiple_formats(request: MultiFormatExportRequest):
    """
    Export creative in all supported formats
    """
    try:
        creative_data = request.creative_data.dict()

        # Export all formats
        results = ExportService.export_multiple_formats(
            creative_data,
            settings.export_dir,
            request.filename
        )

        # Fix paths for frontend - convert to web URLs
        if results['success']:
            for format_key, format_result in results['formats'].items():
                if format_result.get('success') and format_result.get('output_path'):
                    # Extract just the filename
                    filename = os.path.basename(format_result['output_path'])
                    # Create web-compatible path
                    format_result['output_path'] = f"/exports/{filename}"

        return MultiFormatExportResponse(
            success=results['success'],
            formats=results['formats'],
            message=results['message']
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/export/download/{filename}")
async def download_export(filename: str):
    """
    Download exported creative file
    """
    try:
        file_path = os.path.join(settings.export_dir, filename)

        if not os.path.exists(file_path):
            raise HTTPException(status_code=404, detail="File not found")

        return FileResponse(
            path=file_path,
            filename=filename,
            media_type='application/octet-stream'
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================================
# FORMATS
# ============================================================================

@app.get("/api/formats")
async def get_supported_formats():
    """
    Get list of supported export formats
    """
    return {
        'success': True,
        'formats': ExportService.FORMATS
    }


# ============================================================================
# RUN APP
# ============================================================================

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
