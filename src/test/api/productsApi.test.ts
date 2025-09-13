import { describe, it, expect, vi, beforeEach } from 'vitest';
import { productsApi } from '../../lib/productsApi';

// Mock Supabase
const mockSupabase = {
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        order: vi.fn(() => ({
          single: vi.fn(),
        })),
      })),
    })),
  })),
};

vi.mock('../../lib/supabase', () => ({
  supabase: mockSupabase,
}));

describe('productsApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAllProducts', () => {
    it('should fetch all active products', async () => {
      const mockProducts = [
        {
          id: '1',
          name: 'Test Product',
          price: 100,
          is_active: true,
        },
      ];

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: mockProducts,
              error: null,
            }),
          }),
        }),
      });

      const result = await productsApi.getAllProducts();
      expect(result).toEqual(mockProducts);
    });

    it('should handle errors gracefully', async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: null,
              error: { message: 'Database error' },
            }),
          }),
        }),
      });

      await expect(productsApi.getAllProducts()).rejects.toThrow('Supabase error: Database error');
    });
  });

  describe('getProductById', () => {
    it('should fetch product by ID', async () => {
      const mockProduct = {
        id: '1',
        name: 'Test Product',
        price: 100,
        is_active: true,
      };

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: mockProduct,
                error: null,
              }),
            }),
          }),
        }),
      });

      const result = await productsApi.getProductById('1');
      expect(result).toEqual(mockProduct);
    });

    it('should return null when product not found', async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: null,
                error: { message: 'Not found' },
              }),
            }),
          }),
        }),
      });

      const result = await productsApi.getProductById('999');
      expect(result).toBeNull();
    });
  });
});
