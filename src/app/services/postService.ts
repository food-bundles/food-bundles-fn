/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://server.food.rw';

const getToken = (): string | null => {
  if (typeof window !== "undefined") {
    const cookies = document.cookie.split(";");
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split("=");
      if (name === "auth-token") {
        return decodeURIComponent(value);
      }
    }
  }
  return null;
};

export interface Post {
  id: string;
  content: string;
  images: string[];
  videos: string[];
  isActive: boolean;
  restaurantId: string;
  restaurant: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreatePostData {
  content: string;
  images?: File[];
  videos?: File[];
  isActive?: boolean;
}

export interface UpdatePostData {
  content?: string;
  images?: File[];
  videos?: File[];
  isActive?: boolean;
}

class PostService {
  private getAuthHeaders() {
    const token = getToken();
    return {
      Authorization: `Bearer ${token}`,
    };
  }

  async createPost(data: CreatePostData) {
    const formData = new FormData();
    formData.append('content', data.content);
    if (data.isActive !== undefined) {
      formData.append('isActive', String(data.isActive));
    }

    data.images?.forEach((file) => {
      formData.append('images', file);
    });

    data.videos?.forEach((file) => {
      formData.append('videos', file);
    });

    const response = await axios.post(`${API_URL}/posts`, formData, {
      headers: {
        ...this.getAuthHeaders(),
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async getAllPosts(params?: {
    search?: string;
    isActive?: boolean;
    restaurantId?: string;
    page?: number;
    limit?: number;
  }) {
    const response = await axios.get(`${API_URL}/posts`, {
      params,
      headers: this.getAuthHeaders(),
    });
    return response.data;
  }

  async getPostById(postId: string) {
    const response = await axios.get(`${API_URL}/posts/${postId}`, {
      headers: this.getAuthHeaders(),
    });
    return response.data;
  }

  async getMyPosts(params?: {
    page?: number;
    limit?: number;
    isActive?: boolean;
  }) {
    const response = await axios.get(`${API_URL}/posts/my-posts`, {
      params,
      headers: this.getAuthHeaders(),
    });
    return response.data;
  }

  async getFeaturedPosts(params?: { page?: number; limit?: number }) {
    const response = await axios.get(`${API_URL}/posts/featured`, {
      params,
      headers: this.getAuthHeaders(),
    });
    return response.data;
  }

  async getPostsByRestaurant(
    restaurantId: string,
    params?: {
      page?: number;
      limit?: number;
      isActive?: boolean;
    }
  ) {
    const response = await axios.get(
      `${API_URL}/posts/restaurant/${restaurantId}`,
      {
        params,
        headers: this.getAuthHeaders(),
      }
    );
    return response.data;
  }

  async updatePost(postId: string, data: UpdatePostData) {
    const formData = new FormData();
    
    if (data.content) formData.append('content', data.content);
    if (data.isActive !== undefined) {
      formData.append('isActive', String(data.isActive));
    }

    data.images?.forEach((file) => {
      formData.append('images', file);
    });

    data.videos?.forEach((file) => {
      formData.append('videos', file);
    });

    const response = await axios.patch(`${API_URL}/posts/${postId}`, formData, {
      headers: {
        ...this.getAuthHeaders(),
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async deletePost(postId: string) {
    const response = await axios.delete(`${API_URL}/posts/${postId}`, {
      headers: this.getAuthHeaders(),
    });
    return response.data;
  }
}

export const postService = new PostService();
