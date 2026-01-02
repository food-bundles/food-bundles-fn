/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios';

const TABLE_TRONIC_API_KEY = process.env.NEXT_PUBLIC_TABLE_TRONIC_API_KEY;
const TABLE_TRONIC_BASE_URL = process.env.NEXT_PUBLIC_TABLE_TRONIC_BASE_URL || 'https://api.tabletronic.com';

const tableTronicClient = axios.create({
  baseURL: TABLE_TRONIC_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': TABLE_TRONIC_API_KEY,
  },
});

export interface TableTronicCategory {
  id: number;
  name: string;
  description?: string;
}

export interface CreateTableTronicCategoryData {
  name: string;
  description?: string;
}

export const tableTronicService = {
  createCategory: async (data: CreateTableTronicCategoryData): Promise<TableTronicCategory> => {
    try {
      const response = await tableTronicClient.post('/api/categories', data);
      return response.data.data; 
    } catch (error: any) {
      console.error('Table Tronic API Error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to create category in Table Tronic');
    }
  },
};