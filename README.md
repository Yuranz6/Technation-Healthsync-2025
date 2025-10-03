# HealthSync AI - AI-Powered Healthcare Diagnosis Platform

[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)
[![Node.js](https://img.shields.io/badge/Node.js-14+-green.svg)](https://nodejs.org/)
[![Python](https://img.shields.io/badge/Python-3.8+-blue.svg)](https://python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.117+-red.svg)](https://fastapi.tiangolo.com/)

## 🏥 Overview

HealthSync AI is an advanced healthcare diagnosis platform that combines multiple AI technologies to provide comprehensive medical analysis. The system integrates **ClinicalBERT**, **XGBoost**, and **RAG (Retrieval-Augmented Generation)** to deliver intelligent disease diagnosis and medical recommendations.

### 🧠 Hybrid AI Architecture

- **ClinicalBERT**: Analyzes clinical notes and unstructured medical text
- **XGBoost**: Processes structured laboratory data and patient metrics
- **RAG System**: Retrieves relevant medical knowledge and guidelines
- **Model Fusion**: Combines insights from all three systems for comprehensive diagnosis

## ✨ Key Features

### 🔬 Advanced AI Models
- **ClinicalBERT Integration**: Medical language understanding for clinical notes
- **XGBoost Analysis**: Risk assessment based on structured patient data
- **Knowledge Retrieval**: Medical guidelines and evidence-based recommendations
- **Hierarchical Diagnosis**: Multi-level disease classification (L1/L2/L3)

### 📊 Comprehensive Analysis
- **Risk Assessment**: Cardiovascular, diabetes, and hypertension risk scoring
- **Differential Diagnosis**: Multiple potential conditions with distinguishing factors
- **Follow-up Questions**: Targeted questions to reduce diagnostic ambiguity
- **Treatment Recommendations**: Evidence-based medical guidelines

### 🛡️ Privacy & Security
- **Local Model Support**: Offline ClinicalBERT model for data privacy
- **Secure Data Handling**: Patient information stays on-premises
- **HIPAA Considerations**: Designed with healthcare privacy in mind

## 🚀 Quick Start

### Prerequisites

- **Node.js** 14+ 
- **Python** 3.8+
- **Git**

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Vermillion-Chen/Technation-Healthsync-2025.git
   cd Technation-Healthsync-2025
   ```

2. **Start the hybrid system**
   ```bash
   chmod +x start_hybrid_system.sh
   ./start_hybrid_system.sh
   ```

3. **Access the application**
   - Frontend: http://localhost:8080
   - Backend API: http://localhost:5001
   - Hybrid Model API: http://localhost:8000

### 🎯 Usage

1. **Navigate to Registration**: http://localhost:8080/html/registration.html
2. **Enter Patient Data**: Fill in demographics, lab values, and clinical notes
3. **Run AI Analysis**: Click "🧠 Hybrid Model Disease Diagnosis"
4. **Review Results**: Get comprehensive diagnosis with confidence scores

## 🏗️ System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API   │    │  Hybrid Model   │
│   (Port 8080)   │◄──►│   (Port 5001)   │◄──►│   (Port 8000)   │
│                 │    │                 │    │                 │
│ • HTML/CSS/JS   │    │ • Node.js       │    │ • ClinicalBERT  │
│ • User Interface│    │ • Express       │    │ • XGBoost       │
│ • Form Handling │    │ • Supabase      │    │ • RAG System    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 📁 Project Structure

```
HealthSync/
├── app/                          # Frontend application
│   ├── html/                     # HTML pages
│   │   ├── registration.html     # Patient registration form
│   │   ├── clinical-diagnosis.html # AI diagnosis interface
│   │   └── dashboard.html        # User dashboard
│   ├── js/                       # JavaScript modules
│   │   ├── hybrid-model.js       # AI model integration
│   │   ├── patient-form.js       # Form handling
│   │   └── dashboard.js          # Dashboard functionality
│   ├── css/                      # Stylesheets
│   ├── api/                      # API configurations
│   └── assets/                   # Images and icons
├── Model/                        # AI model backend
│   └── app/
│       ├── main.py              # FastAPI server
│       └── prediction_model/    # XGBoost model
├── data/                        # Medical datasets
│   ├── release_*.csv           # Patient data
│   └── *.json                  # Configuration files
├── local_model/                 # Local ClinicalBERT model
│   ├── pytorch_model.bin       # Model weights
│   └── config.json             # Model configuration
└── scripts/                     # System management
    ├── start_hybrid_system.sh   # System startup
    ├── stop_hybrid_system.sh    # System shutdown
    └── check_hybrid_system.sh   # Health monitoring
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the `app/` directory:

```env
# Supabase Configuration
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key

# Model Configuration
HEALTHSYNC_DATA_DIR=/path/to/data/directory
```

### Local Model Setup

The system supports both online and offline ClinicalBERT models:

1. **Online Mode**: Downloads model from HuggingFace
2. **Local Mode**: Uses pre-downloaded model files

For local model setup, see [LOCAL_MODEL_SETUP.md](LOCAL_MODEL_SETUP.md)

## 📊 Supported Disease Categories

The system can diagnose and analyze:

- **Cardiovascular Diseases**: Coronary artery disease, angina, arrhythmia
- **Diabetes**: Type 1, Type 2, prediabetes
- **Hypertension**: Essential and secondary hypertension
- **Ophthalmic Disorders**: Visual disturbances, ocular motor dysfunction
- **Neurological Disorders**: Peripheral neuropathy, epilepsy
- **Autoimmune Disorders**: Steroid-responsive conditions
- **Respiratory Conditions**: Various pulmonary disorders
- **Gastrointestinal Issues**: Digestive system problems

## 🧪 API Endpoints

### Hybrid Model API (Port 8000)

- `GET /health` - System health check
- `POST /analyze` - Patient data analysis
- `GET /models/status` - Model status information

### Backend API (Port 5001)

- `GET /keys` - Configuration keys
- `POST /users` - User management
- `GET /patients` - Patient data retrieval

## 🔍 Example Analysis

### Input Data
```json
{
  "age": 45,
  "gender": "Male",
  "blood_pressure": "150/95",
  "cholesterol": 220,
  "blood_glucose": 140,
  "clinical_notes": "Patient presents with chest pain, shortness of breath, and palpitations. Symptoms worsen with exertion."
}
```

### Output Analysis
```json
{
  "primary_diagnosis": "Cardiovascular Disease",
  "confidence_score": 0.87,
  "risk_assessment": "High risk",
  "recommendations": [
    "Recommend ECG examination",
    "Consider echocardiogram",
    "Monitor blood pressure and heart rate",
    "Quit smoking and limit alcohol"
  ],
  "follow_up_questions": [
    "Chest pain is exertional and relieved by rest?",
    "Any radiation to left arm, jaw, or back?",
    "Associated diaphoresis or nausea?"
  ]
}
```

## 🛠️ Development

### Running in Development Mode

1. **Start individual services**:
   ```bash
   # Frontend
   cd app && python3 -m http.server 8080
   
   # Backend API
   cd app && node server.mjs
   
   # Hybrid Model API
   cd Model/app && python main.py
   ```

2. **Install dependencies**:
   ```bash
   # Frontend dependencies
   cd app && npm install
   
   # Python dependencies
   cd Model/app && pip install -r requirements.txt
   ```

### Testing

```bash
# Run system health check
./check_hybrid_system.sh

# Test API endpoints
curl http://localhost:8000/health
curl http://localhost:5001/keys
```

## 📈 Performance Metrics

- **Response Time**: < 2 seconds for complete analysis
- **Accuracy**: 85%+ for common conditions
- **Model Size**: ~517MB (ClinicalBERT)
- **Memory Usage**: ~1GB RAM
- **Concurrent Users**: 10+ simultaneous analyses

## 🔒 Security & Privacy

- **Data Encryption**: All data encrypted in transit
- **Local Processing**: Sensitive data processed locally
- **Access Control**: Role-based user permissions
- **Audit Logging**: Complete activity tracking
- **HIPAA Compliance**: Healthcare privacy standards

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Documentation
- [Development Guide](https://docs.google.com/document/d/1UKjEGjBL-tJ-9CvNWbsNPyneuAKb2vxg3CuK5W0le8M/edit?tab=t.0)
- [Google Drive Folder](https://drive.google.com/drive/u/1/folders/1CmH_Q0MC23Q5cvrvK-1yoA4Zy45MrX5g)

### Troubleshooting

**Common Issues:**

1. **Port conflicts**: Use `./stop_hybrid_system.sh` to free ports
2. **Model loading errors**: Check local model files in `local_model/`
3. **Dependency issues**: Run `npm install` and `pip install -r requirements.txt`

**System Requirements:**
- **CPU**: 4+ cores recommended
- **RAM**: 8GB+ recommended
- **Storage**: 2GB+ free space
- **OS**: macOS, Linux, Windows

## 🎯 Roadmap

- [ ] **Multi-language Support**: Internationalization
- [ ] **Mobile App**: iOS/Android applications
- [ ] **Advanced Models**: Integration of additional AI models
- [ ] **Real-time Monitoring**: Live patient monitoring
- [ ] **Integration APIs**: EHR system connectivity
- [ ] **Advanced Analytics**: Population health insights

## 🙏 Acknowledgments

- **ClinicalBERT**: Medical language understanding
- **XGBoost**: Gradient boosting for structured data
- **FastAPI**: Modern Python web framework
- **Supabase**: Backend-as-a-Service platform
- **MedRAG**: Knowledge retrieval inspiration

---

**⚠️ Medical Disclaimer**: This system is for research and educational purposes only. It should not be used as a substitute for professional medical advice, diagnosis, or treatment. Always consult with qualified healthcare professionals for medical decisions.

**🔬 Research Use**: This platform demonstrates the potential of AI in healthcare but requires extensive clinical validation before any clinical deployment.

---

*Built with ❤️ for advancing healthcare through artificial intelligence*
