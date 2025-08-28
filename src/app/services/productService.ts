/* eslint-disable @typescript-eslint/no-unused-vars */
import { ProductFormData } from "../(dashboard)/admin/inventory/_components/add-product-modal";
import createAxiosClient from "../hooks/axiosClient";

export interface CreateProductData {
  productName: string;
  unitPrice: number;
  category: string;
  bonus: number;
  sku: string;
  quantity: number;
  unit: string;
  expiryDate?: string;
}

export const productService = {
  createProduct: async (productData: ProductFormData) => {
    const axiosClient = createAxiosClient();

    // Create FormData for file upload
    const formData = new FormData();

    // Add product data
    formData.append("productName", productData.productName);
    formData.append("unitPrice", productData.unitPrice.toString());
    formData.append("category", productData.category);
    formData.append("bonus", productData.bonus.toString());
    formData.append("sku", productData.sku);
    formData.append("quantity", productData.quantity.toString());
    formData.append("unit", productData.unit);

    if (productData.expiryDate) {
      formData.append("expiryDate", productData.expiryDate.toISOString());
    }

    // Add images
    productData.images.forEach((image, index) => {
      formData.append("images", image);
    });

    const response = await axiosClient.post("/products", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  },

  getAllProducts: async () => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.get("/products");
    return response.data;
  },

  getProductById: async (productId: string) => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.get(`/products/${productId}`);
    return response.data;
  },

  updateProduct: async (
    productId: string,
    productData: Partial<ProductFormData>
  ) => {
    const axiosClient = createAxiosClient();

    const formData = new FormData();

    // Add updated product data
    if (productData.productName)
      formData.append("productName", productData.productName);
    if (productData.unitPrice)
      formData.append("unitPrice", productData.unitPrice.toString());
    if (productData.category) formData.append("category", productData.category);
    if (productData.bonus !== undefined)
      formData.append("bonus", productData.bonus.toString());
    if (productData.sku) formData.append("sku", productData.sku);
    if (productData.quantity)
      formData.append("quantity", productData.quantity.toString());
    if (productData.unit) formData.append("unit", productData.unit);
    if (productData.expiryDate)
      formData.append("expiryDate", productData.expiryDate.toISOString());

    // Add new images if any
    if (productData.images) {
      productData.images.forEach((image) => {
        formData.append("images", image);
      });
    }

    const response = await axiosClient.patch(
      `/products/${productId}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data;
  },

  deleteProduct: async (productId: string) => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.delete(`/products/${productId}`);
    return response.data;
  },
};
