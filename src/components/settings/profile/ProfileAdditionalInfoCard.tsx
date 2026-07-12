import React from 'react';
import { UserProfile } from '../../../store/userProfileStore';

const inputBase =
  'w-full rounded-lg bg-noir-600 text-white/80 text-sm px-3 py-2 focus:outline-none border border-white/[0.08] focus:border-jade transition-colors';
const labelClass = 'text-[11px] font-medium text-white/50 block mb-1.5';

const GENDER_OPTIONS = ['Male', 'Female', 'Non-binary', 'Prefer not to say'];
const WORK_LOCATION_OPTIONS = ['Remote', 'On-site', 'Hybrid'];
const EMPLOYMENT_TYPE_OPTIONS = ['Full-time', 'Part-time', 'Contract', 'Intern'];

interface ProfileAdditionalInfoCardProps {
  draft: UserProfile;
  onChange: (patch: Partial<UserProfile>) => void;
}

export function ProfileAdditionalInfoCard({ draft, onChange }: ProfileAdditionalInfoCardProps) {
  const textField = (label: string, key: keyof UserProfile, type = 'text') => (
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

  const selectField = (label: string, key: keyof UserProfile, options: string[]) => (
    <div key={key}>
      <label className={labelClass} htmlFor={`profile-${key}`}>{label}</label>
      <select
        id={`profile-${key}`}
        value={draft[key]}
        onChange={(e) => onChange({ [key]: e.target.value } as Partial<UserProfile>)}
        className={inputBase}
      >
        {options.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
      </select>
    </div>
  );

  return (
    <div className="bg-noir-700 border border-white/[0.06] rounded-xl p-6">
      <h3 className="font-display font-bold text-sm text-white mb-5">Additional Information</h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {textField('Date of Birth', 'dateOfBirth', 'date')}
        {selectField('Gender', 'gender', GENDER_OPTIONS)}
        {selectField('Work Location', 'workLocation', WORK_LOCATION_OPTIONS)}

        <div className="sm:col-span-2 lg:col-span-3">
          {textField('Address', 'address')}
        </div>

        {textField('Postal Code', 'postalCode')}
        {textField('Emergency Contact', 'emergencyContact')}
        {textField('Manager', 'manager')}
        {selectField('Employment Type', 'employmentType', EMPLOYMENT_TYPE_OPTIONS)}
        {textField('Joining Date', 'joiningDate', 'date')}
        {textField('Office Location', 'officeLocation')}
      </div>
    </div>
  );
}
