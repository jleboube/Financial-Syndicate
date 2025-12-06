import React, { useState } from 'react';
import { AgentStatus, AgentCardProps } from '../types';
import { SourceList } from './SourceList';

export const AgentCard: React.FC<AgentCardProps> = ({ name, role, description, status, result, icon }) => {
  const [expanded, setExpanded] = useState(false);

  const getStatusColor = () => {
    switch (status) {
      case AgentStatus.WORKING: return 'border-amber-500/50 bg-amber-900/10';
      case AgentStatus.COMPLETED: return 'border-emerald-500/50 bg-emerald-900/10';
      case AgentStatus.ERROR: return 'border-red-500/50 bg-red-900/10';
      default: return 'border-slate-700 bg-slate-800/50';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case AgentStatus.WORKING:
        return (
          <span className="flex h-3 w-3 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
          </span>
        );
      case AgentStatus.COMPLETED:
        return <div className="h-3 w-3 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>;
      case AgentStatus.ERROR:
        return <div className="h-3 w-3 rounded-full bg-red-500"></div>;
      default:
        return <div className="h-3 w-3 rounded-full bg-slate-600"></div>;
    }
  };

  return (
    <div className={`border rounded-lg p-5 transition-all duration-300 ${getStatusColor()} flex flex-col h-full`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-800 rounded-md text-cyan-400 border border-slate-700">
            {icon}
          </div>
          <div>
            <h3 className="font-bold text-slate-100">{name}</h3>
            <p className="text-xs text-slate-400 uppercase tracking-wide">{role}</p>
          </div>
        </div>
        {getStatusIcon()}
      </div>
      
      <p className="text-sm text-slate-400 mb-4 flex-grow">{description}</p>

      {status === AgentStatus.WORKING && (
        <div className="mt-auto">
          <div className="text-xs text-amber-400 font-mono animate-pulse">
            &gt; Gathering Intelligence...
          </div>
        </div>
      )}

      {status === AgentStatus.COMPLETED && result && (
        <div className="mt-auto pt-4 border-t border-slate-700/50">
           <div className={`prose prose-invert prose-sm max-w-none ${expanded ? '' : 'line-clamp-4'}`}>
             <div className="whitespace-pre-wrap text-slate-300 text-sm font-light">
               {result.rawText}
             </div>
           </div>
           
           <button 
             onClick={() => setExpanded(!expanded)}
             className="text-xs text-cyan-400 mt-2 hover:text-cyan-300 underline underline-offset-2"
           >
             {expanded ? 'Show Less' : 'Read Analysis'}
           </button>
           
           {/* Grounding Sources */}
           {expanded && <SourceList sources={result.sources} />}
        </div>
      )}
    </div>
  );
};
