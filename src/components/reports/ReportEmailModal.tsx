import React, { useState } from 'react';
import { X, Mail, Send, Info } from 'lucide-react';

const labelClass = 'text-[10px] font-semibold uppercase tracking-widest text-white/40';
const inputBase =
  'mt-1 block w-full rounded-lg bg-noir-600 text-white/80 text-sm px-3 py-2 focus:outline-none border border-white/[0.08] focus:border-jade transition-colors';

interface ReportEmailModalProps {
  open: boolean;
  reportName: string;
  onClose: () => void;
  onSend: (recipients: string[], subject: string, message: string) => void;
}

export function ReportEmailModal({ open, reportName, onClose, onSend }: ReportEmailModalProps) {
  const [recipients, setRecipients] = useState('');
  const [subject, setSubject] = useState(`TaskMate Report: ${reportName}`);
  const [message, setMessage] = useState(`Hi,\n\nPlease find the "${reportName}" report attached.\n\nThanks`);

  if (!open) return null;

  const handleSend = () => {
    const list = recipients.split(',').map((r) => r.trim()).filter(Boolean);
    if (list.length === 0) return;

    const mailto = `mailto:${encodeURIComponent(list.join(','))}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
    window.location.href = mailto;
    onSend(list, subject, message);
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-40" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-noir-700 border border-white/[0.08] rounded-xl p-5 max-w-md w-full">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-bold text-sm text-white flex items-center gap-2">
              <Mail className="w-4 h-4 text-jade" />
              Email Report
            </h3>
            <button type="button" onClick={onClose} className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <label className={labelClass}>Recipient Email(s)</label>
              <input type="text" value={recipients} onChange={(e) => setRecipients(e.target.value)} placeholder="name@example.com, name2@example.com" className={inputBase} />
            </div>
            <div>
              <label className={labelClass}>Subject</label>
              <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} className={inputBase} />
            </div>
            <div>
              <label className={labelClass}>Message</label>
              <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={4} className={`${inputBase} resize-none`} />
            </div>

            <div className="flex items-start gap-1.5 text-[10px] text-white/30 bg-white/[0.03] rounded-lg p-2.5">
              <Info className="w-3 h-3 shrink-0 mt-0.5" />
              This opens your default email application with the message pre-filled — TaskMate doesn't send email directly.
            </div>

            <button
              type="button"
              onClick={handleSend}
              disabled={!recipients.trim()}
              className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-bold bg-jade hover:bg-jade-dark text-noir-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Send className="w-3.5 h-3.5" />
              Send Report
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
