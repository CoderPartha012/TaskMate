import React, { useEffect, useRef, useState } from 'react';
import { format } from 'date-fns';
import {
  FileText, FileSpreadsheet, FileImage, FileArchive, Inbox,
  Download, Eye, Upload, Pencil, Trash2, RefreshCw, Search, ArrowUpDown, ArrowUp, ArrowDown, X,
} from 'lucide-react';
import { Task, TaskAttachment } from '../../types';
import { useTaskStore } from '../../store/taskStore';
import {
  MAX_FILE_BYTES,
  ACCEPTED_LABEL,
  ACCEPT_ATTR,
  isAcceptedFile,
  formatFileSize,
  readFileAsDataUrl,
} from '../../utils/attachmentRules';
import { RepositoryPagination } from '../common/RepositoryPagination';
import { ConfirmDeleteModal } from '../common/ConfirmDeleteModal';

type FileCategory = 'image' | 'spreadsheet' | 'archive' | 'document';
type SortKey = 'name' | 'date' | 'size';
type ConfirmTarget = { type: 'single'; attachment: TaskAttachment } | { type: 'bulk' } | null;

function fileCategory(name: string): FileCategory {
  const lower = name.toLowerCase();
  if (/\.(png|jpe?g|gif)$/.test(lower)) return 'image';
  if (/\.(xlsx?|csv)$/.test(lower)) return 'spreadsheet';
  if (/\.zip$/.test(lower)) return 'archive';
  return 'document';
}

function fileIcon(name: string) {
  const category = fileCategory(name);
  if (category === 'image') return <FileImage className="w-4 h-4 text-purple-400" />;
  if (category === 'spreadsheet') return <FileSpreadsheet className="w-4 h-4 text-jade" />;
  if (category === 'archive') return <FileArchive className="w-4 h-4 text-amber-400" />;
  return <FileText className="w-4 h-4 text-blue-400" />;
}

function fileExtLabel(name: string): string {
  const match = /\.([a-z0-9]+)$/i.exec(name);
  return match ? match[1].toUpperCase() : '—';
}

interface TaskDocumentsTabProps {
  task: Task;
}

export function TaskDocumentsTab({ task }: TaskDocumentsTabProps) {
  const updateTask = useTaskStore((s) => s.updateTask);
  const uploadRef = useRef<HTMLInputElement>(null);
  const replaceRef = useRef<HTMLInputElement>(null);
  const replaceTargetId = useRef<string | null>(null);

  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | FileCategory>('all');
  const [sortKey, setSortKey] = useState<SortKey>('date');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [versionsOpenId, setVersionsOpenId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [confirmTarget, setConfirmTarget] = useState<ConfirmTarget>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const attachments = task.attachments ?? [];

  useEffect(() => {
    setPage(1);
  }, [search, categoryFilter, sortKey, sortDir, pageSize]);

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setError('');

    const accepted: TaskAttachment[] = [];
    for (const file of Array.from(files)) {
      if (!isAcceptedFile(file)) {
        setError(`"${file.name}" is not a supported file type (${ACCEPTED_LABEL})`);
        continue;
      }
      if (file.size > MAX_FILE_BYTES) {
        setError(`"${file.name}" is too large (max 5 MB per file)`);
        continue;
      }
      const dataUrl = await readFileAsDataUrl(file);
      accepted.push({
        id: crypto.randomUUID(),
        name: file.name,
        type: file.type || 'application/octet-stream',
        size: file.size,
        dataUrl,
        uploadedBy: 'You',
        uploadedAt: new Date().toISOString(),
      });
    }

    if (accepted.length > 0) {
      updateTask(
        task.id,
        { attachments: [...attachments, ...accepted] },
        [{
          type: 'attachment_added',
          message: accepted.length === 1 ? `Uploaded "${accepted[0].name}"` : `Uploaded ${accepted.length} files`,
          user: 'You',
        }]
      );
    }
    if (uploadRef.current) uploadRef.current.value = '';
  };

  const handleReplace = async (files: FileList | null) => {
    const targetId = replaceTargetId.current;
    const file = files?.[0];
    if (!targetId || !file) return;
    setError('');

    if (!isAcceptedFile(file)) {
      setError(`"${file.name}" is not a supported file type (${ACCEPTED_LABEL})`);
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      setError(`"${file.name}" is too large (max 5 MB per file)`);
      return;
    }
    const dataUrl = await readFileAsDataUrl(file);
    const target = attachments.find((a) => a.id === targetId);
    if (!target) return;

    const updated = attachments.map((a) => {
      if (a.id !== targetId) return a;
      return {
        ...a,
        name: file.name,
        type: file.type || 'application/octet-stream',
        size: file.size,
        dataUrl,
        uploadedBy: 'You',
        uploadedAt: new Date().toISOString(),
        versions: [
          { dataUrl: a.dataUrl, size: a.size, uploadedBy: a.uploadedBy, uploadedAt: a.uploadedAt },
          ...(a.versions ?? []),
        ],
      };
    });

    updateTask(
      task.id,
      { attachments: updated },
      [{ type: 'attachment_added', message: `Uploaded new version of "${target.name}"`, user: 'You' }]
    );
    if (replaceRef.current) replaceRef.current.value = '';
  };

  const startRename = (att: TaskAttachment) => {
    setRenamingId(att.id);
    setRenameValue(att.name);
  };

  const commitRename = (id: string) => {
    const name = renameValue.trim();
    setRenamingId(null);
    if (!name) return;
    const target = attachments.find((a) => a.id === id);
    if (!target || target.name === name) return;
    updateTask(
      task.id,
      { attachments: attachments.map((a) => (a.id === id ? { ...a, name } : a)) },
      [{ type: 'metadata_updated', message: `Renamed "${target.name}" to "${name}"`, user: 'You' }]
    );
  };

  const handleDelete = (att: TaskAttachment) => {
    updateTask(
      task.id,
      { attachments: attachments.filter((a) => a.id !== att.id) },
      [{ type: 'metadata_updated', message: `Deleted document "${att.name}"`, user: 'You' }]
    );
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(att.id);
      return next;
    });
    setConfirmTarget(null);
  };

  const handleBulkDelete = () => {
    const count = selectedIds.size;
    updateTask(
      task.id,
      { attachments: attachments.filter((a) => !selectedIds.has(a.id)) },
      [{ type: 'metadata_updated', message: `Deleted ${count} document${count > 1 ? 's' : ''}`, user: 'You' }]
    );
    setSelectedIds(new Set());
    setConfirmTarget(null);
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const handleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const filtered = attachments
    .filter((a) => categoryFilter === 'all' || fileCategory(a.name) === categoryFilter)
    .filter((a) => !search.trim() || a.name.toLowerCase().includes(search.trim().toLowerCase()));

  const sorted = [...filtered].sort((a, b) => {
    let cmp = 0;
    if (sortKey === 'name') cmp = a.name.localeCompare(b.name);
    else if (sortKey === 'date') cmp = new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime();
    else cmp = a.size - b.size;
    return sortDir === 'asc' ? cmp : -cmp;
  });

  const total = sorted.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const clampedPage = Math.min(page, totalPages);
  const paginated = sorted.slice((clampedPage - 1) * pageSize, clampedPage * pageSize);
  const allOnPageSelected = paginated.length > 0 && paginated.every((a) => selectedIds.has(a.id));

  const toggleSelectAllOnPage = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allOnPageSelected) paginated.forEach((a) => next.delete(a.id));
      else paginated.forEach((a) => next.add(a.id));
      return next;
    });
  };

  const SortHeader = ({ label, sortField }: { label: string; sortField: SortKey }) => (
    <button
      type="button"
      onClick={() => handleSort(sortField)}
      className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-widest text-white/40 hover:text-white/70 transition-colors whitespace-nowrap"
    >
      {label}
      {sortKey === sortField ? (
        sortDir === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
      ) : (
        <ArrowUpDown className="w-3 h-3 opacity-30" />
      )}
    </button>
  );

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <button
          type="button"
          onClick={() => uploadRef.current?.click()}
          className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-lg bg-jade hover:bg-jade-dark text-noir-800 transition-colors shrink-0"
        >
          <Upload className="w-3.5 h-3.5" />
          Upload Document
        </button>
        <input ref={uploadRef} type="file" multiple accept={ACCEPT_ATTR} className="hidden" onChange={(e) => handleUpload(e.target.files)} />
        <input
          ref={replaceRef}
          type="file"
          accept={ACCEPT_ATTR}
          className="hidden"
          onChange={(e) => handleReplace(e.target.files)}
        />

        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/25" aria-hidden="true" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search documents…"
            aria-label="Search documents"
            className="w-full bg-noir-700 border border-white/[0.06] rounded-lg pl-9 pr-3 py-2 text-xs text-white/80 placeholder:text-white/25 focus:outline-none focus:border-jade transition-colors"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value as 'all' | FileCategory)}
          className="text-xs font-semibold px-2.5 py-2 rounded-lg bg-noir-700 border border-white/[0.06] text-white/60 focus:outline-none focus:border-jade transition-colors"
        >
          <option value="all">All Types</option>
          <option value="document">Documents</option>
          <option value="spreadsheet">Spreadsheets</option>
          <option value="image">Images</option>
          <option value="archive">Archives</option>
        </select>
      </div>

      {error && (
        <p className="text-[11px] text-amber-400 mb-3">{error}</p>
      )}

      {selectedIds.size > 0 && (
        <div className="flex items-center gap-3 bg-noir-700 border border-white/[0.06] rounded-lg px-4 py-2.5 mb-3">
          <span className="text-xs font-bold text-white/85">{selectedIds.size} selected</span>
          <button
            type="button"
            onClick={() => setConfirmTarget({ type: 'bulk' })}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-red-500/25 text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete Selected
          </button>
          <button
            type="button"
            onClick={() => setSelectedIds(new Set())}
            aria-label="Clear selection"
            className="ml-auto p-1.5 rounded-lg text-white/35 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {sorted.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-14 text-center">
          <span className="w-12 h-12 rounded-full bg-white/[0.04] flex items-center justify-center mb-3">
            <Inbox className="w-5 h-5 text-white/25" aria-hidden="true" />
          </span>
          <p className="text-xs text-white/40">
            {attachments.length === 0 ? 'No documents yet — upload your first file to get started.' : 'No documents match your search and filters.'}
          </p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[860px]">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="px-3 py-2.5 w-8">
                    <input
                      type="checkbox"
                      checked={allOnPageSelected}
                      onChange={toggleSelectAllOnPage}
                      aria-label="Select all documents on this page"
                      className="w-3.5 h-3.5 rounded accent-jade cursor-pointer"
                    />
                  </th>
                  <th className="px-3 py-2.5"><SortHeader label="File Name" sortField="name" /></th>
                  <th className="px-3 py-2.5 text-[11px] font-semibold uppercase tracking-widest text-white/40">Type</th>
                  <th className="px-3 py-2.5 text-[11px] font-semibold uppercase tracking-widest text-white/40">Version</th>
                  <th className="px-3 py-2.5 text-[11px] font-semibold uppercase tracking-widest text-white/40">Uploaded By</th>
                  <th className="px-3 py-2.5"><SortHeader label="Upload Date" sortField="date" /></th>
                  <th className="px-3 py-2.5"><SortHeader label="Size" sortField="size" /></th>
                  <th className="px-3 py-2.5 text-[11px] font-semibold uppercase tracking-widest text-white/40 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((att) => {
                  const versionCount = (att.versions?.length ?? 0) + 1;
                  const isSelected = selectedIds.has(att.id);
                  return (
                    <tr key={att.id} className={`hover:bg-white/[0.03] transition-colors text-xs ${isSelected ? 'bg-jade/[0.05]' : ''}`}>
                      <td className="px-3 py-2.5">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelect(att.id)}
                          aria-label={`Select ${att.name}`}
                          className="w-3.5 h-3.5 rounded accent-jade cursor-pointer"
                        />
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-2.5 min-w-0">
                          {fileIcon(att.name)}
                          {renamingId === att.id ? (
                            <input
                              autoFocus
                              type="text"
                              value={renameValue}
                              onChange={(e) => setRenameValue(e.target.value)}
                              onBlur={() => commitRename(att.id)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') commitRename(att.id);
                                if (e.key === 'Escape') setRenamingId(null);
                              }}
                              className="flex-1 min-w-0 rounded-md bg-noir-600 text-white/80 text-xs px-2 py-1 border border-jade/40 focus:outline-none"
                            />
                          ) : (
                            <span className="truncate text-white/80" title={att.name}>{att.name}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-2.5 text-white/45 whitespace-nowrap">{fileExtLabel(att.name)}</td>
                      <td className="px-3 py-2.5">
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => setVersionsOpenId((id) => (id === att.id ? null : att.id))}
                            disabled={versionCount === 1}
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded border whitespace-nowrap ${
                              versionCount > 1
                                ? 'border-jade/25 text-jade hover:bg-jade/10 cursor-pointer transition-colors'
                                : 'border-white/[0.12] text-white/40 cursor-default'
                            }`}
                          >
                            v{versionCount}
                          </button>
                          {versionsOpenId === att.id && versionCount > 1 && (
                            <div className="absolute left-0 top-full mt-1 w-56 bg-noir-700 border border-white/[0.08] rounded-lg shadow-2xl z-20 py-1">
                              <p className="px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white/30">Version History</p>
                              {(att.versions ?? []).map((v, i) => (
                                <a
                                  key={`${att.id}-v${i}`}
                                  href={v.dataUrl}
                                  download={att.name}
                                  className="flex items-center justify-between px-3 py-1.5 text-[11px] text-white/60 hover:bg-white/5 hover:text-white transition-colors"
                                >
                                  <span>v{versionCount - 1 - i} · {v.uploadedBy}</span>
                                  <span className="text-white/30">{format(new Date(v.uploadedAt), 'MMM d')}</span>
                                </a>
                              ))}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-2.5 text-white/60 whitespace-nowrap">{att.uploadedBy}</td>
                      <td className="px-3 py-2.5 text-white/45 whitespace-nowrap">{format(new Date(att.uploadedAt), 'MMM d, yyyy')}</td>
                      <td className="px-3 py-2.5 text-white/45 whitespace-nowrap">{formatFileSize(att.size)}</td>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center justify-end gap-1">
                          <a href={att.dataUrl} target="_blank" rel="noreferrer" title="Preview" aria-label={`Preview ${att.name}`} className="p-1.5 rounded-lg text-white/40 hover:text-jade hover:bg-white/5 transition-colors">
                            <Eye className="w-3.5 h-3.5" />
                          </a>
                          <a href={att.dataUrl} download={att.name} title="Download" aria-label={`Download ${att.name}`} className="p-1.5 rounded-lg text-white/40 hover:text-jade hover:bg-white/5 transition-colors">
                            <Download className="w-3.5 h-3.5" />
                          </a>
                          <button type="button" onClick={() => startRename(att)} title="Rename" aria-label={`Rename ${att.name}`} className="p-1.5 rounded-lg text-white/40 hover:text-blue-400 hover:bg-white/5 transition-colors">
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => { replaceTargetId.current = att.id; replaceRef.current?.click(); }}
                            title="Replace Version"
                            aria-label={`Replace version of ${att.name}`}
                            className="p-1.5 rounded-lg text-white/40 hover:text-amber-400 hover:bg-white/5 transition-colors"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                          </button>
                          <button type="button" onClick={() => setConfirmTarget({ type: 'single', attachment: att })} title="Delete" aria-label={`Delete ${att.name}`} className="p-1.5 rounded-lg text-white/40 hover:text-red-400 hover:bg-white/5 transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-4">
            <RepositoryPagination
              page={clampedPage}
              pageSize={pageSize}
              total={total}
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
            />
          </div>
        </>
      )}

      <p className="mt-3 text-[10px] text-white/25">
        Supported formats: {ACCEPTED_LABEL} · Maximum file size: 5 MB per file
      </p>

      {confirmTarget?.type === 'single' && (
        <ConfirmDeleteModal
          title="Delete Document"
          message={`Delete "${confirmTarget.attachment.name}" permanently? This cannot be undone.`}
          onConfirm={() => handleDelete(confirmTarget.attachment)}
          onCancel={() => setConfirmTarget(null)}
        />
      )}
      {confirmTarget?.type === 'bulk' && (
        <ConfirmDeleteModal
          title="Delete Documents"
          message={`Delete ${selectedIds.size} selected document${selectedIds.size > 1 ? 's' : ''} permanently? This cannot be undone.`}
          onConfirm={handleBulkDelete}
          onCancel={() => setConfirmTarget(null)}
        />
      )}
    </div>
  );
}
