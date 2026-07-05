import { Task } from '../types';

export function splitList(text: string): string[] {
  return text.split(',').map((s) => s.trim()).filter(Boolean);
}

export function buildMetaDraft(task: Task): Record<string, string> {
  switch (task.taskType) {
    case 'general':
      return { tags: task.generalMeta?.tags?.join(', ') ?? '' };
    case 'workflow':
      return task.workflowMeta ? {
        currentStage: task.workflowMeta.currentStage,
        nextStage: task.workflowMeta.nextStage,
        reviewer: task.workflowMeta.reviewer,
        approver: task.workflowMeta.approver,
        approvalLevel: task.workflowMeta.approvalLevel,
        triggerCondition: task.workflowMeta.triggerCondition,
        slaHours: task.workflowMeta.slaHours != null ? String(task.workflowMeta.slaHours) : '',
        escalationRule: task.workflowMeta.escalationRule,
      } : {};
    case 'project':
      return task.projectMeta ? {
        epic: task.projectMeta.epic,
        sprint: task.projectMeta.sprint,
        milestone: task.projectMeta.milestone,
        team: task.projectMeta.team,
        storyPoints: task.projectMeta.storyPoints != null ? String(task.projectMeta.storyPoints) : '',
        estimatedHours: task.projectMeta.estimatedHours != null ? String(task.projectMeta.estimatedHours) : '',
        actualHours: task.projectMeta.actualHours != null ? String(task.projectMeta.actualHours) : '',
        dependencies: task.dependencies.join(', '),
        progressPercent: String(task.projectMeta.progressPercent),
      } : {};
    case 'ai':
      return task.aiMeta ? {
        model: task.aiMeta.model,
        prompt: task.aiMeta.prompt,
        inputSource: task.aiMeta.inputSource,
        outputType: task.aiMeta.outputType,
        trigger: task.aiMeta.trigger,
        automationRule: task.aiMeta.automationRule,
        confidenceThreshold: task.aiMeta.confidenceThreshold != null ? String(task.aiMeta.confidenceThreshold) : '',
        retryPolicy: task.aiMeta.retryPolicy,
        schedule: task.aiMeta.schedule,
      } : {};
    case 'contract':
      return task.contractMeta ? {
        contractId: task.contractMeta.contractId,
        contractType: task.contractMeta.contractType,
        template: task.contractMeta.template,
        requestor: task.contractMeta.requestor,
        businessUnit: task.contractMeta.businessUnit,
        counterparty: task.contractMeta.counterparty,
        reviewer: task.contractMeta.reviewer,
        approver: task.contractMeta.approver,
        signatory: task.contractMeta.signatory,
        effectiveDate: task.contractMeta.effectiveDate,
        expiryDate: task.contractMeta.expiryDate,
        renewalDate: task.contractMeta.renewalDate,
        complianceStatus: task.contractMeta.complianceStatus,
        workflowStage: task.contractMeta.workflowStage,
        documentVersion: task.contractMeta.documentVersion,
      } : {};
    default:
      return {};
  }
}

export function buildMetaUpdate(task: Task, draft: Record<string, string>): Partial<Task> {
  switch (task.taskType) {
    case 'general':
      return { generalMeta: { tags: splitList(draft.tags || '') } };
    case 'workflow':
      return {
        workflowMeta: {
          currentStage: draft.currentStage || '',
          nextStage: draft.nextStage || '',
          reviewer: draft.reviewer || '',
          approver: draft.approver || '',
          approvalLevel: draft.approvalLevel || '',
          triggerCondition: draft.triggerCondition || '',
          slaHours: draft.slaHours ? parseFloat(draft.slaHours) : undefined,
          escalationRule: draft.escalationRule || '',
        },
      };
    case 'project':
      return {
        projectMeta: {
          epic: draft.epic || '',
          sprint: draft.sprint || '',
          milestone: draft.milestone || '',
          team: draft.team || '',
          storyPoints: draft.storyPoints ? parseFloat(draft.storyPoints) : undefined,
          estimatedHours: draft.estimatedHours ? parseFloat(draft.estimatedHours) : undefined,
          actualHours: draft.actualHours ? parseFloat(draft.actualHours) : undefined,
          progressPercent: draft.progressPercent ? parseFloat(draft.progressPercent) : 0,
        },
        dependencies: splitList(draft.dependencies || ''),
      };
    case 'ai':
      return {
        aiMeta: task.aiMeta ? {
          ...task.aiMeta,
          model: draft.model || '',
          prompt: draft.prompt?.trim() || '',
          inputSource: draft.inputSource || '',
          outputType: draft.outputType || '',
          trigger: draft.trigger || '',
          automationRule: draft.automationRule || '',
          confidenceThreshold: draft.confidenceThreshold ? parseFloat(draft.confidenceThreshold) : undefined,
          retryPolicy: draft.retryPolicy || '',
          schedule: draft.schedule || '',
        } : undefined,
      };
    case 'contract':
      return {
        contractMeta: {
          contractId: draft.contractId?.trim() || task.contractMeta?.contractId || '',
          contractType: draft.contractType || '',
          template: draft.template || '',
          requestor: draft.requestor || '',
          businessUnit: draft.businessUnit || '',
          counterparty: draft.counterparty || '',
          reviewer: draft.reviewer || '',
          approver: draft.approver || '',
          signatory: draft.signatory || '',
          effectiveDate: draft.effectiveDate || '',
          expiryDate: draft.expiryDate || '',
          renewalDate: draft.renewalDate || '',
          complianceStatus: draft.complianceStatus || '',
          workflowStage: draft.workflowStage || '',
          documentVersion: draft.documentVersion || '',
        },
      };
    default:
      return {};
  }
}
