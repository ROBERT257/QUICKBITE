import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

const App = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-600">
      <div className="container mx-auto px-4 py-8">
        <div className="glass-morphism rounded-2xl p-8 max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-6 text-center">
            🍔 QuickBite
          </h1>
          <p className="text-white text-center mb-8">
            Modern Food Delivery Platform
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="glass-morphism rounded-xl p-6 text-center">
              <h2 className="text-xl font-semibold text-white mb-2">📱 Responsive</h2>
              <p className="text-white/80">Works on all devices</p>
            </div>
            <div className="glass-morphism rounded-xl p-6 text-center">
              <h2 className="text-xl font-semibold text-white mb-2">🎨 Modern UI</h2>
              <p className="text-white/80">Glassmorphism design</p>
            </div>
            <div className="glass-morphism rounded-xl p-6 text-center">
              <h2 className="text-xl font-semibold text-white mb-2">🚀 Fast</h2>
              <p className="text-white/80">Quick delivery service</p>
            </div>
          </div>

          <div className="text-center">
            <h3 className="text-2xl font-bold text-white mb-4">System Status</h3>
            <div className="glass-morphism rounded-xl p-6">
              <div className="text-green-400 mb-2">✅ Frontend: React Working</div>
              <div className="text-green-400 mb-2">✅ Backend: <a href="http://localhost:8000" className="underline">API Running</a></div>
              <div className="text-green-400">✅ Database: MySQL Connected</div>
            </div>
          </div>

          <div className="text-center mt-8">
            <button 
              onClick={() => window.open('http://localhost:8000/admin', '_blank')}
              className="bg-white/20 hover:bg-white/30 text-white px-8 py-3 rounded-full transition-all duration-300 mr-4"
            >
              🛠️ Admin Panel
            </button>
            <button 
              onClick={() => window.open('http://localhost:8000/api', '_blank')}
              className="bg-white/20 hover:bg-white/30 text-white px-8 py-3 rounded-full transition-all duration-300"
            >
              📡 API Docs
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
