import { ApiService } from './api.service';
import { ChitListItem } from '../utils/interface-utils';

class DataServiceClass {
  // In data.service.ts
// In data.service.ts
async getChitList(userId?: string, skip: number = 0, limit: number = 100) {
  try {
    // If userId is provided, use it, otherwise get all chits
    const endpoint = userId ? `/payments/chits/user/${userId}` : '/payments/chits';
    const params: Record<string, string> = {
      skip: skip.toString(),
      limit: limit.toString()
    };
    const response = await ApiService.get(endpoint, params);
    return { data: response.data, error: null };
  } catch (error: any) {
    return { data: [], error: error.message || 'Failed to fetch chit list' }; // Return empty array instead of null
  }
}



  async createChit(chitData: Partial<ChitListItem>) {
    try {
      const response = await ApiService.post('/payments/chits', chitData);
      return { data: response.data, error: null };
    } catch (error: any) {
      return { data: null, error: error.message || 'Failed to create chit' };
    }
  }

  async updateChit(id: string, data: Partial<ChitListItem>) {
    try {
      const response = await ApiService.put(`/payments/chits/${id}`, data);
      return { data: response.data, error: null };
    } catch (error: any) {
      return { data: null, error: error.message || 'Failed to update chit' };
    }
  }

  async deleteChit(id: string) {
    try {
      await ApiService.delete(`/payments/chits/${id}`);
      return { data: id, error: null };
    } catch (error: any) {
      return { data: null, error: error.message || 'Failed to delete chit' };
    }
  }
}

export const DataService = new DataServiceClass();
export default DataService;
