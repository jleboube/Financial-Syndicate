import React from 'react';

export enum AgentStatus {
  IDLE = 'IDLE',
  WORKING = 'WORKING',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR'
}

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface AgentResponse {
  rawText: string;
  sources: GroundingSource[];
}

export interface AnalysisResult {
  fomcData: AgentResponse | null;
  tickerData: AgentResponse | null;
  synthesis: string | null;
}

export interface AgentCardProps {
  name: string;
  role: string;
  description: string;
  status: AgentStatus;
  result: AgentResponse | null;
  icon: React.ReactNode;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  sources?: GroundingSource[];
  timestamp: Date;
  isError?: boolean;
}
