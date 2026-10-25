import React from 'react';
import {
  SUPPORTED_LANGUAGES,
  SupportedLanguageCode,
  LanguageDefinition,
} from '@verbaloop/shared';

interface LanguageSelectProps {
  value: SupportedLanguageCode;
  onChange: (code: SupportedLanguageCode) => void;
  label?: string;
  disabled?: boolean;
  className?: string;
}

export const LanguageSelect: React.FC<LanguageSelectProps> = ({
  value,
  onChange,
  label,
  disabled = false,
  className = '',
}) => {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label className="text-xs font-semibold text-charcoal-700 tracking-wide uppercase">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value as SupportedLanguageCode)}
          className="w-full appearance-none bg-white border border-charcoal-200 rounded-lg px-3.5 py-2.5 pr-10 text-sm font-medium text-charcoal-900 shadow-subtle focus:outline-none focus:ring-2 focus:ring-accent-teal/40 focus:border-accent-teal disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer transition-colors"
        >
          {SUPPORTED_LANGUAGES.map((lang: LanguageDefinition) => (
            <option key={lang.code} value={lang.code}>
              {lang.flag} {lang.name} — {lang.nativeName}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-charcoal-500">
          <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
            <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
          </svg>
        </div>
      </div>
    </div>
  );
};
