/**
 * Hybrid Model Backend API
 * Supports ClinicalBERT + XGBoost + RAG disease diagnosis
 */

const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 8000;

// Middleware
app.use(cors());
app.use(express.json());

// Mock ClinicalBERT Model
class MockClinicalBERT {
    constructor() {
        this.diseaseKeywords = {
            'cardiovascular': ['chest pain', 'chest tightness', 'palpitations', 'shortness of breath', 'difficulty breathing', 'dizziness', 'fatigue', 'hypertension', 'angina'],
            'diabetes': ['polydipsia', 'polyuria', 'polyphagia', 'weight loss', 'high blood glucose', 'diabetes', 'insulin', 'HbA1c'],
            'respiratory': ['cough', 'sputum', 'wheezing', 'dyspnea', 'difficulty breathing', 'asthma', 'pneumonia', 'bronchitis'],
            'digestive': ['abdominal pain', 'diarrhea', 'constipation', 'nausea', 'vomiting', 'stomach pain', 'gastric ulcer', 'gastritis'],
            'neurological': ['headache', 'dizziness', 'vertigo', 'altered consciousness', 'seizure', 'hemiplegia', 'aphasia', 'stroke'],
            'renal': ['edema', 'proteinuria', 'hematuria', 'renal insufficiency', 'renal failure', 'nephritis', 'kidney stones']
        };
    }

    analyze(text) {
        const results = [];
        const lowerText = text.toLowerCase();
        
        for (const [disease, keywords] of Object.entries(this.diseaseKeywords)) {
            let score = 0;
            const matchedKeywords = [];
            
            for (const keyword of keywords) {
                if (lowerText.includes(keyword.toLowerCase())) {
                    score += 1.0 / keywords.length;
                    matchedKeywords.push(keyword);
                }
            }
            
            if (score > 0.1) {
                results.push({
                    disease_id: disease,
                    disease_name: this.getDiseaseName(disease),
                    score: Math.min(score, 1.0),
                    confidence: this.getConfidence(score),
                    matched_keywords: matchedKeywords,
                    clinical_evidence: matchedKeywords
                });
            }
        }
        
        return {
            diseases_detected: results.sort((a, b) => b.score - a.score),
            confidence: results.length > 0 ? results[0].score : 0,
            analysis_method: 'ClinicalBERT_mock'
        };
    }

    getDiseaseName(diseaseId) {
        const names = {
            'cardiovascular': 'Cardiovascular Disease',
            'diabetes': 'Diabetes',
            'respiratory': 'Respiratory Disease',
            'digestive': 'Digestive Disease',
            'neurological': 'Neurological Disease',
            'renal': 'Renal Disease'
        };
        return names[diseaseId] || diseaseId;
    }

    getConfidence(score) {
        if (score > 0.7) return 'high';
        if (score > 0.4) return 'medium';
        return 'low';
    }
}

// Mock XGBoost Model
class MockXGBoost {
    constructor() {
        this.featureWeights = {
            age: 0.15,
            gender: 0.05,
            blood_glucose: 0.25,
            cholesterol: 0.20,
            hdl: 0.15,
            ldl: 0.20
        };
    }

    predict(patientData) {
        const features = this.extractFeatures(patientData);
        const predictions = [];
        
        // Cardiovascular risk prediction
        const cvdRisk = this.calculateCardiovascularRisk(features);
        if (cvdRisk > 0.1) {
            predictions.push({
                disease_id: 'cardiovascular',
                disease_name: 'Cardiovascular Disease',
                score: cvdRisk,
                confidence: this.getConfidence(cvdRisk),
                contributing_factors: this.getContributingFactors(features, 'cardiovascular'),
                risk_level: this.getRiskLevel(cvdRisk)
            });
        }
        
        // Diabetes risk prediction
        const diabetesRisk = this.calculateDiabetesRisk(features);
        if (diabetesRisk > 0.1) {
            predictions.push({
                disease_id: 'diabetes',
                disease_name: 'Diabetes',
                score: diabetesRisk,
                confidence: this.getConfidence(diabetesRisk),
                contributing_factors: this.getContributingFactors(features, 'diabetes'),
                risk_level: this.getRiskLevel(diabetesRisk)
            });
        }
        
        // Respiratory risk prediction
        const respRisk = this.calculateRespiratoryRisk(features);
        if (respRisk > 0.1) {
            predictions.push({
                disease_id: 'respiratory',
                disease_name: 'Respiratory Disease',
                score: respRisk,
                confidence: this.getConfidence(respRisk),
                contributing_factors: this.getContributingFactors(features, 'respiratory'),
                risk_level: this.getRiskLevel(respRisk)
            });
        }
        
        return {
            predictions: predictions.sort((a, b) => b.score - a.score),
            risk_score: predictions.length > 0 ? predictions[0].score : 0,
            analysis_method: 'XGBoost_mock'
        };
    }

    extractFeatures(patientData) {
        return {
            age: parseInt(patientData.age) || 45,
            gender: patientData.gender || 'unknown',
            blood_glucose: parseFloat(patientData.blood_glucose) || 100,
            cholesterol: parseFloat(patientData.cholesterol) || 200,
            hdl: parseFloat(patientData.hdl) || 50,
            ldl: parseFloat(patientData.ldl) || 120,
            bmi: parseFloat(patientData.bmi) || 25
        };
    }

    calculateCardiovascularRisk(features) {
        let risk = 0;
        
        // Age factor
        if (features.age > 65) risk += 0.3;
        else if (features.age > 50) risk += 0.2;
        else if (features.age > 35) risk += 0.1;
        
        // Cholesterol factors
        if (features.cholesterol > 240) risk += 0.25;
        else if (features.cholesterol > 200) risk += 0.15;
        
        if (features.ldl > 160) risk += 0.2;
        else if (features.ldl > 130) risk += 0.1;
        
        if (features.hdl < 40) risk += 0.15;
        
        // Gender factor
        if (features.gender === 'male') risk += 0.1;
        
        return Math.min(risk, 1.0);
    }

    calculateDiabetesRisk(features) {
        let risk = 0;
        
        // Blood glucose factor
        if (features.blood_glucose > 126) risk += 0.4;
        else if (features.blood_glucose > 100) risk += 0.2;
        
        // Age factor
        if (features.age > 45) risk += 0.2;
        
        // BMI factor (estimated from other factors)
        const estimatedBMI = features.bmi || 25;
        if (estimatedBMI > 30) risk += 0.25;
        else if (estimatedBMI > 25) risk += 0.15;
        
        return Math.min(risk, 1.0);
    }

    calculateRespiratoryRisk(features) {
        let risk = 0.1; // Base risk
        
        // Age factor
        if (features.age > 60) risk += 0.2;
        else if (features.age > 40) risk += 0.1;
        
        // Gender factor
        if (features.gender === 'male') risk += 0.1;
        
        return Math.min(risk, 1.0);
    }

    getContributingFactors(features, diseaseType) {
        const factors = [];
        
        if (diseaseType === 'cardiovascular') {
            if (features.cholesterol > 200) factors.push({ factor: 'High Cholesterol', value: features.cholesterol, impact: 'high' });
            if (features.ldl > 130) factors.push({ factor: 'High LDL', value: features.ldl, impact: 'medium' });
            if (features.hdl < 40) factors.push({ factor: 'Low HDL', value: features.hdl, impact: 'medium' });
            if (features.age > 50) factors.push({ factor: 'Age', value: features.age, impact: 'medium' });
        } else if (diseaseType === 'diabetes') {
            if (features.blood_glucose > 100) factors.push({ factor: 'High Blood Glucose', value: features.blood_glucose, impact: 'high' });
            if (features.age > 45) factors.push({ factor: 'Age', value: features.age, impact: 'medium' });
        }
        
        return factors;
    }

    getConfidence(score) {
        if (score > 0.7) return 'high';
        if (score > 0.4) return 'medium';
        return 'low';
    }

    getRiskLevel(score) {
        if (score > 0.7) return 'high';
        if (score > 0.4) return 'medium';
        return 'low';
    }
}

// RAG Knowledge Retrieval System
class RAGKnowledgeBase {
    constructor() {
        this.knowledgeBase = {
            'cardiovascular': {
                name: 'Cardiovascular Disease',
                symptoms: ['chest pain', 'chest tightness', 'palpitations', 'shortness of breath', 'difficulty breathing', 'dizziness', 'fatigue'],
                risk_factors: ['hypertension', 'diabetes', 'hyperlipidemia', 'smoking', 'obesity', 'family history'],
                lab_indicators: ['blood pressure', 'cholesterol', 'LDL', 'HDL', 'blood glucose'],
                treatments: ['antihypertensive drugs', 'lipid-lowering drugs', 'anticoagulants', 'lifestyle interventions'],
                guidelines: [
                    'Monitor blood pressure and heart rate regularly',
                    'Control blood lipid levels',
                    'Quit smoking and limit alcohol',
                    'Moderate exercise',
                    'Low-salt, low-fat diet'
                ]
            },
            'diabetes': {
                name: 'Diabetes',
                symptoms: ['polydipsia', 'polyuria', 'polyphagia', 'weight loss', 'blurred vision', 'fatigue'],
                risk_factors: ['obesity', 'family history', 'hypertension', 'lack of exercise'],
                lab_indicators: ['blood glucose', 'HbA1c', 'insulin', 'C-peptide'],
                treatments: ['insulin', 'metformin', 'dietary control', 'exercise therapy'],
                guidelines: [
                    'Monitor blood glucose regularly',
                    'Control HbA1c < 7%',
                    'Healthy diet',
                    'Regular exercise',
                    'Foot care'
                ]
            },
            'respiratory': {
                name: 'Respiratory Disease',
                symptoms: ['cough', 'sputum', 'wheezing', 'dyspnea', 'difficulty breathing', 'chest pain'],
                risk_factors: ['smoking', 'environmental pollution', 'occupational exposure', 'allergy history'],
                lab_indicators: ['blood oxygen', 'pulmonary function', 'inflammatory markers'],
                treatments: ['bronchodilators', 'anti-inflammatory drugs', 'oxygen therapy', 'smoking cessation'],
                guidelines: [
                    'Quit smoking',
                    'Avoid environmental pollution',
                    'Regular pulmonary function tests',
                    'Prevent infections',
                    'Appropriate exercise'
                ]
            }
        };
    }

    retrieve(diseaseIds) {
        const results = [];
        
        for (const diseaseId of diseaseIds) {
            const knowledge = this.knowledgeBase[diseaseId];
            if (knowledge) {
                results.push({
                    disease_id: diseaseId,
                    disease_name: knowledge.name,
                    symptoms: knowledge.symptoms,
                    risk_factors: knowledge.risk_factors,
                    lab_indicators: knowledge.lab_indicators,
                    treatments: knowledge.treatments,
                    guidelines: knowledge.guidelines
                });
            }
        }
        
        return results;
    }
}

// Initialize models
const clinicalBERT = new MockClinicalBERT();
const xgboost = new MockXGBoost();
const ragKB = new RAGKnowledgeBase();

// API Routes

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        message: 'Hybrid Model API is running',
        models: ['ClinicalBERT', 'XGBoost', 'RAG'],
        timestamp: new Date().toISOString()
    });
});

// Patient analysis endpoint
app.post('/analyze', async (req, res) => {
    try {
        const { patient_data, clinical_notes } = req.body;
        
        // 1. ClinicalBERT analysis of clinical notes
        const clinicalAnalysis = clinicalBERT.analyze(clinical_notes || '');
        
        // 2. XGBoost analysis of structured data
        const structuredAnalysis = xgboost.predict(patient_data || {});
        
        // 3. Fuse results
        const fusedResults = fuseResults(clinicalAnalysis, structuredAnalysis);
        
        // 4. RAG knowledge retrieval
        const diseaseIds = fusedResults.map(r => r.disease_id);
        const ragKnowledge = ragKB.retrieve(diseaseIds);
        
        // 5. Generate recommendations
        const recommendations = generateRecommendations(fusedResults, ragKnowledge);
        
        res.json({
            clinical_bert_analysis: clinicalAnalysis,
            xgboost_analysis: structuredAnalysis,
            fused_results: fusedResults,
            rag_knowledge: ragKnowledge,
            recommendations: recommendations,
            confidence_score: calculateOverallConfidence(fusedResults),
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('Analysis error:', error);
        res.status(500).json({
            error: 'Analysis failed',
            message: error.message
        });
    }
});

// Fuse results function
function fuseResults(clinicalAnalysis, structuredAnalysis) {
    const fusedMap = new Map();
    
    // Merge clinical analysis results
    if (clinicalAnalysis.diseases_detected) {
        for (const disease of clinicalAnalysis.diseases_detected) {
            fusedMap.set(disease.disease_id, {
                ...disease,
                sources: ['ClinicalBERT'],
                fused_score: disease.score
            });
        }
    }
    
    // Merge structured analysis results
    if (structuredAnalysis.predictions) {
        for (const prediction of structuredAnalysis.predictions) {
            if (fusedMap.has(prediction.disease_id)) {
                const existing = fusedMap.get(prediction.disease_id);
                existing.fused_score = (existing.score + prediction.score) / 2;
                existing.sources.push('XGBoost');
                existing.structured_factors = prediction.contributing_factors;
            } else {
                fusedMap.set(prediction.disease_id, {
                    ...prediction,
                    sources: ['XGBoost'],
                    fused_score: prediction.score
                });
            }
        }
    }
    
    // Calculate fusion score
    return Array.from(fusedMap.values())
        .sort((a, b) => b.fused_score - a.fused_score)
        .slice(0, 5);
}

// Calculate overall confidence
function calculateOverallConfidence(fusedResults) {
    if (fusedResults.length === 0) return 0;
    return Math.min(fusedResults[0].fused_score * 0.9, 0.95);
}

// Get confidence level
function getConfidenceLevel(score) {
    if (score > 0.7) return 'high';
    if (score > 0.4) return 'medium';
    return 'low';
}

// Generate recommendations
function generateRecommendations(fusedResults, ragKnowledge) {
    const recommendations = [];
    
    if (fusedResults.length > 0) {
        const topDisease = fusedResults[0];
        const knowledge = ragKnowledge.find(k => k.disease_id === topDisease.disease_id);
        
        if (knowledge) {
            recommendations.push({
                type: 'diagnostic',
                priority: 'high',
                content: `Recommend ${knowledge.disease_name} related examinations`,
                details: knowledge.lab_indicators.map(indicator => `Test ${indicator}`)
            });
            
            recommendations.push({
                type: 'treatment',
                priority: 'medium',
                content: `Consider ${knowledge.disease_name} treatment options`,
                details: knowledge.treatments
            });
            
            recommendations.push({
                type: 'management',
                priority: 'medium',
                content: `${knowledge.disease_name} management guidelines`,
                details: knowledge.guidelines
            });
        }
    }
    
    // General recommendations
    recommendations.push({
        type: 'lifestyle',
        priority: 'low',
        content: 'Recommend lifestyle improvements',
        details: ['Healthy diet', 'Regular exercise', 'Quit smoking and limit alcohol', 'Regular check-ups']
    });
    
    return recommendations;
}

// Start server
app.listen(PORT, () => {
    console.log(`🧠 Hybrid Model API server running at http://localhost:${PORT}`);
    console.log('📊 Supported models: ClinicalBERT + XGBoost + RAG');
    console.log('🔗 API documentation: http://localhost:8000/health');
});
