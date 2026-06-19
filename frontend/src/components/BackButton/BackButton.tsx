import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronLeft } from 'lucide-react';
import styles from './BackButton.module.css';

export interface BackButtonProps {
  label?: string;
  onClick?: () => void;
  icon?: 'arrow' | 'chevron';
  className?: string;
}

export function BackButton({
  label = 'Back',
  onClick,
  icon = 'chevron',
  className = '',
}: BackButtonProps) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onClick) {
      onClick();
    } else {
      navigate(-1);
    }
  };

  const IconComponent = icon === 'arrow' ? ArrowLeft : ChevronLeft;

  return (
    <button
      type="button"
      className={`${styles.backBtn} ${className}`}
      onClick={handleBack}
      aria-label={`Go back${label !== 'Back' ? `: ${label}` : ''}`}
    >
      <span className={styles.backBtnIcon}>
        <IconComponent size={15} strokeWidth={2} />
      </span>
      <span className={styles.backBtnLabel}>{label}</span>
    </button>
  );
}
