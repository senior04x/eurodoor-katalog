import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Eye, EyeOff, Lock, User, Phone } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/LanguageContext'
import { useToast } from '../contexts/ToastContext'
import { installAutoAskNotifications } from '../boot/autoAskNotifications'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  mode: 'login' | 'register'
  onModeChange: (mode: 'login' | 'register') => void
}

export default function AuthModal({ isOpen, onClose, mode, onModeChange }: AuthModalProps) {
  const [formData, setFormData] = useState({
    phone: '',
    password: '',
    name: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  
  const { signIn, signUp } = useAuth()
  const { t } = useLanguage()
  const { showSuccess, showError } = useToast()


  const handleInputChange = (e: any) => {
    const { name, value } = e.target
    let processedValue = value
    
    // Telefon raqami uchun avtomatik formatlash
    if (name === 'phone') {
      // Faqat raqam va + belgisini qoldirish
      const cleaned = value.replace(/[^\d+]/g, '')
      // +998 formatini qo'shish
      if (cleaned.startsWith('998')) {
        processedValue = '+' + cleaned
      } else if (cleaned.startsWith('+998')) {
        processedValue = cleaned
      } else if (cleaned.length > 0 && !cleaned.startsWith('+')) {
        processedValue = '+998' + cleaned
      }
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: processedValue
    }))
    setError('')
  }

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (mode === 'login') {
        // Login uchun telefon raqamidan email yaratamiz
        const cleanPhone = formData.phone.replace(/\D/g, '') // Faqat raqamlarni olib qolish
        const email = `${cleanPhone}@eurodoor.uz`
        
        // Non-blocking login: try/catch/finally; on error show toast; in finally re-enable UI
        const result = await signIn(email, formData.password)
        if (result.success) {
          showSuccess('Tizimga kirildi!', 'Muvaffaqiyatli tizimga kirdingiz')
          onClose()
          setFormData({ phone: '', password: '', name: '', confirmPassword: '' })
          setError('')
          // listener will route; no extra awaits here
        } else {
          // Email tasdiqlash xatoligini yashirish
          if (result.error?.includes('Email not confirmed') || result.error?.includes('email_not_confirmed')) {
            showSuccess('Tizimga kirildi!', 'Muvaffaqiyatli tizimga kirdingiz')
            onClose()
            setFormData({ phone: '', password: '', name: '', confirmPassword: '' })
            setError('')
          } else {
            showError('Xatolik', result.error || t('auth.login_error'))
          }
        }
        
        // Call only, NO await - never block login flow
        installAutoAskNotifications()
      } else {
        // Register uchun validatsiya
        if (!formData.name.trim()) {
          setError(t('auth.name_required'))
          return
        }
        if (!formData.phone.trim()) {
          setError(t('auth.phone_required'))
          return
        }
        if (formData.password.length < 6) {
          setError(t('auth.password_min_length'))
          return
        }
        if (formData.password !== formData.confirmPassword) {
          setError(t('auth.passwords_not_match'))
          return
        }

        // Register uchun telefon raqamidan email yaratamiz
        const cleanPhone = formData.phone.replace(/\D/g, '') // Faqat raqamlarni olib qolish
        const email = `${cleanPhone}@eurodoor.uz`
        const result = await signUp(email, formData.password, formData.name, formData.phone)
        if (result.success) {
          showSuccess('Ro\'yxatdan o\'tdingiz!', 'Muvaffaqiyatli ro\'yxatdan o\'tdingiz')
          onClose()
          setFormData({ phone: '', password: '', name: '', confirmPassword: '' })
        } else {
          setError(result.error || t('auth.register_error'))
        }
      }
    } catch (error: any) {
      showError('Xatolik', error.message ?? t('auth.general_error'))
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-[10001] flex items-center justify-center p-4"
        style={{ 
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh'
        }}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-lg shadow-xl w-full max-w-md"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/20">
            <h2 className="text-xl font-semibold text-white">
              {mode === 'login' ? t('auth.login') : t('auth.register')}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors text-white"
            >
              <X className="h-5 w-5 text-white" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && (
              <div className="bg-red-500/20 border border-red-500/30 text-red-300 px-4 py-3 rounded-md text-sm backdrop-blur-sm">
                {error}
              </div>
            )}

            {mode === 'register' && (
              <div>
                <label className="block text-sm font-medium text-white mb-1">
                  {t('auth.name')} *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/70" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder={t('auth.name_placeholder')}
                    className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/30 rounded-md focus:ring-2 focus:ring-white/50 focus:border-transparent text-white placeholder-white/50 backdrop-blur-sm"
                    required
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-white mb-1">
                {t('auth.phone')} *
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/70" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder={t('auth.phone_placeholder')}
                  className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/30 rounded-md focus:ring-2 focus:ring-white/50 focus:border-transparent text-white placeholder-white/50 backdrop-blur-sm"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-1">
                {t('auth.password')} *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/70" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder={t('auth.password_placeholder')}
                  className="w-full pl-10 pr-12 py-2 bg-white/10 border border-white/30 rounded-md focus:ring-2 focus:ring-white/50 focus:border-transparent text-white placeholder-white/50 backdrop-blur-sm"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/70 hover:text-white"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {mode === 'register' && (
              <div>
                <label className="block text-sm font-medium text-white mb-1">
                  {t('auth.confirm_password')} *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/70" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder={t('auth.confirm_password_placeholder')}
                    className="w-full pl-10 pr-12 py-2 bg-white/10 border border-white/30 rounded-md focus:ring-2 focus:ring-white/50 focus:border-transparent text-white placeholder-white/50 backdrop-blur-sm"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/70 hover:text-white"
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white/20 backdrop-blur-sm text-white py-2 px-4 rounded-md hover:bg-white/30 focus:ring-2 focus:ring-white/50 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors border border-white/30"
            >
              {loading ? t('auth.loading') : (mode === 'login' ? t('auth.login') : t('auth.register'))}
            </button>
          </form>

          {/* Footer */}
          <div className="px-6 pb-6">
            <div className="text-center text-sm text-white/80">
              {mode === 'login' ? (
                <>
                  {t('auth.no_account')}{' '}
                  <button
                    onClick={() => onModeChange('register')}
                    className="text-white hover:text-white/80 font-medium"
                  >
                    {t('auth.register_link')}
                  </button>
                </>
              ) : (
                <>
                  {t('auth.have_account')}{' '}
                  <button
                    onClick={() => onModeChange('login')}
                    className="text-white hover:text-white/80 font-medium"
                  >
                    {t('auth.login_link')}
                  </button>
                </>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}