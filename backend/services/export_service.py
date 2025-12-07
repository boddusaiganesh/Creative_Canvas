"""
Export Service for Tesco Creative Studio
Handles multi-format export with optimization
"""

import os
import io
from typing import Dict, List
from urllib.parse import unquote
from PIL import Image, ImageDraw, ImageFont
import json


class ExportService:
    """Service for exporting creatives in multiple formats"""

    # Supported export formats (aspect ratios)
    FORMATS = {
        '1:1': {'width': 1080, 'height': 1080, 'name': 'Facebook/Instagram Post'},
        '9:16': {'width': 1080, 'height': 1920, 'name': 'Instagram/Facebook Stories'},
        '1.91:1': {'width': 1200, 'height': 628, 'name': 'Facebook/Instagram Feed'},
        '4:5': {'width': 1080, 'height': 1350, 'name': 'Instagram Portrait'},
    }

    @staticmethod
    def export_creative(creative_data: dict, format_type: str, output_path: str, file_format: str = 'JPEG') -> dict:
        """
        Export creative to specified format
        
        Args:
            creative_data: Creative canvas data
            format_type: Output format (1:1, 9:16, etc.)
            output_path: Path to save exported file
            file_format: JPEG or PNG
            
        Returns:
            dict with export status
        """

        try:
            if format_type not in ExportService.FORMATS:
                return {
                    'success': False,
                    'error': f'Invalid format: {format_type}'
                }

            format_config = ExportService.FORMATS[format_type]
            width = format_config['width']
            height = format_config['height']

            # Create canvas
            if file_format == 'PNG':
                canvas = Image.new('RGBA', (width, height), (255, 255, 255, 0))
            else:
                canvas = Image.new('RGB', (width, height), (255, 255, 255))

            draw = ImageDraw.Draw(canvas)

            # Apply background
            background_color = creative_data.get('background_color', '#FFFFFF')
            background_image = creative_data.get('background_image')

            if background_image:
                # Load and resize background image
                bg = Image.open(background_image)
                bg = bg.resize((width, height), Image.Resampling.LANCZOS)
                canvas.paste(bg, (0, 0))
            else:
                # Fill with background color
                draw.rectangle([0, 0, width, height], fill=background_color)

            # Render elements in order
            elements = creative_data.get('elements', [])
            print(f"📦 Total elements to render: {len(elements)}")

            if len(elements) == 0:
                print("⚠️ WARNING: No elements found in creative_data!")
                print(f"  Creative data keys: {list(creative_data.keys())}")

            sorted_elements = sorted(elements, key=lambda e: e.get('zIndex', 0))

            for idx, element in enumerate(sorted_elements):
                print(f"\n🎨 Rendering element {idx + 1}/{len(sorted_elements)}:")
                print(f"  Type: {element.get('type')}")
                print(f"  Keys: {list(element.keys())}")
                ExportService._render_element(canvas, element, creative_data)

            # Optimize file size
            canvas = ExportService._optimize_image(canvas, file_format, max_size_kb=500)

            # Save
            if file_format == 'PNG':
                canvas.save(output_path, 'PNG', optimize=True)
            else:
                canvas.save(output_path, 'JPEG', quality=90, optimize=True)

            # Check file size
            file_size_kb = os.path.getsize(output_path) / 1024

            return {
                'success': True,
                'output_path': output_path,
                'file_size_kb': round(file_size_kb, 2),
                'format': format_type,
                'dimensions': f'{width}x{height}',
                'message': 'Creative exported successfully'
            }

        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'message': 'Export failed'
            }

    @staticmethod
    def _render_element(canvas: Image.Image, element: dict, creative_data: dict):
        """Render a single element on canvas"""

        element_type = element.get('type')

        if element_type == 'image' or element_type == 'packshot':
            ExportService._render_image(canvas, element)
        elif element_type == 'text':
            ExportService._render_text(canvas, element)
        elif element_type == 'shape':
            ExportService._render_shape(canvas, element)
        elif element_type == 'logo':
            ExportService._render_image(canvas, element)
        elif element_type == 'value_tile':
            ExportService._render_value_tile(canvas, element)
        elif element_type == 'tag':
            ExportService._render_tag(canvas, element)
        elif element_type == 'drinkaware':
            ExportService._render_drinkaware(canvas, element)
        elif element_type == 'group':
            # Handle Fabric.js groups (value tiles, tags, etc.)
            ExportService._render_group(canvas, element)

    @staticmethod
    def _render_image(canvas: Image.Image, element: dict):
        """Render image element"""

        try:
            print(f"  🖼️  Rendering image...")
            image_path = element.get('src')
            print(f"    Original src: {image_path}")

            if not image_path:
                print(f"    ❌ No src property found!")
                print(f"    Element keys: {list(element.keys())}")
                return

            original_path = image_path

            # Convert URL path to file system path
            if image_path.startswith('http://') or image_path.startswith('https://'):
                print(f"    🔄 URL detected, converting...")
                # Extract filename from URL
                if '/uploads/' in image_path:
                    filename = image_path.split('/uploads/')[-1]
                    # Decode URL encoding (%20 → space, etc.)
                    filename = unquote(filename)
                    image_path = os.path.join('.', 'uploads', filename)
                    print(f"    Converted: {original_path} → {image_path}")
                    print(f"    Decoded filename: {filename}")

            # Normalize path separators
            image_path = image_path.replace('\\', '/').replace('./', '')
            print(f"    Normalized path: {image_path}")

            # Try multiple path variations
            filename_only = unquote(image_path.split('/')[-1])  # Decode filename
            possible_paths = [
                image_path,
                f"uploads/{filename_only}",
                f"./uploads/{filename_only}",
                os.path.join('uploads', filename_only),
            ]

            found_path = None
            for path in possible_paths:
                print(f"    Trying: {path} → {os.path.exists(path)}")
                if os.path.exists(path):
                    found_path = path
                    break

            if not found_path:
                print(f"    ❌ Image not found in any location!")
                print(f"    Tried: {possible_paths}")
                return

            print(f"    ✅ Found image: {found_path}")
            img = Image.open(found_path)

            # Get dimensions
            x = int(element.get('left', element.get('x', 0)))
            y = int(element.get('top', element.get('y', 0)))
            width = int(element.get('width', img.width))
            height = int(element.get('height', img.height))

            print(f"    Image size: {img.width}x{img.height}")
            print(f"    Position: ({x}, {y})")
            print(f"    Target size: {width}x{height}")

            # Resize
            img = img.resize((width, height), Image.Resampling.LANCZOS)

            # Apply rotation if needed
            rotation = element.get('angle', element.get('rotation', 0))
            if rotation:
                img = img.rotate(-rotation, expand=True, fillcolor=(255, 255, 255, 0))

            # Apply opacity
            opacity = element.get('opacity', 1.0)
            if opacity < 1.0:
                img.putalpha(int(255 * opacity))

            # Paste on canvas
            if img.mode == 'RGBA':
                canvas.paste(img, (x, y), img)
                print(f"    ✅ Pasted image with transparency")
            else:
                canvas.paste(img, (x, y))
                print(f"    ✅ Pasted image (no transparency)")

        except Exception as e:
            print(f"    ❌ Error rendering image: {e}")
            import traceback
            traceback.print_exc()

    @staticmethod
    def _render_text(canvas: Image.Image, element: dict):
        """Render text element"""

        try:
            print(f"  📝 Rendering text...")
            draw = ImageDraw.Draw(canvas)

            text = element.get('text', '')
            x = int(element.get('left', element.get('x', 0)))
            y = int(element.get('top', element.get('y', 0)))
            font_size = int(element.get('fontSize', 24))
            fill_color = element.get('fill', '#000000')

            print(f"    Text: \"{text}\"")
            print(f"    Position: ({x}, {y})")
            print(f"    Font size: {font_size}")
            print(f"    Color: {fill_color}")

            # Load font (use default if custom font not available)
            try:
                font = ImageFont.truetype("arial.ttf", font_size)
            except:
                font = ImageFont.load_default()

            # Draw text
            draw.text((x, y), text, fill=fill_color, font=font)
            print(f"    ✅ Text rendered successfully")

        except Exception as e:
            print(f"    ❌ Error rendering text: {e}")
            import traceback
            traceback.print_exc()

    @staticmethod
    def _render_shape(canvas: Image.Image, element: dict):
        """Render shape element (rectangle, circle, etc.)"""

        try:
            draw = ImageDraw.Draw(canvas)

            shape_type = element.get('shape', 'rectangle')
            x = int(element.get('left', element.get('x', 0)))
            y = int(element.get('top', element.get('y', 0)))
            width = int(element.get('width', 100))
            height = int(element.get('height', 100))
            fill_color = element.get('fill', '#CCCCCC')
            stroke_color = element.get('stroke', None)
            stroke_width = int(element.get('strokeWidth', 0))

            if shape_type == 'rectangle':
                draw.rectangle(
                    [x, y, x + width, y + height],
                    fill=fill_color,
                    outline=stroke_color,
                    width=stroke_width
                )
            elif shape_type == 'circle' or shape_type == 'ellipse':
                draw.ellipse(
                    [x, y, x + width, y + height],
                    fill=fill_color,
                    outline=stroke_color,
                    width=stroke_width
                )

        except Exception as e:
            print(f"Error rendering shape: {e}")

    @staticmethod
    def _render_value_tile(canvas: Image.Image, element: dict):
        """Render Tesco value tile"""

        try:
            draw = ImageDraw.Draw(canvas)

            tile_type = element.get('tile_type', 'new')
            x = int(element.get('left', element.get('x', 0)))
            y = int(element.get('top', element.get('y', 0)))

            # Tile dimensions
            width = 120
            height = 120

            # Tile colors
            colors = {
                'new': ('#E31837', '#FFFFFF'),  # Tesco red bg, white text
                'white': ('#FFFFFF', '#00539F'),  # White bg, Tesco blue text
                'clubcard': ('#00539F', '#FFFFFF'),  # Tesco blue bg, white text
            }

            bg_color, text_color = colors.get(tile_type, colors['new'])

            # Draw tile background
            draw.rectangle([x, y, x + width, y + height], fill=bg_color)

            # Draw text
            try:
                font_large = ImageFont.truetype("arialbd.ttf", 32)
                font_small = ImageFont.truetype("arial.ttf", 16)
            except:
                font_large = ImageFont.load_default()
                font_small = ImageFont.load_default()

            if tile_type == 'new':
                draw.text((x + 20, y + 40), "NEW", fill=text_color, font=font_large)
            elif tile_type == 'white':
                price = element.get('price', '£0.00')
                draw.text((x + 15, y + 40), price, fill=text_color, font=font_large)
            elif tile_type == 'clubcard':
                price = element.get('price', '£0.00')
                regular_price = element.get('regular_price', '')
                draw.text((x + 10, y + 20), "Clubcard", fill=text_color, font=font_small)
                draw.text((x + 15, y + 45), price, fill=text_color, font=font_large)
                if regular_price:
                    draw.text((x + 15, y + 85), f"RRP: {regular_price}", fill=text_color, font=font_small)

        except Exception as e:
            print(f"Error rendering value tile: {e}")

    @staticmethod
    def _render_tag(canvas: Image.Image, element: dict):
        """Render Tesco tag"""

        try:
            draw = ImageDraw.Draw(canvas)

            text = element.get('text', 'Available at Tesco')
            x = int(element.get('left', element.get('x', 0)))
            y = int(element.get('top', element.get('y', 0)))

            try:
                font = ImageFont.truetype("arial.ttf", 16)
            except:
                font = ImageFont.load_default()

            # Draw tag with background
            text_bbox = draw.textbbox((x, y), text, font=font)
            padding = 10
            draw.rectangle(
                [text_bbox[0] - padding, text_bbox[1] - padding,
                 text_bbox[2] + padding, text_bbox[3] + padding],
                fill='#00539F'
            )
            draw.text((x, y), text, fill='#FFFFFF', font=font)

        except Exception as e:
            print(f"Error rendering tag: {e}")

    @staticmethod
    def _render_drinkaware(canvas: Image.Image, element: dict):
        """Render Drinkaware lock-up"""

        try:
            draw = ImageDraw.Draw(canvas)

            x = int(element.get('left', element.get('x', 0)))
            y = int(element.get('top', element.get('y', 0)))
            color = element.get('color', 'black')
            height = int(element.get('height', 20))

            try:
                font = ImageFont.truetype("arial.ttf", height - 4)
            except:
                font = ImageFont.load_default()

            text = 'drinkaware.co.uk'
            text_color = '#000000' if color == 'black' else '#FFFFFF'

            # If white, add background for contrast
            if color == 'white':
                text_bbox = draw.textbbox((x, y), text, font=font)
                padding = 4
                draw.rectangle(
                    [text_bbox[0] - padding, text_bbox[1] - padding,
                     text_bbox[2] + padding, text_bbox[3] + padding],
                    fill='rgba(0, 0, 0, 0.7)'
                )

            draw.text((x, y), text, fill=text_color, font=font)

        except Exception as e:
            print(f"Error rendering drinkaware: {e}")

    @staticmethod
    def _render_group(canvas: Image.Image, element: dict):
        """Render Fabric.js group (fallback handler)"""

        try:
            # Groups are typically value tiles, tags, or drinkaware lock-ups
            # Try to determine the group type from its properties
            group_type = element.get('tile_type') or element.get('tag_text') or element.get('type')

            if 'tile_type' in element or 'price' in element:
                ExportService._render_value_tile(canvas, element)
            elif 'tag' in str(group_type).lower() or element.get('text'):
                ExportService._render_tag(canvas, element)
            elif 'drinkaware' in str(group_type).lower():
                ExportService._render_drinkaware(canvas, element)
            else:
                # Generic group rendering - render as composite
                print(f"Rendering generic group: {element.get('id', 'unknown')}")

        except Exception as e:
            print(f"Error rendering group: {e}")

    @staticmethod
    def _optimize_image(image: Image.Image, file_format: str, max_size_kb: int = 500) -> Image.Image:
        """Optimize image to be under max file size"""

        if file_format == 'PNG':
            # PNG optimization is limited, return as-is
            return image

        # For JPEG, reduce quality until under size limit
        quality = 95
        output = io.BytesIO()

        while quality > 30:
            output.seek(0)
            output.truncate()

            # Convert RGBA to RGB if needed
            if image.mode == 'RGBA':
                rgb_image = Image.new('RGB', image.size, (255, 255, 255))
                rgb_image.paste(image, mask=image.split()[3])
                rgb_image.save(output, format='JPEG', quality=quality, optimize=True)
            else:
                image.save(output, format='JPEG', quality=quality, optimize=True)

            size_kb = output.tell() / 1024

            if size_kb <= max_size_kb:
                break

            quality -= 5

        output.seek(0)
        optimized = Image.open(output)

        return optimized

    @staticmethod
    def export_multiple_formats(creative_data: dict, output_dir: str, base_filename: str) -> dict:
        """
        Export creative in all supported formats
        
        Returns dict with results for each format
        """

        results = {}

        for format_type, config in ExportService.FORMATS.items():
            output_filename = f"{base_filename}_{format_type.replace(':', '-')}.jpg"
            output_path = os.path.join(output_dir, output_filename)

            result = ExportService.export_creative(
                creative_data,
                format_type,
                output_path,
                'JPEG'
            )

            results[format_type] = result

        return {
            'success': True,
            'formats': results,
            'message': f'Exported {len(results)} formats successfully'
        }
