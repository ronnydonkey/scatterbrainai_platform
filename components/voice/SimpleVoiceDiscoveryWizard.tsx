'use client'

import React, { useState } from 'react';
import { ChevronRight, ChevronLeft, Sparkles, CheckCircle } from 'lucide-react';
import { VoiceDiscoveryQuestion, VoiceDiscoveryResponse } from '@/lib/onboarding/voice-discovery';

interface VoiceDiscoveryWizardProps {
  onComplete: (responses: VoiceDiscoveryResponse[]) => void;
  onSkip?: () => void;
}

export function SimpleVoiceDiscoveryWizard({ onComplete, onSkip }: VoiceDiscoveryWizardProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<VoiceDiscoveryResponse[]>([]);
  const [questions, setQuestions] = useState<VoiceDiscoveryQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [textInput, setTextInput] = useState('');

  // Fetch questions on mount
  React.useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const response = await fetch('/api/voice-discovery');
      const data = await response.json();
      setQuestions(data.questions);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching questions:', error);
      setLoading(false);
    }
  };

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  const handleNext = () => {
    if (!currentQuestion) return;

    // Create response based on question type
    let answer: any;
    if (currentQuestion.type === 'multiple_choice') {
      answer = parseInt(selectedOptions[0]); // Index of selected option
    } else if (currentQuestion.type === 'multi_select') {
      answer = selectedOptions;
    } else if (currentQuestion.type === 'text') {
      answer = textInput;
    }

    // Save response
    const newResponse: VoiceDiscoveryResponse = {
      questionId: currentQuestion.id,
      answer,
      timestamp: new Date()
    };

    const updatedResponses = [...responses, newResponse];
    setResponses(updatedResponses);

    // Reset input state
    setSelectedOptions([]);
    setTextInput('');

    // Move to next question or complete
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      onComplete(updatedResponses);
    }
  };

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      // Remove the last response
      setResponses(responses.slice(0, -1));
    }
  };

  const handleOptionSelect = (option: string, index: number) => {
    if (currentQuestion?.type === 'multiple_choice') {
      setSelectedOptions([index.toString()]);
    } else if (currentQuestion?.type === 'multi_select') {
      const optionStr = option;
      if (selectedOptions.includes(optionStr)) {
        setSelectedOptions(selectedOptions.filter(o => o !== optionStr));
      } else {
        setSelectedOptions([...selectedOptions, optionStr]);
      }
    }
  };

  const canProceed = () => {
    if (!currentQuestion) return false;
    
    if (currentQuestion.type === 'multiple_choice') {
      return selectedOptions.length === 1;
    } else if (currentQuestion.type === 'multi_select') {
      return selectedOptions.length > 0;
    } else if (currentQuestion.type === 'text') {
      return textInput.trim().length > 0;
    }
    
    return false;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!currentQuestion) {
    return null;
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-blue-600" />
            Discover Your Voice
          </h2>
          {onSkip && (
            <button
              onClick={onSkip}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Skip for now
            </button>
          )}
        </div>
        
        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-sm text-gray-600 mt-2">
          Question {currentQuestionIndex + 1} of {questions.length}
        </p>
      </div>

      {/* Question */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          {currentQuestion.question}
        </h3>
        {currentQuestion.context && (
          <p className="text-sm text-gray-600 mb-6">
            {currentQuestion.context}
          </p>
        )}

        {/* Answer Input */}
        {currentQuestion.type === 'multiple_choice' && currentQuestion.options && (
          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleOptionSelect(option, index)}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                  selectedOptions.includes(index.toString())
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-gray-900">{option}</span>
                  {selectedOptions.includes(index.toString()) && (
                    <CheckCircle className="w-5 h-5 text-blue-600" />
                  )}
                </div>
              </button>
            ))}
          </div>
        )}

        {currentQuestion.type === 'multi_select' && currentQuestion.options && (
          <div className="space-y-2">
            {currentQuestion.options.map((option, index) => (
              <label
                key={index}
                className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all ${
                  selectedOptions.includes(option)
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedOptions.includes(option)}
                  onChange={() => handleOptionSelect(option, index)}
                  className="sr-only"
                />
                <div className="flex items-center justify-between w-full">
                  <span className="text-gray-900">{option}</span>
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                    selectedOptions.includes(option)
                      ? 'border-blue-600 bg-blue-600'
                      : 'border-gray-300'
                  }`}>
                    {selectedOptions.includes(option) && (
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </div>
              </label>
            ))}
          </div>
        )}

        {currentQuestion.type === 'text' && (
          <textarea
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder="Share your thoughts..."
            className="w-full p-4 border-2 border-gray-200 rounded-lg focus:border-blue-600 focus:outline-none resize-none"
            rows={4}
          />
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={handleBack}
          disabled={currentQuestionIndex === 0}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
            currentQuestionIndex === 0
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>

        <button
          onClick={handleNext}
          disabled={!canProceed()}
          className={`flex items-center gap-2 px-6 py-2 rounded-lg font-medium ${
            canProceed()
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          {currentQuestionIndex === questions.length - 1 ? 'Complete' : 'Next'}
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}