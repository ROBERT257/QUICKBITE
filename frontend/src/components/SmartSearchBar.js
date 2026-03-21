import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiX, FiClock, FiTrendingUp, FiUser } from 'react-icons/fi';
import { aiAPI } from '../services/api';
import { useQuery } from 'react-query';
import toast from 'react-hot-toast';

const SmartSearchBar = ({ onSearch, placeholder = "What do you feel like eating today?" }) => {
  const [query, setQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const searchRef = useRef(null);
  const inputRef = useRef(null);

  // Fetch search suggestions
  const { data: searchSuggestions } = useQuery(
    'search-suggestions',
    aiAPI.getSearchSuggestions,
    {
      staleTime: 1000 * 60 * 10, // 10 minutes
    }
  );

  useEffect(() => {
    if (searchSuggestions) {
      setSuggestions(searchSuggestions.data);
    }
  }, [searchSuggestions]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    setShowSuggestions(value.length > 0 || !value);
  };

  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion.query);
    setShowSuggestions(false);
    handleSearch(suggestion.query);
  };

  const handleSearch = async (searchQuery = query) => {
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    try {
      const response = await aiAPI.intelligentSearch({ query: searchQuery });
      onSearch(response.data);
      setShowSuggestions(false);
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Search failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSearch();
  };

  const clearSearch = () => {
    setQuery('');
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative group">
          {/* Search Input */}
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10">
            {isLoading ? (
              <div className="animate-spin w-5 h-5 border-2 border-neon-blue border-t-transparent rounded-full" />
            ) : (
              <FiSearch className="w-5 h-5 text-white/60 group-focus-within:text-neon-blue transition-colors" />
            )}
          </div>
          
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onFocus={() => setShowSuggestions(true)}
            placeholder={placeholder}
            className="w-full bg-white/10 border border-white/20 rounded-lg pl-12 pr-12 py-4 text-lg placeholder-white/50 focus:placeholder-white/70 focus:outline-none focus:border-neon-blue transition-all duration-300"
          />
          
          {/* Clear Button */}
          {query && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 text-white/60 hover:text-white transition-colors"
            >
              <FiX className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Suggestions Dropdown */}
        <AnimatePresence>
          {showSuggestions && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full left-0 right-0 mt-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg z-50 overflow-hidden"
            >
              <div className="max-h-80 overflow-y-auto">
                {/* Quick Suggestions */}
                {query.length === 0 && suggestions.length > 0 && (
                  <div className="p-2">
                    <div className="text-xs text-white/50 font-semibold uppercase tracking-wider px-3 py-2">
                      Popular Searches
                    </div>
                    {suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/10 transition-colors flex items-center space-x-3 group"
                      >
                        <span className="text-lg">{suggestion.icon}</span>
                        <span className="text-white/80 group-hover:text-white transition-colors">
                          {suggestion.text}
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Recent Searches (if implemented) */}
                {query.length === 0 && false && (
                  <div className="p-2 border-t border-white/10">
                    <div className="text-xs text-white/50 font-semibold uppercase tracking-wider px-3 py-2">
                      Recent
                    </div>
                    {/* Recent searches would go here */}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </form>
    </div>
  );
};

export default SmartSearchBar;
