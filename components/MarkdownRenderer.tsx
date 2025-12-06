import React from 'react';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = "" }) => {
  const renderContent = (text: string) => {
    return text.split('\n').map((line, i) => {
      // Headers
      if (line.startsWith('###')) {
        return <h3 key={i} className="text-lg font-bold text-cyan-400 mt-4 mb-2">{line.replace(/###/g, '')}</h3>;
      }
      if (line.startsWith('##')) {
        return <h2 key={i} className="text-xl font-bold text-white mt-6 mb-3 border-b border-slate-700 pb-2">{line.replace(/##/g, '')}</h2>;
      }
      
      // Bold text (simple implementation for **text**)
      if (line.includes('**')) {
        const parts = line.split('**');
        return (
          <p key={i} className="text-slate-300 text-sm leading-relaxed mb-2">
            {parts.map((part, index) => 
              index % 2 === 1 ? <strong key={index} className="text-slate-200 font-bold">{part}</strong> : part
            )}
          </p>
        );
      }

      // List items
      if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        return (
            <div key={i} className="flex items-start mb-2 ml-4">
                <span className="text-cyan-500 mr-2 mt-1">•</span>
                <span className="text-slate-300 text-sm leading-relaxed">{line.replace(/^[-*]\s/, '')}</span>
            </div>
        )
      }

      // Numbered lists
      if (/^\d+\./.test(line.trim())) {
         return (
            <div key={i} className="flex items-start mb-2 ml-4">
                <span className="text-cyan-500 mr-2 font-mono text-xs mt-0.5">{line.match(/^\d+\./)?.[0]}</span>
                <span className="text-slate-300 text-sm leading-relaxed">{line.replace(/^\d+\.\s/, '')}</span>
            </div>
         );
      }

      // Empty lines
      if (line.trim() === '') return <div key={i} className="h-2"></div>;
      
      // Default paragraph
      return <p key={i} className="text-slate-300 text-sm leading-relaxed mb-2">{line}</p>;
    });
  };

  return <div className={className}>{renderContent(content)}</div>;
};
