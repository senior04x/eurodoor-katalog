import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { supabase } from '../lib/supabase'
import { setCurrentUserId } from '../lib/notificationService'

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

  // Mijoz mavjudligini tekshirish funksiyasi
  const checkCustomerExists = async (userId: string) => {
    try {
      console.log('🔍 Checking customer existence for ID:', userId)
      
      const { data, error } = await supabase
        .from('customers')
        .select('id, name, email')
        .eq('id', userId)
        .single()
      
      console.log('📤 Customer existence check response:', { data, error })
      
      if (error || !data) {
        console.log('🚫 Customer not found in database, signing out...')
        console.log('🚫 Error details:', error)
        await supabase.auth.signOut()
        setUser(null)
        return false
      }
      
      console.log('✅ Customer found in database:', data)
      return true
    } catch (error) {
      console.error('❌ Error checking customer existence:', error)
      return false
    }
  }

  useEffect(() => {
    // Joriy foydalanuvchini olish
    const getSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user) {
          // Mijoz mavjudligini tekshirish (faqat bir marta)
          console.log('🔍 Initial session check for user:', session.user.id)
          const customerExists = await checkCustomerExists(session.user.id)
          if (customerExists) {
            const userData = {
              id: session.user.id,
              email: session.user.email || '',
              name: session.user.user_metadata?.name,
              phone: session.user.user_metadata?.phone,
              created_at: session.user.created_at
            };
            setUser(userData);
            // Save user ID for notifications
            setCurrentUserId(session.user.id);
          }
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
        console.log('🔄 Auth state change:', event, session?.user?.id)
        
        if (event === 'SIGNED_OUT') {
          console.log('🚪 User signed out, clearing user state')
          setUser(null)
          // Clear user ID for notifications
          setCurrentUserId('');
          setLoading(false)
          return
        }
        
        if (session?.user) {
          // Mijoz mavjudligini tekshirish (faqat SIGNED_IN event uchun)
          if (event === 'SIGNED_IN') {
            console.log('🔍 Auth state change - checking customer for:', session.user.id)
            const customerExists = await checkCustomerExists(session.user.id)
            if (customerExists) {
              const userData = {
                id: session.user.id,
                email: session.user.email || '',
                name: session.user.user_metadata?.name,
                phone: session.user.user_metadata?.phone,
                created_at: session.user.created_at
              };
              setUser(userData);
              // Save user ID for notifications
              setCurrentUserId(session.user.id);
            }
          } else {
            // Boshqa event'lar uchun to'g'ridan-to'g'ri setUser
            const userData = {
              id: session.user.id,
              email: session.user.email || '',
              name: session.user.user_metadata?.name,
              phone: session.user.user_metadata?.phone,
              created_at: session.user.created_at
            };
            setUser(userData);
            // Save user ID for notifications
            setCurrentUserId(session.user.id);
          }
        } else {
          setUser(null)
        }
        setLoading(false)
      }
    )

    // Real-time subscription for customer deletion
    const customerSubscription = supabase
      .channel('customer-deletion')
      .on('postgres_changes', 
        { event: 'DELETE', schema: 'public', table: 'customers' },
        async (payload) => {
          console.log('🗑️ Customer deleted in real-time:', payload.old)
          // Agar o'chirilgan mijoz hozir tizimga kirgan bo'lsa, uni chiqarish
          if (user && user.id === payload.old.id) {
            console.log('🚫 Current user was deleted, signing out...')
            await supabase.auth.signOut()
            setUser(null)
          }
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
      customerSubscription.unsubscribe()
    }
  }, []) // Empty dependency array to prevent infinite loop

  const signUp = async (email: string, password: string, name?: string, phone?: string) => {
    try {
      setLoading(true)
      console.log('🚀 Starting signup process for:', { email, name, phone })
      
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

      console.log('📤 Supabase signup response:', { data, error })

      if (error) {
        console.error('❌ Signup error:', error)
        
        // Agar mijoz allaqachon mavjud bo'lsa, uni customers jadvaliga qo'shish
        if (error.message.includes('already registered') || error.message.includes('User already registered')) {
          console.log('🔄 User already exists, syncing with customers table...')
          
          // Mavjud foydalanuvchini topish
          console.log('🔐 Attempting to sign in existing user...')
          const { data: existingUser, error: getUserError } = await supabase.auth.signInWithPassword({
            email,
            password
          })
          
          console.log('📤 Sign in response:', { existingUser, getUserError })
          
          if (existingUser?.user) {
            console.log('👤 Found existing user:', existingUser.user.id)
            
            // Mijoz ma'lumotlarini tayyorlash
            const customerData = {
              id: existingUser.user.id,
              name: name || existingUser.user.user_metadata?.name || '',
              phone: phone || existingUser.user.user_metadata?.phone || '',
              email: email
            }
            console.log('📋 Customer data to sync:', customerData)
            
            // Avval mavjudligini tekshirish (timeout bilan)
            console.log('🔍 Checking if customer already exists in customers table...')
            
            // Timeout qo'shamiz
            const checkPromise = supabase
              .from('customers')
              .select('id')
              .eq('id', existingUser.user.id)
              .single()
            
            const timeoutPromise = new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Customer check timeout')), 10000)
            )
            
            const { data: existingCustomer, error: checkError } = await Promise.race([
              checkPromise,
              timeoutPromise
            ]) as any
            
            console.log('📤 Customer existence check:', { existingCustomer, checkError })
            
            if (checkError && checkError.code === 'PGRST116') {
              // Mijoz mavjud emas, insert qilish
              console.log('📝 Customer not found, inserting new customer...')
              const { data: insertResult, error: insertError } = await supabase
                .from('customers')
                .insert([customerData])
                .select()
              
              console.log('📤 Insert response:', { insertResult, insertError })
              
              if (insertError) {
                console.error('❌ Insert failed:', insertError)
                setLoading(false)
                return { success: false, error: 'Mijoz ma\'lumotlarini saqlashda xatolik' }
              } else {
                console.log('✅ Customer inserted successfully:', insertResult)
                setLoading(false)
                return { success: true }
              }
            } else if (existingCustomer) {
              // Mijoz mavjud, update qilish
              console.log('📝 Customer exists, updating customer data...')
              const { data: updateResult, error: updateError } = await supabase
                .from('customers')
                .update({
                  name: customerData.name,
                  phone: customerData.phone,
                  email: customerData.email
                })
                .eq('id', existingUser.user.id)
                .select()
              
              console.log('📤 Update response:', { updateResult, updateError })
              
              if (updateError) {
                console.error('❌ Update failed:', updateError)
                setLoading(false)
                return { success: false, error: 'Mijoz ma\'lumotlarini yangilashda xatolik' }
              } else {
                console.log('✅ Customer updated successfully:', updateResult)
                setLoading(false)
                return { success: true }
              }
            } else if (checkError && checkError.message === 'Customer check timeout') {
              console.error('❌ Customer check timeout, proceeding with insert...')
              // Timeout bo'lsa, to'g'ridan-to'g'ri insert qilish
              console.log('📝 Timeout occurred, inserting customer directly...')
              const { data: insertResult, error: insertError } = await supabase
                .from('customers')
                .insert([customerData])
                .select()
              
              console.log('📤 Direct insert response:', { insertResult, insertError })
              
              if (insertError) {
                console.error('❌ Direct insert failed:', insertError)
                setLoading(false)
                return { success: false, error: 'Mijoz ma\'lumotlarini saqlashda xatolik' }
              } else {
                console.log('✅ Customer inserted successfully after timeout:', insertResult)
                setLoading(false)
                return { success: true }
              }
            } else {
              console.error('❌ Unexpected error checking customer existence:', checkError)
              // Fallback: to'g'ridan-to'g'ri insert qilish
              console.log('🔄 Fallback: inserting customer directly...')
              const { data: fallbackResult, error: fallbackError } = await supabase
                .from('customers')
                .insert([customerData])
                .select()
              
              console.log('📤 Fallback insert response:', { fallbackResult, fallbackError })
              
              if (fallbackError) {
                console.error('❌ Fallback insert also failed:', fallbackError)
                setLoading(false)
                return { success: false, error: 'Mijoz ma\'lumotlarini saqlashda xatolik' }
              } else {
                console.log('✅ Customer inserted via fallback:', fallbackResult)
                setLoading(false)
                return { success: true }
              }
            }
          } else {
            console.error('❌ Could not sign in existing user:', getUserError)
            setLoading(false)
            return { success: false, error: 'Foydalanuvchi mavjud, lekin parol noto\'g\'ri' }
          }
        }
        
        console.log('❌ Signup failed, setting loading to false')
        setLoading(false)
        return { success: false, error: error.message }
      }

      // Agar foydalanuvchi yaratilgan bo'lsa, uni darhol tasdiqlangan qilish
      if (data.user) {
        console.log('👤 User created successfully:', data.user.id)
        
        // Customers jadvaliga mijoz qo'shish
        try {
          console.log('📝 Adding customer to customers table...')
          const customerData = {
            id: data.user.id,
            name: name || '',
            phone: phone || '',
            email: email
          }
          console.log('📋 Customer data to insert:', customerData)
          
          const { data: customerResult, error: customerError } = await supabase
            .from('customers')
            .insert([customerData])
            .select()
          
          console.log('📤 Customer insert response:', { customerResult, customerError })
          
          if (customerError) {
            console.error('❌ Customer creation error:', customerError)
            console.error('❌ Error details:', {
              message: customerError.message,
              code: customerError.code,
              details: customerError.details,
              hint: customerError.hint
            })
            
            // Fallback: upsert ishlatish
            console.log('🔄 Attempting fallback with upsert...')
            const { data: upsertResult, error: upsertError } = await supabase
              .from('customers')
              .upsert([customerData], { onConflict: 'id' })
              .select()
            
            if (upsertError) {
              console.error('❌ Upsert also failed:', upsertError)
            } else {
              console.log('✅ Customer upserted successfully:', upsertResult)
            }
          } else {
            console.log('✅ Customer added to customers table successfully:', customerResult)
          }
        } catch (err) {
          console.error('❌ Error adding customer to table:', err)
        }

        // Foydalanuvchini darhol kirishga ruxsat berish
        console.log('🔐 Attempting auto sign-in...')
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password
        })
        
        console.log('📤 Auto sign-in response:', { signInData, signInError })
        
        if (signInError) {
          console.error('❌ Auto sign-in error:', signInError)
        } else {
          console.log('✅ User auto-signed in successfully')
        }
      }

      return { success: true }
    } catch (error: any) {
      console.error('❌ Signup error:', error)
      return { success: false, error: error.message || 'Ro\'yxatdan o\'tishda xatolik yuz berdi' }
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
      console.log('🚪 Signing out user...')
      await supabase.auth.signOut()
      setUser(null) // User state'ni tozalash
      // Clear user ID for notifications
      setCurrentUserId('');
      console.log('✅ User signed out successfully')
    } catch (error) {
      console.error('❌ Chiqishda xatolik:', error)
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
