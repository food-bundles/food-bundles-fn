/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { postService, Post, CreatePostData, UpdatePostData } from "@/app/services/postService";
import { toast } from "sonner";

interface PostContextType {
  posts: Post[];
  loading: boolean;
  error: string | null;
  getMyPosts: (params?: { page?: number; limit?: number; isActive?: boolean }) => Promise<void>;
  getFeaturedPosts: (params?: { page?: number; limit?: number }) => Promise<void>;
  createPost: (data: CreatePostData) => Promise<boolean>;
  updatePost: (postId: string, data: UpdatePostData) => Promise<boolean>;
  deletePost: (postId: string) => Promise<boolean>;
  clearError: () => void;
}

const PostContext = createContext<PostContextType | undefined>(undefined);

export function PostProvider({ children }: { children: ReactNode }) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getMyPosts = async (params?: { page?: number; limit?: number; isActive?: boolean }) => {
    try {
      setLoading(true);
      setError(null);
      const response = await postService.getMyPosts(params);
      setPosts(response.data || []);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Failed to fetch posts";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getFeaturedPosts = async (params?: { page?: number; limit?: number }) => {
    try {
      setLoading(true);
      setError(null);
      const response = await postService.getFeaturedPosts(params);
      setPosts(response.data || []);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Failed to fetch featured posts";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const createPost = async (data: CreatePostData): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await postService.createPost(data);
      toast.success("Post created successfully");
      await getMyPosts();
      return true;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Failed to create post";
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updatePost = async (postId: string, data: UpdatePostData): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await postService.updatePost(postId, data);
      toast.success("Post updated successfully");
      await getMyPosts();
      return true;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Failed to update post";
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deletePost = async (postId: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await postService.deletePost(postId);
      toast.success("Post deleted successfully");
      setPosts((prev) => prev.filter((post) => post.id !== postId));
      return true;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Failed to delete post";
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => setError(null);

  return (
    <PostContext.Provider
      value={{
        posts,
        loading,
        error,
        getMyPosts,
        getFeaturedPosts,
        createPost,
        updatePost,
        deletePost,
        clearError,
      }}
    >
      {children}
    </PostContext.Provider>
  );
}

export function usePosts() {
  const context = useContext(PostContext);
  if (context === undefined) {
    throw new Error("usePosts must be used within a PostProvider");
  }
  return context;
}
