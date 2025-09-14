// Gemini API Configuration for TELUS Digital Chatbot
class GeminiConfig {
    constructor() {
        this.config = {
            // API Configuration
            apiKey: 'AIzaSyA2skLFA5n2Lb628UL2CJwXK50EXk_3API', // Your Gemini API key
            baseUrl: 'https://generativelanguage.googleapis.com/v1beta/models',
            model: 'gemini-2.0-flash-exp', // Gemini Flash 2.5 model for enhanced responses
            
            // Request Parameters
            generationConfig: {
                temperature: 0.7,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 1000,
                candidateCount: 1
            },
            
            // Safety Settings
            safetySettings: [
                {
                    category: 'HARM_CATEGORY_HARASSMENT',
                    threshold: 'BLOCK_MEDIUM_AND_ABOVE'
                },
                {
                    category: 'HARM_CATEGORY_HATE_SPEECH',
                    threshold: 'BLOCK_MEDIUM_AND_ABOVE'
                },
                {
                    category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
                    threshold: 'BLOCK_MEDIUM_AND_ABOVE'
                },
                {
                    category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
                    threshold: 'BLOCK_MEDIUM_AND_ABOVE'
                }
            ],
            
            // TELUS-Specific System Instructions
            systemInstruction: {
                parts: [{
                    text: `You are a helpful customer service assistant for TELUS Digital, a leading telecommunications and digital services company. 

TELUS Digital provides:
- Cloud solutions (IaaS, PaaS, SaaS)
- Digital transformation services
- Cybersecurity solutions
- Data analytics and business intelligence
- Telecommunications services
- Technical support

Guidelines for responses:
- Be professional, friendly, and helpful
- Use clear, concise language
- For TELUS-related questions: Provide detailed, helpful information about our services
- For non-TELUS questions: You can answer them normally, but be helpful and informative
- If you don't know specific TELUS details, direct users to contact support at 1-800-TELUS-1
- Maintain a positive, solution-oriented tone
- Keep responses under 300 words for better user experience
- Always offer to help further when appropriate

Remember: You represent TELUS Digital's commitment to putting customers first and providing excellent service, but you can also be helpful with general knowledge questions.`
                }]
            },
            
            // Rate Limiting
            rateLimiting: {
                maxRequestsPerMinute: 15,
                requestDelay: 1000 // 1 second between requests
            },
            
            // Fallback Configuration
            fallback: {
                enabled: true,
                maxRetries: 2,
                retryDelay: 2000 // 2 seconds
            },
            
            // Response Processing
            responseConfig: {
                maxLength: 500,
                filterProfanity: true,
                requireTelusContext: true
            }
        };
    }
    
    getApiKey() {
        return this.config.apiKey;
    }
    
    getBaseUrl() {
        return this.config.baseUrl;
    }
    
    getModel() {
        return this.config.model;
    }
    
    getGenerationConfig() {
        return this.config.generationConfig;
    }
    
    getSafetySettings() {
        return this.config.safetySettings;
    }
    
    getSystemInstruction() {
        return this.config.systemInstruction;
    }
    
    getRateLimiting() {
        return this.config.rateLimiting;
    }
    
    getFallbackConfig() {
        return this.config.fallback;
    }
    
    getResponseConfig() {
        return this.config.responseConfig;
    }
    
    // Build complete API URL
    getApiUrl() {
        return `${this.config.baseUrl}/${this.config.model}:generateContent?key=${this.config.apiKey}`;
    }
    
    // Validate configuration
    isValid() {
        return !!(this.config.apiKey && this.config.baseUrl && this.config.model);
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GeminiConfig;
} else {
    window.GeminiConfig = GeminiConfig;
}
