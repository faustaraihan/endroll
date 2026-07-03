import styles from './GenrePill.module.css'

interface GenrePillProps {
  genre: string
}

export function GenrePill({ genre }: GenrePillProps) {
  return (
    <span className={styles.pill}>
      {genre}
    </span>
  )
}
