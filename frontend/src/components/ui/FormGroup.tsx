import React from 'react';
import styles from './FormGroup.module.css';

export interface FormGroupProps {
  label?: string;
  htmlFor?: string;
  hint?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function FormGroup({
  label,
  htmlFor,
  hint,
  children,
  className = '',
}: FormGroupProps) {
  return (
    <div className={`${styles.formGroup} ${className}`}>
      {label && (
        <label htmlFor={htmlFor} className="input-label">
          {label} {hint && <span className={styles.labelHint}>{hint}</span>}
        </label>
      )}
      {children}
    </div>
  );
}
