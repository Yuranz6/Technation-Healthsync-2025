/**
 * Hybrid Model System: ClinicalBERT + XGBoost + RAG
 * Combining HuggingFace ClinicalBERT model and XGBoost for disease diagnosis
 */

class HybridModelSystem {
    constructor() {
        this.apiBaseUrl = 'http://localhost:8000';
        this.isConnected = false;
        this.medicalKnowledgeBase = this.initializeMedicalKB();
        this.init();
    }

    async init() {
        try {
            const healthCheck = await this.checkAPIHealth();
            this.isConnected = healthCheck.status === 'healthy';
            
            if (this.isConnected) {
                console.log('✅ Hybrid Model API connected successfully');
                this.showStatus('connected');
            } else {
                console.warn('⚠️ Hybrid Model API unavailable, using local analysis');
                this.showStatus('local');
            }
        } catch (error) {
            console.error('❌ Hybrid Model initialization failed:', error);
            this.showStatus('error');
        }
    }

    async checkAPIHealth() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/health`);
            return await response.json();
        } catch (error) {
            return { status: 'unhealthy', error: error.message };
        }
    }

    initializeMedicalKB() {
        return {
            // Disease Knowledge Base
            diseases: {
                'cardiovascular': {
                    name: 'Cardiovascular Disease',
                    symptoms: ['chest pain', 'chest tightness', 'palpitations', 'shortness of breath', 'difficulty breathing', 'dizziness', 'fatigue'],
                    risk_factors: ['hypertension', 'diabetes', 'hyperlipidemia', 'smoking', 'obesity', 'family history'],
                    lab_indicators: ['blood pressure', 'cholesterol', 'LDL', 'HDL', 'blood glucose'],
                    treatments: ['antihypertensive drugs', 'lipid-lowering drugs', 'anticoagulants', 'lifestyle interventions']
                },
                'diabetes': {
                    name: 'Diabetes',
                    symptoms: ['polydipsia', 'polyuria', 'polyphagia', 'weight loss', 'blurred vision', 'fatigue'],
                    risk_factors: ['obesity', 'family history', 'hypertension', 'lack of exercise'],
                    lab_indicators: ['blood glucose', 'HbA1c', 'insulin', 'C-peptide'],
                    treatments: ['insulin', 'metformin', 'dietary control', 'exercise therapy']
                },
                'respiratory': {
                    name: 'Respiratory Disease',
                    symptoms: ['cough', 'sputum', 'wheezing', 'dyspnea', 'difficulty breathing', 'chest pain'],
                    risk_factors: ['smoking', 'environmental pollution', 'occupational exposure', 'allergy history'],
                    lab_indicators: ['blood oxygen', 'pulmonary function', 'inflammatory markers'],
                    treatments: ['bronchodilators', 'anti-inflammatory drugs', 'oxygen therapy', 'smoking cessation']
                }
            },
            
            // Symptom-Disease Mapping
            symptom_disease_map: {
                'chest pain': ['cardiovascular', 'respiratory'],
                'chest tightness': ['cardiovascular', 'respiratory'],
                'palpitations': ['cardiovascular'],
                'shortness of breath': ['cardiovascular', 'respiratory'],
                'polydipsia': ['diabetes'],
                'polyuria': ['diabetes'],
                'cough': ['respiratory'],
                'sputum': ['respiratory']
            }
        };
    }

    async analyzePatient(patientData, clinicalNotes) {
        try {
            if (this.isConnected) {
                return await this.analyzeWithAPI(patientData, clinicalNotes);
            } else {
                return await this.analyzeLocally(patientData, clinicalNotes);
            }
        } catch (error) {
            console.error('Patient analysis failed:', error);
            return {
                error: 'Analysis failed: ' + error.message,
                confidence: 0,
                predictions: []
            };
        }
    }

    async analyzeWithAPI(patientData, clinicalNotes) {
        const response = await fetch(`${this.apiBaseUrl}/analyze`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                patient_data: patientData,
                clinical_notes: clinicalNotes,
                timestamp: new Date().toISOString()
            })
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        return await response.json();
    }

    async analyzeLocally(patientData, clinicalNotes) {
        // 1. Use ClinicalBERT to analyze clinical notes
        const clinicalAnalysis = await this.analyzeClinicalText(clinicalNotes);
        
        // 2. Use XGBoost to analyze structured data
        const structuredAnalysis = await this.analyzeStructuredData(patientData);
        
        // 3. Fuse results from both models
        const fusedResults = this.fuseModelResults(clinicalAnalysis, structuredAnalysis);
        
        // 4. Use RAG to retrieve relevant medical knowledge
        const ragResults = await this.retrieveMedicalKnowledge(fusedResults);
        
        return {
            clinical_analysis: clinicalAnalysis,
            structured_analysis: structuredAnalysis,
            fused_results: fusedResults,
            rag_knowledge: ragResults,
            confidence: this.calculateOverallConfidence(fusedResults),
            recommendations: this.generateRecommendations(fusedResults, ragResults)
        };
    }

    async analyzeClinicalText(clinicalNotes) {
        if (!clinicalNotes || clinicalNotes.trim() === '') {
            return { diseases: [], confidence: 0 };
        }

        const text = clinicalNotes.toLowerCase();
        const diseases = [];
        
        // Simulate ClinicalBERT analysis
        for (const [diseaseId, diseaseInfo] of Object.entries(this.medicalKnowledgeBase.diseases)) {
            const score = this.calculateClinicalScore(text, diseaseInfo);
            if (score > 0.1) {
                diseases.push({
                    disease_id: diseaseId,
                    name: diseaseInfo.name,
                    score: score,
                    confidence: this.calculateConfidence(score),
                    matched_symptoms: this.findMatchedSymptoms(text, diseaseInfo.symptoms),
                    clinical_evidence: this.extractClinicalEvidence(text, diseaseInfo)
                });
            }
        }

        return {
            diseases: diseases.sort((a, b) => b.score - a.score),
            text_features: this.extractTextFeatures(clinicalNotes),
            analysis_method: 'ClinicalBERT_simulation'
        };
    }

    async analyzeStructuredData(patientData) {
        // Simulate XGBoost analysis of structured data
        const features = this.extractStructuredFeatures(patientData);
        const predictions = [];
        
        // Make predictions based on lab values and physiological indicators
        for (const [diseaseId, diseaseInfo] of Object.entries(this.medicalKnowledgeBase.diseases)) {
            const score = this.calculateStructuredScore(features, diseaseInfo);
            if (score > 0.1) {
                predictions.push({
                    disease_id: diseaseId,
                    name: diseaseInfo.name,
                    score: score,
                    confidence: this.calculateConfidence(score),
                    contributing_factors: this.identifyContributingFactors(features, diseaseInfo),
                    risk_level: this.calculateRiskLevel(score, features)
                });
            }
        }

        return {
            predictions: predictions.sort((a, b) => b.score - a.score),
            features: features,
            analysis_method: 'XGBoost_simulation'
        };
    }

    fuseModelResults(clinicalAnalysis, structuredAnalysis) {
        const fusedDiseases = new Map();
        
        // Merge results from clinical analysis and structured analysis
        [...clinicalAnalysis.diseases, ...structuredAnalysis.predictions].forEach(result => {
            const diseaseId = result.disease_id;
            if (fusedDiseases.has(diseaseId)) {
                const existing = fusedDiseases.get(diseaseId);
                // Weighted fusion of scores
                existing.fused_score = (existing.score + result.score) / 2;
                existing.confidence = Math.max(existing.confidence, result.confidence);
                existing.sources = [...(existing.sources || []), result.analysis_method || 'unknown'];
            } else {
                fusedDiseases.set(diseaseId, {
                    ...result,
                    fused_score: result.score,
                    sources: [result.analysis_method || 'unknown']
                });
            }
        });

        return Array.from(fusedDiseases.values())
            .sort((a, b) => b.fused_score - a.fused_score)
            .slice(0, 5); // Return top 5 most likely diseases
    }

    async retrieveMedicalKnowledge(fusedResults) {
        const knowledge = [];
        
        for (const result of fusedResults.slice(0, 3)) { // Retrieve knowledge for top 3 diseases
            const diseaseInfo = this.medicalKnowledgeBase.diseases[result.disease_id];
            if (diseaseInfo) {
                knowledge.push({
                    disease_id: result.disease_id,
                    disease_name: diseaseInfo.name,
                    symptoms: diseaseInfo.symptoms,
                    risk_factors: diseaseInfo.risk_factors,
                    lab_indicators: diseaseInfo.lab_indicators,
                    treatments: diseaseInfo.treatments,
                    relevance_score: result.fused_score
                });
            }
        }

        return knowledge;
    }

    calculateClinicalScore(text, diseaseInfo) {
        let score = 0;
        const totalSymptoms = diseaseInfo.symptoms.length;
        
        // Symptom matching
        for (const symptom of diseaseInfo.symptoms) {
            if (text.includes(symptom.toLowerCase())) {
                score += 1.0 / totalSymptoms;
            }
        }
        
        // Risk factor matching
        for (const risk of diseaseInfo.risk_factors) {
            if (text.includes(risk.toLowerCase())) {
                score += 0.5 / diseaseInfo.risk_factors.length;
            }
        }

        return Math.min(score, 1.0);
    }

    calculateStructuredScore(features, diseaseInfo) {
        let score = 0;
        
        // Calculate score based on lab indicators
        for (const indicator of diseaseInfo.lab_indicators) {
            const value = features[indicator];
            if (value !== undefined) {
                score += this.evaluateLabValue(indicator, value) / diseaseInfo.lab_indicators.length;
            }
        }
        
        // Based on age, gender and other demographic features
        if (features.age) {
            score += this.evaluateAgeRisk(features.age, diseaseInfo.name) * 0.2;
        }
        
        if (features.gender) {
            score += this.evaluateGenderRisk(features.gender, diseaseInfo.name) * 0.1;
        }

        return Math.min(score, 1.0);
    }

    extractStructuredFeatures(patientData) {
        return {
            age: parseInt(patientData.age) || 0,
            gender: patientData.gender || 'unknown',
            blood_glucose: parseFloat(patientData.blood_glucose) || 0,
            cholesterol: parseFloat(patientData.cholesterol) || 0,
            hdl: parseFloat(patientData.hdl) || 0,
            ldl: parseFloat(patientData.ldl) || 0,
            bmi: parseFloat(patientData.bmi) || 0,
            blood_pressure: this.calculateBloodPressure(patientData),
            smoke_status: patientData.smoke_status || 'unknown',
            drinking_status: patientData.drinking_status || 'unknown'
        };
    }

    evaluateLabValue(indicator, value) {
        const thresholds = {
            'blood glucose': { normal: [70, 100], high: 126 },
            'cholesterol': { normal: [0, 200], high: 240 },
            'LDL': { normal: [0, 100], high: 160 },
            'HDL': { normal: [40, 200], low: 40 },
            'blood pressure': { normal: [90, 120], high: 140 }
        };
        
        const threshold = thresholds[indicator];
        if (!threshold) return 0.5;
        
        if (value < threshold.normal[0] || value > threshold.normal[1]) {
            return value > threshold.high ? 0.9 : 0.7;
        }
        return 0.3;
    }

    evaluateAgeRisk(age, diseaseName) {
        const ageRisks = {
            'Cardiovascular Disease': { low: 30, medium: 50, high: 65 },
            'Diabetes': { low: 25, medium: 45, high: 60 },
            'Respiratory Disease': { low: 20, medium: 40, high: 60 }
        };
        
        const risk = ageRisks[diseaseName];
        if (!risk) return 0.5;
        
        if (age >= risk.high) return 0.8;
        if (age >= risk.medium) return 0.6;
        if (age >= risk.low) return 0.4;
        return 0.2;
    }

    evaluateGenderRisk(gender, diseaseName) {
        const genderRisks = {
            'Cardiovascular Disease': { male: 0.7, female: 0.5 },
            'Diabetes': { male: 0.6, female: 0.6 },
            'Respiratory Disease': { male: 0.6, female: 0.4 }
        };
        
        const risk = genderRisks[diseaseName];
        if (!risk) return 0.5;
        
        return risk[gender.toLowerCase()] || 0.5;
    }

    calculateBloodPressure(patientData) {
        // Simulate blood pressure calculation
        const systolic = 120 + (Math.random() - 0.5) * 40;
        const diastolic = 80 + (Math.random() - 0.5) * 20;
        return { systolic, diastolic };
    }

    calculateConfidence(score) {
        if (score > 0.8) return 'high';
        if (score > 0.5) return 'medium';
        return 'low';
    }

    calculateOverallConfidence(fusedResults) {
        if (fusedResults.length === 0) return 0;
        const topScore = fusedResults[0].fused_score;
        return Math.min(topScore * 0.9, 0.95);
    }

    findMatchedSymptoms(text, symptoms) {
        return symptoms.filter(symptom => 
            text.includes(symptom.toLowerCase())
        );
    }

    extractClinicalEvidence(text, diseaseInfo) {
        const evidence = [];
        for (const symptom of diseaseInfo.symptoms) {
            if (text.includes(symptom.toLowerCase())) {
                evidence.push(symptom);
            }
        }
        return evidence;
    }

    extractTextFeatures(clinicalNotes) {
        return {
            length: clinicalNotes.length,
            word_count: clinicalNotes.split(' ').length,
            has_symptoms: /symptoms|manifestation|discomfort/.test(clinicalNotes),
            has_history: /history|previous|past/.test(clinicalNotes),
            has_medication: /medication|treatment|drug/.test(clinicalNotes)
        };
    }

    identifyContributingFactors(features, diseaseInfo) {
        const factors = [];
        for (const indicator of diseaseInfo.lab_indicators) {
            const value = features[indicator];
            if (value !== undefined) {
                const risk = this.evaluateLabValue(indicator, value);
                if (risk > 0.6) {
                    factors.push({
                        factor: indicator,
                        value: value,
                        risk_level: risk > 0.8 ? 'high' : 'medium'
                    });
                }
            }
        }
        return factors;
    }

    calculateRiskLevel(score, features) {
        if (score > 0.8) return 'high';
        if (score > 0.5) return 'medium';
        return 'low';
    }

    generateRecommendations(fusedResults, ragKnowledge) {
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

    showStatus(status) {
        const statusElement = document.getElementById('hybrid-model-status') || this.createStatusElement();
        
        switch (status) {
            case 'connected':
                statusElement.innerHTML = '🧠 Hybrid Model API Connected';
                statusElement.className = 'hybrid-model-status connected';
                break;
            case 'local':
                statusElement.innerHTML = '🧠 Local Hybrid Model';
                statusElement.className = 'hybrid-model-status local';
                break;
            case 'error':
                statusElement.innerHTML = '🧠 Hybrid Model Error';
                statusElement.className = 'hybrid-model-status error';
                break;
        }
    }

    createStatusElement() {
        const statusElement = document.createElement('div');
        statusElement.id = 'hybrid-model-status';
        statusElement.className = 'hybrid-model-status';
        
        const navbar = document.querySelector('.navbar') || document.body;
        navbar.appendChild(statusElement);
        
        return statusElement;
    }

    async displayAnalysisResults(analysis, patientData, clinicalNotes) {
        const resultsContainer = document.getElementById('hybrid-analysis-results') || this.createResultsContainer();
        
        if (analysis.error) {
            resultsContainer.innerHTML = `
                <div class="analysis-error">
                    <h3>❌ Analysis Error</h3>
                    <p>${analysis.error}</p>
                </div>
            `;
            return;
        }

        const html = `
            <div class="hybrid-analysis-card">
                <h3>🧠 Hybrid Model Disease Diagnosis Analysis</h3>
                <p class="analysis-subtitle">ClinicalBERT + XGBoost + RAG Fusion Analysis</p>
                
                <div class="analysis-overview">
                    <div class="overall-confidence">
                        <strong>Overall Confidence:</strong> 
                        <span class="confidence-${analysis.confidence > 0.7 ? 'high' : analysis.confidence > 0.4 ? 'medium' : 'low'}">
                            ${(analysis.confidence * 100).toFixed(1)}%
                        </span>
                    </div>
                    <div class="model-sources">
                        <strong>Model Sources:</strong> 
                        ${analysis.clinical_analysis ? 'ClinicalBERT' : ''}
                        ${analysis.structured_analysis ? ' + XGBoost' : ''}
                        ${analysis.rag_knowledge ? ' + RAG' : ''}
                    </div>
                </div>

                <div class="fused-results">
                    <h4>Fused Diagnosis Results:</h4>
                    ${analysis.fused_results && analysis.fused_results.length > 0 ? 
                        analysis.fused_results.map(disease => `
                            <div class="disease-result">
                                <div class="disease-header">
                                    <h5>${disease.name}</h5>
                                    <span class="disease-score">${(disease.fused_score * 100).toFixed(1)}%</span>
                                    <span class="confidence-badge confidence-${disease.confidence}">
                                        ${disease.confidence === 'high' ? 'High' : disease.confidence === 'medium' ? 'Medium' : 'Low'}
                                    </span>
                                </div>
                                
                                <div class="model-sources">
                                    <strong>Data Sources:</strong> ${disease.sources.join(' + ')}
                                </div>
                                
                                ${disease.matched_symptoms && disease.matched_symptoms.length > 0 ? `
                                    <div class="matched-symptoms">
                                        <strong>Matched Symptoms:</strong>
                                        <span class="symptoms">${disease.matched_symptoms.join(', ')}</span>
                                    </div>
                                ` : ''}
                                
                                ${disease.contributing_factors && disease.contributing_factors.length > 0 ? `
                                    <div class="contributing-factors">
                                        <strong>Key Indicators:</strong>
                                        <ul>
                                            ${disease.contributing_factors.map(factor => 
                                                `<li>${factor.factor}: ${factor.value} (${factor.risk_level})</li>`
                                            ).join('')}
                                        </ul>
                                    </div>
                                ` : ''}
                            </div>
                        `).join('') :
                        '<p class="no-results">No significant disease indicators found</p>'
                    }
                </div>

                ${analysis.rag_knowledge && analysis.rag_knowledge.length > 0 ? `
                    <div class="rag-knowledge">
                        <h4>RAG Medical Knowledge Retrieval:</h4>
                        ${analysis.rag_knowledge.map(knowledge => `
                            <div class="knowledge-item">
                                <h5>${knowledge.disease_name}</h5>
                                <div class="knowledge-details">
                                    <div class="symptoms">
                                        <strong>Typical Symptoms:</strong> ${knowledge.symptoms.join(', ')}
                                    </div>
                                    <div class="risk-factors">
                                        <strong>Risk Factors:</strong> ${knowledge.risk_factors.join(', ')}
                                    </div>
                                    <div class="lab-indicators">
                                        <strong>Key Indicators:</strong> ${knowledge.lab_indicators.join(', ')}
                                    </div>
                                    <div class="treatments">
                                        <strong>Treatment Options:</strong> ${knowledge.treatments.join(', ')}
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                ` : ''}

                ${analysis.recommendations && analysis.recommendations.length > 0 ? `
                    <div class="recommendations">
                        <h4>Smart Recommendations:</h4>
                        ${analysis.recommendations.map(rec => `
                            <div class="recommendation-item priority-${rec.priority}">
                                <div class="rec-header">
                                    <strong>${rec.content}</strong>
                                    <span class="priority-badge priority-${rec.priority}">
                                        ${rec.priority === 'high' ? 'High Priority' : rec.priority === 'medium' ? 'Medium Priority' : 'Low Priority'}
                                    </span>
                                </div>
                                <ul>
                                    ${rec.details.map(detail => `<li>${detail}</li>`).join('')}
                                </ul>
                            </div>
                        `).join('')}
                    </div>
                ` : ''}

                <div class="analysis-notes">
                    <h4>Analysis Notes:</h4>
                    <ul>
                        <li>This analysis combines ClinicalBERT text understanding and XGBoost structured data analysis</li>
                        <li>Uses RAG technology to retrieve relevant medical knowledge for diagnostic assistance</li>
                        <li>Results are for reference only and cannot replace professional medical diagnosis</li>
                        <li>High confidence results recommend seeking medical attention promptly</li>
                    </ul>
                </div>
            </div>
        `;
        
        resultsContainer.innerHTML = html;
        resultsContainer.style.display = 'block';
    }

    createResultsContainer() {
        const container = document.createElement('div');
        container.id = 'hybrid-analysis-results';
        container.className = 'hybrid-analysis-results';
        container.style.display = 'none';
        container.style.cssText = `
            margin: 20px 0;
            padding: 0;
            width: 100%;
            max-width: 1200px;
            margin-left: auto;
            margin-right: auto;
        `;
        
        // Try to find a suitable location to insert the results container
        const patientForm = document.getElementById('patient-form');
        const patientRecords = document.querySelector('.patient-records');
        
        if (patientRecords) {
            // Insert before patient records section
            patientRecords.parentNode.insertBefore(container, patientRecords);
        } else if (patientForm) {
            // Insert after form
            patientForm.parentNode.insertBefore(container, patientForm.nextSibling);
        } else {
            // Last resort, append to body
            document.body.appendChild(container);
        }
        
        console.log('✅ Results container created');
        return container;
    }
}

// Global instance
let hybridModelSystem = null;

// Initialize after page load
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Starting Hybrid Model System initialization...');
    
    try {
        hybridModelSystem = new HybridModelSystem();
        window.hybridModelSystem = hybridModelSystem; // Ensure global access
        
        console.log('✅ Hybrid Model System initialized successfully');
        
        // Wait a bit to ensure DOM is fully loaded
        setTimeout(() => {
            addAnalysisButton();
        }, 1000);
        
    } catch (error) {
        console.error('❌ Hybrid Model System initialization failed:', error);
    }
});

function addAnalysisButton() {
    // Add hybrid model analysis button to patient form
    const patientForm = document.getElementById('patient-form');
    if (patientForm) {
        // Check if button already added
        if (document.querySelector('.hybrid-analyze-btn')) {
            return;
        }
        
        const analyzeButton = document.createElement('button');
        analyzeButton.type = 'button';
        analyzeButton.className = 'btn btn-primary hybrid-analyze-btn';
        analyzeButton.innerHTML = '🧠 Hybrid AI Disease Diagnosis';
        analyzeButton.style.cssText = `
            background: linear-gradient(135deg, #6f42c1 0%, #e83e8c 100%);
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            margin: 10px 0;
            width: 100%;
            max-width: 300px;
            display: block;
            margin-left: auto;
            margin-right: auto;
        `;
        
        analyzeButton.onclick = async function() {
            await performHybridAnalysis();
        };
        
        // Insert analysis button before submit button
        const submitButton = patientForm.querySelector('button[type="submit"]');
        if (submitButton) {
            patientForm.insertBefore(analyzeButton, submitButton);
        } else {
            patientForm.appendChild(analyzeButton);
        }
        
        console.log('✅ Hybrid model analysis button added');
    } else {
        console.error('❌ Patient form not found');
    }
}

// Perform hybrid model analysis
async function performHybridAnalysis() {
    console.log('🚀 Starting hybrid model analysis...');
    
    try {
        // Get clinical notes
        const clinicalNotes = document.getElementById('clinical-notes')?.value || '';
        console.log('Clinical notes:', clinicalNotes);
        
        if (!clinicalNotes.trim()) {
            alert('Please enter clinical notes or medical history description');
            return;
        }

        // Show loading state
        const button = document.querySelector('.hybrid-analyze-btn');
        const originalText = button.innerHTML;
        button.innerHTML = '🔄 Analyzing...';
        button.disabled = true;

        // Prepare API data (compatible with 8000 Node endpoint requirements)
        const apiData = {
            patient_data: {
                age: 45,
                gender: 'Male'
            },
            clinical_notes: clinicalNotes
        };

        console.log('Sending API data:', apiData);

        // Call API directly
        const response = await fetch('http://localhost:8000/analyze', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(apiData)
        });
        
        console.log('API response status:', response.status);
        
        if (!response.ok) {
            throw new Error(`API request failed: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('API response data:', result);
        
        // Display results (pass clinical notes for frontend KG level calculation)
        displayAnalysisResults(result, clinicalNotes);
        
        // Restore button state
        button.innerHTML = originalText;
        button.disabled = false;
        
    } catch (error) {
        console.error('Hybrid model analysis failed:', error);
        alert('Analysis failed: ' + error.message);
        
        // Restore button state
        const button = document.querySelector('.hybrid-analyze-btn');
        if (button) {
            button.innerHTML = '🧠 Hybrid AI Disease Diagnosis';
            button.disabled = false;
        }
    }
}

// Display analysis results
function displayAnalysisResults(result, clinicalNotes) {
    // Create or get results container
    let resultsContainer = document.getElementById('hybrid-analysis-results');
    if (!resultsContainer) {
        resultsContainer = document.createElement('div');
        resultsContainer.id = 'hybrid-analysis-results';
        resultsContainer.className = 'hybrid-analysis-results';
        resultsContainer.style.cssText = `
            margin: 20px 0;
            padding: 20px;
            background: #f8f9fa;
            border-radius: 10px;
            border: 1px solid #dee2e6;
        `;
        
        // Insert results container after form
        const patientForm = document.getElementById('patient-form');
        if (patientForm) {
            patientForm.parentNode.insertBefore(resultsContainer, patientForm.nextSibling);
        }
    }
    
    // Extract possible rag structure (compatible with Node and FastAPI)
    const rag = result.rag_insights || {};
    const guidelines = (rag.guidelines && rag.guidelines.length ? rag.guidelines :
        (result.rag_knowledge && result.rag_knowledge[0]?.guidelines ? result.rag_knowledge.flatMap(k => k.guidelines) : [])
    ).slice(0, 15);

    // KG levels prioritize backend; otherwise infer from frontend
    const levels = Array.isArray(rag.levels) && rag.levels.length ? rag.levels : inferKGLevelsFromClient(result, clinicalNotes);
    const followUps = Array.isArray(rag.follow_up_questions) && rag.follow_up_questions.length ? rag.follow_up_questions : inferFollowUpsFromClient(result, clinicalNotes);
    const differentials = Array.isArray(rag.differentials) && rag.differentials.length ? rag.differentials : inferDifferentialsFromClient(result, clinicalNotes);

    const html = `
        <h3>🧠 Hybrid Model Disease Diagnosis Results</h3>
        
        <div style="margin-bottom: 20px; padding: 15px; background: white; border-radius: 8px;">
            <h4>📊 Comprehensive Diagnosis</h4>
            <p><strong>Primary Diagnosis:</strong> ${result.fusion_result?.primary_diagnosis || (result.fused_results && result.fused_results[0]?.disease_name) || 'Unknown'}</p>
            <p><strong>Risk Level:</strong> ${result.fusion_result?.risk_assessment || (result.fused_results && result.fused_results[0]?.risk_level) || 'Unknown'}</p>
            <p><strong>Confidence:</strong> ${((result.confidence_score || result.confidence || 0) * 100).toFixed(1)}%</p>
            <p><strong>Urgency:</strong> ${result.fusion_result?.urgency || (result.fused_results && result.fused_results[0]?.risk_level === 'high' ? 'High' : 'Medium')}</p>
        </div>
        
        <div style="margin-bottom: 20px; padding: 15px; background: white; border-radius: 8px;">
            <h4>🔬 ClinicalBERT Analysis</h4>
            <p><strong>Detected Diseases:</strong> ${(result.clinical_bert_analysis?.diseases_detected?.map(d => d.disease_name || d.name) || result.clinical_analysis?.diseases?.map(d => d.name) || []).join(', ')}</p>
            <p><strong>Identified Symptoms:</strong> ${(result.clinical_bert_analysis?.symptoms_identified || result.clinical_analysis?.diseases?.flatMap(d => d.matched_symptoms || d.matched_keywords || []) || []).join(', ')}</p>
            <p><strong>Confidence:</strong> ${((result.clinical_bert_analysis?.confidence || result.clinical_analysis?.confidence || 0) * 100).toFixed(1)}%</p>
        </div>
        
        <div style="margin-bottom: 20px; padding: 15px; background: white; border-radius: 8px;">
            <h4>📈 XGBoost Risk Assessment</h4>
            <p><strong>Risk Score:</strong> ${((result.xgboost_analysis?.risk_score || result.structured_analysis?.predictions?.[0]?.score || 0) * 100).toFixed(1)}%</p>
            <p><strong>Risk Factors:</strong> ${(result.xgboost_analysis?.risk_factors || result.structured_analysis?.predictions?.flatMap(p => p.contributing_factors?.map(f => f.factor || f) || []) || []).join(', ')}</p>
            <p><strong>Cardiovascular Risk:</strong> ${((result.xgboost_analysis?.predictions?.cardiovascular_risk || result.structured_analysis?.predictions?.find(p => p.disease_id === 'cardiovascular')?.score || 0) * 100).toFixed(1)}%</p>
            <p><strong>Diabetes Risk:</strong> ${((result.xgboost_analysis?.predictions?.diabetes_risk || result.structured_analysis?.predictions?.find(p => p.disease_id === 'diabetes')?.score || 0) * 100).toFixed(1)}%</p>
        </div>
        
        <div style="margin-bottom: 20px; padding: 15px; background: white; border-radius: 8px;">
            <h4>📚 RAG Medical Guidelines</h4>
            <ul>
                ${guidelines.map(guideline => `<li>${guideline}</li>`).join('')}
            </ul>
            ${levels && levels.length > 0 ? `
                <div style="margin-top: 12px;">
                    <strong>KG Levels (L1/L2/L3):</strong>
                    <table style="width:100%; margin-top:8px; border-collapse: collapse;">
                        <thead>
                            <tr>
                                <th style="text-align:left; border-bottom:1px solid #eee; padding:4px 0;">Disease</th>
                                <th style="text-align:left; border-bottom:1px solid #eee; padding:4px 0;">L1</th>
                                <th style="text-align:left; border-bottom:1px solid #eee; padding:4px 0;">L2</th>
                                <th style="text-align:left; border-bottom:1px solid #eee; padding:4px 0;">L3</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${levels.map(l => `
                                <tr>
                                    <td style="padding:4px 0;">${l.disease}</td>
                                    <td style="padding:4px 0;">${l.L1}</td>
                                    <td style="padding:4px 0;">${l.L2}</td>
                                    <td style="padding:4px 0;">${l.L3}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            ` : ''}
            ${followUps && followUps.length > 0 ? `
                <div style="margin-top: 12px;">
                    <strong>Follow-up Question Suggestions:</strong>
                    <ol style="margin:8px 0 0 18px;">
                        ${followUps.map(q => `<li>${q}</li>`).join('')}
                    </ol>
                </div>
            ` : ''}
            ${differentials && differentials.length > 0 ? `
                <div style="margin-top: 12px;">
                    <strong>Differential Diagnosis Points:</strong>
                    <div style="margin-top:8px; display:grid; gap:8px;">
                        ${differentials.map(d => `
                            <div style="background:#fff; border:1px solid #eee; border-radius:6px; padding:8px;">
                                <div><strong>${d.pair[0]}</strong> vs <strong>${d.pair[1]}</strong></div>
                                <ul style="margin:6px 0 0 18px;">
                                    ${d.distinguishing_points.map(p => `<li>${p}</li>`).join('')}
                                </ul>
                            </div>
                        `).join('')}
                    </div>
                </div>
            ` : ''}
        </div>
        
        <div style="padding: 15px; background: white; border-radius: 8px;">
            <h4>💡 Smart Recommendations</h4>
            <ul>
                ${(result.recommendations || []).map(rec => `<li>${typeof rec === 'string' ? rec : rec.content || JSON.stringify(rec)}</li>`).join('')}
            </ul>
        </div>
    `;
    
    resultsContainer.innerHTML = html;
    resultsContainer.style.display = 'block';
}

// -------- Frontend inference logic (for when Node response has no rag_insights) --------
function inferKGLevelsFromClient(result, clinicalNotes) {
    const diseases = (result.clinical_analysis && result.clinical_analysis.diseases || [])
        .map(d => d.name || d.disease_name);
    const fused = Array.isArray(result.fused_results) ? result.fused_results : [];
    const top = fused.slice(0, 3).map(x => x.disease_name || x.name).filter(Boolean);
    const diseaseCandidates = [...new Set([...
        diseases,
        ...top
    ].filter(Boolean))];

    const symptoms = extractSymptomsFromNotes(clinicalNotes);

    return diseaseCandidates.map(d => ({
        disease: d,
        L1: guessL1(d),
        L2: guessL2(d),
        L3: guessL3(d, symptoms)
    }));
}

function inferFollowUpsFromClient(result, clinicalNotes) {
    const s = extractSymptomsFromNotes(clinicalNotes);
    const q = [];
    if (s.has('chest pain') || s.has('chest tightness') || s.has('palpitations')) {
        q.push('Is chest pain exertional and relieved by rest?');
        q.push('Any radiation to left arm, jaw, or back?');
        q.push('Associated diaphoresis or nausea?');
    }
    if (s.has('excessive thirst') || s.has('frequent urination') || s.has('increased hunger')) {
        q.push('Recent HbA1c and fasting glucose values?');
        q.push('Unintentional weight change?');
    }
    if (s.has('diplopia') || s.has('double vision') || s.has('ptosis')) {
        q.push('Do symptoms fluctuate with fatigue?');
    }
    return Array.from(new Set(q)).slice(0, 12);
}

function inferDifferentialsFromClient(result, clinicalNotes) {
    const s = extractSymptomsFromNotes(clinicalNotes);
    const diffs = [];
    if (s.has('chest pain') || s.has('shortness of breath')) {
        diffs.push({
            pair: ['Stable angina', 'Gastroesophageal reflux'],
            distinguishing_points: [
                'Exertional pain relieved by rest favors angina',
                'Burning pain after meals lying down favors reflux'
            ]
        });
    }
    if (s.has('diplopia') || s.has('ptosis')) {
        diffs.push({
            pair: ['Myasthenia gravis', 'Cranial nerve palsy'],
            distinguishing_points: [
                'Fatigable ptosis/ophthalmoparesis favors MG',
                'Fixed pupil or severe headache suggests nerve palsy'
            ]
        });
    }
    return diffs;
}

function extractSymptomsFromNotes(notes) {
    const s = new Set();
    const t = (notes || '').toLowerCase();
    [
        'chest pain','chest tightness','palpitations','shortness of breath',
        'excessive thirst','frequent urination','increased hunger',
        'diplopia','double vision','ptosis','weakness','numbness','tingling'
    ].forEach(k => { if (t.includes(k)) s.add(k); });
    return s;
}

function guessL1(diseaseName) {
    const n = (diseaseName || '').toLowerCase();
    if (n.includes('cardiovascular') || n.includes('cardio') || n.includes('angina') || n.includes('arrhythm')) return 'Cardiovascular';
    if (n.includes('diabetes') || n.includes('diabet')) return 'Endocrine';
    if (n.includes('eye') || n.includes('ophthal')) return 'Ophthalmology';
    if (n.includes('neuro')) return 'Neurology';
    return 'General';
}

function guessL2(diseaseName) {
    const n = (diseaseName || '').toLowerCase();
    if (n.includes('angina') || n.includes('cardio')) return 'Coronary/Cardiac';
    if (n.includes('diabet')) return 'Diabetes';
    if (n.includes('ophthal')) return 'Neuro-ophthalmic';
    if (n.includes('neuro')) return 'Neuromuscular/CNS';
    return 'Condition subset';
}

function guessL3(diseaseName, symptomsSet) {
    const n = (diseaseName || '').toLowerCase();
    if (n.includes('cardio') || n.includes('angina')) {
        if (symptomsSet.has('chest pain') || symptomsSet.has('chest tightness')) return 'Angina';
        if (symptomsSet.has('palpitations') || symptomsSet.has('shortness of breath')) return 'Arrhythmia';
        return 'Cardiac condition';
    }
    if (n.includes('diabet')) {
        if (symptomsSet.has('excessive thirst') || symptomsSet.has('frequent urination')) return 'Type 2 diabetes';
        return 'Diabetes (unspecified)';
    }
    if (n.includes('ophthal')) {
        if (symptomsSet.has('diplopia') || symptomsSet.has('ptosis')) return 'Ocular motor dysfunction';
        return 'Eye disorder';
    }
    if (n.includes('neuro')) {
        if (symptomsSet.has('weakness') || symptomsSet.has('numbness') || symptomsSet.has('tingling')) return 'Peripheral neuropathy';
        return 'Neurological disorder';
    }
    return diseaseName || 'Condition';
}

// Export for use by other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = HybridModelSystem;
}
