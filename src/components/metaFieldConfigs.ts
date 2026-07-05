export interface MetaFieldConfig {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'date' | 'number' | 'select';
  options?: string[];
  placeholder?: string;
  required?: boolean;
  readOnly?: boolean;
  helpText?: string;
}

export const WORKFLOW_FIELDS: MetaFieldConfig[] = [
  { key: 'currentStage',     label: 'Current Stage',     type: 'text', placeholder: 'e.g. Draft' },
  { key: 'nextStage',        label: 'Next Stage',        type: 'text', placeholder: 'e.g. Review' },
  { key: 'reviewer',         label: 'Reviewer',          type: 'text', placeholder: 'Name or email' },
  { key: 'approver',         label: 'Approver',          type: 'text', placeholder: 'Name or email' },
  { key: 'approvalLevel',    label: 'Approval Level',    type: 'select', options: ['Level 1', 'Level 2', 'Level 3', 'Executive'] },
  { key: 'triggerCondition', label: 'Trigger Condition', type: 'text', placeholder: 'e.g. On document upload' },
  { key: 'slaHours',         label: 'SLA (hours)',       type: 'number', placeholder: 'e.g. 24' },
  { key: 'escalationRule',   label: 'Escalation Rule',   type: 'text', placeholder: 'e.g. Notify manager after breach' },
];

export const PROJECT_FIELDS: MetaFieldConfig[] = [
  { key: 'epic',            label: 'Epic',             type: 'text', placeholder: 'e.g. Checkout Revamp' },
  { key: 'sprint',          label: 'Sprint',           type: 'text', placeholder: 'e.g. Sprint 14' },
  { key: 'milestone',       label: 'Milestone',        type: 'text', placeholder: 'e.g. Beta Launch' },
  { key: 'team',            label: 'Team',             type: 'text', placeholder: 'e.g. Platform Team' },
  { key: 'storyPoints',     label: 'Story Points',     type: 'number', placeholder: 'e.g. 5' },
  { key: 'estimatedHours',  label: 'Estimated Hours',  type: 'number', placeholder: 'e.g. 16' },
  { key: 'actualHours',     label: 'Actual Hours',     type: 'number', placeholder: 'e.g. 12' },
  { key: 'dependencies',    label: 'Dependencies',     type: 'text', placeholder: 'Comma-separated task titles/IDs' },
  { key: 'progressPercent', label: 'Progress (%)',     type: 'number', placeholder: '0–100' },
];

export const AI_FIELDS: MetaFieldConfig[] = [
  { key: 'model',               label: 'AI Model',             type: 'select', options: ['GPT-4o', 'Claude', 'Gemini', 'Custom Model'] },
  { key: 'prompt',               label: 'Prompt',                type: 'textarea', placeholder: 'Describe what the AI should do', required: true },
  { key: 'inputSource',          label: 'Input Source',          type: 'text', placeholder: 'e.g. CRM export, uploaded file' },
  { key: 'outputType',           label: 'Output Type',           type: 'select', options: ['Text', 'JSON', 'Image', 'Structured Data'] },
  { key: 'trigger',              label: 'Trigger',                type: 'select', options: ['Manual', 'Scheduled', 'Event-Based'] },
  { key: 'automationRule',      label: 'Automation Rule',       type: 'text', placeholder: 'e.g. Run on new lead' },
  { key: 'confidenceThreshold', label: 'Confidence Threshold (%)', type: 'number', placeholder: 'e.g. 70' },
  { key: 'retryPolicy',          label: 'Retry Policy',          type: 'select', options: ['None', 'Retry Once', 'Retry 3x', 'Exponential Backoff'] },
  { key: 'schedule',             label: 'Schedule',               type: 'text', placeholder: 'e.g. Every day at 9am' },
];

export const AI_OUTPUT_FIELDS: MetaFieldConfig[] = [
  { key: 'executionStatus', label: 'Execution Status', type: 'text', readOnly: true, helpText: 'Populated automatically after execution' },
  { key: 'result',          label: 'Result',           type: 'textarea', readOnly: true, helpText: 'Populated automatically after execution' },
];

export const CONTRACT_FIELDS: MetaFieldConfig[] = [
  { key: 'contractId',       label: 'Contract ID',        type: 'text', placeholder: 'Auto-generated if left blank' },
  { key: 'contractType',     label: 'Contract Type',      type: 'select', options: ['NDA', 'MSA', 'SOW', 'Employment', 'Vendor Agreement', 'Other'] },
  { key: 'template',         label: 'Template',           type: 'text', placeholder: 'e.g. Standard NDA v2' },
  { key: 'requestor',        label: 'Requestor',          type: 'text', placeholder: 'Name or email' },
  { key: 'businessUnit',     label: 'Business Unit',      type: 'text', placeholder: 'e.g. Sales' },
  { key: 'counterparty',     label: 'Counterparty',       type: 'text', placeholder: 'Other party name' },
  { key: 'reviewer',         label: 'Reviewer',           type: 'text', placeholder: 'Name or email' },
  { key: 'approver',         label: 'Approver',           type: 'text', placeholder: 'Name or email' },
  { key: 'signatory',        label: 'Signatory',          type: 'text', placeholder: 'Name or email' },
  { key: 'effectiveDate',    label: 'Effective Date',     type: 'date' },
  { key: 'expiryDate',       label: 'Expiry Date',        type: 'date' },
  { key: 'renewalDate',      label: 'Renewal Date',       type: 'date' },
  { key: 'complianceStatus', label: 'Compliance Status',  type: 'select', options: ['Compliant', 'Non-Compliant', 'Pending Review'] },
  { key: 'workflowStage',    label: 'Workflow Stage',     type: 'text', placeholder: 'e.g. Legal Review' },
  { key: 'documentVersion',  label: 'Document Version',   type: 'text', placeholder: 'e.g. v1.0' },
];
