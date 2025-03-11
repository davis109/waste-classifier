import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ImageClassification from './components/ImageClassification';
import Chatbot from './components/Chatbot';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
        <Navbar />
        <main className="container mx-auto px-4 py-8 max-w-6xl">
          <Routes>
            <Route path="/" element={<ImageClassification />} />
            <Route path="/chat" element={<Chatbot />} />
          </Routes>
        </main>
        <footer className="bg-white shadow-inner mt-12 py-6">
          <div className="container mx-auto px-4 text-center">
            <p className="text-gray-600 text-sm">
              © {new Date().getFullYear()} EcoSort - AI Waste Classification. All rights reserved.
            </p>
            <div className="mt-2 flex justify-center space-x-4">
              <a href="#" className="text-gray-500 hover:text-green-600 transition-colors">Privacy Policy</a>
              <a href="#" className="text-gray-500 hover:text-green-600 transition-colors">Terms of Service</a>
              <a href="#" className="text-gray-500 hover:text-green-600 transition-colors">Contact</a>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App; 