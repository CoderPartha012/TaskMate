import { Category, Priority, Status } from '../../types';

export interface GeneralDraft {
  assignee: string;
  priority: Priority;
  status: Status;
  startDate: string;
  dueDate: string;
  category: Category;
}
