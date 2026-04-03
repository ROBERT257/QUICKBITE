import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  SparklesIcon, 
  PaperAirplaneIcon,
  UserIcon,
  ChipIcon,
  XIcon,
  MinusIcon,
  PlusIcon
} from '@heroicons/react/outline';
import toast from 'react-hot-toast';

const PremiumAIChat = ({ onClose }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'ai',
      content: "👋 Hi! I'm your QuickBite AI assistant. I can help you with menu recommendations, order tracking, nutritional information, and more. How can I assist you today?",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isMinimized, setIsMinimized] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateAIResponse = async (userMessage) => {
    await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));
    
    const responses = [
      "That's a great question! Let me help you with that. Based on your preferences, I'd recommend our signature burgers which are customer favorites.",
      "I can definitely assist you with that! Our menu features a variety of options to suit different dietary preferences and tastes.",
      "Excellent choice! Many customers love that item. Would you like to know about nutritional information or pairing suggestions?",
      "I understand you're looking for recommendations. Our chef's special today includes fresh ingredients with a unique twist on classic flavors.",
      "Thank you for asking! I can provide information about our menu, track orders, help with dietary restrictions, and suggest meal combinations."
    ];

    const lowerMessage = userMessage.toLowerCase();
    let response = responses[Math.floor(Math.random() * responses.length)];

    if (lowerMessage.includes('menu') || lowerMessage.includes('food')) {
      response = "Our menu features delicious burgers, pizzas, drinks, and desserts! Everything is made fresh with quality ingredients. What type of cuisine are you interested in?";
    } else if (lowerMessage.includes('order') || lowerMessage.includes('track')) {
      response = "I can help you track your order! Please provide your order number, or I can check your recent orders if you're logged in.";
    } else if (lowerMessage.includes('price') || lowerMessage.includes('cost')) {
      response = "Our prices range from KSh 250 for snacks to KSh 1200 for premium meals. We also have combo deals that offer great value!";
    } else if (lowerMessage.includes('delivery')) {
      response = "We offer fast delivery within 30-45 minutes! Delivery is KSh 150 for orders under KSh 1000, and free for orders above that.";
    } else if (lowerMessage.includes('vegetarian') || lowerMessage.includes('vegan')) {
      response = "We have several vegetarian options! Our veggie burger, margherita pizza, and fresh salads are popular choices. All can be customized to your preference.";
    } else if (lowerMessage.includes('recommend') || lowerMessage.includes('suggest')) {
      response = "Based on popular choices, I'd recommend trying our signature QuickBite Burger with a side of our special fries and a milkshake. It's our most loved combination!";
    }

    return response;
  };

  const sendMessage = async () => {
    if (!input.trim() || isTyping) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const aiResponse = await generateAIResponse(input);
      const aiMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: aiResponse,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      toast.error('AI assistant is temporarily unavailable');
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const messageVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };

  return (
    <>
      {/* AI Chat Button */}
      <AnimatePresence>
        {isMinimized && (
          <motion.button
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsMinimized(false)}
            className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <ChipIcon className="w-6 h-6 text-white" />
            <motion.div
              className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {!isMinimized && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="fixed bottom-6 right-6 z-50 w-80 h-96 transition-all duration-300"
          >
            <div className="premium-card h-full flex flex-col relative overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <ChipIcon className="w-6 h-6 text-white" />
                    <motion.div
                      className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">AI Assistant</h3>
                    <p className="text-white/80 text-xs">Always here to help</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="text-white/80 hover:text-white transition-colors p-1"
                  >
                    {isExpanded ? <MinusIcon className="w-4 h-4" /> : <PlusIcon className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => setIsMinimized(true)}
                    className="text-white/80 hover:text-white transition-colors p-1"
                  >
                    <XIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Messages Area */}
              <AnimatePresence>
                {!isMinimized && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex-1 overflow-y-auto p-4 space-y-4"
                  >
                    {messages.map((message) => (
                      <motion.div
                        key={message.id}
                        variants={messageVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-xs ${message.type === 'user' ? 'order-2' : 'order-1'}`}>
                          <div className={`flex items-start space-x-2 ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                              message.type === 'user' 
                                ? 'bg-gradient-to-r from-blue-400 to-blue-600' 
                                : 'bg-gradient-to-r from-purple-400 to-purple-600'
                            }`}>
                              {message.type === 'user' ? (
                                <UserIcon className="w-4 h-4 text-white" />
                              ) : (
                                <SparklesIcon className="w-4 h-4 text-white" />
                              )}
                            </div>
                            <div className={`px-3 py-2 rounded-2xl ${
                              message.type === 'user' 
                                ? 'bg-blue-500 text-white' 
                                : 'bg-white/10 text-white backdrop-blur-sm'
                            }`}>
                              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                    
                    {isTyping && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex justify-start"
                      >
                        <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-3 py-2">
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
                            <span className="text-white/60 text-sm">AI is typing...</span>
                          </div>
                        </div>
                      </motion.div>
                    )}
                    <div ref={messagesEndRef} />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Input Area */}
              <AnimatePresence>
                {!isMinimized && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    className="p-4 border-t border-white/10"
                  >
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 relative">
                        <input
                          ref={inputRef}
                          type="text"
                          value={input}
                          onChange={(e) => setInput(e.target.value)}
                          onKeyPress={handleKeyPress}
                          placeholder="Ask me anything about QuickBite..."
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-blue-400 focus:bg-white/15 transition-all"
                          disabled={isTyping}
                        />
                        {input && (
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                          </div>
                        )}
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={sendMessage}
                        disabled={!input.trim() || isTyping}
                        className="px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      >
                        <PaperAirplaneIcon className="w-4 h-4" />
                      </motion.button>
                    </div>
                    
                    {/* Quick Actions */}
                    <div className="flex items-center justify-center space-x-2 mt-2">
                      <button
                        onClick={() => setInput("What's on the menu today?")}
                        className="text-xs text-white/60 hover:text-white/80 transition-colors"
                      >
                        Menu
                      </button>
                      <span className="text-white/30">•</span>
                      <button
                        onClick={() => setInput("Track my order")}
                        className="text-xs text-white/60 hover:text-white/80 transition-colors"
                      >
                        Track Order
                      </button>
                      <span className="text-white/30">•</span>
                      <button
                        onClick={() => setInput("Recommend something for lunch")}
                        className="text-xs text-white/60 hover:text-white/80 transition-colors"
                      >
                        Recommend
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default PremiumAIChat;
