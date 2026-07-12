import React, { useRef, useState } from 'react';
import { Camera, Trash2 } from 'lucide-react';
import { OrgOverview } from '../../../store/organizationStore';
import { readFileAsDataUrl } from '../../../utils/attachmentRules';

const inputBase =
  'w-full rounded-lg bg-noir-600 text-white/80 text-sm px-3 py-2 focus:outline-none border border-white/[0.08] focus:border-jade transition-colors disabled:opacity-50 disabled:cursor-not-allowed';
const labelClass = 'text-[11px] font-medium text-white/50 block mb-1.5';

const MAX_LOGO_BYTES = 5 * 1024 * 1024;
const INDUSTRY_OPTIONS = ['Software Development', 'Finance', 'Healthcare', 'Retail', 'Manufacturing', 'Education', 'Other'];
const COMPANY_SIZE_OPTIONS = ['1-10 employees', '11-50 employees', '51-200 employees', '201-500 employees', '500+ employees'];
const BUSINESS_TYPE_OPTIONS = ['Private Company', 'Public Company', 'Non-Profit', 'Government', 'Startup'];

function isImageFile(file: File): boolean {
  return /\.(png|jpe?g)$/i.test(file.name);
}

interface OrgOverviewSectionProps {
  draft: OrgOverview;
  logoDataUrl: string | null;
  onChange: (patch: Partial<OrgOverview>) => void;
  onLogoChange: (dataUrl: string | null) => void;
}

export function OrgOverviewSection({ draft, logoDataUrl, onChange, onLogoChange }: OrgOverviewSectionProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [logoError, setLogoError] = useState('');

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setLogoError('');
    if (!isImageFile(file)) { setLogoError('Only PNG, JPG, or JPEG files are supported.'); return; }
    if (file.size > MAX_LOGO_BYTES) { setLogoError('Image must be 5MB or smaller.'); return; }
    const dataUrl = await readFileAsDataUrl(file);
    onLogoChange(dataUrl);
    if (fileRef.current) fileRef.current.value = '';
  };

  const textField = (label: string, key: keyof OrgOverview, type = 'text', readOnly = false) => (
    <div key={key}>
      <label className={labelClass} htmlFor={`org-${key}`}>{label}</label>
      <input
        id={`org-${key}`}
        type={type}
        value={draft[key]}
        readOnly={readOnly}
        disabled={readOnly}
        onChange={(e) => onChange({ [key]: e.target.value } as Partial<OrgOverview>)}
        className={inputBase}
      />
    </div>
  );

  const selectField = (label: string, key: keyof OrgOverview, options: string[]) => (
    <div key={key}>
      <label className={labelClass} htmlFor={`org-${key}`}>{label}</label>
      <select
        id={`org-${key}`}
        value={draft[key]}
        onChange={(e) => onChange({ [key]: e.target.value } as Partial<OrgOverview>)}
        className={inputBase}
      >
        {options.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
      </select>
    </div>
  );

  return (
    <div className="bg-noir-700 border border-white/[0.06] rounded-xl p-6">
      <h3 className="font-display font-bold text-sm text-white mb-5">Organization Overview</h3>

      <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-6">
        <div>
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files?.[0]); }}
            className={`relative w-28 h-28 mx-auto md:mx-0 rounded-full transition-shadow ${dragOver ? 'ring-2 ring-jade ring-offset-2 ring-offset-noir-700' : ''}`}
          >
            {logoDataUrl ? (
              <img src={logoDataUrl} alt="" className="w-28 h-28 rounded-full object-cover" />
            ) : (
              <div className="w-28 h-28 rounded-full bg-jade/15 text-jade flex items-center justify-center text-2xl font-bold">
                {draft.name.charAt(0).toUpperCase()}
              </div>
            )}
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              aria-label="Upload logo"
              className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-noir-600 border border-white/[0.1] flex items-center justify-center text-white/70 hover:text-jade hover:border-jade/40 transition-colors"
            >
              <Camera className="w-3.5 h-3.5" />
            </button>
          </div>
          <input ref={fileRef} type="file" accept="image/png,image/jpeg" className="hidden" onChange={(e) => handleFile(e.target.files?.[0])} />

          <div className="flex items-center justify-center md:justify-start gap-2 mt-3">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="text-[11px] font-semibold px-3 py-1.5 rounded-lg border border-white/[0.08] text-white/60 hover:text-white hover:border-white/[0.2] transition-colors"
            >
              Upload
            </button>
            {logoDataUrl && (
              <button
                type="button"
                onClick={() => onLogoChange(null)}
                aria-label="Remove logo"
                className="p-1.5 rounded-lg text-white/35 hover:text-red-400 hover:bg-red-500/10 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <p className="text-[10px] text-white/30 text-center md:text-left mt-2 leading-relaxed">
            Recommended size:<br />512 × 512 PNG
          </p>
          {logoError && <p className="text-[10px] text-amber-400 mt-1.5">{logoError}</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {textField('Organization Name', 'name')}
          {textField('Organization ID', 'orgId', 'text', true)}
          {textField('Workspace URL', 'workspaceUrl')}
          {selectField('Industry', 'industry', INDUSTRY_OPTIONS)}
          {selectField('Company Size', 'companySize', COMPANY_SIZE_OPTIONS)}
          {selectField('Business Type', 'businessType', BUSINESS_TYPE_OPTIONS)}
          {textField('Founded Year', 'foundedYear', 'number')}

          <div className="sm:col-span-2">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-medium text-white/50" htmlFor="org-description">Organization Description</label>
              <span className="text-[10px] text-white/30">{draft.description.length} / 500</span>
            </div>
            <textarea
              id="org-description"
              value={draft.description}
              onChange={(e) => onChange({ description: e.target.value.slice(0, 500) })}
              rows={3}
              maxLength={500}
              className={`${inputBase} resize-none`}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
