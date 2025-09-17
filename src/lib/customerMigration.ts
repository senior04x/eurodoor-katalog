// Customer Migration Helper
// This file helps migrate from old customers table to new customer_registrations table

import { supabase } from './supabase';

export const customerMigrationApi = {
  // Check if new customer_registrations table exists
  async checkNewSystemAvailable(): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('customer_registrations')
        .select('id')
        .limit(1);
      
      return !error;
    } catch (error) {
      console.log('New customer system not available:', error);
      return false;
    }
  },

  // Check if old customers table exists
  async checkOldSystemAvailable(): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('id')
        .limit(1);
      
      // Check for specific error codes that indicate table doesn't exist or has wrong structure
      if (error && (error.code === 'PGRST204' || error.code === 'PGRST116' || error.message?.includes('406'))) {
        console.log('Old customer system not available (table structure mismatch):', error);
        return false;
      }
      
      return !error;
    } catch (error) {
      console.log('Old customer system not available:', error);
      return false;
    }
  },

  // Migrate customer from old system to new system
  async migrateCustomer(customerData: {
    id: string;
    name: string;
    phone: string;
    email?: string;
  }): Promise<{ success: boolean; error?: string }> {
    try {
      const newCustomerData = {
        id: customerData.id,
        name: customerData.name,
        phone: customerData.phone,
        password: 'migrated_' + Date.now(), // Temporary password for migrated users
        is_active: true,
        is_verified: true
      };

      const { data, error } = await supabase
        .from('customer_registrations')
        .insert([newCustomerData])
        .select();

      if (error) {
        console.error('Migration error:', error);
        return { success: false, error: error.message };
      }

      console.log('Customer migrated successfully:', data);
      return { success: true };
    } catch (error: any) {
      console.error('Migration failed:', error);
      return { success: false, error: error.message };
    }
  },

  // Get customer data from either system
  async getCustomerData(customerId: string): Promise<any> {
    try {
      console.log('🔍 Getting customer data for ID:', customerId);
      
      // Try new system first with timeout
      try {
        console.log('🔍 Attempting to get data from new system (customer_registrations)...');
        
        const queryPromise = supabase
          .from('customer_registrations')
          .select('*')
          .eq('id', customerId)
          .single();

        // Add 5 second timeout
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Query timeout after 5 seconds')), 5000)
        );

        const { data: newData, error: newError } = await Promise.race([queryPromise, timeoutPromise]) as any;

        if (!newError && newData) {
          console.log('✅ Customer data found in new system:', newData);
          return { data: newData, source: 'new' };
        }

        console.warn('⚠️ New system query failed:', newError?.message);
        
      } catch (newSystemError: any) {
        console.warn('⚠️ New system timeout or error:', newSystemError.message);
      }

      // Try old system as fallback
      try {
        console.log('🔍 Attempting to get data from old system (customers)...');
        
        const queryPromise = supabase
          .from('customers')
          .select('*')
          .eq('id', customerId)
          .single();

        // Add 5 second timeout
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Query timeout after 5 seconds')), 5000)
        );

        const { data: oldData, error: oldError } = await Promise.race([queryPromise, timeoutPromise]) as any;

        if (!oldError && oldData) {
          console.log('✅ Customer data found in old system:', oldData);
          return { data: oldData, source: 'old' };
        }

        console.warn('⚠️ Old system query failed:', oldError?.message);
        
      } catch (oldSystemError: any) {
        console.warn('⚠️ Old system timeout or error:', oldSystemError.message);
      }

      console.log('❌ Customer data not found in any system');
      return { data: null, source: null };
    } catch (error) {
      console.error('❌ Error getting customer data:', error);
      return { data: null, source: null };
    }
  },

  // Create customer in appropriate system
  async createCustomer(customerData: {
    id: string;
    name: string;
    phone: string;
    email?: string;
  }): Promise<{ success: boolean; error?: string; data?: any }> {
    try {
      // Check which system is available
      const newSystemAvailable = await this.checkNewSystemAvailable();
      
      if (newSystemAvailable) {
        // Use new system
        const newCustomerData = {
          id: customerData.id,
          name: customerData.name,
          phone: customerData.phone,
          password: 'temp_password_' + Date.now(),
          is_active: true,
          is_verified: true
        };

        const { data, error } = await supabase
          .from('customer_registrations')
          .insert([newCustomerData])
          .select();

        if (error) {
          console.error('New system insert failed:', error);
          return { success: false, error: error.message };
        }

        return { success: true, data };
      } else {
        // Check if old system is available before trying to use it
        const oldSystemAvailable = await this.checkOldSystemAvailable();
        
        if (oldSystemAvailable) {
          // Fallback to old system - email ustuni endi mavjud
          const oldCustomerData = {
            id: customerData.id,
            name: customerData.name,
            phone: customerData.phone,
            email: customerData.email || null // Email ixtiyoriy
          };

          console.log('🔧 Old system customer data (with email):', oldCustomerData);

          const { data, error } = await supabase
            .from('customers')
            .insert([oldCustomerData])
            .select();

          if (error) {
            console.error('Old system insert failed:', error);
            return { success: false, error: error.message };
          }

          return { success: true, data };
        } else {
          // Neither system is available
          return { success: false, error: 'No customer system available' };
        }
      }
    } catch (error: any) {
      console.error('Error creating customer:', error);
      return { success: false, error: error.message };
    }
  },

  // Update customer data in appropriate system
  async updateCustomer(customerId: string, updates: {
    name?: string;
    phone?: string;
    email?: string;
    avatar_url?: string;
    password?: string;
  }): Promise<{ success: boolean; error?: string; data?: any }> {
    try {
      console.log('🔄 Starting customer update for ID:', customerId, 'with updates:', updates);
      
      // Add updated_at timestamp to updates
      const updatesWithTimestamp = {
        ...updates,
        updated_at: new Date().toISOString()
      };

      // Try new system first with timeout
      try {
        console.log('🔍 Attempting update in new system (customer_registrations)...');
        
        const updatePromise = supabase
          .from('customer_registrations')
          .update(updatesWithTimestamp)
          .eq('id', customerId)
          .select();

        // Add 10 second timeout
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Update timeout after 10 seconds')), 10000)
        );

        const { data, error } = await Promise.race([updatePromise, timeoutPromise]) as any;

        if (error) {
          console.error('❌ New system update failed:', error);
          throw error;
        }

        console.log('✅ Customer updated in new system:', data);
        return { success: true, data };
        
      } catch (newSystemError: any) {
        console.warn('⚠️ New system update failed, trying old system:', newSystemError.message);
        
        // Try old system as fallback
        try {
          console.log('🔍 Attempting update in old system (customers)...');
          
          // Email ustuni endi ikkala jadvalda ham mavjud
          console.log('🔧 Old system updates (with email):', updatesWithTimestamp);
          
          const updatePromise = supabase
            .from('customers')
            .update(updatesWithTimestamp)
            .eq('id', customerId)
            .select();

          // Add 10 second timeout
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Update timeout after 10 seconds')), 10000)
          );

          const { data, error } = await Promise.race([updatePromise, timeoutPromise]) as any;

          if (error) {
            console.error('❌ Old system update failed:', error);
            throw error;
          }

          console.log('✅ Customer updated in old system:', data);
          return { success: true, data };
          
        } catch (oldSystemError: any) {
          console.error('❌ Both systems failed:', oldSystemError.message);
          return { success: false, error: `Update failed: ${oldSystemError.message}` };
        }
      }
    } catch (error: any) {
      console.error('❌ Error updating customer:', error);
      return { success: false, error: error.message };
    }
  }
};
