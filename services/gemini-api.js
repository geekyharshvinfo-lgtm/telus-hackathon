// Gemini API Service for TELUS Digital Chatbot
class GeminiAPIService {
    constructor() {
        this.config = new GeminiConfig();
        this.requestCount = 0;
        this.lastRequestTime = 0;
        this.conversationHistory = [];
        
        // Validate configuration on initialization
        if (!this.config.isValid()) {
            console.error('Gemini API configuration is invalid');
            throw new Error('Invalid Gemini API configuration');
        }
    }
    
    // Rate limiting check
    async checkRateLimit() {
        const now = Date.now();
        const timeSinceLastRequest = now - this.lastRequestTime;
        const minDelay = this.config.getRateLimiting().requestDelay;
        
        if (timeSinceLastRequest < minDelay) {
            const waitTime = minDelay - timeSinceLastRequest;
            await this.delay(waitTime);
        }
        
        this.lastRequestTime = Date.now();
    }
    
    // Utility function for delays
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    // Add message to conversation history
    addToHistory(role, content) {
        this.conversationHistory.push({
            role: role,
            parts: [{ text: content }]
        });
        
        // Keep only last 10 messages to manage context length
        if (this.conversationHistory.length > 10) {
            this.conversationHistory = this.conversationHistory.slice(-10);
        }
    }
    
    // Build request payload
    buildRequestPayload(userMessage) {
        // Add current user message to history
        this.addToHistory('user', userMessage);
        
        const payload = {
            systemInstruction: this.config.getSystemInstruction(),
            contents: this.conversationHistory,
            generationConfig: this.config.getGenerationConfig(),
            safetySettings: this.config.getSafetySettings()
        };
        
        return payload;
    }
    
    // Process and validate response
    processResponse(response) {
        try {
            if (!response.candidates || response.candidates.length === 0) {
                throw new Error('No response candidates received');
            }
            
            const candidate = response.candidates[0];
            
            // Check for safety issues
            if (candidate.finishReason === 'SAFETY') {
                throw new Error('Response blocked due to safety concerns');
            }
            
            if (!candidate.content || !candidate.content.parts || candidate.content.parts.length === 0) {
                throw new Error('Invalid response structure');
            }
            
            let responseText = candidate.content.parts[0].text;
            
            // Add assistant response to history
            this.addToHistory('model', responseText);
            
            // Apply response filtering
            responseText = this.filterResponse(responseText);
            
            return {
                success: true,
                text: responseText,
                finishReason: candidate.finishReason
            };
            
        } catch (error) {
            console.error('Error processing Gemini response:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    // Filter and validate response content
    filterResponse(text) {
        const responseConfig = this.config.getResponseConfig();
        
        // Trim whitespace
        text = text.trim();
        
        // Limit response length
        if (text.length > responseConfig.maxLength) {
            text = text.substring(0, responseConfig.maxLength - 3) + '...';
        }
        
        // Basic profanity filter (simple implementation)
        if (responseConfig.filterProfanity) {
            const profanityWords = ['damn', 'hell', 'crap']; // Add more as needed
            profanityWords.forEach(word => {
                const regex = new RegExp(word, 'gi');
                text = text.replace(regex, '*'.repeat(word.length));
            });
        }
        
        return text;
    }
    
    // Main method to generate response
    async generateResponse(userMessage) {
        try {
            // Check rate limiting
            await this.checkRateLimit();
            
            // Build request payload
            const payload = this.buildRequestPayload(userMessage);
            
            // Make API request with retry logic
            const response = await this.makeRequestWithRetry(payload);
            
            // Process response
            return this.processResponse(response);
            
        } catch (error) {
            console.error('Error generating Gemini response:', error);
            return {
                success: false,
                error: error.message,
                fallback: true
            };
        }
    }
    
    // Make API request with retry logic
    async makeRequestWithRetry(payload, attempt = 1) {
        const fallbackConfig = this.config.getFallbackConfig();
        
        try {
            console.log('Making Gemini API request, attempt:', attempt);
            console.log('API URL:', this.config.getApiUrl());
            console.log('Payload:', JSON.stringify(payload, null, 2));
            
            const response = await fetch(this.config.getApiUrl(), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            });
            
            console.log('Response status:', response.status);
            console.log('Response headers:', response.headers);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('API Error Response:', errorText);
                let errorData;
                try {
                    errorData = JSON.parse(errorText);
                } catch (e) {
                    errorData = { message: errorText };
                }
                throw new Error(`API request failed: ${response.status} - ${errorData.error?.message || errorData.message || response.statusText}`);
            }
            
            const data = await response.json();
            console.log('API Response:', data);
            return data;
            
        } catch (error) {
            console.error(`Gemini API request attempt ${attempt} failed:`, error);
            console.error('Error details:', {
                name: error.name,
                message: error.message,
                stack: error.stack
            });
            
            // Retry logic
            if (attempt < fallbackConfig.maxRetries) {
                console.log(`Retrying in ${fallbackConfig.retryDelay}ms...`);
                await this.delay(fallbackConfig.retryDelay);
                return this.makeRequestWithRetry(payload, attempt + 1);
            }
            
            throw error;
        }
    }
    
    // Check if message should use Gemini (vs existing keyword system)
    shouldUseGemini(message) {
        // Use Gemini for all messages except very simple ones
        const lowerMessage = message.toLowerCase().trim();
        
        // Only use keyword responses for very basic greetings
        const keywordOnlyPatterns = [
            /^(hi|hello|hey)$/i,
            /^(thanks?|thank you)$/i,
            /^(bye|goodbye)$/i
        ];
        
        // If it matches keyword-only patterns, don't use Gemini
        return !keywordOnlyPatterns.some(pattern => pattern.test(lowerMessage));
    }
    
    // Clear conversation history
    clearHistory() {
        this.conversationHistory = [];
    }
    
    // Get conversation history
    getHistory() {
        return this.conversationHistory;
    }
    
    // Health check
    async healthCheck() {
        try {
            // Check if API key is properly configured
            if (!this.config.getApiKey() || 
                this.config.getApiKey() === 'YOUR_GEMINI_API_KEY_HERE' ||
                this.config.getApiKey() === 'AIzaSyDhKGOJhJGKJHGKJHGKJHGKJHGKJHGKJHG') {
                console.warn('Gemini API key not configured properly. Please set a valid API key in config/gemini-config.js');
                console.warn('Current API key:', this.config.getApiKey());
                return false;
            }
            
            // Test with a simple API call instead of full generateResponse to avoid side effects
            try {
                console.log('Testing Gemini API connection...');
                const testPayload = {
                    contents: [{
                        role: 'user',
                        parts: [{ text: 'Hello' }]
                    }],
                    generationConfig: {
                        temperature: 0.1,
                        maxOutputTokens: 10
                    }
                };
                
                const response = await fetch(this.config.getApiUrl(), {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(testPayload)
                });
                
                if (response.ok) {
                    const data = await response.json();
                    console.log('Gemini API health check successful');
                    return true;
                } else {
                    const errorText = await response.text();
                    console.warn('Gemini API health check failed:', response.status, errorText);
                    return false;
                }
            } catch (apiError) {
                console.warn('Gemini API connection test failed:', apiError.message);
                return false;
            }
        } catch (error) {
            console.error('Gemini API health check failed:', error);
            return false;
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GeminiAPIService;
} else {
    window.GeminiAPIService = GeminiAPIService;
}
