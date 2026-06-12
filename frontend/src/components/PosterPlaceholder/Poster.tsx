import { useState } from 'react'
import { PosterPlaceholder } from './PosterPlaceholder'

interface PosterProps {
  /** Judul — dipakai placeholder bila gambar tidak ada/gagal dimuat */
  title: string
  src?: string
  alt: string
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

/**
 * Poster dengan fallback otomatis: jika src kosong ATAU gagal dimuat,
 * tampilkan PosterPlaceholder (inisial + warna hash) sesuai PRD.
 */
export function Poster({ title, src, alt, className, size = 'md' }: PosterProps) {
  const [imgError, setImgError] = useState(false)

  if (!src || imgError) {
    return <PosterPlaceholder title={title} size={size} className={className} />
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading="lazy"
      onError={() => setImgError(true)}
    />
  )
}
