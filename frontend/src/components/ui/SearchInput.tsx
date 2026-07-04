import React, { useRef } from 'react';
import { X } from 'lucide-react';
import styles from './SearchInput.module.css';

export interface SearchInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value: string;
  onChange: (value: string) => void;
  onClear?: () => void;
  containerClassName?: string;
}

export function SearchInput({
  value,
  onChange,
  onClear,
  containerClassName = '',
  placeholder = 'Search...',
  ...rest
}: SearchInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className={`${styles.searchBar} ${containerClassName}`}>
      <input
        ref={inputRef}
        type="text"
        className={styles.searchInput}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        {...rest}
      />
      {value && (
        <button 
          type="button" 
          className={styles.clearSearchBtn} 
          onClick={() => {
            onChange('');
            if (onClear) onClear();
            inputRef.current?.focus();
          }}
          aria-label="Clear search"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}

