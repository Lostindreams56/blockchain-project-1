import React from 'react';

interface RetroInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  mono?: boolean;
  prefixElement?: React.ReactNode;
  suffixElement?: React.ReactNode;
}

export const RetroInput: React.FC<RetroInputProps> = ({
  label,
  error,
  mono = false,
  prefixElement,
  suffixElement,
  className = '',
  id,
  ...props
}) => {
  const inputId = id || (label ? `input-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

  return (
    <div className="flex flex-col gap-1 w-full">
      {label && (
        <label htmlFor={inputId} className="win95-font text-[11px] font-semibold text-black">
          {label}
        </label>
      )}
      <div className={`relative flex items-center win95-field-sunken bg-white px-1.5 py-1 ${className}`}>
        {prefixElement && (
          <span className="shrink-0 mr-1.5 text-[11px] text-[#404040] select-none font-mono font-bold">
            {prefixElement}
          </span>
        )}
        <input
          id={inputId}
          className={`w-full bg-transparent text-[12px] text-black outline-none border-none p-0 ${
            mono ? 'win95-mono' : 'win95-font'
          }`}
          {...props}
        />
        {suffixElement && <div className="shrink-0 ml-1.5">{suffixElement}</div>}
      </div>
      {error && (
        <span className="win95-font text-[11px] text-[#AA0000] font-semibold mt-0.5">
          {error}
        </span>
      )}
    </div>
  );
};
