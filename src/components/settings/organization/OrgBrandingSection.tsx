import React, { useRef } from 'react';
import { Image as ImageIcon, Trash2 } from 'lucide-react';
import { OrgBranding } from '../../../store/organizationStore';
import { readFileAsDataUrl } from '../../../utils/attachmentRules';
import { ToggleSwitch } from '../../common/ToggleSwitch';

const labelClass = 'text-[11px] font-medium text-white/50 block mb-1.5';
const MAX_ASSET_BYTES = 5 * 1024 * 1024;

interface AssetUploadSlotProps {
  label: string;
  dataUrl: string | null;
  onChange: (dataUrl: string | null) => void;
  wide?: boolean;
}

function AssetUploadSlot({ label, dataUrl, onChange, wide }: AssetUploadSlotProps) {
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    if (!/\.(png|jpe?g|svg)$/i.test(file.name)) return;
    if (file.size > MAX_ASSET_BYTES) return;
    const result = await readFileAsDataUrl(file);
    onChange(result);
    if (fileRef.current) fileRef.current.value = '';
  };

  const previewClass = wide ? 'w-20 h-10' : 'w-10 h-10';

  return (
    <div>
      <label className={labelClass}>{label}</label>
      <div className="flex items-center gap-3 bg-noir-600 border border-white/[0.08] rounded-lg p-3">
        {dataUrl ? (
          <img src={dataUrl} alt="" className={`${previewClass} rounded object-cover shrink-0`} />
        ) : (
          <div className={`${previewClass} rounded bg-white/[0.05] flex items-center justify-center text-white/20 shrink-0`}>
            <ImageIcon className="w-4 h-4" />
          </div>
        )}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="text-[11px] font-semibold px-2.5 py-1.5 rounded-lg border border-white/[0.08] text-white/60 hover:text-white hover:border-white/[0.2] transition-colors"
          >
            Upload
          </button>
          {dataUrl && (
            <button
              type="button"
              onClick={() => onChange(null)}
              aria-label={`Remove ${label}`}
              className="p-1.5 rounded-lg text-white/35 hover:text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
      <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/svg+xml" className="hidden" onChange={(e) => handleFile(e.target.files?.[0])} />
    </div>
  );
}

interface OrgBrandingSectionProps {
  draft: OrgBranding;
  onChange: (patch: Partial<OrgBranding>) => void;
}

export function OrgBrandingSection({ draft, onChange }: OrgBrandingSectionProps) {
  return (
    <div className="bg-noir-700 border border-white/[0.06] rounded-xl p-6">
      <h3 className="font-display font-bold text-sm text-white mb-5">Branding</h3>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Primary Brand Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={draft.primaryColor}
                  onChange={(e) => onChange({ primaryColor: e.target.value })}
                  className="w-9 h-9 rounded-lg border border-white/[0.08] bg-noir-600 cursor-pointer"
                  aria-label="Primary brand color"
                />
                <span className="text-xs text-white/50 font-mono">{draft.primaryColor}</span>
              </div>
            </div>
            <div>
              <label className={labelClass}>Accent Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={draft.accentColor}
                  onChange={(e) => onChange({ accentColor: e.target.value })}
                  className="w-9 h-9 rounded-lg border border-white/[0.08] bg-noir-600 cursor-pointer"
                  aria-label="Accent color"
                />
                <span className="text-xs text-white/50 font-mono">{draft.accentColor}</span>
              </div>
            </div>
          </div>

          <AssetUploadSlot label="Logo Upload" dataUrl={draft.logoDataUrl} onChange={(v) => onChange({ logoDataUrl: v })} />
          <AssetUploadSlot label="Favicon Upload" dataUrl={draft.faviconDataUrl} onChange={(v) => onChange({ faviconDataUrl: v })} />
          <AssetUploadSlot label="Organization Banner" dataUrl={draft.bannerDataUrl} onChange={(v) => onChange({ bannerDataUrl: v })} wide />

          <div className="space-y-3 pt-2 border-t border-white/[0.06]">
            <ToggleSwitch label="Dark Mode Default" checked={draft.darkModeDefault} onChange={(v) => onChange({ darkModeDefault: v })} />
            <ToggleSwitch label="Light Mode Support" checked={draft.lightModeSupport} onChange={(v) => onChange({ lightModeSupport: v })} />
          </div>
        </div>

        <div>
          <p className={labelClass}>Live Preview</p>
          <div className="rounded-xl border border-white/[0.08] overflow-hidden bg-noir-800">
            {draft.bannerDataUrl && <img src={draft.bannerDataUrl} alt="" className="w-full h-20 object-cover" />}
            <div className="p-4 flex items-center gap-3">
              {draft.logoDataUrl ? (
                <img src={draft.logoDataUrl} alt="" className="w-10 h-10 rounded-full object-cover shrink-0" />
              ) : (
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shrink-0"
                  style={{ background: draft.primaryColor }}
                >
                  T
                </div>
              )}
              <div className="min-w-0">
                <p className="text-sm font-bold text-white truncate">TaskMate Solutions</p>
                <span
                  className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full mt-1"
                  style={{ background: `${draft.accentColor}26`, color: draft.accentColor }}
                >
                  Preview Badge
                </span>
              </div>
            </div>
            <div className="px-4 pb-4">
              <button type="button" className="text-xs font-bold px-3 py-1.5 rounded-lg text-noir-900" style={{ background: draft.primaryColor }}>
                Sample Button
              </button>
            </div>
          </div>
          <p className="text-[10px] text-white/25 mt-2 leading-relaxed">
            This preview is for reference only — it doesn't change TaskMate's actual interface.
          </p>
        </div>
      </div>
    </div>
  );
}
