import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_KEY } from '../config';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export const CACHE_KEYS = {
  PRODUCTS: 'offline_products',
  SALES_QUEUE: 'offline_sales_queue',
};

// --- Obfuscation Helpers ---
const encodeData = (data: any): string => {
  try {
    const json = JSON.stringify(data);
    // Simple Base64 encoding with URI component handling for special chars
    return btoa(encodeURIComponent(json).replace(/%([0-9A-F]{2})/g,
      (match, p1) => String.fromCharCode(parseInt(p1, 16))
    ));
  } catch (e) {
    console.error("Failed to encode offline data", e);
    return "";
  }
};

const decodeData = (str: string): any => {
  try {
    // Try decoding Base64
    return JSON.parse(decodeURIComponent(atob(str).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join('')));
  } catch (e) {
    // Fallback: Try parsing as plain JSON (for backward compatibility or if not encoded)
    try {
      return JSON.parse(str);
    } catch (e2) {
      return [];
    }
  }
};

// --- Product Caching ---

export const cacheProducts = (products: any[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(CACHE_KEYS.PRODUCTS, encodeData(products));
  }
};

export const getCachedProducts = () => {
  if (typeof window !== 'undefined') {
    const cached = localStorage.getItem(CACHE_KEYS.PRODUCTS);
    return cached ? decodeData(cached) : [];
  }
  return [];
};

// --- Offline Sales Queue ---

export const saveOfflineSale = (saleData: any) => {
  if (typeof window !== 'undefined') {
    const queue = getOfflineSales();
    queue.push({ ...saleData, offlineId: Date.now() }); // Add a temp ID
    localStorage.setItem(CACHE_KEYS.SALES_QUEUE, encodeData(queue));
  }
};

export const getOfflineSales = () => {
  if (typeof window !== 'undefined') {
    const cached = localStorage.getItem(CACHE_KEYS.SALES_QUEUE);
    return cached ? decodeData(cached) : [];
  }
  return [];
};

export const clearOfflineSales = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(CACHE_KEYS.SALES_QUEUE);
  }
};

// --- Sync Logic ---

export const syncOfflineSales = async () => {
  const queue = getOfflineSales();
  if (queue.length === 0) return { synced: 0, errors: 0 };

  let syncedCount = 0;
  let errorCount = 0;
  const remainingQueue = [];

  for (const sale of queue) {
    // Remove the temporary offlineId before sending to Supabase
    const { offlineId, ...saleData } = sale;

    try {
      const { error } = await supabase.from('sales').insert([saleData]);
      
      if (error) {
        console.error('Sync error for sale:', sale, error);
        errorCount++;
        remainingQueue.push(sale); // Keep in queue if failed (e.g. validation error, not network)
      } else {
        // Also update stock for this sale if it wasn't updated locally? 
        // Ideally stock should be decremented. 
        // For now, we assume the sale insert is the primary record.
        // We also need to update the product stock in Supabase.
        
        // Note: In a real app, we might want to use a stored procedure or transaction.
        // Here we'll try to update stock as well.
        const { error: stockError } = await supabase.rpc('decrement_stock', { 
            p_id: saleData.product_id, 
            qty: saleData.quantity 
        });
        
        // If we don't have an RPC, we do a manual update (less safe but works for simple apps)
        if (stockError) {
             // Fallback manual update
             const { data: product } = await supabase.from('products').select('stock_quantity').eq('id', saleData.product_id).single();
             if (product) {
                 await supabase.from('products').update({ stock_quantity: product.stock_quantity - saleData.quantity }).eq('id', saleData.product_id);
             }
        }

        syncedCount++;
      }
    } catch (err) {
      console.error('Sync exception:', err);
      errorCount++;
      remainingQueue.push(sale);
    }
  }

  // Update queue with whatever couldn't be synced
  if (typeof window !== 'undefined') {
    if (remainingQueue.length > 0) {
        localStorage.setItem(CACHE_KEYS.SALES_QUEUE, encodeData(remainingQueue));
    } else {
        localStorage.removeItem(CACHE_KEYS.SALES_QUEUE);
    }
  }

  return { synced: syncedCount, errors: errorCount };
};
