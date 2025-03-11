import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CameraIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';
import { TrashIcon } from '@heroicons/react/24/solid';

const Navbar = () => {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path ? 'bg-green-700' : '';
  };

  return (
    <nav className="bg-gradient-to-r from-green-600 to-green-500 shadow-lg">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center group">
              <div className="bg-white p-2 rounded-full mr-2 shadow-md group-hover:shadow-lg transition-all">
                <TrashIcon className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <span className="text-white text-xl font-bold tracking-tight">EcoSort</span>
                <span className="hidden sm:inline-block text-green-200 text-xs ml-2 font-medium">AI Waste Classification</span>
              </div>
            </Link>
          </div>

          <div className="flex space-x-2">
            <Link
              to="/"
              className={`flex items-center px-4 py-2 rounded-md text-sm font-medium text-white hover:bg-green-700 transition-all ${isActive(
                '/'
              )} hover:shadow-md`}
            >
              <CameraIcon className="h-5 w-5 mr-2" />
              <span>Classify</span>
            </Link>
            <Link
              to="/chat"
              className={`flex items-center px-4 py-2 rounded-md text-sm font-medium text-white hover:bg-green-700 transition-all ${isActive(
                '/chat'
              )} hover:shadow-md`}
            >
              <ChatBubbleLeftRightIcon className="h-5 w-5 mr-2" />
              <span>Chat</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 