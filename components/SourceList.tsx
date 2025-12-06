import React from 'react';
import { GroundingSource } from '../types';

interface SourceListProps {
  sources: GroundingSource[];
}

export const SourceList: React.FC<SourceListProps> = ({ sources }) => {
  if (!sources || sources.length === 0) return null;

  return (
    <div className="mt-3 pt-3 border-t border-slate-700">
      <p className="text-xs text-slate-400 font-semibold mb-2 uppercase tracking-wider">Verified Sources:</p>
      <ul className="flex flex-wrap gap-2">
        {sources.map((source, idx) => (
          <li key={idx}>
            <a
              href={source.uri}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1 bg-slate-800 hover:bg-slate-700 text-cyan-400 text-xs py-1 px-2 rounded transition-colors truncate max-w-[200px]"
              title={source.title}
            >
              <span className="truncate">{source.title}</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};
