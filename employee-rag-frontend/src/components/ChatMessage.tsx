// import React from 'react';
// import ReactMarkdown from 'react-markdown';
// import type { Message } from '../types';

// interface ChatMessageProps {
//   message: Message;
// }

// export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
//   return (
//     <div className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} animate-slide-up`}>
//       <div className={`message-bubble ${message.type === 'user' ? 'user-message' : 'bot-message'}`}>
//         <div className="prose prose-sm max-w-none">
//           <ReactMarkdown>
//             {message.content}
//           </ReactMarkdown>
//         </div>

//         {message.relevantEmployees && message.relevantEmployees.length > 0 && (
//           <div className="mt-3 pt-3 border-t border-gray-200">
//             <p className="text-xs font-semibold text-gray-500 mb-2">📋 Relevant Employees:</p>
//             <div className="space-y-1">
//               {message.relevantEmployees.map((emp, idx) => (
//                 <div key={idx} className="text-sm">
//                   <span className="font-medium">{emp.name}</span>
//                   <span className="text-gray-500 text-xs ml-2">({emp.position})</span>
//                 </div>
//               ))}
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };



import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Sparkles, User } from 'lucide-react';
import type { Message } from '../types';

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isBot = message.type === 'bot';

  return (
    <div className={`chat-msg ${isBot ? 'chat-msg-bot' : 'chat-msg-user'}`}>
      {isBot && (
        <div className="msg-avatar bot-avatar">
          <Sparkles size={13} />
        </div>
      )}

      <div className={`msg-bubble ${isBot ? 'bubble-bot' : 'bubble-user'}`}>
        <div className={`msg-content ${isBot ? 'bot-content' : 'user-content'}`}>
          <ReactMarkdown
            components={{
              p: ({ children }) => <p className="md-p">{children}</p>,
              strong: ({ children }) => <strong className="md-strong">{children}</strong>,
              ul: ({ children }) => <ul className="md-ul">{children}</ul>,
              ol: ({ children }) => <ol className="md-ol">{children}</ol>,
              li: ({ children }) => <li className="md-li">{children}</li>,
              h1: ({ children }) => <h1 className="md-h1">{children}</h1>,
              h2: ({ children }) => <h2 className="md-h2">{children}</h2>,
              h3: ({ children }) => <h3 className="md-h3">{children}</h3>,
              code: ({ children }) => <code className="md-code">{children}</code>,
              hr: () => <hr className="md-hr" />,
            }}
          >
            {message.content}
          </ReactMarkdown>
        </div>

        {message.relevantEmployees && message.relevantEmployees.length > 0 && (
          <div className="relevant-employees">
            <p className="relevant-title">
              <span className="relevant-dot" />
              Referenced Employees
            </p>
            <div className="relevant-list">
              {message.relevantEmployees.map((emp, idx) => (
                <div key={idx} className="relevant-emp">
                  <div className="relevant-emp-avatar">
                    {emp.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div>
                    <p className="relevant-emp-name">{emp.name}</p>
                    <p className="relevant-emp-role">{emp.position} · {emp.department}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {!isBot && (
        <div className="msg-avatar user-avatar">
          <User size={13} />
        </div>
      )}
    </div>
  );
};