import React, { useRef, useState } from 'react';
import { Camera, Trash2 } from 'lucide-react';
import { UserProfile } from '../../../store/userProfileStore';
import { readFileAsDataUrl } from '../../../utils/attachmentRules';

const inputBase =
  'w-full rounded-lg bg-noir-600 text-white/80 text-sm px-3 py-2 focus:outline-none border border-white/[0.08] focus:border-jade transition-colors';
const labelClass = 'text-[11px] font-medium text-white/50 block mb-1.5';

const MAX_AVATAR_BYTES = 5 * 1024 * 1024;

function isImageFile(file: File): boolean {
  return /\.(png|jpe?g)$/i.test(file.name);
}

interface ProfileBasicInfoCardProps {
  draft: UserProfile;
  avatarDataUrl: string | null;
  onChange: (patch: Partial<UserProfile>) => void;
  onAvatarChange: (dataUrl: string | null) => void;
}

export function ProfileBasicInfoCard({ draft, avatarDataUrl, onChange, onAvatarChange }: ProfileBasicInfoCardProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [avatarError, setAvatarError] = useState('');

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setAvatarError('');
    if (!isImageFile(file)) {
      setAvatarError('Only PNG, JPG, or JPEG files are supported.');
      return;
    }
    if (file.size > MAX_AVATAR_BYTES) {
      setAvatarError('Image must be 5MB or smaller.');
      return;
    }
    const dataUrl = await readFileAsDataUrl(file);
    onAvatarChange(dataUrl);
    if (fileRef.current) fileRef.current.value = '';
  };

  const field = (label: string, key: keyof UserProfile, type = 'text') => (
    <div key={key}>
      <label className={labelClass} htmlFor={`profile-${key}`}>{label}</label>
      <input
        id={`profile-${key}`}
        type={type}
        value={draft[key]}
        onChange={(e) => onChange({ [key]: e.target.value } as Partial<UserProfile>)}
        className={inputBase}
      />
    </div>
  );

  return (
    <div className="bg-noir-700 border border-white/[0.06] rounded-xl p-6">
      <h3 className="font-display font-bold text-sm text-white mb-5">Basic Information</h3>

      <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-6">
        <div>
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files?.[0]); }}
            className={`relative w-28 h-28 mx-auto md:mx-0 rounded-full transition-shadow ${dragOver ? 'ring-2 ring-jade ring-offset-2 ring-offset-noir-700' : ''}`}
          >
            {avatarDataUrl ? (
              <img src={avatarDataUrl} alt="" className="w-28 h-28 rounded-full object-cover" />
            ) : (
              <div className="w-28 h-28 rounded-full bg-jade/15 text-jade flex items-center justify-center text-2xl font-bold">
                {draft.firstName.charAt(0)}{draft.lastName.charAt(0)}
              </div>
            )}
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              aria-label="Upload avatar"
              className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-noir-600 border border-white/[0.1] flex items-center justify-center text-white/70 hover:text-jade hover:border-jade/40 transition-colors"
            >
              <Camera className="w-3.5 h-3.5" />
            </button>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/png,image/jpeg"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />

          <div className="flex items-center justify-center md:justify-start gap-2 mt-3">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="text-[11px] font-semibold px-3 py-1.5 rounded-lg border border-white/[0.08] text-white/60 hover:text-white hover:border-white/[0.2] transition-colors"
            >
              Change Avatar
            </button>
            {avatarDataUrl && (
              <button
                type="button"
                onClick={() => onAvatarChange(null)}
                aria-label="Remove avatar"
                className="p-1.5 rounded-lg text-white/35 hover:text-red-400 hover:bg-red-500/10 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <p className="text-[10px] text-white/30 text-center md:text-left mt-2 leading-relaxed">
            PNG, JPG or JPEG. Max size 5MB.<br />Recommended: 400x400px
          </p>
          {avatarError && <p className="text-[10px] text-amber-400 mt-1.5">{avatarError}</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {field('First Name', 'firstName')}
          {field('Last Name', 'lastName')}
          {field('Display Name', 'displayName')}
          {field('Job Title', 'jobTitle')}
          {field('Department', 'department')}
          {field('Employee ID', 'employeeId')}
          {field('Email', 'email', 'email')}
          {field('Phone Number', 'phone')}
          {field('Country', 'country')}
          {field('City', 'city')}
          {field('Time Zone', 'timeZone')}
          {field('Language', 'language')}

          <div className="sm:col-span-2">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-medium text-white/50" htmlFor="profile-bio">Bio</label>
              <span className="text-[10px] text-white/30">{draft.bio.length} / 300</span>
            </div>
            <textarea
              id="profile-bio"
              value={draft.bio}
              onChange={(e) => {
                onChange({ bio: e.target.value.slice(0, 300) });
                e.target.style.height = 'auto';
                e.target.style.height = `${e.target.scrollHeight}px`;
              }}
              rows={3}
              maxLength={300}
              className={`${inputBase} resize-none overflow-hidden`}
              style={{ minHeight: '76px' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
