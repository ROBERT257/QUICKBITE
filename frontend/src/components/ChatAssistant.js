// ChatAssistant component - AI-powered food assistant
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMessageCircle, FiSend, FiX, FiMessageSquare, FiUser, FiClock } from 'react-icons/fi';
import { aiAPI } from '../services/api';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const ChatMessage = ({ message, isBot, items }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex ${isBot ? 'justify-start' : 'justify-end'} mb-4`}
    >
      <div className={`flex max-w-xs lg:max-w-md ${isBot ? 'flex-row' : 'flex-row-reverse'} items-start space-x-2`}>
        {/* Avatar */}
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          isBot ? 'bg-neon-blue text-black' : 'bg-white/20 text-white'
        }`}>
          {isBot ? <FiMessageSquare className="w-4 h-4" /> : <FiUser className="w-4 h-4" />}
        </div>
        
        {/* Message Content */}
        <div className={`flex flex-col ${isBot ? 'items-start' : 'items-end'}`}>
          <div className={`rounded-2xl px-4 py-2 max-w-full ${
            isBot 
              ? 'bg-white/10 text-white border border-white/20' 
              : 'bg-neon-blue text-black'
          }`}>
            <p className="text-sm whitespace-pre-wrap">{message}</p>
          </div>
          
          {/* Timestamp */}
          <div className={`text-xs text-white/50 mt-1 ${isBot ? 'text-left' : 'text-right'}`}>
            {new Date().toLocaleTimeString('en-US', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const FoodRecommendationCard = ({ item }) => {
  return (
    <Link to={`/menu?item=${item.id}`} className="block">
      <motion.div
        whileHover={{ scale: 1.02 }}
        className="bg-white/10 backdrop-blur-md border border-white/20 p-3 rounded-lg cursor-pointer group"
      >
        <div className="flex space-x-3">
          {/* Image */}
          <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden">
            <img
              src={item.image && (item.image.startsWith('http') ? item.image : `${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/media/${item.image}`) || 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'}
              alt={item.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80';
              }}
            />
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <h4 className="text-white font-semibold text-sm group-hover:text-neon-blue transition-colors truncate">
              {item.name}
            </h4>
            <p className="text-white/60 text-xs truncate mt-1">
              {item.description}
            </p>
            <div className="flex items-center justify-between mt-1">
              <span className="text-neon-green font-bold text-sm">KSh {item.price}</span>
              <div className="flex items-center space-x-1 text-xs text-white/60">
                <FiClock className="w-3 h-3" />
                <span>{item.preparation_time}min</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
};

const ChatAssistant = () => {
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://roelog.pythonanywhere.com';
  
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      text: "Hi! I'm your QuickBite food assistant. I can help you find the perfect meal! Try asking me something like 'spicy food under 300' or 'quick lunch options'.",
      isBot: true,
      items: []
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = inputValue.trim();
    setInputValue('');
    
    // Add user message
    setMessages(prev => [...prev, { text: userMessage, isBot: false, items: [] }]);
    setIsLoading(true);

    try {
      const response = await aiAPI.chatWithAssistant({ message: userMessage });
      const data = response.data;
      
      // Add bot response
      setMessages(prev => [...prev, { 
        text: data.reply, 
        isBot: true, 
        items: data.items || []
      }]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { 
        text: "Sorry, I'm having trouble responding right now. Please try again later.", 
        isBot: true, 
        items: []
      }]);
      toast.error('Chat assistant unavailable');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Floating Chat Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={toggleChat}
        className="fixed bottom-8 right-8 w-14 h-14 bg-neon-blue text-black rounded-full shadow-lg flex items-center justify-center z-40 hover:shadow-xl transition-all duration-300"
      >
        {isOpen ? <FiX className="w-6 h-6" /> : <FiMessageCircle className="w-6 h-6" />}
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-24 right-8 w-96 h-[500px] bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-neon-blue text-black rounded-full flex items-center justify-center">
                  <FiMessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">QuickBite Assistant</h3>
                  <p className="text-white/60 text-xs">Always here to help</p>
                </div>
              </div>
              <button
                onClick={toggleChat}
                className="text-white/60 hover:text-white transition-colors"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message, index) => (
                <div key={index}>
                  <ChatMessage message={message.text} isBot={message.isBot} />
                  
                  {/* Food Recommendations */}
                  {message.items && message.items.length > 0 && (
                    <div className="mt-2 space-y-2">
                      {message.items.map((item) => (
                        <FoodRecommendationCard key={item.id} item={item} />
                      ))}
                    </div>
                  )}
                </div>
              ))}
              
              {/* Typing Indicator */}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-start space-x-2"
                >
                  <div className="flex-shrink-0 w-8 h-8 bg-neon-blue text-black rounded-full flex items-center justify-center">
                    <FiMessageSquare className="w-4 h-4" />
                  </div>
                  <div className="bg-white/10 border border-white/20 rounded-2xl px-4 py-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-white/10">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me about food..."
                  className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm placeholder-white/50 focus:outline-none focus:border-neon-blue transition-colors"
                  disabled={isLoading}
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSendMessage}
                  disabled={isLoading || !inputValue.trim()}
                  className="w-8 h-8 bg-neon-blue text-black rounded-full flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="animate-spin w-4 h-4 border-2 border-black border-t-transparent rounded-full" />
                  ) : (
                    <FiSend className="w-4 h-4" />
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatAssistant;
