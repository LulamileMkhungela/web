import type { ReactNode } from 'react';

/**
 * Standard form row: label above, control, then hint or error text.
 * Every field on the site uses this wrapper so labels, heights and spacing line up.
 */
export function Field({
  id,
  label,
  hint,
  error,
  children,
  className = '',
  tone = 'light',
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
  className?: string;
  tone?: 'light' | 'dark';
}) {
  return (
    <div className={`flex flex-col ${className}`}>
      <label htmlFor={id} className={tone === 'dark' ? 'label label-dark' : 'label'}>
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="error-text" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className={tone === 'dark' ? 'hint hint-dark' : 'hint'}>
          {hint}
        </p>
      ) : null}
    </div>
  );
}
