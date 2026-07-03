import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import styles from './SectionHeader.module.css';

export interface SectionHeaderProps {
  title: React.ReactNode;
  eyebrow?: React.ReactNode;
  linkTo?: string;
  linkLabel?: React.ReactNode;
  badge?: React.ReactNode;
  rightElement?: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
}

export function SectionHeader({
  title,
  eyebrow,
  linkTo,
  linkLabel,
  badge,
  rightElement,
  className = '',
  action,
}: SectionHeaderProps) {
  return (
    <div className={`${styles.sectionHeader} ${className}`}>
      <div className={styles.titleGroup}>
        {eyebrow && <p className="eyebrow" style={{ marginBottom: 5 }}>{eyebrow}</p>}
        <div className={styles.titleRow}>
          <h2 className={styles.sectionTitle}>{title}</h2>
          {badge && <span className={styles.sectionBadge}>{badge}</span>}
          {action && <div className={styles.action}>{action}</div>}
        </div>
      </div>
      
      {rightElement ? (
        <div className={styles.rightElement}>
          {rightElement}
        </div>
      ) : linkTo && linkLabel ? (
        <Link to={linkTo} className={styles.seeAll}>
          {linkLabel} <ArrowRight size={13} />
        </Link>
      ) : null}
    </div>
  );
}
