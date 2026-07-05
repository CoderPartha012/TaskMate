import { Task } from '../types';

export type SLAAlertStatus = 'ok' | 'due-soon' | 'breached';
export type ContractAlertStatus = 'ok' | 'expiring-soon' | 'expired';

const SLA_DUE_SOON_WINDOW_MS = 4 * 60 * 60 * 1000; // 4 hours
const CONTRACT_EXPIRING_SOON_DAYS = 30;

export function getWorkflowSLAStatus(task: Task): SLAAlertStatus | null {
  if (task.taskType !== 'workflow' || !task.workflowMeta?.slaHours) return null;
  if (task.status === 'completed') return 'ok';

  const deadline = new Date(task.createdAt).getTime() + task.workflowMeta.slaHours * 3600_000;
  if (Number.isNaN(deadline)) return null;

  const now = Date.now();
  if (now > deadline) return 'breached';
  if (deadline - now <= SLA_DUE_SOON_WINDOW_MS) return 'due-soon';
  return 'ok';
}

export function getContractAlert(task: Task): ContractAlertStatus | null {
  if (task.taskType !== 'contract' || !task.contractMeta?.expiryDate) return null;

  const expiry = new Date(task.contractMeta.expiryDate).getTime();
  if (Number.isNaN(expiry)) return null;

  const daysLeft = (expiry - Date.now()) / 86_400_000;
  if (daysLeft < 0) return 'expired';
  if (daysLeft <= CONTRACT_EXPIRING_SOON_DAYS) return 'expiring-soon';
  return 'ok';
}
