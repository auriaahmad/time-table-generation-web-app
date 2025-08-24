'use client';

import { useState, useRef, useEffect } from 'react';

export default function AIAgent({ timetableData }) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'ai',
      content: 'Hello! I\'m your AI assistant for timetable analysis and optimization. I can help you with conflict resolution, resource optimization, and schedule improvements. What would you like to analyze?',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Check Ollama connection on component mount
  useEffect(() => {
    checkOllamaConnection();
  }, []);

  const checkOllamaConnection = async () => {
    try {
      const response = await fetch('http://localhost:11434/api/tags');
      if (response.ok) {
        setIsConnected(true);
      }
    } catch (error) {
      console.log('Ollama not connected:', error);
      setIsConnected(false);
    }
  };

  const createTimetablePrompt = (userMessage, timetableData) => {
    return `You are an expert timetable management assistant. Analyze the provided timetable data and help with optimization.

CURRENT TIMETABLE CONTEXT:
${timetableData ? JSON.stringify(timetableData, null, 2) : 'No timetable data provided'}

YOUR CAPABILITIES:
- Detect scheduling conflicts and suggest resolutions
- Analyze resource utilization (teachers, rooms)
- Suggest schedule optimizations
- Identify constraint violations
- Provide workload balancing recommendations

USER QUESTION: ${userMessage}

Please provide a helpful, specific response with actionable suggestions. Keep your response concise and focused.

ASSISTANT:`;
  };

  const callOllamaAPI = async (prompt) => {
    try {
      const response = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama2', // Change this to your specific model name if different
          prompt: prompt,
          stream: false,
          options: {
            temperature: 0.7,
            top_p: 0.9,
            max_tokens: 500
          }
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.response;
    } catch (error) {
      console.error('Error calling Ollama:', error);
      throw error;
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const newMessage = {
      id: messages.length + 1,
      type: 'human',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newMessage]);
    const currentInput = inputMessage;
    setInputMessage('');
    setIsTyping(true);

    try {
      if (!isConnected) {
        // Fallback response if Ollama is not connected
        setTimeout(() => {
          const fallbackResponse = {
            id: messages.length + 2,
            type: 'ai',
            content: 'I\'m currently not connected to the local AI model. Please ensure Ollama is running on localhost:11434 and try again. You can start it with: `ollama serve`',
            timestamp: new Date()
          };
          setMessages(prev => [...prev, fallbackResponse]);
          setIsTyping(false);
        }, 1000);
        return;
      }

      // Create context-aware prompt
      const prompt = createTimetablePrompt(currentInput, timetableData);
      
      // Call Ollama API
      const aiResponse = await callOllamaAPI(prompt);
      
      const responseMessage = {
        id: messages.length + 2,
        type: 'ai',
        content: aiResponse,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, responseMessage]);
      
    } catch (error) {
      console.error('Error getting AI response:', error);
      
      const errorMessage = {
        id: messages.length + 2,
        type: 'ai',
        content: 'Sorry, I encountered an error while processing your request. Please check if Ollama is running and the model is available.',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
      setIsConnected(false);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleQuickAction = (message) => {
    setInputMessage(message);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-50 via-blue-50 to-indigo-50 rounded-2xl opacity-70"></div>
        <div className="absolute -top-8 -left-8 w-24 h-24 bg-purple-200 rounded-full opacity-30 animate-pulse"></div>
        <div className="absolute -top-4 -right-8 w-20 h-20 bg-blue-200 rounded-full opacity-30 animate-pulse delay-100"></div>
        <div className="absolute -bottom-4 left-1/3 w-16 h-16 bg-indigo-200 rounded-full opacity-30 animate-pulse delay-200"></div>
        
        {/* Content */}
        <div className="relative z-10 py-12 px-6">
          <div className="mb-4">
            <span className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 text-sm font-semibold rounded-full mb-4">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
              </svg>
              <span>Local AI Assistant</span>
            </span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
            <span className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
              AI Timetable Agent
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Powered by local Llama 2 for 
            <span className="font-semibold text-gray-800"> intelligent timetable analysis</span>
          </p>
          
          <div className="mt-6 flex justify-center space-x-4 text-sm">
            <div className="flex items-center space-x-2 bg-white bg-opacity-80 px-3 py-2 rounded-full shadow-sm">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
              <span className="text-gray-700 font-medium">
                {isConnected ? 'Connected to Ollama' : 'Ollama Disconnected'}
              </span>
            </div>
            <div className="flex items-center space-x-2 bg-white bg-opacity-80 px-3 py-2 rounded-full shadow-sm">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-gray-700 font-medium">Llama 2</span>
            </div>
          </div>

          {!isConnected && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg max-w-md mx-auto">
              <p className="text-yellow-800 text-sm">
                <strong>Note:</strong> Start Ollama with <code className="bg-yellow-100 px-1 rounded">ollama serve</code>
              </p>
            </div>
          )}
        </div>
      </div>
      
      <div className="bg-white shadow-xl rounded-lg overflow-hidden">
        {/* Chat Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></div>
              <h2 className="text-white font-semibold text-lg">Timetable AI Assistant</h2>
              <span className="text-blue-100 text-sm">
                {isConnected ? 'Online' : 'Offline'}
              </span>
            </div>
            <button 
              onClick={checkOllamaConnection}
              className="text-blue-100 hover:text-white text-sm underline"
            >
              Reconnect
            </button>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="h-96 overflow-y-auto p-4 space-y-4 bg-gray-50">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'human' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex max-w-xs lg:max-w-md ${message.type === 'human' ? 'flex-row-reverse' : 'flex-row'}`}>
                {/* Avatar */}
                <div className={`flex-shrink-0 ${message.type === 'human' ? 'ml-3' : 'mr-3'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    message.type === 'human' 
                      ? 'bg-blue-500' 
                      : 'bg-gradient-to-r from-purple-500 to-blue-500'
                  }`}>
                    {message.type === 'human' ? (
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </div>

                {/* Message Bubble */}
                <div className={`px-4 py-2 rounded-lg ${
                  message.type === 'human'
                    ? 'bg-blue-600 text-white rounded-br-sm'
                    : 'bg-white text-gray-800 shadow-md rounded-bl-sm border'
                }`}>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                  <p className={`text-xs mt-1 ${
                    message.type === 'human' ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex justify-start">
              <div className="flex max-w-xs lg:max-w-md">
                <div className="flex-shrink-0 mr-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <div className="bg-white text-gray-800 shadow-md rounded-lg rounded-bl-sm border px-4 py-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="border-t bg-white p-4">
          <div className="flex space-x-3">
            <div className="flex-1 relative">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about your timetable, conflicts, or optimizations..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
                rows="1"
                style={{ maxHeight: '120px' }}
              />
            </div>
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isTyping}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center space-x-2"
            >
              <span className="text-sm font-medium">Send</span>
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
              </svg>
            </button>
          </div>
          
          {/* Quick Actions */}
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              onClick={() => handleQuickAction('Analyze my current timetable for conflicts and issues')}
              className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
            >
              Analyze conflicts
            </button>
            <button
              onClick={() => handleQuickAction('How can I optimize teacher workload distribution?')}
              className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
            >
              Optimize workload
            </button>
            <button
              onClick={() => handleQuickAction('Check room utilization and suggest improvements')}
              className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
            >
              Room optimization
            </button>
            <button
              onClick={() => handleQuickAction('What scheduling improvements do you recommend?')}
              className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
            >
              General suggestions
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}