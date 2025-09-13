// Customers API for Eurodoor Customer Panel
import { supabase, Customer } from './supabase';

export const customersApi = {
  // Yangi mijoz yaratish
  async createCustomer(customerData: {
    name: string;
    phone: string;
    email?: string;
  }): Promise<Customer | null> {
    try {
      const { data, error } = await supabase
        .from('customers')
        .insert([customerData])
        .select()
        .single();
      
      if (error) {
        console.error('❌ Supabase error creating customer:', error);
        throw new Error(`Supabase error: ${error.message}`);
      }
      
      return data;
    } catch (error) {
      console.error('❌ Error creating customer:', error);
      throw error;
    }
  },

  // Telefon raqam bo'yicha mijoz olish
  async getCustomerByPhone(phone: string): Promise<Customer | null> {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('phone', phone)
        .single();
      
      if (error) {
        console.error('❌ Supabase error fetching customer:', error);
        return null;
      }
      
      return data;
    } catch (error) {
      console.error('❌ Error fetching customer:', error);
      return null;
    }
  },

  // Mijoz ma'lumotlarini yangilash
  async updateCustomer(customerId: string, updates: Partial<Customer>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('customers')
        .update(updates)
        .eq('id', customerId);
      
      if (error) {
        console.error('❌ Supabase error updating customer:', error);
        throw new Error(`Supabase error: ${error.message}`);
      }
      
      return true;
    } catch (error) {
      console.error('❌ Error updating customer:', error);
      throw error;
    }
  },

  // Mijoz yaratish yoki olish (upsert)
  async upsertCustomer(customerData: {
    name: string;
    phone: string;
    email?: string;
  }): Promise<Customer> {
    try {
      // Avval mijoz mavjudligini tekshirish
      const customer = await this.getCustomerByPhone(customerData.phone);
      
      if (customer) {
        // Mavjud mijoz ma'lumotlarini yangilash
        await this.updateCustomer(customer.id, customerData);
        return { ...customer, ...customerData };
      } else {
        // Yangi mijoz yaratish
        const newCustomer = await this.createCustomer(customerData);
        if (!newCustomer) {
          throw new Error('Failed to create customer');
        }
        return newCustomer;
      }
    } catch (error) {
      console.error('❌ Error upserting customer:', error);
      throw error;
    }
  },

  // Barcha mijozlarni olish (admin uchun)
  async getAllCustomers(): Promise<Customer[]> {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('❌ Supabase error fetching all customers:', error);
        throw new Error(`Supabase error: ${error.message}`);
      }
      
      return data || [];
    } catch (error) {
      console.error('❌ Error fetching all customers:', error);
      throw error;
    }
  },

  // Real-time subscription uchun
  subscribeToCustomers(callback: (payload: any) => void) {
    return supabase
      .channel('customers')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'customers' },
        callback
      )
      .subscribe();
  }
};
