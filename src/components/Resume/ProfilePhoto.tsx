import { useState } from 'react'
import { motion } from 'framer-motion'

const PHOTO_ANIMATION_DURATION = 0.8

const SIZE_CLASSES: Record<'sm' | 'lg', string> = {
  sm: 'w-20 h-20',
  lg: 'w-32 h-32',
}

const EMOJI_SIZE_CLASSES: Record<'sm' | 'lg', string> = {
  sm: 'text-2xl',
  lg: 'text-4xl',
}

interface ProfilePhotoProps {
  photo?: string
  name: string
  emoji?: string
  size?: 'sm' | 'lg'
  className?: string
}

export function ProfilePhoto({ photo, name, emoji, size = 'lg', className }: ProfilePhotoProps) {
  const [isSpinning, setIsSpinning] = useState(false)
  const [hasError, setHasError] = useState(false)

  const handleFlip = () => {
    if (isSpinning) return
    setIsSpinning(true)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleFlip()
    }
  }

  const sizeClass = SIZE_CLASSES[size]
  const emojiSizeClass = EMOJI_SIZE_CLASSES[size]

  if (!photo || hasError) {
    return (
      <div className={className}>
        <div
          className={`${sizeClass} shrink-0 rounded-full bg-gradient-to-br from-resume-primary to-resume-primary-light flex items-center justify-center border-4 border-resume-bg/30 shadow-lg`}
        >
          <span className={emojiSizeClass}>{emoji || '👨‍💻'}</span>
        </div>
      </div>
    )
  }

  return (
    <div className={className} style={{ perspective: '300px' }}>
      <motion.div
        onClick={handleFlip}
        onKeyDown={handleKeyDown}
        onAnimationComplete={() => setIsSpinning(false)}
        animate={{ rotateY: isSpinning ? 360 : 0 }}
        transition={{ duration: PHOTO_ANIMATION_DURATION, ease: 'easeInOut' }}
        className={`relative ${sizeClass} shrink-0 cursor-pointer`}
        style={{ transformStyle: 'preserve-3d' }}
        role="button"
        tabIndex={0}
        aria-label={`Photo of ${name} — click to flip`}
      >
        <div
          className="absolute inset-0 rounded-full overflow-hidden border-4 border-resume-bg/30 shadow-lg"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <img
            src={photo}
            alt={`Profile photo of ${name}`}
            className="object-cover w-full h-full"
            loading="lazy"
            onError={() => setHasError(true)}
          />
        </div>
        <div
          className="absolute inset-0 rounded-full border-4 border-resume-bg/30 shadow-lg bg-gradient-to-br from-resume-primary to-resume-primary-light flex items-center justify-center"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          <span className={emojiSizeClass}>{emoji || '👨‍💻'}</span>
        </div>
      </motion.div>
    </div>
  )
}
