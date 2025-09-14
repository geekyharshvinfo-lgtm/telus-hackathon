// Chatbot functionality for TELUS Digital with Gemini AI Integration
class TelusChatbot {
    constructor() {
        this.isOpen = false;
        this.messages = [];
        this.isTyping = false;
        this.geminiService = null;
        this.useAI = true; // Flag to enable/disable AI responses
        this.pendingGeneralQuery = null; // Store pending non-TELUS query
        this.waitingForConfirmation = false; // Flag for confirmation state
        this.responses = {
            greetings: [
                "Hello! I'm your TELUS Digital assistant. How can I help you today?",
                "Hi there! Welcome to TELUS Digital. What can I assist you with?",
                "Greetings! I'm here to help you with any questions about TELUS Digital services."
            ],
            services: [
                "TELUS Digital offers a wide range of services including cloud solutions, digital transformation, cybersecurity, and data analytics. Which area interests you most?",
                "We provide comprehensive digital services to help businesses transform and grow. Would you like to know more about our cloud, security, or analytics solutions?"
            ],
            support: [
                "I'm here to help! You can ask me about our services, account information, technical support, or general inquiries. What do you need assistance with?",
                "Our support team is available 24/7. I can help you with basic questions or connect you with a specialist. What's your question?"
            ],
            contact: [
                "You can reach TELUS Digital support at 1-800-TELUS-1 or visit our support center. For urgent technical issues, our live chat is available 24/7.",
                "For immediate assistance, call our support line or use our online support portal. I can also help answer basic questions right here!"
            ],
            default: [
                "I understand you're asking about that. Let me help you find the right information. Could you be more specific about what you're looking for?",
                "That's a great question! While I may not have all the details, I can connect you with our support team who can provide comprehensive assistance.",
                "I want to make sure I give you the most accurate information. Could you rephrase your question or let me know what specific area you need help with?"
            ]
        };
        
        this.suggestions = [
            "What services does TELUS Digital offer?",
            "How can I contact support?",
            "Tell me about cloud solutions",
            "Help with my account",
            "Technical support"
        ];
        
        this.init();
    }
    
    async init() {
        // Check if chatbot HTML already exists
        if (!document.getElementById('chatbotContainer')) {
            this.createChatbotHTML();
        }
        this.attachEventListeners();
        this.showWelcomeMessage();
        await this.initializeGeminiService();
    }
    
    // Initialize Gemini API service
    async initializeGeminiService() {
        try {
            if (typeof GeminiAPIService !== 'undefined') {
                this.geminiService = new GeminiAPIService();
                console.log('Gemini AI service initialized successfully');
                
                // Check if API key is valid, if not use mock service
                const isValidKey = await this.geminiService.healthCheck();
                if (!isValidKey) {
                    console.warn('Gemini API key invalid, using mock AI service for demo');
                    this.geminiService = new MockGeminiService();
                }
                
                // Enable AI responses
                this.useAI = true;
                console.log('Gemini AI responses enabled');
            } else {
                console.warn('Gemini API service not available, using keyword responses only');
                this.useAI = false;
            }
        } catch (error) {
            console.error('Failed to initialize Gemini service:', error);
            console.log('Using mock AI service for demo');
            this.geminiService = new MockGeminiService();
            this.useAI = true;
        }
    }
    
    createChatbotHTML() {
        const chatbotHTML = `
            <div class="chatbot-container" id="chatbotContainer">
                <button class="chatbot-button" id="chatbotButton">
                    <span class="chatbot-button-icon"><i class="fas fa-comments"></i></span>
                </button>
                
                <div class="chatbot-popup" id="chatbotPopup">
                    <div class="chatbot-header">
                        <h3>TELUS Digital Assistant</h3>
                        <button class="chatbot-close" id="chatbotClose">&times;</button>
                    </div>
                    
                    <div class="chatbot-messages" id="chatbotMessages">
                        <div class="chatbot-welcome">
                            <h4>👋 Welcome!</h4>
                            <p>I'm your TELUS Digital assistant. How can I help you today?</p>
                            <div class="chatbot-suggestions" id="chatbotSuggestions">
                                ${this.suggestions.map(suggestion => 
                                    `<button class="suggestion-btn" onclick="telusChatbot.sendSuggestion('${suggestion}')">${suggestion}</button>`
                                ).join('')}
                            </div>
                        </div>
                    </div>
                    
                    <div class="chatbot-input-container">
                        <input type="text" class="chatbot-input" id="chatbotInput" placeholder="Type your message..." maxlength="500">
                        <button class="chatbot-send" id="chatbotSend">
                            <span>➤</span>
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', chatbotHTML);
    }
    
    attachEventListeners() {
        const button = document.getElementById('chatbotButton');
        const close = document.getElementById('chatbotClose');
        const input = document.getElementById('chatbotInput');
        const send = document.getElementById('chatbotSend');
        
        button.addEventListener('click', () => this.toggleChatbot());
        close.addEventListener('click', () => this.closeChatbot());
        send.addEventListener('click', () => this.sendMessage());
        
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage();
            }
        });
        
        input.addEventListener('input', () => {
            const sendBtn = document.getElementById('chatbotSend');
            sendBtn.disabled = input.value.trim() === '';
        });
        
        // Close chatbot when clicking outside
        document.addEventListener('click', (e) => {
            const container = document.getElementById('chatbotContainer');
            // Don't close if clicking on confirmation buttons
            const isConfirmationButton = e.target.classList.contains('chatbot-confirmation-btn');
            if (this.isOpen && !container.contains(e.target) && !isConfirmationButton) {
                this.closeChatbot();
            }
        });
    }
    
    toggleChatbot() {
        if (this.isOpen) {
            this.closeChatbot();
        } else {
            this.openChatbot();
        }
    }
    
    openChatbot() {
        const popup = document.getElementById('chatbotPopup');
        const button = document.getElementById('chatbotButton');
        
        popup.classList.add('show');
        button.classList.add('active');
        this.isOpen = true;
        
        // Focus on input
        setTimeout(() => {
            document.getElementById('chatbotInput').focus();
        }, 300);
    }
    
    closeChatbot() {
        const popup = document.getElementById('chatbotPopup');
        const button = document.getElementById('chatbotButton');
        
        popup.classList.remove('show');
        button.classList.remove('active');
        this.isOpen = false;
    }
    
    showWelcomeMessage() {
        // Welcome message is shown in HTML, no need to add programmatically
    }
    
    sendMessage() {
        const input = document.getElementById('chatbotInput');
        const message = input.value.trim();
        
        if (message === '' || this.isTyping) return;
        
        this.addMessage(message, 'user');
        input.value = '';
        document.getElementById('chatbotSend').disabled = true;
        
        // Hide suggestions after first message
        this.hideSuggestions();
        
        // Show typing indicator and respond
        this.showTyping();
        setTimeout(() => {
            // Don't hide typing here - let addMessageWithTypewriter handle the transition
            this.respondToMessage(message);
        }, 1000 + Math.random() * 1000); // Random delay between 1-2 seconds
    }
    
    sendSuggestion(suggestion) {
        const input = document.getElementById('chatbotInput');
        input.value = suggestion;
        this.sendMessage();
    }
    
    addMessage(text, sender, useTypewriter = false) {
        const messagesContainer = document.getElementById('chatbotMessages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `chatbot-message ${sender}`;
        
        if (useTypewriter && sender === 'bot') {
            // For bot messages, use typewriter effect
            messageDiv.textContent = '';
            messagesContainer.appendChild(messageDiv);
            this.scrollToBottom();
            
            // Start typewriter animation
            this.typewriterEffect(messageDiv, text);
        } else {
            // For user messages or non-typewriter, show immediately
            messageDiv.textContent = text;
            messagesContainer.appendChild(messageDiv);
            this.scrollToBottom();
        }
        
        this.messages.push({ text, sender, timestamp: new Date() });
    }
    
    // New method that handles typewriter with seamless transition from thinking animation
    addMessageWithTypewriter(text, sender) {
        const messagesContainer = document.getElementById('chatbotMessages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `chatbot-message ${sender}`;
        messageDiv.textContent = '';
        
        // Add the empty message div
        messagesContainer.appendChild(messageDiv);
        this.scrollToBottom();
        
        // Hide the thinking animation just before starting typewriter
        this.hideTyping();
        
        // Start typewriter effect immediately
        this.typewriterEffect(messageDiv, text);
        
        this.messages.push({ text, sender, timestamp: new Date() });
    }
    
    // Typewriter effect for bot responses
    typewriterEffect(element, text) {
        const words = text.split(' ');
        let currentWordIndex = 0;
        
        const typeNextWord = () => {
            if (currentWordIndex < words.length) {
                // Add the next word
                if (currentWordIndex === 0) {
                    element.textContent = words[currentWordIndex];
                } else {
                    element.textContent += ' ' + words[currentWordIndex];
                }
                
                currentWordIndex++;
                this.scrollToBottom();
                
                // Continue with next word after a delay
                setTimeout(typeNextWord, 150 + Math.random() * 100); // 150-250ms per word
            }
        };
        
        // Start typing
        typeNextWord();
    }
    
    addMessageWithButtons(text, sender, buttons) {
        const messagesContainer = document.getElementById('chatbotMessages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `chatbot-message ${sender}`;
        
        // Add the text content
        const textDiv = document.createElement('div');
        textDiv.textContent = text;
        messageDiv.appendChild(textDiv);
        
        // Add buttons container
        const buttonsDiv = document.createElement('div');
        buttonsDiv.className = 'chatbot-buttons';
        
        buttons.forEach(button => {
            const buttonElement = document.createElement('button');
            buttonElement.className = 'chatbot-confirmation-btn';
            buttonElement.textContent = button.text;
            buttonElement.onclick = (event) => this.handleButtonClick(button.action, event);
            buttonsDiv.appendChild(buttonElement);
        });
        
        messageDiv.appendChild(buttonsDiv);
        messagesContainer.appendChild(messageDiv);
        this.scrollToBottom();
        
        this.messages.push({ text, sender, timestamp: new Date(), hasButtons: true });
    }
    
    handleButtonClick(action, event) {
        // Prevent event bubbling to avoid triggering the "click outside" listener
        if (event) {
            event.stopPropagation();
            event.preventDefault();
        }
        
        // Remove all confirmation buttons to prevent multiple clicks
        const buttons = document.querySelectorAll('.chatbot-confirmation-btn');
        buttons.forEach(btn => btn.remove());
        
        if (action === 'confirmYes') {
            this.addMessage('Yes', 'user');
            this.handleConfirmationResponse('yes');
        } else if (action === 'confirmNo') {
            this.addMessage('No', 'user');
            this.handleConfirmationResponse('no');
        }
    }
    
    showTyping() {
        if (this.isTyping) return;
        
        this.isTyping = true;
        const messagesContainer = document.getElementById('chatbotMessages');
        const typingDiv = document.createElement('div');
        typingDiv.className = 'chatbot-typing';
        typingDiv.id = 'typingIndicator';
        typingDiv.innerHTML = `
            <div class="typing-content">
                <div class="typing-avatar">🤖</div>
                <div class="typing-bubble">
                    <div class="typing-text">TELUS Assistant is thinking</div>
                    <div class="typing-dots">
                        <div class="typing-dot"></div>
                        <div class="typing-dot"></div>
                        <div class="typing-dot"></div>
                    </div>
                </div>
            </div>
        `;
        
        messagesContainer.appendChild(typingDiv);
        this.scrollToBottom();
        
        // Add dynamic text changes for thinking animation
        this.startThinkingAnimation();
    }
    
    startThinkingAnimation() {
        const thinkingTexts = [
            "TELUS Assistant is thinking",
            "Processing your request",
            "Analyzing your question",
            "Searching for information",
            "Generating response"
        ];
        
        let currentIndex = 0;
        this.thinkingInterval = setInterval(() => {
            const typingText = document.querySelector('.typing-text');
            if (typingText) {
                typingText.textContent = thinkingTexts[currentIndex];
                currentIndex = (currentIndex + 1) % thinkingTexts.length;
            }
        }, 1500); // Change text every 1.5 seconds
    }
    
    hideTyping() {
        const typingIndicator = document.getElementById('typingIndicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
        
        // Clear thinking animation interval
        if (this.thinkingInterval) {
            clearInterval(this.thinkingInterval);
            this.thinkingInterval = null;
        }
        
        this.isTyping = false;
    }
    
    hideSuggestions() {
        const welcome = document.querySelector('.chatbot-welcome');
        if (welcome) {
            welcome.style.display = 'none';
        }
    }
    
    async respondToMessage(message) {
        try {
            // Check if we're waiting for confirmation response
            if (this.waitingForConfirmation) {
                this.handleConfirmationResponse(message);
                return;
            }
            
            // Check if this is a non-TELUS query that needs confirmation
            if (this.isNonTelusQuery(message)) {
                this.hideTyping();
                this.askForConfirmation(message);
                return;
            }
            
            // For TELUS-related queries, proceed normally with AI
            if (this.useAI && this.geminiService) {
                console.log('Attempting to use Gemini AI for response...');
                
                const aiResponse = await this.geminiService.generateResponse(message);
                
                if (aiResponse.success) {
                    console.log('Gemini AI response successful:', aiResponse.text);
                    this.addMessageWithTypewriter(aiResponse.text, 'bot');
                    return;
                } else {
                    console.warn('AI response failed, falling back to keyword response:', aiResponse.error);
                }
            }
            
            // Fallback to keyword-based response
            const response = this.generateResponse(message.toLowerCase());
            this.addMessageWithTypewriter(response, 'bot');
            
        } catch (error) {
            console.error('Error in respondToMessage:', error);
            // Ultimate fallback
            this.addMessageWithTypewriter(this.getRandomResponse('default'), 'bot');
        }
    }
    
    // Check if query is about non-TELUS topics
    isNonTelusQuery(message) {
        const lowerMessage = message.toLowerCase();
        
        // TELUS-related keywords that should NOT trigger confirmation
        const telusKeywords = [
            'telus', 'cloud', 'digital transformation', 'cybersecurity', 'data analytics',
            'telecommunications', 'technical support', 'billing', 'account', 'service',
            'pricing', 'contact', 'support', 'help', 'business', 'enterprise',
            'infrastructure', 'platform', 'software', 'security', 'analytics',
            'digital services', 'customer service', 'subscription', 'plan', 'package',
            'network', 'connectivity', 'internet', 'phone', 'mobile', 'wireless'
        ];
        
        // If message contains TELUS keywords, don't ask for confirmation
        if (telusKeywords.some(keyword => lowerMessage.includes(keyword))) {
            return false;
        }
        
        // Non-TELUS topics that should trigger confirmation
        const nonTelusIndicators = [
            'who is', 'what is', 'tell me about', 'explain', 'describe',
            'history of', 'biography', 'celebrity', 'actor', 'singer', 'politician',
            'sports', 'cricket', 'football', 'movie', 'film', 'book', 'author',
            'country', 'city', 'place', 'weather', 'news', 'current events',
            'recipe', 'cooking', 'health', 'medical', 'science', 'technology',
            'programming', 'coding', 'math', 'physics', 'chemistry', 'biology',
            'capital of', 'population of', 'when was', 'where is', 'how to cook',
            'how to make', 'recipe for', 'meaning of', 'definition of'
        ];
        
        // Check if it's a general knowledge question
        return nonTelusIndicators.some(indicator => lowerMessage.includes(indicator)) ||
               (lowerMessage.includes('who') && !lowerMessage.includes('telus')) ||
               (lowerMessage.includes('what') && !lowerMessage.includes('telus') && !lowerMessage.includes('service')) ||
               (lowerMessage.includes('how') && !lowerMessage.includes('telus') && !lowerMessage.includes('service') && !lowerMessage.includes('support')) ||
               (lowerMessage.includes('where') && !lowerMessage.includes('telus')) ||
               (lowerMessage.includes('when') && !lowerMessage.includes('telus'));
    }
    
    // Ask user for confirmation to search outside TELUS ecosystem
    askForConfirmation(query) {
        this.pendingGeneralQuery = query;
        this.waitingForConfirmation = true;
        
        const confirmationMessage = `I notice you're asking about something outside the TELUS Digital ecosystem. I can help you with general knowledge questions too! 

Would you like me to search for information about "${query}" outside of TELUS services?`;
        
        this.addMessageWithButtons(confirmationMessage, 'bot', [
            { text: 'Yes', action: 'confirmYes' },
            { text: 'No', action: 'confirmNo' }
        ]);
    }
    
    // Handle user's confirmation response
    async handleConfirmationResponse(message) {
        const lowerMessage = message.toLowerCase().trim();
        
        if (lowerMessage === 'yes' || lowerMessage === 'y' || lowerMessage === 'sure' || lowerMessage === 'ok' || lowerMessage === 'okay') {
            // User confirmed - proceed with general knowledge query
            this.waitingForConfirmation = false;
            const originalQuery = this.pendingGeneralQuery;
            this.pendingGeneralQuery = null;
            
            // Use a more general system instruction for this query
            const generalResponse = await this.getGeneralKnowledgeResponse(originalQuery);
            this.addMessage(generalResponse, 'bot');
            
        } else if (lowerMessage === 'no' || lowerMessage === 'n' || lowerMessage === 'cancel') {
            // User declined - offer TELUS help
            this.waitingForConfirmation = false;
            this.pendingGeneralQuery = null;
            
            this.addMessage("No problem! I'm here to help with TELUS Digital services. What would you like to know about our cloud solutions, digital transformation, cybersecurity, or other services?", 'bot');
            
        } else {
            // Invalid response - ask again
            this.addMessage("Please reply with 'yes' to search for general information or 'no' to focus on TELUS Digital services.", 'bot');
        }
    }
    
    // Get general knowledge response using Gemini
    async getGeneralKnowledgeResponse(query) {
        try {
            // Create a temporary service with general instructions
            const generalPayload = {
                systemInstruction: {
                    parts: [{
                        text: `You are a helpful AI assistant. Provide accurate, informative, and helpful responses to user questions. Be concise but comprehensive, and maintain a friendly, professional tone. Keep responses under 300 words.`
                    }]
                },
                contents: [{
                    role: 'user',
                    parts: [{ text: query }]
                }],
                generationConfig: this.geminiService.config.getGenerationConfig(),
                safetySettings: this.geminiService.config.getSafetySettings()
            };
            
            const response = await fetch(this.geminiService.config.getApiUrl(), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(generalPayload),
                mode: 'cors'
            });
            
            if (response.ok) {
                const data = await response.json();
                if (data.candidates && data.candidates[0] && data.candidates[0].content) {
                    return data.candidates[0].content.parts[0].text;
                }
            }
            
            throw new Error('Failed to get general knowledge response');
            
        } catch (error) {
            console.error('Error getting general knowledge response:', error);
            return "I'm sorry, I couldn't retrieve that information right now. Is there anything about TELUS Digital services I can help you with instead?";
        }
    }
    
    generateResponse(message) {
        // Simple keyword-based response system
        if (this.containsKeywords(message, ['hello', 'hi', 'hey', 'greetings', 'good morning', 'good afternoon'])) {
            return this.getRandomResponse('greetings');
        }
        
        if (this.containsKeywords(message, ['service', 'services', 'what do you offer', 'products', 'solutions'])) {
            return this.getRandomResponse('services');
        }
        
        if (this.containsKeywords(message, ['help', 'support', 'assistance', 'problem', 'issue', 'trouble'])) {
            return this.getRandomResponse('support');
        }
        
        if (this.containsKeywords(message, ['contact', 'phone', 'call', 'email', 'reach', 'speak to someone'])) {
            return this.getRandomResponse('contact');
        }
        
        if (this.containsKeywords(message, ['cloud', 'cloud solutions', 'cloud services'])) {
            return "Our cloud solutions include infrastructure as a service (IaaS), platform as a service (PaaS), and software as a service (SaaS). We help businesses migrate to the cloud securely and efficiently. Would you like to know more about a specific cloud service?";
        }
        
        if (this.containsKeywords(message, ['security', 'cybersecurity', 'cyber security', 'secure'])) {
            return "TELUS Digital provides comprehensive cybersecurity solutions including threat detection, security monitoring, and compliance management. Our security experts help protect your business from cyber threats. What specific security concerns do you have?";
        }
        
        if (this.containsKeywords(message, ['data', 'analytics', 'data analytics', 'insights'])) {
            return "Our data analytics services help you turn data into actionable insights. We offer business intelligence, predictive analytics, and data visualization solutions. How can we help you leverage your data better?";
        }
        
        if (this.containsKeywords(message, ['account', 'billing', 'invoice', 'payment', 'subscription'])) {
            return "For account-related inquiries including billing, payments, and subscription management, I recommend contacting our customer service team at 1-800-TELUS-1 or logging into your online account portal. Is there a specific account issue I can help direct you with?";
        }
        
        if (this.containsKeywords(message, ['technical', 'tech support', 'not working', 'error', 'bug', 'broken'])) {
            return "For technical support, our team is available 24/7. You can call our technical support line, submit a ticket through our support portal, or use our live chat for immediate assistance. Can you describe the technical issue you're experiencing?";
        }
        
        if (this.containsKeywords(message, ['price', 'pricing', 'cost', 'how much', 'expensive', 'cheap'])) {
            return "Pricing varies depending on your specific needs and requirements. I'd recommend speaking with one of our sales representatives who can provide a customized quote based on your business needs. Would you like me to connect you with our sales team?";
        }
        
        if (this.containsKeywords(message, ['thank', 'thanks', 'appreciate'])) {
            return "You're very welcome! I'm glad I could help. Is there anything else you'd like to know about TELUS Digital services?";
        }
        
        if (this.containsKeywords(message, ['bye', 'goodbye', 'see you', 'talk later'])) {
            return "Thank you for chatting with TELUS Digital! Have a great day, and don't hesitate to reach out if you need any assistance in the future.";
        }
        
        // Default response for unrecognized queries
        return this.getRandomResponse('default');
    }
    
    containsKeywords(message, keywords) {
        return keywords.some(keyword => message.includes(keyword));
    }
    
    getRandomResponse(category) {
        const responses = this.responses[category];
        return responses[Math.floor(Math.random() * responses.length)];
    }
    
    scrollToBottom() {
        const messagesContainer = document.getElementById('chatbotMessages');
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
}

// Initialize chatbot when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Only initialize if not already initialized and if chatbot container doesn't exist
    if (!window.telusChatbot && !document.getElementById('chatbotContainer')) {
        window.telusChatbot = new TelusChatbot();
    }
});

// Prevent multiple script executions
if (window.telusChatbotLoaded) {
    // Script already loaded, don't execute again
} else {
    window.telusChatbotLoaded = true;
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TelusChatbot;
}

// Global functions for existing HTML chatbot elements
function toggleChatbot() {
    if (window.telusChatbot) {
        window.telusChatbot.toggleChatbot();
    }
}

function sendMessage(message) {
    if (window.telusChatbot) {
        const input = document.getElementById('chatbotInput');
        if (input && message) {
            input.value = message;
            window.telusChatbot.sendMessage();
        }
    }
}

function sendChatbotMessage() {
    if (window.telusChatbot) {
        window.telusChatbot.sendMessage();
    }
}

function handleChatbotKeypress(event) {
    if (event.key === 'Enter' && window.telusChatbot) {
        window.telusChatbot.sendMessage();
    }
}
