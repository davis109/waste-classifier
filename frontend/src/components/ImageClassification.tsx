import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import { 
  ArrowUpTrayIcon, 
  CheckCircleIcon,
  InformationCircleIcon,
  ArrowPathIcon,
  CameraIcon
} from '@heroicons/react/24/outline';
import { 
  TrashIcon, 
  ArrowUturnLeftIcon,
  CheckBadgeIcon
} from '@heroicons/react/24/solid';

interface ClassificationResult {
  category: string;
  confidence: number;
  recommendations: string[];
}

const ImageClassification: React.FC = () => {
  const [result, setResult] = useState<ClassificationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    // Create preview
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post('http://localhost:8000/api/classify', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setResult(response.data);
    } catch (err) {
      setError('Failed to classify image. Please try again.');
      console.error('Classification error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp'],
    },
    multiple: false,
  });

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'recyclable':
        return {
          text: 'text-blue-600',
          bg: 'bg-blue-600',
          bgLight: 'bg-blue-50',
          border: 'border-blue-200',
          icon: <TrashIcon className="h-8 w-8 text-blue-500" />
        };
      case 'organic':
        return {
          text: 'text-green-600',
          bg: 'bg-green-600',
          bgLight: 'bg-green-50',
          border: 'border-green-200',
          icon: <TrashIcon className="h-8 w-8 text-green-500" />
        };
      case 'hazardous':
        return {
          text: 'text-red-600',
          bg: 'bg-red-600',
          bgLight: 'bg-red-50',
          border: 'border-red-200',
          icon: <TrashIcon className="h-8 w-8 text-red-500" />
        };
      default:
        return {
          text: 'text-gray-600',
          bg: 'bg-gray-600',
          bgLight: 'bg-gray-50',
          border: 'border-gray-200',
          icon: <TrashIcon className="h-8 w-8 text-gray-500" />
        };
    }
  };

  const resetClassification = () => {
    setPreview(null);
    setResult(null);
    setError(null);
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold mb-2 text-gray-800">AI Waste Classification</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Upload an image of waste and our AI will classify it as recyclable, organic, or hazardous, 
          and provide disposal recommendations.
        </p>
      </div>
      
      {!preview && (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center">
              <CameraIcon className="h-5 w-5 mr-2 text-green-600" />
              Upload Waste Image
            </h2>
          </div>
          <div className="p-8">
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all
                ${isDragActive 
                  ? 'border-green-500 bg-green-50 shadow-inner' 
                  : 'border-gray-300 hover:border-green-500 hover:bg-gray-50'}`}
            >
              <input {...getInputProps()} />
              <ArrowUpTrayIcon className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              {isDragActive ? (
                <p className="text-lg font-medium text-green-600">Drop the image here...</p>
              ) : (
                <>
                  <p className="text-lg font-medium text-gray-700 mb-2">
                    Drag and drop an image here, or click to select
                  </p>
                  <p className="text-sm text-gray-500">
                    Supports JPG, PNG and WebP formats
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div className="mt-8 text-center p-12 bg-white rounded-xl shadow-lg">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-green-600 mx-auto"></div>
          <p className="mt-6 text-gray-600 font-medium">Analyzing your waste image...</p>
          <p className="text-sm text-gray-500 mt-2">This may take a few seconds</p>
        </div>
      )}

      {error && (
        <div className="mt-8 p-6 bg-red-50 rounded-xl border border-red-200 shadow-lg">
          <div className="flex items-center mb-4">
            <InformationCircleIcon className="h-6 w-6 text-red-500 mr-2" />
            <h3 className="text-lg font-medium text-red-800">Classification Error</h3>
          </div>
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={resetClassification}
            className="px-4 py-2 bg-white text-red-600 rounded-lg border border-red-300 hover:bg-red-50 transition-colors flex items-center text-sm font-medium"
          >
            <ArrowUturnLeftIcon className="h-4 w-4 mr-2" />
            Try Again
          </button>
        </div>
      )}

      {preview && !loading && !error && (
        <div className="mt-8 bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center">
              <CheckBadgeIcon className="h-5 w-5 mr-2 text-green-600" />
              Classification Results
            </h2>
            <button 
              onClick={resetClassification}
              className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors flex items-center"
            >
              <ArrowPathIcon className="h-4 w-4 mr-1" />
              New Image
            </button>
          </div>
          
          <div className="p-6">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="md:w-1/3">
                <div className="rounded-lg overflow-hidden shadow-md border border-gray-200">
                  <img
                    src={preview}
                    alt="Waste Preview"
                    className="w-full h-auto object-cover"
                  />
                </div>
              </div>
              
              {result && (
                <div className="md:w-2/3">
                  <div className={`rounded-xl p-6 ${getCategoryColor(result.category).bgLight} ${getCategoryColor(result.category).border} border`}>
                    <div className="flex items-center mb-6">
                      {getCategoryColor(result.category).icon}
                      <div className="ml-4">
                        <h3 className={`text-2xl font-bold ${getCategoryColor(result.category).text}`}>
                          {result.category.charAt(0).toUpperCase() + result.category.slice(1)}
                        </h3>
                        <div className="flex items-center mt-1">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div
                              className={`${getCategoryColor(result.category).bg} h-2 rounded-full`}
                              style={{ width: `${result.confidence * 100}%` }}
                            ></div>
                          </div>
                          <p className="text-sm text-gray-600 ml-2">
                            {Math.round(result.confidence * 100)}% confidence
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <h4 className="font-medium text-gray-800 mb-3 flex items-center">
                        <InformationCircleIcon className="h-5 w-5 mr-2 text-gray-500" />
                        Disposal Recommendations
                      </h4>
                      <ul className="space-y-2">
                        {result.recommendations.map((rec, index) => (
                          <li key={index} className="flex items-start">
                            <CheckCircleIcon className={`h-5 w-5 mr-2 mt-0.5 ${getCategoryColor(result.category).text}`} />
                            <span className="text-gray-700">{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageClassification; 