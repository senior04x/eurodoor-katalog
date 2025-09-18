import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { supabase } from '../lib/supabase'
import { customerMigrationApi } from '../lib/customerMigration'
import { setCurrentUserId, ensurePushSubscription } from '../lib/notificationService'

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
      
      const customerResult = await customerMigrationApi.getCustomerData(userId)
      
      console.log('📤 Customer existence check response:', customerResult)
      
      if (!customerResult.data) {
        console.log('🚫 Customer not found in any system, signing out...')
        await supabase.auth.signOut()
        setUser(null)
        return false
      }
      
      console.log('✅ Customer found in database:', customerResult.data)
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
        console.log('🔄 AuthContext: Starting session check...')
        setLoading(true)
        
        const { data: { session } } = await supabase.auth.getSession()
        console.log('📤 AuthContext: Session data received:', !!session?.user)
        
        if (session?.user) {
          // Mijoz mavjudligini tekshirish (faqat bir marta)
          console.log('🔍 Initial session check for user:', session.user.id)
          const customerExists = await checkCustomerExists(session.user.id)
          if (customerExists) {
            // Mijoz ma'lumotlarini migration helper orqali olish
            const customerResult = await customerMigrationApi.getCustomerData(session.user.id)
            const customerData = customerResult.data
            
            const userData = {
              id: session.user.id,
              email: session.user.email || '',
              name: customerData?.name || session.user.user_metadata?.name || '',
              phone: customerData?.phone || session.user.user_metadata?.phone || '',
              created_at: session.user.created_at
            };
            console.log('✅ AuthContext: User data loaded successfully')
            setUser(userData);
            // Save user ID for notifications
            setCurrentUserId(session.user.id);
          } else {
            console.log('⚠️ AuthContext: Customer not found, signing out')
            setUser(null)
          }
        } else {
          console.log('ℹ️ AuthContext: No active session found')
          setUser(null)
        }
      } catch (error) {
        console.error('❌ AuthContext: Session olishda xatolik:', error)
        setUser(null)
      } finally {
        console.log('✅ AuthContext: Setting loading to false')
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
              
              // Setup push notifications for the user
              try {
                console.log('🔔 Setting up push notifications for user:', session.user.id)
                await ensurePushSubscription(session.user.id)
                console.log('✅ Push notifications setup completed')
              } catch (error) {
                console.error('❌ Push notification setup failed:', error)
                // Don't fail the login if push notification setup fails
              }
              
              // Trigger notification check after successful login
              setTimeout(() => {
                console.log('🔔 User logged in, checking for notification permission...')
                // This will trigger NotificationGate to show if needed
              }, 1000);
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
      
      // Telefon raqamidan email yaratish (internal use)
      const cleanPhone = phone?.replace(/\D/g, '') || ''
      const internalEmail = `${cleanPhone}@eurodoor.uz`
      
      const { data, error } = await supabase.auth.signUp({
        email: internalEmail, // Internal email ishlatish
        password,
        options: {
          data: {
            name,
            phone,
            original_email: email // Asl email saqlash
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
            email: internalEmail, // Internal email ishlatish
            password
          })
          
          console.log('📤 Sign in response:', { existingUser, getUserError })
          
          if (existingUser?.user) {
            console.log('👤 Found existing user:', existingUser.user.id)
            
            // Mijoz ma'lumotlarini tayyorlash va migration helper orqali qo'shish
            const customerData = {
              id: existingUser.user.id,
              name: name || existingUser.user.user_metadata?.name || '',
              phone: phone || existingUser.user.user_metadata?.phone || '',
              email: email || existingUser.user.email || ''
            }
            console.log('📋 Customer data to sync:', customerData)
            
            // Migration helper orqali customer qo'shish
            console.log('🔍 Creating/updating customer using migration helper...')
            const result = await customerMigrationApi.createCustomer(customerData)
            
            if (result.success) {
              console.log('✅ Customer synced successfully:', result.data)
              setLoading(false)
              return { success: true }
            } else {
              console.error('❌ Customer sync failed:', result.error)
              // Don't fail the entire signup process if customer sync fails
              console.log('⚠️ Continuing signup process despite customer sync failure')
              setLoading(false)
              return { success: true } // Still allow signup to succeed
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
        
        // Customer qo'shish (migration helper orqali)
        try {
          console.log('📝 Adding customer using migration helper...')
          const customerData = {
            id: data.user.id,
            name: name || '',
            phone: phone || '',
            email: email || data.user.email || ''
          }
          console.log('📋 Customer data to insert:', customerData)
          
          const result = await customerMigrationApi.createCustomer(customerData)
          
          if (result.success) {
            console.log('✅ Customer created successfully:', result.data)
          } else {
            console.error('❌ Customer creation failed:', result.error)
            // Don't fail the entire signup process if customer creation fails
            console.log('⚠️ Continuing signup process despite customer creation failure')
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
          
          // Mijoz ma'lumotlarini olish va user state'ni yangilash
          const { data: { user } } = await supabase.auth.getUser()
          if (user) {
            const customerResult = await customerMigrationApi.getCustomerData(user.id)
            const customerData = customerResult.data
            
            if (!customerData) {
              console.warn('⚠️ Customer data not found in any system')
            }
            
            const userData = {
              id: user.id,
              email: user.email || '',
              name: customerData?.name || user.user_metadata?.name || '',
              phone: customerData?.phone || user.user_metadata?.phone || '',
              created_at: user.created_at
            };
            
            console.log('📊 User data loaded (retry):', {
              id: userData.id,
              name: userData.name,
              phone: userData.phone,
              email: userData.email,
              source: customerData ? 'customer_database' : 'user_metadata'
            });
            setUser(userData);
            setCurrentUserId(user.id);
          }
          
          // Trigger notification check after successful signup
          setTimeout(() => {
            console.log('🔔 User signed up, checking for notification permission...')
            // This will trigger NotificationGate to show if needed
          }, 1000);
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
      
      // Agar email @eurodoor.uz bilan tugasa, to'g'ridan-to'g'ri ishlatish
      // Aks holda telefon raqamidan email yaratish
      let loginEmail = email
      if (!email.includes('@eurodoor.uz')) {
        const cleanPhone = email.replace(/\D/g, '')
        loginEmail = `${cleanPhone}@eurodoor.uz`
      }
      
      const { error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
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
              const { error: retryError } = await supabase.auth.signInWithPassword({
                email: loginEmail,
                password
              })
              
              if (!retryError) {
                // Mijoz ma'lumotlarini olish
                const { data: { user } } = await supabase.auth.getUser()
                if (user) {
                  const customerResult = await customerMigrationApi.getCustomerData(user.id)
                  const customerData = customerResult.data
                  
                  if (!customerData) {
                    console.warn('⚠️ Customer data not found in any system')
                  }
                  
            const userData = {
              id: user.id,
              email: user.email || '',
              name: customerData?.name || user.user_metadata?.name || '',
              phone: customerData?.phone || user.user_metadata?.phone || '',
              created_at: user.created_at
            };
            
            console.log('📊 User data loaded (signup):', {
              id: userData.id,
              name: userData.name,
              phone: userData.phone,
              email: userData.email,
              source: customerData ? 'customer_database' : 'user_metadata'
            });
            setUser(userData);
            setCurrentUserId(user.id);
                }
                return { success: true }
              }
            }
          } catch (updateError) {
            console.error('Update error:', updateError)
          }
        }
        return { success: false, error: error.message }
      }

      // Muvaffaqiyatli kirishdan keyin mijoz ma'lumotlarini olish
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const customerResult = await customerMigrationApi.getCustomerData(user.id)
        const customerData = customerResult.data
        
        if (!customerData) {
          console.warn('⚠️ Customer data not found in any system')
        }
        
        const userData = {
          id: user.id,
          email: user.email || '',
          name: customerData?.name || user.user_metadata?.name || '',
          phone: customerData?.phone || user.user_metadata?.phone || '',
          created_at: user.created_at
        };
        
        console.log('📊 User data loaded:', {
          id: userData.id,
          name: userData.name,
          phone: userData.phone,
          email: userData.email,
          source: customerData ? 'customer_database' : 'user_metadata'
        });
        setUser(userData);
        setCurrentUserId(user.id);
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

  const updateProfile = async (updates: { name?: string; phone?: string; email?: string; avatar_url?: string }) => {
    try {
      if (!user) {
        return { success: false, error: 'Foydalanuvchi topilmadi' }
      }

      console.log('🔄 Starting profile update for user:', user.id)
      console.log('📝 Updates to apply:', updates)

      // 1. Avval customer_registrations jadvaliga to'g'ridan-to'g'ri yozish
      try {
        console.log('🎯 Direct update to customer_registrations table...')
        
        const updateData = {
          ...updates,
          updated_at: new Date().toISOString()
        }
        
        const { data, error } = await supabase
          .from('customer_registrations')
          .update(updateData)
          .eq('id', user.id)
          .select()
          .single()

        if (error) {
          console.error('❌ Direct customer_registrations update failed:', error)
          throw error
        }

        console.log('✅ Direct customer_registrations update successful:', data)
        console.log('📡 Real-time update will trigger in admin panel!')
        
      } catch (directUpdateError: any) {
        console.warn('⚠️ Direct update failed, trying migration helper:', directUpdateError.message)
        
        // 2. Migration helper orqali urinish
        try {
          const updateResult = await customerMigrationApi.updateCustomer(user.id, updates)
          
          if (updateResult.success) {
            console.log('✅ Migration helper update successful:', updateResult.data)
            console.log('📡 Real-time update will trigger in admin panel!')
          } else {
            console.error('❌ Migration helper update failed:', updateResult.error)
            throw new Error(updateResult.error)
          }
        } catch (migrationError: any) {
          console.error('❌ Migration helper also failed:', migrationError.message)
          throw migrationError
        }
      }

      // 3. Supabase Auth ni ham yangilash (user_metadata uchun)
      try {
        console.log('🔐 Updating Supabase Auth metadata...')
        const { error: authError } = await supabase.auth.updateUser({
          data: updates
        })

        if (authError) {
          console.warn('⚠️ Auth metadata update failed:', authError.message)
        } else {
          console.log('✅ Auth metadata updated successfully')
        }
      } catch (authError: any) {
        console.warn('⚠️ Auth update error:', authError.message)
      }

      // 4. Local state ni yangilash
      setUser(prev => prev ? { ...prev, ...updates } : null)
      console.log('✅ Profile update completed successfully')
      console.log('📊 Updated user state:', { ...user, ...updates })
      console.log('🎉 Admin panel should show updated data within seconds!')
      
      return { success: true }
    } catch (error: any) {
      console.error('❌ Profile update error:', error)
      return { success: false, error: error.message || 'Profil yangilashda xatolik' }
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
