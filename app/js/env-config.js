/**
 * Environment Configuration
 * Automatically detects environment and sets API URLs
 */

const EnvConfig = {
    // Detect if running on GitHub Pages
    isGitHubPages: window.location.hostname.includes('github.io') || 
                   window.location.hostname.includes('github.com'),
    
    // Detect if running locally
    isLocal: window.location.hostname === 'localhost' || 
             window.location.hostname === '127.0.0.1',
    
    // Get environment from URL or default to production
    getEnvironment() {
        if (this.isLocal) {
            return 'local';
        }
        if (this.isGitHubPages) {
            return 'production';
        }
        return 'production';
    },
    
    // API URLs based on environment
    getApiUrls() {
        const env = this.getEnvironment();
        
        if (env === 'local') {
            return {
                hybridModelApi: 'http://localhost:8000',
                backendApi: 'http://localhost:5001'
            };
        } else {
            // Production URLs - Render deployment
            return {
                hybridModelApi: 'https://technation-healthsync-2025.onrender.com',
                backendApi: 'https://technation-healthsync-2025.onrender.com'  // Same service or update if separate
            };
        }
    },
    
    // Get Hybrid Model API URL
    getHybridModelApiUrl() {
        return this.getApiUrls().hybridModelApi;
    },
    
    // Get Backend API URL
    getBackendApiUrl() {
        return this.getApiUrls().backendApi;
    }
};

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.EnvConfig = EnvConfig;
}

// For Node.js/ES modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EnvConfig;
}

