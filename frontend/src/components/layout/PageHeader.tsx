import React from 'react';
import styles from './PageHeader.module.css';

export interface PageHeaderProps {
  title: React.ReactNode;
  eyebrow?: React.ReactNode;
  description?: React.ReactNode;
  rightElement?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  eyebrow,
  description,
  rightElement,
  className = '',
}: PageHeaderProps) {
  return (
    <header className={`${styles.header} ${className}`}>
      <div className={styles.headerText}>
        {eyebrow && <p className="eyebrow" style={{ marginBottom: 7 }}>{eyebrow}</p>}
        <h1 className={`${styles.pageTitle} pageTitle`}>{title}</h1>
        {description && <p className={styles.pageSub}>{description}</p>}
      </div>
      {rightElement && (
        <div className={styles.rightElement}>
          {rightElement}
        </div>
      )}
    </header>
  );
}
