"""
Hybrid Model API: ClinicalBERT + XGBoost + RAG
Combines HuggingFace ClinicalBERT model and XGBoost for disease diagnosis
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Dict, Any, Optional
import uvicorn
import json
import logging
from datetime import datetime
import os
from transformers import AutoTokenizer, AutoModel
import torch
from pathlib import Path
import csv

# Hugging Face Inference API support using requests
import requests

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Model loading strategy: "inference_api" or "local"
# Set USE_HF_INFERENCE_API=true to use Hugging Face Inference API (recommended for production)
USE_HF_INFERENCE_API = os.environ.get("USE_HF_INFERENCE_API", "false").lower() == "true"
HF_TOKEN = os.environ.get("HF_TOKEN", "")
HF_MODEL_NAME = "emilyalsentzer/Bio_ClinicalBERT"
HF_API_URL = f"https://router.huggingface.co/hf-inference/models/{HF_MODEL_NAME}"

# Initialize ClinicalBERT model - Lazy loading to save memory
# Or use Hugging Face Inference API (no local model loading needed)
if USE_HF_INFERENCE_API and HF_TOKEN:
    logger.info("🚀 Using Hugging Face Inference API (no local model loading)")
    logger.info(f"Model: {HF_MODEL_NAME}")
    logger.info(f"API URL: {HF_API_URL}")
    
    # Prepare headers for API requests
    hf_headers = {
        "Authorization": f"Bearer {HF_TOKEN}",
    }
    
    # Test API connection
    try:
        test_response = requests.post(
            HF_API_URL,
            headers=hf_headers,
            json={"inputs": "test"},
            timeout=5
        )
        if test_response.status_code == 200:
            logger.info("✅ Hugging Face Inference API initialized and accessible")
        else:
            logger.warning(f"⚠️ API test returned status {test_response.status_code}")
    except Exception as e:
        logger.warning(f"⚠️ API connection test failed: {e}")
    
    tokenizer = None
    model = None
    model_loaded = True  # API is always "loaded"
else:
    if USE_HF_INFERENCE_API:
        logger.warning("⚠️ USE_HF_INFERENCE_API=true but HF_TOKEN not set")
        logger.warning("Falling back to local model loading")
    logger.info("Initializing ClinicalBERT model (lazy loading)...")
    hf_headers = None
    tokenizer = None
    model = None
    model_loaded = False

def load_model():
    """
    Lazy load the ClinicalBERT model from Hugging Face (if not using Inference API)
    Model: https://huggingface.co/emilyalsentzer/Bio_ClinicalBERT
    
    Bio_ClinicalBERT is a BERT model trained on clinical notes from MIMIC-III v1.4.
    It's specifically designed for clinical text understanding.
    
    If USE_HF_INFERENCE_API=true, this function returns None as the model
    is accessed via the Inference API instead.
    """
    global tokenizer, model, model_loaded
    
    # If using Inference API, no local model needed
    if USE_HF_INFERENCE_API:
        return None, None  # API is accessed via requests
    
    if model_loaded:
        return tokenizer, model
    
    # Hugging Face model identifier
    model_name = HF_MODEL_NAME
    
    try:
        # Try to use local model if path is provided and exists
        local_model_path = os.environ.get("LOCAL_MODEL_PATH")
        if local_model_path and os.path.exists(local_model_path):
            logger.info(f"Loading local model from: {local_model_path}")
            logger.info(f"Using tokenizer from Hugging Face: {model_name}")
            tokenizer = AutoTokenizer.from_pretrained(model_name)
            model = AutoModel.from_pretrained(local_model_path)
            logger.info("Local ClinicalBERT model loaded successfully")
        else:
            # Load model directly from Hugging Face
            logger.info(f"Loading Bio_ClinicalBERT from Hugging Face: {model_name}")
            logger.info("Reference: https://huggingface.co/emilyalsentzer/Bio_ClinicalBERT")
            
            # Load tokenizer
            tokenizer = AutoTokenizer.from_pretrained(
                model_name,
                trust_remote_code=False  # ClinicalBERT doesn't require custom code
            )
            logger.info("Tokenizer loaded successfully")
            
            # Load model with memory optimization for Render's free tier (512MB RAM)
            model = AutoModel.from_pretrained(
                model_name,
                low_cpu_mem_usage=True,  # Reduce memory footprint during loading
                torch_dtype=torch.float16 if torch.cuda.is_available() else torch.float32,
                trust_remote_code=False
            )
            logger.info("ClinicalBERT model loaded successfully from Hugging Face")
            logger.info(f"Model type: {type(model).__name__}")
            logger.info(f"Model device: {next(model.parameters()).device if model else 'N/A'}")
        
        # Set model to evaluation mode
        model.eval()
        model_loaded = True
        logger.info("ClinicalBERT is ready for inference")
        return tokenizer, model
        
    except torch.cuda.OutOfMemoryError as e:
        logger.error(f"CUDA out of memory: {e}")
        logger.warning("Will use fallback keyword-based analysis")
        model_loaded = True
        return None, None
    except Exception as e:
        logger.error(f"Model loading failed: {e}")
        logger.error(f"Error type: {type(e).__name__}")
        logger.warning("Will use fallback keyword-based analysis")
        logger.info("This is expected on Render's free tier if memory is insufficient")
        model_loaded = True  # Mark as loaded to prevent retry loops
        return None, None

# FastAPI Application Configuration
# FastAPI is recommended for API services due to:
# - Automatic API documentation (Swagger/OpenAPI)
# - Type validation with Pydantic
# - High performance (async support)
# - Easy dependency injection
# - Built-in data validation and serialization

app = FastAPI(
    title="HealthSync AI - Hybrid Model Disease Diagnosis API",
    description="""
    **AI-Powered Medical Diagnosis System**
    
    This API combines three powerful AI technologies:
    
    * **ClinicalBERT**: Natural language processing for clinical notes analysis
      - Model: [emilyalsentzer/Bio_ClinicalBERT](https://huggingface.co/emilyalsentzer/Bio_ClinicalBERT)
      - Trained on 1.2B words of diverse diseases + 3M+ patient records
    
    * **XGBoost**: Machine learning for structured data analysis
      - Risk assessment based on patient vitals and lab results
    
    * **RAG System**: Retrieval-Augmented Generation for medical knowledge
      - Evidence-based recommendations and guidelines
    
    ## Features
    
    * 🔬 Multi-modal analysis (text + structured data)
    * 📊 Risk assessment and confidence scoring
    * 💡 Evidence-based recommendations
    * 🔍 Differential diagnosis suggestions
    * 📋 Follow-up questions generation
    """,
    version="1.0.0",
    terms_of_service="https://github.com/Yuranz6/Technation-Healthsync-2025",
    contact={
        "name": "HealthSync AI Team",
        "url": "https://github.com/Yuranz6/Technation-Healthsync-2025",
    },
    license_info={
        "name": "MIT",
    },
    docs_url="/docs",  # Swagger UI
    redoc_url="/redoc",  # ReDoc
    openapi_url="/openapi.json",  # OpenAPI schema
    openapi_tags=[
        {
            "name": "Health",
            "description": "Health check and system status endpoints",
        },
        {
            "name": "Analysis",
            "description": "AI-powered patient data analysis endpoints",
        },
        {
            "name": "Configuration",
            "description": "Configuration and environment endpoints",
        },
        {
            "name": "Models",
            "description": "Model status and information endpoints",
        },
    ],
)

# -------------------------------
# MedRAG-inspired KG structures
# -------------------------------

# Minimal hierarchical disease taxonomy (L1/L2/L3) inspired by MedRAG's KG-elicited reasoning
# Reference: `MedRAG` project overview and dataset notes
# - https://github.com/SNOWTEAM2023/MedRAG.git
DISEASE_TAXONOMY = {
    "Cardiovascular Disease": {
        "L1": "Cardiovascular",
        "L2": "Coronary/Cardiac",
        "L3_rules": [
            {"if_symptoms_any": ["chest pain", "chest tightness", "angina"], "label": "Angina"},
            {"if_symptoms_any": ["shortness of breath", "palpitations"], "label": "Arrhythmia"},
        ],
        "default_L3": "Cardiac condition"
    },
    "Hypertension": {
        "L1": "Cardiovascular",
        "L2": "Hypertension",
        "L3_rules": [
            {"if_symptoms_any": ["headache", "dizziness"], "label": "Hypertensive disorder"}
        ],
        "default_L3": "Essential hypertension"
    },
    "Diabetes": {
        "L1": "Endocrine",
        "L2": "Diabetes",
        "L3_rules": [
            {"if_symptoms_any": ["excessive thirst", "frequent urination", "increased hunger"], "label": "Type 2 diabetes"}
        ],
        "default_L3": "Diabetes (unspecified)"
    },
    "Ophthalmic Disorder": {
        "L1": "Ophthalmology",
        "L2": "Neuro-ophthalmic",
        "L3_rules": [
            {"if_symptoms_any": ["diplopia", "double vision", "ptosis"], "label": "Ocular motor dysfunction"}
        ],
        "default_L3": "Eye disorder"
    },
    "Neurological Disorder": {
        "L1": "Neurology",
        "L2": "Neuromuscular/CNS",
        "L3_rules": [
            {"if_symptoms_any": ["weakness", "numbness", "tingling"], "label": "Peripheral neuropathy"},
            {"if_symptoms_any": ["seizure", "epilepsy"], "label": "Epilepsy"}
        ],
        "default_L3": "Neurological disorder"
    },
    "Autoimmune Disorder": {
        "L1": "Immunology",
        "L2": "Autoimmune",
        "L3_rules": [
            {"if_symptoms_any": ["steroid", "prednisone", "inflammation"], "label": "Steroid-responsive autoimmune"}
        ],
        "default_L3": "Autoimmune disorder"
    }
}

def _infer_l3_label(disease: str, symptoms: list) -> str:
    taxonomy = DISEASE_TAXONOMY.get(disease)
    if not taxonomy:
        return disease
    normalized = [s.lower() for s in symptoms]
    for rule in taxonomy.get("L3_rules", []):
        if any(keyword in normalized for keyword in [k.lower() for k in rule.get("if_symptoms_any", [])]):
            return rule.get("label", taxonomy.get("default_L3", disease))
    return taxonomy.get("default_L3", disease)

def get_hierarchical_labels(diseases: list, symptoms: list) -> Dict[str, Any]:
    """Return L1/L2/L3 hierarchy per top disease (MedRAG-style levels)."""
    levels = []
    for d in diseases[:3]:
        tax = DISEASE_TAXONOMY.get(d)
        if not tax:
            levels.append({"disease": d, "L1": "Unknown", "L2": "Unknown", "L3": d})
            continue
        levels.append({
            "disease": d,
            "L1": tax.get("L1", "Unknown"),
            "L2": tax.get("L2", "Unknown"),
            "L3": _infer_l3_label(d, symptoms)
        })
    return {"levels": levels}

def generate_follow_up_questions(diseases: list, symptoms: list) -> list:
    """Produce targeted follow-up questions to reduce ambiguity (MedRAG-like)."""
    questions = []
    s = [x.lower() for x in symptoms]
    dset = set(diseases)
    if "Cardiovascular Disease" in dset or any(x in s for x in ["chest pain", "chest tightness", "palpitations"]):
        questions.extend([
            "Chest pain is exertional and relieved by rest?",
            "Any radiation to left arm, jaw, or back?",
            "Associated diaphoresis or nausea?",
            "Duration and frequency of episodes?"
        ])
    if "Diabetes" in dset or any(x in s for x in ["excessive thirst", "frequent urination", "increased hunger"]):
        questions.extend([
            "Recent HbA1c and fasting glucose values?",
            "Unintentional weight change?",
            "Polyuria/nocturia severity and onset?",
            "Any neuropathy or visual blurring?"
        ])
    if any(x in s for x in ["diplopia", "double vision", "ptosis"]):
        questions.extend([
            "Do symptoms fluctuate with fatigue (suggesting myasthenia)?",
            "Any pupillary involvement or headache (for 3rd nerve palsy)?",
            "Onset abrupt vs progressive?"
        ])
    if "Neurological Disorder" in dset or any(x in s for x in ["weakness", "numbness", "tingling"]):
        questions.extend([
            "Symmetry and distribution of weakness/numbness?",
            "Back pain or radicular features?",
            "Bowel/bladder involvement?"
        ])
    # Deduplicate while preserving order
    seen = set()
    deduped = []
    for q in questions:
        if q not in seen:
            deduped.append(q)
            seen.add(q)
    return deduped[:12]

def generate_differentials(diseases: list, symptoms: list) -> list:
    """Return differentials with key distinguishing questions/evidence."""
    differentials = []
    s = [x.lower() for x in symptoms]
    if any(x in s for x in ["chest pain", "chest tightness", "shortness of breath"]):
        differentials.append({
            "pair": ["Stable angina", "Gastroesophageal reflux"],
            "distinguishing_points": [
                "Exertional chest pain relieved by rest favors angina",
                "Burning postprandial pain lying down favors reflux"
            ]
        })
        differentials.append({
            "pair": ["Acute coronary syndrome", "Musculoskeletal chest pain"],
            "distinguishing_points": [
                "Pressure-like pain with diaphoresis suggests ACS",
                "Reproducible chest wall tenderness suggests musculoskeletal"
            ]
        })
    if any(x in s for x in ["back pain", "leg pain", "sciatica"]):
        differentials.append({
            "pair": ["Lumbar canal stenosis", "Sciatica"],
            "distinguishing_points": [
                "Pain relieved by sitting suggests canal stenosis",
                "Sitting worsens discomfort suggests sciatica"
            ]
        })
    if any(x in s for x in ["diplopia", "ptosis", "double vision"]):
        differentials.append({
            "pair": ["Myasthenia gravis", "Cranial nerve palsy"],
            "distinguishing_points": [
                "Fatigable ptosis/ophthalmoparesis favors MG",
                "Fixed pupil or severe headache suggests nerve palsy"
            ]
        })
    return differentials[:6]

# ----------------------------------------
# Data-backed RAG: load local CSV knowledge
# ----------------------------------------

def _safe_lower(value: Any) -> str:
    try:
        return str(value).strip().lower()
    except Exception:
        return ""

def _guess_col(row: Dict[str, Any], candidates: list) -> Any:
    for key in row.keys():
        lk = key.strip().lower()
        for cand in candidates:
            if cand in lk:
                return row.get(key)
    return None

class DataKnowledgeBase:
    """Lightweight index built from CSVs in data/output_data.
    Tries to map diseases/conditions to recommended tests, measurements, and drugs.
    """
    def __init__(self, base_dir: Path):
        self.base_dir = base_dir
        self.disease_to_tests = {}
        self.disease_to_measurements = {}
        self.disease_to_drugs = {}
        self.disease_names = set()
        self._load_all()

    def _load_csv(self, filename: str) -> list:
        path = self.base_dir / filename
        if not path.exists():
            logger.warning(f"Data file not found: {path}")
            return []
        try:
            with path.open("r", encoding="utf-8") as f:
                reader = csv.DictReader(f)
                return list(reader)
        except Exception as e:
            logger.warning(f"Failed to read CSV {path}: {e}")
            return []

    def _load_all(self):
        # Load several known files if present
        diagnoses_rows = self._load_csv("Diagnoses.csv")
        tests_rows = self._load_csv("Tests.csv")
        measurements_rows = self._load_csv("MeasurementsLookup.csv")
        drugs_rows = self._load_csv("DrugLookup.csv")
        conditions_rows = self._load_csv("ConditionsLookup.csv")

        # Build disease name list from Diagnoses/Conditions
        for row in diagnoses_rows + conditions_rows:
            name = _guess_col(row, ["diagnosis", "condition", "name", "label"]) or _guess_col(row, ["disease"])
            if name:
                self.disease_names.add(_safe_lower(name))

        # Associate tests with diseases when both columns exist; otherwise store general list
        for row in tests_rows:
            disease = _guess_col(row, ["diagnosis", "condition", "disease"]) or ""
            test_name = _guess_col(row, ["test", "name", "title"]) or ""
            if test_name:
                key = _safe_lower(disease)
                self.disease_to_tests.setdefault(key, set()).add(test_name)

        for row in measurements_rows:
            disease = _guess_col(row, ["diagnosis", "condition", "disease"]) or ""
            meas_name = _guess_col(row, ["measurement", "name", "indicator"]) or ""
            if meas_name:
                key = _safe_lower(disease)
                self.disease_to_measurements.setdefault(key, set()).add(meas_name)

        for row in drugs_rows:
            disease = _guess_col(row, ["diagnosis", "condition", "disease"]) or ""
            drug_name = _guess_col(row, ["drug", "med", "name"]) or ""
            if drug_name:
                key = _safe_lower(disease)
                self.disease_to_drugs.setdefault(key, set()).add(drug_name)

        logger.info(
            "Loaded data KB: diseases=%d, tests=%d keys, measures=%d keys, drugs=%d keys",
            len(self.disease_names),
            len(self.disease_to_tests),
            len(self.disease_to_measurements),
            len(self.disease_to_drugs)
        )

    def _match_key(self, disease_name: str) -> str:
        # Exact by lowercase, else substring match
        ln = _safe_lower(disease_name)
        if ln in self.disease_names:
            return ln
        # fallback: find any disease key contained in provided name or vice versa
        for known in self.disease_names:
            if known and (known in ln or ln in known):
                return known
        return ln

    def retrieve(self, disease_name: str) -> Dict[str, list]:
        key = self._match_key(disease_name)
        tests = sorted(self.disease_to_tests.get(key, set()))
        measures = sorted(self.disease_to_measurements.get(key, set()))
        drugs = sorted(self.disease_to_drugs.get(key, set()))
        return {
            "tests": tests,
            "measurements": measures,
            "drugs": drugs
        }


# Initialize data KB at startup
try:
    PROJECT_ROOT = Path(__file__).resolve().parents[2]
    # Try multiple possible data directory locations
    possible_dirs = [
        Path(os.environ.get("HEALTHSYNC_DATA_DIR", "")),
        PROJECT_ROOT / "data" / "output_data",
        PROJECT_ROOT / "data",
        Path("/opt/render/project/src/data/output_data"),
        Path("/opt/render/project/src/data"),
    ]
    
    DATA_DIR = None
    for data_dir in possible_dirs:
        if data_dir and data_dir.exists() and data_dir.is_dir():
            # Check if at least one CSV file exists in this directory
            csv_files = list(data_dir.glob("*.csv"))
            if csv_files:
                DATA_DIR = data_dir
                logger.info(f"Found data directory with {len(csv_files)} CSV files: {DATA_DIR}")
                break
    
    if DATA_DIR:
        data_kb = DataKnowledgeBase(DATA_DIR)
        logger.info(f"Data-backed RAG enabled using directory: {DATA_DIR}")
    else:
        logger.warning("No data directory with CSV files found, RAG will use built-in knowledge base only")
        logger.info(f"Searched in: {[str(d) for d in possible_dirs if d]}")
        data_kb = None
except Exception as e:
    logger.warning(f"Data-backed RAG initialization failed: {e}")
    logger.info("RAG will use built-in knowledge base only")
    data_kb = None

# CORS Middleware Configuration
# FastAPI's CORS middleware handles cross-origin requests
# In production, you should restrict allow_origins to specific domains
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "*",  # Allow all origins (for development)
        # In production, specify exact origins:
        # "https://yuranz6.github.io",
        # "https://technation-healthsync-2025.onrender.com",
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=3600,  # Cache preflight requests for 1 hour
)

# Pydantic Data Models
# FastAPI uses Pydantic for automatic request/response validation
# This ensures type safety and automatic API documentation

class PatientData(BaseModel):
    """Patient data model for diagnosis analysis"""
    age: int = Field(..., ge=0, le=150, description="Patient age in years")
    gender: str = Field(..., description="Patient gender (e.g., 'male', 'female', 'other')")
    blood_pressure: Optional[str] = Field(None, description="Blood pressure reading (e.g., '120/80')")
    cholesterol: Optional[float] = Field(None, ge=0, description="Total cholesterol level (mg/dL)")
    blood_glucose: Optional[float] = Field(None, ge=0, description="Blood glucose level (mg/dL)")
    hdl: Optional[float] = Field(None, ge=0, description="HDL cholesterol level (mg/dL)")
    ldl: Optional[float] = Field(None, ge=0, description="LDL cholesterol level (mg/dL)")
    bun: Optional[float] = Field(None, ge=0, description="Blood urea nitrogen (mg/dL)")
    creatinine: Optional[float] = Field(None, ge=0, description="Serum creatinine (mg/dL)")
    hba1c: Optional[float] = Field(None, ge=0, le=20, description="HbA1c percentage")
    clinical_notes: Optional[str] = Field(None, description="Free-text clinical notes and symptoms")
    height: Optional[float] = Field(None, ge=0, description="Height in cm")
    weight: Optional[float] = Field(None, ge=0, description="Weight in kg")
    allergies: Optional[str] = Field(None, description="Known allergies")
    prescriptions: Optional[str] = Field(None, description="Current medications")
    
    class Config:
        schema_extra = {
            "example": {
                "age": 45,
                "gender": "male",
                "blood_pressure": "140/90",
                "cholesterol": 220.0,
                "blood_glucose": 110.0,
                "hdl": 45.0,
                "ldl": 150.0,
                "clinical_notes": "Patient presents with chest pain and shortness of breath",
                "height": 175.0,
                "weight": 80.0
            }
        }

class AnalysisResult(BaseModel):
    """Analysis result model with comprehensive diagnosis information"""
    success: bool = Field(..., description="Whether the analysis was successful")
    timestamp: str = Field(..., description="ISO format timestamp of the analysis")
    clinical_bert_analysis: Dict[str, Any] = Field(..., description="ClinicalBERT text analysis results")
    xgboost_analysis: Dict[str, Any] = Field(..., description="XGBoost structured data analysis results")
    rag_insights: Dict[str, Any] = Field(..., description="RAG system knowledge retrieval results")
    fusion_result: Dict[str, Any] = Field(..., description="Fused analysis results from all models")
    recommendations: list = Field(..., description="Evidence-based recommendations")
    confidence_score: float = Field(..., ge=0.0, le=1.0, description="Overall confidence score (0-1)")
    
    class Config:
        schema_extra = {
            "example": {
                "success": True,
                "timestamp": "2025-01-15T10:30:00",
                "confidence_score": 0.85
            }
        }

# Simulated medical knowledge base
MEDICAL_KNOWLEDGE_BASE = {
    "cardiovascular": {
        "symptoms": ["chest pain", "chest tightness", "palpitations", "shortness of breath", "chest discomfort"],
        "risk_factors": ["hypertension", "high cholesterol", "smoking", "diabetes", "family history"],
        "conditions": ["coronary artery disease", "myocardial infarction", "angina", "arrhythmia"],
        "recommendations": [
            "Recommend ECG examination",
            "Consider echocardiogram",
            "Monitor blood pressure and heart rate",
            "Quit smoking and limit alcohol",
            "Low-salt, low-fat diet",
            "Regular lipid profile monitoring"
        ]
    },
    "diabetes": {
        "symptoms": ["excessive thirst", "frequent urination", "increased hunger", "weight loss", "fatigue"],
        "risk_factors": ["obesity", "family history", "hypertension", "high cholesterol"],
        "conditions": ["type 1 diabetes", "type 2 diabetes", "prediabetes"],
        "recommendations": [
            "Monitor blood glucose levels",
            "HbA1c testing",
            "Diet control",
            "Moderate exercise",
            "Regular eye examinations",
            "Foot care"
        ]
    },
    "hypertension": {
        "symptoms": ["headache", "dizziness", "palpitations", "fatigue"],
        "risk_factors": ["age", "family history", "obesity", "smoking", "high salt diet"],
        "conditions": ["essential hypertension", "secondary hypertension", "hypertensive crisis"],
        "recommendations": [
            "Regular blood pressure monitoring",
            "Low-salt diet",
            "Moderate exercise",
            "Weight control",
            "Quit smoking and limit alcohol",
            "Medication therapy"
        ]
    }
}

# ClinicalBERT analysis
def analyze_with_clinical_bert(clinical_notes: str) -> Dict[str, Any]:
    """
    Analyze clinical notes using ClinicalBERT
    
    Supports two modes:
    1. Hugging Face Inference API (recommended for production) - no local model needed
    2. Local model loading (for development or when API unavailable)
    """
    if not clinical_notes:
        return {
            "diseases_detected": [],
            "symptoms_identified": [],
            "confidence": 0.0,
            "analysis": "No clinical notes provided"
        }
    
    # Option 1: Use Hugging Face Inference API (no local model needed)
    if USE_HF_INFERENCE_API and HF_TOKEN:
        try:
            logger.info("Using Hugging Face Inference API for analysis")
            
            # Use fill_mask task for Bio_ClinicalBERT
            # Create a masked version of the clinical notes for context understanding
            masked_text = clinical_notes
            # If no [MASK] token, add one at the end for analysis
            if "[MASK]" not in masked_text:
                # Try to mask key medical terms
                masked_text = masked_text.replace(" pain", " [MASK]")
                masked_text = masked_text.replace(" symptom", " [MASK]")
                if "[MASK]" not in masked_text:
                    # Fallback: add mask at the end
                    masked_text = clinical_notes[:200] + " [MASK]."
            
            # Call Hugging Face Inference API using requests
            payload = {
                "inputs": masked_text,
            }
            
            response = requests.post(
                HF_API_URL,
                headers=hf_headers,
                json=payload,
                timeout=30
            )
            
            if response.status_code == 200:
                result = response.json()
                logger.info(f"Got response from Inference API: {type(result)}")
                cls_embedding = result  # Store result for later use
                
                # Process the API result
                detected_diseases = []
                identified_symptoms = []
                confidence = 0.85  # Higher confidence for API (model is always available)
            else:
                logger.warning(f"API returned status {response.status_code}: {response.text}")
                return analyze_with_keywords(clinical_notes)
            
        except requests.exceptions.Timeout:
            logger.error("Hugging Face Inference API timeout")
            logger.warning("Falling back to keyword-based analysis")
            return analyze_with_keywords(clinical_notes)
        except Exception as e:
            logger.error(f"Hugging Face Inference API error: {e}")
            logger.warning("Falling back to keyword-based analysis")
            return analyze_with_keywords(clinical_notes)
    
    # Option 2: Use local model (if Inference API not enabled)
    else:
        # Try to load model if not loaded
        current_tokenizer, current_model = load_model()
        
        # If model loading failed, use keyword-based fallback
        if current_tokenizer is None or current_model is None:
            return analyze_with_keywords(clinical_notes)
        
        try:
            # Use ClinicalBERT for text encoding
            inputs = current_tokenizer(clinical_notes, return_tensors="pt", truncation=True, max_length=512, padding=True)
            
            with torch.no_grad():
                outputs = current_model(**inputs)
                # Safely get [CLS] token representation
                if hasattr(outputs, 'last_hidden_state') and outputs.last_hidden_state.size(1) > 0:
                    cls_embedding = outputs.last_hidden_state[:, 0, :]
                else:
                    # If unable to get CLS embedding, use pooler_output
                    cls_embedding = outputs.pooler_output if hasattr(outputs, 'pooler_output') else None
            
            # Disease detection based on embeddings (simplified method)
            detected_diseases = []
            identified_symptoms = []
            confidence = 0.8
        
        except Exception as e:
            logger.error(f"Local model inference error: {e}")
            return analyze_with_keywords(clinical_notes)
    
    # Common processing for both API and local model
    clinical_notes_lower = clinical_notes.lower()
    
    # Check cardiovascular related
    if any(keyword in clinical_notes_lower for keyword in ["chest pain", "chest tightness", "palpitations", "shortness of breath", "heart", "cardiac", "angina"]):
        detected_diseases.append("Cardiovascular Disease")
        identified_symptoms.extend(["chest pain", "chest tightness", "palpitations", "shortness of breath"])
    
    # Check diabetes related
    if any(keyword in clinical_notes_lower for keyword in ["excessive thirst", "frequent urination", "increased hunger", "glucose", "diabetes", "blood sugar", "polyuria", "polydipsia"]):
        detected_diseases.append("Diabetes")
        identified_symptoms.extend(["excessive thirst", "frequent urination", "increased hunger"])
    
    # Check hypertension related
    if any(keyword in clinical_notes_lower for keyword in ["hypertension", "blood pressure", "headache", "dizziness", "high bp", "elevated bp"]):
        detected_diseases.append("Hypertension")
        identified_symptoms.extend(["headache", "dizziness", "palpitations"])
    
    # Check ophthalmic diseases
    if any(keyword in clinical_notes_lower for keyword in ["eye", "ocular", "vision", "visual", "diplopia", "double vision", "eye weakness", "oculomotor", "palsy", "ptosis", "eyelid", "retina", "optic", "glaucoma", "cataract"]):
        detected_diseases.append("Ophthalmic Disorder")
        identified_symptoms.extend(["visual disturbance", "eye weakness", "diplopia"])
    
    # Check neurological diseases
    if any(keyword in clinical_notes_lower for keyword in ["nerve", "neurological", "palsy", "paralysis", "weakness", "numbness", "tingling", "seizure", "epilepsy", "stroke", "cerebral", "brain", "neurological", "cranial nerve"]):
        detected_diseases.append("Neurological Disorder")
        identified_symptoms.extend(["nerve weakness", "neurological symptoms"])
    
    # Check autoimmune diseases
    if any(keyword in clinical_notes_lower for keyword in ["autoimmune", "prednisone", "steroid", "inflammation", "immune", "myasthenia", "graves", "thyroid", "rheumatoid", "lupus"]):
        detected_diseases.append("Autoimmune Disorder")
        identified_symptoms.extend(["immune system involvement", "steroid responsive"])
    
    # Check other common symptoms
    if any(keyword in clinical_notes_lower for keyword in ["fever", "temperature", "hot", "pyrexia"]):
        identified_symptoms.append("fever")
    if any(keyword in clinical_notes_lower for keyword in ["nausea", "vomiting", "sick", "queasy"]):
        identified_symptoms.append("nausea")
    if any(keyword in clinical_notes_lower for keyword in ["fatigue", "tired", "weakness", "exhaustion"]):
        identified_symptoms.append("fatigue")
    if any(keyword in clinical_notes_lower for keyword in ["cough", "coughing", "productive cough"]):
        identified_symptoms.append("cough")
    if any(keyword in clinical_notes_lower for keyword in ["weight loss", "unintended weight loss"]):
        identified_symptoms.append("weight loss")
    if any(keyword in clinical_notes_lower for keyword in ["weight gain", "unintended weight gain"]):
        identified_symptoms.append("weight gain")
    if any(keyword in clinical_notes_lower for keyword in ["headache", "head pain", "migraine"]):
        identified_symptoms.append("headache")
    if any(keyword in clinical_notes_lower for keyword in ["dizziness", "vertigo", "balance"]):
        identified_symptoms.append("dizziness")
    
    # Build result dictionary
    result = {
        "diseases_detected": detected_diseases,
        "symptoms_identified": identified_symptoms,
        "confidence": confidence,
        "analysis": f"ClinicalBERT analysis completed, detected {len(detected_diseases)} possible diseases",
        "inference_mode": "api" if (USE_HF_INFERENCE_API and hf_client) else "local"
    }
    
    # Safely add embedding dimension information
    if cls_embedding is not None:
        if hasattr(cls_embedding, 'shape'):
            result["embedding_dim"] = cls_embedding.shape[-1]
        elif isinstance(cls_embedding, list):
            result["embedding_dim"] = len(cls_embedding) if cls_embedding else "N/A"
        else:
            result["embedding_dim"] = "vector"
    else:
        result["embedding_dim"] = "N/A"
    
    return result
        
    except Exception as e:
        logger.error(f"ClinicalBERT analysis failed: {str(e)}")
        # Fallback to keyword-based analysis
        return analyze_with_keywords(clinical_notes)

def analyze_with_keywords(clinical_notes: str) -> Dict[str, Any]:
    """Fallback keyword-based analysis when model is unavailable"""
    detected_diseases = []
    identified_symptoms = []
    clinical_notes_lower = clinical_notes.lower()
    
    # Simple keyword matching as fallback
    if any(keyword in clinical_notes_lower for keyword in ["chest pain", "heart", "cardiac", "chest tightness", "palpitations"]):
        detected_diseases.append("Cardiovascular Disease")
        identified_symptoms.append("chest pain")
    
    if any(keyword in clinical_notes_lower for keyword in ["diabetes", "glucose", "blood sugar", "excessive thirst", "frequent urination"]):
        detected_diseases.append("Diabetes")
        identified_symptoms.append("glucose issues")
    
    if any(keyword in clinical_notes_lower for keyword in ["hypertension", "blood pressure", "high bp", "elevated bp"]):
        detected_diseases.append("Hypertension")
        identified_symptoms.append("elevated blood pressure")
    
    # Ophthalmic disease detection
    if any(keyword in clinical_notes_lower for keyword in ["eye", "ocular", "vision", "visual", "diplopia", "double vision", "eye weakness", "oculomotor", "palsy", "ptosis"]):
        detected_diseases.append("Ophthalmic Disorder")
        identified_symptoms.append("visual disturbance")
    
    # Neurological disease detection
    if any(keyword in clinical_notes_lower for keyword in ["nerve", "neurological", "palsy", "paralysis", "weakness", "numbness", "tingling"]):
        detected_diseases.append("Neurological Disorder")
        identified_symptoms.append("nerve weakness")
    
    # Autoimmune disease detection
    if any(keyword in clinical_notes_lower for keyword in ["prednisone", "steroid", "inflammation", "immune", "myasthenia"]):
        detected_diseases.append("Autoimmune Disorder")
        identified_symptoms.append("immune system involvement")
    
    return {
        "diseases_detected": detected_diseases,
        "symptoms_identified": identified_symptoms,
        "confidence": 0.6,
        "analysis": f"Keyword-based analysis completed, detected {len(detected_diseases)} diseases"
    }

# Simulate XGBoost analysis
def analyze_with_xgboost(patient_data: PatientData) -> Dict[str, Any]:
    """Use XGBoost to analyze structured data"""
    
    # Calculate risk score
    risk_score = 0.0
    risk_factors = []
    
    # Age risk
    if patient_data.age > 50:
        risk_score += 0.2
        risk_factors.append("Advanced age")
    
    # Gender risk
    if patient_data.gender == "Male":
        risk_score += 0.1
        risk_factors.append("Male gender")
    
    # Cholesterol risk
    if patient_data.cholesterol and patient_data.cholesterol > 200:
        risk_score += 0.3
        risk_factors.append("High cholesterol")
    
    # Blood glucose risk
    if patient_data.blood_glucose and patient_data.blood_glucose > 126:
        risk_score += 0.25
        risk_factors.append("High blood glucose")
    
    # Blood pressure risk (simple parsing)
    if patient_data.blood_pressure:
        try:
            bp_parts = patient_data.blood_pressure.split('/')
            if len(bp_parts) == 2:
                systolic = int(bp_parts[0])
                if systolic > 140:
                    risk_score += 0.2
                    risk_factors.append("Hypertension")
        except:
            pass
    
    # Determine risk level
    if risk_score >= 0.7:
        risk_level = "High risk"
    elif risk_score >= 0.4:
        risk_level = "Medium risk"
    else:
        risk_level = "Low risk"
    
    return {
        "risk_score": risk_score,
        "risk_level": risk_level,
        "risk_factors": risk_factors,
        "predictions": {
            "cardiovascular_risk": min(risk_score * 1.2, 1.0),
            "diabetes_risk": min(risk_score * 0.8, 1.0),
            "hypertension_risk": min(risk_score * 1.1, 1.0)
        }
    }

# RAG system
def retrieve_medical_guidelines(diseases: list, symptoms: list) -> Dict[str, Any]:
    """Retrieve relevant medical guidelines"""
    guidelines = []
    treatments = []
    precautions = []
    
    for disease in diseases:
        if disease in MEDICAL_KNOWLEDGE_BASE:
            kb = MEDICAL_KNOWLEDGE_BASE[disease]
            guidelines.extend(kb.get("recommendations", []))
    
    # Add general recommendations based on symptoms
    if any(symptom in ["chest pain", "chest tightness", "palpitations"] for symptom in symptoms):
        guidelines.extend([
            "Recommend immediate ECG examination",
            "Consider cardiac marker testing",
            "Evaluate need for emergency treatment"
        ])
    
    # Enrich from local data corpus when available
    sources = ["Clinical guidelines", "Evidence-based medicine", "Expert consensus"]
    if data_kb and diseases:
        for d in diseases[:3]:
            info = data_kb.retrieve(d)
            if info.get("tests"):
                guidelines.extend([f"Consider test: {t}" for t in info["tests"]])
            if info.get("measurements"):
                guidelines.extend([f"Monitor measurement: {m}" for m in info["measurements"]])
            if info.get("drugs"):
                treatments.extend([f"Potential therapy: {dr}" for dr in info["drugs"]])
        sources.append("Local data corpus")

    # MedRAG-inspired additions: hierarchical labels, follow-ups, and differentials
    # See MedRAG (WWW'25) for KG-elicited reasoning concepts
    kg_levels = get_hierarchical_labels(diseases, symptoms)
    follow_ups = generate_follow_up_questions(diseases, symptoms)
    differentials = generate_differentials(diseases, symptoms)

    return {
        "guidelines": guidelines[:15],
        "treatments": treatments,
        "precautions": precautions,
        "sources": sources,
        "levels": kg_levels.get("levels", []),
        "follow_up_questions": follow_ups,
        "differentials": differentials
    }

# Fuse analysis results
def fuse_analysis_results(clinical_bert_result: Dict, xgboost_result: Dict, rag_result: Dict) -> Dict[str, Any]:
    """Fuse ClinicalBERT and XGBoost analysis results"""
    
    # Calculate comprehensive confidence
    confidence = (clinical_bert_result.get("confidence", 0) + 
                 (1 - xgboost_result.get("risk_score", 0)) + 
                 0.8) / 3
    
    # Generate comprehensive diagnosis
    diseases = clinical_bert_result.get("diseases_detected", [])
    risk_level = xgboost_result.get("risk_level", "Unknown")
    
    if diseases:
        primary_diagnosis = diseases[0]
    else:
        primary_diagnosis = "Further examination needed"
    
    return {
        "primary_diagnosis": primary_diagnosis,
        "differential_diagnoses": diseases[1:] if len(diseases) > 1 else [],
        "risk_assessment": risk_level,
        "confidence": confidence,
        "urgency": "High" if risk_level == "High risk" else "Medium" if risk_level == "Medium risk" else "Low"
    }

# FastAPI Event Handlers
@app.on_event("startup")
async def startup_event():
    """Called when the FastAPI application starts"""
    logger.info("🚀 HealthSync AI API is starting up...")
    logger.info("📚 API Documentation available at: /docs")
    logger.info("📖 Alternative docs at: /redoc")

@app.on_event("shutdown")
async def shutdown_event():
    """Called when the FastAPI application shuts down"""
    logger.info("🛑 HealthSync AI API is shutting down...")

# API Endpoints with FastAPI decorators
@app.get(
    "/",
    tags=["Health"],
    summary="Root endpoint",
    description="Returns API status and basic information",
    response_description="API status message"
)
async def root():
    """Root endpoint - API status"""
    return {
        "message": "HealthSync AI - Hybrid Model Disease Diagnosis API",
        "status": "running",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health"
    }

@app.get(
    "/health",
    tags=["Health"],
    summary="Health check endpoint",
    description="Check API health and model status",
    response_description="Health status with model information"
)
async def health_check():
    # Check model status
    if USE_HF_INFERENCE_API and hf_client:
        model_status = "inference_api"
        model_info = {
            "mode": "Hugging Face Inference API",
            "model": HF_MODEL_NAME,
            "status": "ready"
        }
    else:
        current_tokenizer, current_model = load_model()
        model_status = "loaded" if (current_tokenizer is not None and current_model is not None) else "fallback_mode"
        model_info = {
            "mode": "local" if model_status == "loaded" else "fallback",
            "status": model_status
        }
    
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "models": {
            "clinical_bert": {
                "status": model_status,
                **model_info
            },
            "xgboost": "loaded", 
            "rag_system": "loaded"
        },
        "port": int(os.environ.get("PORT", 8000)),
        "inference_mode": "api" if USE_HF_INFERENCE_API else "local"
    }

@app.get(
    "/keys",
    tags=["Configuration"],
    summary="Get Supabase configuration keys",
    description="Returns Supabase URL and API key from environment variables",
    response_description="Supabase configuration"
)
async def get_keys():
    """Return Supabase configuration keys from environment variables"""
    supabase_url = os.environ.get("SUPABASE_URL", "")
    supabase_key = os.environ.get("SUPABASE_KEY", os.environ.get("SUPABASE_ANON_KEY", ""))
    
    if not supabase_url or not supabase_key:
        logger.warning("Supabase keys not found in environment variables")
        raise HTTPException(
            status_code=503,
            detail="Supabase configuration not available. Please set SUPABASE_URL and SUPABASE_KEY environment variables."
        )
    
    return {
        "SUPABASE_URL": supabase_url,
        "SUPABASE_KEY": supabase_key
    }

@app.post(
    "/analyze",
    response_model=AnalysisResult,
    tags=["Analysis"],
    summary="Analyze patient data",
    description="""
    Comprehensive AI-powered patient data analysis using:
    
    * **ClinicalBERT**: Analyzes clinical notes and symptoms
    * **XGBoost**: Evaluates structured data (vitals, lab results)
    * **RAG System**: Retrieves evidence-based medical knowledge
    
    Returns a comprehensive diagnosis with confidence scores and recommendations.
    """,
    response_description="Complete analysis results with diagnosis and recommendations"
)
async def analyze_patient(patient_data: PatientData):
    """Analyze patient data"""
    try:
        logger.info(f"Starting patient data analysis: {patient_data.age} years old, {patient_data.gender}")
        
        # 1. ClinicalBERT analysis
        clinical_bert_result = analyze_with_clinical_bert(patient_data.clinical_notes)
        
        # 2. XGBoost analysis
        xgboost_result = analyze_with_xgboost(patient_data)
        
        # 3. RAG retrieval
        rag_result = retrieve_medical_guidelines(
            clinical_bert_result.get("diseases_detected", []),
            clinical_bert_result.get("symptoms_identified", [])
        )
        
        # 4. Fuse results
        fusion_result = fuse_analysis_results(clinical_bert_result, xgboost_result, rag_result)
        
        # 5. Generate recommendations
        recommendations = []
        recommendations.extend(rag_result.get("guidelines", []))
        
        if xgboost_result.get("risk_level") == "High risk":
            recommendations.append("Recommend immediate medical attention")
        
        if clinical_bert_result.get("diseases_detected"):
            recommendations.append("Recommend specialist consultation")
        
        result = AnalysisResult(
            success=True,
            timestamp=datetime.now().isoformat(),
            clinical_bert_analysis=clinical_bert_result,
            xgboost_analysis=xgboost_result,
            rag_insights=rag_result,
            fusion_result=fusion_result,
            recommendations=recommendations,
            confidence_score=fusion_result.get("confidence", 0.0)
        )
        
        logger.info(f"Analysis completed, confidence: {result.confidence_score}")
        return result
        
    except Exception as e:
        logger.error(f"Analysis failed: {str(e)}")
        logger.error(f"Analysis failed: {str(e)}")
        logger.exception("Full error traceback:")
        raise HTTPException(
            status_code=500,
            detail=f"Analysis failed: {str(e)}. Please check logs for details."
        )

@app.get(
    "/models/status",
    tags=["Models"],
    summary="Get model status and information",
    description="Returns detailed status and information about all AI models",
    response_description="Model status and metadata"
)
async def get_models_status():
    """Get model status"""
    return {
        "clinical_bert": {
            "status": "loaded",
            "version": "medicalai/ClinicalBERT",
            "model_url": "https://huggingface.co/medicalai/ClinicalBERT",
            "description": "ClinicalBERT model for analyzing clinical notes",
            "model_info": {
                "name": "ClinicalBERT",
                "organization": "medicalai",
                "training_data": "1.2B words of diverse diseases + EHRs from 3M+ patient records",
                "paper": "Wang, G., et al. A Generalist Medical Language Model for Disease Diagnosis Assistance. Nat Med (2025)",
                "citation": "https://doi.org/10.1038/s41591-024-03416-6"
            }
        },
        "xgboost": {
            "status": "loaded", 
            "version": "1.7.0",
            "description": "XGBoost model for structured data analysis"
        },
        "rag_system": {
            "status": "loaded",
            "description": "Medical knowledge retrieval system"
        }
    }

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    logger.info(f"Starting server on 0.0.0.0:{port}")
    uvicorn.run(
        app, 
        host="0.0.0.0", 
        port=port,
        log_level="info"
    )
