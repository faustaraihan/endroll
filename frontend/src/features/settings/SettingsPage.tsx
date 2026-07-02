import React, { useState } from 'react'
import { useToast } from '@/contexts'
import { useStore } from '@/store/useStore'
import { PageHeader } from '@/components'
import styles from './SettingsPage.module.css'

export default function SettingsPage() {
  const user = useStore(state => state.user)
  const setUser = useStore(state => state.setUser)
  const { addToast } = useToast()
  const logout = useStore(state => state.logout)

  // Local state for Preferences
  const [theme, setTheme] = useState(user.preferences.theme || 'dark')
  const [streakReminders, setStreakReminders] = useState(true) // Added dummy state since it wasn't in original types, but user wants it in UI
  const [ratingStep, setRatingStep] = useState(user.preferences.rating_step || 0.5)

  const handleEditProfile = () => {
    addToast('Profile editing is not available in this mockup view.', 'info')
  }

  const handleToggleTheme = (newTheme: 'dark' | 'light') => {
    setTheme(newTheme)
    setUser(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        theme: newTheme
      }
    }))
  }

  const handleToggleStreakReminders = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStreakReminders(e.target.checked)
    // Could save to user preferences if added to type definition later
  }

  const handleSetRatingStep = (step: number) => {
    setRatingStep(step)
    setUser(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        rating_step: step
      }
    }))
  }

  return (
    <div className={styles.page}>
      {/* ── Header ── */}
      <PageHeader
        eyebrow="Account"
        title="Settings"
      />

      {/* ── Profile Section ── */}
      <section className={styles.section}>
        <h2 className={styles.sectionHeader}>Profile</h2>
        
        <div className={styles.row}>
          <div className={styles.profileInfo}>
            <div className={styles.avatar}>
              {user.username ? user.username.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className={styles.profileText}>
              <div className={styles.profileName}>{user.username || 'User'}</div>
              <div className={styles.profileEmail}>{user.email || 'user@example.com'}</div>
            </div>
          </div>
          <button className={styles.editBtn} onClick={handleEditProfile}>
            Edit
          </button>
        </div>
      </section>

      {/* ── Preferences Section ── */}
      <section className={styles.section} style={{ marginTop: '24px' }}>
        <h2 className={styles.sectionHeader}>Preferences</h2>
        
        {/* Appearance */}
        <div className={styles.row}>
          <div className={styles.rowLeft}>
            <div className={styles.rowTitle}>Appearance</div>
            <div className={styles.rowSub}>Light or dark interface</div>
          </div>
          <div className={styles.segmentedControl}>
            <button 
              className={`${styles.segmentBtn} ${theme === 'dark' ? styles.segmentBtnActive : ''}`}
              onClick={() => handleToggleTheme('dark')}
            >
              Dark
            </button>
            <button 
              className={`${styles.segmentBtn} ${theme === 'light' ? styles.segmentBtnActive : ''}`}
              onClick={() => handleToggleTheme('light')}
            >
              Light
            </button>
          </div>
        </div>

        {/* Streak reminders */}
        <div className={styles.row}>
          <div className={styles.rowLeft}>
            <div className={styles.rowTitle}>Streak reminders</div>
            <div className={styles.rowSub}>A nudge if your week is about to lapse</div>
          </div>
          <label className={styles.switch}>
            <input 
              type="checkbox" 
              checked={streakReminders} 
              onChange={handleToggleStreakReminders} 
            />
            <span className={styles.slider}></span>
          </label>
        </div>

        {/* Rating step */}
        <div className={styles.row}>
          <div className={styles.rowLeft}>
            <div className={styles.rowTitle}>Rating step</div>
            <div className={styles.rowSub}>Granularity of the rating slider</div>
          </div>
          <div className={styles.segmentedControl}>
            <button 
              className={`${styles.segmentBtn} ${ratingStep === 0.1 ? styles.segmentBtnActive : ''}`}
              onClick={() => handleSetRatingStep(0.1)}
            >
              0.1
            </button>
            <button 
              className={`${styles.segmentBtn} ${ratingStep === 0.5 ? styles.segmentBtnActive : ''}`}
              onClick={() => handleSetRatingStep(0.5)}
            >
              0.5
            </button>
            <button 
              className={`${styles.segmentBtn} ${ratingStep === 1.0 ? styles.segmentBtnActive : ''}`}
              onClick={() => handleSetRatingStep(1.0)}
            >
              1.0
            </button>
          </div>
        </div>
      </section>
      
      {/* ── Account Actions ── */}
      <section className={styles.section} style={{ marginTop: '24px' }}>
        <h2 className={styles.sectionHeader}>Account Actions</h2>
        
        <div className={styles.row}>
          <div className={styles.rowLeft}>
            <div className={styles.rowTitle}>Log out of Endroll</div>
            <div className={styles.rowSub}>Clear session on this device</div>
          </div>
          <button className={styles.dangerBtn} onClick={logout}>
            Logout
          </button>
        </div>
      </section>
      
    </div>
  )
}
