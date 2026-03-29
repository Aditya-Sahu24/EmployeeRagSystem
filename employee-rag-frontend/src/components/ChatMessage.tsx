import React from 'react';
import ReactMarkdown from 'react-markdown';
import type { Message } from '../types';

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  return (
    <div className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} animate-slide-up`}>
      <div className={`message-bubble ${message.type === 'user' ? 'user-message' : 'bot-message'}`}>
        <div className="prose prose-sm max-w-none">
          <ReactMarkdown>
            {message.content}
          </ReactMarkdown>
        </div>

        {message.relevantEmployees && message.relevantEmployees.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <p className="text-xs font-semibold text-gray-500 mb-2">📋 Relevant Employees:</p>
            <div className="space-y-1">
              {message.relevantEmployees.map((emp, idx) => (
                <div key={idx} className="text-sm">
                  <span className="font-medium">{emp.name}</span>
                  <span className="text-gray-500 text-xs ml-2">({emp.position})</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};