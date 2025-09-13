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
                body: JSON.stringify(payload),
                mode: 'cors'
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
        const lowerMessage = message.toLowerCase();
        
        // Always use keyword responses for simple greetings and basic TELUS queries
        const keywordOnlyPatterns = [
            /^(hi|hello|hey|good morning|good afternoon|good evening)$/i,
            /^(thanks?|thank you)$/i,
            /^(bye|goodbye|see you)$/i,
            /^(help|support)$/i,
            /^(contact|phone|call)$/i
        ];
        
        // If it matches keyword-only patterns, don't use Gemini
        if (keywordOnlyPatterns.some(pattern => pattern.test(message))) {
            return false;
        }
        
        // Use Gemini for most other queries including:
        const geminiIndicators = [
            message.includes('?'), // Any question
            message.includes('who'), // Who questions
            message.includes('what'), // What questions  
            message.includes('when'), // When questions
            message.includes('where'), // Where questions
            message.includes('how'), // How questions
            message.includes('why'), // Why questions
            message.includes('explain'), // Explanation requests
            message.includes('tell me'), // Information requests
            message.includes('describe'), // Description requests
            message.includes('compare'), // Comparison requests
            message.includes('difference'), // Difference questions
            /\b(can you|could you|would you|please)\b/i.test(message), // Polite requests
            message.split(' ').length > 3, // Multi-word queries (lowered threshold)
            message.length > 20 // Longer messages
        ];
        
        // Use Gemini if any indicator is met
        return geminiIndicators.some(indicator => indicator);
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
            const testResponse = await this.generateResponse('Hello');
            return testResponse.success;
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
