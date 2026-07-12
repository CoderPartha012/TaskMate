export interface AISimulationInput {
  model: string;
  prompt: string;
  outputType: string;
  confidenceThreshold?: number;
}

export interface AISimulationResult {
  success: boolean;
  confidence: number;
  result: string;
  logLines: string[];
  tokenUsage: number;
}

export function simulateAIExecution(input: AISimulationInput): AISimulationResult {
  const threshold = input.confidenceThreshold ?? 70;
  const confidence = Math.round(40 + Math.random() * 60);
  const success = confidence >= threshold;
  const time = new Date().toLocaleTimeString();

  const logLines = [
    `[${time}] Model "${input.model || 'default'}" processing prompt…`,
    `[${time}] Confidence score: ${confidence}%`,
    success
      ? `[${time}] Execution completed successfully.`
      : `[${time}] Execution failed — confidence below threshold (${threshold}%).`,
  ];

  const result = success
    ? `Simulated ${input.outputType || 'text'} output for: "${input.prompt.slice(0, 80)}${input.prompt.length > 80 ? '…' : ''}"`
    : '';

  const tokenUsage = Math.round(input.prompt.length * 1.3 + Math.random() * 200 + 50);

  return { success, confidence, result, logLines, tokenUsage };
}
