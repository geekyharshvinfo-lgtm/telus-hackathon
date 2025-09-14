// Mock Gemini Service for TELUS Digital Chatbot
// Used as fallback when real Gemini API is not available
class MockGeminiService {
    constructor() {
        this.isDemo = true;
        
        // Add mock config to match GeminiAPIService interface
        this.config = {
            getGenerationConfig: () => ({
                temperature: 0.7,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 1000,
                candidateCount: 1
            }),
            getSafetySettings: () => [
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
            getApiUrl: () => 'https://mock-api-url.com/mock',
            getApiKey: () => 'mock-api-key'
        };
        this.responses = {
            // TELUS-specific responses
            telus: [
                "TELUS Digital offers comprehensive cloud solutions, digital transformation services, and cybersecurity solutions. How can I help you learn more about our specific services?",
                "As a leading telecommunications company, TELUS Digital provides enterprise-grade solutions including data analytics, cloud infrastructure, and technical support. What area interests you most?",
                "TELUS Digital specializes in helping businesses transform digitally with our cloud, security, and analytics platforms. Would you like to know more about any specific service?"
            ],
            
            // Cloud-related responses
            cloud: [
                "Our cloud solutions include Infrastructure as a Service (IaaS), Platform as a Service (PaaS), and Software as a Service (SaaS). We help businesses migrate securely to the cloud with 24/7 support.",
                "TELUS Digital's cloud platform offers scalable, secure, and reliable infrastructure. We provide hybrid and multi-cloud solutions tailored to your business needs.",
                "With TELUS Digital cloud services, you get enterprise-grade security, automated backups, and seamless scalability. Our experts handle the migration process for you."
            ],
            
            // Security-related responses
            security: [
                "TELUS Digital provides comprehensive cybersecurity solutions including threat detection, security monitoring, vulnerability assessments, and compliance management.",
                "Our cybersecurity services protect your business with advanced threat intelligence, 24/7 monitoring, and rapid incident response capabilities.",
                "We offer end-to-end security solutions from network protection to data encryption, ensuring your business stays secure against evolving cyber threats."
            ],
            
            // Support-related responses
            support: [
                "TELUS Digital provides 24/7 technical support with dedicated account managers and expert technicians. You can reach us at 1-800-TELUS-1 or through our online portal.",
                "Our support team offers multiple channels including phone, email, live chat, and on-site assistance. We're committed to resolving your issues quickly and efficiently.",
                "With TELUS Digital support, you get priority access to our technical experts, proactive monitoring, and comprehensive documentation to help you succeed."
            ],
            
            // General business responses
            business: [
                "TELUS Digital helps businesses of all sizes leverage technology for growth. From startups to enterprises, we provide scalable solutions that evolve with your needs.",
                "Our business solutions include digital transformation consulting, cloud migration, cybersecurity, and data analytics to help you stay competitive in today's market.",
                "Whether you're looking to modernize your infrastructure or enhance your digital capabilities, TELUS Digital has the expertise and solutions to support your goals."
            ],
            
            // Default responses
            default: [
                "That's a great question! While I can provide general information, I'd recommend speaking with one of our TELUS Digital specialists for detailed answers. You can reach them at 1-800-TELUS-1.",
                "I'd be happy to help you with that. For the most accurate and up-to-date information about TELUS Digital services, please contact our support team or visit our website.",
                "Thank you for your interest in TELUS Digital! For specific technical details or pricing information, our expert team can provide personalized assistance."
            ]
        };
    }
    
    // Simulate API response delay
    async delay(ms = 1000 + Math.random() * 2000) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    // Main method to generate mock responses
    async generateResponse(userMessage) {
        try {
            // Simulate network delay
            await this.delay();
            
            const lowerMessage = userMessage.toLowerCase();
            let responseCategory = 'default';
            
            // Determine response category based on keywords
            if (this.containsKeywords(lowerMessage, ['telus', 'company', 'about'])) {
                responseCategory = 'telus';
            } else if (this.containsKeywords(lowerMessage, ['cloud', 'infrastructure', 'hosting', 'server'])) {
                responseCategory = 'cloud';
            } else if (this.containsKeywords(lowerMessage, ['security', 'cybersecurity', 'protection', 'secure'])) {
                responseCategory = 'security';
            } else if (this.containsKeywords(lowerMessage, ['support', 'help', 'assistance', 'problem', 'issue'])) {
                responseCategory = 'support';
            } else if (this.containsKeywords(lowerMessage, ['business', 'enterprise', 'solution', 'service'])) {
                responseCategory = 'business';
            }
            
            // Get random response from category
            const responses = this.responses[responseCategory];
            const randomResponse = responses[Math.floor(Math.random() * responses.length)];
            
            return {
                success: true,
                text: randomResponse,
                isDemo: true,
                finishReason: 'STOP'
            };
            
        } catch (error) {
            console.error('Mock Gemini service error:', error);
            return {
                success: false,
                error: error.message,
                isDemo: true
            };
        }
    }
    
    // Helper method to check for keywords
    containsKeywords(message, keywords) {
        return keywords.some(keyword => message.includes(keyword));
    }
    
    // Health check always returns true for mock service
    async healthCheck() {
        return true;
    }
    
    // Clear conversation history (no-op for mock)
    clearHistory() {
        // Mock service doesn't maintain history
    }
    
    // Get conversation history (empty for mock)
    getHistory() {
        return [];
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MockGeminiService;
} else {
    window.MockGeminiService = MockGeminiService;
}

console.log('🤖 MockGeminiService loaded successfully');
