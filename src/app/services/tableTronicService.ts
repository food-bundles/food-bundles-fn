/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios';

const TABLE_TRONIC_API_KEY = process.env.NEXT_PUBLIC_TABLE_TRONIC_API_KEY;
const TABLE_TRONIC_BASE_URL = process.env.NEXT_PUBLIC_TABLE_TRONIC_BASE_URL || 'https://api.tabletronic.com';

const tableTronicClient = axios.create({
  baseURL: TABLE_TRONIC_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    "x-api-key": TABLE_TRONIC_API_KEY,
  },
});

export interface TableTronicProductData {
  name: string;
  description: string;
  photo: string;
  itemCode: string;
  categoryId: number;
  taxId: number;
  units: Array<{
    id: string;
    unitId: string;
    cost: number;
    price: number;
  }>;
  baseUnitId: string;
  ebmProductType: string;
  ebmCountryOfOrigin: string;
  ebmPackagingUnit: string;
  ebmQuantityUnit: string;
  ebmItemClassCode: {
    label: string;
    value: string;
  };
  ebmOpeningStock: string;
}

export interface TableTronicCategory {
  id: number;
  name: string;
  description?: string;
}

export interface TableTronicInvoiceData {
  invoiceNumber: number;
  date: string;
  customerId: null;
  customerName: string;
  customerPhone: string;
  customerTin: string;
  purchaseCode: string;
  items: Array<{
    name: string;
    id: number;
    quantity: number;
    unitPrice: number;
  }>;
  discount: number;
  status: string;
  terms: string;
  payments: Array<{
    method: number;
    amount: number;
  }>;
  paidAmount: number;
}

export interface CreateTableTronicCategoryData {
  name: string;
  description?: string;
}

export const tableTronicService = {
  // Get all taxes
  getTaxes: async (params?: { page?: number; limit?: number }) => {
    const response = await tableTronicClient.get('/api/taxes', { params });
    return response.data;
  },

  // Get EBM product types
  getEbmProductTypes: async () => {
    const response = await tableTronicClient.get('/api/products/ebm-product-types');
    return response.data;
  },

  // Get EBM countries
  getEbmCountries: async () => {
    const response = await tableTronicClient.get('/api/products/ebm-countries');
    return response.data;
  },

  // Get EBM packaging units
  getEbmPackagingUnits: async () => {
    const response = await tableTronicClient.get('/api/products/ebm-packaging-units');
    return response.data;
  },

  // Get EBM quantity units
  getEbmQuantityUnits: async () => {
    const response = await tableTronicClient.get('/api/products/ebm-quantity-units');
    return response.data;
  },

  // Get EBM item class codes
  getEbmItemClassCodes: async (params?: { page?: number; limit?: number }) => {
    const response = await tableTronicClient.get('/api/products/ebm-item-class-codes', { params });
    return response.data;
  },

  // Create product in Table Tronic
  createProduct: async (data: TableTronicProductData) => {
    const response = await tableTronicClient.post('/api/products', data);
    return response.data;
  },

  // Create invoice
  createInvoice: async (data: TableTronicInvoiceData) => {
    try {
      const response = await tableTronicClient.post('/api/sales', data);
      return response.data;
    } catch (error: any) {
      console.error('Table Tronic Invoice API Error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        statusText: error.response?.statusText
      });
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create invoice in Table Tronic';
      throw new Error(errorMessage);
    }
  },

  // Create category
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