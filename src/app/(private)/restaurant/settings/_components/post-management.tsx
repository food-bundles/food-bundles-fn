/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Image as ImageIcon, Video, Trash2, Edit, Eye } from "lucide-react";
import { usePosts } from "@/app/contexts/post-context";
import { Spinner } from "@/components/ui/shadcn-io/spinner";
import Image from "next/image";
import { CreatePostModal } from "./create-post-modal";
import { EditPostModal } from "./edit-post-modal";
import { Badge } from "@/components/ui/badge";

export function PostManagement() {
  const { posts, loading, getMyPosts, deletePost } = usePosts();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<any>(null);

  useEffect(() => {
    getMyPosts();
  }, []);

  const handleDelete = async (postId: string) => {
    if (confirm("Are you sure you want to delete this post?")) {
      await deletePost(postId);
    }
  };

  const handleEdit = (post: any) => {
    setSelectedPost(post);
    setIsEditModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Post Management</h2>
          <p className="text-gray-600 text-sm">Create and manage your restaurant posts</p>
        </div>
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-green-600 hover:bg-green-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Post
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Spinner variant="ring" />
        </div>
      ) : posts.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-gray-500">No posts yet. Create your first post to advertise your restaurant!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <Card key={post.id} className="overflow-hidden">
              <CardContent className="p-0">
                {/* Media Preview */}
                {post.images.length > 0 && (
                  <div className="relative h-48 bg-gray-100">
                    <Image
                      src={post.images[0]}
                      alt="Post"
                      fill
                      className="object-cover"
                    />
                    {post.images.length > 1 && (
                      <Badge className="absolute top-2 right-2 bg-black/70">
                        +{post.images.length - 1}
                      </Badge>
                    )}
                  </div>
                )}
                {post.videos.length > 0 && post.images.length === 0 && (
                  <div className="relative h-48 bg-gray-100 flex items-center justify-center">
                    <Video className="w-12 h-12 text-gray-400" />
                    <Badge className="absolute top-2 right-2 bg-black/70">
                      {post.videos.length} video(s)
                    </Badge>
                  </div>
                )}

                {/* Content */}
                <div className="p-4 space-y-3">
                  <p className="text-gray-700 line-clamp-3">{post.content}</p>
                  
                  <div className="flex items-center justify-between">
                    <Badge variant={post.isActive ? "default" : "secondary"}>
                      {post.isActive ? "Active" : "Inactive"}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(post)}
                      className="flex-1"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(post.id)}
                      className="flex-1 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <CreatePostModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      <EditPostModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedPost(null);
        }}
        post={selectedPost}
      />
    </div>
  );
}
