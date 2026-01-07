# Tesco Creative Studio

**AI-Powered Retail Media Creative Tool**

A professional creative builder tool that empowers advertisers to autonomously create guideline-compliant, high-quality
retail media creatives for Tesco campaigns.

---

## 📄 Resume
Resume (PDF):  
https://github.com/boddusaiganesh/Creative_Canvas/blob/main/Ai_Resume.pdf

## 🎯 Features

### ✅ **Core Features (MVP)**

1. **Visual Canvas Editor**
    - Drag-and-drop interface powered by Fabric.js
    - Multi-layer element management
    - Resize, rotate, and transform objects
    - Real-time canvas rendering

2. **AI Background Removal**
    - One-click background removal using rembg (U-2-Net)
    - High-quality product packshot extraction
    - Instant processing

3. **Real-Time Compliance Validation**
    - 18 comprehensive Tesco compliance rules (Appendix B)
    - Instant validation feedback
    - Error and warning categorization
    - Compliance score (0-100%)

4. **Smart Layout Suggestions**
    - 5 AI-generated layout variations
    - Format-aware positioning
    - Safe zone compliance for Stories format

5. **Multi-Format Export**
    - Facebook/Instagram Post (1:1 - 1080x1080)
    - Instagram/Facebook Stories (9:16 - 1080x1920)
    - Facebook Feed (1.91:1 - 1200x628)
    - Instagram Portrait (4:5 - 1080x1350)
    - Auto-optimization to < 500KB

### 🔧 **Technical Features**

- **Frontend**: React 18 + Vite + Fabric.js
- **Backend**: Python FastAPI
- **AI Models**: rembg (background removal), OpenAI GPT-3.5 (text compliance)
- **State Management**: Zustand
- **Image Processing**: Pillow (PIL)
- **Validation Engine**: Rule-based compliance with 18 hard-fail rules

---

## 📋 **Compliance Rules Implemented**

### **All 18 Appendix B Rules**

| # | Rule | Type | Status |
|---|------|------|--------|
| 1 | No T&Cs/Claims | Copy | ✅ |
| 2 | No Competitions | Copy | ✅ |
| 3 | No Sustainability Claims | Copy | ✅ |
| 4 | No Charity Partnerships | Copy | ✅ |
| 5 | No Price Call-Outs in Copy | Copy | ✅ |
| 6 | No Money-Back Guarantees | Copy | ✅ |
| 7 | No Claims (Asterisks/Surveys) | Copy | ✅ |
| 8 | Approved Tesco Tags Only | Copy | ✅ |
| 9 | Value Tile Validation | Design | ✅ |
| 10 | CTA Validation | Design | ✅ |
| 11 | Tesco Tag Position | Design | ✅ |
| 12 | 9:16 Safe Zones (200px/250px) | Format | ✅ |
| 13 | Minimum Font Sizes | Accessibility | ✅ |
| 14 | WCAG AA Contrast | Accessibility | ✅ |
| 15 | Photography of People Warning | Media | ✅ |
| 16 | Drinkaware Lock-Up (Alcohol) | Alcohol | ✅ |
| 17 | Packshot Positioning | Packshot | ✅ |
| 18 | Packshot Safe Zone | Packshot | ✅ |

---

## 🚀 **Quick Start**

### **Prerequisites**

- **Python 3.9+**
- **Node.js 18+**
- **npm or yarn**

### **Installation**

#### **1. Clone Repository**

```bash
cd "D:/Tesco Retail Media InnovAItion_hackthon"
```

#### **2. Backend Setup**

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate

pip install -r requirements.txt
```

#### **3. Configure Environment**

Create `backend/.env`:

```env
OPENAI_API_KEY=your_openai_api_key_here
DATABASE_URL=sqlite:///./tesco_creative.db
UPLOAD_DIR=./uploads
EXPORT_DIR=./exports
MAX_FILE_SIZE=10485760
ALLOWED_EXTENSIONS=jpg,jpeg,png,webp
```

#### **4. Run Backend**

```bash
python main.py
```

Backend runs on: **http://localhost:8000**

#### **5. Frontend Setup**

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on: **http://localhost:3000**

---

## 📖 **Usage Guide**

### **1. Upload Assets**

- Click **"Upload Image"** in the Assets tab
- Upload product packshots, logos, or backgrounds
- Right-click any image to **remove background**

### **2. Build Your Creative**

- **Add Text**: Click "Add Text" in Elements tab
- **Add Shapes**: Add rectangles or circles
- **Drag & Drop**: Position elements on canvas
- **Transform**: Resize, rotate, adjust opacity

### **3. Choose Format**

- Select format from dropdown: 1:1, 9:16, 1.91:1, 4:5
- Canvas automatically resizes
- Safe zones enforced for Stories format

### **4. Check Compliance**

- Real-time validation in right panel
- View compliance score (0-100%)
- Fix errors (red) and warnings (yellow)
- Must be 100% compliant to export

### **5. Export**

- Export single format or all formats
- Files auto-optimized to < 500KB
- Download as JPEG or PNG

---

## 🏗️ **Architecture**

```
tesco-creative-studio/
├── backend/
│   ├── api/                    # API routes
│   ├── services/
│   │   ├── compliance_rules.py # 18 validation rules
│   │   ├── ai_service.py       # AI background removal
│   │   └── export_service.py   # Multi-format export
│   ├── models/schemas.py       # Pydantic models
│   ├── config.py               # Settings
│   └── main.py                 # FastAPI app
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.jsx      # Top bar
│   │   │   ├── Sidebar.jsx     # Asset library
│   │   │   ├── CanvasArea.jsx  # Fabric.js editor
│   │   │   └── RightPanel.jsx  # Compliance panel
│   │   ├── services/api.js     # API client
│   │   ├── store/creativeStore.js  # Zustand state
│   │   └── App.jsx             # Main app
│   └── package.json
└── README.md
```

---

## 🔌 **API Endpoints**

### **File Upload**

- `POST /api/upload` - Upload image file

### **AI Services**

- `POST /api/ai/remove-background` - Remove background
- `POST /api/ai/check-text-compliance` - Validate text
- `POST /api/ai/suggest-layouts` - Get layout suggestions
- `GET /api/ai/color-palettes` - Get color palettes

### **Compliance**

- `POST /api/compliance/validate` - Validate creative
- `GET /api/compliance/rules` - Get all rules

### **Export**

- `POST /api/export/single` - Export one format
- `POST /api/export/multi-format` - Export all formats
- `GET /api/export/download/{filename}` - Download file

### **Formats**

- `GET /api/formats` - Get supported formats

---

## 🎨 **Design System**

### **Tesco Brand Colors**

- **Tesco Blue**: `#00539F`
- **Tesco Red**: `#E31837`
- **White**: `#FFFFFF`
- **Light Grey**: `#F2F2F2`

### **Supported Formats**

| Format | Dimensions | Use Case |
|--------|------------|----------|
| 1:1 | 1080x1080 | Facebook/Instagram Post |
| 9:16 | 1080x1920 | Stories (Safe zones enforced) |
| 1.91:1 | 1200x628 | Facebook Feed |
| 4:5 | 1080x1350 | Instagram Portrait |

---

## 🧪 **Testing**

### **Test Compliance Rules**

```python
# Run backend tests
cd backend
pytest tests/

# Test specific rule
pytest tests/test_compliance.py::test_no_competitions_rule
```

### **Test Frontend**

```bash
cd frontend
npm test
```

---

## 🚧 **Known Limitations**

1. **OpenAI API Key Required**: Text compliance uses GPT-3.5 (fallback to regex if no key)
2. **Local Storage**: Files stored locally (upgrade to S3 for production)
3. **No User Authentication**: Single-user mode (add auth for production)
4. **Background Removal Speed**: rembg takes 2-5 seconds per image

---

## 🔮 **Future Enhancements**

### **Phase 2 (Post-Hackathon)**

- ✨ Stable Diffusion background generation
- 🤝 Real-time collaborative editing
- 📊 A/B testing creative variants
- 🔄 Auto-adaptive layout resizing
- 📈 Campaign performance analytics
- 🎨 Advanced text effects and filters
- 🔐 User authentication and project management

---

## 📝 **License**

This project is built for the **Tesco Retail Media InnovAItion Hackathon**.

---

## 👥 **Team**

Built with ❤️ for the Tesco Retail Media Hackathon

---

## 🐛 **Troubleshooting**

### **Backend won't start**

```bash
# Check Python version
python --version  # Should be 3.9+

# Reinstall dependencies
pip install --upgrade pip
pip install -r requirements.txt --force-reinstall
```

### **Frontend won't start**

```bash
# Clear node_modules
rm -rf node_modules package-lock.json
npm install

# Check Node version
node --version  # Should be 18+
```

### **Background removal fails**

```bash
# Install rembg dependencies
pip install rembg[gpu]  # For GPU support
# OR
pip install rembg  # CPU only
```

### **CORS errors**

Check `backend/config.py` - ensure frontend URL in `cors_origins`

---

## 📞 **Support**

For issues or questions, please check the troubleshooting section above.

---

**Built for Tesco Retail Media Hackathon 2025** 🎉
