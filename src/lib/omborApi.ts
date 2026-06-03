export const OMBOR_API_BASE = 'https://vkilfyvgctrjixmstyxk.supabase.co/functions/v1/server';

export interface OmborProduct {
  id: string;
  model: string;
  razmer: string;
  image: string | null;
  created_at: string;
  deleted_at: string | null;
}

export interface OmborEntry {
  id: string;
  model: string;
  razmer: string;
  leftSide: number;
  rightSide: number;
  type: 'kirim' | 'chiqim' | 'tahrir_kirim' | 'tahrir_chiqim';
  date: string;
  deleted_at: string | null;
}

export const fetchOmborProducts = async (): Promise<OmborProduct[]> => {
  try {
    const res = await fetch(`${OMBOR_API_BASE}/products?limit=10000`, {
      method: 'GET',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': 'Bearer mock-jwt-token-1bea574d-eb36-4808-87ed-6214d1f2eebf'
      },
    });
    if (!res.ok) throw new Error('Failed to fetch Ombor products');
    const data = await res.json();
    return data.products || [];
  } catch (error) {
    console.error('Error fetching ombor products:', error);
    return [];
  }
};

export const fetchOmborEntries = async (): Promise<OmborEntry[]> => {
  try {
    const res = await fetch(`${OMBOR_API_BASE}/entries?limit=10000`, {
      method: 'GET',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': 'Bearer mock-jwt-token-1bea574d-eb36-4808-87ed-6214d1f2eebf'
      },
    });
    if (!res.ok) throw new Error('Failed to fetch Ombor entries');
    const data = await res.json();
    return data.entries || [];
  } catch (error) {
    console.error('Error fetching ombor entries:', error);
    return [];
  }
};

export const calculateStock = (entries: OmborEntry[]) => {
  const stockMap: Record<string, { left: number; right: number }> = {};
  
  entries.forEach(e => {
    if (e.deleted_at) return;
    const key = `${e.model}-${e.razmer}`;
    if (!stockMap[key]) {
      stockMap[key] = { left: 0, right: 0 };
    }
    
    if (e.type === 'kirim' || e.type === 'tahrir_kirim') {
      stockMap[key].left += (e.leftSide || 0);
      stockMap[key].right += (e.rightSide || 0);
    } else if (e.type === 'chiqim' || e.type === 'tahrir_chiqim') {
      stockMap[key].left -= (e.leftSide || 0);
      stockMap[key].right -= (e.rightSide || 0);
    }
  });
  
  return stockMap;
};
