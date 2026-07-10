import { Task } from '../types';

function nextId(): string {
  return crypto.randomUUID();
}

function daysAgoISO(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

function daysFromNowDateOnly(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

function daysAgoDateOnly(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

interface BaseOpts {
  title: string;
  description: string;
  createdDaysAgo: number;
  dueInDays?: number;
  dueDaysAgo?: number;
  completedDaysAgo?: number;
  priority: Task['priority'];
  status: Task['status'];
  assignee: string;
  createdBy: string;
}

function base(o: BaseOpts): Task {
  const createdAt = daysAgoISO(o.createdDaysAgo);
  const dueDate = o.dueDaysAgo != null ? daysAgoDateOnly(o.dueDaysAgo) : daysFromNowDateOnly(o.dueInDays ?? 7);
  const completedAt = o.completedDaysAgo != null ? daysAgoISO(o.completedDaysAgo) : undefined;
  const id = nextId();

  return {
    id,
    title: o.title,
    description: o.description,
    dueDate,
    priority: o.priority,
    status: o.status,
    createdAt,
    category: 'other',
    recurrence: 'none',
    lastModified: completedAt ?? createdAt,
    subtasks: [],
    dependencies: [],
    archived: false,
    completedAt,
    assignees: [o.assignee],
    comments: [],
    taskType: 'general',
    activityLog: [{ id: nextId(), type: 'created', message: 'Task created', user: o.createdBy, timestamp: createdAt }],
    createdBy: o.createdBy,
    watchers: [],
  };
}

export function generateSampleTasks(): Task[] {
  const tasks: Task[] = [];

  // ── General Task Type ──────────────────────────────────────────────
  tasks.push({
    ...base({ title: 'Prepare Q3 budget review', description: 'Compile department spend and prepare slides for finance review.', createdDaysAgo: 12, dueInDays: 3, priority: 'high', status: 'in-progress', assignee: 'Sarah Miller', createdBy: 'Admin' }),
    category: 'work',
    generalMeta: { tags: ['finance', 'quarterly'] },
  });
  tasks.push({
    ...base({ title: 'Update employee onboarding docs', description: 'Refresh the onboarding handbook with new benefits information.', createdDaysAgo: 25, dueDaysAgo: 10, completedDaysAgo: 8, priority: 'medium', status: 'completed', assignee: 'John Doe', createdBy: 'Team Lead' }),
    category: 'work',
    generalMeta: { tags: ['hr', 'docs'] },
  });
  tasks.push({
    ...base({ title: 'Fix login page CSS bug', description: 'Submit button overlaps the password field on small screens.', createdDaysAgo: 2, dueInDays: 1, priority: 'high', status: 'pending', assignee: 'Rohit Sharma', createdBy: 'Project Manager' }),
    category: 'urgent',
    generalMeta: { tags: ['bug', 'frontend'] },
  });
  tasks.push({
    ...base({ title: 'Organize team offsite event', description: 'Book venue and send calendar invites for the Q3 offsite.', createdDaysAgo: 5, dueInDays: 20, priority: 'low', status: 'pending', assignee: 'Emily Chen', createdBy: 'You' }),
    category: 'personal',
    generalMeta: { tags: ['events'] },
  });

  // ── Workflow-Based Tasks ────────────────────────────────────────────
  tasks.push({
    ...base({ title: 'Vendor Contract Approval Workflow', description: '', createdDaysAgo: 6, dueInDays: 4, priority: 'medium', status: 'in-progress', assignee: 'Sarah Miller', createdBy: 'Admin' }),
    taskType: 'workflow',
    workflowMeta: { currentStage: 'Legal Review', nextStage: 'Finance Approval', reviewer: 'Bob Lee', approver: 'Carol White', approvalLevel: 'Level 2', triggerCondition: 'On document upload', slaHours: 48, escalationRule: 'Notify director' },
  });
  tasks.push({
    ...base({ title: 'Expense Reimbursement Review', description: '', createdDaysAgo: 2, dueInDays: 2, priority: 'medium', status: 'pending', assignee: 'Rohit Sharma', createdBy: 'Project Manager' }),
    taskType: 'workflow',
    workflowMeta: { currentStage: 'Manager Review', nextStage: 'Finance Payout', reviewer: 'John Doe', approver: 'Emily Chen', approvalLevel: 'Level 1', triggerCondition: 'On submission', slaHours: 12, escalationRule: 'Auto-escalate to Finance Lead' },
  });
  tasks.push({
    ...base({ title: 'New Hire Onboarding Approval', description: '', createdDaysAgo: 15, dueDaysAgo: 3, completedDaysAgo: 3, priority: 'medium', status: 'completed', assignee: 'John Doe', createdBy: 'Team Lead' }),
    taskType: 'workflow',
    workflowMeta: { currentStage: 'IT Provisioning', nextStage: 'Complete', reviewer: 'Sarah Miller', approver: 'Admin', approvalLevel: 'Level 1', triggerCondition: 'On HR sign-off', slaHours: 72, escalationRule: 'Notify HR lead' },
  });
  tasks.push({
    ...base({ title: 'Marketing Campaign Sign-off', description: '', createdDaysAgo: 4, dueInDays: 6, priority: 'low', status: 'in-progress', assignee: 'Emily Chen', createdBy: 'Admin' }),
    taskType: 'workflow',
    workflowMeta: { currentStage: 'Creative Review', nextStage: 'Legal Compliance', reviewer: 'Carol White', approver: 'Bob Lee', approvalLevel: 'Level 2', triggerCondition: 'On asset upload', slaHours: 96, escalationRule: 'Notify marketing director' },
  });

  // ── Project Management Tasks ────────────────────────────────────────
  tasks.push({
    ...base({ title: 'Design new dashboard UI', description: '', createdDaysAgo: 10, dueInDays: 5, priority: 'high', status: 'in-progress', assignee: 'Sarah Miller', createdBy: 'Project Manager' }),
    taskType: 'project',
    projectMeta: { epic: 'Dashboard Revamp', sprint: 'Sprint 14', milestone: 'Beta Launch', team: 'Platform', storyPoints: 8, estimatedHours: 24, actualHours: 10, progressPercent: 40 },
  });
  tasks.push({
    ...base({ title: 'API integration for payments', description: '', createdDaysAgo: 20, dueDaysAgo: 2, completedDaysAgo: 2, priority: 'high', status: 'completed', assignee: 'Rohit Sharma', createdBy: 'Team Lead' }),
    taskType: 'project',
    projectMeta: { epic: 'Payments', sprint: 'Sprint 13', milestone: 'GA Release', team: 'Backend', storyPoints: 13, estimatedHours: 40, actualHours: 40, progressPercent: 100 },
  });
  tasks.push({
    ...base({ title: 'Migrate database to v2', description: '', createdDaysAgo: 3, dueInDays: 14, priority: 'medium', status: 'pending', assignee: 'John Doe', createdBy: 'Admin' }),
    taskType: 'project',
    projectMeta: { epic: 'Infra', sprint: 'Sprint 14', milestone: 'GA Release', team: 'Platform', storyPoints: 5, estimatedHours: 16, actualHours: 4, progressPercent: 20 },
  });
  tasks.push({
    ...base({ title: 'Q3 sprint retrospective', description: '', createdDaysAgo: 7, dueDaysAgo: 1, completedDaysAgo: 1, priority: 'low', status: 'completed', assignee: 'Emily Chen', createdBy: 'Team Lead' }),
    taskType: 'project',
    projectMeta: { epic: 'Process', sprint: 'Sprint 13', milestone: '', team: 'All Teams', storyPoints: 2, estimatedHours: 2, actualHours: 2, progressPercent: 100 },
  });

  // ── AI & Smart Tasks ─────────────────────────────────────────────────
  tasks.push({
    ...base({ title: 'Summarize weekly customer feedback', description: '', createdDaysAgo: 4, dueInDays: 7, priority: 'medium', status: 'in-progress', assignee: 'AI Engine', createdBy: 'Admin' }),
    taskType: 'ai',
    aiMeta: {
      model: 'GPT-4o', prompt: "Summarize this week's customer feedback tickets into key themes", inputSource: 'Support tickets export', outputType: 'Text', trigger: 'Scheduled', automationRule: 'Run every Monday', confidenceThreshold: 70, retryPolicy: 'Retry Once', schedule: 'Weekly, Monday 9am',
      executionStatus: 'success', result: 'Summary generated: 3 key themes identified — pricing confusion, slow support response, and positive feedback on the new dashboard.',
      logs: ['[09:00:01] Execution started…', '[09:00:04] Model "GPT-4o" processing prompt…', '[09:00:06] Confidence score: 88%', '[09:00:06] Execution completed successfully.'],
      startedAt: daysAgoISO(4), completedAt: daysAgoISO(4),
    },
  });
  tasks.push({
    ...base({ title: 'Auto-categorize support tickets', description: '', createdDaysAgo: 0, dueInDays: 1, priority: 'low', status: 'pending', assignee: 'AI Engine', createdBy: 'Team Lead' }),
    taskType: 'ai',
    aiMeta: {
      model: 'Claude', prompt: 'Categorize incoming support tickets by topic and urgency', inputSource: 'Support inbox', outputType: 'Structured Data', trigger: 'Event-Based', automationRule: 'Run on new ticket', confidenceThreshold: 60, retryPolicy: 'Retry 3x', schedule: 'Continuous',
      executionStatus: 'running', result: '', logs: ['[10:12:00] Execution started…'], startedAt: daysAgoISO(0),
    },
  });
  tasks.push({
    ...base({ title: 'Generate monthly report draft', description: '', createdDaysAgo: 6, dueDaysAgo: 1, priority: 'medium', status: 'pending', assignee: 'AI Engine', createdBy: 'Admin' }),
    taskType: 'ai',
    aiMeta: {
      model: 'GPT-4o', prompt: 'Draft the monthly operations report from task and analytics data', inputSource: 'Analytics export', outputType: 'Text', trigger: 'Manual', automationRule: '', confidenceThreshold: 80, retryPolicy: 'None', schedule: '',
      executionStatus: 'failed', result: '', logs: ['[08:00:01] Execution started…', '[08:00:05] Model "GPT-4o" processing prompt…', '[08:00:05] Confidence score: 52%', '[08:00:05] Execution failed — confidence below threshold (80%).'],
      startedAt: daysAgoISO(6), completedAt: daysAgoISO(6),
    },
  });
  tasks.push({
    ...base({ title: 'Detect anomalies in usage logs', description: '', createdDaysAgo: 1, dueInDays: 5, priority: 'low', status: 'pending', assignee: 'AI Engine', createdBy: 'Project Manager' }),
    taskType: 'ai',
    aiMeta: {
      model: 'Custom Model', prompt: 'Flag unusual patterns in daily active usage logs', inputSource: 'Usage log stream', outputType: 'JSON', trigger: 'Scheduled', automationRule: 'Run nightly', confidenceThreshold: 75, retryPolicy: 'Exponential Backoff', schedule: 'Daily, midnight',
      executionStatus: 'idle', result: '', logs: [],
    },
  });

  // ── Contract / Business Workflow Tasks ───────────────────────────────
  tasks.push({
    ...base({ title: 'NDA with Acme Corp', description: '', createdDaysAgo: 30, dueDaysAgo: 5, completedDaysAgo: 5, priority: 'medium', status: 'completed', assignee: 'Sarah Miller', createdBy: 'Admin' }),
    taskType: 'contract',
    contractMeta: {
      contractId: 'CTR-ACME01', contractType: 'NDA', template: 'Standard NDA v2', requestor: 'Sarah Miller', businessUnit: 'Sales', counterparty: 'Acme Corp',
      reviewer: 'Bob Lee', approver: 'Carol White', signatory: 'Admin',
      effectiveDate: daysAgoDateOnly(30), expiryDate: daysFromNowDateOnly(300), renewalDate: daysFromNowDateOnly(270),
      complianceStatus: 'Compliant', workflowStage: 'Signed', documentVersion: 'v1.0',
    },
  });
  tasks.push({
    ...base({ title: 'MSA Renewal - Vendor X', description: '', createdDaysAgo: 40, dueInDays: 10, priority: 'high', status: 'in-progress', assignee: 'John Doe', createdBy: 'Team Lead' }),
    taskType: 'contract',
    contractMeta: {
      contractId: 'CTR-VNDX02', contractType: 'MSA', template: 'Standard MSA', requestor: 'John Doe', businessUnit: 'Procurement', counterparty: 'Vendor X',
      reviewer: 'Emily Chen', approver: 'Admin', signatory: '',
      effectiveDate: daysAgoDateOnly(360), expiryDate: daysFromNowDateOnly(10), renewalDate: daysFromNowDateOnly(5),
      complianceStatus: 'Pending Review', workflowStage: 'Renewal Negotiation', documentVersion: 'v3.2',
    },
  });
  tasks.push({
    ...base({ title: 'Employment Contract - New Hire', description: '', createdDaysAgo: 60, dueDaysAgo: 5, priority: 'medium', status: 'pending', assignee: 'Rohit Sharma', createdBy: 'Admin' }),
    taskType: 'contract',
    contractMeta: {
      contractId: 'CTR-EMP03', contractType: 'Employment', template: 'Standard Offer Letter', requestor: 'Team Lead', businessUnit: 'Engineering', counterparty: 'Rohit Sharma',
      reviewer: 'Admin', approver: 'Carol White', signatory: '',
      effectiveDate: daysAgoDateOnly(60), expiryDate: daysAgoDateOnly(5), renewalDate: '',
      complianceStatus: 'Non-Compliant', workflowStage: 'Awaiting Signature', documentVersion: 'v1.0',
    },
  });
  tasks.push({
    ...base({ title: 'SOW for Q4 Consulting', description: '', createdDaysAgo: 50, dueDaysAgo: 5, completedDaysAgo: 5, priority: 'low', status: 'completed', assignee: 'Emily Chen', createdBy: 'Project Manager' }),
    taskType: 'contract',
    contractMeta: {
      contractId: 'CTR-CNS04', contractType: 'SOW', template: 'Consulting SOW', requestor: 'Emily Chen', businessUnit: 'Operations', counterparty: 'Bright Consulting LLC',
      reviewer: 'Bob Lee', approver: 'Admin', signatory: 'Admin',
      effectiveDate: daysAgoDateOnly(45), expiryDate: daysFromNowDateOnly(90), renewalDate: daysAgoDateOnly(2),
      complianceStatus: 'Compliant', workflowStage: 'Active', documentVersion: 'v2.0',
    },
  });

  return tasks;
}
