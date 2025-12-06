import React, { useState } from 'react';
import { runFOMCAgent, runTickerAgent, runSynthesisAgent } from './services/geminiService';
import { AgentCard } from './components/AgentCard';
import { SynthesisReport } from './components/SynthesisReport';
import { ChatInterface } from './components/ChatInterface';
import { AgentStatus, AnalysisResult } from './types';

// Icons
const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const ChartIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
  </svg>
);

const GlobeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const BrainIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
  </svg>
);

const ChatIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
  </svg>
);

type Tab = 'analysis' | 'chat';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('analysis');
  const [ticker, setTicker] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // Agent States
  const [fomcStatus, setFomcStatus] = useState<AgentStatus>(AgentStatus.IDLE);
  const [tickerStatus, setTickerStatus] = useState<AgentStatus>(AgentStatus.IDLE);
  const [synthesisStatus, setSynthesisStatus] = useState<AgentStatus>(AgentStatus.IDLE);

  // Results
  const [results, setResults] = useState<AnalysisResult>({
    fomcData: null,
    tickerData: null,
    synthesis: null
  });

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticker.trim()) return;

    // Reset
    setIsAnalyzing(true);
    setFomcStatus(AgentStatus.WORKING);
    setTickerStatus(AgentStatus.WORKING);
    setSynthesisStatus(AgentStatus.IDLE);
    setResults({ fomcData: null, tickerData: null, synthesis: null });

    try {
      // Step 1: Run Research Agents in Parallel
      const [fomcResult, tickerResult] = await Promise.all([
        runFOMCAgent().catch(e => ({ rawText: "Error fetching FOMC data", sources: [] })),
        runTickerAgent(ticker).catch(e => ({ rawText: "Error fetching Ticker data", sources: [] }))
      ]);

      setResults(prev => ({ ...prev, fomcData: fomcResult, tickerData: tickerResult }));
      setFomcStatus(AgentStatus.COMPLETED);
      setTickerStatus(AgentStatus.COMPLETED);

      // Step 2: Run Synthesis Agent
      setSynthesisStatus(AgentStatus.WORKING);
      
      const finalReport = await runSynthesisAgent(
        ticker, 
        fomcResult.rawText, 
        tickerResult.rawText
      );

      setResults(prev => ({ ...prev, synthesis: finalReport }));
      setSynthesisStatus(AgentStatus.COMPLETED);

    } catch (error) {
      console.error("Workflow failed", error);
      // In a real app, handle specific error states per agent
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 pb-20 font-sans">
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-tr from-cyan-500 to-blue-600 h-8 w-8 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-500/20">
              G
            </div>
            <h1 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-100 to-slate-400">
              Gemini Financial Syndicate
            </h1>
          </div>
          <div className="text-xs text-slate-500 hidden sm:block">
            Powered by Google Gemini 2.5 Flash & 3.0 Pro
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Navigation Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-slate-900 p-1 rounded-xl border border-slate-800 inline-flex">
            <button
              onClick={() => setActiveTab('analysis')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === 'analysis'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ChartIcon />
              Ticker Analysis
            </button>
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === 'chat'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ChatIcon />
              Advisor Chat
            </button>
          </div>
        </div>

        {/* Tab Content: Analysis */}
        {activeTab === 'analysis' && (
          <div className="animate-fade-in">
            {/* Search Section */}
            <div className="max-w-2xl mx-auto mb-12">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-white mb-2">Market Intelligence Dashboard</h2>
                <p className="text-slate-400">Deploy autonomous agents to analyze risk and reward.</p>
              </div>

              <form onSubmit={handleAnalyze} className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg blur opacity-30 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative flex items-center bg-slate-900 rounded-lg border border-slate-700 p-1">
                  <div className="pl-4 text-slate-500">
                    <SearchIcon />
                  </div>
                  <input
                    type="text"
                    value={ticker}
                    onChange={(e) => setTicker(e.target.value.toUpperCase())}
                    placeholder="Enter Stock Ticker (e.g. AAPL, TSLA, NVDA)..."
                    className="block w-full bg-transparent border-none text-white placeholder-slate-500 focus:ring-0 text-lg py-3 px-4 uppercase tracking-wider font-semibold"
                    disabled={isAnalyzing}
                  />
                  <button
                    type="submit"
                    disabled={isAnalyzing || !ticker}
                    className={`mr-1 px-6 py-2.5 rounded-md font-medium text-sm transition-all duration-200 ${
                      isAnalyzing || !ticker
                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        : 'bg-cyan-500 hover:bg-cyan-400 text-white shadow-[0_0_15px_rgba(6,182,212,0.5)]'
                    }`}
                  >
                    {isAnalyzing ? 'Deploying...' : 'Initialize'}
                  </button>
                </div>
              </form>
            </div>

            {/* Agent Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <AgentCard
                name="FOMC Research"
                role="Macro Analysis"
                description="Scans Federal Reserve minutes and macroeconomic indicators (CPI, Rates) to determine broad market sentiment."
                status={fomcStatus}
                result={results.fomcData}
                icon={<GlobeIcon />}
              />

              <AgentCard
                name="Equity Analyst"
                role="Ticker Specific"
                description="Analyzes specific company performance, recent earnings reports, news cycles, and relative valuation."
                status={tickerStatus}
                result={results.tickerData}
                icon={<ChartIcon />}
              />

              <AgentCard
                name="Chief Strategist"
                role="Synthesis & Planning"
                description="Combines macro trends with company data to form a cohesive strategy with time-horizon recommendations."
                status={synthesisStatus}
                result={null} // Synthesis result is shown in the main report below
                icon={<BrainIcon />}
              />
            </div>

            {/* Synthesis Output */}
            {synthesisStatus === AgentStatus.WORKING && (
              <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-12 text-center">
                 <div className="inline-block relative w-16 h-16 mb-4">
                   <div className="absolute top-0 left-0 w-full h-full border-4 border-cyan-500/30 rounded-full"></div>
                   <div className="absolute top-0 left-0 w-full h-full border-4 border-t-cyan-500 rounded-full animate-spin"></div>
                 </div>
                 <h3 className="text-xl font-medium text-white mb-2">Synthesizing Strategy</h3>
                 <p className="text-slate-400 text-sm max-w-md mx-auto">
                   The Chief Strategist (Gemini 3 Pro) is thinking... This involves deep reasoning across macro and micro economic factors.
                 </p>
              </div>
            )}

            {synthesisStatus === AgentStatus.COMPLETED && results.synthesis && (
              <div className="animate-fade-in-up">
                <SynthesisReport content={results.synthesis} />
              </div>
            )}
          </div>
        )}

        {/* Tab Content: Chat */}
        {activeTab === 'chat' && (
          <div className="max-w-4xl mx-auto animate-fade-in">
             <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-white mb-2">Financial Advisor Chat</h2>
                <p className="text-slate-400">Discuss your personal financial goals and get tailored recommendations.</p>
              </div>
            <ChatInterface />
          </div>
        )}
      </main>
    </div>
  );
}
