import React, { useEffect, useState } from 'react';
import { Play } from 'lucide-react';
import { simulateAIExecution } from '../../utils/aiSimulation';

const inputBase =
  'w-full rounded-lg bg-noir-600 text-white/80 text-sm px-3 py-2 focus:outline-none border border-white/[0.08] focus:border-jade transition-colors';
const labelClass = 'text-[10px] font-semibold uppercase tracking-widest text-white/30 block mb-1';

const MODELS = ['GPT-4o', 'Claude', 'Gemini', 'Mistral', 'Llama', 'DeepSeek', 'Custom API'];
const RETRY_POLICIES = ['None', 'Retry Once', 'Retry 3x', 'Exponential Backoff'];

interface PlaygroundResult {
  success: boolean;
  output: string;
  logs: string[];
}

interface AIPlaygroundTabProps {
  initialPrompt?: string;
}

export function AIPlaygroundTab({ initialPrompt }: AIPlaygroundTabProps) {
  const [prompt, setPrompt] = useState(initialPrompt ?? '');
  const [model, setModel] = useState(MODELS[0]);
  const [temperature, setTemperature] = useState(0.7);
  const [retryPolicy, setRetryPolicy] = useState(RETRY_POLICIES[0]);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<PlaygroundResult | null>(null);

  useEffect(() => {
    if (initialPrompt) setPrompt(initialPrompt);
  }, [initialPrompt]);

  const handleRun = () => {
    if (!prompt.trim() || running) return;
    setRunning(true);
    setResult(null);
    setTimeout(() => {
      const sim = simulateAIExecution({ model, prompt, outputType: 'Text', confidenceThreshold: 70 });
      setResult({ success: sim.success, output: sim.result, logs: sim.logLines });
      setRunning(false);
    }, 1200);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="space-y-4">
        <div>
          <label className={labelClass} htmlFor="playground-prompt">Prompt</label>
          <textarea
            id="playground-prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={6}
            placeholder="Test a prompt without attaching it to a task…"
            className={`${inputBase} resize-none`}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass} htmlFor="playground-model">Model</label>
            <select id="playground-model" value={model} onChange={(e) => setModel(e.target.value)} className={inputBase}>
              {MODELS.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass} htmlFor="playground-retry">Retry Policy</label>
            <select id="playground-retry" value={retryPolicy} onChange={(e) => setRetryPolicy(e.target.value)} className={inputBase}>
              {RETRY_POLICIES.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <span className={labelClass}>Temperature</span>
            <span className="text-xs font-bold text-jade">{temperature.toFixed(1)}</span>
          </div>
          <input
            type="range"
            min={0}
            max={2}
            step={0.1}
            value={temperature}
            onChange={(e) => setTemperature(Number(e.target.value))}
            className="w-full accent-jade"
            aria-label="Temperature"
          />
        </div>

        <button
          type="button"
          onClick={handleRun}
          disabled={!prompt.trim() || running}
          className="flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-lg bg-jade hover:bg-jade-dark text-noir-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <Play className="w-3.5 h-3.5" />
          {running ? 'Running…' : 'Run'}
        </button>
      </div>

      <div>
        <span className={labelClass}>Output</span>
        <div className="mt-1 bg-black/60 border border-white/[0.08] rounded-lg p-3 font-mono text-[11px] min-h-[220px] space-y-1">
          {running && <p className="text-white/40">Running simulation…</p>}
          {!running && !result && <p className="text-white/25">Run a prompt to see simulated output here.</p>}
          {result && (
            <>
              {result.logs.map((line, i) => <p key={`log-${i}`} className="text-jade/80">{line}</p>)}
              <p className={`mt-2 whitespace-pre-wrap break-words ${result.success ? 'text-white/85' : 'text-red-400'}`}>
                {result.output || '(No output — execution failed)'}
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
