import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { 
  PaperAirplaneIcon, 
  ChatBubbleLeftRightIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { 
  UserCircleIcon, 
  ChatBubbleLeftEllipsisIcon 
} from '@heroicons/react/24/solid';

interface Message {
  content: string;
  isUser: boolean;
}

const Chatbot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      content: "Hello! I'm your waste management assistant. How can I help you today? You can ask me about recycling, composting, hazardous waste disposal, or eco-friendly alternatives.",
      isUser: false,
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setLoading(true);

    // Add user message to chat
    setMessages((prev) => [...prev, { content: userMessage, isUser: true }]);

    try {
      const response = await axios.post('http://localhost:8000/api/chat', {
        query: userMessage,
      });

      // Add bot response to chat
      setMessages((prev) => [
        ...prev,
        { content: response.data.response, isUser: false },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          content: 'Sorry, I encountered an error. Please try again.',
          isUser: false,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const suggestedQuestions = [
    "How do I recycle plastic bottles?",
    "What items are considered hazardous waste?",
    "Can I compost coffee grounds?",
    "How to dispose of electronic waste?"
  ];

  return (
    <div className="max-w-5xl mx-auto">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold mb-2 text-gray-800">Waste Management Assistant</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Ask questions about waste disposal, recycling methods, composting, or eco-friendly alternatives.
        </p>
      </div>
      
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center">
          <ChatBubbleLeftRightIcon className="h-5 w-5 mr-2 text-green-600" />
          <h2 className="text-xl font-semibold text-gray-800">EcoChat</h2>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 h-[500px] space-y-6">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
            >
              <div className="flex items-start max-w-[80%]">
                {!message.isUser && (
                  <div className="flex-shrink-0 mr-3">
                    <div className="bg-green-100 rounded-full p-2">
                      <ChatBubbleLeftEllipsisIcon className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                )}
                
                <div
                  className={`rounded-2xl px-4 py-3 ${
                    message.isUser
                      ? 'bg-gradient-to-r from-green-600 to-green-500 text-white'
                      : 'bg-gray-100 text-gray-800 border border-gray-200'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                </div>
                
                {message.isUser && (
                  <div className="flex-shrink-0 ml-3">
                    <div className="bg-gray-200 rounded-full p-2">
                      <UserCircleIcon className="h-6 w-6 text-gray-600" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
          
          {messages.length === 1 && (
            <div className="mt-8 bg-gray-50 rounded-xl p-4 border border-gray-200">
              <div className="flex items-center mb-3">
                <InformationCircleIcon className="h-5 w-5 text-gray-500 mr-2" />
                <h3 className="font-medium text-gray-700">Suggested Questions</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {suggestedQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setInput(question);
                    }}
                    className="text-left px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg hover:bg-green-50 hover:border-green-300 transition-colors text-gray-700"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="p-4 border-t border-gray-100 bg-gray-50">
          <div className="flex space-x-4">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about waste disposal..."
              className="flex-1 rounded-full border border-gray-300 px-5 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-green-600 to-green-500 text-white rounded-full p-3 hover:shadow-md transition-all disabled:opacity-50 flex items-center justify-center w-12 h-12"
            >
              {loading ? (
                <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <PaperAirplaneIcon className="h-5 w-5" />
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Chatbot; 