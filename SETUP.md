# HealthSync AI Setup Guide

## Quick Setup

### 1. Install Dependencies
```bash
# Install frontend dependencies
cd app
npm install

# Create Python virtual environment (if needed for Model)
cd ../Model/app
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install fastapi uvicorn pydantic
```

### 2. Start the Application
```bash
# From project root
./start_hybrid_system.sh
```

### 3. Access the Application
- **Frontend**: http://localhost:8080
- **Clinical Diagnosis**: http://localhost:8080/clinical-diagnosis.html
- **Patient Registration**: http://localhost:8080/html/registration.html
- **Backend API**: http://localhost:5001
- **Hybrid Model API**: http://localhost:8000

## Project Structure

```
HealthSync/
├── app/                    # Main application
│   ├── html/              # HTML pages
│   ├── js/                # JavaScript files
│   ├── css/               # Stylesheets
│   ├── assets/            # Images and resources
│   ├── hybrid-api.js      # Hybrid Model API
│   └── server.mjs         # Backend server
├── Model/                 # ML model components
├── data/                  # Data files (excluded from git)
└── start_hybrid_system.sh # Startup script
```

## Features

- **🧠 Hybrid AI**: ClinicalBERT + XGBoost + RAG
- **📝 Clinical Notes**: AI-powered text analysis
- **📊 Risk Assessment**: Structured data analysis
- **🔍 Knowledge Retrieval**: RAG-based medical knowledge
- **💡 Smart Recommendations**: Treatment suggestions

## Notes

- Large model files and data are excluded from git for size optimization
- Dependencies need to be installed after cloning
- The system works with mock AI models for demonstration
