import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { supabase } from '../lib/supabase'

export interface User {
  id: string
  email: string
  name?: string
  phone?: string
  created_at: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  signUp: (email: string, password: string, name?: string, phone?: string) => Promise<{ success: boolean; error?: string }>
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signOut: () => Promise<void>
  updateProfile: (updates: { name?: string; phone?: string }) => Promise<{ success: boolean; error?: string }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Joriy foydalanuvchini olish
    const getSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            name: session.user.user_metadata?.name,
            phone: session.user.user_metadata?.phone,
            created_at: session.user.created_at
          })
        }
      } catch (error) {
        console.error('Session olishda xatolik:', error)
      } finally {
        setLoading(false)
      }
    }

    getSession()

    // Auth state o'zgarishlarini kuzatish
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            name: session.user.user_metadata?.name,
            phone: session.user.user_metadata?.phone,
            created_at: session.user.created_at
          })
        } else {
          setUser(null)
        }
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signUp = async (email: string, password: string, name?: string, phone?: string) => {
    try {
      setLoading(true)
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            phone
          },
          emailRedirectTo: undefined // Email tasdiqlashni o'chirish
        }
      })

      if (error) {
        return { success: false, error: error.message }
      }

      // Agar foydalanuvchi yaratilgan bo'lsa, uni darhol tasdiqlangan qilish
      if (data.user) {
        // Foydalanuvchini darhol kirishga ruxsat berish
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password
        })
        
        if (signInError) {
          console.error('Auto sign-in error:', signInError)
        }
      }

      return { success: true }
    } catch (error) {
      return { success: false, error: 'Ro\'yxatdan o\'tishda xatolik yuz berdi' }
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true)
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        // Email tasdiqlash xatoligini boshqarish
        if (error.message.includes('Email not confirmed') || error.message.includes('email_not_confirmed')) {
          // Foydalanuvchini tasdiqlangan qilish
          try {
            const { error: updateError } = await supabase.auth.updateUser({
              data: { email_confirmed: true }
            })
            
            if (!updateError) {
              // Qayta kirishga urinish
              const { data: retryData, error: retryError } = await supabase.auth.signInWithPassword({
                email,
                password
              })
              
              if (!retryError) {
                return { success: true }
              }
            }
          } catch (updateError) {
            console.error('Update error:', updateError)
          }
        }
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error) {
      return { success: false, error: 'Kirishda xatolik yuz berdi' }
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      setLoading(true)
      await supabase.auth.signOut()
    } catch (error) {
      console.error('Chiqishda xatolik:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = async (updates: { name?: string; phone?: string }) => {
    try {
      if (!user) {
        return { success: false, error: 'Foydalanuvchi topilmadi' }
      }

      const { error } = await supabase.auth.updateUser({
        data: updates
      })

      if (error) {
        return { success: false, error: error.message }
      }

      // Local state ni yangilash
      setUser(prev => prev ? { ...prev, ...updates } : null)
      return { success: true }
    } catch (error) {
      return { success: false, error: 'Profil yangilashda xatolik' }
    }
  }

  const value: AuthContextType = {
    user,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
