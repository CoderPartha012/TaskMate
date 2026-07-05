import { format } from 'date-fns';
import { Task } from '../types';

type FlatTask = {
  Title: string;
  Priority: string;
  Category: string;
  Status: string;
  'Due Date': string;
  'Estimated Time (min)': string;
  'Subtasks Completed': string;
  'Created At': string;
};

function toFlatTask(task: Task): FlatTask {
  const completedSubs = task.subtasks.filter((s) => s.completed).length;
  return {
    Title: task.title,
    Priority: task.priority,
    Category: task.category,
    Status: task.status,
    'Due Date': task.dueDate ? format(new Date(task.dueDate), 'MMM d, yyyy') : '',
    'Estimated Time (min)': task.estimatedTime != null ? String(task.estimatedTime) : '',
    'Subtasks Completed':
      task.subtasks.length > 0 ? `${completedSubs} / ${task.subtasks.length}` : '',
    'Created At': task.createdAt ? format(new Date(task.createdAt), 'MMM d, yyyy') : '',
  };
}

function escapeCSVValue(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function exportToCSV(tasks: Task[]): void {
  const rows = tasks.map(toFlatTask);
  const headers = Object.keys(rows[0] ?? {}) as (keyof FlatTask)[];

  const csvLines = [
    headers.join(','),
    ...rows.map((row) => headers.map((h) => escapeCSVValue(row[h])).join(',')),
  ];

  const blob = new Blob([csvLines.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'taskmate-tasks.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// jspdf loaded dynamically — keeps it out of the initial bundle
export async function exportToPDF(tasks: Task[]): Promise<void> {
  const { default: jsPDF } = await import('jspdf');
  const autoTable = (await import('jspdf-autotable')).default;

  const doc = new jsPDF({ orientation: 'landscape' });
  doc.setFontSize(14);
  doc.text('TaskMate — Task Report', 14, 15);
  doc.setFontSize(9);
  doc.setTextColor(120);
  doc.text(`Generated ${format(new Date(), 'MMM d, yyyy h:mm a')} · ${tasks.length} task(s)`, 14, 21);

  const rows = tasks.map(toFlatTask);
  const headers = Object.keys(rows[0] ?? {}) as (keyof FlatTask)[];

  autoTable(doc, {
    startY: 26,
    head: [headers],
    body: rows.map((row) => headers.map((h) => row[h])),
    styles: { fontSize: 8, cellPadding: 3 },
    headStyles: { fillColor: [0, 200, 150], textColor: [10, 10, 15] },
    alternateRowStyles: { fillColor: [245, 245, 245] },
  });

  doc.save('taskmate-tasks.pdf');
}

// xlsx loaded dynamically — keeps it out of the initial bundle (~500 KB saved)
export async function exportToExcel(tasks: Task[]): Promise<void> {
  const XLSX = await import('xlsx');
  const rows = tasks.map(toFlatTask);

  const worksheet = XLSX.utils.json_to_sheet(rows);
  worksheet['!cols'] = [
    { wch: 30 },
    { wch: 10 },
    { wch: 12 },
    { wch: 14 },
    { wch: 14 },
    { wch: 20 },
    { wch: 20 },
    { wch: 14 },
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Tasks');
  XLSX.writeFile(workbook, 'taskmate-tasks.xlsx');
}
